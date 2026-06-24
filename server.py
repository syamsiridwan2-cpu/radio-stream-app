#!/usr/bin/env python3
"""
Radio Stream — Simple HTTP Server for Raspberry Pi
Usage:
    python3 server.py                    # Port 8000 (default)
    python3 server.py --port 8080        # Custom port
    python3 server.py --host 0.0.0.0     # All interfaces
"""

import os
import sys
import argparse
from http.server import HTTPServer, SimpleHTTPRequestHandler

DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def log_message(self, format, *args):
        """Log dengan format timestamp."""
        import datetime
        ts = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        sys.stderr.write(f'[{ts}] {args[0]} {args[1]} {args[2]}\n')

def main():
    parser = argparse.ArgumentParser(description='Radio Stream HTTP Server')
    parser.add_argument('--host', default='0.0.0.0', help='Bind address (default: 0.0.0.0)')
    parser.add_argument('--port', type=int, default=8000, help='Port (default: 8000)')
    args = parser.parse_args()

    server = HTTPServer((args.host, args.port), Handler)
    print(f'📻 Radio Stream Server running on http://{args.host}:{args.port}/')
    print(f'   Local:    http://127.0.0.1:{args.port}/')
    print(f'   Network:  http://<ip-pi>:{args.port}/')
    print('   Press Ctrl+C to stop\n')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n⏹ Server stopped.')
        server.server_close()

if __name__ == '__main__':
    main()
