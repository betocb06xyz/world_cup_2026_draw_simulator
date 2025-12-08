"""
FIFA 2026 World Cup Draw - Vercel Serverless API Endpoint
"""
from http.server import BaseHTTPRequestHandler
import json
import os
from api.config import load_config
from api.solver import get_valid_group_for_team, get_initial_state, get_pots

# Load config once at module initialization
CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'draw_config.yaml')
CONFIG = load_config(CONFIG_PATH)


def get_valid_group_response(data):
    raw_assignments = data.get('assignments', {})
    assignments = {str(k): int(v) for k, v in raw_assignments.items()}

    team = data.get('team')
    valid_group = get_valid_group_for_team(CONFIG, team, assignments)

    return {
        'team': team,
        'valid_group': valid_group
    }


def get_initial_state_response():
    return {
        'assignments': get_initial_state(CONFIG),
        'pots': get_pots(CONFIG),
        'hosts': CONFIG.get('hosts', {}),
        'display_overrides': CONFIG.get('display_overrides', {}),
        'team_categories': CONFIG.get('team_categories', {})
    }


class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler"""

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def send_error_response(self, error):
        self.send_response(500)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error_response = {
            'error': str(error),
            'type': type(error).__name__
        }
        self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            body = self.rfile.read(content_length)
            data = json.loads(body.decode('utf-8'))
            action = data.get('action')

            if action == 'get_valid_group':
                response = get_valid_group_response(data)

            elif action == 'get_initial_state':
                response = get_initial_state_response()

            else:
                raise ValueError(f"Unknown action: {action}")

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))

        except Exception as error:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = {
                'error': str(error),
                'type': type(error).__name__
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
