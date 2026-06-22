interface StatsPanelProps {
  stepCount: number
  pathLen: number | null
  time: number | null
  running: boolean
  finished: boolean
  backendMode: boolean
}

export default function StatsPanel({ stepCount, pathLen, time, running, finished, backendMode }: StatsPanelProps) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#737373] mb-4">
        Statistics
      </h2>
      <div className="space-y-3">
        {[
          { label: 'Steps', value: String(stepCount) },
          { label: 'Path Length', value: pathLen !== null ? String(pathLen) : running ? '...' : '-' },
          { label: 'Time', value: time !== null ? `${time.toFixed(1)}ms` : running ? '...' : '-' },
        ].map(({ label, value }) => (
          <div key={label}
            className="flex justify-between items-center py-2 border-b border-[#1e1e1e] last:border-b-0">
            <span className="text-xs text-[#737373]">{label}</span>
            <span className="text-sm font-mono font-semibold text-[#fafafa] tabular-nums">
              {value}
            </span>
          </div>
        ))}
        {backendMode && (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold
              bg-blue-900/30 text-blue-400 border border-blue-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Backend
            </span>
          </div>
        )}
        {finished && !backendMode && (
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold
              bg-emerald-900/30 text-emerald-400 border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Path Found
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
