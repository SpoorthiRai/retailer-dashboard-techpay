import { useState } from 'react'
import type { MetricsResponse, Filters } from '@/types/api.types'
import RevenueDialog from './RevenueDialog'

interface Props {
  metrics: MetricsResponse
  filters: Filters
}

const CARDS = [
  { key: 'collectedRevenue', label: 'COLLECTED REVENUE', icon: '💰', color: '#1A8C7A', format: 'currency', clickable: true, dialogType: 'collected', changeKey: 'collectedRevenueChange', scrollTo: null },
  { key: 'gmv', label: 'GMV', icon: '₹', color: '#2E86C1', format: 'currency', clickable: true, dialogType: 'gmv', changeKey: 'revenueChange', scrollTo: null },
  { key: 'totalOrders', label: 'TOTAL ORDERS', icon: '📦', color: '#E67E22', format: 'number', clickable: false, changeKey: 'ordersChange', scrollTo: 'payment-health' },
  { key: 'confirmedOrders', label: 'CONFIRMED ORDERS', icon: '✅', color: '#27AE60', format: 'number', clickable: false, changeKey: 'ordersChange', scrollTo: 'payment-health' },
  { key: 'paymentSuccessRate', label: 'PAYMENT SUCCESS RATE', icon: '⚡', color: '#E74C3C', format: 'percent', clickable: false, changeKey: 'successRateChange', scrollTo: 'payment-health' },
  { key: 'itemsInCart', label: 'ITEMS IN CART', icon: '🛒', color: '#8E44AD', format: 'number', clickable: false, changeKey: null, scrollTo: null },
  { key: 'emiOrders', label: 'EMI / BNPL ORDERS', icon: '💳', color: '#F39C12', format: 'number', clickable: false, changeKey: 'emiChange', scrollTo: 'emi-section' },
] as const

function formatValue(value: number, format: string): string {
  if (format === 'currency') return `₹${value.toLocaleString('en-IN')}`
  if (format === 'percent') return `${value}%`
  return value.toLocaleString('en-IN')
}

export default function KPICards({ metrics, filters }: Props) {
  const [openDialog, setOpenDialog] = useState<'collected' | 'gmv' | null>(null)
  const { momComparison: mom } = metrics

  function handleCardClick(card: typeof CARDS[number]) {
    if (card.clickable) {
      setOpenDialog(card.dialogType as 'collected' | 'gmv')
    } else if (card.scrollTo) {
      const el = document.getElementById(card.scrollTo)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {CARDS.map((card) => {
          const value = metrics[card.key as keyof MetricsResponse] as number
          const formatted = formatValue(value, card.format)
          const change = card.changeKey
            ? (mom[card.changeKey as keyof typeof mom] as number)
            : null

          return (
            <div
              key={card.key}
              onClick={() => handleCardClick(card)}
              className={`bg-white rounded-xl shadow-sm border border-gray-100
                         flex-shrink-0 min-w-[165px] overflow-hidden
                         ${card.clickable || card.scrollTo
                           ? 'cursor-pointer hover:shadow-md hover:border-purple-200 transition-all'
                           : ''}`}
              style={{ borderTop: `3px solid ${card.color}` }}
            >
              {/* Label row */}
              <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                <span className="text-base">{card.icon}</span>
                <span className="text-[10px] font-semibold text-gray-400
                                 tracking-wider uppercase leading-tight">
                  {card.label}
                </span>
                {card.clickable && (
                  <span className="ml-auto text-purple-400 text-xs">↗</span>
                )}
                {card.scrollTo && (
                  <span className="ml-auto text-gray-400 text-xs">↓</span>
                )}
              </div>

              {/* Value */}
              <div className="px-4 pb-1">
                <span className={`text-2xl font-bold text-[#1C2B3A]
                  ${card.clickable
                    ? 'underline decoration-dotted decoration-purple-300'
                    : ''}`}>
                  {formatted}
                </span>
              </div>

              {/* Change indicator */}
              <div className="px-4 pb-3">
                {change !== null && change !== undefined ? (
                  <div className={`flex items-center gap-1 text-xs font-medium
                    ${change > 0
                      ? 'text-green-600'
                      : change < 0
                        ? 'text-red-500'
                        : 'text-gray-400'}`}>
                    {change > 0 ? (
                      <span className="bg-green-50 px-1.5 py-0.5 rounded">
                        ▲ +{change}% vs prev
                      </span>
                    ) : change < 0 ? (
                      <span className="bg-red-50 px-1.5 py-0.5 rounded">
                        ▲ +{change}% vs prev
                      </span>
                    ) : (
                      <span className="text-gray-400">— no change</span>
                    )}
                  </div>
                ) : (
                  card.clickable && (
                    <div className="text-xs text-purple-500">
                      Click for breakdown
                    </div>
                  )
                )}
              </div>

            </div>
          )
        })}
      </div>

      {/* Revenue Dialog */}
      {openDialog && (
        <RevenueDialog
          filters={filters}
          type={openDialog}
          totalValue={formatValue(
            metrics[
              openDialog === 'collected' ? 'collectedRevenue' : 'gmv'
            ],
            'currency'
          )}
          onClose={() => setOpenDialog(null)}
        />
      )}
    </>
  )
}