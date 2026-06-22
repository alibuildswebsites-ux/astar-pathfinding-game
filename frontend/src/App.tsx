import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from './components/Navbar'
import GameGrid from './components/GameGrid'
import Controls from './components/Controls'
import StatsPanel from './components/StatsPanel'
import { generateGrid, astarGenerator } from './astar'
import { AStarStep, PathfindResult } from './types'

type Tab = 'game' | 'about'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('game')
  const [size, setSize] = useState(15)
  const [density, setDensity] = useState(0.25)
  const [walls, setWalls] = useState<Set<string>>(new Set())
  const [step, setStep] = useState<AStarStep | null>(null)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [stepCount, setStepCount] = useState(0)
  const [pathLen, setPathLen] = useState<number | null>(null)
  const [time, setTime] = useState<number | null>(null)
  const [backendMode, setBackendMode] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [seed] = useState(() => Date.now())

  const generatorRef = useRef<Generator<AStarStep> | null>(null)
  const startTimeRef = useRef(0)
  const animRef = useRef<number | null>(null)
  const gridKey = useRef(0)

  const key = (r: number, c: number) => `${r},${c}`

  const initGrid = useCallback((s?: number, d?: number) => {
    const gs = s ?? size
    const gd = d ?? density
    const data = generateGrid(gs, gd, Date.now())
    setWalls(data.walls)
    setStep(null)
    setFinished(false)
    setStepCount(0)
    setPathLen(null)
    setTime(null)
    setRunning(false)
    setApiError(null)
    generatorRef.current = null
    gridKey.current++
    if (animRef.current) { clearTimeout(animRef.current); animRef.current = null }
  }, [size, density])

  useEffect(() => { initGrid() }, [])

  const checkBackend = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(3000) })
      if (res.ok) setBackendMode(true)
    } catch {}
  }, [])

  useEffect(() => { checkBackend() }, [checkBackend])

  const runBackend = useCallback(async () => {
    setRunning(true)
    setFinished(false)
    setStepCount(0)
    setPathLen(null)
    setTime(null)
    setApiError(null)

    try {
      const res = await fetch(`${API_URL}/api/pathfind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size, density, seed }),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data: PathfindResult = await res.json()

      const ws = new Set(data.walls.map(([r, c]) => key(r, c)))
      setWalls(ws)

      const fakeStep: AStarStep = {
        openSet: new Set(),
        closedSet: new Set(Array.from({ length: data.nodes_explored }, (_, i) => key(i % size, Math.floor(i / size)))),
        current: null,
        path: data.path.map(([r, c]) => [r, c]) as [number, number][],
        stepCount: data.nodes_explored,
      }
      setStep(fakeStep)
      setStepCount(data.nodes_explored)
      setPathLen(data.path_length)
      setTime(data.time_ms)
      setFinished(true)
    } catch (err: any) {
      setApiError(err.message || 'Backend unavailable')
      fallbackRun()
    } finally {
      setRunning(false)
    }
  }, [size, density, seed])

  const fallbackRun = useCallback(() => {
    const data = generateGrid(size, density, Date.now())
    setWalls(data.walls)
    generatorRef.current = astarGenerator(size, data.walls, data.start, data.goal)
    startTimeRef.current = performance.now()
    setBackendMode(false)

    const animate = () => {
      const gen = generatorRef.current
      if (!gen) { setRunning(false); return }
      const result = gen.next()
      if (result.done) { setRunning(false); return }
      const s = { ...result.value, stepCount: 0 }
      setStep(s)
      setStepCount(prev => prev + 1)
      if (s.path) {
        setFinished(true)
        setPathLen(s.path.length)
        setTime(performance.now() - startTimeRef.current)
        setRunning(false)
        return
      }
      animRef.current = setTimeout(animate, 30)
    }
    animRef.current = setTimeout(animate, 30)
  }, [size, density])

  const runClient = useCallback(() => {
    const data = generateGrid(size, density, Date.now())
    setWalls(data.walls)
    generatorRef.current = astarGenerator(size, data.walls, data.start, data.goal)
    setRunning(true)
    setFinished(false)
    setStepCount(0)
    setPathLen(null)
    setTime(null)
    startTimeRef.current = performance.now()

    const animate = () => {
      const gen = generatorRef.current
      if (!gen) { setRunning(false); return }
      const result = gen.next()
      if (result.done) { setRunning(false); return }
      const s = { ...result.value, stepCount: 0 }
      setStep(s)
      setStepCount(prev => prev + 1)
      if (s.path) {
        setFinished(true)
        setPathLen(s.path.length)
        setTime(performance.now() - startTimeRef.current)
        setRunning(false)
        return
      }
      animRef.current = setTimeout(animate, 30)
    }
    animRef.current = setTimeout(animate, 30)
  }, [size, density])

  const run = useCallback(() => {
    if (backendMode) {
      runBackend()
    } else {
      runClient()
    }
  }, [backendMode, runBackend, runClient])

  const stepOnce = useCallback(() => {
    if (!generatorRef.current) {
      const data = generateGrid(size, density, Date.now())
      setWalls(data.walls)
      generatorRef.current = astarGenerator(size, data.walls, data.start, data.goal)
      startTimeRef.current = performance.now()
    }
    const result = generatorRef.current.next()
    if (result.done) { setRunning(false); return }
    const s = { ...result.value, stepCount: 0 }
    setStep(s)
    setStepCount(prev => prev + 1)
    if (s.path) {
      setFinished(true)
      setPathLen(s.path.length)
      setTime(performance.now() - startTimeRef.current)
      generatorRef.current = null
    }
  }, [size, density])

  const reset = useCallback(() => {
    if (animRef.current) { clearTimeout(animRef.current); animRef.current = null }
    initGrid()
  }, [initGrid])

  const stop = useCallback(() => {
    if (animRef.current) { clearTimeout(animRef.current); animRef.current = null }
    setRunning(false)
  }, [])

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#0a0a0a] text-white flex flex-col pt-14 overflow-x-hidden">
      <div className="bg-grid pointer-events-none fixed inset-0 z-0" />
      <div className="bg-blob pointer-events-none fixed inset-0 z-0 animate-pulseGlow" />
      <div className="bg-vignette pointer-events-none fixed inset-0 z-0" />
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 z-10 relative py-4 sm:py-8">
        {activeTab === 'game' ? (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-6">
            <div className="lg:col-span-8 order-2 lg:order-1">
              <div className="card p-3 sm:p-4 glow-blue">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.08em] text-[#737373]">
                    Grid
                  </h2>
                  <div className="flex items-center gap-3">
                    {step && (
                      <span className="text-[10px] sm:text-xs text-[#525252] font-mono">
                        Step {stepCount}
                      </span>
                    )}
                    {backendMode && (
                      <span className="text-[10px] font-mono text-blue-400/70 uppercase tracking-wider">
                        API
                      </span>
                    )}
                  </div>
                </div>
                <GameGrid size={size} walls={walls} step={step} key={gridKey.current} />
              </div>
            </div>

            <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col gap-3 sm:gap-4">
              <div className="card p-3 sm:p-4 glow-blue">
                <Controls
                  size={size} density={density} running={running} finished={finished}
                  onSizeChange={setSize} onDensityChange={setDensity}
                  onGenerate={initGrid} onRun={run} onStep={stepOnce}
                  onReset={reset} onStop={stop}
                />
              </div>
              <div className="card p-3 sm:p-4 glow-blue">
                <StatsPanel
                  stepCount={stepCount} pathLen={pathLen} time={time}
                  running={running} finished={finished} backendMode={backendMode}
                />
              </div>
              {apiError && (
                <div className="card p-3 sm:p-4 border-red-900/50">
                  <p className="text-xs text-red-400/80 font-mono">{apiError}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-2 sm:px-0">
            <div className="card p-4 sm:p-6 glow-blue">
              <h1 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">About A* Pathfinding</h1>
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-[#a1a1a1] leading-relaxed">
                <p>
                  A* is an informed search algorithm used for pathfinding and graph traversal.
                  It finds the shortest path from a start node to a goal node using a heuristic
                  to guide its search.
                </p>
                <p className="font-mono text-[#fafafa] text-sm sm:text-base py-2 px-3 bg-[#111] rounded-lg border border-[#1e1e1e]">
                  f(n) = g(n) + h(n)
                </p>
                <ul className="space-y-1 list-disc pl-5">
                  <li><strong className="text-[#fafafa]">g(n):</strong> cost from start to node n</li>
                  <li><strong className="text-[#fafafa]">h(n):</strong> heuristic estimate (Manhattan distance)</li>
                  <li><strong className="text-[#fafafa]">f(n):</strong> total estimated cost through n</li>
                </ul>
                <p>
                  The algorithm maintains an <strong className="text-[#fafafa]">open set</strong> (frontier)
                  and a <strong className="text-[#fafafa]">closed set</strong> (evaluated nodes).
                </p>
                <div className="border-t border-[#1e1e1e] pt-4 mt-4">
                  <h3 className="text-[#fafafa] font-semibold mb-2 text-sm">Legend</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                    {[
                      ['bg-[#1a1a1a]', 'Empty'],
                      ['bg-[#0a0a0a] border border-[#2a2a2a]', 'Wall'],
                      ['bg-emerald-500', 'Start'],
                      ['bg-blue-500', 'Goal'],
                      ['bg-amber-500/70', 'Frontier'],
                      ['bg-[#2a2a2a]', 'Explored'],
                      ['bg-cyan-400', 'Current'],
                      ['bg-white', 'Path'],
                    ].map(([color, label]) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-sm ${color} shrink-0`} />
                        <span className="text-[#a1a1a1]">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
