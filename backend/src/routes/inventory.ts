import { Router } from "express";
import { getMongoDB } from "../db/mongo";
import { ObjectId } from "mongodb";
import type { Request, Response } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { storeNames } = req.body;
    const db = await getMongoDB();

    const storeFilter: any = {};
    if (storeNames?.length) {
      const stores = await db.collection("stores")
        .find({ name: { $in: storeNames } }, { projection: { _id: 1, name: 1 } })
        .toArray();
      storeFilter.store = { $in: stores.map((s: any) => s._id) };
    }

    // Get all stores for name mapping
    const allStores = await db.collection("stores")
      .find({}, { projection: { _id: 1, name: 1 } })
      .toArray();
    const storeIdToName: Record<string, string> = {};
    for (const s of allStores) storeIdToName[s._id.toString()] = s.name;

    const docs = await db.collection("inventories").aggregate([
      { $match: storeFilter },
      { $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productInfo"
      }},
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      { $project: {
        quantity: 1, store: 1,
        "productInfo.name": 1,
        "productInfo.category": 1,
        "productInfo.manufacturer": 1,
      }},
    ]).toArray();

    const products = docs.map((d: any) => ({
      product: d.productInfo?.name || "Unknown",
      category: d.productInfo?.category || "Unknown",
      brand: d.productInfo?.manufacturer || "Unknown",
      quantity: Number(d.quantity) || 0,
      storeName: storeIdToName[d.store?.toString()] || "Unknown",
    }));

    const total = products.length;
    const outOfStock = products.filter((p: any) => p.quantity === 0).length;
    const lowStock = products.filter(
      (p: any) => p.quantity >= 1 && p.quantity <= 9
    ).length;

    res.json({
      products,
      summary: {
        total,
        outOfStock,
        lowStock,
        healthyStock: total - outOfStock - lowStock,
      },
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;