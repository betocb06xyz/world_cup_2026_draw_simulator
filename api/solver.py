"""
FIFA 2026 World Cup Draw - Python API Endpoint (Vercel Serverless)
Handles constraint checking with OR-Tools CP-SAT solver
"""

from http.server import BaseHTTPRequestHandler
import json
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

# =============================================================================
# CP MODEL
# =============================================================================

def create_model(fixed_assignments=None):
    """Create CP model with all FIFA draw constraints"""
    model = cp_model.CpModel()

    team_group = {}
    for team in ALL_TEAMS:
        team_group[team] = model.NewIntVar(1, 12, team)

    # Pot constraints
    model.AddAllDifferent([team_group[t] for t in POT1])
    model.AddAllDifferent([team_group[t] for t in POT2])
    model.AddAllDifferent([team_group[t] for t in POT3])
    model.AddAllDifferent([team_group[t] for t in POT4])

    # Confederation constraints
    model.AddAllDifferent([team_group[t] for t in CONCACAF])
    model.AddAllDifferent([team_group[t] for t in CONMEBOL])
    model.AddAllDifferent([team_group[t] for t in CAF])
    model.AddAllDifferent([team_group[t] for t in AFC])

    # UEFA: 1-2 per group
    for g in range(1, 13):
        uefa_in_g = []
        for t in UEFA:
            is_in_g = model.NewBoolVar(f'{t}_in_{g}')
            model.Add(team_group[t] == g).OnlyEnforceIf(is_in_g)
            model.Add(team_group[t] != g).OnlyEnforceIf(is_in_g.Not())
            uefa_in_g.append(is_in_g)

        model.Add(sum(uefa_in_g) >= 1)
        model.Add(sum(uefa_in_g) <= 2)

    # CA and EA must be in different halves
    # Half 1: A, B, C, J, K, L (groups 1, 2, 3, 10, 11, 12)
    # Half 2: D, E, F, G, H, I (groups 4, 5, 6, 7, 8, 9)
    HALF_1 = [1, 2, 3, 10, 11, 12]
    HALF_2 = [4, 5, 6, 7, 8, 9]

    # Create boolean: is CA in half 1?
    ca_in_half1 = model.NewBoolVar('ca_in_half1')
    ca_in_h1_bools = []
    for g in HALF_1:
        b = model.NewBoolVar(f'ca_in_h1_{g}')
        model.Add(team_group["CA"] == g).OnlyEnforceIf(b)
        model.Add(team_group["CA"] != g).OnlyEnforceIf(b.Not())
        ca_in_h1_bools.append(b)
    model.Add(sum(ca_in_h1_bools) >= 1).OnlyEnforceIf(ca_in_half1)
    model.Add(sum(ca_in_h1_bools) == 0).OnlyEnforceIf(ca_in_half1.Not())

    # If CA in half 1, EA must be in half 2
    for g in HALF_1:
        model.Add(team_group["EA"] != g).OnlyEnforceIf(ca_in_half1)
    # If CA in half 2, EA must be in half 1
    for g in HALF_2:
        model.Add(team_group["EA"] != g).OnlyEnforceIf(ca_in_half1.Not())

    # CA, EA, EB, EC must each be in different subgroups (4 subgroups, 4 teams)
    # Subgroup 1: A, C, L (groups 1, 3, 12)
    # Subgroup 2: B, J, K (groups 2, 10, 11)
    # Subgroup 3: D, G, H (groups 4, 7, 8)
    # Subgroup 4: E, F, I (groups 5, 6, 9)
    SUBGROUPS = [
        [1, 3, 12],   # sg1: A, C, L
        [2, 10, 11],  # sg2: B, J, K
        [4, 7, 8],    # sg3: D, G, H
        [5, 6, 9],    # sg4: E, F, I
    ]
    SEPARATED_TEAMS = ["CA", "EA", "EB", "EC"]

    # For each team, create a variable indicating which subgroup it's in (0-3)
    team_subgroup = {}
    for team in SEPARATED_TEAMS:
        team_subgroup[team] = model.NewIntVar(0, 3, f'{team}_subgroup')

        # Link team_subgroup to actual group assignment
        for sg_idx, sg_groups in enumerate(SUBGROUPS):
            # Create bool: is team in this subgroup?
            in_this_sg = model.NewBoolVar(f'{team}_in_sg{sg_idx}')

            # team is in subgroup sg_idx iff team_group[team] is in sg_groups
            in_sg_bools = []
            for g in sg_groups:
                b = model.NewBoolVar(f'{team}_in_g{g}')
                model.Add(team_group[team] == g).OnlyEnforceIf(b)
                model.Add(team_group[team] != g).OnlyEnforceIf(b.Not())
                in_sg_bools.append(b)

            # in_this_sg is true iff team is in one of the groups in this subgroup
            model.AddBoolOr(in_sg_bools).OnlyEnforceIf(in_this_sg)
            model.AddBoolAnd([b.Not() for b in in_sg_bools]).OnlyEnforceIf(in_this_sg.Not())

            # Link to team_subgroup variable
            model.Add(team_subgroup[team] == sg_idx).OnlyEnforceIf(in_this_sg)

    # All 4 teams must be in different subgroups
    model.AddAllDifferent([team_subgroup[t] for t in SEPARATED_TEAMS])

    # Playoff constraints
    for t in CONCACAF:
        model.Add(team_group["YA"] != team_group[t])
    for t in CAF:
        model.Add(team_group["YA"] != team_group[t])
    for t in OFC:
        model.Add(team_group["YA"] != team_group[t])

    for t in CONCACAF:
        model.Add(team_group["ZA"] != team_group[t])
    for t in CONMEBOL:
        model.Add(team_group["ZA"] != team_group[t])
    for t in AFC:
        model.Add(team_group["ZA"] != team_group[t])

    # Fixed assignments
    if fixed_assignments:
        for team, group in fixed_assignments.items():
            model.Add(team_group[team] == group)

    return model, team_group


def check_feasibility(fixed_assignments):
    """Check if valid completion exists"""
    model, _ = create_model(fixed_assignments)
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5
    result = solver.Solve(model)
    return result == cp_model.OPTIMAL or result == cp_model.FEASIBLE


def get_valid_groups_for_team(team, current_assignments):
    """Get list of valid groups for a team"""
    valid_groups = []

    # Find team's pot
    team_pot = None
    pot_teams = None
    for pot_num, pot in enumerate(ALL_POTS, 1):
        if team in pot:
            team_pot = pot_num
            pot_teams = pot
            break

    if team_pot is None:
        return []

    # Find groups with team from this pot
    groups_with_pot = set()
    for t, g in current_assignments.items():
        if t in pot_teams:
            groups_with_pot.add(g)

    # Try each group
    for group in range(1, 13):
        if group in groups_with_pot:
            continue

        test_assignments = current_assignments.copy()
        test_assignments[team] = group

        if check_feasibility(test_assignments):
            valid_groups.append(group)

    return valid_groups


def get_initial_state():
    """Get initial state with hosts pre-assigned"""
    return {
        'NA': 1,  # Mexico → Group A
        'NB': 2,  # Canada → Group B
        'NC': 4   # USA → Group D
    }


# =============================================================================
# VERCEL SERVERLESS HANDLER
# =============================================================================

class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler"""

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle POST request"""
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))

            action = data.get('action')
            assignments = data.get('assignments', {})

            # Convert string keys to proper format
            assignments = {str(k): int(v) for k, v in assignments.items()}

            response_data = {}

            if action == 'get_valid_groups':
                team = data.get('team')
                valid_groups = get_valid_groups_for_team(team, assignments)
                response_data = {
                    'valid_groups': valid_groups,
                    'team': team
                }

            elif action == 'check_feasibility':
                is_feasible = check_feasibility(assignments)
                response_data = {
                    'feasible': is_feasible
                }

            elif action == 'get_initial_state':
                response_data = {
                    'assignments': get_initial_state()
                }

            else:
                raise ValueError(f"Unknown action: {action}")

            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))

        except Exception as e:
            # Send error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {
                'error': str(e),
                'type': type(e).__name__
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
