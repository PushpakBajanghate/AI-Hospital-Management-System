"""
Vercel serverless entry point for the FastAPI backend.
Vercel calls this file to handle all /api/* requests.
"""
import sys
import os

# Ensure the backend root is on the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: F401 – Vercel needs the `app` symbol at module level
