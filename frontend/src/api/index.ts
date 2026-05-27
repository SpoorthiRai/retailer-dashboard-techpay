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

export const api = {
  fetchMetrics:          (f: Filters) => USE_REAL ? real.fetchMetrics(f)          : mock.mockFetchMetrics(f),
  fetchFilterOptions:    ()           => USE_REAL ? real.fetchFilterOptions()      : mock.mockFetchFilterOptions(),
  fetchRevenueBreakdown: (f: Filters) => USE_REAL ? real.fetchRevenueBreakdown(f) : mock.mockFetchRevenueBreakdown(),
  fetchInventory:        (s?: string[]) => USE_REAL ? real.fetchInventory(s)      : mock.mockFetchInventory(),
  fetchStores:           ()           => USE_REAL ? real.fetchStores()             : mock.mockFetchStores(),
};