import { useState } from 'react'
import type { Filters, AuthUser } from '@/types/api.types'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'
import RetailerDashboard from './pages/RetailerDashboard'
// ── Demo users ──────────────────────────────────────────────
const DEMO_USERS: Record<string, AuthUser & { password: string }> = {
  'disti@techpay.ai': {
    password: 'demo123',
    role: 'distributor',
    name: 'TechPay Admin',
    email: 'disti@techpay.ai',
    storeIds: [],
  },
  'aadicomputech.retailer@techpay.ai': {
    password: 'demo123',
    role: 'retailer',
    name: 'Aadi Computech Retail',
    email: 'aadicomputech.retailer@techpay.ai',
    storeIds: [
      '69796a9f54c43a3e763a968f', // AADI COMPUTECH - Sec -14
      '69799a9f54c43a3e763a9690', // AADI COMPUTECH - Sec 16
      '6979ba9f54c43a3e763a9691', // AADI COMPUTECH - Sec 17
    ],
  },
  'aadicomputechsec14.store@techpay.ai': {
    password: 'demo123',
    role: 'store_manager',
    name: 'Srikant (Sec -14)',
    email: 'aadicomputechsec14.store@techpay.ai',
    storeIds: ['69796a9f54c43a3e763a968f'],
    storeName: 'AADI COMPUTECH - Sec -14',
  },
}

const AADI_STORE_NAMES = [
  'AADI COMPUTECH - Sec -14',
  'AADI COMPUTECH - Sec 16',
  'AADI COMPUTECH - Sec 17',
]

const DEFAULT_FILTERS: Filters = {
  state: [],
  city: [],
  store: [],
  dateFrom: '2026-05-01',
  dateTo: '2026-05-31',
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [retailerInitialFilters, setRetailerInitialFilters] = useState<Pick<Filters, 'state' | 'city' | 'store'>>({ state: [], city: [], store: [] })
  const [loginError, setLoginError] = useState('')

  function handleLogin(email: string, password: string, loginFilters: Pick<Filters, 'state' | 'city' | 'store'>) {
    const found = DEMO_USERS[email.toLowerCase().trim()]
    if (!found || found.password !== password) {
      setLoginError('Invalid email or password')
      return
    }
    const { password: _p, ...authUser } = found
    setUser(authUser)
    // Retailer: always scope to their 3 Aadi stores — login has no filter UI
    // Store manager: always scope to their own store
    let effectiveFilters = loginFilters
    if (authUser.role === 'retailer') {
      effectiveFilters = { state: [], city: [], store: AADI_STORE_NAMES }
    } else if (authUser.role === 'store_manager' && authUser.storeName) {
      effectiveFilters = { state: [], city: [], store: [authUser.storeName] }
    }
    setRetailerInitialFilters(effectiveFilters)
    setLoginError('')
  }

  function handleLogout() {
    setUser(null)
    setFilters(DEFAULT_FILTERS)
    setRetailerInitialFilters({ state: [], city: [], store: [] })
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} error={loginError} />
  }

  // Retailer and Store Manager see retailer dashboard
  if (user.role === 'retailer' || user.role === 'store_manager') {
    return (
      <RetailerDashboard
        user={user}
        onLogout={handleLogout}
        initialFilters={retailerInitialFilters}
      />
    )
  }

  // Distributor sees full dashboard
  return (
    <Dashboard
      filters={filters}
      onFiltersChange={setFilters}
      user={user}
      onLogout={handleLogout}
    />
  )
}