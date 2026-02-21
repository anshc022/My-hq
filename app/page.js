'use client';
import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import OfficeCanvas from '@/components/OfficeCanvas';
import AgentPanel from '@/components/AgentPanel';
import AgentsWorking from '@/components/AgentsWorking';
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

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-5 space-y-6">
        {/* Agents Working Right Now */}
        <div className="animate-fade-in">
          <AgentsWorking agents={agents} events={events} />
        </div>

        {/* Canvas */}
        <div className="mt-1 animate-fade-in">
          <OfficeCanvas agents={agents} nodeConnected={nodeConnected} events={events} />
        </div>

        {/* Agent Cards */}
        <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <SectionTitle icon="👥" label="AGENTS" count={agents?.length} />
          <AgentPanel agents={agents} />
        </section>

        {/* Grid: Events + Mission Control */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <SectionTitle icon="📡" label="EVENT FEED" count={events?.length} />
            <EventFeed events={events} />
          </section>

          <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
            <SectionTitle icon="📊" label="MISSION CONTROL" />
            <MissionBoard agents={agents} nodeConnected={nodeConnected} />
          </section>
        </div>

        {/* Gateway Log */}
        <section className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <SectionTitle icon="💬" label="GATEWAY LOG" count={messages?.length} />
          <ChatLog messages={messages} />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative mt-8 font-mono border-t-[3px] border-[var(--color-border)]">
        <div className="text-center py-6 px-5">
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[var(--color-accent)] border-2 border-white flex items-center justify-center text-[10px] neo-shadow-sm">⚡</div>
              <span className="text-[11px] font-black text-white tracking-[0.2em]">OPS HQ</span>
            </div>
            <span className="w-px h-4 bg-[var(--color-border)]" />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-[var(--color-neo-purple)] font-black tracking-wider">OPENCLAW</span>
              <span className="text-white/20 text-[7px] font-black">+</span>
              <span className="text-[9px] text-[var(--color-neo-blue)] font-black tracking-wider">K2</span>
            </div>
            <span className="w-px h-4 bg-[var(--color-border)]" />
            <span className="text-[9px] text-[var(--color-muted)] tracking-wider font-bold">{agents?.length || 6} AGENTS</span>
          </div>
          <div className="text-[8px] text-white/10 tracking-[0.3em] font-black">REAL-TIME AGENT OPERATIONS DASHBOARD</div>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ icon, label, count }) {
  return (
    <div className="flex items-center gap-2.5 mb-3 font-mono">
      <div className="flex items-center gap-2">
        <span className="text-[14px]">{icon}</span>
        <span className="text-[11px] font-black text-white tracking-[0.18em] uppercase">{label}</span>
      </div>
      {count != null && (
        <span className="neo-badge text-[9px] tabular">{count}</span>
      )}
      <span className="flex-1 h-px bg-[var(--color-border)] border-t-2 border-dashed border-[var(--color-border)]" />
    </div>
  );
}
