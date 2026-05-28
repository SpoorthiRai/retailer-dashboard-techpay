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
  'retailer@techpay.ai': {
    password: 'demo123',
    role: 'retailer',
    name: 'HP Retail Partner',
    email: 'retailer@techpay.ai',
    storeIds: ['694116c6cf680aaab0604138', '69796a9f54c43a3e763a968f'],
  },
  'store@techpay.ai': {
    password: 'demo123',
    role: 'store_manager',
    name: 'HP India Manager',
    email: 'store@techpay.ai',
    storeIds: ['694116c6cf680aaab0604138'],
    storeName: 'HP India, Chennai',
  },
}

const DEFAULT_FILTERS: Filters = {
  state: [],
  city: [],
  store: [],
  dateFrom: '2025-11-01',
  dateTo: '2026-03-31',
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
    setRetailerInitialFilters(loginFilters)
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