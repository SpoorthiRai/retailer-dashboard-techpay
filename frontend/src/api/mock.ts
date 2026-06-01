// ============================================================
// MOCK DATA — May 2026
// • Stores: real names/IDs from MongoDB + 2 new Aadi Computech
// • Brands: HP, Lenovo, Dell, Apple, HyperX
// • All 3 Aadi Computech stores: 0% failure rate
// • Filters (state / city / store) aggregate live across stores
// ============================================================

import type {
  Filters,
  MetricsResponse,
  FilterOptionsResponse,
  RevenueBreakdownResponse,
  RevenueLineItem,
  InventoryResponse,
  StoreInfo,
  InventoryProduct,
} from "@/types/api.types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Store master list ───────────────────────────────────────────
// Real stores: IDs / names / coordinates verbatim from MongoDB.
// New stores (Sec 16, Sec 17): plausible IDs, same city / state.
export const STORES: StoreInfo[] = [
  { id: "694116c6cf680aaab0604138", name: "Hp India",                         city: "Chennai",   state: "Tamil Nadu",    status: "active", type: "RETAIL",           lat: 13.0843,        lng: 80.2705       },
  { id: "695f8530d0244722bf0ae1c9", name: "Getafix Technologies Pvt. Ltd.",   city: "Abhaneri",  state: "Rajasthan",     status: "active", type: "RETAIL",           lat: 25.0,           lng: 74.0          },
  { id: "696a144f36894b28bd39b18e", name: "HP Dam Products",                  city: "Gurugram",  state: "Haryana",       status: "active", type: "CLOUD_INVENTORY",  lat: 28.0,           lng: 77.0          },
  { id: "69750a2a5983846ed2bb4e7c", name: "Initiative Data Systems Pvt Ltd",  city: "Gurugram",  state: "Haryana",       status: "active", type: "RETAIL",           lat: 28.0,           lng: 77.0          },
  { id: "69796a9f54c43a3e763a968f", name: "AADI COMPUTECH - Sec -14",         city: "Gurgaon",   state: "Haryana",       status: "active", type: "RETAIL",           lat: 28.476757,      lng: 77.045593     },
  { id: "69799a9f54c43a3e763a9690", name: "AADI COMPUTECH - Sec 16",          city: "Gurgaon",   state: "Haryana",       status: "active", type: "RETAIL",           lat: 28.4782,        lng: 77.0726       },
  { id: "6979ba9f54c43a3e763a9691", name: "AADI COMPUTECH - Sec 17",          city: "Gurgaon",   state: "Haryana",       status: "active", type: "RETAIL",           lat: 28.4851,        lng: 77.0512       },
  { id: "6979fc3efb22023e701e38e9", name: "SUNRISE INFOTECH",                 city: "Sonipat",   state: "Haryana",       status: "active", type: "RETAIL",           lat: 28.992173,      lng: 77.020427     },
  { id: "697a06c8fb22023e701e3de2", name: "VS ELECTRONICS",                   city: "Delhi",     state: "Delhi",         status: "active", type: "RETAIL",           lat: 28.62969,       lng: 77.080599     },
  { id: "699eeafa68e46cfa4b7e17f8", name: "Asif Technologies",                city: "Bengaluru", state: "Karnataka",     status: "active", type: "RETAIL",           lat: 12.9738645396,  lng: 77.5594568396 },
  { id: "69e90ee51914179938d0588e", name: "Apple Store",                       city: "Ghaziabad", state: "Uttar Pradesh", status: "active", type: "RETAIL",           lat: 28.7798511273,  lng: 77.3001584272 },
];

// ── Per-store May 2026 data ─────────────────────────────────────
// 2 stores have 1 minor failure each → network KPI shows 99.99%.
// Sums:  totalOrders 241 · confirmed 241 · revenue 20215000
//        success 239 · dropped 1 · failed 1 · pending 0 (=241 ✓)
//        methods: cashfree 94 + zype 134 + offline 13 = 241 ✓
const PER_STORE = [
  // 1 user-dropped → failRate = 1/64 = 1.56%
  { storeId: "694116c6cf680aaab0604138", name: "Hp India",                         city: "Chennai",   state: "Tamil Nadu",    totalOrders: 64, confirmed: 64, revenue: 5520000, paymentSuccess: 63, userDropped: 1, failed: 0, emiOrders: 38, cashfreeOrders: 22, zyeOrders: 38, offlineOrders: 4,  payuOrders: 0, failRate: 1.56 },
  // 1 gateway failure → failRate = 1/51 = 1.96%
  { storeId: "69796a9f54c43a3e763a968f", name: "AADI COMPUTECH - Sec -14",         city: "Gurgaon",   state: "Haryana",       totalOrders: 51, confirmed: 51, revenue: 4420000, paymentSuccess: 50, userDropped: 0, failed: 1, emiOrders: 28, cashfreeOrders: 21, zyeOrders: 28, offlineOrders: 2,  payuOrders: 0, failRate: 1.96 },
  { storeId: "69799a9f54c43a3e763a9690", name: "AADI COMPUTECH - Sec 16",          city: "Gurgaon",   state: "Haryana",       totalOrders: 41, confirmed: 41, revenue: 3510000, paymentSuccess: 41, userDropped: 0, failed: 0, emiOrders: 22, cashfreeOrders: 18, zyeOrders: 22, offlineOrders: 1,  payuOrders: 0, failRate: 0 },
  { storeId: "6979ba9f54c43a3e763a9691", name: "AADI COMPUTECH - Sec 17",          city: "Gurgaon",   state: "Haryana",       totalOrders: 30, confirmed: 30, revenue: 2490000, paymentSuccess: 30, userDropped: 0, failed: 0, emiOrders: 16, cashfreeOrders: 12, zyeOrders: 16, offlineOrders: 2,  payuOrders: 0, failRate: 0 },
  { storeId: "69750a2a5983846ed2bb4e7c", name: "Initiative Data Systems Pvt Ltd",  city: "Gurugram",  state: "Haryana",       totalOrders: 15, confirmed: 15, revenue: 1170000, paymentSuccess: 15, userDropped: 0, failed: 0, emiOrders:  8, cashfreeOrders:  6, zyeOrders:  8, offlineOrders: 1,  payuOrders: 0, failRate: 0 },
  { storeId: "696a144f36894b28bd39b18e", name: "HP Dam Products",                  city: "Gurugram",  state: "Haryana",       totalOrders: 12, confirmed: 12, revenue:  980000, paymentSuccess: 12, userDropped: 0, failed: 0, emiOrders:  7, cashfreeOrders:  4, zyeOrders:  7, offlineOrders: 1,  payuOrders: 0, failRate: 0 },
  { storeId: "6979fc3efb22023e701e38e9", name: "SUNRISE INFOTECH",                 city: "Sonipat",   state: "Haryana",       totalOrders: 10, confirmed: 10, revenue:  720000, paymentSuccess: 10, userDropped: 0, failed: 0, emiOrders:  5, cashfreeOrders:  4, zyeOrders:  5, offlineOrders: 1,  payuOrders: 0, failRate: 0 },
  { storeId: "697a06c8fb22023e701e3de2", name: "VS ELECTRONICS",                   city: "Delhi",     state: "Delhi",         totalOrders:  8, confirmed:  8, revenue:  620000, paymentSuccess:  8, userDropped: 0, failed: 0, emiOrders:  4, cashfreeOrders:  3, zyeOrders:  4, offlineOrders: 1,  payuOrders: 0, failRate: 0 },
  { storeId: "699eeafa68e46cfa4b7e17f8", name: "Asif Technologies",                city: "Bengaluru", state: "Karnataka",     totalOrders:  5, confirmed:  5, revenue:  380000, paymentSuccess:  5, userDropped: 0, failed: 0, emiOrders:  3, cashfreeOrders:  2, zyeOrders:  3, offlineOrders: 0,  payuOrders: 0, failRate: 0 },
  { storeId: "69e90ee51914179938d0588e", name: "Apple Store",                       city: "Ghaziabad", state: "Uttar Pradesh", totalOrders:  3, confirmed:  3, revenue:  245000, paymentSuccess:  3, userDropped: 0, failed: 0, emiOrders:  2, cashfreeOrders:  1, zyeOrders:  2, offlineOrders: 0,  payuOrders: 0, failRate: 0 },
  { storeId: "695f8530d0244722bf0ae1c9", name: "Getafix Technologies Pvt. Ltd.",   city: "Abhaneri",  state: "Rajasthan",     totalOrders:  2, confirmed:  2, revenue:  160000, paymentSuccess:  2, userDropped: 0, failed: 0, emiOrders:  1, cashfreeOrders:  1, zyeOrders:  1, offlineOrders: 0,  payuOrders: 0, failRate: 0 },
];

// ── Date-range scaling ──────────────────────────────────────────
// Full-network GMV for each calendar month (basis = May 2026 = 1.0).
// Used to compute a dateRatio that scales all count/revenue metrics.
const MONTHLY_GMV: Record<string, number> = {
  '2025-09':  3800000, '2025-10':  4900000,
  '2025-11':  6185000, '2025-12': 10580000,
  '2026-01': 12635000, '2026-02':  8240000,
  '2026-03': 11505000, '2026-04': 14430000,
  '2026-05': 20215000,
  '2026-06': 18000000, // projected full month
};
const MAY_GMV = 20215000;

// Monthly series used for the trend chart (store-ratio scaled in the function)
const ALL_MONTH_SERIES = [
  { month: "Nov 2025", key: "2025-11", baseSales:  6185000, baseQty:  49 },
  { month: "Dec 2025", key: "2025-12", baseSales: 10580000, baseQty:  67 },
  { month: "Jan 2026", key: "2026-01", baseSales: 12635000, baseQty:  82 },
  { month: "Feb 2026", key: "2026-02", baseSales:  8240000, baseQty:  36 },
  { month: "Mar 2026", key: "2026-03", baseSales: 11505000, baseQty:  74 },
  { month: "Apr 2026", key: "2026-04", baseSales: 14430000, baseQty: 108 },
  { month: "May 2026", key: "2026-05", baseSales: 20215000, baseQty: 245 },
  { month: "Jun 2026", key: "2026-06", baseSales: 18000000, baseQty: 220 },
];

/** Fraction of a calendar month covered by [dateFrom, dateTo] (0–1). */
function monthCoverage(key: string, dateFrom: string, dateTo: string): number {
  const [y, m] = key.split('-').map(Number);
  const mStart = new Date(y, m - 1, 1);
  const mEnd   = new Date(y, m, 0);          // last day of month
  const from   = new Date(dateFrom + 'T00:00:00');
  const to     = new Date(dateTo   + 'T00:00:00');
  if (from > mEnd || to < mStart) return 0;
  const eStart = from > mStart ? from : mStart;
  const eEnd   = to   < mEnd   ? to   : mEnd;
  const covered = Math.round((eEnd.getTime() - eStart.getTime()) / 86400000) + 1;
  return Math.max(0, Math.min(1, covered / mEnd.getDate()));
}

/**
 * Returns the ratio of the selected date range's GMV to a full May 2026.
 * E.g. "This Year" (Jan–Jun) → ~3.35, "This Week" (1–2 days) → ~0.06.
 */
function computeDateRatio(dateFrom: string, dateTo: string): number {
  if (!dateFrom || !dateTo || dateFrom > dateTo) return 1.0;
  let gmv = 0;
  for (const [key, fullGmv] of Object.entries(MONTHLY_GMV)) {
    const cov = monthCoverage(key, dateFrom, dateTo);
    if (cov > 0) gmv += fullGmv * cov;
  }
  return gmv / MAY_GMV;
}

// Helper: match store against filters
function filterStores(filters: Filters) {
  const selStates  = filters.state.map(s => s.toLowerCase());
  const selCities  = filters.city.map(c => c.toLowerCase());
  const selStores  = filters.store.map(s => s.toLowerCase());
  return PER_STORE.filter(s => {
    if (selStores.length  && !selStores.includes(s.name.toLowerCase()))   return false;
    if (selCities.length  && !selCities.includes(s.city.toLowerCase()))   return false;
    if (selStates.length  && !selStates.includes(s.state.toLowerCase()))  return false;
    return true;
  });
}

// ── Filter Options (derived from STORES) ───────────────────────
export async function mockFetchFilterOptions(): Promise<FilterOptionsResponse> {
  await delay(100);
  const stateToCities: Record<string, string[]> = {};
  const cityToStores:  Record<string, string[]> = {};
  for (const s of STORES) {
    if (!stateToCities[s.state]) stateToCities[s.state] = [];
    if (!stateToCities[s.state].includes(s.city)) stateToCities[s.state].push(s.city);
    if (!cityToStores[s.city])  cityToStores[s.city]  = [];
    if (!cityToStores[s.city].includes(s.name))   cityToStores[s.city].push(s.name);
  }
  return {
    states: [...new Set(STORES.map(s => s.state))].sort(),
    cities: [...new Set(STORES.map(s => s.city))].sort(),
    stores: STORES.map(s => s.name).sort(),
    stateToCities,
    cityToStores,
  };
}

// ── Metrics — filter-aware + date-aware ────────────────────────
export async function mockFetchMetrics(
  filters: Filters,
  collectedRatio = 0.05,   // distributor default; retailer/store-manager pass 0.02
): Promise<MetricsResponse> {
  await delay(300);

  const sel = filterStores(filters);
  if (sel.length === 0) return emptyMetrics();

  // ── Base aggregates for the full May period (store filter only) ─
  const totalOrdersBase    = sel.reduce((s, r) => s + r.totalOrders,   0);
  const confirmedBase      = sel.reduce((s, r) => s + r.confirmed,     0);
  const revenueBase        = sel.reduce((s, r) => s + r.revenue,       0);
  const paySuccessBase     = sel.reduce((s, r) => s + r.paymentSuccess,0);
  const userDroppedBase    = sel.reduce((s, r) => s + r.userDropped,   0);
  const failedBase         = sel.reduce((s, r) => s + r.failed,        0);
  const emiOrdersBase      = sel.reduce((s, r) => s + r.emiOrders,     0);
  const cashfreeOrdersBase = sel.reduce((s, r) => s + r.cashfreeOrders,0);
  const zyeOrdersBase      = sel.reduce((s, r) => s + r.zyeOrders,     0);
  const offlineOrdersBase  = sel.reduce((s, r) => s + r.offlineOrders, 0);
  const payuOrdersBase     = sel.reduce((s, r) => s + r.payuOrders,    0);

  // ── Date scaling ───────────────────────────────────────────────
  const dateRatio = computeDateRatio(filters.dateFrom, filters.dateTo);
  if (dateRatio === 0) return emptyMetrics();
  const sc = (n: number) => Math.max(0, Math.round(n * dateRatio));

  const totalOrders    = sc(totalOrdersBase);
  const confirmed      = sc(confirmedBase);
  const revenue        = sc(revenueBase);
  const paymentSuccess = sc(paySuccessBase);
  const userDropped    = sc(userDroppedBase);
  const failed         = sc(failedBase);
  const emiOrders      = sc(emiOrdersBase);
  const cashfreeOrders = sc(cashfreeOrdersBase);
  const zyeOrders      = sc(zyeOrdersBase);
  const offlineOrders  = sc(offlineOrdersBase);
  const payuOrders     = sc(payuOrdersBase);

  const pending         = Math.max(0, confirmed - paymentSuccess - userDropped - failed);
  const collected       = Math.round(revenue * collectedRatio);
  const successRate     = 99.99;
  const cashfreeSuccess = Math.max(0, paymentSuccess - zyeOrders - offlineOrders);

  // ── MoM: compare selected period vs same-length prior period ──
  const fromDate = new Date((filters.dateFrom || '2026-05-01') + 'T00:00:00');
  const toDate   = new Date((filters.dateTo   || '2026-05-31') + 'T00:00:00');
  const duration = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000);
  const prevTo   = new Date(fromDate); prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);   prevFrom.setDate(prevFrom.getDate() - duration);
  const prevRatio = computeDateRatio(
    prevFrom.toISOString().slice(0, 10),
    prevTo.toISOString().slice(0, 10),
  );

  const prevRevenue   = Math.round(revenueBase    * prevRatio);
  const prevConfirmed = Math.round(confirmedBase  * prevRatio);
  const prevEmi       = Math.round(emiOrdersBase  * prevRatio);
  const prevCollected   = Math.round(revenueBase * prevRatio * collectedRatio);
  const prevSuccessRate = 97;

  const pct = (cur: number, prev: number) =>
    prev > 0 ? Math.round(((cur - prev) / prev) * 100) : 0;

  // ── Store performance (date-scaled) ───────────────────────────
  const storePerformance = sel
    .map(r => {
      const storeInfo = STORES.find(s => s.id === r.storeId);
      return {
        storeId: r.storeId, name: r.name, city: r.city, state: r.state,
        orders:   sc(r.confirmed), revenue: sc(r.revenue),
        status: "active" as const, failRate: r.failRate,
        totalOrders:     sc(r.totalOrders),
        paymentSuccess:  sc(r.paymentSuccess),
        collectedRevenue: Math.round(sc(r.revenue) * collectedRatio),
        userDropped: sc(r.userDropped),
        failed:      sc(r.failed),
        emiOrders:   sc(r.emiOrders),
        cashfreeOrders: sc(r.cashfreeOrders),
        zyeOrders:   sc(r.zyeOrders),
        offlineOrders: sc(r.offlineOrders),
        storeType: storeInfo?.type ?? 'RETAIL',
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // ── Store failures ─────────────────────────────────────────────
  const storeFailures = sel
    .filter(r => r.failRate > 0)
    .sort((a, b) => b.failRate - a.failRate)
    .map(r => ({
      name: r.name, city: r.city,
      failRate: r.failRate,
      total:  sc(r.confirmed),
      failed: sc(Math.round(r.confirmed * r.failRate / 100)),
    }));

  // ── Category / brand (scale by full revRatio = store + date) ──
  const revRatio = revenue / 20215000;
  const categorySales = [
    { name: "Laptops",     value: Math.round(128 * revRatio), revenue: Math.round(15790000 * revRatio), percentage: 78.1, color: "#1A8C7A" },
    { name: "Desktops",    value: Math.round( 28 * revRatio), revenue: Math.round( 2790000 * revRatio), percentage: 13.8, color: "#2E86C1" },
    { name: "Printers",    value: Math.round( 28 * revRatio), revenue: Math.round( 1251000 * revRatio), percentage:  6.2, color: "#E67E22" },
    { name: "Accessories", value: Math.round( 57 * revRatio), revenue: Math.round(  384000 * revRatio), percentage:  1.9, color: "#4A235A" },
  ];
  const brandData = [
    { name: "HP",     productCount: 280, revenue: Math.round(12836000 * revRatio) },
    { name: "Lenovo", productCount: 150, revenue: Math.round( 3598000 * revRatio) },
    { name: "Dell",   productCount:  80, revenue: Math.round( 1799000 * revRatio) },
    { name: "Apple",  productCount:  45, revenue: Math.round( 1537000 * revRatio) },
    { name: "HyperX", productCount:  71, revenue: Math.round(  445000 * revRatio) },
  ];

  // ── Monthly series — only months covered by the date range ────
  const storeRevRatio = revenueBase / 20215000;
  const monthlySeries = ALL_MONTH_SERIES
    .map(m => ({ ...m, cov: monthCoverage(m.key, filters.dateFrom, filters.dateTo) }))
    .filter(m => m.cov > 0)
    .map(m => ({
      month: m.month,
      totalSales: Math.round(m.baseSales * storeRevRatio * m.cov),
      quantity:   Math.round(m.baseQty   * storeRevRatio * m.cov),
    }));

  // ── Alerts ─────────────────────────────────────────────────────
  const alerts = [];
  if (successRate >= 97) {
    alerts.push({ id: "success", icon: "🏆", message: `Payment success rate at ${successRate}% across ${sel.length} store${sel.length > 1 ? "s" : ""} — strong performance`, severity: "green" as const });
  }
  if (confirmed > 0 && emiOrders / confirmed >= 0.5) {
    alerts.push({ id: "emi", icon: "📈", message: `EMI / BNPL at ${emiOrders} orders (${Math.round(emiOrders / confirmed * 100)}%) — strong loan book growth`, severity: "green" as const });
  }
  const worstStore = [...sel].sort((a, b) => b.failRate - a.failRate)[0];
  if (worstStore && worstStore.failRate >= 5) {
    alerts.push({ id: "failure", icon: "⚠️", message: `${worstStore.name} has ${worstStore.failRate}% payment failure rate — review transaction logs`, severity: "amber" as const });
  }
  if (alerts.length < 2) {
    alerts.push({ id: "rev", icon: "💰", message: `GMV ₹${(revenue / 1e7).toFixed(2)} Cr for selected period`, severity: "green" as const });
  }

  return {
    totalOrders,
    confirmedOrders: confirmed,
    gmv: revenue,
    collectedRevenue: collected,
    emiOrders,
    paymentSuccessRate: successRate,
    activeStores: sel.length,
    productsInCatalogue: 641,
    itemsInCart: 11,

    momComparison: {
      currentMonth:  toDate.toISOString().slice(0, 10),
      previousMonth: prevTo.toISOString().slice(0, 10),
      currentOrders:   confirmed,    previousOrders:   prevConfirmed,
      currentRevenue:  revenue,      previousRevenue:  prevRevenue,
      currentSuccessRate: successRate, previousSuccessRate: prevSuccessRate,
      ordersChange:          pct(confirmed,  prevConfirmed),
      revenueChange:         pct(revenue,    prevRevenue),
      successRateChange:     Math.round((successRate - prevSuccessRate) * 100) / 100,
      collectedRevenueChange: pct(collected, prevCollected),
      emiChange:             pct(emiOrders,  prevEmi),
    },

    monthlySeries,
    storePerformance,

    orderFunnel: {
      total: totalOrders, confirmed, paymentSuccess, userDropped, failed, pending,
      failedPending: failed + pending,
    },

    paymentMethodBreakdown: [
      ...(zyeOrders     > 0 ? [{ name: "CASHFREE_ZYPE", label: "Cashfree Zype (EMI/BNPL)", count: zyeOrders,     color: "#4A235A" }] : []),
      ...(cashfreeOrders > 0 ? [{ name: "CASHFREE",     label: "Cashfree",                  count: cashfreeOrders, color: "#2E86C1" }] : []),
      ...(offlineOrders  > 0 ? [{ name: "OFFLINE",      label: "Offline",                   count: offlineOrders,  color: "#1A8C7A" }] : []),
      ...(payuOrders     > 0 ? [{ name: "PAYU",         label: "PayU",                       count: payuOrders,     color: "#E67E22" }] : []),
    ],

    paymentMethodSuccess: [
      ...(zyeOrders      > 0 ? [{ method: "CASHFREE_ZYPE", label: "Cashfree Zype (EMI/BNPL)", success: zyeOrders,     total: zyeOrders,     rate: 100 }] : []),
      ...(offlineOrders  > 0 ? [{ method: "OFFLINE",       label: "Offline",                  success: offlineOrders, total: offlineOrders, rate: 100 }] : []),
      ...(cashfreeOrders > 0 ? [{ method: "CASHFREE",      label: "Cashfree",                 success: cashfreeSuccess, total: cashfreeOrders, rate: Math.round(cashfreeSuccess / cashfreeOrders * 100) }] : []),
      ...(payuOrders     > 0 ? [{ method: "PAYU",          label: "PayU",                     success: 0,             total: payuOrders,    rate: 0 }] : []),
    ],

    emiDetail: {
      count: emiOrders,
      avgDownPayment:   19000,
      avgLoanAmount:    76000,
      totalDownPayment: emiOrders * 19000,
      totalLoanAmount:  emiOrders * 76000,
      totalEmiRevenue:  emiOrders * 95000,
      avgEmiTicket:     95000,
      avgNonEmiTicket:  66000,
    },

    categorySales,
    brandData,
    alerts,
    storeFailures,
  };
}

function emptyMetrics(): MetricsResponse {
  return {
    totalOrders: 0, confirmedOrders: 0, gmv: 0, collectedRevenue: 0,
    emiOrders: 0, paymentSuccessRate: 0, activeStores: 0,
    productsInCatalogue: 0, itemsInCart: 0,
    momComparison: { currentMonth: "2026-05-01", previousMonth: "2026-04-01", currentOrders: 0, previousOrders: 0, currentRevenue: 0, previousRevenue: 0, currentSuccessRate: 0, previousSuccessRate: 0, ordersChange: 0, revenueChange: 0, successRateChange: 0, collectedRevenueChange: 0, emiChange: 0 },
    monthlySeries: [], storePerformance: [],
    orderFunnel: { total: 0, confirmed: 0, paymentSuccess: 0, userDropped: 0, failed: 0, pending: 0, failedPending: 0 },
    paymentMethodBreakdown: [], paymentMethodSuccess: [],
    emiDetail: { count: 0, avgDownPayment: 0, avgLoanAmount: 0, totalDownPayment: 0, totalLoanAmount: 0, totalEmiRevenue: 0, avgEmiTicket: 0, avgNonEmiTicket: 0 },
    categorySales: [], brandData: [], alerts: [], storeFailures: [],
  };
}

// ── Store Locations ─────────────────────────────────────────────
export async function mockFetchStores(): Promise<StoreInfo[]> {
  await delay(100);
  return STORES;
}

// ── Inventory — per store, multi-brand ─────────────────────────
// Low stock: qty 1–9  |  Out of stock: qty 0
// Product names verbatim from mongo__inventories_joined download
// where available; new stores use consistent naming conventions.
const ALL_INVENTORY: InventoryProduct[] = [
  // ── Hp India — Chennai ────────────────────────────────────────────────────────────────────────────
  { product: "HP Laptop 35.6 cm (14) 14-ep0342TU, Silver",                                          category: "Laptops",     brand: "HP",     quantity: 40,  storeName: "Hp India" },
  { product: "HP Laptop 35.6 cm (14) 14-ep1150TU, Silver",                                          category: "Laptops",     brand: "HP",     quantity: 97,  storeName: "Hp India" },
  { product: "HP Victus 39.6 cm (15.6) Gaming Laptop 15-fa2309TX, Silver",                          category: "Laptops",     brand: "HP",     quantity: 72,  storeName: "Hp India" },
  { product: "HP OmniBook X Flip 14-fm0100TU Next Gen AI PC, Blue",                                 category: "Laptops",     brand: "HP",     quantity: 91,  storeName: "Hp India" },
  { product: "HP Pavilion Plus 35.6 cm (14) Laptop 14-ew0108TU, Blue",                              category: "Laptops",     brand: "HP",     quantity: 40,  storeName: "Hp India" },
  { product: "HP ProBook 440 35.6 cm (14) G11 Business Laptop PC, Silver",                          category: "Laptops",     brand: "HP",     quantity: 41,  storeName: "Hp India" },
  { product: "HP ZBook 8 G1i 35.6 cm (14) Mobile Workstation PC, Silver",                           category: "Laptops",     brand: "HP",     quantity: 51,  storeName: "Hp India" },
  { product: "HP OmniBook 5 Next Gen AI 16-ag1046AU, Silver",                                       category: "Laptops",     brand: "HP",     quantity: 96,  storeName: "Hp India" },
  { product: "HP OMEN Gaming Laptop 16-am0239TX, Black",                                             category: "Laptops",     brand: "HP",     quantity: 95,  storeName: "Hp India" },
  { product: "HP OmniStudio X All-in-One 32-c1574in Next Gen AI Desktop PC",                        category: "Desktops",    brand: "HP",     quantity: 74,  storeName: "Hp India" },
  { product: "HP Pro Tower 280 G9 PCI Desktop PC",                                                  category: "Desktops",    brand: "HP",     quantity: 84,  storeName: "Hp India" },
  { product: "HP ProDesk 2 Tower G1a Desktop AI PC",                                                category: "Desktops",    brand: "HP",     quantity: 93,  storeName: "Hp India" },
  { product: "HP ProOne 440 G9 60.5 cm (23.8) All-in-One Desktop PC",                               category: "Desktops",    brand: "HP",     quantity: 93,  storeName: "Hp India" },
  { product: "HP Smart Tank 750 Wi Fi All-in-One Printer Duplexer with ADF and Smart Guided Button", category: "Printers",   brand: "HP",     quantity: 68,  storeName: "Hp India" },
  { product: "Ink Advantage 2876 Printer, Copy, Scan, WiFi, Bluetooth, USB, Simple Setup Smart App, Ideal for Home", category: "Printers", brand: "HP", quantity: 94, storeName: "Hp India" },
  { product: "HP LaserJet Pro MFP 4104dw Printer",                                                  category: "Printers",    brand: "HP",     quantity: 74,  storeName: "Hp India" },
  { product: "HP LaserJet MFP M233sdw Printer",                                                     category: "Printers",    brand: "HP",     quantity: 47,  storeName: "Hp India" },
  { product: "HP Smart Tank 675 Wi Fi All-in-One Printer Duplexer",                                 category: "Printers",    brand: "HP",     quantity: 78,  storeName: "Hp India" },
  { product: "HP KM260 Wireless Mouse and Keyboard Combo",                                           category: "Accessories", brand: "HP",     quantity: 85,  storeName: "Hp India" },
  { product: "HP 230 Wireless Mouse and Keyboard Combo",                                             category: "Accessories", brand: "HP",     quantity: 72,  storeName: "Hp India" },
  { product: "HyperX CloudX Stinger 2 Core (Black)",                                                category: "Accessories", brand: "HyperX", quantity: 94,  storeName: "Hp India" },
  { product: "HP KM160 Wired Mouse and Keyboard Combo",                                             category: "Accessories", brand: "HP",     quantity: 49,  storeName: "Hp India" },
  { product: "HP GK400Y Mechanical Gaming Keyboard",                                                 category: "Accessories", brand: "HP",     quantity: 69,  storeName: "Hp India" },
  { product: "HP 480 Comfort Bluetooth Mouse",                                                       category: "Accessories", brand: "HP",     quantity: 95,  storeName: "Hp India" },
  { product: "HP M10 Wired Mouse",                                                                   category: "Accessories", brand: "HP",     quantity: 95,  storeName: "Hp India" },
  { product: "HP Z3700 Silver Wireless Mouse",                                                       category: "Accessories", brand: "HP",     quantity: 96,  storeName: "Hp India" },
  // Lenovo at Hp India
  { product: "ThinkBook 14 - AMD Ryzen 5, 16 GB RAM, 512 SSD, Win 11 Home",                        category: "Laptops",     brand: "Lenovo", quantity: 22,  storeName: "Hp India" },
  { product: "IdeaPad Slim 5 Gen 10",                                                               category: "Laptops",     brand: "Lenovo", quantity: 18,  storeName: "Hp India" },
  { product: "ThinkPad E14 Gen 4 (Intel Core i5 / 16GB / 512GB)",                                  category: "Laptops",     brand: "Lenovo", quantity: 15,  storeName: "Hp India" },
  // Dell at Hp India
  { product: "Dell Inspiron 15 3511 (i5/16GB/512GB)",                                              category: "Laptops",     brand: "Dell",   quantity: 12,  storeName: "Hp India" },
  { product: "Dell XPS 13 9305 (i7/16GB/512GB SSD)",                                               category: "Laptops",     brand: "Dell",   quantity:  8,  storeName: "Hp India" },  // low stock
  { product: "Dell OptiPlex 7010 Tower Desktop",                                                    category: "Desktops",    brand: "Dell",   quantity: 14,  storeName: "Hp India" },
  // Apple at Hp India
  { product: "Apple MacBook Air 13-inch M3",                                                        category: "Laptops",     brand: "Apple",  quantity:  6,  storeName: "Hp India" },  // low stock
  { product: "Apple MacBook Pro 14-inch M3 Pro",                                                    category: "Laptops",     brand: "Apple",  quantity:  4,  storeName: "Hp India" },  // low stock
  { product: "Apple Magic Keyboard with Touch ID",                                                  category: "Accessories", brand: "Apple",  quantity: 20,  storeName: "Hp India" },

  // ── AADI COMPUTECH - Sec -14 — Gurgaon ───────────────────────────────────────────────────────────
  { product: "HP Spectre x360 2-in-1 Laptop 14-ef0053TU Bundle (6K7X3PA), Nightfall black aluminum", category: "Laptops",   brand: "HP",     quantity: 22,  storeName: "AADI COMPUTECH - Sec -14" },
  { product: "Victus Gaming Laptop 15-fa0351TX (6N029PA)",                                          category: "Laptops",     brand: "HP",     quantity: 18,  storeName: "AADI COMPUTECH - Sec -14" },
  { product: "HP DeskJet Ink Advantage 2776 All-in-One Printer (7FR27B)",                           category: "Printers",    brand: "HP",     quantity: 28,  storeName: "AADI COMPUTECH - Sec -14" },
  { product: "ThinkBook 14 - AMD Ryzen 5, 16 GB RAM, 512 SSD, Win 11 Home",                        category: "Laptops",     brand: "Lenovo", quantity: 16,  storeName: "AADI COMPUTECH - Sec -14" },
  { product: "IdeaPad Slim 5 Gen 10",                                                               category: "Laptops",     brand: "Lenovo", quantity: 12,  storeName: "AADI COMPUTECH - Sec -14" },
  { product: "Dell Inspiron 15 3511 (i5/16GB/512GB)",                                              category: "Laptops",     brand: "Dell",   quantity:  8,  storeName: "AADI COMPUTECH - Sec -14" },  // low stock
  { product: "Apple MacBook Air 13-inch M3",                                                        category: "Laptops",     brand: "Apple",  quantity:  3,  storeName: "AADI COMPUTECH - Sec -14" },  // low stock
  { product: "HP KM260 Wireless Mouse and Keyboard Combo",                                           category: "Accessories", brand: "HP",     quantity: 32,  storeName: "AADI COMPUTECH - Sec -14" },

  // ── AADI COMPUTECH - Sec 16 — Gurgaon (NEW) ──────────────────────────────────────────────────────
  { product: "HP OMEN Gaming Laptop 16-am0239TX, Black",                                             category: "Laptops",     brand: "HP",     quantity: 14,  storeName: "AADI COMPUTECH - Sec 16" },
  { product: "HP Victus 39.6 cm (15.6) Gaming Laptop 15-fa2309TX, Silver",                          category: "Laptops",     brand: "HP",     quantity: 18,  storeName: "AADI COMPUTECH - Sec 16" },
  { product: "HP ProBook 440 35.6 cm (14) G11 Business Laptop PC, Silver",                          category: "Laptops",     brand: "HP",     quantity: 20,  storeName: "AADI COMPUTECH - Sec 16" },
  { product: "Lenovo LOQ Gen 9",                                                                     category: "Laptops",     brand: "Lenovo", quantity: 15,  storeName: "AADI COMPUTECH - Sec 16" },
  { product: "ThinkPad E14 Gen 4 (Intel Core i5 / 16GB / 512GB)",                                  category: "Laptops",     brand: "Lenovo", quantity: 10,  storeName: "AADI COMPUTECH - Sec 16" },
  { product: "Dell XPS 13 9305 (i7/16GB/512GB SSD)",                                               category: "Laptops",     brand: "Dell",   quantity:  7,  storeName: "AADI COMPUTECH - Sec 16" },  // low stock
  { product: "Apple MacBook Pro 14-inch M3 Pro",                                                    category: "Laptops",     brand: "Apple",  quantity:  0,  storeName: "AADI COMPUTECH - Sec 16" },  // out of stock
  { product: "HP LaserJet Pro MFP 4104dw Printer",                                                  category: "Printers",    brand: "HP",     quantity: 22,  storeName: "AADI COMPUTECH - Sec 16" },
  { product: "HP KM260 Wireless Mouse and Keyboard Combo",                                           category: "Accessories", brand: "HP",     quantity: 35,  storeName: "AADI COMPUTECH - Sec 16" },
  { product: "HyperX CloudX Stinger 2 Core (Black)",                                                category: "Accessories", brand: "HyperX", quantity: 24,  storeName: "AADI COMPUTECH - Sec 16" },

  // ── AADI COMPUTECH - Sec 17 — Gurgaon (NEW) ──────────────────────────────────────────────────────
  { product: "HP OmniBook X Flip 14-fm0100TU Next Gen AI PC, Blue",                                 category: "Laptops",     brand: "HP",     quantity: 12,  storeName: "AADI COMPUTECH - Sec 17" },
  { product: "HP Pavilion Plus 35.6 cm (14) Laptop 14-ew0108TU, Blue",                              category: "Laptops",     brand: "HP",     quantity: 16,  storeName: "AADI COMPUTECH - Sec 17" },
  { product: "Lenovo LOQ Gen 9",                                                                     category: "Laptops",     brand: "Lenovo", quantity: 10,  storeName: "AADI COMPUTECH - Sec 17" },
  { product: "ThinkBook 14 - AMD Ryzen 5, 16 GB RAM, 512 SSD, Win 11 Home",                        category: "Laptops",     brand: "Lenovo", quantity:  6,  storeName: "AADI COMPUTECH - Sec 17" },  // low stock
  { product: "Dell Latitude 5440 Business Laptop (i5/16GB/256GB SSD)",                             category: "Laptops",     brand: "Dell",   quantity:  5,  storeName: "AADI COMPUTECH - Sec 17" },  // low stock
  { product: "HP Smart Tank 675 Wi Fi All-in-One Printer Duplexer",                                 category: "Printers",    brand: "HP",     quantity: 15,  storeName: "AADI COMPUTECH - Sec 17" },
  { product: "HP 480 Comfort Bluetooth Mouse",                                                       category: "Accessories", brand: "HP",     quantity:  0,  storeName: "AADI COMPUTECH - Sec 17" },  // out of stock
  { product: "Apple iPad Pro M4 11-inch Wi-Fi",                                                     category: "Accessories", brand: "Apple",  quantity:  9,  storeName: "AADI COMPUTECH - Sec 17" },  // low stock

  // ── SUNRISE INFOTECH — Sonipat ────────────────────────────────────────────────────────────────────
  { product: "3E3R6PA - HP Pavilion Gaming Laptop 15-ec2008AX",                                     category: "Laptops",     brand: "HP",     quantity: 18,  storeName: "SUNRISE INFOTECH" },
  { product: "HP Envy x360 2-in-1 Laptop 13-bf0085TU (726X6PA)",                                   category: "Laptops",     brand: "HP",     quantity: 16,  storeName: "SUNRISE INFOTECH" },
  { product: "HP DeskJet Ink Advantage 2776 All-in-One Printer (7FR27B)",                           category: "Printers",    brand: "HP",     quantity: 32,  storeName: "SUNRISE INFOTECH" },
  { product: "HP M10 Wired Mouse",                                                                   category: "Accessories", brand: "HP",     quantity: 50,  storeName: "SUNRISE INFOTECH" },
  { product: "Dell Inspiron 15 3511 (i5/16GB/512GB)",                                              category: "Laptops",     brand: "Dell",   quantity:  4,  storeName: "SUNRISE INFOTECH" },  // low stock

  // ── Initiative Data Systems Pvt Ltd — Gurugram ───────────────────────────────────────────────────
  { product: "HP Spectre x360 2-in-1 Laptop 14-ef0052TU (6K802PA)",                                category: "Laptops",     brand: "HP",     quantity: 14,  storeName: "Initiative Data Systems Pvt Ltd" },
  { product: "HP Envy x360 2-in-1 Laptop 13-bf0085TU (726X6PA)",                                   category: "Laptops",     brand: "HP",     quantity: 12,  storeName: "Initiative Data Systems Pvt Ltd" },
  { product: "IdeaPad Slim 5 Gen 10",                                                               category: "Laptops",     brand: "Lenovo", quantity:  9,  storeName: "Initiative Data Systems Pvt Ltd" },  // low stock
  { product: "Apple MacBook Air 13-inch M3",                                                        category: "Laptops",     brand: "Apple",  quantity:  2,  storeName: "Initiative Data Systems Pvt Ltd" },  // low stock
  { product: "HP M10 Wired Mouse",                                                                   category: "Accessories", brand: "HP",     quantity:  8,  storeName: "Initiative Data Systems Pvt Ltd" },  // low stock
];

export async function mockFetchInventory(storeNames?: string[]): Promise<InventoryResponse> {
  await delay(200);
  const products = storeNames && storeNames.length > 0
    ? ALL_INVENTORY.filter(p => storeNames.includes(p.storeName))
    : ALL_INVENTORY;

  const total      = products.length;
  const outOfStock = products.filter(p => p.quantity === 0).length;
  const lowStock   = products.filter(p => p.quantity >= 1 && p.quantity <= 9).length;
  return { products, summary: { total, outOfStock, lowStock, healthyStock: total - outOfStock - lowStock } };
}

// ── Revenue Breakdown ───────────────────────────────────────────
// Products cycled per payment method to keep the list realistic
const RB_PRODUCTS_ZYE = [
  { name: "HP OmniBook 5 Next Gen AI 16-ag1046AU, Silver",                    price: 119990 },
  { name: "HP Spectre x360 2-in-1 Laptop 14-ef0053TU Bundle, Nightfall black", price: 154990 },
  { name: "HP OMEN Gaming Laptop 16-am0239TX, Black",                          price: 134990 },
  { name: "HP OmniBook X Flip 14-fm0100TU Next Gen AI PC, Blue",               price: 104990 },
  { name: "HP ZBook 8 G1i 14 Mobile Workstation PC, Silver",                   price: 124990 },
  { name: "ThinkBook 14 - AMD Ryzen 5, 16 GB RAM, 512 SSD, Win 11 Home",      price:  72990 },
  { name: "HP Envy x360 2-in-1 Laptop 13-bf0085TU",                            price:  99990 },
  { name: "Apple MacBook Air 13-inch M3",                                       price: 114990 },
  { name: "Apple MacBook Pro 14-inch M3 Pro",                                   price: 179990 },
  { name: "HP OmniStudio X All-in-One 32-c1574in Next Gen AI Desktop PC",      price: 112990 },
  { name: "HP Pavilion Plus Laptop 14-ew0108TU, Blue",                         price:  89990 },
  { name: "Lenovo LOQ Gen 9",                                                   price:  89990 },
  { name: "ThinkPad E14 Gen 4 (Intel Core i5 / 16GB / 512GB)",                price:  94990 },
  { name: "IdeaPad Slim 5 Gen 10",                                              price:  54990 },
];
const RB_PRODUCTS_CF = [
  { name: "HP ProBook 440 14 G11 Business Laptop PC, Silver",  price:  68990 },
  { name: "Dell Inspiron 15 3511 (i5/16GB/512GB)",             price:  64990 },
  { name: "Dell XPS 13 9305 (i7/16GB/512GB SSD)",              price:  94990 },
  { name: "Lenovo IdeaPad 3 15IAU7",                            price:  49990 },
  { name: "Apple MacBook Air 13-inch M3",                       price: 114990 },
  { name: "HP Smart Tank 750 Wi-Fi All-in-One Printer",         price:  24990 },
  { name: "HP LaserJet MFP 135a Printer",                       price:  19990 },
  { name: "HyperX Cloud Alpha Wireless Gaming Headset",         price:  14990 },
];
const RB_PRODUCTS_OFFLINE = [
  { name: "HP KM260 Wireless Mouse and Keyboard Combo",  price:  2990 },
  { name: "HP Smart Tank 580 Wi-Fi Printer",             price: 16990 },
  { name: "HyperX Cloud II Gaming Headset",              price:  8990 },
  { name: "HP LaserJet Pro M404n Printer",               price: 22990 },
  { name: "Lenovo IdeaPad 3 15IAU7",                     price: 49990 },
];
const RB_CUSTOMERS = [
  { name: "Arjun Mehta",      phone: "+91 98201 34567" },
  { name: "Priya Sharma",     phone: "+91 97345 67890" },
  { name: "Rahul Singh",      phone: "+91 96543 21098" },
  { name: "Sneha Iyer",       phone: "+91 95678 12345" },
  { name: "Vikram Nair",      phone: "+91 94321 09876" },
  { name: "Ananya Joshi",     phone: "+91 93456 78901" },
  { name: "Rohan Gupta",      phone: "+91 92567 89012" },
  { name: "Kavya Reddy",      phone: "+91 91678 90123" },
  { name: "Aditya Verma",     phone: "+91 90789 01234" },
  { name: "Meera Pillai",     phone: "+91 89012 34567" },
  { name: "Siddharth Kumar",  phone: "+91 88123 45678" },
  { name: "Ishaan Patel",     phone: "+91 87234 56789" },
  { name: "Divya Malhotra",   phone: "+91 86345 67890" },
  { name: "Karthik Rao",      phone: "+91 85456 78901" },
  { name: "Riya Agarwal",     phone: "+91 84567 89012" },
  { name: "Arnav Bose",       phone: "+91 83678 90123" },
  { name: "Pooja Shah",       phone: "+91 82789 01234" },
  { name: "Nikhil Tiwari",    phone: "+91 81890 12345" },
  { name: "Anika Choudhury",  phone: "+91 80901 23456" },
  { name: "Tanvi Bhatt",      phone: "+91 79012 34567" },
  { name: "Harsh Saxena",     phone: "+91 78123 45678" },
  { name: "Shriya Nambiar",   phone: "+91 77234 56789" },
  { name: "Manav Chopra",     phone: "+91 76345 67890" },
  { name: "Varun Menon",      phone: "+91 75456 78901" },
  { name: "Naina Bhatnagar",  phone: "+91 74567 89012" },
  { name: "Deepak Jain",      phone: "+91 73678 90123" },
  { name: "Sunita Rao",       phone: "+91 72789 01234" },
  { name: "Mohit Sharma",     phone: "+91 71890 12345" },
  { name: "Preethi Nair",     phone: "+91 70901 23456" },
  { name: "Suresh Kumar",     phone: "+91 69012 34567" },
];
const RB_STORE_PREFIX: Record<string, string> = {
  "694116c6cf680aaab0604138": "HPITNCHE",
  "695f8530d0244722bf0ae1c9": "GTXABH",
  "696a144f36894b28bd39b18e": "HPDAMGUR",
  "69750a2a5983846ed2bb4e7c": "IDSGUR",
  "69796a9f54c43a3e763a968f": "AADHRGUR",
  "69799a9f54c43a3e763a9690": "AAD16GUR",
  "6979ba9f54c43a3e763a9691": "AAD17GUR",
  "6979fc3efb22023e701e38e9": "SUNHRSON",
  "697a06c8fb22023e701e3de2": "VSDEL",
  "699eeafa68e46cfa4b7e17f8": "ASIFBNG",
  "69e90ee51914179938d0588e": "APPLEGHZ",
};

export async function mockFetchRevenueBreakdown(
  filters: Filters,
  type: 'collected' | 'gmv' = 'collected',
): Promise<RevenueBreakdownResponse> {
  await delay(200);

  const sel = filterStores(filters);
  if (sel.length === 0) return { items: [], total: 0 };

  const items: RevenueLineItem[] = [];
  let seq = 1;
  let custIdx = 0;
  let dayIdx = 0;

  for (const store of sel) {
    const prefix = RB_STORE_PREFIX[store.storeId] ?? "STORE";
    const cashfreeSuccess = Math.max(0, store.paymentSuccess - store.zyeOrders - store.offlineOrders);

    type Slot = { products: typeof RB_PRODUCTS_ZYE; method: string; status: string; count: number };
    const slots: Slot[] = type === 'gmv'
      ? [
          { products: RB_PRODUCTS_ZYE,     method: "Cashfree Zype (EMI)", status: "Success",      count: store.zyeOrders      },
          { products: RB_PRODUCTS_CF,      method: "Cashfree",            status: "Success",      count: cashfreeSuccess      },
          { products: RB_PRODUCTS_OFFLINE, method: "Offline",             status: "Success",      count: store.offlineOrders  },
          { products: RB_PRODUCTS_CF,      method: "Cashfree",            status: "Failed",       count: store.failed         },
          { products: RB_PRODUCTS_CF,      method: "Cashfree",            status: "User Dropped", count: store.userDropped    },
        ]
      : [
          { products: RB_PRODUCTS_ZYE,     method: "Cashfree Zype (EMI)", status: "Success", count: store.zyeOrders     },
          { products: RB_PRODUCTS_CF,      method: "Cashfree",            status: "Success", count: cashfreeSuccess     },
          { products: RB_PRODUCTS_OFFLINE, method: "Offline",             status: "Success", count: store.offlineOrders },
        ];

    for (const slot of slots) {
      for (let i = 0; i < slot.count; i++) {
        const prod = slot.products[seq % slot.products.length];
        const cust = RB_CUSTOMERS[custIdx % RB_CUSTOMERS.length];
        const day  = String(1 + (dayIdx % 30)).padStart(2, '0');
        items.push({
          orderId: `${prefix}${String(seq).padStart(6, '0')}`,
          date: `2026-05-${day}`,
          customer: cust.name,
          phone: cust.phone,
          city: store.city,
          state: store.state,
          store: store.name,
          product: prod.name,
          qty: 1,
          unitPrice: prod.price,
          paymentMethod: slot.method,
          amount: prod.price,
          ...(type === 'gmv' && { paymentStatus: slot.status }),
        });
        seq++; custIdx++; dayIdx++;
      }
    }
  }

  items.sort((a, b) => a.date.localeCompare(b.date));
  const total = items.reduce((s, it) => s + it.amount, 0);
  return { items, total };
}
