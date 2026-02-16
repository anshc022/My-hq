'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import OfficeCanvas from '@/components/OfficeCanvas';
import AgentPanel from '@/components/AgentPanel';
import ChatLog from '@/components/ChatLog';
import EventFeed from '@/components/EventFeed';
import MissionBoard from '@/components/MissionBoard';
import StatsBar from '@/components/StatsBar';
import { AGENTS } from '@/lib/agents';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Home() {
  const [agents, setAgents] = useState(
    Object.keys(AGENTS).map(name => ({ name, status: 'idle', current_task: null }))
  );
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [nodeConnected, setNodeConnected] = useState(false);
  const supabaseRef = useRef(null);

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) return;
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
    supabaseRef.current = sb;

    // Initial fetch
    sb.from('ops_agents').select('*').then(({ data }) => {
      if (data && data.length > 0) {
        setAgents(prev => {
          const merged = [...prev];
          data.forEach(row => {
            const idx = merged.findIndex(a => a.name === row.name);
            if (idx >= 0) merged[idx] = { ...merged[idx], ...row };
            else merged.push(row);
          });
          return merged;
        });
      }
    });

    sb.from('ops_events').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data) setEvents(data.reverse());
    });

    sb.from('ops_messages').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data) setMessages(data.reverse());
    });

    sb.from('ops_nodes').select('*').eq('name', 'ec2-main').single().then(({ data }) => {
      if (data) {
        const lastSeen = new Date(data.last_seen || 0).getTime();
        setNodeConnected(Date.now() - lastSeen < 120000);
      }
    });

    // Realtime subscriptions
    const agentChannel = sb.channel('agents-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ops_agents' }, payload => {
        const row = payload.new;
        if (!row?.name) return;
        setAgents(prev => {
          const idx = prev.findIndex(a => a.name === row.name);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...row };
            return updated;
          }
          return [...prev, row];
        });
      })
      .subscribe();

    const eventChannel = sb.channel('events-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ops_events' }, payload => {
        if (payload.new) {
          setEvents(prev => [...prev.slice(-99), payload.new]);
        }
      })
      .subscribe();

    const msgChannel = sb.channel('messages-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ops_messages' }, payload => {
        if (payload.new) {
          setMessages(prev => [...prev.slice(-99), payload.new]);
        }
      })
      .subscribe();

    const nodeChannel = sb.channel('nodes-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ops_nodes' }, payload => {
        const row = payload.new;
        if (row?.name === 'ec2-main') {
          const lastSeen = new Date(row.last_seen || 0).getTime();
          setNodeConnected(Date.now() - lastSeen < 120000);
        }
      })
      .subscribe();

    // Heartbeat poll
    const hbInterval = setInterval(() => {
      sb.from('ops_nodes').select('*').eq('name', 'ec2-main').single().then(({ data }) => {
        if (data) {
          const lastSeen = new Date(data.last_seen || 0).getTime();
          setNodeConnected(Date.now() - lastSeen < 120000);
        } else {
          setNodeConnected(false);
        }
      });
    }, 30000);

    return () => {
      sb.removeChannel(agentChannel);
      sb.removeChannel(eventChannel);
      sb.removeChannel(msgChannel);
      sb.removeChannel(nodeChannel);
      clearInterval(hbInterval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <StatsBar agents={agents} nodeConnected={nodeConnected} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-5 py-4 space-y-5">
        {/* Canvas */}
        <div className="mt-1">
          <OfficeCanvas agents={agents} nodeConnected={nodeConnected} events={events} />
        </div>

        {/* Agent Cards */}
        <section>
          <SectionTitle icon="👥" label="AGENTS" />
          <AgentPanel agents={agents} />
        </section>

        {/* Grid: Events + Mission Control */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section>
            <SectionTitle icon="📡" label="EVENT FEED" />
            <EventFeed events={events} />
          </section>

          <section>
            <SectionTitle icon="📊" label="MISSION CONTROL" />
            <MissionBoard agents={agents} nodeConnected={nodeConnected} />
          </section>
        </div>

        {/* Gateway Log */}
        <section>
          <SectionTitle icon="💬" label="GATEWAY LOG" />
          <ChatLog messages={messages} />
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 px-5 border-t border-white/[0.03] mt-6 font-mono">
        <div className="text-[10px] text-muted tracking-[0.15em] flex items-center justify-center gap-3">
          <span className="text-accent font-semibold">OPENCLAW</span>
          <span className="text-white/[0.06]">•</span>
          <span>HQ DASHBOARD</span>
          <span className="text-white/[0.06]">•</span>
          <span>FASAL SEVA</span>
          <span className="text-white/[0.06]">•</span>
          <span>{agents?.length || 6} AGENTS</span>
        </div>
        <div className="text-[9px] text-white/[0.08] mt-1.5 tracking-widest">CLAWATHON 2026</div>
      </footer>
    </div>
  );
}

function SectionTitle({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-2.5 font-mono text-[11px] font-semibold text-subtle tracking-[0.15em] uppercase">
      <span className="text-[13px] saturate-[0.7]">{icon}</span>
      {label}
      <span className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
    </div>
  );
}
