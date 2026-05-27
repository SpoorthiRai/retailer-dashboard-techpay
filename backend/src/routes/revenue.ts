import { Router } from "express";
import { pgPool } from "../db/postgres";
import { getMongoDB } from "../db/mongo";
import type { Request, Response } from "express";
import type { Filters } from "../types";

const router = Router();

router.post("/breakdown", async (req: Request, res: Response) => {
  try {
    const { filters } = req.body as { filters: Filters };
    const db = await getMongoDB();

    // Resolve store IDs from MongoDB
    const storeFilter: any = {};
    if (filters.state?.length) storeFilter.state = { $in: filters.state };
    if (filters.city?.length)  storeFilter.city  = { $in: filters.city };
    if (filters.store?.length) storeFilter.name  = { $in: filters.store };

    const matchedStores = await db.collection("stores")
      .find(storeFilter, { projection: { _id: 1, name: 1, city: 1, state: 1 } })
      .toArray();

    const storeIdMap: Record<string, any> = {};
    for (const s of matchedStores) storeIdMap[s._id.toString()] = s;
    const storeIds = matchedStores.map((s: any) => s._id.toString());

    const conditions = [`(
      payment_status IN ('SUCCESS','PAID','COMPLETED')
      OR cashfree_payment_status IN ('SUCCESS','PAID','COMPLETED')
      OR zype_payment_status = 'LOAN_TRANSFERRED'
      OR (payment_method = 'OFFLINE' AND payment_status = 'PAID')
    )`];
    const params: any[] = [];
    let i = 1;

    if (storeIds.length > 0) {
      conditions.push(`store_id = ANY($${i++})`);
      params.push(storeIds);
    }
    if (filters.dateFrom) {
      conditions.push(`created_at::date >= $${i++}`);
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push(`created_at::date <= $${i++}`);
      params.push(filters.dateTo);
    }

    const result = await pgPool.query(
      `SELECT order_id, order_no, created_at::date AS order_date,
              total_price, payment_method, store_id
       FROM orders_order
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC
       LIMIT 500`,
      params
    );

    const PM: Record<string, string> = {
      CASHFREE: "Cashfree", CASHFREE_ZYPE: "Zype (EMI)",
      PAYU: "PayU", OFFLINE: "Offline",
    };

    const items = result.rows.map((r: any) => {
      const store = storeIdMap[r.store_id] || {};
      return {
        orderId: r.order_no || r.order_id,
        date: r.order_date,
        customer: "—",
        phone: "—",
        city: store.city || "—",
        state: store.state || "—",
        store: store.name || r.store_id,
        product: "—",
        qty: 1,
        unitPrice: Number(r.total_price),
        paymentMethod: PM[r.payment_method] || r.payment_method,
        amount: Number(r.total_price),
      };
    });

    res.json({
      items,
      total: items.reduce((s: number, i: any) => s + i.amount, 0),
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;