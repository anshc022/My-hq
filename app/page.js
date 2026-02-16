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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <StatsBar agents={agents} nodeConnected={nodeConnected} />

      <main className="hq-container" style={{ flex: 1 }}>
        {/* Canvas */}
        <div className="fade-in" style={{ marginTop: 4 }}>
          <OfficeCanvas agents={agents} nodeConnected={nodeConnected} events={events} />
        </div>

        {/* Agent Cards */}
        <div style={{ marginTop: 16 }} className="fade-in">
          <div className="section-title">
            <span>👥</span> AGENTS
          </div>
          <AgentPanel agents={agents} />
        </div>

        {/* Grid: Events + Mission Control */}
        <div className="hq-grid">
          <div className="fade-in">
            <div className="section-title">
              <span>📡</span> EVENT FEED
            </div>
            <EventFeed events={events} />
          </div>

          <div className="fade-in">
            <div className="section-title">
              <span>📊</span> MISSION CONTROL
            </div>
            <MissionBoard agents={agents} nodeConnected={nodeConnected} />
          </div>
        </div>

        {/* Gateway Log */}
        <div style={{ marginTop: 16 }} className="fade-in">
          <div className="section-title">
            <span>💬</span> GATEWAY LOG
          </div>
          <ChatLog messages={messages} />
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 20px 16px',
        fontFamily: 'var(--font-mono)',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        marginTop: 24,
      }}>
        <div style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          letterSpacing: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>OPENCLAW</span>
          <span style={{ color: 'rgba(255,255,255,0.08)' }}>•</span>
          <span>HQ DASHBOARD</span>
          <span style={{ color: 'rgba(255,255,255,0.08)' }}>•</span>
          <span>FASAL SEVA</span>
          <span style={{ color: 'rgba(255,255,255,0.08)' }}>•</span>
          <span>{agents?.length || 6} AGENTS</span>
        </div>
        <div style={{
          fontSize: 9,
          color: 'rgba(255,255,255,0.1)',
          marginTop: 6,
          letterSpacing: 1,
        }}>
          CLAWATHON 2026
        </div>
      </footer>
    </div>
  );
}
