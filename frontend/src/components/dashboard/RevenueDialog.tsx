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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Success':      'bg-green-50 text-green-700 border border-green-100',
    'Failed':       'bg-red-50 text-red-600 border border-red-100',
    'User Dropped': 'bg-amber-50 text-amber-700 border border-amber-100',
  }
  const cls = styles[status] ?? 'bg-gray-50 text-gray-500 border border-gray-100'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${cls}`}>
      {status}
    </span>
  )
}

export default function RevenueDialog({ filters, type, totalValue, onClose }: Props) {
  const isGmv = type === 'gmv'
  const { data, isLoading } = useRevenueBreakdown(filters, type, true)

  const title = isGmv ? 'GMV Breakdown' : 'Collected Revenue Breakdown'
  const description = isGmv
    ? `All confirmed orders contributing to ${totalValue} GMV — including pending, failed and dropped payments.`
    : `Every successful payment contributing to ${totalValue} collected revenue.`

  const gmvHeaders   = ['Date', 'Order ID', 'Customer', 'Store / Location', 'Product', 'Payment Method', 'Status', 'Amount']
  const crHeaders    = ['Date', 'Order ID', 'Customer', 'Store / Location', 'Product', 'Payment Method', 'Amount']
  const headers = isGmv ? gmvHeaders : crHeaders

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl
                        max-h-[85vh] flex flex-col">

          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-[#1C2B3A] flex items-center gap-2">
                {isGmv ? '₹' : '💰'} {title}
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
                    {headers.map(h => (
                      <th key={h}
                          className="text-left text-xs font-semibold text-gray-400
                                     uppercase tracking-wider pb-3 pr-4 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.items.map((item, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap text-xs">
                        {item.date}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs bg-gray-100
                                         px-2 py-0.5 rounded text-gray-600 whitespace-nowrap">
                          {String(item.orderId)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-[#1C2B3A] whitespace-nowrap">{item.customer}</div>
                        <div className="text-xs text-gray-400">{item.phone}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-[#1C2B3A]">{item.store}</div>
                        <div className="text-xs text-gray-400">{item.city}, {item.state}</div>
                      </td>
                      <td className="py-3 pr-4 max-w-[200px]">
                        <div className="text-xs text-gray-600 line-clamp-2 leading-snug">
                          {item.product}
                        </div>
                        {item.qty > 1 && (
                          <div className="text-xs text-gray-400 mt-0.5">Qty: {item.qty}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="bg-purple-50 text-purple-700 text-xs
                                         px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                          {item.paymentMethod}
                        </span>
                      </td>
                      {isGmv && (
                        <td className="py-3 pr-4">
                          <StatusBadge status={item.paymentStatus ?? 'Success'} />
                        </td>
                      )}
                      <td className={`py-3 font-semibold whitespace-nowrap ${
                        item.paymentStatus === 'Failed' || item.paymentStatus === 'User Dropped'
                          ? 'text-gray-400 line-through'
                          : 'text-[#1C2B3A]'
                      }`}>
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl
                          flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{data?.items.length ?? 0} orders</span>
              {isGmv && data && (
                <>
                  <span className="text-green-600 font-medium">
                    ✓ {data.items.filter(i => i.paymentStatus === 'Success').length} success
                  </span>
                  <span className="text-red-500 font-medium">
                    ✗ {data.items.filter(i => i.paymentStatus === 'Failed').length} failed
                  </span>
                  <span className="text-amber-500 font-medium">
                    ↩ {data.items.filter(i => i.paymentStatus === 'User Dropped').length} dropped
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Total:</span>
              <span className="text-base font-bold text-[#1C2B3A]">{totalValue}</span>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
