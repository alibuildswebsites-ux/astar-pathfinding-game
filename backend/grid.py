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
