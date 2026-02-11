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
