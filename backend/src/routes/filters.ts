import { Router } from "express";
import { getMongoDB } from "../db/mongo";
import type { Request, Response } from "express";

const router = Router();

// Map short state codes to full names
const STATE_NAMES: Record<string, string> = {
  HR: "Haryana", KA: "Karnataka", TN: "Tamil Nadu",
  RJ: "Rajasthan", DL: "Delhi", UP: "Uttar Pradesh",
  JK: "Jammu and Kashmir", MH: "Maharashtra",
  GJ: "Gujarat", PB: "Punjab", MP: "Madhya Pradesh",
};

router.get("/options", async (_req: Request, res: Response) => {
  try {
    const db = await getMongoDB();
    const stores = await db.collection("stores").find({}, {
      projection: { _id: 1, name: 1, city: 1, state: 1 }
    }).toArray();

    const stateToCities: Record<string, string[]> = {};
    const cityToStores: Record<string, string[]> = {};
    const states = new Set<string>();
    const cities = new Set<string>();
    const storeNames = new Set<string>();

    for (const s of stores) {
      if (!s.city || !s.name) continue;

      // Use full state name if available
      const stateName = STATE_NAMES[s.state] || s.state;

      states.add(stateName);
      cities.add(s.city);
      storeNames.add(s.name);

      if (!stateToCities[stateName]) stateToCities[stateName] = [];
      if (!stateToCities[stateName].includes(s.city))
        stateToCities[stateName].push(s.city);

      if (!cityToStores[s.city]) cityToStores[s.city] = [];
      if (!cityToStores[s.city].includes(s.name))
        cityToStores[s.city].push(s.name);
    }

    res.json({
      states: [...states].sort(),
      cities: [...cities].sort(),
      stores: [...storeNames].sort(),
      stateToCities,
      cityToStores,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;