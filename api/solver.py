"""
FIFA World Cup Draw - Constraint Solver
Generic solver that receives configuration as parameter.
"""
from ortools.sat.python import cp_model


def addIntEqValFlag(model, int_var, val, namespace):
    flag = model.NewBoolVar(namespace)
    model.Add(int_var == val).OnlyEnforceIf(flag)
    model.Add(int_var != val).OnlyEnforceIf(flag.Not())
    return flag


def addSeparateTeamsConstraint(model, team_group, namespace, separated_teams, subgroups):
    """Ensure each team in separated_teams is in a different subgroup"""
    assert len(separated_teams) == len(subgroups)

    team_subgroup = {}
    for t in separated_teams:
        team_subgroup[t] = model.NewIntVar(1, len(separated_teams), f"{namespace}_{t}")

    model.AddAllDifferent([team_subgroup[t] for t in separated_teams])

    for t in separated_teams:
        for sg_idx, subgroup in enumerate(subgroups, 1):
            for g in subgroup:
                t_in_g = addIntEqValFlag(model, team_group[t], g, f'{namespace}_{t}_in_{g}')
                model.Add(team_subgroup[t] == sg_idx).OnlyEnforceIf(t_in_g)


def create_team_group_map(model, all_teams, num_groups):
    """Create a mapping from team to group variable"""
    team_group = {}
    for t in all_teams:
        team_group[t] = model.NewIntVar(1, num_groups, t)
    return team_group


def addPotConstraints(model, team_group, pots):
    """All teams in a pot must go to a different group"""
    for pot in pots:
        model.AddAllDifferent([team_group[t] for t in pot])


def addConfederationConstraints(model, team_group, confederations, confederation_limits, num_groups):
    """Enforce confederation limits per group"""
    for confederation, teams in confederations.items():
        for group in range(1, num_groups + 1):
            teams_in_group = []
            for team in teams:
                t_in_g = addIntEqValFlag(model, team_group[team], group, f'{team}_in_{group}')
                teams_in_group.append(t_in_g)

            limits = confederation_limits[confederation]
            model.Add(sum(teams_in_group) >= limits["min"])
            model.Add(sum(teams_in_group) <= limits["max"])


def addPathwayRestrictions(model, team_group, pathway_restrictions):
    """Add pathway separation constraints (e.g., top 2, top 4 must be in different pathways)"""
    for name, restriction in pathway_restrictions.items():
        addSeparateTeamsConstraint(model, team_group, name, restriction["teams"], restriction["pathways"])


def addFixedAssignments(model, team_group, fixed_assignments):
    """Fix certain teams to certain groups"""
    if fixed_assignments:
        for team, group in fixed_assignments.items():
            model.Add(team_group[team] == group)


def create_model(config, fixed_assignments=None):
    """Create CP model with all FIFA draw constraints"""
    model = cp_model.CpModel()

    # Get all unique teams
    all_teams = set()
    for teams in config["confederations"].values():
        all_teams.update(teams)

    num_groups = len(config["pots"][0])
    team_group = create_team_group_map(model, all_teams, num_groups)

    addPotConstraints(model, team_group, config["pots"])
    addConfederationConstraints(
        model, team_group,
        config["confederations"],
        config["confederation_limits"],
        num_groups
    )
    addPathwayRestrictions(model, team_group, config["pathway_restrictions"])
    addFixedAssignments(model, team_group, fixed_assignments)

    return model, team_group


def check_feasibility(config, fixed_assignments):
    """Check if valid completion exists"""
    model, _ = create_model(config, fixed_assignments)
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5
    result = solver.Solve(model)
    return result == cp_model.OPTIMAL or result == cp_model.FEASIBLE


def get_pot(team, pots):
    """Find which pot a team belongs to"""
    for pot in pots:
        if team in pot:
            return pot
    raise ValueError(f"Pot could not be determined for team: {team}")


def get_occupied_groups(pot, current_assignments):
    """Get groups already taken by teams in this pot"""
    occupied_groups = set()
    for t in pot:
        if t in current_assignments:
            occupied_groups.add(current_assignments[t])
    return occupied_groups


def get_valid_group_for_team(config, team, current_assignments):
    """Get the first valid group for a team (lowest-numbered)"""
    pots = config["pots"]
    num_groups = len(pots[0])
    pot = get_pot(team, pots)
    occupied_groups = get_occupied_groups(pot, current_assignments)

    for group in range(1, num_groups + 1):
        if group in occupied_groups:
            continue

        test_assignments = current_assignments.copy()
        test_assignments[team] = group

        if check_feasibility(config, test_assignments):
            return group

    return None


def get_initial_state(config):
    """Get initial state with hosts pre-assigned"""
    return dict(config["hosts"])


def get_pots(config):
    """Get pot assignments (1-indexed)"""
    return {i: pot for i, pot in enumerate(config["pots"], 1)}
