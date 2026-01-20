#!/bin/bash
# Database setup script - runs all initialization steps

set -e  # Exit on error

echo "=========================================="
echo "Database Setup Script"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Step 1: Start PostgreSQL container
echo "Step 1: Starting PostgreSQL container..."
docker-compose up -d postgres
echo "✓ PostgreSQL container started"
echo ""

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 3
until docker exec ai_sales_agents_db pg_isready -U sales_agent_user > /dev/null 2>&1; do
    echo "  Waiting for database..."
    sleep 2
done
echo "✓ PostgreSQL is ready"
echo ""

# Step 2: Install Python dependencies
echo "Step 2: Installing Python dependencies..."
pip install -r requirements.txt --quiet
echo "✓ Dependencies installed"
echo ""

# Step 3: Run Alembic migrations
echo "Step 3: Running database migrations..."
alembic upgrade head
echo "✓ Migrations applied"
echo ""

# Step 4: Seed database with Valdman data
echo "Step 4: Seeding database with Valdman tenant and products..."
python scripts/seed_database.py
echo ""

echo "=========================================="
echo "✓ Database setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Start the server: uvicorn api.main:app --reload"
echo "  2. Expose webhook: ngrok http 8000"
echo "  3. Test with Telegram"
