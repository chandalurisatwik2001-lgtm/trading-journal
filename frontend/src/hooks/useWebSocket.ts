import { useState, useEffect, useRef, useCallback } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;

interface Metrics {
  active_users: number;
  revenue: number;
  requests_per_sec: number;
  error_rate: number;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network_in: number;
  network_out: number;
}

interface HistoryPoint {
  timestamp: string;
  active_users: number;
  requests_per_sec: number;
  error_rate: number;
  revenue: number;
  cpu: number;
  memory: number;
}

interface Activity {
  id: string;
  message: string;
  level: string;
  timestamp: string;
  source: string;
}

interface DashboardData {
  metrics: Metrics;
  system: SystemHealth;
  history: HistoryPoint[];
  activities: Activity[];
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export function useWebSocket() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const wsUrl = API?.replace(/^http/, 'ws') + '/api/ws/metrics';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => {
      setStatus('connected');
      // Ping every 30s to keep alive
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'snapshot') {
        setData(msg.data);
      } else if (msg.type === 'metrics_update') {
        setData(prev => {
          if (!prev) return prev;
          const update = msg.data;
          const newHistory = [...prev.history, update.latest_point].slice(-60);
          const newActivities = update.latest_activity
            ? [update.latest_activity, ...prev.activities].slice(0, 20)
            : prev.activities;
          return {
            metrics: update.metrics,
            system: update.system,
            history: newHistory,
            activities: newActivities,
          };
        });
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      if (pingTimer.current) clearInterval(pingTimer.current);
      // Reconnect after 3s
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    if (pingTimer.current) clearInterval(pingTimer.current);
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { data, status, reconnect: connect };
}
