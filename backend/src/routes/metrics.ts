import { Router } from "express";
import { getMetrics } from "../controllers/metrics.controller";

const router = Router();
router.post("/", getMetrics);
export default router;