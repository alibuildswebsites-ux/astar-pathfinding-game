import { Pos, AStarStep } from './types'

function key(p: Pos): string { return `${p[0]},${p[1]}` }
function heuristic(a: Pos, b: Pos): number { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) }

export function generateGrid(size: number, density: number, seed: number): { walls: Set<string>, start: Pos, goal: Pos } {
  const walls = new Set<string>()
  const start: Pos = [0, 0]
  const goal: Pos = [size - 1, size - 1]

  let s = seed
  function rand(): number {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r === 0 && c === 0) || (r === size - 1 && c === size - 1)) continue
      if (rand() < density) walls.add(key([r, c]))
    }
  }
  return { walls, start, goal }
}

function inBounds(pos: Pos, size: number): boolean {
  return pos[0] >= 0 && pos[0] < size && pos[1] >= 0 && pos[1] < size
}

function getNeighbors(pos: Pos, size: number, walls: Set<string>): Pos[] {
  const dirs: Pos[] = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  return dirs
    .map(([dr, dc]) => [pos[0] + dr, pos[1] + dc] as Pos)
    .filter(n => inBounds(n, size) && !walls.has(key(n)))
}

export function* astarGenerator(size: number, walls: Set<string>, start: Pos, goal: Pos): Generator<AStarStep> {
  const openHeap: [number, number, Pos][] = []
  const openLookup = new Set<string>()
  const closedLookup = new Set<string>()
  const gScore = new Map<string, number>()
  const cameFrom = new Map<string, Pos>()
  let idCounter = 0

  function push(pos: Pos, f: number) {
    openHeap.push([f, idCounter++, pos])
    openLookup.add(key(pos))
  }
  function pop(): Pos | null {
    if (openHeap.length === 0) return null
    let minIdx = 0
    for (let i = 1; i < openHeap.length; i++) {
      if (openHeap[i][0] < openHeap[minIdx][0]) minIdx = i
    }
    const item = openHeap[minIdx]
    openHeap[minIdx] = openHeap[openHeap.length - 1]
    openHeap.pop()
    return item[2]
  }

  push(start, heuristic(start, goal))
  gScore.set(key(start), 0)

  while (openHeap.length > 0) {
    const current = pop()!
    const ck = key(current)
    openLookup.delete(ck)

    if (current[0] === goal[0] && current[1] === goal[1]) {
      const path: Pos[] = []
      let cur: Pos | undefined = current
      while (cur) {
        path.unshift(cur)
        cur = cameFrom.get(key(cur))
      }
      yield { openSet: new Set(openLookup), closedSet: new Set(closedLookup), current, path }
      return
    }

    closedLookup.add(ck)

    for (const neighbor of getNeighbors(current, size, walls)) {
      const nk = key(neighbor)
      if (closedLookup.has(nk)) continue
      const tentativeG = (gScore.get(ck) ?? 0) + 1
      if (!gScore.has(nk) || tentativeG < gScore.get(nk)!) {
        cameFrom.set(nk, current)
        gScore.set(nk, tentativeG)
        const f = tentativeG + heuristic(neighbor, goal)
        if (!openLookup.has(nk)) push(neighbor, f)
      }
    }

    yield { openSet: new Set(openLookup), closedSet: new Set(closedLookup), current, path: null }
  }

  yield { openSet: new Set(openLookup), closedSet: new Set(closedLookup), current: null, path: null }
}
