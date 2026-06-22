interface NavbarProps {
  activeTab: string
  setActiveTab: (tab: 'game' | 'about') => void
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1e1e1e] z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-sm sm:text-base font-bold tracking-tight truncate">A* Pathfinding</span>
          <span className="text-[10px] font-mono text-[#525252] uppercase tracking-wider
            border border-[#1e1e1e] rounded px-1.5 py-0.5 shrink-0">
            Game
          </span>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1">
          {(['game', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-lg transition-colors cursor-pointer
                ${activeTab === tab ? 'text-[#fafafa]' : 'text-[#525252] hover:text-[#a1a1a1]'}`}>
              {activeTab === tab && (
                <span className="absolute inset-0 bg-[#1a1a1a] rounded-lg" />
              )}
              <span className="relative z-10 capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
