import uvicorn
import os
import sys
from pathlib import Path

# Ensure backend root is on Python path
sys.path.insert(0, str(Path(__file__).resolve().parent))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting RetinaRetail Backend on http://localhost:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
