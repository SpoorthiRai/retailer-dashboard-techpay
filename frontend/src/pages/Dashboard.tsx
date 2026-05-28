import { useState } from 'react'
import type { Filters, AuthUser } from '@/types/api.types'
import { useMetrics, useFilterOptions } from '@/hooks/useApi'
import FilterBar from '@/components/dashboard/FilterBar'
import TabNav from '@/components/dashboard/TabNav'
import OverviewTab from '@/components/dashboard/tabs/OverviewTab'
import PaymentsTab from '@/components/dashboard/tabs/PaymentsTab'
import InventoryTab from '@/components/dashboard/tabs/InventoryTab'
import StoresTab from '@/components/dashboard/tabs/StoresTab'

interface Props {
  filters: Filters
  onFiltersChange: (f: Filters) => void
  user: AuthUser
  onLogout: () => void
}

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: '📊' },
  { id: 'stores',     label: 'Stores',     icon: '🏪' },
  { id: 'payments',   label: 'Payments',   icon: '💳' },
  { id: 'inventory',  label: 'Inventory',  icon: '📦' },
]

export default function Dashboard({ filters, onFiltersChange, user, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState('overview')
  const { data: metrics, isLoading, isError } = useMetrics(filters)
  const { data: filterOptions } = useFilterOptions()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f6fa]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#4a0072] border-t-transparent 
                          rounded-full animate-spin mx-auto mb-3" />
          <div className="text-gray-500 text-sm">Loading dashboard...</div>
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

  return (
    <div className="min-h-screen bg-[#f5f6fa]">

      {/* Top header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">

          {/* Left — logo + title */}
          <div className="flex items-center gap-4">
            <img
              src="/techpay_new_logo.png"
              alt="TechPay"
              className="h-9 w-auto rounded-xl bg-white/5 p-1"
            />
            <div>
              <h1 className="text-base font-bold text-[#1C2B3A] leading-tight">
                Distributor Portal
              </h1>
              <p className="text-xs text-gray-400">
                Retailer & Distributor Sales Dashboard
              </p>
            </div>
          </div>

          {/* Right — user + logout */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-[#1C2B3A]">
                {user.name}
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {user.role.replace('_', ' ')}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#4a0072] flex items-center 
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
        <div className="max-w-screen-2xl mx-auto">
          {filterOptions && (
            <FilterBar
              filters={filters}
              options={filterOptions}
              onFiltersChange={onFiltersChange}
            />
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-screen-2xl mx-auto">
          <TabNav
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <OverviewTab metrics={metrics} filters={filters} />
        )}
        {activeTab === 'stores' && (
          <StoresTab metrics={metrics} />
        )}
        {activeTab === 'payments' && (
          <PaymentsTab metrics={metrics} />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab filters={filters} metrics={metrics} />
        )}
      </div>

    </div>
  )
}