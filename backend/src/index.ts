import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

import metricsRouter from "./routes/metrics";
import filtersRouter from "./routes/filters";
import storesRouter from "./routes/stores";
import inventoryRouter from "./routes/inventory";
import revenueRouter from "./routes/revenue";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// ── Health check ───────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes (no auth for now — add later when integrating) ──
app.use("/api/metrics", metricsRouter);
app.use("/api/filters", filtersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/revenue", revenueRouter);

// ── Error handler ──────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 TechPay API running on http://localhost:${PORT}`);
});

export default app;