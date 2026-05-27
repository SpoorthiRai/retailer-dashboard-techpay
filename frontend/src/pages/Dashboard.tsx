import type { Filters } from '@/types/api.types'
import { useMetrics, useFilterOptions } from '@/hooks/useApi'
import KPICards from '@/components/dashboard/KPICards'
import AlertBanner from '@/components/dashboard/AlertBanner'
import FilterBar from '@/components/dashboard/FilterBar'
import TimeSeriesChart from '@/components/dashboard/TimeSeriesChart'
import StoreLeaderboard from '@/components/dashboard/StoreLeaderboard'
import PaymentHealthSection from '@/components/dashboard/PaymentHealthSection'
import EMISection from '@/components/dashboard/EMISection'
import InventorySection from '@/components/dashboard/InventorySection'
import CategorySection from '@/components/dashboard/CategorySection'

interface Props {
  filters: Filters
  onFiltersChange: (f: Filters) => void
}

export default function Dashboard({ filters, onFiltersChange }: Props) {
  const { data: metrics, isLoading, isError } = useMetrics(filters)
  const { data: filterOptions } = useFilterOptions()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-xl">Loading dashboard...</div>
      </div>
    )
  }

  if (isError || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">Failed to load dashboard data.</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-[#f5f6fa] min-h-screen">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1C2B3A]">Retailer & Distributor's Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
         
        </p>
      </div>

      {/* Filter Bar */}
      {filterOptions && (
        <FilterBar
          filters={filters}
          options={filterOptions}
          onFiltersChange={onFiltersChange}
        />
      )}

      {/* Alerts */}
      <AlertBanner alerts={metrics.alerts} />

      {/* KPI Cards */}
      <KPICards metrics={metrics} filters={filters} />

      {/* Revenue Chart */}
      <TimeSeriesChart data={metrics.monthlySeries} />

      {/* Store Performance */}
      <StoreLeaderboard stores={metrics.storePerformance} />

      {/* Payment Health — scroll target */}
      <div id="payment-health">
        <PaymentHealthSection metrics={metrics} />
      </div>

      {/* EMI / BNPL Analysis — scroll target */}
      <div id="emi-section">
        <EMISection metrics={metrics} />
      </div>

      {/* Category & Brand Analysis */}
      <CategorySection metrics={metrics} />

      {/* Inventory Health */}
      <InventorySection filters={filters} />

    </div>
  )
}