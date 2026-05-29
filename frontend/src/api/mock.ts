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
// All Aadi Computech stores: failRate 0, 100% payment success.
// Aadi Computech stores: 2–3% fail rate (realistic imperfection).
// SUNRISE INFOTECH: 1 failed order (failRate 10%).
// Sums:  totalOrders 245 · confirmed 241 · revenue 20215000
//        success 234 · dropped 5 · failed 2 · pending 0 (=241 ✓)
//        methods: cashfree 94 + zype 134 + offline 13 = 241 ✓
const PER_STORE = [
  { storeId: "694116c6cf680aaab0604138", name: "Hp India",                         city: "Chennai",   state: "Tamil Nadu",    totalOrders: 65, confirmed: 64, revenue: 5520000, paymentSuccess: 63, userDropped: 1, failed: 0, emiOrders: 38, cashfreeOrders: 22, zyeOrders: 38, offlineOrders: 4,  payuOrders: 0, failRate: 2  },
  // Sec -14: flagship; 1 user-dropped → failRate 2%  (1/51 = 1.96%)
  { storeId: "69796a9f54c43a3e763a968f", name: "AADI COMPUTECH - Sec -14",         city: "Gurgaon",   state: "Haryana",       totalOrders: 52, confirmed: 51, revenue: 4420000, paymentSuccess: 50, userDropped: 1, failed: 0, emiOrders: 28, cashfreeOrders: 21, zyeOrders: 28, offlineOrders: 2,  payuOrders: 0, failRate: 2  },
  // Sec 16: 1 payment failed by gateway → failRate 2%  (1/41 = 2.44%)
  { storeId: "69799a9f54c43a3e763a9690", name: "AADI COMPUTECH - Sec 16",          city: "Gurgaon",   state: "Haryana",       totalOrders: 42, confirmed: 41, revenue: 3510000, paymentSuccess: 40, userDropped: 0, failed: 1, emiOrders: 22, cashfreeOrders: 18, zyeOrders: 22, offlineOrders: 1,  payuOrders: 0, failRate: 2  },
  // Sec 17: newest store; 1 user-dropped → failRate 3%  (1/30 = 3.33%)
  { storeId: "6979ba9f54c43a3e763a9691", name: "AADI COMPUTECH - Sec 17",          city: "Gurgaon",   state: "Haryana",       totalOrders: 31, confirmed: 30, revenue: 2490000, paymentSuccess: 29, userDropped: 1, failed: 0, emiOrders: 16, cashfreeOrders: 12, zyeOrders: 16, offlineOrders: 2,  payuOrders: 0, failRate: 3  },
  { storeId: "69750a2a5983846ed2bb4e7c", name: "Initiative Data Systems Pvt Ltd",  city: "Gurugram",  state: "Haryana",       totalOrders: 15, confirmed: 15, revenue: 1170000, paymentSuccess: 14, userDropped: 1, failed: 0, emiOrders:  8, cashfreeOrders:  6, zyeOrders:  8, offlineOrders: 1,  payuOrders: 0, failRate: 7  },
  { storeId: "696a144f36894b28bd39b18e", name: "HP Dam Products",                  city: "Gurugram",  state: "Haryana",       totalOrders: 12, confirmed: 12, revenue:  980000, paymentSuccess: 12, userDropped: 0, failed: 0, emiOrders:  7, cashfreeOrders:  4, zyeOrders:  7, offlineOrders: 1,  payuOrders: 0, failRate: 0  },
  { storeId: "6979fc3efb22023e701e38e9", name: "SUNRISE INFOTECH",                 city: "Sonipat",   state: "Haryana",       totalOrders: 10, confirmed: 10, revenue:  720000, paymentSuccess:  9, userDropped: 0, failed: 1, emiOrders:  5, cashfreeOrders:  4, zyeOrders:  5, offlineOrders: 1,  payuOrders: 0, failRate: 10 },
  { storeId: "697a06c8fb22023e701e3de2", name: "VS ELECTRONICS",                   city: "Delhi",     state: "Delhi",         totalOrders:  8, confirmed:  8, revenue:  620000, paymentSuccess:  7, userDropped: 1, failed: 0, emiOrders:  4, cashfreeOrders:  3, zyeOrders:  4, offlineOrders: 1,  payuOrders: 0, failRate: 13 },
  { storeId: "699eeafa68e46cfa4b7e17f8", name: "Asif Technologies",                city: "Bengaluru", state: "Karnataka",     totalOrders:  5, confirmed:  5, revenue:  380000, paymentSuccess:  5, userDropped: 0, failed: 0, emiOrders:  3, cashfreeOrders:  2, zyeOrders:  3, offlineOrders: 0,  payuOrders: 0, failRate: 0  },
  { storeId: "69e90ee51914179938d0588e", name: "Apple Store",                       city: "Ghaziabad", state: "Uttar Pradesh", totalOrders:  3, confirmed:  3, revenue:  245000, paymentSuccess:  3, userDropped: 0, failed: 0, emiOrders:  2, cashfreeOrders:  1, zyeOrders:  2, offlineOrders: 0,  payuOrders: 0, failRate: 0  },
  { storeId: "695f8530d0244722bf0ae1c9", name: "Getafix Technologies Pvt. Ltd.",   city: "Abhaneri",  state: "Rajasthan",     totalOrders:  2, confirmed:  2, revenue:  160000, paymentSuccess:  2, userDropped: 0, failed: 0, emiOrders:  1, cashfreeOrders:  1, zyeOrders:  1, offlineOrders: 0,  payuOrders: 0, failRate: 0  },
];

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

// ── Metrics — filter-aware ──────────────────────────────────────
export async function mockFetchMetrics(filters: Filters): Promise<MetricsResponse> {
  await delay(300);

  const sel = filterStores(filters);
  if (sel.length === 0) return emptyMetrics();

  // Aggregate
  const totalOrders     = sel.reduce((s, r) => s + r.totalOrders,     0);
  const confirmed       = sel.reduce((s, r) => s + r.confirmed,        0);
  const revenue         = sel.reduce((s, r) => s + r.revenue,          0);
  const paymentSuccess  = sel.reduce((s, r) => s + r.paymentSuccess,   0);
  const userDropped     = sel.reduce((s, r) => s + r.userDropped,      0);
  const failed          = sel.reduce((s, r) => s + r.failed,           0);
  const emiOrders       = sel.reduce((s, r) => s + r.emiOrders,        0);
  const cashfreeOrders  = sel.reduce((s, r) => s + r.cashfreeOrders,   0);
  const zyeOrders       = sel.reduce((s, r) => s + r.zyeOrders,        0);
  const offlineOrders   = sel.reduce((s, r) => s + r.offlineOrders,    0);
  const payuOrders      = sel.reduce((s, r) => s + r.payuOrders,       0);
  const pending         = Math.max(0, confirmed - paymentSuccess - userDropped - failed);
  const collected       = Math.round(revenue * (paymentSuccess / Math.max(confirmed, 1)));
  const successRate     = confirmed > 0 ? Math.round((paymentSuccess / confirmed) * 100) : 0;

  // Cashfree success = total success minus 100%-success methods
  const cashfreeSuccess = Math.max(0, paymentSuccess - zyeOrders - offlineOrders);

  // Store performance
  const storePerformance = sel
    .map(r => ({
      storeId: r.storeId, name: r.name, city: r.city, state: r.state,
      orders: r.confirmed, revenue: r.revenue, status: "active" as const, failRate: r.failRate,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Store failures (only stores with failRate > 0)
  const storeFailures = sel
    .filter(r => r.failRate > 0)
    .sort((a, b) => b.failRate - a.failRate)
    .map(r => ({
      name: r.name, city: r.city,
      failRate: r.failRate,
      total: r.confirmed,
      failed: Math.round(r.confirmed * r.failRate / 100),
    }));

  // Scale full-network categories/brands proportionally to the selected stores' revenue.
  // Base totals reflect the full 11-store network (20215000).
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

  // Alerts — computed from live aggregated data
  const alerts = [];
  if (successRate >= 97) {
    alerts.push({ id: "success", icon: "🏆", message: `Payment success rate at ${successRate}% across ${sel.length} store${sel.length > 1 ? "s" : ""} — strong performance`, severity: "green" as const });
  }
  if (emiOrders / Math.max(confirmed, 1) >= 0.5) {
    alerts.push({ id: "emi", icon: "📈", message: `EMI / BNPL at ${emiOrders} orders (${Math.round(emiOrders / confirmed * 100)}%) — strong loan book growth this month`, severity: "green" as const });
  }
  const worstStore = [...sel].sort((a, b) => b.failRate - a.failRate)[0];
  if (worstStore && worstStore.failRate >= 5) {
    alerts.push({ id: "failure", icon: "⚠️", message: `${worstStore.name} has ${worstStore.failRate}% payment failure rate — review transaction logs`, severity: "amber" as const });
  }
  if (alerts.length < 2) {
    alerts.push({ id: "rev", icon: "💰", message: `May 2026 GMV ₹${(revenue / 1e7).toFixed(2)} Cr — up vs prior month`, severity: "green" as const });
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
      currentMonth: "2026-05-01",
      previousMonth: "2026-04-01",
      currentOrders: confirmed,
      previousOrders: Math.round(confirmed * 0.45),
      currentRevenue: revenue,
      previousRevenue: Math.round(revenue * 0.75),
      currentSuccessRate: successRate,
      previousSuccessRate: 82,
      ordersChange: 125,
      revenueChange: 40,
      successRateChange: 16,
      collectedRevenueChange: 41,
      emiChange: 77,
    },

    monthlySeries: [
      { month: "Nov 2025", totalSales: Math.round( 6185000 * revRatio), quantity: Math.round( 49 * revRatio) },
      { month: "Dec 2025", totalSales: Math.round(10580000 * revRatio), quantity: Math.round( 67 * revRatio) },
      { month: "Jan 2026", totalSales: Math.round(12635000 * revRatio), quantity: Math.round( 82 * revRatio) },
      { month: "Feb 2026", totalSales: Math.round( 8240000 * revRatio), quantity: Math.round( 36 * revRatio) },
      { month: "Mar 2026", totalSales: Math.round(11505000 * revRatio), quantity: Math.round( 74 * revRatio) },
      { month: "Apr 2026", totalSales: Math.round(14430000 * revRatio), quantity: Math.round(108 * revRatio) },
      { month: "May 2026", totalSales: revenue,                          quantity: totalOrders               },
    ],

    storePerformance,

    orderFunnel: {
      total: totalOrders, confirmed, paymentSuccess, userDropped, failed, pending,
      failedPending: failed + pending,
    },

    paymentMethodBreakdown: [
      ...(zyeOrders     > 0 ? [{ name: "CASHFREE_ZYPE", label: "Cashfree Zype (EMI/BNPL)", count: zyeOrders,    color: "#4A235A" }] : []),
      ...(cashfreeOrders > 0 ? [{ name: "CASHFREE",     label: "Cashfree",                 count: cashfreeOrders, color: "#2E86C1" }] : []),
      ...(offlineOrders  > 0 ? [{ name: "OFFLINE",      label: "Offline",                  count: offlineOrders,  color: "#1A8C7A" }] : []),
      ...(payuOrders     > 0 ? [{ name: "PAYU",         label: "PayU",                     count: payuOrders,     color: "#E67E22" }] : []),
    ],

    paymentMethodSuccess: [
      ...(zyeOrders     > 0 ? [{ method: "CASHFREE_ZYPE", label: "Cashfree Zype (EMI/BNPL)", success: zyeOrders,    total: zyeOrders,    rate: 100 }] : []),
      ...(offlineOrders  > 0 ? [{ method: "OFFLINE",      label: "Offline",                  success: offlineOrders, total: offlineOrders, rate: 100 }] : []),
      ...(cashfreeOrders > 0 ? [{ method: "CASHFREE",     label: "Cashfree",                 success: cashfreeSuccess, total: cashfreeOrders, rate: Math.round(cashfreeSuccess / cashfreeOrders * 100) }] : []),
      ...(payuOrders     > 0 ? [{ method: "PAYU",         label: "PayU",                     success: 0,             total: payuOrders,    rate: 0   }] : []),
    ],

    emiDetail: {
      count: emiOrders,
      avgDownPayment:  19000,
      avgLoanAmount:   76000,
      totalDownPayment: emiOrders * 19000,
      totalLoanAmount:  emiOrders * 76000,
      totalEmiRevenue:  emiOrders * 95000,
      avgEmiTicket:    95000,
      avgNonEmiTicket: 66000,
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
export async function mockFetchRevenueBreakdown(): Promise<RevenueBreakdownResponse> {
  await delay(200);
  return {
    total: 15412000,
    items: [
      { orderId: "HPITNCHE001201", date: "2026-05-02", customer: "Arjun Mehta",      phone: "+91 98201 34567", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "HP OmniBook 5 Next Gen AI 16-ag1046AU, Silver",                                         qty: 1, unitPrice: 119990, paymentMethod: "Cashfree Zype (EMI)", amount: 119990 },
      { orderId: "AADHRGUR001025", date: "2026-05-03", customer: "Priya Sharma",      phone: "+91 97345 67890", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec -14", product: "HP Spectre x360 2-in-1 Laptop 14-ef0053TU Bundle (6K7X3PA), Nightfall black aluminum", qty: 1, unitPrice: 154990, paymentMethod: "Cashfree Zype (EMI)", amount: 154990 },
      { orderId: "AAD16GUR001001", date: "2026-05-04", customer: "Rahul Singh",       phone: "+91 96543 21098", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec 16",  product: "HP OMEN Gaming Laptop 16-am0239TX, Black",                                              qty: 1, unitPrice: 134990, paymentMethod: "Cashfree Zype (EMI)", amount: 134990 },
      { orderId: "AAD17GUR001001", date: "2026-05-05", customer: "Sneha Iyer",        phone: "+91 95678 12345", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec 17",  product: "HP OmniBook X Flip 14-fm0100TU Next Gen AI PC, Blue",                                   qty: 1, unitPrice: 104990, paymentMethod: "Cashfree Zype (EMI)", amount: 104990 },
      { orderId: "HPITNCHE001202", date: "2026-05-06", customer: "Vikram Nair",       phone: "+91 94321 09876", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "HP OMEN Gaming Laptop 16-am0239TX, Black",                                              qty: 1, unitPrice: 134990, paymentMethod: "Cashfree Zype (EMI)", amount: 134990 },
      { orderId: "HPITNCHE001203", date: "2026-05-07", customer: "Ananya Joshi",      phone: "+91 93456 78901", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "Apple MacBook Air 13-inch M3",                                                          qty: 1, unitPrice: 114990, paymentMethod: "Cashfree",            amount: 114990 },
      { orderId: "AAD16GUR001002", date: "2026-05-08", customer: "Rohan Gupta",       phone: "+91 92567 89012", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec 16",  product: "Lenovo LOQ Gen 9",                                                                      qty: 1, unitPrice:  89990, paymentMethod: "Cashfree Zype (EMI)", amount:  89990 },
      { orderId: "HPITNCHE001204", date: "2026-05-09", customer: "Kavya Reddy",       phone: "+91 91678 90123", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "HP ZBook 8 G1i 35.6 cm (14) Mobile Workstation PC, Silver",                            qty: 1, unitPrice: 124990, paymentMethod: "Cashfree Zype (EMI)", amount: 124990 },
      { orderId: "AADHRGUR001026", date: "2026-05-10", customer: "Aditya Verma",      phone: "+91 90789 01234", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec -14", product: "ThinkBook 14 - AMD Ryzen 5, 16 GB RAM, 512 SSD, Win 11 Home",                          qty: 1, unitPrice:  72990, paymentMethod: "Cashfree Zype (EMI)", amount:  72990 },
      { orderId: "SUNHRSON001045", date: "2026-05-11", customer: "Meera Pillai",      phone: "+91 89012 34567", city: "Sonipat", state: "Haryana",    store: "SUNRISE INFOTECH",         product: "HP Envy x360 2-in-1 Laptop 13-bf0085TU (726X6PA)",                                     qty: 1, unitPrice:  99990, paymentMethod: "Cashfree Zype (EMI)", amount:  99990 },
      { orderId: "HPITNCHE001205", date: "2026-05-12", customer: "Siddharth Kumar",   phone: "+91 88123 45678", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "HP ProBook 440 35.6 cm (14) G11 Business Laptop PC, Silver",                           qty: 1, unitPrice:  68990, paymentMethod: "Cashfree",            amount:  68990 },
      { orderId: "AAD17GUR001002", date: "2026-05-13", customer: "Ishaan Patel",      phone: "+91 87234 56789", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec 17",  product: "ThinkBook 14 - AMD Ryzen 5, 16 GB RAM, 512 SSD, Win 11 Home",                          qty: 1, unitPrice:  72990, paymentMethod: "Cashfree",            amount:  72990 },
      { orderId: "HPITNCHE001206", date: "2026-05-14", customer: "Divya Malhotra",    phone: "+91 86345 67890", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "Dell Inspiron 15 3511 (i5/16GB/512GB)",                                                qty: 1, unitPrice:  64990, paymentMethod: "Cashfree",            amount:  64990 },
      { orderId: "AAD16GUR001003", date: "2026-05-15", customer: "Karthik Rao",       phone: "+91 85456 78901", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec 16",  product: "HP ProBook 440 35.6 cm (14) G11 Business Laptop PC, Silver",                           qty: 1, unitPrice:  68990, paymentMethod: "Cashfree Zype (EMI)", amount:  68990 },
      { orderId: "AADHRGUR001027", date: "2026-05-16", customer: "Riya Agarwal",      phone: "+91 84567 89012", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec -14", product: "Apple MacBook Air 13-inch M3",                                                          qty: 1, unitPrice: 114990, paymentMethod: "Cashfree Zype (EMI)", amount: 114990 },
      { orderId: "HPITNCHE001207", date: "2026-05-17", customer: "Arnav Bose",        phone: "+91 83678 90123", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "HP OmniStudio X All-in-One 32-c1574in Next Gen AI Desktop PC",                         qty: 1, unitPrice: 112990, paymentMethod: "Cashfree Zype (EMI)", amount: 112990 },
      { orderId: "AAD17GUR001003", date: "2026-05-19", customer: "Pooja Shah",        phone: "+91 82789 01234", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec 17",  product: "HP Pavilion Plus 35.6 cm (14) Laptop 14-ew0108TU, Blue",                               qty: 1, unitPrice:  89990, paymentMethod: "Cashfree Zype (EMI)", amount:  89990 },
      { orderId: "HPITNCHE001208", date: "2026-05-20", customer: "Nikhil Tiwari",     phone: "+91 81890 12345", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "HP Smart Tank 750 Wi Fi All-in-One Printer Duplexer with ADF and Smart Guided Button", qty: 1, unitPrice:  24990, paymentMethod: "Cashfree",            amount:  24990 },
      { orderId: "AAD16GUR001004", date: "2026-05-21", customer: "Anika Choudhury",   phone: "+91 80901 23456", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec 16",  product: "Dell XPS 13 9305 (i7/16GB/512GB SSD)",                                                 qty: 1, unitPrice:  94990, paymentMethod: "Cashfree",            amount:  94990 },
      { orderId: "AADHRGUR001028", date: "2026-05-22", customer: "Tanvi Bhatt",       phone: "+91 79012 34567", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec -14", product: "IdeaPad Slim 5 Gen 10",                                                                 qty: 1, unitPrice:  54990, paymentMethod: "Cashfree Zype (EMI)", amount:  54990 },
      { orderId: "HPITNCHE001209", date: "2026-05-23", customer: "Harsh Saxena",      phone: "+91 78123 45678", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "HP KM260 Wireless Mouse and Keyboard Combo",                                            qty: 3, unitPrice:   2990, paymentMethod: "Offline",             amount:   8970 },
      { orderId: "AAD17GUR001004", date: "2026-05-26", customer: "Shriya Nambiar",    phone: "+91 77234 56789", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec 17",  product: "Lenovo LOQ Gen 9",                                                                      qty: 1, unitPrice:  89990, paymentMethod: "Cashfree Zype (EMI)", amount:  89990 },
      { orderId: "HPITNCHE001210", date: "2026-05-27", customer: "Manav Chopra",      phone: "+91 76345 67890", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "Apple MacBook Pro 14-inch M3 Pro",                                                      qty: 1, unitPrice: 179990, paymentMethod: "Cashfree Zype (EMI)", amount: 179990 },
      { orderId: "AAD16GUR001005", date: "2026-05-28", customer: "Varun Menon",       phone: "+91 75456 78901", city: "Gurgaon", state: "Haryana",    store: "AADI COMPUTECH - Sec 16",  product: "ThinkPad E14 Gen 4 (Intel Core i5 / 16GB / 512GB)",                                    qty: 1, unitPrice:  94990, paymentMethod: "Cashfree Zype (EMI)", amount:  94990 },
      { orderId: "HPITNCHE001211", date: "2026-05-29", customer: "Naina Bhatnagar",   phone: "+91 74567 89012", city: "Chennai", state: "Tamil Nadu", store: "Hp India",                 product: "HP OMEN Gaming Laptop 16-am0239TX, Black",                                              qty: 1, unitPrice: 134990, paymentMethod: "Cashfree Zype (EMI)", amount: 134990 },
    ],
  };
}
