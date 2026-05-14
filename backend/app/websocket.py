"""
WebSocket manager for real-time data streaming.
- Live crypto prices from CoinGecko
- Real-time P&L tracking
- Live trade notifications
"""
import asyncio
import json
import random
import httpx
from datetime import datetime, timezone
from typing import Dict, List, Set
from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)
        else:
            self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

    async def broadcast(self, message: dict):
        disconnected = []
        # Broadcast to global connections
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except Exception:
                disconnected.append(conn)
        
        # Broadcast to user-specific connections
        for user_id, connections in self.user_connections.items():
            for conn in connections:
                try:
                    await conn.send_json(message)
                except Exception:
                    pass
                    
        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()

# ─── Crypto Price Cache ───
CRYPTO_IDS = {
    "bitcoin": "BTC",
    "ethereum": "ETH",
    "binancecoin": "BNB",
    "solana": "SOL",
    "ripple": "XRP",
    "cardano": "ADA",
    "dogecoin": "DOGE",
    "polkadot": "DOT",
}

price_cache: Dict[str, dict] = {}
price_history: Dict[str, List[dict]] = {sym: [] for sym in CRYPTO_IDS.values()}


async def fetch_crypto_prices():
    """Fetch live crypto prices from CoinGecko."""
    ids = ",".join(CRYPTO_IDS.keys())
    url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                now = datetime.now(timezone.utc).isoformat()
                for coin_id, symbol in CRYPTO_IDS.items():
                    if coin_id in data:
                        info = data[coin_id]
                        price_data = {
                            "symbol": symbol,
                            "price": info.get("usd", 0),
                            "change_24h": round(info.get("usd_24h_change", 0), 2),
                            "volume_24h": info.get("usd_24h_vol", 0),
                            "market_cap": info.get("usd_market_cap", 0),
                            "timestamp": now,
                        }
                        price_cache[symbol] = price_data

                        # Add to history (keep last 100 points)
                        price_history[symbol].append({
                            "time": now,
                            "price": price_data["price"],
                        })
                        if len(price_history[symbol]) > 100:
                            price_history[symbol] = price_history[symbol][-100:]
                return True
    except Exception as e:
        print(f"[WS] Price fetch error: {type(e).__name__}: {e}")
    return False


async def price_broadcast_loop():
    """Background loop: fetch prices and broadcast every 10 seconds."""
    # Initial delay to let the server fully start
    await asyncio.sleep(2)
    while True:
        try:
            success = await fetch_crypto_prices()
            print(f"[WS] Price fetch: success={success}, cached={len(price_cache)} coins, clients={len(manager.active_connections)}")
            if success and manager.active_connections:
                await manager.broadcast({
                    "type": "price_update",
                    "data": {
                        "prices": list(price_cache.values()),
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    }
                })
        except Exception as e:
            print(f"[WS] Broadcast loop error: {e}")
        await asyncio.sleep(10)


# ─── Notification System ───
notifications_log: List[dict] = []


async def send_notification(message: str, level: str = "info", source: str = "system"):
    """Push a notification to all connected clients."""
    notif = {
        "id": f"{datetime.now(timezone.utc).timestamp():.0f}",
        "message": message,
        "level": level,
        "source": source,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    notifications_log.insert(0, notif)
    if len(notifications_log) > 50:
        notifications_log.pop()

    await manager.broadcast({
        "type": "notification",
        "data": notif,
    })
    return notif


def get_initial_data():
    """Snapshot for newly connected clients."""
    return {
        "type": "initial_data",
        "data": {
            "prices": list(price_cache.values()),
            "price_history": {
                sym: pts[-30:] for sym, pts in price_history.items()
            },
            "notifications": notifications_log[:20],
        }
    }
