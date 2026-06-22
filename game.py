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
