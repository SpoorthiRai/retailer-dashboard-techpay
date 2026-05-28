import type { MetricsResponse, Filters } from '@/types/api.types'
import KPICards from '../KPICards'
import AlertBanner from '../AlertBanner'
import TimeSeriesChart from '../TimeSeriesChart'
import StoreLeaderboard from '../StoreLeaderboard'

interface Props {
  metrics: MetricsResponse
  filters: Filters
}

export default function OverviewTab({ metrics, filters }: Props) {
  return (
    <div className="space-y-6">
      <AlertBanner alerts={metrics.alerts} />
      <KPICards metrics={metrics} filters={filters} />
      <TimeSeriesChart data={metrics.monthlySeries} />
      <StoreLeaderboard stores={metrics.storePerformance} />
    </div>
  )
}