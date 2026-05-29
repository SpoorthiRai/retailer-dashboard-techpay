import { useState } from 'react'

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
    description: 'Manage all retail stores, view consolidated performance across your entire network.',
    icon: '🏢',
    color: '#4a0072',
    email: 'disti@techpay.ai',
    password: 'demo123',
    features: [
      { icon: '📊', label: 'All-store analytics' },
      { icon: '🏪', label: 'Multi-store network view' },
      { icon: '💳', label: 'Payment gateway health' },
    ],
  },
  {
    id: 'retailer' as const,
    title: 'Retail Partner',
    description: 'Monitor store network performance, track orders, and view payment insights.',
    icon: '🏪',
    color: '#2E86C1',
    email: 'aadicomputech.retailer@techpay.ai',
    password: 'demo123',
    features: [
      { icon: '📈', label: 'Network-wide performance' },
      { icon: '💰', label: 'Orders & EMI insights' },
      { icon: '📦', label: 'Inventory across stores' },
    ],
  },
  {
    id: 'store_manager' as const,
    title: 'Store Manager',
    description: "View your store's performance, inventory levels, and order activity.",
    icon: '👤',
    color: '#1A8C7A',
    email: 'aadicomputechsec14.store@techpay.ai',
    password: 'demo123',
    features: [
      { icon: '📦', label: 'Store-level inventory' },
      { icon: '📋', label: 'Your orders & payments' },
      { icon: '🎯', label: 'Store ranking & targets' },
    ],
  },
]

function IconEmail() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

export default function LoginPage({ onLogin, error }: Props) {
  const [selectedRole, setSelectedRole] = useState<SelectedRole>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginFilters, setLoginFilters] = useState<LoginFilters>({ state: [], city: [], store: [] })

  // ── Shared ───────────────────────────────────────────────────
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

  // ── Role selection screen ────────────────────────────────────
  if (!selectedRole) {
    return (
      <div className="login-bg min-h-screen flex flex-col items-center justify-center px-6 py-16">

        {/* Logo */}
        <img
          src="/techpay_new_logo.png"
          alt="TechPay"
          className="h-10 w-auto mb-12"
        />

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#1C2B3A] tracking-tight leading-tight">
            Select your role
          </h1>
          <p className="text-base text-gray-400 mt-2.5">
            Choose how you'd like to sign in to the portal
          </p>
        </div>

        {/* Role cards — 3-col grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role)}
              className="bg-white rounded-3xl p-6 text-left flex flex-col
                         border border-gray-100 shadow-sm
                         hover:shadow-lg hover:-translate-y-0.5
                         transition-all duration-200 group"
            >
              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center
                           text-2xl mb-5 transition-transform duration-200
                           group-hover:scale-105"
                style={{ background: `${role.color}18` }}
              >
                {role.icon}
              </div>

              {/* Title + description */}
              <h3 className="text-lg font-bold text-[#1C2B3A] leading-snug mb-2">
                {role.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                {role.description}
              </p>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-4" />

              {/* Feature list */}
              <div className="space-y-2.5">
                {role.features.map((f) => (
                  <div key={f.label} className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{f.icon}</span>
                    <span className="text-sm text-gray-500">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Subtle "continue" hint on hover */}
              <div
                className="mt-5 text-xs font-medium opacity-0 group-hover:opacity-100
                           transition-opacity duration-200 flex items-center gap-1"
                style={{ color: role.color }}
              >
                Continue <span>→</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-300 mt-10">
          TechPay Partner Portal · Secure access
        </p>
      </div>
    )
  }

  // ── Login form screen ────────────────────────────────────────
  return (
    <div className="login-form-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-sm text-gray-400
                     hover:text-gray-700 transition-colors mb-5 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back</span>
        </button>

        {/* Card */}
        {selected && (
          <div
            className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
            style={{ borderTop: `3px solid ${selected.color}` }}
          >
            <div className="p-7">

              {/* Role header */}
              <div className="flex items-center gap-3 mb-7">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${selected.color}15` }}
                >
                  {selected.icon}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#1C2B3A] leading-tight">
                    {selected.title}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">Sign in to your portal</p>
                </div>
              </div>


              {/* Credentials */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email address</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><IconEmail /></div>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300
                                 bg-gray-50/80 transition-all placeholder:text-gray-300"
                      placeholder="you@company.com" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"><IconLock /></div>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && onLogin(email, password, loginFilters)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                                 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300
                                 bg-gray-50/80 transition-all placeholder:text-gray-300"
                      placeholder="••••••••" />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-500 text-xs px-4 py-2.5 rounded-xl text-center">
                    {error}
                  </div>
                )}

                <button
                  onClick={() => onLogin(email, password, loginFilters)}
                  className="w-full py-2.5 rounded-xl text-white font-semibold text-sm
                             transition-all hover:opacity-90 hover:shadow-md mt-1"
                  style={{ background: `linear-gradient(135deg, ${selected.color} 0%, ${selected.color}cc 100%)` }}
                >
                  Sign in
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
