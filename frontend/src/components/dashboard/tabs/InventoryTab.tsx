import type { Filters } from '@/types/api.types'
import InventorySection from '../InventorySection'
import CategorySection from '../CategorySection'
import type { MetricsResponse } from '@/types/api.types'

interface Props {
  filters: Filters
  metrics: MetricsResponse
}

export default function InventoryTab({ filters, metrics }: Props) {
  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-lg font-semibold text-[#1C2B3A]">
          Inventory Health
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Stock levels across all stores
        </p>
      </div>

      <InventorySection filters={filters} />

      <div>
        <h2 className="text-lg font-semibold text-[#1C2B3A]">
          Category & Brand Analysis
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Product mix and brand performance
        </p>
      </div>

      <CategorySection metrics={metrics} />

    </div>
  )
}