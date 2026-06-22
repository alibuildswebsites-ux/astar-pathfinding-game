from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time

from grid import Grid
from astar import astar_step


class PathfindRequest(BaseModel):
    size: int = 20
    density: float = 0.25
    seed: int | None = None


class PathfindResponse(BaseModel):
    path: list[list[int]]
    path_length: int
    nodes_explored: int
    time_ms: float
    grid_size: int
    walls: list[list[int]]


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("A* Backend started on port 8000")
    yield
    print("Shutting down")


app = FastAPI(title="A* Pathfinding API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "astar-pathfinding"}


@app.post("/api/pathfind", response_model=PathfindResponse)
async def pathfind(req: PathfindRequest):
    if req.seed is not None:
        random.seed(req.seed)

    grid = Grid(size=req.size, density=req.density)

    start_time = time.perf_counter()
    generator = astar_step(grid)
    final_path = None
    nodes_explored = 0

    for open_set, closed_set, current, result in generator:
        if result is not None:
            final_path = result
            nodes_explored = len(closed_set)
            break
    else:
        elapsed = (time.perf_counter() - start_time) * 1000
        return PathfindResponse(
            path=[],
            path_length=0,
            nodes_explored=nodes_explored,
            time_ms=round(elapsed, 2),
            grid_size=req.size,
            walls=[[r, c] for (r, c) in grid.walls],
        )

    elapsed = (time.perf_counter() - start_time) * 1000

    return PathfindResponse(
        path=[[r, c] for (r, c) in final_path],
        path_length=len(final_path),
        nodes_explored=nodes_explored,
        time_ms=round(elapsed, 2),
        grid_size=req.size,
        walls=[[r, c] for (r, c) in grid.walls],
    )
