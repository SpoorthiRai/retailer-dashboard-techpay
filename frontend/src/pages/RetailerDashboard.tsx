import { useState } from 'react'
import type { AuthUser, Filters } from '@/types/api.types'
import { useMetrics, useFilterOptions } from '@/hooks/useApi'
import FilterBar from '@/components/dashboard/FilterBar'
import DateFilterBar from '@/components/dashboard/DateFilterBar'
import TabNav from '@/components/dashboard/TabNav'
import AlertBanner from '@/components/dashboard/AlertBanner'
import KPICards from '@/components/dashboard/KPICards'
import TimeSeriesChart from '@/components/dashboard/TimeSeriesChart'
import PaymentHealthSection from '@/components/dashboard/PaymentHealthSection'
import EMISection from '@/components/dashboard/EMISection'
import InventorySection from '@/components/dashboard/InventorySection'
import CategorySection from '@/components/dashboard/CategorySection'

interface Props {
  user: AuthUser
  onLogout: () => void
  initialFilters?: Pick<Filters, 'state' | 'city' | 'store'>
}

const ALL_TABS = [
  { id: 'overview',    label: 'Overview',          icon: '📊' },
  { id: 'orders',      label: 'Orders & Payments', icon: '💳' },
  { id: 'inventory',   label: 'Inventory',         icon: '📦' },
  { id: 'performance', label: 'Performance',       icon: '🏆' },
]

export default function RetailerDashboard({ user, onLogout, initialFilters }: Props) {
  const isStoreManager = user.role === 'store_manager'
  const isRetailer     = user.role === 'retailer'

  // Tabs — Performance hidden for store manager
  const TABS = isStoreManager
    ? ALL_TABS.filter(t => t.id !== 'performance')
    : ALL_TABS

  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState<Filters>({
    state:    initialFilters?.state ?? [],
    city:     initialFilters?.city  ?? [],
    store:    initialFilters?.store ?? [],
    dateFrom: '2026-05-01',
    dateTo:   '2026-05-31',
  })

  const { data: metrics, isLoading, isError } = useMetrics(filters)
  const { data: filterOptions } = useFilterOptions()

  // Retailer's fixed store scope (set once at login, never changes)
  const allowedStores = initialFilters?.store ?? []

  // Scoped filter options: retailer sees only their 3 Aadi stores, no state/city
  const scopedFilterOptions = filterOptions && isRetailer && allowedStores.length > 0
    ? { ...filterOptions, stores: allowedStores, states: [], cities: [], stateToCities: {}, cityToStores: {} }
    : filterOptions

  // Wrap setFilters: retailer can never filter outside their allowed stores
  function handleFiltersChange(newFilters: Filters) {
    if (isRetailer && allowedStores.length > 0) {
      const store =
        newFilters.store.length === 0
          ? allowedStores
          : newFilters.store.filter(s => allowedStores.includes(s))
      setFilters({ ...newFilters, state: [], city: [], store })
    } else {
      setFilters(newFilters)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f6fa]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#4a0072] border-t-transparent
                          rounded-full animate-spin mx-auto mb-3" />
          <div className="text-gray-500 text-sm">Loading your dashboard...</div>
        </div>
      </div>
    )
  }

  if (isError || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f6fa]">
        <div className="text-red-500 text-sm">Failed to load dashboard data.</div>
      </div>
    )
  }

  const portalTitle = isStoreManager
    ? `Store Manager — ${user.storeName}`
    : 'Retail Partner Portal'

  return (
    <div className="min-h-screen bg-[#f5f6fa]">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/techpay_new_logo.png" alt="TechPay"
                 className="h-9 w-auto rounded-xl bg-white/5 p-1" />
            <div>
              <h1 className="text-base font-bold text-[#1C2B3A] leading-tight">
                {portalTitle}
              </h1>
              <p className="text-xs text-gray-400">
                {isStoreManager
                  ? 'Your store performance at a glance'
                  : `${user.storeIds.length} stores in your network`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-[#1C2B3A]">{user.name}</div>
              <div className="text-xs text-gray-400 capitalize">
                {user.role.replace('_', ' ')}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#2E86C1] flex items-center
                            justify-center text-white text-sm font-bold">
              {user.name[0]}
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-gray-400 hover:text-red-500
                         transition-colors px-2 py-1 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-screen-xl mx-auto">
          {isStoreManager ? (
            // Store manager: date range only (locked to their store)
            <DateFilterBar filters={filters} onFiltersChange={handleFiltersChange} />
          ) : isRetailer && scopedFilterOptions ? (
            // Retailer: stores + date only (state/city hidden)
            <FilterBar
              filters={filters}
              options={scopedFilterOptions}
              onFiltersChange={handleFiltersChange}
              hideStateCity={true}
            />
          ) : null}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-screen-xl mx-auto">
          <TabNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <AlertBanner alerts={metrics.alerts} />
            <KPICards metrics={metrics} filters={filters} />
            <TimeSeriesChart data={metrics.monthlySeries} />

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                  <div className="w-1 h-4 bg-[#2E86C1] rounded-full" />
                  <h3 className="text-sm font-semibold text-[#1C2B3A]">Store at a glance</h3>
                </div>
                <div className="flex flex-col flex-1 gap-1.5">
                  {[
                    { label: 'Avg Ticket',    value: metrics.confirmedOrders > 0 ? `₹${Math.round(metrics.gmv / metrics.confirmedOrders).toLocaleString('en-IN')}` : '—' },
                    { label: 'EMI Orders',    value: metrics.emiOrders },
                    { label: 'Success Rate',  value: `${metrics.paymentSuccessRate}%` },
                    { label: 'Total Orders',  value: metrics.totalOrders },
                    { label: 'Confirmed',     value: metrics.confirmedOrders },
                    { label: 'Items in Cart', value: metrics.itemsInCart },
                  ].map(stat => (
                    <div key={stat.label}
                         className="flex flex-1 items-center justify-between bg-gray-50 rounded-lg px-3">
                      <span className="text-xs text-gray-500">{stat.label}</span>
                      <span className="text-sm font-bold text-[#1C2B3A]">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <CategorySection metrics={metrics} />
            </div>
          </div>
        )}

        {/* Orders & Payments */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1C2B3A]">Orders & Payments</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Payment health and EMI breakdown for your stores
              </p>
            </div>
            <PaymentHealthSection metrics={metrics} />
            <EMISection metrics={metrics} />
          </div>
        )}

        {/* Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1C2B3A]">Inventory</h2>
              <p className="text-sm text-gray-500 mt-0.5">Stock levels across your stores</p>
            </div>
            <InventorySection filters={filters} />
          </div>
        )}

        {/* Performance — retailer only */}
        {activeTab === 'performance' && !isStoreManager && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1C2B3A]">Store Performance</h2>
              <p className="text-sm text-gray-500 mt-0.5">Your ranking vs the network</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#2E86C1] rounded-full" />
                <h3 className="text-sm font-semibold text-[#1C2B3A]">Network Store Rankings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['#', 'Store', 'City', 'Revenue', 'Orders', 'Fail Rate', 'Status'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-400
                                               uppercase tracking-wider pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {metrics.storePerformance.map((store, i) => {
                      const isYours = user.storeIds.includes(store.storeId)
                      return (
                        <tr key={store.storeId}
                          className={`${isYours ? 'bg-blue-50 font-medium' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="py-3 pr-4">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                          </td>
                          <td className="py-3 pr-4">
                            {store.name}
                            {isYours && (
                              <span className="ml-2 text-[10px] bg-blue-100 text-blue-600
                                               px-1.5 py-0.5 rounded-full">← You</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-gray-500">{store.city}</td>
                          <td className="py-3 pr-4 font-semibold">
                            ₹{store.revenue.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 pr-4">{store.orders}</td>
                          <td className="py-3 pr-4">
                            <span className={`font-semibold ${
                              store.failRate >= 10 ? 'text-red-500' :
                              store.failRate >= 5  ? 'text-amber-500' : 'text-green-600'}`}>
                              {store.failRate}%
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              store.status === 'active'
                                ? 'bg-green-50 text-green-600'
                                : 'bg-gray-100 text-gray-400'}`}>
                              {store.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
