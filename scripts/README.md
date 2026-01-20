# Database Setup Scripts

This directory contains scripts for setting up and managing the database.

## Quick Start

Run the complete database setup in one command:

```bash
./scripts/setup_database.sh
```

This will:
1. Start PostgreSQL in Docker
2. Install Python dependencies
3. Run database migrations
4. Seed database with Valdman tenant and products

## Individual Scripts

### `setup_database.sh`
Complete database initialization script. Use this for first-time setup.

```bash
./scripts/setup_database.sh
```

### `seed_database.py`
Seeds the database with Valdman tenant and product catalog.

```bash
python scripts/seed_database.py
```

**Note**: This is idempotent - it won't create duplicates if data already exists.

## Manual Steps (if needed)

If you prefer to run steps manually:

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Wait for database to be ready
docker exec ai_sales_agents_db pg_isready -U sales_agent_user

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
alembic upgrade head

# 5. Seed database
python scripts/seed_database.py
```

## Troubleshooting

**Docker not running:**
```
Error: Docker is not running
```
Solution: Start Docker Desktop

**Database connection errors:**
```
Error: could not connect to server
```
Solution: Wait a few more seconds for PostgreSQL to start, then retry

**Migration errors:**
```
Error: Target database is not up to date
```
Solution: Run `alembic upgrade head`
