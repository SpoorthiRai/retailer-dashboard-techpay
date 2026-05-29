import type { Request, Response } from "express";
import { pgPool } from "../db/postgres";
import { getMongoDB } from "../db/mongo";
import { ObjectId } from "mongodb";
import type { Filters } from "../types";

export async function getMetrics(req: Request, res: Response) {
  try {
    const { filters } = req.body as { filters: Filters };
    const db = await getMongoDB();

    // ── Step 1: Get store IDs from MongoDB ──────────────────
    const STATE_CODES: Record<string, string> = {
  Haryana: "HR", Karnataka: "KA", "Tamil Nadu": "TN",
  Rajasthan: "RJ", Delhi: "DL", "Uttar Pradesh": "UP",
  "Jammu and Kashmir": "JK", Maharashtra: "MH",
  Gujarat: "GJ", Punjab: "PB", "Madhya Pradesh": "MP",
};

    const storeFilter: any = {};
    if (filters.state?.length) {
    // Match both full names and short codes
    const codes = filters.state.map(s => STATE_CODES[s] || s);
    const full = filters.state;
    storeFilter.state = { $in: [...full, ...codes] };
    }
    if (filters.city?.length)  storeFilter.city  = { $in: filters.city };
    if (filters.store?.length) storeFilter.name  = { $in: filters.store };

    const matchedStores = await db.collection("stores").find(storeFilter, {
      projection: { _id: 1, name: 1, city: 1, state: 1, status: 1, type: 1, location: 1 }
    }).toArray();

    const storeIdMap: Record<string, any> = {};
    for (const s of matchedStores) storeIdMap[s._id.toString()] = s;
    const storeIds = matchedStores.map(s => s._id.toString());

    // If location filter applied but no stores found → empty
    if ((filters.state?.length || filters.city?.length || filters.store?.length) && storeIds.length === 0) {
      return res.json(emptyMetrics());
    }

    // ── Step 2: Build PostgreSQL WHERE clause ───────────────
    const conditions: string[] = [];
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

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Payment success logic
    const isSuccess = `(
      payment_status IN ('SUCCESS','PAID','COMPLETED')
      OR cashfree_payment_status IN ('SUCCESS','PAID','COMPLETED')
      OR zype_payment_status = 'LOAN_TRANSFERRED'
      OR (payment_method = 'OFFLINE' AND payment_status = 'PAID')
    )`;
    const isConfirmed = `(status = 'CONFIRMED' OR ${isSuccess})`;
    const confirmedWhere = where
      ? `${where} AND ${isConfirmed}`
      : `WHERE ${isConfirmed}`;

    // ── Step 3: Run all PG queries in parallel ──────────────
    const [kpiRes, monthlyRes, storeOrderRes, funnelRes, pmRes, emiRes] =
      await Promise.all([

        // KPIs
        pgPool.query(`
          SELECT
            COUNT(*) AS total_orders,
            COUNT(*) FILTER (WHERE ${isConfirmed}) AS confirmed_orders,
            COALESCE(SUM(total_price) FILTER (WHERE ${isConfirmed}), 0) AS gmv,
            COALESCE(SUM(total_price) FILTER (WHERE ${isSuccess}), 0) AS collected_revenue,
            COUNT(*) FILTER (WHERE payment_method = 'CASHFREE_ZYPE' AND ${isConfirmed}) AS emi_orders
          FROM orders_order ${where}`, params),

        // Monthly series
        pgPool.query(`
          SELECT
            TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
            SUM(total_price) AS total_sales,
            COUNT(*) AS quantity
          FROM orders_order
          ${confirmedWhere}
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY DATE_TRUNC('month', created_at)`, params),

        // Per store stats
        pgPool.query(`
          SELECT
            store_id,
            COUNT(*) AS orders,
            SUM(total_price) AS revenue,
            COUNT(*) FILTER (WHERE ${isSuccess}) AS success_count,
            COUNT(*) FILTER (WHERE NOT ${isSuccess}) AS failed_count
          FROM orders_order
          ${confirmedWhere}
          GROUP BY store_id`, params),

        // Order funnel
        pgPool.query(`
          SELECT
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'CONFIRMED') AS confirmed,
            COUNT(*) FILTER (WHERE ${isSuccess}) AS payment_success,
            COUNT(*) FILTER (WHERE
              status = 'CONFIRMED'
              AND (cashfree_payment_status = 'USER_DROPPED' OR payment_status = 'USER_DROPPED')
            ) AS user_dropped,
            COUNT(*) FILTER (WHERE
              status = 'CONFIRMED'
              AND NOT (${isSuccess})
              AND NOT (cashfree_payment_status = 'USER_DROPPED' OR payment_status = 'USER_DROPPED')
              AND (
                COALESCE(cashfree_payment_status, '') = 'FAILED'
                OR COALESCE(payment_status, '') = 'FAILED'
              )
            ) AS failed_count
          FROM orders_order ${where}`, params),

        // Payment methods
        pgPool.query(`
          SELECT
            payment_method,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE ${isSuccess}) AS success_count
          FROM orders_order
          ${confirmedWhere}
          GROUP BY payment_method`, params),

        // EMI detail
        pgPool.query(`
          SELECT
            COUNT(*) AS count,
            AVG(down_payment) FILTER (WHERE down_payment > 0) AS avg_down_payment,
            AVG(net_loan_amount) FILTER (WHERE net_loan_amount > 0) AS avg_loan_amount,
            SUM(down_payment) FILTER (WHERE down_payment > 0) AS total_down_payment,
            SUM(net_loan_amount) FILTER (WHERE net_loan_amount > 0) AS total_loan_amount,
            SUM(total_price) AS total_emi_revenue,
            AVG(total_price) AS avg_emi_ticket
          FROM orders_order
          ${where ? where + ` AND payment_method = 'CASHFREE_ZYPE' AND ${isConfirmed}` 
                  : `WHERE payment_method = 'CASHFREE_ZYPE' AND ${isConfirmed}`}`,
          params),
      ]);

    // ── Step 4: Previous period for MoM ────────────────────
    const prevFilters = getPreviousPeriod(filters);
    const prevParams: any[] = [];
    const prevConditions: string[] = [];
    let pi = 1;
    if (storeIds.length > 0) {
      prevConditions.push(`store_id = ANY($${pi++})`);
      prevParams.push(storeIds);
    }
    if (prevFilters.dateFrom) {
      prevConditions.push(`created_at::date >= $${pi++}`);
      prevParams.push(prevFilters.dateFrom);
    }
    if (prevFilters.dateTo) {
      prevConditions.push(`created_at::date <= $${pi++}`);
      prevParams.push(prevFilters.dateTo);
    }
    const prevWhere = prevConditions.length
      ? `WHERE ${prevConditions.join(" AND ")}`
      : "";

    const prevRes = await pgPool.query(`
      SELECT
        COUNT(*) FILTER (WHERE ${isConfirmed}) AS confirmed_orders,
        COALESCE(SUM(total_price) FILTER (WHERE ${isConfirmed}), 0) AS gmv,
        COALESCE(SUM(total_price) FILTER (WHERE ${isSuccess}), 0) AS collected_revenue,
        COUNT(*) FILTER (WHERE payment_method = 'CASHFREE_ZYPE' AND ${isConfirmed}) AS emi_orders
      FROM orders_order ${prevWhere}`, prevParams);

    // ── Step 5: MongoDB — inventory + carts ────────────────
    const invStoreFilter = storeIds.length > 0
      ? { store: { $in: storeIds.map(id => new ObjectId(id)) } }
      : {};

    const [inventoryDocs, cartCount] = await Promise.all([
      db.collection("inventories").aggregate([
        { $match: invStoreFilter },
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
      ]).toArray(),

      db.collection("carts").countDocuments(
        storeIds.length > 0
          ? { store: { $in: storeIds.map(id => new ObjectId(id)) } }
          : {}
      ),
    ]);

    // ── Step 6: Shape the response ─────────────────────────
    const kpi = kpiRes.rows[0];
    const prev = prevRes.rows[0];
    const funnel = funnelRes.rows[0];
    const emi = emiRes.rows[0];

    const confirmedOrders = Number(kpi.confirmed_orders);
    const gmv = Number(kpi.gmv);
    const collectedRevenue = Number(kpi.collected_revenue);
    const emiOrders = Number(kpi.emi_orders);
    const paymentSuccess = Number(funnel.payment_success);
    const paymentSuccessRate = confirmedOrders
      ? Math.round((paymentSuccess / confirmedOrders) * 100)
      : 0;

    // Store performance
    const storePerformance = storeOrderRes.rows.map((r: any) => {
      const info = storeIdMap[r.store_id] || {};
      const orders = Number(r.orders);
      const failRate = orders
        ? Math.round((Number(r.failed_count) / orders) * 100)
        : 0;
      return {
        storeId: r.store_id,
        name: info.name || r.store_id,
        city: info.city || "—",
        state: info.state || "—",
        status: info.status || "unknown",
        orders,
        revenue: Number(r.revenue),
        failRate,
      };
    }).sort((a: any, b: any) => b.revenue - a.revenue);

    // Payment methods
    const PM_LABELS: Record<string, string> = {
      CASHFREE: "Cashfree",
      CASHFREE_ZYPE: "Cashfree Zype (EMI/BNPL)",
      PAYU: "PayU",
      OFFLINE: "Offline",
    };
    const PM_COLORS: Record<string, string> = {
      CASHFREE: "#2E86C1",
      CASHFREE_ZYPE: "#4A235A",
      PAYU: "#E67E22",
      OFFLINE: "#1A8C7A",
    };
    const paymentMethodBreakdown = pmRes.rows.map((r: any) => ({
      name: r.payment_method,
      label: PM_LABELS[r.payment_method] || r.payment_method,
      count: Number(r.total),
      color: PM_COLORS[r.payment_method] || "#94A3B8",
    })).sort((a: any, b: any) => b.count - a.count);

    const paymentMethodSuccess = pmRes.rows.map((r: any) => ({
      method: r.payment_method,
      label: PM_LABELS[r.payment_method] || r.payment_method,
      success: Number(r.success_count),
      total: Number(r.total),
      rate: Number(r.total)
        ? Math.round((Number(r.success_count) / Number(r.total)) * 100)
        : 0,
    }));

    // EMI
    const nonEmiRevenue = gmv - Number(emi.total_emi_revenue || 0);
    const nonEmiCount = confirmedOrders - emiOrders;
    const emiDetail = {
      count: Number(emi.count),
      avgDownPayment: Math.round(Number(emi.avg_down_payment) || 0),
      avgLoanAmount: Math.round(Number(emi.avg_loan_amount) || 0),
      totalDownPayment: Math.round(Number(emi.total_down_payment) || 0),
      totalLoanAmount: Math.round(Number(emi.total_loan_amount) || 0),
      totalEmiRevenue: Math.round(Number(emi.total_emi_revenue) || 0),
      avgEmiTicket: Number(emi.count)
        ? Math.round(Number(emi.total_emi_revenue) / Number(emi.count))
        : 0,
      avgNonEmiTicket: nonEmiCount > 0
        ? Math.round(nonEmiRevenue / nonEmiCount)
        : 0,
    };

    // Inventory from MongoDB
    const invProducts = inventoryDocs.map((doc: any) => ({
      product: doc.productInfo?.name || "Unknown",
      category: doc.productInfo?.category || "Unknown",
      brand: doc.productInfo?.manufacturer || "Unknown",
      quantity: Number(doc.quantity) || 0,
      storeName: storeIdMap[doc.store?.toString()]?.name || "Unknown",
    }));

    const invTotal = invProducts.length;
    const invOOS = invProducts.filter((p: any) => p.quantity === 0).length;
    const invLow = invProducts.filter((p: any) => p.quantity >= 1 && p.quantity <= 9).length;

    // Category sales
    const CAT_COLORS: Record<string, string> = {
      Laptops: "#1A8C7A", Printers: "#E67E22",
      Accessories: "#C8D44E", Desktops: "#1C2B3A",
      Tablets: "#4A235A", "2-in-1": "#2E86C1",
    };
    const catMap: Record<string, number> = {};
    for (const p of invProducts) {
      catMap[p.category] = (catMap[p.category] || 0) + 1;
    }
    const totalCat = Object.values(catMap).reduce((s, c) => s + c, 0);
    const categorySales = Object.entries(catMap).map(([name, count]) => ({
      name, value: count,
      color: CAT_COLORS[name] || "#94A3B8",
      revenue: totalCat > 0 ? Math.round(gmv * (count / totalCat)) : 0,
      percentage: totalCat > 0 ? Math.round((count / totalCat) * 10000) / 100 : 0,
    })).sort((a, b) => b.value - a.value);

    // Brand data
    const brandMap: Record<string, { count: number; revenue: number }> = {};
    for (const p of invProducts) {
      if (!brandMap[p.brand]) brandMap[p.brand] = { count: 0, revenue: 0 };
      brandMap[p.brand].count++;
      brandMap[p.brand].revenue += totalCat > 0
        ? Math.round(gmv / totalCat) : 0;
    }
    const brandData = Object.entries(brandMap).map(([name, d]) => ({
      name, productCount: d.count, revenue: d.revenue,
    })).sort((a, b) => b.productCount - a.productCount);

    // MoM comparison
    const pct = (cur: number, prev: number) =>
      prev ? Math.round(((cur - prev) / prev) * 100) : 0;
    const prevConfirmed = Number(prev.confirmed_orders);
    const prevGmv = Number(prev.gmv);
    const prevCollected = Number(prev.collected_revenue);
    const prevEmi = Number(prev.emi_orders);
    const prevSuccessRate = prevConfirmed
      ? Math.round((prevCollected / (prevGmv || 1)) * 100)
      : 0;

    const momComparison = {
      currentMonth: filters.dateFrom,
      previousMonth: prevFilters.dateFrom,
      currentOrders: confirmedOrders,
      previousOrders: prevConfirmed,
      currentRevenue: gmv,
      previousRevenue: prevGmv,
      currentSuccessRate: paymentSuccessRate,
      previousSuccessRate: prevSuccessRate,
      ordersChange: pct(confirmedOrders, prevConfirmed),
      revenueChange: pct(gmv, prevGmv),
      successRateChange: paymentSuccessRate - prevSuccessRate,
      collectedRevenueChange: pct(collectedRevenue, prevCollected),
      emiChange: pct(emiOrders, prevEmi),
    };

    // Store failures
    const storeFailures = storePerformance.map((s: any) => ({
      name: s.name, city: s.city, failRate: s.failRate,
      total: s.orders,
      failed: Math.round(s.orders * s.failRate / 100),
    })).sort((a: any, b: any) => b.failRate - a.failRate);

    // Alerts
    const alerts = computeAlerts(
      paymentSuccessRate,
      { total: invTotal, outOfStock: invOOS, lowStock: invLow, healthyStock: invTotal - invOOS - invLow },
      monthlyRes.rows
    );

    res.json({
      totalOrders: Number(kpi.total_orders),
      confirmedOrders,
      gmv,
      collectedRevenue,
      emiOrders,
      paymentSuccessRate,
      activeStores: storePerformance.length,
      productsInCatalogue: invTotal,
      itemsInCart: cartCount,
      momComparison,
      monthlySeries: monthlyRes.rows.map((r: any) => ({
        month: r.month,
        totalSales: Number(r.total_sales),
        quantity: Number(r.quantity),
      })),
      storePerformance,
      orderFunnel: (() => {
        const confirmed   = Number(funnel.confirmed);
        const userDropped = Number(funnel.user_dropped);
        const failed      = Number(funnel.failed_count);
        // pending = everything confirmed that isn't success, dropped, or explicitly failed
        const pending     = Math.max(0, confirmed - paymentSuccess - userDropped - failed);
        return {
          total: Number(funnel.total),
          confirmed,
          paymentSuccess,
          userDropped,
          failed,
          pending,
          failedPending: failed + pending,
        };
      })(),
      paymentMethodBreakdown,
      paymentMethodSuccess,
      emiDetail,
      categorySales,
      brandData,
      alerts,
      storeFailures,
    });

  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({
      error: "Failed to compute metrics",
      detail: (err as Error).message
    });
  }
}

// ── Helpers ──────────────────────────────────────────────────

function getPreviousPeriod(filters: Filters): Filters {
  const from = new Date(filters.dateFrom);
  const to = new Date(filters.dateTo);
  const rangeDays = Math.round(
    (to.getTime() - from.getTime()) / 86400000
  );
  const prevEnd = new Date(from);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - rangeDays);
  return {
    ...filters,
    dateFrom: prevStart.toISOString().slice(0, 10),
    dateTo: prevEnd.toISOString().slice(0, 10),
  };
}

function computeAlerts(successRate: number, inv: any, monthly: any[]) {
  const alerts: any[] = [];
  if (successRate < 50) {
    alerts.push({
      id: "payment-rate", icon: "🚨",
      message: `Payment success rate is only ${successRate}% — needs attention`,
      severity: "red",
    });
  }
  if (inv.outOfStock > 0) {
    alerts.push({
      id: "oos", icon: "⚠️",
      message: `${inv.outOfStock} products are out of stock across stores`,
      severity: "amber",
    });
  }
  if (monthly.length >= 2) {
    const prev = monthly[monthly.length - 2];
    const cur = monthly[monthly.length - 1];
    const changePct = Number(prev.total_sales)
      ? Math.round(((Number(cur.total_sales) - Number(prev.total_sales))
          / Number(prev.total_sales)) * 100)
      : 0;
    if (changePct <= -20) {
      alerts.push({
        id: "revenue-drop", icon: "📉",
        message: `${cur.month} revenue dropped ${Math.abs(changePct)}% vs ${prev.month}`,
        severity: "red",
      });
    } else if (changePct > 0) {
      alerts.push({
        id: "revenue-growth", icon: "📈",
        message: `${cur.month} revenue grew ${changePct}% vs ${prev.month}`,
        severity: "green",
      });
    }
  }
  return alerts;
}

function emptyMetrics() {
  return {
    totalOrders: 0, confirmedOrders: 0, gmv: 0,
    collectedRevenue: 0, emiOrders: 0, paymentSuccessRate: 0,
    activeStores: 0, productsInCatalogue: 0, itemsInCart: 0,
    momComparison: {
      currentMonth: "", previousMonth: "",
      currentOrders: 0, previousOrders: 0,
      currentRevenue: 0, previousRevenue: 0,
      currentSuccessRate: 0, previousSuccessRate: 0,
      ordersChange: 0, revenueChange: 0, successRateChange: 0,
      collectedRevenueChange: 0, emiChange: 0,
    },
    monthlySeries: [], storePerformance: [],
    orderFunnel: {
      total: 0, confirmed: 0, paymentSuccess: 0,
      userDropped: 0, failed: 0, pending: 0, failedPending: 0,
    },
    paymentMethodBreakdown: [], paymentMethodSuccess: [],
    emiDetail: {
      count: 0, avgDownPayment: 0, avgLoanAmount: 0,
      totalDownPayment: 0, totalLoanAmount: 0,
      totalEmiRevenue: 0, avgEmiTicket: 0, avgNonEmiTicket: 0,
    },
    categorySales: [], brandData: [], alerts: [], storeFailures: [],
  };
}