"""
Application entry point.

DEPRECATED: This file is kept for backward compatibility.
The application has been refactored into a modular structure:
- api/ - HTTP endpoints
- agent/ - AI orchestration
- tools/ - Agent capabilities
- storage/ - Data persistence
- tenants/ - Multi-tenant configuration

To run the application, use: uvicorn api.main:app --reload
"""

# Import the FastAPI app from the new structure
from api.main import app

# This allows running with: uvicorn main:app --reload (backward compatible)
# But we recommend: uvicorn api.main:app --reload
