// ============================================================
// DASHBOARD HEADER
// Top bar of the dashboard — logo, title, subtitle
// ============================================================

export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/10">
      
      {/* Left side — logo + title */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#1A8C7A] flex items-center justify-center">
          <span className="text-white font-bold text-lg">T</span>
        </div>
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">
            TechPay
          </h1>
          <p className="text-white/50 text-xs">
            Retail Partner Sales Dashboard
          </p>
        </div>
      </div>

      {/* Right side — live indicator */}
      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-white/60 text-xs">Live Data</span>
      </div>

    </div>
  )
}