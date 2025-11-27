from ortools.sat.python import cp_model
import random

def create_model_with_assignments(fixed_assignments):
    """Create the constraint model with fixed assignments"""
    model = cp_model.CpModel()

    # Variable groups (confederations)
    NA = ["NA","NB","NC","ND","NE","NF"]  # CONCACAF
    CA = ["CA","CB","CC","CD","CE","CF"]  # CONMEBOL
    EA = ["EA","EB","EC","ED","EE","EF","EG","EH",
          "EI","EJ","EK","EL","EM","EN","EO","EP"]  # UEFA
    FA = ["FA","FB","FC","FD","FE","FF","FG","FH","FI"]  # CAF
    AA = ["AA","AB","AC","AD","AE","AF","AG","AH"]  # AFC
    XYZ = ["XA","YA","ZA"]  # OFC + Playoff paths

    GROUPS = NA + CA + EA + FA + AA + XYZ

    # Create 576 binary variables
    vars = {}
    for p in GROUPS:
        for i in range(1, 13):
            name = f"{p}{i}"
            vars[name] = model.NewBoolVar(name)

    # Constraint: Each team in exactly one group
    for p in GROUPS:
        group_vars = [vars[f"{p}{i}"] for i in range(1, 13)]
        model.Add(sum(group_vars) == 1)

    # Constraint: Each group has exactly 4 teams
    for i in range(1, 13):
        idx_vars = [vars[f"{p}{i}"] for p in GROUPS]
        model.Add(sum(idx_vars) == 4)

    # UEFA constraint: 1-2 UEFA teams per group
    EX_prefixes = ["EA","EB","EC","ED","EE","EF","EG","EH",
                   "EI","EJ","EK","EL","EM","EN","EO","EP"]
    for i in range(1, 13):
        ex_vars = [vars[f"{p}{i}"] for p in EX_prefixes]
        model.Add(sum(ex_vars) >= 1)
        model.Add(sum(ex_vars) <= 2)

    # CONCACAF + Playoff paths constraint
    NX_prefixes = ["NA","NB","NC","ND","NE","NF"]
    for i in range(1, 13):
        expr = [vars[f"{p}{i}"] for p in NX_prefixes]
        expr.append(vars[f"YA{i}"])
        expr.append(vars[f"ZA{i}"])
        model.Add(sum(expr) < 2)

    # CONMEBOL + Z constraint
    CX_prefixes = ["CA","CB","CC","CD","CE","CF"]
    for i in range(1, 13):
        expr = [vars[f"{p}{i}"] for p in CX_prefixes]
        expr.append(vars[f"ZA{i}"])
        model.Add(sum(expr) < 2)

    # CAF + Y constraint
    FX_prefixes = ["FA","FB","FC","FD","FE","FF","FG","FH","FI"]
    for i in range(1, 13):
        expr = [vars[f"{p}{i}"] for p in FX_prefixes]
        expr.append(vars[f"YA{i}"])
        model.Add(sum(expr) < 2)

    # AFC + Z constraint
    AX_prefixes = ["AA","AB","AC","AD","AE","AF","AG","AH"]
    for i in range(1, 13):
        expr = [vars[f"{p}{i}"] for p in AX_prefixes]
        expr.append(vars[f"ZA{i}"])
        model.Add(sum(expr) < 2)

    # Pot 1 constraint
    prefixes1 = ["NA","NB","NC","CA","CB","EA","EB","EC","ED","EE","EF","EG"]
    for i in range(1, 13):
        expr = [vars[f"{p}{i}"] for p in prefixes1]
        model.Add(sum(expr) == 1)

    # Pot 2 constraint
    prefixes2 = ["CC","CD","CE","EH","EI","EJ","FA","FB","AA","AB","AC","AD"]
    for i in range(1, 13):
        expr = [vars[f"{p}{i}"] for p in prefixes2]
        model.Add(sum(expr) == 1)

    # Pot 3 constraint
    prefixes3 = ["ND","CF","EK","EL","FC","FD","FE","FF","FG","AE","AF","AG"]
    for i in range(1, 13):
        expr = [vars[f"{p}{i}"] for p in prefixes3]
        model.Add(sum(expr) == 1)

    # Add fixed assignments
    for team, group in fixed_assignments.items():
        model.Add(vars[f"{team}{group}"] == 1)

    return model, vars


def check_feasibility(fixed_assignments):
    """Check if a valid solution exists given fixed assignments"""
    model, _ = create_model_with_assignments(fixed_assignments)
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5
    result = solver.Solve(model)
    return result == cp_model.OPTIMAL or result == cp_model.FEASIBLE


def simulate_draw(seed=None):
    """Simulate the FIFA World Cup draw procedure"""
    
    if seed is not None:
        random.seed(seed)
    
    # Define pots
    pot1 = ["NA","NB","NC","CA","CB","EA","EB","EC","ED","EE","EF","EG"]
    pot2 = ["CC","CD","CE","EH","EI","EJ","FA","FB","AA","AB","AC","AD"]
    pot3 = ["ND","CF","EK","EL","FC","FD","FE","FF","FG","AE","AF","AG"]
    pot4 = ["NE","NF","EM","EN","EO","EP","FH","FI","AH","XA","YA","ZA"]
    
    # Pre-assign hosts (NA=Mexico→A, NB=Canada→B, NC=USA→D)
    fixed_assignments = {
        "NA": 1,  # Mexico → Group A (1)
        "NB": 2,  # Canada → Group B (2)
        "NC": 4,  # USA → Group D (4)
    }
    
    # Track which groups have a team from each pot
    pot1_groups = {1, 2, 4}  # Hosts already assigned
    pot2_groups = set()
    pot3_groups = set()
    pot4_groups = set()
    
    print("=" * 50)
    print("   2026 FIFA WORLD CUP DRAW SIMULATION")
    print("=" * 50)
    print("\n🏟️  Pre-assigned hosts:")
    print(f"   NA (Mexico)  → Group 1 (A)")
    print(f"   NB (Canada)  → Group 2 (B)")
    print(f"   NC (USA)     → Group 4 (D)")
    
    # Draw remaining Pot 1 teams
    remaining_pot1 = [t for t in pot1 if t not in ["NA", "NB", "NC"]]
    random.shuffle(remaining_pot1)
    
    print("\n📦 POT 1 (remaining teams):")
    for team in remaining_pot1:
        assigned = False
        for group in range(1, 13):
            if group not in pot1_groups:
                test_assignments = fixed_assignments.copy()
                test_assignments[team] = group
                if check_feasibility(test_assignments):
                    fixed_assignments[team] = group
                    pot1_groups.add(group)
                    print(f"   {team} → Group {group}")
                    assigned = True
                    break
        if not assigned:
            print(f"   ❌ ERROR: Could not assign {team}")
    
    # Draw Pot 2
    random.shuffle(pot2)
    print("\n📦 POT 2:")
    for team in pot2:
        assigned = False
        for group in range(1, 13):
            if group not in pot2_groups:
                test_assignments = fixed_assignments.copy()
                test_assignments[team] = group
                if check_feasibility(test_assignments):
                    fixed_assignments[team] = group
                    pot2_groups.add(group)
                    print(f"   {team} → Group {group}")
                    assigned = True
                    break
        if not assigned:
            print(f"   ❌ ERROR: Could not assign {team}")
    
    # Draw Pot 3
    random.shuffle(pot3)
    print("\n📦 POT 3:")
    for team in pot3:
        assigned = False
        for group in range(1, 13):
            if group not in pot3_groups:
                test_assignments = fixed_assignments.copy()
                test_assignments[team] = group
                if check_feasibility(test_assignments):
                    fixed_assignments[team] = group
                    pot3_groups.add(group)
                    print(f"   {team} → Group {group}")
                    assigned = True
                    break
        if not assigned:
            print(f"   ❌ ERROR: Could not assign {team}")
    
    # Draw Pot 4
    random.shuffle(pot4)
    print("\n📦 POT 4:")
    for team in pot4:
        assigned = False
        for group in range(1, 13):
            if group not in pot4_groups:
                test_assignments = fixed_assignments.copy()
                test_assignments[team] = group
                if check_feasibility(test_assignments):
                    fixed_assignments[team] = group
                    pot4_groups.add(group)
                    print(f"   {team} → Group {group}")
                    assigned = True
                    break
        if not assigned:
            print(f"   ❌ ERROR: Could not assign {team}")
    
    # Print final groups
    print("\n" + "=" * 50)
    print("   FINAL GROUPS")
    print("=" * 50)
    
    group_letters = "ABCDEFGHIJKL"
    for group in range(1, 13):
        teams_in_group = [t for t, g in fixed_assignments.items() if g == group]
        print(f"\n   Group {group} ({group_letters[group-1]}): {', '.join(teams_in_group)}")
    
    return fixed_assignments


if __name__ == "__main__":
    # Run simulation with a random seed for reproducibility (or None for true random)
    result = simulate_draw(seed=2026)