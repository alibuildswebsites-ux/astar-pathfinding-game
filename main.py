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
