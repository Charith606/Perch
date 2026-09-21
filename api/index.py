import sys
import os

# Ensure current directory (api) and backend are in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

backend_dir = os.path.join(current_dir, "..", "backend")
if os.path.exists(backend_dir) and backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
