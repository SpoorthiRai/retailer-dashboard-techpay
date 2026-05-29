import { useState } from 'react'
import type { Filters } from '@/types/api.types'

interface Props {
  filters: Filters
  onFiltersChange: (f: Filters) => void
}

const DEFAULT_DATE_FROM = '2026-05-01'
const DEFAULT_DATE_TO = '2026-05-31'

const QUICK_RANGES = [
  { label: 'All',          dateFrom: DEFAULT_DATE_FROM, dateTo: DEFAULT_DATE_TO },
  { label: 'This Week',    dateFrom: getWeekStart(), dateTo: today() },
  { label: 'This Month',   dateFrom: getMonthStart(), dateTo: today() },
  { label: 'This Quarter', dateFrom: getQuarterStart(), dateTo: today() },
  { label: 'This Year',    dateFrom: getYearStart(), dateTo: today() },
]

export default function DateFilterBar({ filters, onFiltersChange }: Props) {
  const [activeRange, setActiveRange] = useState('All')

  function handleQuickRange(range: typeof QUICK_RANGES[number]) {
    setActiveRange(range.label)
    onFiltersChange({ ...filters, dateFrom: range.dateFrom, dateTo: range.dateTo })
  }

  function resetDateFilters() {
    setActiveRange('All')
    onFiltersChange({ ...filters, dateFrom: DEFAULT_DATE_FROM, dateTo: DEFAULT_DATE_TO })
  }

  const dateFilterActive =
    filters.dateFrom !== DEFAULT_DATE_FROM || filters.dateTo !== DEFAULT_DATE_TO

  return (
    <div className="bg-[#4a0072] rounded-xl p-4 space-y-3">

      {/* Row 1 — date range + clear */}
      <div className="flex items-center gap-2">
        <span className="text-white/50 text-sm">From</span>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => {
            setActiveRange('')
            onFiltersChange({ ...filters, dateFrom: e.target.value })
          }}
          className="bg-[#6a0096] text-white text-sm rounded-lg px-3 py-2
                     border border-white/10 cursor-pointer
                     focus:outline-none focus:ring-1 focus:ring-white/30"
        />
        <span className="text-white/50 text-sm">To</span>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => {
            setActiveRange('')
            onFiltersChange({ ...filters, dateTo: e.target.value })
          }}
          className="bg-[#6a0096] text-white text-sm rounded-lg px-3 py-2
                     border border-white/10 cursor-pointer
                     focus:outline-none focus:ring-1 focus:ring-white/30"
        />

        {/* Clear date range */}
        <button
          onClick={resetDateFilters}
          disabled={!dateFilterActive}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg
                     text-sm font-medium transition-colors border
                     ${dateFilterActive
                       ? 'bg-white/10 hover:bg-white/20 text-white border-white/20 cursor-pointer'
                       : 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'}`}
        >
          <span>✕</span>
          <span>Clear Dates</span>
        </button>
      </div>

      {/* Row 2 — quick range buttons */}
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
