import { useInventory } from '@/hooks/useApi'
import type { Filters } from '@/types/api.types'

interface Props {
  filters: Filters
}

export default function InventorySection({ filters }: Props) {
  const storeNames = filters.store.length > 0 ? filters.store : undefined
  const { data: inventory, isLoading } = useInventory(storeNames)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="text-gray-400 text-sm">Loading inventory...</div>
      </div>
    )
  }

  if (!inventory) return null

  const { summary, products } = inventory
  const oosProducts = products.filter(p => p.quantity === 0)
 
  // Category breakdown
  const catMap: Record<string, { total: number; oos: number }> = {}
  for (const p of products) {
    if (!catMap[p.category]) catMap[p.category] = { total: 0, oos: 0 }
    catMap[p.category].total++
    if (p.quantity === 0) catMap[p.category].oos++
  }

  return (
    <div className="space-y-4">

      {/* Section title */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-[#4a0072] rounded-full" />
        <h2 className="text-base font-semibold text-[#1C2B3A]">
          Inventory Health
        </h2>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
             style={{ borderTop: '3px solid #1C2B3A' }}>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Total Products
          </div>
          <div className="text-2xl font-bold text-[#1C2B3A]">
            {summary.total}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
             style={{ borderTop: '3px solid #E74C3C' }}>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Out of Stock
          </div>
          <div className="text-2xl font-bold text-red-500">
            {summary.outOfStock}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {summary.total > 0
              ? Math.round((summary.outOfStock / summary.total) * 100)
              : 0}% of catalogue
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
             style={{ borderTop: '3px solid #E67E22' }}>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Low Stock
          </div>
          <div className="text-2xl font-bold text-amber-500">
            {summary.lowStock}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            1–9 units remaining
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
             style={{ borderTop: '3px solid #1A8C7A' }}>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Healthy Stock
          </div>
          <div className="text-2xl font-bold text-green-600">
            {summary.healthyStock}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            10+ units available
          </div>
        </div>
      </div>

      {/* Stock health bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-[#1C2B3A] mb-3">
          Overall Stock Health
        </h3>
        {summary.total > 0 && (
          <div>
            <div className="flex rounded-full overflow-hidden h-4 mb-3">
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${(summary.healthyStock / summary.total) * 100}%` }}
              />
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${(summary.lowStock / summary.total) * 100}%` }}
              />
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${(summary.outOfStock / summary.total) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span>Healthy ({Math.round((summary.healthyStock / summary.total) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Low ({Math.round((summary.lowStock / summary.total) * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Out of Stock ({Math.round((summary.outOfStock / summary.total) * 100)}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two columns — Category breakdown + OOS products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Category breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1C2B3A] mb-4">
            Stock by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(catMap)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([cat, data]) => (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600">{cat}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">{data.total} total</span>
                      {data.oos > 0 && (
                        <span className="text-red-500 font-medium">
                          {data.oos} OOS
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-[#4a0072]"
                      style={{
                        width: `${summary.total > 0
                          ? (data.total / summary.total) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* OOS products list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1C2B3A] mb-4">
            Out of Stock Products
            <span className="ml-2 bg-red-100 text-red-600 text-xs 
                             px-2 py-0.5 rounded-full font-medium">
              {oosProducts.length}
            </span>
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {oosProducts.length === 0 ? (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <span>✅</span>
                <span>All products are in stock!</span>
              </div>
            ) : (
              oosProducts.slice(0, 100).map((p, i) => (
                <div key={i}
                  className="flex items-center justify-between py-1.5 
                             border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#1C2B3A] truncate max-w-[200px]">
                      {p.product}
                    </div>
                    <div className="text-xs text-gray-400">
                      {p.category} · {p.storeName}
                    </div>
                  </div>
                  <span className="text-xs bg-red-100 text-red-600 
                                   px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0">
                    OOS
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  )
}