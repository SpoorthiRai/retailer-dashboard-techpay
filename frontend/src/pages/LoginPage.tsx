import { useState } from 'react'
import { useFilterOptions } from '@/hooks/useApi'
import MultiSelect from '@/components/dashboard/MultiSelect'

interface LoginFilters {
  state: string[]
  city: string[]
  store: string[]
}

interface Props {
  onLogin: (email: string, password: string, filters: LoginFilters) => void
  error: string
}

type SelectedRole = 'distributor' | 'retailer' | 'store_manager' | null

const ROLES = [
  {
    id: 'distributor' as const,
    title: 'Distributor',
    icon: '🏢',
    color: '#4a0072',
    email: 'disti@techpay.ai',
    password: 'demo123',
  },
  {
    id: 'retailer' as const,
    title: 'Retail Partner',
    icon: '🏪',
    color: '#2E86C1',
    email: 'retailer@techpay.ai',
    password: 'demo123',
  },
  {
    id: 'store_manager' as const,
    title: 'Store Manager',
    icon: '👤',
    color: '#1A8C7A',
    email: 'store@techpay.ai',
    password: 'demo123',
  },
]

const selectClass = `w-full px-3 py-2.5 border border-gray-200 rounded-xl
  text-sm text-[#1C2B3A] bg-white focus:outline-none
  focus:ring-2 focus:ring-purple-300 focus:border-transparent
  cursor-pointer transition-all appearance-none`

export default function LoginPage({ onLogin, error }: Props) {
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginFilters, setLoginFilters] = useState<LoginFilters>({ state: [], city: [], store: [] })

  const { data: filterOptions } = useFilterOptions()

  // ── Retailer: multi-select cascading ──────────────────────
  const multiAvailableCities = loginFilters.state.length > 0 && filterOptions
    ? [...new Set(loginFilters.state.flatMap(s => filterOptions.stateToCities[s] || []))]
    : filterOptions?.cities ?? []

  const multiAvailableStores = loginFilters.city.length > 0 && filterOptions
    ? [...new Set(loginFilters.city.flatMap(c => filterOptions.cityToStores[c] || []))]
    : filterOptions?.stores ?? []

  function handleMultiStateChange(selected: string[]) {
    if (!filterOptions) return
    const validCities = selected.length > 0
      ? [...new Set(selected.flatMap(s => filterOptions.stateToCities[s] || []))]
      : filterOptions.cities
    const newCities = loginFilters.city.filter(c => validCities.includes(c))
    const validStores = newCities.length > 0
      ? [...new Set(newCities.flatMap(c => filterOptions.cityToStores[c] || []))]
      : filterOptions.stores
    const newStores = loginFilters.store.filter(s => validStores.includes(s))
    setLoginFilters({ state: selected, city: newCities, store: newStores })
  }

  function handleMultiCityChange(selected: string[]) {
    if (!filterOptions) return
    const validStores = selected.length > 0
      ? [...new Set(selected.flatMap(c => filterOptions.cityToStores[c] || []))]
      : filterOptions.stores
    const newStores = loginFilters.store.filter(s => validStores.includes(s))
    setLoginFilters({ ...loginFilters, city: selected, store: newStores })
  }

  // ── Store Manager: single-select cascading ─────────────────
  const singleAvailableCities = loginFilters.state[0] && filterOptions
    ? (filterOptions.stateToCities[loginFilters.state[0]] ?? [])
    : filterOptions?.cities ?? []

  const singleAvailableStores = loginFilters.city[0] && filterOptions
    ? (filterOptions.cityToStores[loginFilters.city[0]] ?? [])
    : filterOptions?.stores ?? []

  function handleSingleStateChange(value: string) {
    setLoginFilters({ state: value ? [value] : [], city: [], store: [] })
  }

  function handleSingleCityChange(value: string) {
    setLoginFilters(f => ({ ...f, city: value ? [value] : [], store: [] }))
  }

  function handleSingleStoreChange(value: string) {
    setLoginFilters(f => ({ ...f, store: value ? [value] : [] }))
  }

  // ── Shared ─────────────────────────────────────────────────
  function handleRoleSelect(role: typeof ROLES[0]) {
    setSelectedRole(role.id)
    setEmail(role.email)
    setPassword(role.password)
    setLoginFilters({ state: [], city: [], store: [] })
  }

  function handleBack() {
    setSelectedRole(null)
    setEmail('')
    setPassword('')
    setLoginFilters({ state: [], city: [], store: [] })
  }

  const selected = ROLES.find(r => r.id === selectedRole)
  const showMultiFilters  = selectedRole === 'retailer'
  const showSingleFilters = selectedRole === 'store_manager'
  const showAnyFilters    = showMultiFilters || showSingleFilters

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col
                    items-center justify-center p-6"
         style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* Role selection screen */}
      {!selectedRole && (
        <div className="w-full max-w-lg animate-fade-in">

          {/* Logo */}
          <div className="text-center mb-10">
            <img
              src="/techpay_new_logo.png"
              alt="TechPay"
              className="mx-auto mb-4 h-14 w-auto"
            />
            <p className="text-gray-400 text-sm mt-1">Partner Portal</p>
          </div>

          {/* Role cards */}
          <div className="space-y-3">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className="w-full bg-white rounded-2xl p-5 border border-gray-200
                           hover:shadow-lg hover:border-gray-300 transition-all
                           text-left flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center
                                justify-center text-2xl flex-shrink-0"
                     style={{ background: `${role.color}15` }}>
                  {role.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#1C2B3A] text-base">
                    {role.title}
                  </div>
                </div>
                <div className="text-gray-300 group-hover:text-gray-500
                                group-hover:translate-x-1 transition-all text-lg">
                  →
                </div>
              </button>
            ))}
          </div>

        </div>
      )}

      {/* Login form screen */}
      {selectedRole && selected && (
        <div className={`w-full ${showAnyFilters ? 'max-w-lg' : 'max-w-sm'}`}>

          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-400
                       hover:text-gray-600 transition-colors mb-6"
          >
            ← Back
          </button>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">

            {/* Role icon + title */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center
                              justify-center text-3xl mx-auto mb-3"
                   style={{ background: `${selected.color}15` }}>
                {selected.icon}
              </div>
              <h2 className="text-xl font-bold text-[#1C2B3A]">
                {selected.title} Login
              </h2>
              <p className="text-gray-400 text-sm mt-1">Sign in to your portal</p>
            </div>

            {/* ── Multi-select filters — Retail Partner ── */}
            {showMultiFilters && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#2E86C1] rounded-full" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Filter your view
                  </span>
                </div>

                {!filterOptions ? (
                  <div className="grid grid-cols-3 gap-3">
                    {['States', 'Cities', 'Stores'].map(l => (
                      <div key={l} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">States</label>
                      <MultiSelect
                        label="States"
                        options={filterOptions.states}
                        selected={loginFilters.state}
                        onChange={handleMultiStateChange}
                        variant="light"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Cities</label>
                      <MultiSelect
                        label="Cities"
                        options={multiAvailableCities}
                        selected={loginFilters.city}
                        onChange={handleMultiCityChange}
                        variant="light"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Stores</label>
                      <MultiSelect
                        label="Stores"
                        options={multiAvailableStores}
                        selected={loginFilters.store}
                        onChange={s => setLoginFilters(f => ({ ...f, store: s }))}
                        variant="light"
                      />
                    </div>
                  </div>
                )}

                {(loginFilters.state.length > 0 || loginFilters.city.length > 0 || loginFilters.store.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {loginFilters.state.map(s => (
                      <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {loginFilters.city.map(c => (
                      <span key={c} className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                    {loginFilters.store.map(s => (
                      <span key={s} className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    <button
                      onClick={() => setLoginFilters({ state: [], city: [], store: [] })}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
                    >
                      Clear all
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Leave all at "All" to see the full network
                </p>
              </div>
            )}

            {/* ── Single-select filters — Store Manager ── */}
            {showSingleFilters && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1A8C7A] rounded-full" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Select your view
                  </span>
                </div>

                {!filterOptions ? (
                  <div className="grid grid-cols-3 gap-3">
                    {['State', 'City', 'Store'].map(l => (
                      <div key={l} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    {/* State */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">State</label>
                      <div className="relative">
                        <select
                          value={loginFilters.state[0] ?? ''}
                          onChange={e => handleSingleStateChange(e.target.value)}
                          className={selectClass}
                        >
                          <option value="">All States</option>
                          {filterOptions.states.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2
                                         -translate-y-1/2 text-gray-400 text-xs">▼</span>
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">City</label>
                      <div className="relative">
                        <select
                          value={loginFilters.city[0] ?? ''}
                          onChange={e => handleSingleCityChange(e.target.value)}
                          className={selectClass}
                          disabled={singleAvailableCities.length === 0}
                        >
                          <option value="">All Cities</option>
                          {singleAvailableCities.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2
                                         -translate-y-1/2 text-gray-400 text-xs">▼</span>
                      </div>
                    </div>

                    {/* Store */}
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Store</label>
                      <div className="relative">
                        <select
                          value={loginFilters.store[0] ?? ''}
                          onChange={e => handleSingleStoreChange(e.target.value)}
                          className={selectClass}
                          disabled={singleAvailableStores.length === 0}
                        >
                          <option value="">All Stores</option>
                          {singleAvailableStores.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2
                                         -translate-y-1/2 text-gray-400 text-xs">▼</span>
                      </div>
                    </div>

                  </div>
                )}

                {(loginFilters.state.length > 0 || loginFilters.city.length > 0 || loginFilters.store.length > 0) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {loginFilters.state[0] && (
                      <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                        {loginFilters.state[0]}
                      </span>
                    )}
                    {loginFilters.city[0] && (
                      <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                        {loginFilters.city[0]}
                      </span>
                    )}
                    {loginFilters.store[0] && (
                      <span className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full">
                        {loginFilters.store[0]}
                      </span>
                    )}
                    <button
                      onClick={() => setLoginFilters({ state: [], city: [], store: [] })}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
                    >
                      Clear
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Leave at "All" to see data across the network
                </p>
              </div>
            )}

            {/* Divider before credentials */}
            {showAnyFilters && (
              <div className="border-t border-gray-100 mb-6" />
            )}

            {/* Credentials form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500
                                  uppercase tracking-wider mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-purple-300 focus:border-transparent
                             bg-gray-50 transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500
                                  uppercase tracking-wider mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onLogin(email, password, loginFilters)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-purple-300 focus:border-transparent
                             bg-gray-50 transition-all"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600
                                text-sm px-4 py-3 rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                onClick={() => onLogin(email, password, loginFilters)}
                className="w-full py-3 rounded-xl text-white font-semibold
                           text-sm transition-all hover:opacity-90 hover:shadow-lg mt-2"
                style={{ background: '#4a0072' }}
              >
                Sign in
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
