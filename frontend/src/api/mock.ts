// ============================================================
// MOCK DATA
// This file returns fake data that looks exactly like what
// the real backend will return. This lets you build and test
// the dashboard UI without needing a backend running.
// When backend is ready, just set VITE_API_BASE_URL in .env
// and this file is automatically bypassed.
// ============================================================

import type {
  Filters,
  MetricsResponse,
  FilterOptionsResponse,
  RevenueBreakdownResponse,
  InventoryResponse,
  StoreInfo,
} from "@/types/api.types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STORES: StoreInfo[] = [
  { id: "68d3df2fd760f8a83938bee5", name: "Lenovo Products", city: "Srinagar", state: "Jammu and Kashmir", status: "inactive", type: "RETAIL", lat: 34.0837, lng: 74.7973 },
  { id: "68da1f9743a00ae01ab1def0", name: "New Lenovo", city: "Bengaluru", state: "Karnataka", status: "inactive", type: "RETAIL", lat: 12.96, lng: 77.58 },
  { id: "694116c6cf680aaab0604138", name: "Hp India", city: "Chennai", state: "Tamil Nadu", status: "active", type: "RETAIL", lat: 13.0843, lng: 80.2705 },
  { id: "695f8530d0244722bf0ae1c9", name: "Getafix Technologies", city: "Abhaneri", state: "Rajasthan", status: "active", type: "RETAIL", lat: 27.05, lng: 76.77 },
  { id: "696a144f36894b28bd39b18e", name: "HP Dam Products", city: "Gurugram", state: "Haryana", status: "active", type: "CLOUD_INVENTORY", lat: 28.47, lng: 77.03 },
  { id: "69750a2a5983846ed2bb4e7c", name: "Initiative Data Systems", city: "Gurugram", state: "Haryana", status: "active", type: "RETAIL", lat: 28.47, lng: 77.03 },
  { id: "69796a9f54c43a3e763a968f", name: "AADI COMPUTECH", city: "Gurgaon", state: "Haryana", status: "active", type: "RETAIL", lat: 28.47, lng: 77.03 },
  { id: "6979fc3efb22023e701e38e9", name: "SUNRISE INFOTECH", city: "Sonipat", state: "Haryana", status: "active", type: "RETAIL", lat: 28.93, lng: 77.02 },
  { id: "697a06c8fb22023e701e3de2", name: "VS ELECTRONICS", city: "Delhi", state: "Delhi", status: "active", type: "RETAIL", lat: 28.6139, lng: 77.209 },
  { id: "699eeafa68e46cfa4b7e17f8", name: "Asif Technologies", city: "Bengaluru", state: "Karnataka", status: "active", type: "RETAIL", lat: 12.96, lng: 77.58 },
];

const STORE_MAP = Object.fromEntries(STORES.map((s) => [s.id, s]));

export async function mockFetchFilterOptions(): Promise<FilterOptionsResponse> {
  await delay(100);
  const stateToCities: Record<string, string[]> = {};
  const cityToStores: Record<string, string[]> = {};
  for (const s of STORES) {
    if (!stateToCities[s.state]) stateToCities[s.state] = [];
    if (!stateToCities[s.state].includes(s.city)) stateToCities[s.state].push(s.city);
    if (!cityToStores[s.city]) cityToStores[s.city] = [];
    if (!cityToStores[s.city].includes(s.name)) cityToStores[s.city].push(s.name);
  }
  return {
    states: [...new Set(STORES.map((s) => s.state))].sort(),
    cities: [...new Set(STORES.map((s) => s.city))].sort(),
    stores: STORES.map((s) => s.name).sort(),
    stateToCities,
    cityToStores,
  };
}

export async function mockFetchMetrics(filters: Filters): Promise<MetricsResponse> {
  await delay(300);
  return {
    totalOrders: 134,
    confirmedOrders: 128,
    gmv: 7845320,
    collectedRevenue: 2934210,
    emiOrders: 24,
    paymentSuccessRate: 34,
    activeStores: 8,
    productsInCatalogue: 641,
    itemsInCart: 11,
    momComparison: {
      currentMonth: filters.dateFrom,
      previousMonth: "2025-12-01",
      currentOrders: 128,
      previousOrders: 110,
      currentRevenue: 7845320,
      previousRevenue: 6200000,
      currentSuccessRate: 34,
      previousSuccessRate: 28,
      ordersChange: 16,
      revenueChange: 26,
      successRateChange: 6,
      collectedRevenueChange: 18,
      emiChange: 12,
    },
    monthlySeries: [
      { month: "Nov 2025", totalSales: 980000, quantity: 18 },
      { month: "Dec 2025", totalSales: 1540000, quantity: 29 },
      { month: "Jan 2026", totalSales: 2100000, quantity: 43 },
      { month: "Feb 2026", totalSales: 890000, quantity: 16 },
      { month: "Mar 2026", totalSales: 2335320, quantity: 22 },
    ],
    storePerformance: [
      { storeId: "694116c6cf680aaab0604138", name: "Hp India", city: "Chennai", state: "Tamil Nadu", orders: 42, revenue: 3200000, status: "active", failRate: 62 },
      { storeId: "69796a9f54c43a3e763a968f", name: "AADI COMPUTECH", city: "Gurgaon", state: "Haryana", orders: 28, revenue: 1900000, status: "active", failRate: 71 },
      { storeId: "6979fc3efb22023e701e38e9", name: "SUNRISE INFOTECH", city: "Sonipat", state: "Haryana", orders: 18, revenue: 1200000, status: "active", failRate: 44 },
      { storeId: "68da1f9743a00ae01ab1def0", name: "New Lenovo", city: "Bengaluru", state: "Karnataka", orders: 14, revenue: 780000, status: "inactive", failRate: 78 },
      { storeId: "695f8530d0244722bf0ae1c9", name: "Getafix Technologies", city: "Abhaneri", state: "Rajasthan", orders: 12, revenue: 450000, status: "active", failRate: 33 },
      { storeId: "68d3df2fd760f8a83938bee5", name: "Lenovo Products", city: "Srinagar", state: "Jammu and Kashmir", orders: 8, revenue: 315320, status: "inactive", failRate: 87 },
    ],
    orderFunnel: {
      total: 134,
      confirmed: 128,
      paymentSuccess: 44,
      userDropped: 12,
      failedPending: 78,
    },
    paymentMethodBreakdown: [
      { name: "CASHFREE", label: "Cashfree", count: 89, color: "#2E86C1" },
      { name: "CASHFREE_ZYPE", label: "Cashfree Zype (EMI/BNPL)", count: 24, color: "#4A235A" },
      { name: "PAYU", label: "PayU", count: 8, color: "#E67E22" },
      { name: "OFFLINE", label: "Offline", count: 7, color: "#1A8C7A" },
    ],
    paymentMethodSuccess: [
      { method: "CASHFREE", label: "Cashfree", success: 28, total: 89, rate: 31 },
      { method: "CASHFREE_ZYPE", label: "Cashfree Zype (EMI/BNPL)", success: 8, total: 24, rate: 33 },
      { method: "PAYU", label: "PayU", success: 5, total: 8, rate: 62 },
      { method: "OFFLINE", label: "Offline", success: 7, total: 7, rate: 100 },
    ],
    emiDetail: {
      count: 24,
      avgDownPayment: 11250,
      avgLoanAmount: 68430,
      totalDownPayment: 270000,
      totalLoanAmount: 1642320,
      totalEmiRevenue: 1912320,
      avgEmiTicket: 79680,
      avgNonEmiTicket: 45230,
    },
    categorySales: [
      { name: "Laptops", value: 352, revenue: 5200000, percentage: 54.9, color: "#1A8C7A" },
      { name: "Printers", value: 99, revenue: 890000, percentage: 15.4, color: "#E67E22" },
      { name: "Accessories", value: 92, revenue: 420000, percentage: 14.4, color: "#C8D44E" },
      { name: "Desktops", value: 11, revenue: 980000, percentage: 1.7, color: "#1C2B3A" },
      { name: "Tablets", value: 7, revenue: 245000, percentage: 1.1, color: "#4A235A" },
      { name: "2-in-1", value: 3, revenue: 110320, percentage: 0.5, color: "#2E86C1" },
    ],
    brandData: [
      { name: "HP", productCount: 406, revenue: 5600000 },
      { name: "Lenovo", productCount: 235, revenue: 2245320 },
    ],
    alerts: [
      { id: "payment-rate", icon: "🚨", message: "Payment success rate is only 34% — needs attention", severity: "red" },
      { id: "oos", icon: "⚠️", message: "118 products are out of stock across stores", severity: "amber" },
      { id: "revenue-growth", icon: "📈", message: "March revenue grew 26% vs February", severity: "green" },
    ],
    storeFailures: [
      { name: "Lenovo Products", city: "Srinagar", failRate: 87, total: 8, failed: 7 },
      { name: "New Lenovo", city: "Bengaluru", failRate: 78, total: 14, failed: 11 },
      { name: "AADI COMPUTECH", city: "Gurgaon", failRate: 71, total: 28, failed: 20 },
      { name: "Hp India", city: "Chennai", failRate: 62, total: 42, failed: 26 },
      { name: "SUNRISE INFOTECH", city: "Sonipat", failRate: 44, total: 18, failed: 8 },
      { name: "Getafix Technologies", city: "Abhaneri", failRate: 33, total: 12, failed: 4 },
    ],
  };
}

export async function mockFetchStores(): Promise<StoreInfo[]> {
  await delay(100);
  return STORES;
}

export async function mockFetchInventory(): Promise<InventoryResponse> {
  await delay(200);
  return {
    products: [],
    summary: { total: 693, outOfStock: 118, lowStock: 9, healthyStock: 566 },
  };
}

export async function mockFetchRevenueBreakdown(): Promise<RevenueBreakdownResponse> {
  await delay(200);
  return {
    total: 2934210,
    items: [
      { orderId: "ORD-001", date: "2026-03-21", customer: "Aarav Sharma", phone: "+91 98765 43210", city: "Chennai", state: "Tamil Nadu", store: "Hp India", product: "HP EliteBook 840", qty: 1, unitPrice: 84101, paymentMethod: "Cashfree", amount: 84101 },
      { orderId: "ORD-002", date: "2026-03-15", customer: "Diya Patel", phone: "+91 87654 32109", city: "Gurgaon", state: "Haryana", store: "AADI COMPUTECH", product: "HP LaserJet Pro", qty: 1, unitPrice: 78990, paymentMethod: "Cashfree", amount: 78990 },
      { orderId: "ORD-003", date: "2026-01-12", customer: "Vivaan Iyer", phone: "+91 76543 21098", city: "Chennai", state: "Tamil Nadu", store: "Hp India", product: "IdeaPad Slim 5", qty: 1, unitPrice: 65991, paymentMethod: "PayU", amount: 65991 },
    ],
  };
}