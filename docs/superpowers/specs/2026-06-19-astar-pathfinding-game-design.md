# A* Pathfinding Terminal Game — Design Document

## Overview
Terminal-based grid game demonstrating the A* search algorithm. An AI agent navigates from start (S) to goal (G) while avoiding obstacles, visualized step-by-step in the terminal.

## Grid
- 20x20 grid (configurable via `--size`)
- Symbols: `S` = start, `G` = goal, `#` = wall, `·` = open, `*` = path, `.` = explored, `@` = current
- Start placed top-left, goal bottom-right
- Random walls at configurable density (`--density`, default 0.25)

## Modules

### `main.py`
Entry point. Parses CLI args (`--size`, `--density`, `--mode {auto,step}`). Creates grid, runs A*, displays result.

### `grid.py`
- `Grid` class with 2D list, wall generation, S/G placement
- `render()` method to print current state
- `get_neighbors(pos)` returning valid adjacent cells

### `astar.py`
- A* implementation using Manhattan distance heuristic
- `astar_step(grid)` — generator that yields (open_set, closed_set, current) after each iteration
- Allows step-by-step or auto playback of the search process

### `game.py`
- Contains `play()` function that drives the loop
- In `step` mode: wait for Enter key between iterations
- In `auto` mode: run full search and display final result
- Prints final stats: path length, nodes explored, execution time

## Data Flow
```
main.py → parse CLI args → Grid() → astar_step() generator → game.py renders each yield → final stats
```

## Modes
- **auto**: runs A* to completion, shows final path + summary
- **step**: press Enter to advance one iteration at a time, shows open/closed/current

## Output
```
Path found! Length: 28 | Nodes explored: 142 | Time: 0.003s
```
