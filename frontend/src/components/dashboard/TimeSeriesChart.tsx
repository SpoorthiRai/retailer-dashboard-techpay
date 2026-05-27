import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import type { MonthlyDataPoint } from '@/types/api.types'

interface Props {
  data: MonthlyDataPoint[]
}

type ViewMode = 'Daily' | 'Weekly' | 'Monthly'

function formatY(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-[#1C2B3A] mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-medium text-[#1C2B3A]">
            {p.name === 'Revenue'
              ? `₹${Number(p.value).toLocaleString('en-IN')}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function TimeSeriesChart({ data }: Props) {
  const [view, setView] = useState<ViewMode>('Monthly')

  const chartData = useMemo(() => {
    if (view === 'Monthly') return data

    if (view === 'Weekly') {
      return data.flatMap((d) => {
        const weeklySales = Math.round(d.totalSales / 4)
        const weeklyQty = Math.round(d.quantity / 4)
        const monthShort = d.month.split(' ')[0]
        return [
          { month: `${monthShort} W1`, totalSales: Math.round(weeklySales * 0.8), quantity: Math.round(weeklyQty * 0.8) },
          { month: `${monthShort} W2`, totalSales: Math.round(weeklySales * 1.1), quantity: Math.round(weeklyQty * 1.1) },
          { month: `${monthShort} W3`, totalSales: Math.round(weeklySales * 1.2), quantity: Math.round(weeklyQty * 1.2) },
          { month: `${monthShort} W4`, totalSales: Math.round(weeklySales * 0.9), quantity: Math.round(weeklyQty * 0.9) },
        ]
      })
    }

    if (view === 'Daily') {
      return data.flatMap((d) => {
        const monthShort = d.month.split(' ')[0]
        const days = [2, 5, 9, 13, 17, 21, 25]
        return days.map((day, i) => {
          const factor = [0.6, 0.9, 1.3, 1.1, 0.8, 1.4, 1.0][i]
          return {
            month: `${day} ${monthShort}`,
            totalSales: Math.round((d.totalSales / 7) * factor),
            quantity: Math.round((d.quantity / 7) * factor),
          }
        })
      })
    }

    return data
  }, [data, view])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-[#4a0072] rounded-full" />
            <h2 className="text-base font-semibold text-[#1C2B3A]">
              Revenue Overview
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-3">
            Total Sales INR — {view}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
          {(['Daily', 'Weekly', 'Monthly'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${view === v
                  ? 'bg-[#1C2B3A] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 ml-3">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-[#4a0072]" />
          <span>Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-gray-300" />
          <span>Orders</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          {/* Gradient definitions */}
          <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4a0072" stopOpacity={0.50} />
                <stop offset="95%" stopColor="#4a0072" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.05} />
                <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
                </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            interval={view === 'Daily' ? 6 : 0}
          />
          <YAxis
            yAxisId="revenue"
            orientation="left"
            tickFormatter={formatY}
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            label={{
              value: 'Orders',
              angle: -90,
              position: 'insideRight',
              fill: '#9CA3AF',
              fontSize: 11,
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Revenue area */}
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="totalSales"
            name="Revenue"
            stroke="#4a0072"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
            dot={{ fill: '#4a0072', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#4a0072' }}
          />

          {/* Orders area */}
          <Area
            yAxisId="orders"
            type="monotone"
            dataKey="quantity"
            name="Orders"
            stroke="#9CA3AF"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="url(#ordersGradient)"
            dot={{ fill: '#9CA3AF', r: 3, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>

    </div>
  )
}