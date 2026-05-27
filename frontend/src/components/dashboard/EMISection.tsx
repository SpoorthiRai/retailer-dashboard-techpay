import type { MetricsResponse } from '@/types/api.types'

interface Props {
  metrics: MetricsResponse
}

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}

export default function EMISection({ metrics }: Props) {
  const { emiDetail, confirmedOrders } = metrics
  const emiPct = confirmedOrders
    ? Math.round((emiDetail.count / confirmedOrders) * 100)
    : 0

  return (
    <div className="space-y-4">

      {/* Section title */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-[#4a0072] rounded-full" />
        <h2 className="text-base font-semibold text-[#1C2B3A]">
          EMI / BNPL Analysis
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Card 1 — Headline Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
             style={{ borderTop: '3px solid #F39C12' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#F39C12] rounded-full" />
            <h3 className="text-sm font-semibold text-[#1C2B3A]">
              EMI Headline Stats
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">EMI Orders</span>
              <span className="text-sm font-semibold text-[#1C2B3A]">
                {emiDetail.count} of {confirmedOrders} ({emiPct}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">EMI Avg Ticket</span>
              <span className="text-sm font-semibold text-[#1C2B3A]">
                {formatCurrency(emiDetail.avgEmiTicket)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Non-EMI Avg Ticket</span>
              <span className="text-sm font-semibold text-[#1C2B3A]">
                {formatCurrency(emiDetail.avgNonEmiTicket)}
              </span>
            </div>
          </div>

          {/* Insight */}
          {emiDetail.avgEmiTicket > emiDetail.avgNonEmiTicket && (
            <div className="mt-4 bg-amber-50 border border-amber-100 
                           rounded-lg px-3 py-2 text-xs text-amber-700">
              💡 EMI is enabling higher-value purchases.
            </div>
          )}
        </div>

        {/* Card 2 — EMI Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
             style={{ borderTop: '3px solid #2E86C1' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#2E86C1] rounded-full" />
            <h3 className="text-sm font-semibold text-[#1C2B3A]">
              EMI Breakdown
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">💰</span>
              <div>
                <div className="text-xs text-gray-500">Avg Down Payment</div>
                <div className="text-sm font-semibold text-[#1C2B3A]">
                  {formatCurrency(emiDetail.avgDownPayment)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">🏦</span>
              <div>
                <div className="text-xs text-gray-500">Avg Loan Amount</div>
                <div className="text-sm font-semibold text-[#1C2B3A]">
                  {formatCurrency(emiDetail.avgLoanAmount)}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Total EMI Revenue</span>
                <span className="text-xs font-semibold text-[#1C2B3A]">
                  {formatCurrency(emiDetail.totalEmiRevenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Total Down Payments</span>
                <span className="text-xs font-semibold text-[#1C2B3A]">
                  {formatCurrency(emiDetail.totalDownPayment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Total Loan Amount</span>
                <span className="text-xs font-semibold text-[#1C2B3A]">
                  {formatCurrency(emiDetail.totalLoanAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 — EMI vs Non-EMI Avg Ticket */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
             style={{ borderTop: '3px solid #1A8C7A' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1A8C7A] rounded-full" />
            <h3 className="text-sm font-semibold text-[#1C2B3A]">
              EMI vs Non-EMI Avg Ticket
            </h3>
          </div>

          <div className="space-y-4">
            {/* EMI bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">EMI avg ticket</span>
                <span className="text-xs font-semibold text-[#1C2B3A]">
                  {formatCurrency(emiDetail.avgEmiTicket)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-[#1C2B3A]"
                  style={{
                    width: `${Math.min(100, Math.round(
                      (emiDetail.avgEmiTicket /
                        Math.max(emiDetail.avgEmiTicket, emiDetail.avgNonEmiTicket)) * 100
                    ))}%`
                  }}
                />
              </div>
            </div>

            {/* Non-EMI bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">Non-EMI avg ticket</span>
                <span className="text-xs font-semibold text-[#1C2B3A]">
                  {formatCurrency(emiDetail.avgNonEmiTicket)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-[#2E86C1]"
                  style={{
                    width: `${Math.min(100, Math.round(
                      (emiDetail.avgNonEmiTicket /
                        Math.max(emiDetail.avgEmiTicket, emiDetail.avgNonEmiTicket)) * 100
                    ))}%`
                  }}
                />
              </div>
            </div>

            {/* Difference */}
            {emiDetail.avgEmiTicket > 0 && emiDetail.avgNonEmiTicket > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">EMI orders are</div>
                <div className="text-lg font-bold text-[#4a0072]">
                  {Math.round(
                    ((emiDetail.avgEmiTicket - emiDetail.avgNonEmiTicket) /
                      emiDetail.avgNonEmiTicket) * 100
                  )}% higher
                </div>
                <div className="text-xs text-gray-500">in value vs non-EMI</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}