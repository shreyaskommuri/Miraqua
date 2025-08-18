#!/usr/bin/env python3
"""
Miraqua Official Backend Startup Script
Starts the Flask backend server for MiraquaOfficial
"""

import os
import sys
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set default port
PORT = int(os.getenv('PORT', 5050))
HOST = os.getenv('HOST', '0.0.0.0')

if __name__ == '__main__':
    print("🌱 Starting Miraqua Official Backend...")
    print(f"📡 Server running on http://{HOST}:{PORT}")
    print("🔄 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Import and run the Flask app
    from app_backend import app
    app.run(host=HOST, port=PORT, debug=True)
