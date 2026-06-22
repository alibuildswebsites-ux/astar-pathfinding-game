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
