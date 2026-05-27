import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pgPool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) || 5432,
  database: process.env.PG_DB,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: false
});

pgPool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err);
});

// Test connection on startup
pgPool.query("SELECT NOW()")
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((err) => console.error("❌ PostgreSQL connection failed:", err.message));