#!/usr/bin/env python3
"""
VibeArchitect Backend Runner
Simple script to start the FastAPI development server
"""

import uvicorn
import sys
from pathlib import Path

def main():
    """Run the FastAPI application with uvicorn"""
    
    # Ensure we're in the backend directory
    backend_dir = Path(__file__).parent
    sys.path.insert(0, str(backend_dir))
    
    print("🚀 Starting VibeArchitect Backend...")
    print("📍 API will be available at: http://localhost:8000")
    print("📖 Docs available at: http://localhost:8000/docs")
    print("🔄 Auto-reload enabled - edit files to see changes")
    print("-" * 60)
    
    # Run uvicorn with the FastAPI app
    uvicorn.run(
        "src.presentation.api.app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir / "src")],
        log_level="info",
        access_log=True,
    )

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Shutting down VibeArchitect Backend...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        sys.exit(1)
