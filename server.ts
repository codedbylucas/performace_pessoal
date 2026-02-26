import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);
const JWT_SECRET = process.env.JWT_SECRET || "PerformanceSaaSSecret2026";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jlojdqqjnnsevxobebeo.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY não definido. Configure no .env para persistência funcionar.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Helpers
async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error && error.code !== "PGRST116") throw error; // 116 = No rows found
  return data;
}

async function insertUser(user: any) {
  const { data, error } = await supabase.from("users").insert(user).select().single();
  if (error) throw error;
  return data;
}

async function upsertSyncData(items: any[], userId: string, version: number) {
  const payload = items.map((item) => ({
    id: item.id,
    user_id: userId,
    table_name: item.table,
    data: JSON.stringify(item.data),
    version,
    updated_at: version
  }));
  const { error } = await supabase.from("sync_data").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

// API Routes
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const id = Math.random().toString(36).substr(2, 9);
  const hash = await bcrypt.hash(password, 10);

  try {
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ error: "Email already exists" });

    await insertUser({
      id,
      name,
      email,
      password_hash: hash,
      onboarding_completed: 0,
      created_at: Date.now()
    });

    const token = jwt.sign({ id, email, name }, JWT_SECRET);
    res.json({ token, user: { id, name, email } });
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: "Signup failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
});

// Sync API (Incremental)
app.get("/api/sync/pull", authenticate, async (req: any, res) => {
  const { last_version = 0 } = req.query;
  try {
    const { data, error } = await supabase
      .from("sync_data")
      .select("*")
      .eq("user_id", req.user.id)
      .gt("version", Number(last_version))
      .order("version", { ascending: true });
    if (error) throw error;
    res.json({ changes: data });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to pull changes" });
  }
});

app.post("/api/sync/push", authenticate, async (req: any, res) => {
  const { changes } = req.body;
  const timestamp = Date.now();
  try {
    await upsertSyncData(changes, req.user.id, timestamp);
    res.json({ success: true, timestamp });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to push changes" });
  }
});

// Vite Middleware for Dev
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

startServer();
