import type { StorePerformance } from '@/types/api.types'

interface Props {
  store: StorePerformance
  rank: number
  onClose: () => void
}

function fmt(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}

const RANK_ICON = ['🥇', '🥈', '🥉']

export default function StoreDetailDialog({ store, rank, onClose }: Props) {
  const confirmed     = store.orders
  const totalOrders   = store.totalOrders   ?? confirmed
  const paySuccess    = store.paymentSuccess ?? Math.round(confirmed * (1 - store.failRate / 100))
  const userDropped   = store.userDropped   ?? 0
  const failed        = store.failed        ?? Math.round(confirmed * store.failRate / 100)
  const emiOrders     = store.emiOrders     ?? 0
  const zyeOrders     = store.zyeOrders     ?? 0
  const cashfreeOrders = store.cashfreeOrders ?? 0
  const offlineOrders  = store.offlineOrders  ?? 0

  const successRate = confirmed > 0 ? Math.round((paySuccess / confirmed) * 100) : 0
  const avgTicket   = confirmed > 0 ? Math.round(store.revenue / confirmed) : 0
  const emiPct      = confirmed > 0 ? Math.round((emiOrders / confirmed) * 100) : 0

  const collectedRevenue = store.collectedRevenue
    ?? Math.round(store.revenue * (paySuccess / Math.max(confirmed, 1)))

  const successColor = successRate >= 95 ? '#27AE60' : successRate >= 85 ? '#E67E22' : '#E74C3C'
  const successTextClass = successRate >= 95 ? 'text-green-600' : successRate >= 85 ? 'text-amber-500' : 'text-red-500'

  const funnelRows = [
    { label: 'Total Orders',     value: totalOrders,  color: '#94A3B8' },
    { label: 'Confirmed',        value: confirmed,    color: '#2E86C1' },
    { label: 'Payment Success',  value: paySuccess,   color: '#27AE60' },
    { label: 'User Dropped',     value: userDropped,  color: '#E67E22' },
    { label: 'Failed',           value: failed,       color: '#E74C3C' },
  ]

  const paymentMethods = [
    { name: 'Cashfree Zype (EMI/BNPL)', count: zyeOrders,     color: '#4A235A' },
    { name: 'Cashfree',                  count: cashfreeOrders, color: '#2E86C1' },
    { name: 'Offline',                   count: offlineOrders,  color: '#1A8C7A' },
  ].filter(m => m.count > 0)

  const maxPmtCount = Math.max(...paymentMethods.map(m => m.count), 1)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl
                        max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">
                {RANK_ICON[rank] ?? '🏪'}
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#1C2B3A] leading-snug">
                  {store.name}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {store.city}, {store.state}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    store.status === 'active'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {store.status}
                  </span>
                  {store.storeType && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                      {store.storeType}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors
                         w-8 h-8 flex items-center justify-center rounded-full
                         hover:bg-gray-100 text-xl leading-none shrink-0"
            >
              ×
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-auto p-6 space-y-6">

            {/* KPI boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { label: 'GMV',               value: fmt(store.revenue),  color: '#2E86C1', textClass: 'text-[#1C2B3A]' },
                { label: 'Collected Revenue', value: fmt(collectedRevenue), color: '#1A8C7A', textClass: 'text-[#1C2B3A]' },
                { label: 'Confirmed',         value: confirmed,            color: '#27AE60', textClass: 'text-[#1C2B3A]' },
                { label: 'Success Rate',      value: `${successRate}%`,    color: successColor, textClass: successTextClass },
                { label: 'Avg Ticket',        value: fmt(avgTicket),       color: '#8E44AD', textClass: 'text-[#1C2B3A]' },
              ].map(kpi => (
                <div key={kpi.label}
                     className="bg-gray-50 rounded-xl p-3 text-center"
                     style={{ borderTop: `3px solid ${kpi.color}` }}>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    {kpi.label}
                  </div>
                  <div className={`text-xl font-bold ${kpi.textClass}`}>
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Funnel */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#2E86C1] rounded-full" />
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order Funnel
                </h3>
              </div>
              <div className="space-y-2">
                {funnelRows.map(row => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-32 text-xs text-gray-500 text-right shrink-0">
                      {row.label}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-5 rounded-full transition-all duration-300"
                        style={{
                          width: totalOrders > 0
                            ? `${Math.max(2, Math.round((row.value / totalOrders) * 100))}%`
                            : '0%',
                          background: row.color,
                          opacity: row.value === 0 ? 0 : 1,
                        }}
                      />
                    </div>
                    <div className="w-8 text-xs font-bold text-[#1C2B3A] text-right shrink-0">
                      {row.value}
                    </div>
                    <div className="w-9 text-xs text-gray-400 text-right shrink-0">
                      {totalOrders > 0
                        ? `${Math.round((row.value / totalOrders) * 100)}%`
                        : '0%'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Breakdown */}
            {paymentMethods.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#4A235A] rounded-full" />
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment Methods
                  </h3>
                </div>
                <div className="space-y-2">
                  {paymentMethods.map(m => (
                    <div key={m.name} className="flex items-center gap-3">
                      <div className="w-40 text-xs text-gray-500 text-right shrink-0">
                        {m.name}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-5 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.round((m.count / maxPmtCount) * 100)}%`,
                            background: m.color,
                          }}
                        />
                      </div>
                      <div className="w-8 text-xs font-bold text-[#1C2B3A] text-right shrink-0">
                        {m.count}
                      </div>
                      <div className="w-9 text-xs text-gray-400 text-right shrink-0">
                        {confirmed > 0 ? `${Math.round((m.count / confirmed) * 100)}%` : '0%'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EMI highlight */}
            {emiOrders > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3
                              flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💳</span>
                  <div>
                    <div className="text-sm font-semibold text-[#1C2B3A]">EMI / BNPL</div>
                    <div className="text-xs text-amber-700">
                      {emiOrders} orders via Cashfree Zype
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-600">{emiPct}%</div>
                  <div className="text-xs text-amber-500">of confirmed orders</div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
