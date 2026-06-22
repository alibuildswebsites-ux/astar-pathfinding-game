# A* Pathfinding Game

A terminal-based grid game demonstrating the A* search algorithm. An AI agent navigates from start to goal while avoiding obstacles, visualized step-by-step in the terminal.

## Features

- Configurable grid size and obstacle density
- Two modes: **auto** (full run with stats) and **step** (advance per iteration)
- Shows open set, closed set, and current node during search
- Final path highlighted with statistics

## Requirements

- Python 3.10+

## Usage

```bash
python main.py --size 20 --density 0.25 --mode auto
```

### Arguments

| Argument | Default | Description |
|----------|---------|-------------|
| `--size` | 20 | Grid size (NxN) |
| `--density` | 0.25 | Wall density (0.0–1.0) |
| `--mode` | auto | `auto` or `step` |
| `--seed` | — | Random seed for reproducibility |

### Step Mode

```bash
python main.py --mode step
```

Press Enter to advance through each iteration. Watch the frontier expand and the algorithm converge on the goal.

## Algorithm

A* is an informed search algorithm that finds the shortest path using:

- **g(n)**: actual cost from start to node n
- **h(n)**: estimated cost from node n to goal (Manhattan distance)
- **f(n) = g(n) + h(n)**: total estimated cost

The algorithm maintains:
- **Open set**: nodes to evaluate (sorted by f-score)
- **Closed set**: nodes already evaluated

It expands the node with the lowest f-score from the open set, evaluates its neighbors, and repeats until reaching the goal.

## Grid Symbols

| Symbol | Meaning |
|--------|---------|
| `S` | Start |
| `G` | Goal |
| `#` | Wall |
| `·` | Unvisited |
| `?` | In open set (frontier) |
| `.` | In closed set (explored) |
| `@` | Current node |
| `*` | Final path |

## Sample Output

```
S # · · · · · # ·
# . . # # · · · · ·
# . . . # ? ? # # ?
? . . . . . . . . .
? . # . . # . # . .
? . . . . . . # . #
? . . . . . . . # ?
? . . . . . . . . *
? . . . . . . . * #
# # . . . # . . * G

Path found! Length: 19 | Nodes explored: 59 | Time: 0.0054s
```

## Code Listing

### `grid.py`

```python
import random


class Grid:
    def __init__(self, size: int = 20, density: float = 0.25):
        self.size = size
        self.density = density
        self.walls = set()
        self.start = (0, 0)
        self.goal = (size - 1, size - 1)
        self._generate_walls()

    def _generate_walls(self):
        for r in range(self.size):
            for c in range(self.size):
                if (r, c) in (self.start, self.goal):
                    continue
                if random.random() < self.density:
                    self.walls.add((r, c))

    def in_bounds(self, pos: tuple[int, int]) -> bool:
        r, c = pos
        return 0 <= r < self.size and 0 <= c < self.size

    def is_wall(self, pos: tuple[int, int]) -> bool:
        return pos in self.walls

    def is_passable(self, pos: tuple[int, int]) -> bool:
        return self.in_bounds(pos) and not self.is_wall(pos)

    def get_neighbors(self, pos: tuple[int, int]) -> list[tuple[int, int]]:
        r, c = pos
        candidates = [(r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)]
        return [nb for nb in candidates if self.is_passable(nb)]

    def render(self, path: set = set(), open_set: set = set(),
               closed_set: set = set(), current: tuple[int, int] | None = None) -> str:
        lines = []
        for r in range(self.size):
            row = []
            for c in range(self.size):
                pos = (r, c)
                if pos == self.start:
                    row.append("S")
                elif pos == self.goal:
                    row.append("G")
                elif pos in self.walls:
                    row.append("#")
                elif pos == current:
                    row.append("@")
                elif pos in path:
                    row.append("*")
                elif pos in closed_set:
                    row.append(".")
                elif pos in open_set:
                    row.append("?")
                else:
                    row.append("\u00b7")
            lines.append(" ".join(row))
        return "\n".join(lines)
```

### `astar.py`

```python
import heapq


def heuristic(a: tuple[int, int], b: tuple[int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def reconstruct_path(came_from: dict, current: tuple[int, int]) -> list[tuple[int, int]]:
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    path.reverse()
    return path


def astar_step(grid):
    start = grid.start
    goal = grid.goal

    open_set = [(0, start)]
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}

    open_lookup = {start}
    closed_lookup = set()

    while open_set:
        _, current = heapq.heappop(open_set)
        open_lookup.discard(current)

        if current == goal:
            path = reconstruct_path(came_from, current)
            yield open_lookup, closed_lookup, current, path
            return

        closed_lookup.add(current)

        for neighbor in grid.get_neighbors(current):
            if neighbor in closed_lookup:
                continue
            tentative_g = g_score[current] + 1

            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f = tentative_g + heuristic(neighbor, goal)
                f_score[neighbor] = f
                if neighbor not in open_lookup:
                    heapq.heappush(open_set, (f, neighbor))
                    open_lookup.add(neighbor)

        yield open_lookup, closed_lookup, current, None

    yield open_lookup, closed_lookup, None, None
```

### `game.py`

```python
import time
from grid import Grid
from astar import astar_step


def clear_screen():
    print("\033[2J\033[H", end="")


def play(grid: Grid, mode: str = "auto"):
    generator = astar_step(grid)
    path = None
    final_stats = {}

    start_time = time.perf_counter()

    for open_set, closed_set, current, result in generator:
        if result is not None:
            path = result
            final_stats["path_length"] = len(path)
            final_stats["nodes_explored"] = len(closed_set)
            final_stats["time"] = time.perf_counter() - start_time
            clear_screen()
            print(grid.render(path=set(path), open_set=open_set,
                              closed_set=closed_set, current=current))
            break

        clear_screen()
        print(grid.render(open_set=open_set, closed_set=closed_set,
                          current=current))
        print(f"\nExplored: {len(closed_set)} | Frontier: {len(open_set)}")

        if mode == "step":
            input("Press Enter to advance...")
    else:
        clear_screen()
        print(grid.render(closed_set=closed_set, open_set=set()))
        final_stats["path_length"] = 0
        final_stats["nodes_explored"] = len(closed_set)
        final_stats["time"] = time.perf_counter() - start_time
        print("\nNo path found!")

    if final_stats.get("path_length", 0) > 0:
        print(f"\nPath found! Length: {final_stats['path_length']}"
              f" | Nodes explored: {final_stats['nodes_explored']}"
              f" | Time: {final_stats['time']:.4f}s")
    elif final_stats:
        print(f"\nNo path found. Nodes explored: {final_stats['nodes_explored']}"
              f" | Time: {final_stats['time']:.4f}s")
```

### `main.py`

```python
import argparse
from grid import Grid
from game import play


def main():
    parser = argparse.ArgumentParser(description="A* Pathfinding Game")
    parser.add_argument("--size", type=int, default=20,
                        help="Grid size (NxN, default: 20)")
    parser.add_argument("--density", type=float, default=0.25,
                        help="Wall density 0.0-1.0 (default: 0.25)")
    parser.add_argument("--mode", choices=["auto", "step"], default="auto",
                        help="Run mode (default: auto)")
    parser.add_argument("--seed", type=int, default=None,
                        help="Random seed for reproducibility")
    args = parser.parse_args()

    if args.seed is not None:
        import random
        random.seed(args.seed)

    grid = Grid(size=args.size, density=args.density)
    play(grid, mode=args.mode)


if __name__ == "__main__":
    main()
```
