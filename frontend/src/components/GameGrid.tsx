import { useMemo } from 'react'
import { AStarStep } from '../types'

interface GameGridProps {
  size: number
  walls: Set<string>
  step: AStarStep | null
}

function key(r: number, c: number): string { return `${r},${c}` }

export default function GameGrid({ size, walls, step }: GameGridProps) {
  const maxGridPx = typeof window !== 'undefined'
    ? Math.min(window.innerWidth - 48, 640)
    : 560
  const cellSize = Math.max(Math.min(Math.floor(maxGridPx / size), 36), 12)

  const cells = useMemo(() => {
    const result: { type: string }[] = []
    const startKey = key(0, 0)
    const goalKey = key(size - 1, size - 1)

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const k = key(r, c)
        let type = 'empty'
        if (k === startKey) type = 'start'
        else if (k === goalKey) type = 'goal'
        else if (walls.has(k)) type = 'wall'
        else if (step?.path && step.path.some(p => key(p[0], p[1]) === k)) type = 'path'
        else if (step?.current && key(step.current[0], step.current[1]) === k) type = 'current'
        else if (step?.closedSet.has(k)) type = 'closed'
        else if (step?.openSet.has(k)) type = 'open'
        result.push({ type })
      }
    }
    return result
  }, [size, walls, step])

  const colorMap: Record<string, string> = {
    empty: 'bg-[#1a1a1a]',
    wall: 'bg-[#0a0a0a] border border-[#2a2a2a]',
    start: 'bg-emerald-500',
    goal: 'bg-blue-500',
    open: 'bg-amber-500/70',
    closed: 'bg-[#2a2a2a]',
    current: 'bg-cyan-400',
    path: 'bg-white',
  }

  return (
    <div className="flex justify-center w-full overflow-x-auto pb-2">
      <div
        className="grid gap-[1px] bg-[#1e1e1e] p-[1px] rounded-lg overflow-hidden shrink-0"
        style={{
          gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
        }}
      >
        {cells.map(({ type }, i) => (
          <div
            key={i}
            className={`${colorMap[type] || 'bg-[#1a1a1a]'} transition-colors duration-150`}
            style={{ width: cellSize, height: cellSize }}
          />
        ))}
      </div>
    </div>
  )
}
