// ============================================================
// REVENUE BREAKDOWN DIALOG
// Opens when user clicks Collected Revenue or GMV KPI card.
// Shows order-level detail from the backend.
// ============================================================


import { useRevenueBreakdown } from '@/hooks/useApi'
import type { Filters } from '@/types/api.types'

interface Props {
  filters: Filters
  type: 'collected' | 'gmv'
  totalValue: string
  onClose: () => void
}

function formatCurrency(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}

export default function RevenueDialog({ filters, type, totalValue, onClose }: Props) {
  const { data, isLoading } = useRevenueBreakdown(filters, true)

  const title = type === 'collected'
    ? 'Collected Revenue Breakdown'
    : 'GMV Breakdown'

  const description = type === 'collected'
    ? `Order-level detail showing every successful payment contributing to ${totalValue} collected revenue.`
    : `Order-level detail showing all confirmed orders contributing to ${totalValue} GMV.`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl 
                        max-h-[85vh] flex flex-col">

          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                💰 {title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors
                         w-8 h-8 flex items-center justify-center rounded-full
                         hover:bg-gray-100 text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-gray-400">Loading breakdown...</div>
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-gray-400">No orders found for this period.</div>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Date','Order ID','Store / Location',
                      'Payment','Unit Price','Amount'].map(h => (
                      <th key={h}
                          className="text-left text-xs font-semibold text-gray-400
                                     uppercase tracking-wider pb-3 pr-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs bg-gray-100 
                                         px-2 py-0.5 rounded text-gray-600 whitespace-nowrap">
                          {String(item.orderId)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-[#1C2B3A]">{item.store}</div>
                        <div className="text-xs text-gray-400">
                          {item.city}, {item.state}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="bg-purple-50 text-purple-700 text-xs 
                                         px-2 py-0.5 rounded-full font-medium">
                          {item.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 font-semibold text-[#1C2B3A]">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          {data && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl
                            flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {data.items.length} orders
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Total:</span>
                <span className="text-base font-bold text-[#1C2B3A]">
                  {formatCurrency(data.total)}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}