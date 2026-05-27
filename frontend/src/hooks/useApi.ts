// ============================================================
// REACT QUERY HOOKS
// Think of these like smart data fetchers.
// A component calls useMetrics(filters) and gets back:
//   - data: the actual metrics
//   - isLoading: true while fetching
//   - isError: true if something went wrong
// React Query also automatically caches results so if you
// change a filter and change it back, it doesn't refetch.
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { Filters } from "@/types/api.types";

/** Filter dropdown options — fetched once when app loads */
export function useFilterOptions() {
  return useQuery({
    queryKey: ["filterOptions"],
    queryFn: () => api.fetchFilterOptions(),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

/** Main dashboard metrics — refetches when filters change */
export function useMetrics(filters: Filters) {
  return useQuery({
    queryKey: ["metrics", filters],
    queryFn: () => api.fetchMetrics(filters),
    staleTime: 30 * 1000, // cache for 30 seconds
  });
}

/** Store locations for the map */
export function useStores() {
  return useQuery({
    queryKey: ["stores"],
    queryFn: () => api.fetchStores(),
    staleTime: 10 * 60 * 1000,
  });
}

/** Inventory data — filtered by store names */
export function useInventory(storeNames?: string[]) {
  return useQuery({
    queryKey: ["inventory", storeNames],
    queryFn: () => api.fetchInventory(storeNames),
    staleTime: 60 * 1000,
  });
}

/** Revenue breakdown — only fetches when dialog is opened */
export function useRevenueBreakdown(filters: Filters, enabled: boolean) {
  return useQuery({
    queryKey: ["revenueBreakdown", filters],
    queryFn: () => api.fetchRevenueBreakdown(filters),
    enabled, // only runs when enabled = true
    staleTime: 30 * 1000,
  });
}