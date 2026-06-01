// ============================================================
// API TYPE CONTRACTS
// This file defines the exact shape of every API response.
// Frontend and backend both follow these — it's the agreement
// between the two sides. If backend sends { total_price },
// but frontend expects { totalPrice }, things break.
// ============================================================

export interface Filters {
  state: string[];
  city: string[];
  store: string[];
  dateFrom: string; // "YYYY-MM-DD"
  dateTo: string;   // "YYYY-MM-DD"
}

// ---- GET /api/filters/options ----
export interface FilterOptionsResponse {
  states: string[];
  cities: string[];
  stores: string[];
  stateToCities: Record<string, string[]>;
  cityToStores: Record<string, string[]>;
}

// ---- POST /api/metrics ----
export interface MetricsRequest {
  filters: Filters;
}

export interface MetricsResponse {
  totalOrders: number;
  confirmedOrders: number;
  gmv: number;
  collectedRevenue: number;
  emiOrders: number;
  paymentSuccessRate: number;
  activeStores: number;
  productsInCatalogue: number;
  itemsInCart: number;
  momComparison: MoMComparison;
  monthlySeries: MonthlyDataPoint[];
  storePerformance: StorePerformance[];
  orderFunnel: OrderFunnel;
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  paymentMethodSuccess: PaymentMethodSuccess[];
  emiDetail: EMIDetail;
  categorySales: CategorySale[];
  brandData: BrandData[];
  alerts: DynamicAlert[];
  storeFailures: StoreFailure[];
}

export interface MoMComparison {
  currentMonth: string;
  previousMonth: string;
  currentOrders: number;
  previousOrders: number;
  currentRevenue: number;
  previousRevenue: number;
  currentSuccessRate: number;
  previousSuccessRate: number;
  ordersChange: number;
  revenueChange: number;
  successRateChange: number;
  collectedRevenueChange: number;
  emiChange: number;
}

export interface MonthlyDataPoint {
  month: string;
  totalSales: number;
  quantity: number;
}

export interface StorePerformance {
  storeId: string;
  name: string;
  city: string;
  state: string;
  orders: number;        // confirmed orders
  revenue: number;
  status: "active" | "inactive";
  failRate: number;
  // Detail fields (populated by mock; optional so real API stays compatible)
  totalOrders?: number;
  paymentSuccess?: number;
  collectedRevenue?: number;
  userDropped?: number;
  failed?: number;
  emiOrders?: number;
  cashfreeOrders?: number;
  zyeOrders?: number;
  offlineOrders?: number;
  storeType?: string;
}

export interface OrderFunnel {
  total: number;
  confirmed: number;
  paymentSuccess: number;
  userDropped: number;
  failed: number;
  pending: number;
  failedPending: number; // kept for backward compat (failed + pending)
}

export interface PaymentMethodBreakdown {
  name: string;
  label: string;
  count: number;
  color: string;
}

export interface PaymentMethodSuccess {
  method: string;
  label: string;
  success: number;
  total: number;
  rate: number;
}

export interface EMIDetail {
  count: number;
  avgDownPayment: number;
  avgLoanAmount: number;
  totalDownPayment: number;
  totalLoanAmount: number;
  totalEmiRevenue: number;
  avgEmiTicket: number;
  avgNonEmiTicket: number;
}

export interface CategorySale {
  name: string;
  value: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface BrandData {
  name: string;
  productCount: number;
  revenue: number;
}

export interface DynamicAlert {
  id: string;
  icon: string;
  message: string;
  severity: "red" | "amber" | "green";
}

export interface StoreFailure {
  name: string;
  city: string;
  failRate: number;
  total: number;
  failed: number;
}

export interface StoreInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  status: string;
  type: string;
  lat: number;
  lng: number;
}

export interface RevenueLineItem {
  orderId: string;
  date: string;
  customer: string;
  phone: string;
  city: string;
  state: string;
  store: string;
  product: string;
  qty: number;
  unitPrice: number;
  paymentMethod: string;
  amount: number;
  paymentStatus?: string;   // present on GMV breakdown; absent on collected-revenue breakdown
}

export interface RevenueBreakdownResponse {
  items: RevenueLineItem[];
  total: number;
}

export interface InventoryProduct {
  product: string;
  category: string;
  brand: string;
  quantity: number;
  storeName: string;
}

export interface InventoryResponse {
  products: InventoryProduct[];
  summary: {
    total: number;
    outOfStock: number;
    lowStock: number;
    healthyStock: number;
  };
}

export type UserRole = 'distributor' | 'retailer' | 'store_manager'

export interface AuthUser {
  role: UserRole
  name: string
  email: string
  storeIds: string[]
  storeName?: string
}