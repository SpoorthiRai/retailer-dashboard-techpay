// ============================================================
// PAYMENT HEALTH SECTION
// Three parts:
// 1. Order Funnel — how many orders drop off at each stage
// 2. Payment Method Breakdown — which methods are used
// 3. Payment Method Success Rates — which methods succeed
// ============================================================

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { MetricsResponse } from '@/types/api.types'

interface Props {
  metrics: MetricsResponse
}

export default function PaymentHealthSection({ metrics }: Props) {
  const { orderFunnel, paymentMethodBreakdown, paymentMethodSuccess, storeFailures } = metrics

  return (
    <div className="space-y-4">

      {/* Section title */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-[#4a0072] rounded-full" />
        <h2 className="text-base font-semibold text-[#1C2B3A]">
          Payment Health
        </h2>
      </div>

      {/* Row 1 — Funnel + Donut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Order Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1C2B3A] mb-4">
            Order Funnel
          </h3>
          <div className="space-y-3">
            <FunnelBar
              label="Total Orders"
              value={orderFunnel.total}
              max={orderFunnel.total}
              color="#1C2B3A"
            />
            <FunnelBar
              label="Confirmed Orders"
              value={orderFunnel.confirmed}
              max={orderFunnel.total}
              color="#2E86C1"
            />
            <FunnelBar
              label="Payment Success"
              value={orderFunnel.paymentSuccess}
              max={orderFunnel.total}
              color="#1A8C7A"
            />
            <FunnelBar
              label="User Dropped"
              value={orderFunnel.userDropped}
              max={orderFunnel.total}
              color="#E67E22"
            />
            <FunnelBar
              label="Failed / Pending"
              value={orderFunnel.failedPending}
              max={orderFunnel.total}
              color="#E74C3C"
            />
          </div>
        </div>

        {/* Payment Method Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1C2B3A] mb-4">
            Payment Method Breakdown
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={paymentMethodBreakdown}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                >
                  {paymentMethodBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [value, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {paymentMethodBreakdown.map((pm) => (
                <div key={pm.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: pm.color }}
                    />
                    <span className="text-xs text-gray-600">{pm.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#1C2B3A]">
                    {pm.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 2 — Success rates + Store failures */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Payment Method Success Rates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1C2B3A] mb-4">
            Success Rate by Payment Method
          </h3>
          <div className="space-y-3">
            {paymentMethodSuccess.map((pm) => (
              <div key={pm.method}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{pm.label}</span>
                  <span className={`text-xs font-semibold
                    ${pm.rate >= 70 ? 'text-green-600' :
                      pm.rate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                    {pm.rate}% ({pm.success}/{pm.total})
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${pm.rate}%`,
                      background: pm.rate >= 70 ? '#1A8C7A' :
                                  pm.rate >= 40 ? '#E67E22' : '#E74C3C'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store Failures */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-[#1C2B3A] mb-4">
            Payment Failure by Store
          </h3>
          <div className="space-y-3">
            {storeFailures.slice(0, 6).map((store) => (
              <div key={store.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 truncate max-w-[160px]">
                    {store.name}
                  </span>
                  <span className={`text-xs font-semibold
                    ${store.failRate >= 70 ? 'text-red-500' :
                      store.failRate >= 40 ? 'text-amber-500' : 'text-green-600'}`}>
                    {store.failRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${store.failRate}%`,
                      background: store.failRate >= 70 ? '#E74C3C' :
                                  store.failRate >= 40 ? '#E67E22' : '#1A8C7A'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

// ── Funnel Bar Component ─────────────────────────────────────
function FunnelBar({
  label, value, max, color
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#1C2B3A]">{value}</span>
          <span className="text-xs text-gray-400">({pct}%)</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}