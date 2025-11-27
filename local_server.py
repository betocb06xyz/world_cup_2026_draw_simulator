#!/usr/bin/env python3
"""
Local development server for testing the FIFA draw simulator
Run this instead of 'vercel dev' to test without Vercel account
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import sys

# Add the api module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

from solver import get_valid_groups_for_team, check_feasibility, get_initial_state


class LocalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='public', **kwargs)

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle API requests"""
        if self.path == '/api/solver':
            try:
                content_length = int(self.headers['Content-Length'])
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))

                action = data.get('action')
                assignments = data.get('assignments', {})
                assignments = {str(k): int(v) for k, v in assignments.items()}

                response_data = {}

                if action == 'get_valid_groups':
                    team = data.get('team')
                    valid_groups = get_valid_groups_for_team(team, assignments)
                    response_data = {'valid_groups': valid_groups, 'team': team}

                elif action == 'check_feasibility':
                    is_feasible = check_feasibility(assignments)
                    response_data = {'feasible': is_feasible}

                elif action == 'get_initial_state':
                    response_data = {'assignments': {'NA': 1, 'NB': 2, 'NC': 4}}

                else:
                    raise ValueError(f"Unknown action: {action}")

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(response_data).encode('utf-8'))

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = {'error': str(e), 'type': type(e).__name__}
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
        else:
            super().do_POST()

    def do_GET(self):
        """Serve static files"""
        super().do_GET()


if __name__ == '__main__':
    PORT = 3000

    print(f"""
╔════════════════════════════════════════════════════════════╗
║  FIFA 2026 World Cup Draw Simulator - Local Dev Server    ║
╚════════════════════════════════════════════════════════════╝

🚀 Server running at: http://localhost:{PORT}
📡 API endpoint: http://localhost:{PORT}/api/solver

Press Ctrl+C to stop
""")

    server = HTTPServer(('localhost', PORT), LocalHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✋ Server stopped")
