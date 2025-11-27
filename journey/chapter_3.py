"""
=============================================================================
FIFA 2026 WORLD CUP DRAW - CP STYLE vs IP STYLE COMPARISON
=============================================================================

Two approaches to the same problem:
  1. IP-STYLE: 576 binary variables (team×group), sum constraints
  2. CP-STYLE: 48 integer variables (team → group), AllDifferent constraints

The CP style is more natural and readable!
"""

from ortools.sat.python import cp_model
import random


# =============================================================================
# TEAM DATA
# =============================================================================

# Teams by confederation
CONCACAF = ["NA", "NB", "NC", "ND", "NE", "NF"]  # 6 teams (includes 3 hosts)
CONMEBOL = ["CA", "CB", "CC", "CD", "CE", "CF"]  # 6 teams
UEFA = ["EA", "EB", "EC", "ED", "EE", "EF", "EG", "EH",
        "EI", "EJ", "EK", "EL", "EM", "EN", "EO", "EP"]  # 16 teams
CAF = ["FA", "FB", "FC", "FD", "FE", "FF", "FG", "FH", "FI"]  # 9 teams
AFC = ["AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH"]  # 8 teams
OFC = ["XA"]  # 1 team (New Zealand)
PLAYOFF_Y = ["YA"]  # Pathway 1: could be OFC, CONCACAF, or CAF
PLAYOFF_Z = ["ZA"]  # Pathway 2: could be CONMEBOL, CONCACAF, or AFC

ALL_TEAMS = CONCACAF + CONMEBOL + UEFA + CAF + AFC + OFC + PLAYOFF_Y + PLAYOFF_Z

# Teams by pot
POT1 = ["NA", "NB", "NC", "CA", "CB", "EA", "EB", "EC", "ED", "EE", "EF", "EG"]
POT2 = ["CC", "CD", "CE", "EH", "EI", "EJ", "FA", "FB", "AA", "AB", "AC", "AD"]
POT3 = ["ND", "CF", "EK", "EL", "FC", "FD", "FE", "FF", "FG", "AE", "AF", "AG"]
POT4 = ["NE", "NF", "EM", "EN", "EO", "EP", "FH", "FI", "AH", "XA", "YA", "ZA"]


# =============================================================================
# CP-STYLE MODEL (Clean, Readable)
# =============================================================================

def create_cp_style_model(fixed_assignments=None):
    """
    CP-STYLE: Each team has ONE integer variable representing its group.
    
    Variables:  team_group[t] ∈ {1..12}  (which group is team t in?)
    
    Constraints:
      - Pot: AllDifferent (each pot's 12 teams in 12 different groups)
      - Confederation: AllDifferent or count constraints
    
    Much more natural than 576 binary variables!
    """
    model = cp_model.CpModel()
    
    # -------------------------------------------------------------------------
    # VARIABLES: One integer per team (which group are they in?)
    # -------------------------------------------------------------------------
    team_group = {}
    for team in ALL_TEAMS:
        team_group[team] = model.NewIntVar(1, 12, team)
    
    # -------------------------------------------------------------------------
    # POT CONSTRAINTS: AllDifferent — each pot fills all 12 groups exactly once
    # -------------------------------------------------------------------------
    # This replaces 24 sum==1 constraints with 4 elegant AllDifferent constraints!
    
    model.AddAllDifferent([team_group[t] for t in POT1])
    model.AddAllDifferent([team_group[t] for t in POT2])
    model.AddAllDifferent([team_group[t] for t in POT3])
    model.AddAllDifferent([team_group[t] for t in POT4])
    
    # -------------------------------------------------------------------------
    # CONFEDERATION CONSTRAINTS: Max 1 per group (except UEFA)
    # -------------------------------------------------------------------------
    # For confederations with ≤12 teams and max 1 per group: AllDifferent!
    
    # CONCACAF (6 teams) - max 1 per group → AllDifferent
    model.AddAllDifferent([team_group[t] for t in CONCACAF])
    
    # CONMEBOL (6 teams) - max 1 per group → AllDifferent
    model.AddAllDifferent([team_group[t] for t in CONMEBOL])
    
    # CAF (9 teams) - max 1 per group → AllDifferent
    model.AddAllDifferent([team_group[t] for t in CAF])
    
    # AFC (8 teams) - max 1 per group → AllDifferent
    model.AddAllDifferent([team_group[t] for t in AFC])
    
    # -------------------------------------------------------------------------
    # UEFA CONSTRAINT: 1-2 per group (16 teams, 12 groups)
    # -------------------------------------------------------------------------
    # Can't use AllDifferent here. Need to count per group.
    # 
    # For each group g: 1 ≤ count(UEFA teams in g) ≤ 2
    
    for g in range(1, 13):
        # Create boolean: is_uefa_in_g[t] = 1 iff UEFA team t is in group g
        uefa_in_g = []
        for t in UEFA:
            is_in_g = model.NewBoolVar(f'{t}_in_{g}')
            model.Add(team_group[t] == g).OnlyEnforceIf(is_in_g)
            model.Add(team_group[t] != g).OnlyEnforceIf(is_in_g.Not())
            uefa_in_g.append(is_in_g)
        
        model.Add(sum(uefa_in_g) >= 1)
        model.Add(sum(uefa_in_g) <= 2)
    
    # -------------------------------------------------------------------------
    # PLAYOFF PATH CONSTRAINTS (The tricky part!)
    # -------------------------------------------------------------------------
    # Y (Pathway 1): Could become CONCACAF (Jamaica) or CAF (DR Congo)
    #   → Y must not share group with any CONCACAF or CAF team
    #
    # Z (Pathway 2): Could become CONMEBOL (Bolivia), CONCACAF (Suriname), or AFC (Iraq)
    #   → Z must not share group with any CONMEBOL, CONCACAF, or AFC team
    
    # Y ≠ any CONCACAF team's group
    for t in CONCACAF:
        model.Add(team_group["YA"] != team_group[t])
    
    # Y ≠ any CAF team's group
    for t in CAF:
        model.Add(team_group["YA"] != team_group[t])
    
    # Z ≠ any CONCACAF team's group
    for t in CONCACAF:
        model.Add(team_group["ZA"] != team_group[t])
    
    # Z ≠ any CONMEBOL team's group
    for t in CONMEBOL:
        model.Add(team_group["ZA"] != team_group[t])
    
    # Z ≠ any AFC team's group
    for t in AFC:
        model.Add(team_group["ZA"] != team_group[t])
    
    # -------------------------------------------------------------------------
    # FIXED ASSIGNMENTS (for simulation)
    # -------------------------------------------------------------------------
    if fixed_assignments:
        for team, group in fixed_assignments.items():
            model.Add(team_group[team] == group)
    
    return model, team_group


# =============================================================================
# IP-STYLE MODEL (Original approach for comparison)
# =============================================================================

def create_ip_style_model(fixed_assignments=None):
    """
    IP-STYLE: Binary variable for each (team, group) pair.
    
    Variables:  x[t][g] ∈ {0,1}  (is team t in group g?)
    
    Constraints:
      - Row sum: Σ_g x[t][g] = 1 for each team
      - Col sum: Σ_t x[t][g] = 4 for each group
      - Pot: Σ_{t∈pot} x[t][g] = 1 for each pot and group
      - Confederation: Linear inequalities
    
    Works, but less readable than CP style.
    """
    model = cp_model.CpModel()
    
    # -------------------------------------------------------------------------
    # VARIABLES: 576 binary variables
    # -------------------------------------------------------------------------
    x = {}
    for t in ALL_TEAMS:
        for g in range(1, 13):
            x[(t, g)] = model.NewBoolVar(f'{t}_{g}')
    
    # -------------------------------------------------------------------------
    # EACH TEAM IN EXACTLY ONE GROUP
    # -------------------------------------------------------------------------
    for t in ALL_TEAMS:
        model.Add(sum(x[(t, g)] for g in range(1, 13)) == 1)
    
    # -------------------------------------------------------------------------
    # EACH GROUP HAS EXACTLY 4 TEAMS
    # -------------------------------------------------------------------------
    for g in range(1, 13):
        model.Add(sum(x[(t, g)] for t in ALL_TEAMS) == 4)
    
    # -------------------------------------------------------------------------
    # POT CONSTRAINTS
    # -------------------------------------------------------------------------
    for pot in [POT1, POT2, POT3, POT4]:
        for g in range(1, 13):
            model.Add(sum(x[(t, g)] for t in pot) == 1)
    
    # -------------------------------------------------------------------------
    # UEFA CONSTRAINT: 1-2 per group
    # -------------------------------------------------------------------------
    for g in range(1, 13):
        model.Add(sum(x[(t, g)] for t in UEFA) >= 1)
        model.Add(sum(x[(t, g)] for t in UEFA) <= 2)
    
    # -------------------------------------------------------------------------
    # CONFEDERATION CONSTRAINTS (via inequalities)
    # -------------------------------------------------------------------------
    # CONCACAF + Y + Z < 2
    for g in range(1, 13):
        expr = [x[(t, g)] for t in CONCACAF]
        expr.append(x[("YA", g)])
        expr.append(x[("ZA", g)])
        model.Add(sum(expr) <= 1)
    
    # CONMEBOL + Z < 2
    for g in range(1, 13):
        expr = [x[(t, g)] for t in CONMEBOL]
        expr.append(x[("ZA", g)])
        model.Add(sum(expr) <= 1)
    
    # CAF + Y < 2
    for g in range(1, 13):
        expr = [x[(t, g)] for t in CAF]
        expr.append(x[("YA", g)])
        model.Add(sum(expr) <= 1)
    
    # AFC + Z < 2
    for g in range(1, 13):
        expr = [x[(t, g)] for t in AFC]
        expr.append(x[("ZA", g)])
        model.Add(sum(expr) <= 1)
    
    # -------------------------------------------------------------------------
    # FIXED ASSIGNMENTS
    # -------------------------------------------------------------------------
    if fixed_assignments:
        for team, group in fixed_assignments.items():
            model.Add(x[(team, group)] == 1)
    
    return model, x


# =============================================================================
# COMPARISON SUMMARY
# =============================================================================

def print_comparison():
    print("""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      CP-STYLE vs IP-STYLE COMPARISON                          ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Aspect              │ IP-Style                │ CP-Style                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Variables           │ 576 binary              │ 48 integer                    ║
║                     │ x[team,group] ∈ {0,1}   │ group[team] ∈ {1..12}         ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ "Team in 1 group"   │ Σ_g x[t,g] = 1          │ (implicit in domain)          ║
║                     │ 48 constraints          │ 0 constraints                 ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ "4 teams per group" │ Σ_t x[t,g] = 4          │ (implicit from pots)          ║
║                     │ 12 constraints          │ 0 constraints                 ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Pot constraints     │ Σ_{t∈pot} x[t,g] = 1    │ AddAllDifferent(pot)          ║
║                     │ 48 constraints          │ 4 constraints                 ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ "Max 1 CONMEBOL"    │ Σ_{t∈CONMEBOL} x[t,g]≤1 │ AddAllDifferent(CONMEBOL)     ║
║ per group           │ 12 constraints          │ 1 constraint                  ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Playoff path Y      │ Σ x[t,g] + x[Y,g] ≤ 1   │ group[Y] ≠ group[t]           ║
║ can't share w/ CAF  │ 12 constraints          │ 9 pairwise ≠ constraints      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ Readability         │ Mathematical but dense  │ Natural language-like         ║
║                     │                         │                               ║
║ Extracting solution │ Find g where x[t,g]=1   │ Just read group[t]            ║
╚═══════════════════════════════════════════════════════════════════════════════╝
    """)


# =============================================================================
# DRAW SIMULATION (CP-Style)
# =============================================================================

def check_feasibility_cp(fixed_assignments):
    """Check if valid completion exists using CP-style model"""
    model, _ = create_cp_style_model(fixed_assignments)
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5
    result = solver.Solve(model)
    return result == cp_model.OPTIMAL or result == cp_model.FEASIBLE


def simulate_draw_cp(seed=None):
    """Simulate FIFA draw using CP-style model"""
    
    if seed is not None:
        random.seed(seed)
    
    # Pre-assign hosts
    fixed = {
        "NA": 1,  # Mexico → Group A
        "NB": 2,  # Canada → Group B
        "NC": 4,  # USA → Group D
    }
    
    assigned_groups = {1: {"NA"}, 2: {"NB"}, 4: {"NC"}}
    for g in range(1, 13):
        if g not in assigned_groups:
            assigned_groups[g] = set()
    
    print("=" * 60)
    print("   2026 FIFA WORLD CUP DRAW (CP-STYLE)")
    print("=" * 60)
    print("\n🏟️  Pre-assigned hosts:")
    print("   NA (Mexico)  → Group 1 (A)")
    print("   NB (Canada)  → Group 2 (B)")
    print("   NC (USA)     → Group 4 (D)")
    
    # Track which groups have team from each pot
    pot_groups = {
        1: {1, 2, 4},  # Pot 1 (hosts)
        2: set(),
        3: set(),
        4: set(),
    }
    
    pots = [
        (1, [t for t in POT1 if t not in ["NA", "NB", "NC"]]),
        (2, POT2.copy()),
        (3, POT3.copy()),
        (4, POT4.copy()),
    ]
    
    for pot_num, pot_teams in pots:
        random.shuffle(pot_teams)
        print(f"\n📦 POT {pot_num}:")
        
        for team in pot_teams:
            assigned = False
            for g in range(1, 13):
                if g not in pot_groups[pot_num]:
                    test_fixed = fixed.copy()
                    test_fixed[team] = g
                    if check_feasibility_cp(test_fixed):
                        fixed[team] = g
                        pot_groups[pot_num].add(g)
                        assigned_groups[g].add(team)
                        print(f"   {team} → Group {g}")
                        assigned = True
                        break
            
            if not assigned:
                print(f"   ❌ ERROR: Could not assign {team}")
    
    # Print final groups
    print("\n" + "=" * 60)
    print("   FINAL GROUPS")
    print("=" * 60)
    
    group_letters = "ABCDEFGHIJKL"
    for g in range(1, 13):
        teams = [t for t, grp in fixed.items() if grp == g]
        print(f"\n   Group {g} ({group_letters[g-1]}): {', '.join(teams)}")
    
    return fixed


# =============================================================================
# DEMONSTRATE BOTH MODELS FIND SAME SOLUTION
# =============================================================================

def verify_both_models():
    """Verify that both models agree on the same fixed assignment"""
    print("\n" + "=" * 60)
    print("   VERIFYING BOTH MODELS AGREE")
    print("=" * 60)
    
    # A specific fixed assignment to test
    test_assignment = {
        "NA": 1, "NB": 2, "NC": 4,
        "CA": 3, "CB": 5,
    }
    
    # Check CP-style
    cp_model_inst, _ = create_cp_style_model(test_assignment)
    solver = cp_model.CpSolver()
    cp_result = solver.Solve(cp_model_inst)
    cp_feasible = cp_result in [cp_model.OPTIMAL, cp_model.FEASIBLE]
    
    # Check IP-style
    ip_model_inst, _ = create_ip_style_model(test_assignment)
    solver2 = cp_model.CpSolver()
    ip_result = solver2.Solve(ip_model_inst)
    ip_feasible = ip_result in [cp_model.OPTIMAL, cp_model.FEASIBLE]
    
    print(f"\n   Test assignment: {test_assignment}")
    print(f"   CP-style model: {'FEASIBLE ✓' if cp_feasible else 'INFEASIBLE ✗'}")
    print(f"   IP-style model: {'FEASIBLE ✓' if ip_feasible else 'INFEASIBLE ✗'}")
    print(f"   Models agree: {'YES ✓' if cp_feasible == ip_feasible else 'NO ✗'}")


# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    print_comparison()
    verify_both_models()
    print("\n")
    simulate_draw_cp(seed=2026)