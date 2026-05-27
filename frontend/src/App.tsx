// ============================================================
// APP ROOT
// Handles routing. Right now we only have one page —
// the dashboard. More pages (login, store detail etc.)
// can be added here later.
// ============================================================

import { useState } from 'react'
import type { Filters } from '@/types/api.types'
import Dashboard from './pages/Dashboard'

const DEFAULT_FILTERS: Filters = {
  state: [],
  city: [],
  store: [],
  dateFrom: '2025-11-01',
  dateTo: '2026-03-31',
}

function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  return (
    <Dashboard filters={filters} onFiltersChange={setFilters} />
  )
}

export default App