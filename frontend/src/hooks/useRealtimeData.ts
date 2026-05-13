import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

interface PriceData {
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  timestamp: string;
}

interface PriceHistoryPoint {
  time: string;
  price: number;
}

interface Notification {
  id: string;
  message: string;
  level: string;
  source: string;
  timestamp: string;
}

interface RealtimeData {
  prices: PriceData[];
  priceHistory: Record<string, PriceHistoryPoint[]>;
  notifications: Notification[];
}

type WSStatus = 'connecting' | 'connected' | 'disconnected';

export function useRealtimeData() {
  const [data, setData] = useState<RealtimeData>({
    prices: [],
    priceHistory: {},
    notifications: [],
  });
  const [status, setStatus] = useState<WSStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = API_BASE.replace(/^http/, 'ws') + '/api/v1/ws/prices';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setStatus('connecting');

    ws.onopen = () => {
      setStatus('connected');
      pingTimer.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping');
      }, 25000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'initial_data') {
          setData({
            prices: msg.data.prices || [],
            priceHistory: msg.data.price_history || {},
            notifications: msg.data.notifications || [],
          });
        } else if (msg.type === 'price_update') {
          setData(prev => {
            const newPrices = msg.data.prices || [];
            // Merge price history
            const newHistory = { ...prev.priceHistory };
            for (const p of newPrices) {
              if (!newHistory[p.symbol]) newHistory[p.symbol] = [];
              newHistory[p.symbol] = [
                ...newHistory[p.symbol],
                { time: p.timestamp, price: p.price }
              ].slice(-60);
            }
            return { ...prev, prices: newPrices, priceHistory: newHistory };
          });
        } else if (msg.type === 'notification') {
          setData(prev => ({
            ...prev,
            notifications: [msg.data, ...prev.notifications].slice(0, 30),
          }));
        }
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      if (pingTimer.current) clearInterval(pingTimer.current);
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
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

  return { ...data, status };
}

// Polling fallback for initial load before WS connects
export async function fetchLivePrices(): Promise<PriceData[]> {
  try {
    const resp = await fetch(`${API_BASE}/api/v1/prices/live`);
    const data = await resp.json();
    return data.prices || [];
  } catch {
    return [];
  }
}
