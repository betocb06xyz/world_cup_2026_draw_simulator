#!/usr/bin/env python3
"""
Local development server for testing the FIFA draw simulator
Run this instead of 'vercel dev' to test without Vercel account
"""

from http.server import HTTPServer, SimpleHTTPRequestHandler
import os
import sys

# Add the api module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

from solver import handler as SolverHandler


class LocalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='public', **kwargs)

    def do_OPTIONS(self):
        if self.path == '/api/solver':
            SolverHandler.do_OPTIONS(self)
        else:
            self.send_response(200)
            self.end_headers()

    def do_POST(self):
        if self.path == '/api/solver':
            SolverHandler.do_POST(self)
        else:
            super().do_POST()


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Local dev server for FIFA 2026 Draw Simulator')
    parser.add_argument('-p', '--port', type=int, default=3000, help='Port to run server on (default: 3000)')
    args = parser.parse_args()
    PORT = args.port

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
