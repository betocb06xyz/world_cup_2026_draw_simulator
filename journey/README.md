# The Journey

How this project evolved from a hacky script to a clean constraint solver.

## Chapter 1: Brute Force

First attempt using manual backtracking with `deepcopy` and recursion. Handcrafted heuristics to count valid slots per federation. Ran 100k simulations to find edge cases and bugs.

The `_xd` in the filename tells the story.

## Chapter 2: Discovery of OR-Tools

Switched to Google's CP-SAT solver. Used IP-style modeling: 576 binary variables (`x[team][group] ∈ {0,1}`) with sum constraints. The solver handles the hard work - no more manual backtracking.

## Chapter 3: Elegance

Showed Claude both chapters. Claude mentioned the IP-style could also be written CP-style. "What's CP?" And that question led to Chapter 3.

CP-style is more natural: 48 integer variables (`group[team] ∈ {1..12}`). `AllDifferent` constraints replace dozens of sum constraints. Side-by-side comparison proved both approaches are equivalent, but CP-style reads like English.

## The Lesson

Classic software evolution: hacky solution → working solution → elegant solution.

The final `api/solver.py` is the polished version of Chapter 3.
