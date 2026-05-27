import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import type { MetricsResponse } from '@/types/api.types'

interface Props {
  metrics: MetricsResponse
}

function formatCurrency(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-[#1C2B3A] mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-medium text-[#1C2B3A]">
            {p.name === 'Revenue'
              ? formatCurrency(p.value)
              : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function CategorySection({ metrics }: Props) {
  const { categorySales, brandData } = metrics
  const [catView, setCatView] = useState<'products' | 'revenue'>('products')

  const catChartData = categorySales.map(c => ({
    name: c.name,
    value: catView === 'products' ? c.value : c.revenue,
    color: c.color,
    percentage: c.percentage,
  }))

  return (
    <div className="space-y-4">

      {/* Section title */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-[#4a0072] rounded-full" />
        <h2 className="text-base font-semibold text-[#1C2B3A]">
          Category & Brand Analysis
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Category chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1C2B3A]">
              Sales by Category
            </h3>
            <div className="flex items-center rounded-lg overflow-hidden 
                           border border-gray-200">
              <button
                onClick={() => setCatView('products')}
                className={`px-3 py-1 text-xs font-medium transition-colors
                  ${catView === 'products'
                    ? 'bg-[#1C2B3A] text-white'
                    : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Products
              </button>
              <button
                onClick={() => setCatView('revenue')}
                className={`px-3 py-1 text-xs font-medium transition-colors
                  ${catView === 'revenue'
                    ? 'bg-[#1C2B3A] text-white'
                    : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Revenue
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={catChartData}
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={catView === 'revenue' ? formatCurrency : undefined}
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name={catView === 'products' ? 'Products' : 'Revenue'}
                   radius={[4, 4, 0, 0]}>
                {catChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Category legend */}
          <div className="flex flex-wrap gap-2 mt-3">
            {categorySales.map(c => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                     style={{ background: c.color }} />
                <span className="text-xs text-gray-500">
                  {c.name} ({c.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Brand chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1C2B3A] mb-4">
            Brand Breakdown
          </h3>

          {/* Donut */}
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={brandData}
                  dataKey="productCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                >
                  {brandData.map((_entry, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? '#2E86C1' : i === 1 ? '#E67E22' : '#1A8C7A'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Brand stats */}
            <div className="flex-1 space-y-3">
              {brandData.map((brand, i) => {
                const color = i === 0 ? '#2E86C1' : i === 1 ? '#E67E22' : '#1A8C7A'
                const total = brandData.reduce((s, b) => s + b.productCount, 0)
                const pct = total > 0
                  ? Math.round((brand.productCount / total) * 100)
                  : 0
                return (
                  <div key={brand.name}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full"
                             style={{ background: color }} />
                        <span className="text-sm font-medium text-[#1C2B3A]">
                          {brand.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 ml-4">
                      <span>{brand.productCount} products</span>
                      <span className="font-medium text-[#1C2B3A]">
                        {formatCurrency(brand.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}