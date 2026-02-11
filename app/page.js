'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import OfficeCanvas from '@/components/OfficeCanvas';
import AgentPanel from '@/components/AgentPanel';
import EventFeed from '@/components/EventFeed';
import ChatLog from '@/components/ChatLog';
import MissionBoard from '@/components/MissionBoard';
import StatsBar from '@/components/StatsBar';

export default function Home() {
  const [agents, setAgents] = useState([]);
  const [events, setEvents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [nodeConnected, setNodeConnected] = useState(false);


  const fetchAll = useCallback(async () => {
    const [a, e, m] = await Promise.all([
      supabase.from('ops_agents').select('*').order('name'),
      supabase.from('ops_events').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('ops_messages').select('*').order('created_at', { ascending: false }).limit(30),
    ]);
    if (a.data) setAgents(a.data);
    if (e.data) setEvents(e.data.reverse());
    if (m.data) setMessages(m.data.reverse());
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase.channel('hq-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ops_agents' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setAgents(prev => prev.map(a => a.name === payload.new.name ? payload.new : a));
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ops_events' }, (payload) => {
        setEvents(prev => [...prev, payload.new]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ops_messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  // Poll node-heartbeat for real-time node connection status
  useEffect(() => {
    const checkNode = async () => {
      try {
        const res = await fetch('/api/node-heartbeat');
        const data = await res.json();
        setNodeConnected(data?.anyOnline === true);
      } catch {
        setNodeConnected(false);
      }
    };
    checkNode();
    const iv = setInterval(checkNode, 5000);
    return () => clearInterval(iv);
  }, []);

  // Random activity simulation for Pulse — keeps it alive even without real node events
  useEffect(() => {
    const PULSE_TASKS = [
      'Scanning node latency', 'Checking heartbeat', 'Monitoring uptime',
      'Running health check', 'Syncing node status', 'Analyzing logs',
      'Pinging gateway', 'Verifying connections', 'Auditing metrics',
      'Refreshing dashboard', 'Inspecting traffic', 'Polling endpoints',
    ];
    const PULSE_STATUSES = ['working', 'thinking', 'working', 'researching'];

    const simulate = () => {
      setAgents(prev => {
        const pulse = prev.find(a => a.name === 'pulse');
        if (!pulse) return prev;
        const isIdle = pulse.status === 'idle' || pulse.status === 'sleeping';
        if (isIdle && Math.random() < 0.4) {
          // Start a random task
          const task = PULSE_TASKS[Math.floor(Math.random() * PULSE_TASKS.length)];
          const status = PULSE_STATUSES[Math.floor(Math.random() * PULSE_STATUSES.length)];
          return prev.map(a => a.name === 'pulse' ? { ...a, status, current_task: task } : a);
        } else if (!isIdle && Math.random() < 0.35) {
          // Go back to idle
          return prev.map(a => a.name === 'pulse' ? { ...a, status: 'idle', current_task: null } : a);
        }
        return prev;
      });
    };

    const iv = setInterval(simulate, 6000 + Math.random() * 4000);
    return () => clearInterval(iv);
  }, []);



  return (
    <div className="hq-page">
      <StatsBar agents={agents} events={events} />

      <div className="hq-main">
        <div className="hq-sidebar-left">
          <AgentPanel agents={agents} />
        </div>
        <div className="hq-center">
          <OfficeCanvas agents={agents} nodeConnected={nodeConnected} />
        </div>
        <div className="hq-sidebar-right">
          <MissionBoard />
        </div>
      </div>

      <div className="hq-bottom">
        <EventFeed events={events} />
        <ChatLog messages={messages} />
      </div>
    </div>
  );
}
