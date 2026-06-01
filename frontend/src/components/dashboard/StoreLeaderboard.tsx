import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { StorePerformance } from '@/types/api.types'

interface Props {
  stores: StorePerformance[]
}

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}

function formatYAxis(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

function FailRate({ rate }: { rate: number }) {
  const color =
    rate === 0 ? 'text-green-600' :
    rate >= 70 ? 'text-red-500' :
    rate >= 40 ? 'text-amber-500' :
                 'text-green-600'
  const icon =
    rate === 0 ? '✅' :
    rate >= 70 ? '🔴' :
    rate >= 40 ? '⚠️' :
                 '✅'
  return (
    <span className={`text-sm font-semibold ${color} flex items-center gap-1`}>
      {rate.toFixed(2)}% payment failure {icon}
    </span>
  )
}

const MEDALS = ['🥇', '🥈', '🥉']
const BAR_COLORS = ['#1C2B3A', '#2E86C1', '#2E86C1', '#9CA3AF', '#9CA3AF', '#9CA3AF', '#9CA3AF']

export default function StoreLeaderboard({ stores }: Props) {
  const [sortBy, setSortBy] = useState<'revenue' | 'orders'>('revenue')

  const sorted = [...stores].sort((a, b) =>
    sortBy === 'revenue' ? b.revenue - a.revenue : b.orders - a.orders
  )

  const barData = sorted.map(s => ({
    name: s.name.length > 15 ? s.name.slice(0, 15) + '…' : s.name,
    value: sortBy === 'revenue' ? s.revenue : s.orders,
    fullName: s.name,
  }))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

      {/* Store Performance title */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-[#4a0072] rounded-full" />
        <h2 className="text-base font-semibold text-[#1C2B3A]">
          Store Performance
        </h2>
      </div>

      {/* Active Stores + Products mini cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-100 rounded-xl p-4"
             style={{ borderTop: '3px solid #1A8C7A' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🏪</span>
            <span className="text-[10px] font-semibold text-gray-400 
                             uppercase tracking-wider">
              Active Stores
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1C2B3A]">
            {stores.filter(s => s.status === 'active').length}
          </div>
        </div>

        <div className="border border-gray-100 rounded-xl p-4"
             style={{ borderTop: '3px solid #2E86C1' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📦</span>
            <span className="text-[10px] font-semibold text-gray-400 
                             uppercase tracking-wider">
              Products in Catalogue
            </span>
          </div>
          <div className="text-3xl font-bold text-[#1C2B3A]">
            641
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 mb-5" />

      {/* Store Rankings header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#4a0072] rounded-full" />
          <h2 className="text-base font-semibold text-[#1C2B3A]">
            Store Rankings
          </h2>
        </div>

        {/* Toggle */}
        <div className="flex items-center rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => setSortBy('revenue')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors
              ${sortBy === 'revenue'
                ? 'bg-[#1C2B3A] text-white'
                : 'text-gray-500 hover:bg-gray-50'}`}
          >
            By Revenue
          </button>
          <button
            onClick={() => setSortBy('orders')}
            className={`px-4 py-1.5 text-sm font-medium transition-colors
              ${sortBy === 'orders'
                ? 'bg-[#1C2B3A] text-white'
                : 'text-gray-500 hover:bg-gray-50'}`}
          >
            By Orders
          </button>
        </div>
      </div>

      {/* Store rows */}
      <div className="divide-y divide-gray-50">
        {sorted.map((store, i) => (
          <div key={store.storeId}
            className="flex items-center justify-between py-3 
                       hover:bg-gray-50 rounded-lg px-2 transition-colors">

            {/* Left — rank + name */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Medal / number */}
              <span className="text-lg flex-shrink-0 w-7 text-center">
                {i < 3 ? MEDALS[i] : (
                  <span className="text-sm font-medium text-gray-400">
                    {i + 1}.
                  </span>
                )}
              </span>

              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0
                ${store.status === 'active' ? 'bg-green-400' : 'bg-gray-300'}`}
              />

              {/* Name + city + inactive badge */}
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="font-medium text-[#1C2B3A] text-sm">
                  {store.name}, {store.city}
                </span>
                {store.status === 'inactive' && (
                  <span className="text-[10px] bg-gray-100 text-gray-400 
                                   px-2 py-0.5 rounded-full font-medium">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Right — revenue + orders + fail rate */}
            <div className="flex items-center gap-6 flex-shrink-0 ml-4">
              <span className="font-semibold text-[#1C2B3A] text-sm min-w-[80px] text-right">
                {formatCurrency(store.revenue)}
              </span>
              <span className="text-gray-400 text-sm min-w-[60px] text-right">
                {store.orders} orders
              </span>
              <div className="min-w-[180px] text-right">
                <FailRate rate={store.failRate} />
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#4a0072] rounded-full" />
          <h3 className="text-sm font-semibold text-[#1C2B3A]">
            {sortBy === 'revenue' ? 'Revenue by Store' : 'Orders by Store'}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 100, bottom: 0 }}
          >
            <XAxis
              type="number"
              tickFormatter={sortBy === 'revenue' ? formatYAxis : undefined}
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              width={95}
            />
            <Tooltip
              formatter={(value: any) =>
                sortBy === 'revenue'
                  ? [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']
                  : [value, 'Orders']
              }
              cursor={{ fill: '#f5f6fa' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {barData.map((_entry, index) => (
                <Cell
                  key={index}
                  fill={BAR_COLORS[index] || '#9CA3AF'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}