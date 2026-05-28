interface Tab {
  id: string
  label: string
  icon: string
}

interface Props {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
}

export default function TabNav({ tabs, activeTab, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 bg-white rounded-xl p-1 
                    border border-gray-200 shadow-sm w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm 
                     font-medium transition-all
            ${activeTab === tab.id
              ? 'bg-[#4a0072] text-white shadow-sm'
              : 'text-gray-500 hover:text-[#1C2B3A] hover:bg-gray-50'}`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}