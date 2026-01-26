"""
FastAPI application initialization and configuration.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="AI Sales Agents Platform",
    description="Multi-tenant AI-powered sales agent platform",
    version="0.1.0"
)

# CORS middleware for Admin Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
