import { useState } from 'react'
import type { MetricsResponse, StorePerformance } from '@/types/api.types'
import StoreDetailDialog from '../StoreDetailDialog'

interface Props {
  metrics: MetricsResponse
}

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}

export default function StoresTab({ metrics }: Props) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'revenue' | 'orders' | 'failRate'>('revenue')
  const [selectedStore, setSelectedStore] = useState<{ store: StorePerformance; rank: number } | null>(null)

  const filtered = metrics.storePerformance
    .filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase()) ||
      s.state.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'revenue') return b.revenue - a.revenue
      if (sortBy === 'orders') return b.orders - a.orders
      return b.failRate - a.failRate
    })

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1C2B3A]">Store Network</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {metrics.storePerformance.length} stores · {metrics.activeStores} active
            <span className="ml-2 text-xs text-purple-500">· Click a store for details</span>
          </p>
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-200 w-48"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="orders">Sort by Orders</option>
            <option value="failRate">Sort by Fail Rate</option>
          </select>
        </div>
      </div>

      {/* Store cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((store, i) => {
          const isHealthy = store.failRate < 40
          const isWarning = store.failRate >= 40 && store.failRate < 70

          return (
            <div
              key={store.storeId}
              onClick={() => setSelectedStore({ store, rank: i })}
              className="bg-white rounded-xl border border-gray-100
                         shadow-sm p-5 hover:shadow-md hover:border-purple-200
                         transition-all cursor-pointer group"
            >
              {/* Store header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-base">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏪'}
                    </span>
                    <span className="font-semibold text-[#1C2B3A] text-sm group-hover:text-purple-700 transition-colors">
                      {store.name}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 ml-6">
                    {store.city}, {store.state}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${store.status === 'active'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-400'}`}>
                    {store.status}
                  </span>
                  <span className="text-gray-300 group-hover:text-purple-400 transition-colors text-xs">↗</span>
                </div>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center">
                  <div className="text-base font-bold text-[#1C2B3A]">{store.orders}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-[#1C2B3A]">
                    {formatCurrency(store.revenue)}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Revenue</div>
                </div>
                <div className="text-center">
                  <div className={`text-base font-bold
                    ${isHealthy ? 'text-green-600' :
                      isWarning ? 'text-amber-500' : 'text-red-500'}`}>
                    {store.failRate.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Fail Rate</div>
                </div>
              </div>

              {/* Fail rate bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${store.failRate}%`,
                    background: isHealthy ? '#1A8C7A' : isWarning ? '#E67E22' : '#E74C3C'
                  }}
                />
              </div>
              <div className={`text-xs mt-1 font-medium
                ${isHealthy ? 'text-green-600' :
                  isWarning ? 'text-amber-500' : 'text-red-500'}`}>
                {isHealthy ? '✅ Healthy' :
                 isWarning ? '⚠️ Needs attention' : '🔴 High failure rate'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Store detail popup */}
      {selectedStore && (
        <StoreDetailDialog
          store={selectedStore.store}
          rank={selectedStore.rank}
          onClose={() => setSelectedStore(null)}
        />
      )}

    </div>
  )
}
