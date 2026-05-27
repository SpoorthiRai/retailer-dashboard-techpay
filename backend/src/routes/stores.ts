import { Router } from "express";
import { getMongoDB } from "../db/mongo";
import type { Request, Response } from "express";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const db = await getMongoDB();
    const stores = await db.collection("stores").find({}, {
      projection: {
        _id: 1, name: 1, city: 1, state: 1,
        status: 1, type: 1, location: 1
      }
    }).toArray();

    res.json(stores.map((s: any) => ({
      id: s._id.toString(),
      name: s.name,
      city: s.city,
      state: s.state,
      status: s.status,
      type: s.type,
      // GeoJSON: coordinates = [longitude, latitude]
      lng: s.location?.coordinates?.[0] || 0,
      lat: s.location?.coordinates?.[1] || 0,
    })));
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;