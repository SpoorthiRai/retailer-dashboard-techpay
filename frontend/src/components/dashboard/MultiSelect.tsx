// ============================================================
// MULTI-SELECT DROPDOWN
// Allows selecting multiple options with checkboxes.
// Shows count of selected items in the trigger button.
// ============================================================

import { useState, useRef, useEffect } from 'react'

interface Props {
  label: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  variant?: 'dark' | 'light'
  disabled?: boolean
}

export default function MultiSelect({ label, options, selected, onChange, variant = 'dark', disabled = false }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggleOption(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  function clearAll() {
    onChange([])
  }

  function selectAll() {
    onChange([...options])
  }

  const displayText = selected.length === 0
    ? `All ${label}`
    : selected.length === 1
      ? selected[0]
      : `${selected.length} ${label} selected`

  const triggerClass = variant === 'light'
    ? `bg-white text-[#1C2B3A] text-sm rounded-lg px-3 py-2
       border border-gray-200 min-w-[150px] cursor-pointer
       focus:outline-none focus:ring-1 focus:ring-purple-300
       flex items-center justify-between gap-2 w-full
       hover:border-gray-300 transition-colors
       ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
    : `bg-[#6a0096] text-white text-sm rounded-lg px-3 py-2
       border border-white/10 min-w-[150px] cursor-pointer
       focus:outline-none focus:ring-1 focus:ring-white/30
       flex items-center justify-between gap-2`

  return (
    <div ref={ref} className="relative">

      {/* Trigger button */}
      <button
        onClick={() => !disabled && setOpen(!open)}
        className={triggerClass}
      >
        <span className="truncate max-w-[150px] text-left">{displayText}</span>
        <span className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl
                        border border-gray-100 z-50 min-w-[220px] max-h-64 flex flex-col">

          {/* Select all / Clear */}
          <div className="flex items-center justify-between px-3 py-2
                          border-b border-gray-100 flex-shrink-0">
            <button
              onClick={selectAll}
              className="text-xs text-[#4a0072] font-medium hover:underline"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
            >
              Clear
            </button>
          </div>

          {/* Options */}
          <div className="overflow-y-auto flex-1">
            {options.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-400">
                No options available
              </div>
            ) : (
              options.map(opt => (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 px-3 py-2
                             hover:bg-purple-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => toggleOption(opt)}
                    className="w-4 h-4 rounded accent-[#4a0072] cursor-pointer"
                  />
                  <span className="text-sm text-[#1C2B3A] truncate">{opt}</span>
                </label>
              ))
            )}
          </div>

          {/* Footer — show count */}
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex-shrink-0">
              <span className="text-xs text-gray-400">
                {selected.length} of {options.length} selected
              </span>
            </div>
          )}

        </div>
      )}
    </div>
  )
}