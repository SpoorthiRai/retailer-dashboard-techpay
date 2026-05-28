import type { MetricsResponse } from '@/types/api.types'
import PaymentHealthSection from '../PaymentHealthSection'
import EMISection from '../EMISection'

interface Props {
  metrics: MetricsResponse
}

export default function PaymentsTab({ metrics }: Props) {
  return (
    <div className="space-y-6">

      {/* Section heading */}
      <div>
        <h2 className="text-lg font-semibold text-[#1C2B3A]">
          Payment Health
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Order funnel, payment methods and store failure rates
        </p>
      </div>

      <PaymentHealthSection metrics={metrics} />

      <div>
        <h2 className="text-lg font-semibold text-[#1C2B3A]">
          EMI / BNPL Analysis
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          EMI order breakdown and ticket size comparison
        </p>
      </div>

      <EMISection metrics={metrics} />

    </div>
  )
}