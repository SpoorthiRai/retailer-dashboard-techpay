import type { Filters } from '@/types/api.types'

interface Props {
  filters: Filters
  onFiltersChange: (f: Filters) => void
}

const DEFAULT_DATE_FROM = '2026-05-01'
const DEFAULT_DATE_TO   = '2026-05-31'

const QUICK_RANGES = [
  { label: 'All',          dateFrom: '2025-09-01',    dateTo: today()            },
  { label: 'This Week',    dateFrom: getWeekStart(),   dateTo: today()            },
  { label: 'This Month',   dateFrom: getMonthStart(),  dateTo: today()            },
  { label: 'This Quarter', dateFrom: getQuarterStart(), dateTo: today()           },
  { label: 'This Year',    dateFrom: getYearStart(),   dateTo: today()            },
]

export default function DateFilterBar({ filters, onFiltersChange }: Props) {
  const activeRange = QUICK_RANGES.find(
    r => r.dateFrom === filters.dateFrom && r.dateTo === filters.dateTo
  )?.label ?? ''

  function handleQuickRange(range: typeof QUICK_RANGES[number]) {
    onFiltersChange({ ...filters, dateFrom: range.dateFrom, dateTo: range.dateTo })
  }

  // Resets dates back to default May
  function handleClear() {
    onFiltersChange({ ...filters, dateFrom: DEFAULT_DATE_FROM, dateTo: DEFAULT_DATE_TO })
  }

  const isDefault =
    filters.dateFrom === DEFAULT_DATE_FROM &&
    filters.dateTo   === DEFAULT_DATE_TO

  return (
    <div className="bg-[#4a0072] rounded-xl p-4 space-y-3">

      {/* Row 1 — date inputs */}
      <div className="flex items-center gap-2">
        <span className="text-white/50 text-sm">From</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
          className="bg-[#6a0096] text-white text-sm rounded-lg px-3 py-2
                     border border-white/10 cursor-pointer
                     focus:outline-none focus:ring-1 focus:ring-white/30"
        />
        <span className="text-white/50 text-sm">To</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
          className="bg-[#6a0096] text-white text-sm rounded-lg px-3 py-2
                     border border-white/10 cursor-pointer
                     focus:outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>

      {/* Row 2 — quick range buttons + Clear */}
      <div className="flex items-center gap-2">
        {QUICK_RANGES.map((range) => (
          <button
            key={range.label}
            onClick={() => handleQuickRange(range)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${activeRange === range.label
                ? 'bg-white text-[#4a0072]'
                : 'text-white/60 hover:text-white hover:bg-white/10'}`}
          >
            {range.label}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-4 bg-white/20 mx-1" />

        {/* Clear — resets to default May */}
        <button
          onClick={handleClear}
          disabled={isDefault}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
                     font-medium transition-colors border
                     ${isDefault
                       ? 'text-white/25 border-white/10 cursor-not-allowed'
                       : 'text-white border-white/30 hover:bg-white/10 cursor-pointer'}`}
        >
          ✕ Clear
        </button>
      </div>

    </div>
  )
}

// ---- Date helpers ----
function today() { return new Date().toISOString().slice(0, 10) }
function getWeekStart() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().slice(0, 10)
}
function getMonthStart() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function getQuarterStart() {
  const d = new Date()
  const q = Math.floor(d.getMonth() / 3)
  return `${d.getFullYear()}-${String(q * 3 + 1).padStart(2, '0')}-01`
}
function getYearStart() { return `${new Date().getFullYear()}-01-01` }
