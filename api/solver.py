"""
FIFA 2026 World Cup Draw - Constraint Solver
Handles constraint checking with OR-Tools CP-SAT solver
"""

from ortools.sat.python import cp_model

# =============================================================================
# TEAM DATA
# =============================================================================

CONCACAF = ["NA", "NB", "NC", "ND", "NE", "NF"]
CONMEBOL = ["CA", "CB", "CC", "CD", "CE", "CF"]
UEFA = ["EA", "EB", "EC", "ED", "EE", "EF", "EG", "EH",
        "EI", "EJ", "EK", "EL", "EM", "EN", "EO", "EP"]
CAF = ["FA", "FB", "FC", "FD", "FE", "FF", "FG", "FH", "FI"]
AFC = ["AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH"]
OFC = ["XA"]
PLAYOFF_Y = ["YA"]
PLAYOFF_Z = ["ZA"]
ALL_TEAMS = CONCACAF + CONMEBOL + UEFA + CAF + AFC + OFC + PLAYOFF_Y + PLAYOFF_Z

POT1 = ["NA", "NB", "NC", "CA", "CB", "EA", "EB", "EC", "ED", "EE", "EF", "EG"]
POT2 = ["CC", "CD", "CE", "EH", "EI", "EJ", "FA", "FB", "AA", "AB", "AC", "AD"]
POT3 = ["ND", "CF", "EK", "EL", "FC", "FD", "FE", "FF", "FG", "AE", "AF", "AG"]
POT4 = ["NE", "NF", "EM", "EN", "EO", "EP", "FH", "FI", "AH", "XA", "YA", "ZA"]
ALL_POTS = [POT1, POT2, POT3, POT4]

TOP_2_TEAMS = ["CA", "EA"] # Top 2 teams, each one must be in different 'half'
HALVES = [
    [1, 2, 3, 10, 11, 12], # Half 1: A, B, C, J, K, L
    [4, 5, 6, 7, 8, 9] # Half 2: D, E, F, G, H, I
]

TOP_4_TEAMS = ["CA", "EA", "EB", "EC"] # Top 4 teams, each one must be in a different 'zone'
ZONES = [
    [1, 3, 12],   # Zone 1: A, C, L
    [2, 10, 11],  # Zone 2: B, J, K
    [4, 7, 8],    # Zone 3: D, G, H
    [5, 6, 9],    # Zone 4: E, F, I
]

# =============================================================================
# CP MODEL HELPERS
# =============================================================================

def addSumOfBoolsInRangeFlag(model, bool_list, lb, ub, condition_name):
    flag = model.NewBoolVar(condition_name)
    model.Add(sum(bool_list) >= lb).OnlyEnforceIf(flag)
    model.Add(sum(bool_list) <= ub).OnlyEnforceIf(flag.Not())
    return flag

def addListContainsTrueFlag(model, bool_list, condition_name):
    flag = model.NewBoolVar(condition_name)
    model.Add(sum(bool_list) >= 1).OnlyEnforceIf(flag)
    model.Add(sum(bool_list) == 0).OnlyEnforceIf(flag.Not())
    return flag

def addIntEqValFlag(model, int_var, val, condition_name):
    flag = model.NewBoolVar(condition_name)
    model.Add(int_var == val).OnlyEnforceIf(flag)
    model.Add(int_var != val).OnlyEnforceIf(flag.Not())
    return flag

def addTeamsInDifferentSubgroups(model, team_group, separated_teams, subgroups, condition_name):
    assert len(separated_teams) == len(subgroups)
    team_subgroup = {}
    for team in separated_teams:
        team_subgroup[team] = model.NewIntVar(0, len(separated_teams), f'{team}_{condition_name}')

        for sg_idx, sg_groups in enumerate(subgroups):
            in_sg_bools = []
            for g in sg_groups:
                flag = addIntEqValFlag(model, team_group[team], g, f'{team}_in_g{g}')
                in_sg_bools.append(flag)

            in_this_sg = addListContainsTrueFlag(model, in_sg_bools, f'{team}_in_{condition_name}{sg_idx}')
            model.Add(team_subgroup[team] == sg_idx).OnlyEnforceIf(in_this_sg)

    model.AddAllDifferent([team_subgroup[t] for t in separated_teams])

def create_team_group_map(model):
    team_group = {}
    for team in ALL_TEAMS:
        team_group[team] = model.NewIntVar(1, 12, team)

    return team_group

# =============================================================================
# CONSTRAINTS
# =============================================================================

def addPotConstraints(model, team_group):
    for pot in ALL_POTS:
        model.AddAllDifferent([team_group[t] for t in pot])

def addFederationConstraints(model, team_group):
    # 1 team per group
    for confederation in [CONCACAF, CONMEBOL, CAF, AFC, OFC]:
        model.AddAllDifferent([team_group[t] for t in confederation])

def addUEFAConstraints(model, team_group):
    # UEFA: 1-2 teams per group
    for g in range(1, 13):
        uefa_in_g = []
        for t in UEFA:
            t_in_g = addIntEqValFlag(model, team_group[t], g, f'{t}_in_g{g}')
            uefa_in_g.append(t_in_g)

        addSumOfBoolsInRangeFlag(model, uefa_in_g, 1, 2, f'valid_uefa_in_g{g}')

def addPlayoffConstraints(model, team_group, spot_name, confederations):
    for confederation in confederations:
        for t in confederation:
            model.Add(team_group[spot_name] != team_group[t])

def addTop2TeamsConstraints(model, team_group):
    addTeamsInDifferentSubgroups(model, team_group, TOP_2_TEAMS, HALVES, "half")

def addTop4TeamsConstraints(model, team_group):
    addTeamsInDifferentSubgroups(model, team_group, TOP_4_TEAMS, ZONES, "zone")

def addFixedAssignments(model, team_group, fixed_assignments):
    if fixed_assignments:
        for team, group in fixed_assignments.items():
            model.Add(team_group[team] == group)

# =============================================================================
# MODEL CREATION AND SOLVING
# =============================================================================

def create_model(fixed_assignments=None):
    """Create CP model with all FIFA draw constraints"""
    model = cp_model.CpModel()
    team_group = create_team_group_map(model)

    addPotConstraints(model, team_group) # All teams in a pot must go to a different group
    addFederationConstraints(model, team_group) # 1 team per group, except for UEFA
    addUEFAConstraints(model, team_group) # 1-2 teams per group

    addTop2TeamsConstraints(model, team_group) # Top 2 Teams must be in oposite 'halves'
    addTop4TeamsConstraints(model, team_group) # Top 4 Teams must be in different 'zones'

    addPlayoffConstraints(model, team_group, "YA", [CONCACAF, CAF, OFC])
    addPlayoffConstraints(model, team_group, "ZA", [CONCACAF, CONMEBOL, AFC])

    addFixedAssignments(model, team_group, fixed_assignments) # For host teams and for simulations

    return model, team_group

def check_feasibility(fixed_assignments):
    """Check if valid completion exists"""
    model, _ = create_model(fixed_assignments)
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5
    result = solver.Solve(model)
    return result == cp_model.OPTIMAL or result == cp_model.FEASIBLE

def get_pot(team):
    for pot in ALL_POTS:
        if team in pot:
            return pot

    raise ValueError(f"Pot could not be determined for team: {team}")

def get_occupied_groups(pot, current_assignments):
    occupied_groups = set()
    for t in pot:
        if t in current_assignments:
            occupied_groups.add(current_assignments[t])

    return occupied_groups

def get_valid_group_for_team(team, current_assignments):
    """Get the first valid group for a team (lowest-numbered)"""
    pot = get_pot(team)
    occupied_groups = get_occupied_groups(pot, current_assignments)

    # Try each group in order, return first valid one
    for group in range(1, 13):
        if group in occupied_groups:
            continue

        test_assignments = current_assignments.copy()
        test_assignments[team] = group

        if check_feasibility(test_assignments):
            return group

    return None

def get_initial_state():
    """Get initial state with hosts pre-assigned"""
    return {
        'NA': 1,  # Mexico → Group A
        'NB': 2,  # Canada → Group B
        'NC': 4   # USA → Group D
    }

def get_pots():
    """Get pot assignments (1-indexed)"""
    return {
        1: POT1,
        2: POT2,
        3: POT3,
        4: POT4
    }


if __name__ == "__main__":
    # Test solver
    initial_state = get_initial_state()
    print(get_valid_group_for_team("CA", initial_state))
