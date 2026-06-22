export type Pos = [number, number]

export interface GridData {
  size: number
  walls: Set<string>
  start: Pos
  goal: Pos
}

export interface AStarStep {
  openSet: Set<string>
  closedSet: Set<string>
  current: Pos | null
  path: Pos[] | null
  stepCount?: number
}

export interface PathfindResult {
  path: number[][]
  path_length: number
  nodes_explored: number
  time_ms: number
  grid_size: number
  walls: number[][]
}

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function fetchPathfind(size: number, density: number, seed: number): Promise<PathfindResult> {
  const res = await fetch(`${API_BASE}/pathfind`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ size, density, seed }),
  })
  if (!res.ok) throw new Error('API error')
  return res.json()
}
