"""
FastAPI application initialization and configuration.
"""
import os
from fastapi import FastAPI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Sales Agents Platform",
    description="Multi-tenant AI-powered sales agent platform",
    version="0.1.0"
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Import routes
from api.routes import webhooks, admin

# Register route modules
app.include_router(webhooks.router)
app.include_router(admin.router)
