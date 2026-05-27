// ============================================================
// API CLIENT
// This file handles all HTTP calls to the backend.
// Think of it as a messenger — frontend gives it a request,
// it goes to the backend, brings back the response.
// ============================================================

import type {
  Filters,
  MetricsResponse,
  FilterOptionsResponse,
  RevenueBreakdownResponse,
  InventoryResponse,
  StoreInfo,
} from "@/types/api.types";

// This reads the backend URL from your .env file
// If not set, it defaults to empty string (uses mock data)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// ---- Generic helper functions ----

// For POST requests (sending data to backend)
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// For GET requests (just fetching data)
async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// Reads the JWT token from browser storage
// (set this after login)
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---- All API calls ----

/** Main dashboard data — KPIs, charts, everything */
export const fetchMetrics = (filters: Filters): Promise<MetricsResponse> =>
  post("/api/metrics", { filters });

/** Dropdown options — states, cities, stores */
export const fetchFilterOptions = (): Promise<FilterOptionsResponse> =>
  get("/api/filters/options");

/** Order-level breakdown for revenue dialog */
export const fetchRevenueBreakdown = (filters: Filters): Promise<RevenueBreakdownResponse> =>
  post("/api/revenue/breakdown", { filters });

/** Inventory data from MongoDB */
export const fetchInventory = (storeNames?: string[]): Promise<InventoryResponse> =>
  post("/api/inventory", { storeNames });

/** Store locations for the map */
export const fetchStores = (): Promise<StoreInfo[]> =>
  get("/api/stores");

/** Brand breakdown within a category */
export const fetchCategoryDrilldown = (
  category: string,
  revenue: number
): Promise<{ name: string; value: number; revenue: number; color: string }[]> =>
  get("/api/category-drilldown", { category, revenue: String(revenue) });