interface ControlsProps {
  size: number
  density: number
  running: boolean
  finished: boolean
  onSizeChange: (s: number) => void
  onDensityChange: (d: number) => void
  onGenerate: () => void
  onRun: () => void
  onStep: () => void
  onReset: () => void
  onStop: () => void
}

export default function Controls({
  size, density, running, finished,
  onSizeChange, onDensityChange, onGenerate,
  onRun, onStep, onReset, onStop,
}: ControlsProps) {
  const btnBase =
    'px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 active:scale-[0.98] cursor-pointer'

  return (
    <div className="space-y-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-[#737373]">
        Controls
      </h2>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#525252]">
            Grid Size
          </label>
          <span className="text-sm font-mono text-[#a1a1a1]">{size}</span>
        </div>
        <input
          type="range" min="5" max="30" value={size}
          onChange={e => onSizeChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#525252]">
            Wall Density
          </label>
          <span className="text-sm font-mono text-[#a1a1a1]">{density.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0.05" max="0.5" step="0.05" value={density}
          onChange={e => onDensityChange(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button onClick={() => { onGenerate(); onReset() }}
          disabled={running}
          className={`${btnBase} bg-[#1a1a1a] border border-[#2a2a2a] text-[#a1a1a1]
            hover:text-[#fafafa] hover:border-[#525252]
            disabled:opacity-40 disabled:cursor-not-allowed`}>
          Generate
        </button>
        <button onClick={onRun}
          disabled={running || finished}
          className={`${btnBase} bg-[#fafafa] text-[#0a0a0a]
            hover:bg-white
            disabled:opacity-40 disabled:cursor-not-allowed`}>
          Run
        </button>
        <button onClick={onStep}
          disabled={running || finished}
          className={`${btnBase} bg-[#1a1a1a] border border-[#2a2a2a] text-[#a1a1a1]
            hover:text-[#fafafa] hover:border-[#525252]
            disabled:opacity-40 disabled:cursor-not-allowed`}>
          Step
        </button>
        <button onClick={running ? onStop : onReset}
          className={`${btnBase} ${
            running
              ? 'bg-red-900/40 border border-red-800/60 text-red-400 hover:bg-red-800/40'
              : 'bg-[#1a1a1a] border border-[#2a2a2a] text-[#a1a1a1] hover:text-[#fafafa] hover:border-[#525252]'
          }`}>
          {running ? 'Stop' : 'Reset'}
        </button>
      </div>
    </div>
  )
}
