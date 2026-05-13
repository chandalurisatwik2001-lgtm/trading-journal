from dotenv import load_dotenv
load_dotenv()

import os
import json
import bcrypt
import jwt
import secrets
import asyncio
import random
from datetime import datetime, timezone, timedelta
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, Response, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# ─── Config ───
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "pulse_analytics")
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@pulse.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

# ─── MongoDB ───
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ─── Password Hashing ───
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# ─── JWT ───
def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=60),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# ─── Auth Helper ───
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ─── Schemas ───
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ─── Brute Force Protection ───
async def check_brute_force(ip: str, email: str):
    identifier = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        lockout_until = attempt.get("lockout_until")
        if lockout_until and datetime.now(timezone.utc) < lockout_until:
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})

async def record_failed_attempt(ip: str, email: str):
    identifier = f"{ip}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt:
        new_count = attempt.get("count", 0) + 1
        update = {"$set": {"count": new_count, "last_attempt": datetime.now(timezone.utc)}}
        if new_count >= 5:
            update["$set"]["lockout_until"] = datetime.now(timezone.utc) + timedelta(minutes=15)
        await db.login_attempts.update_one({"identifier": identifier}, update)
    else:
        await db.login_attempts.insert_one({
            "identifier": identifier,
            "count": 1,
            "last_attempt": datetime.now(timezone.utc)
        })

async def clear_failed_attempts(ip: str, email: str):
    identifier = f"{ip}:{email}"
    await db.login_attempts.delete_one({"identifier": identifier})

# ─── Data Simulation ───
class MetricsSimulator:
    def __init__(self):
        self.active_users = 1247
        self.revenue = 48329.50
        self.requests_per_sec = 342
        self.error_rate = 1.2
        self.cpu_usage = 45
        self.memory_usage = 62
        self.disk_usage = 38
        self.network_in = 125
        self.network_out = 89
        self.history = []
        self.activities = []
        self._init_history()
        self._init_activities()

    def _init_history(self):
        now = datetime.now(timezone.utc)
        for i in range(60):
            t = now - timedelta(seconds=(60 - i) * 2)
            self.history.append({
                "timestamp": t.isoformat(),
                "active_users": max(800, int(1200 + random.gauss(0, 100))),
                "requests_per_sec": max(100, int(340 + random.gauss(0, 50))),
                "error_rate": max(0, round(1.2 + random.gauss(0, 0.5), 2)),
                "revenue": round(48000 + random.gauss(0, 500), 2),
                "cpu": max(10, min(95, int(45 + random.gauss(0, 10)))),
                "memory": max(20, min(95, int(62 + random.gauss(0, 8)))),
            })

    def _init_activities(self):
        actions = [
            ("User signup", "info"), ("Payment processed", "success"),
            ("API rate limit hit", "warning"), ("Server error 500", "error"),
            ("New deployment", "info"), ("Database backup", "success"),
            ("High CPU alert", "warning"), ("Auth failure", "error"),
            ("Cache cleared", "info"), ("SSL cert renewed", "success"),
        ]
        now = datetime.now(timezone.utc)
        for i in range(20):
            action, level = random.choice(actions)
            self.activities.append({
                "id": str(i),
                "message": action,
                "level": level,
                "timestamp": (now - timedelta(seconds=i * 15)).isoformat(),
                "source": random.choice(["api-gateway", "auth-service", "payment-svc", "cdn", "db-primary"])
            })

    def tick(self):
        self.active_users = max(200, self.active_users + random.randint(-30, 35))
        self.revenue = max(10000, round(self.revenue + random.uniform(-50, 80), 2))
        self.requests_per_sec = max(50, self.requests_per_sec + random.randint(-20, 25))
        self.error_rate = max(0, round(self.error_rate + random.gauss(0, 0.3), 2))
        self.cpu_usage = max(5, min(98, self.cpu_usage + random.randint(-5, 5)))
        self.memory_usage = max(10, min(98, self.memory_usage + random.randint(-3, 3)))
        self.disk_usage = max(5, min(95, self.disk_usage + random.randint(-1, 2)))
        self.network_in = max(10, self.network_in + random.randint(-15, 20))
        self.network_out = max(5, self.network_out + random.randint(-10, 15))

        now = datetime.now(timezone.utc)
        point = {
            "timestamp": now.isoformat(),
            "active_users": self.active_users,
            "requests_per_sec": self.requests_per_sec,
            "error_rate": self.error_rate,
            "revenue": self.revenue,
            "cpu": self.cpu_usage,
            "memory": self.memory_usage,
        }
        self.history.append(point)
        if len(self.history) > 120:
            self.history = self.history[-120:]

        # Occasionally add activity
        if random.random() < 0.4:
            actions = [
                ("User signup from US", "info"), ("$99 payment processed", "success"),
                ("Rate limit exceeded", "warning"), ("Timeout on /api/data", "error"),
                ("New build deployed v2.4.1", "info"), ("Auto-scaling triggered", "success"),
                ("Memory usage >80%", "warning"), ("Invalid token attempt", "error"),
                ("CDN cache purged", "info"), ("Webhook delivered", "success"),
                ("Slow query detected (2.3s)", "warning"), ("Connection pool exhausted", "error"),
            ]
            action, level = random.choice(actions)
            activity = {
                "id": secrets.token_hex(4),
                "message": action,
                "level": level,
                "timestamp": now.isoformat(),
                "source": random.choice(["api-gateway", "auth-service", "payment-svc", "cdn", "db-primary", "scheduler"])
            }
            self.activities.insert(0, activity)
            if len(self.activities) > 50:
                self.activities = self.activities[:50]

        return {
            "metrics": {
                "active_users": self.active_users,
                "revenue": self.revenue,
                "requests_per_sec": self.requests_per_sec,
                "error_rate": self.error_rate,
            },
            "system": {
                "cpu": self.cpu_usage,
                "memory": self.memory_usage,
                "disk": self.disk_usage,
                "network_in": self.network_in,
                "network_out": self.network_out,
            },
            "latest_point": point,
            "latest_activity": self.activities[0] if self.activities else None,
        }

    def get_snapshot(self):
        return {
            "metrics": {
                "active_users": self.active_users,
                "revenue": self.revenue,
                "requests_per_sec": self.requests_per_sec,
                "error_rate": self.error_rate,
            },
            "system": {
                "cpu": self.cpu_usage,
                "memory": self.memory_usage,
                "disk": self.disk_usage,
                "network_in": self.network_in,
                "network_out": self.network_out,
            },
            "history": self.history[-60:],
            "activities": self.activities[:20],
        }

simulator = MetricsSimulator()

# ─── WebSocket Manager ───
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)

ws_manager = ConnectionManager()

# ─── Background Task ───
async def broadcast_metrics():
    while True:
        await asyncio.sleep(2)
        update = simulator.tick()
        await ws_manager.broadcast({"type": "metrics_update", "data": update})

# ─── Admin Seeding ───
async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        hashed = hash_password(ADMIN_PASSWORD)
        await db.users.insert_one({
            "email": ADMIN_EMAIL,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}}
        )

    # Write test credentials
    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {ADMIN_EMAIL}\n- Password: {ADMIN_PASSWORD}\n- Role: admin\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n")

# ─── Lifespan ───
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_admin()
    task = asyncio.create_task(broadcast_metrics())
    yield
    # Shutdown
    task.cancel()
    client.close()

# ─── App ───
app = FastAPI(title="Pulse Analytics API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        os.environ.get("APP_URL", "http://localhost:3000"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Auth Routes ───
@app.post("/api/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(req.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": req.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": req.name, "role": "user"}

@app.post("/api/auth/login")
async def login(req: LoginRequest, request: Request, response: Response):
    email = req.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    await check_brute_force(ip, email)
    user = await db.users.find_one({"email": email})
    if not user:
        await record_failed_attempt(ip, email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(req.password, user["password_hash"]):
        await record_failed_attempt(ip, email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await clear_failed_attempts(ip, email)
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": user.get("name", ""), "role": user.get("role", "user")}

@app.post("/api/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@app.post("/api/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user_id = str(user["_id"])
        access_token = create_access_token(user_id, user["email"])
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ─── Dashboard Routes ───
@app.get("/api/dashboard/snapshot")
async def get_snapshot(user: dict = Depends(get_current_user)):
    return simulator.get_snapshot()

@app.get("/api/dashboard/events")
async def get_events(user: dict = Depends(get_current_user)):
    events = await db.events.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50)
    return events

# ─── WebSocket ───
@app.websocket("/api/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial snapshot
        await websocket.send_json({"type": "snapshot", "data": simulator.get_snapshot()})
        while True:
            # Keep connection alive, listen for pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)

# ─── Health ───
@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}
