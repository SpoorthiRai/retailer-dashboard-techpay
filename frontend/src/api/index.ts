// ============================================================
// API FACADE — THE SWITCH
// This is the only file components import from.
// If VITE_API_BASE_URL is set in .env → uses real backend
// If not set → uses mock data above
// Switching from mock to real = just add one line to .env
// ============================================================

import type { Filters } from "@/types/api.types";
import * as real from "./client";
import * as mock from "./mock";

const USE_REAL = Boolean(import.meta.env.VITE_API_BASE_URL);

// Try real API; if it fails (backend down / CORS / wrong URL) fall back to mock.
async function withFallback<T>(realFn: () => Promise<T>, mockFn: () => Promise<T>): Promise<T> {
  if (!USE_REAL) return mockFn();
  try {
    return await realFn();
  } catch {
    return mockFn();
  }
}

export const api = {
  fetchMetrics:          (f: Filters, cr?: number) => withFallback(() => real.fetchMetrics(f), () => mock.mockFetchMetrics(f, cr)),
  fetchFilterOptions:    ()             => withFallback(() => real.fetchFilterOptions(),      () => mock.mockFetchFilterOptions()),
  fetchRevenueBreakdown: (f: Filters, type: 'collected' | 'gmv' = 'collected') =>
    withFallback(() => real.fetchRevenueBreakdown(f), () => mock.mockFetchRevenueBreakdown(f, type)),
  fetchInventory:        (s?: string[]) => withFallback(() => real.fetchInventory(s),        () => mock.mockFetchInventory()),
  fetchStores:           ()             => withFallback(() => real.fetchStores(),             () => mock.mockFetchStores()),
};