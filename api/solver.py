"""
FIFA 2026 World Cup Draw - Constraint Solver
Handles constraint checking with OR-Tools CP-SAT solver
"""

from ortools.sat.python import cp_model

# =============================================================================
# TEAM DATA
# =============================================================================

TEAMS = {
    "CONCACAF": ["NA", "NB", "NC", "ND", "NE", "NF", "YA", "ZA"],
    "CONMEBOL": ["CA", "CB", "CC", "CD", "CE", "CF", "ZA"],
    "UEFA":     ["EA", "EB", "EC", "ED", "EE", "EF", "EG", "EH", "EI", "EJ", "EK", "EL", "EM", "EN", "EO", "EP"],
    "CAF":      ["FA", "FB", "FC", "FD", "FE", "FF", "FG", "FH", "FI", "YA"],
    "AFC":      ["AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "ZA"],
    "OFC":      ["XA", "YA"],
}
NUM_OF_TEAMS = 48
# YA and ZA are PLAYOFF 1 and 2

TEAMS_PER_GROUP = {
    "CONCACAF": {"min": 0, "max": 1},
    "CONMEBOL": {"min": 0, "max": 1},
    "CAF":      {"min": 0, "max": 1},
    "AFC":      {"min": 0, "max": 1},
    "OFC":      {"min": 0, "max": 1},
    "UEFA":     {"min": 1, "max": 2},
}

POT1 = ["NA", "NB", "NC", "CA", "CB", "EA", "EB", "EC", "ED", "EE", "EF", "EG"]
POT2 = ["CC", "CD", "CE", "EH", "EI", "EJ", "FA", "FB", "AA", "AB", "AC", "AD"]
POT3 = ["ND", "CF", "EK", "EL", "FC", "FD", "FE", "FF", "FG", "AE", "AF", "AG"]
POT4 = ["NE", "NF", "EM", "EN", "EO", "EP", "FH", "FI", "AH", "XA", "YA", "ZA"]
ALL_POTS = [POT1, POT2, POT3, POT4]

NUM_OF_GROUPS = 12
GROUPS = range(1, NUM_OF_GROUPS + 1)

TOP_2_TEAMS = ["CA", "EA"] # Top 2 teams, each one must be in different 'half'
TOP_4_TEAMS = ["CA", "EA", "EB", "EC"] # Top 4 teams, each one must be in a different 'zone'
TOP_4_ZONES = [
    [1, 3, 12],   # Zone 1: A, C, L
    [2, 10, 11],  # Zone 2: B, J, K
    [4, 7, 8],    # Zone 3: D, G, H
    [5, 6, 9],    # Zone 4: E, F, I
]
TOP_2_ZONES = [
    TOP_4_ZONES[0] + TOP_4_ZONES[1],
    TOP_4_ZONES[2] + TOP_4_ZONES[3]
]

# =============================================================================
# CP MODEL HELPERS
# =============================================================================

def addIntEqValFlag(model, int_var, val, namespace):
    flag = model.NewBoolVar(namespace)
    model.Add(int_var == val).OnlyEnforceIf(flag)
    model.Add(int_var != val).OnlyEnforceIf(flag.Not())
    return flag

def addSeparateTeamsConstraint(model, team_group, namespace, separated_teams, subgroups):
    """Ensure each team in separated_teams is in a different subgroup"""
    assert len(separated_teams) == len(subgroups)

    team_subgroup = create_team_subgroup_map(model, namespace, separated_teams, 1, len(separated_teams))
    model.AddAllDifferent([team_subgroup[t] for t in separated_teams])

    for t in separated_teams:
        for sg_idx, subgroup in enumerate(subgroups, 1):
            for g in subgroup:
                t_in_g = addIntEqValFlag(model, team_group[t], g, f'{namespace}_{t}_in_{g}')
                model.Add(team_subgroup[t] == sg_idx).OnlyEnforceIf(t_in_g)

def create_team_subgroup_map(model, namespace, teams, lb, ub):
    team_subgroup = {}
    for t in teams:
        var_name = t
        if namespace:
            var_name = f"{namespace}_{var_name}"

        team_subgroup[t] = model.NewIntVar(lb, ub, var_name)

    return team_subgroup

def create_team_group_map(model):
    all_teams = []
    for _, teams in TEAMS.items():
        all_teams += teams
    all_teams = list(set(all_teams))
    assert len(all_teams) == NUM_OF_TEAMS, f"len(all_teams): {len(all_teams)} must be equal to NUM_OF_TEAMS: {NUM_OF_TEAMS}"

    return create_team_subgroup_map(model, "", all_teams, 1, NUM_OF_GROUPS)


# =============================================================================
# CONSTRAINTS
# =============================================================================

def addPotConstraints(model, team_group):
    ''' All teams in a pot must go to a different group'''
    for pot in ALL_POTS:
        model.AddAllDifferent([team_group[t] for t in pot])

def addConfederationConstraints(model, team_group):
    for confederation, teams in TEAMS.items():
        for group in GROUPS:
            teams_in_group = []
            for team in teams:
                t_in_g = addIntEqValFlag(model, team_group[team], group, f'{team}_in_{group}')
                teams_in_group.append(t_in_g)

            lb = TEAMS_PER_GROUP[confederation]["min"]
            ub = TEAMS_PER_GROUP[confederation]["max"]
            model.Add(sum(teams_in_group) >= lb)
            model.Add(sum(teams_in_group) <= ub)

def addTop2TeamsConstraints(model, team_group):
    addSeparateTeamsConstraint(model, team_group, "t2", TOP_2_TEAMS, TOP_2_ZONES)

def addTop4TeamsConstraints(model, team_group):
    addSeparateTeamsConstraint(model, team_group, "t4", TOP_4_TEAMS, TOP_4_ZONES)

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

    addPotConstraints(model, team_group)
    addConfederationConstraints(model, team_group)
    addTop2TeamsConstraints(model, team_group)
    addTop4TeamsConstraints(model, team_group)

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
    for group in GROUPS:
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
