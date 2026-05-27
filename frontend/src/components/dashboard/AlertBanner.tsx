import { useState } from 'react'
import type { DynamicAlert } from '@/types/api.types'

interface Props {
  alerts: DynamicAlert[]
}

export default function AlertBanner({ alerts }: Props) {
  const [dismissed, setDismissed] = useState<string[]>([])

  const visible = alerts.filter((a) => !dismissed.includes(a.id))
  if (visible.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((alert) => (
        <AlertChip
          key={alert.id}
          alert={alert}
          onDismiss={() => setDismissed((d) => [...d, alert.id])}
        />
      ))}
    </div>
  )
}

function AlertChip({
  alert,
  onDismiss,
}: {
  alert: DynamicAlert
  onDismiss: () => void
}) {
  const styles = {
    red:   { bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-700'   },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  }
  const s = styles[alert.severity]

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full 
                     border text-sm font-medium ${s.bg} ${s.border} ${s.text}`}>
      <span>{alert.icon}</span>
      <span>{alert.message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 hover:opacity-60 transition-opacity font-bold text-base leading-none"
      >
        ×
      </button>
    </div>
  )
}