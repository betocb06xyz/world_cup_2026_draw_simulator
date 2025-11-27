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
