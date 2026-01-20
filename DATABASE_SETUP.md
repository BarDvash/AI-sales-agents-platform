# Database Setup Guide

## Step 1: Start PostgreSQL (Docker)

Make sure Docker is installed and running on your machine.

### Start the database:
```bash
docker-compose up -d
```

**What this does:**
- Downloads PostgreSQL 15 (first time only)
- Starts PostgreSQL in the background (`-d` = detached mode)
- Creates a database called `sales_agents_platform`
- Exposes it on `localhost:5432`

### Check if it's running:
```bash
docker-compose ps
```

You should see:
```
NAME                   STATUS
ai_sales_agents_db     Up (healthy)
```

### View database logs:
```bash
docker-compose logs postgres
```

### Stop the database:
```bash
docker-compose down
```

**Note:** Data persists in a Docker volume, so stopping/starting won't lose data.

---

## Step 2: Connect to the Database (Optional)

If you want to explore the database directly:

```bash
docker exec -it ai_sales_agents_db psql -U sales_agent_user -d sales_agents_platform
```

**Useful PostgreSQL commands:**
- `\dt` - List all tables
- `\d table_name` - Describe table structure
- `SELECT * FROM tenants;` - Query tenants table
- `\q` - Exit

---

## Connection String Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Local (Docker):**
```
postgresql://sales_agent_user:dev_password_change_in_production@localhost:5432/sales_agents_platform
```

**Production (Railway/Render):**
```
postgresql://user:pass@host.railway.app:5432/railway
```
(Will be provided by hosting platform)

---

## Troubleshooting

**"Port 5432 already in use":**
- You might have PostgreSQL installed locally
- Stop local PostgreSQL: `brew services stop postgresql` (Mac)
- Or change port in `docker-compose.yml`: `"5433:5432"`

**"Connection refused":**
- Make sure Docker is running
- Check `docker-compose ps` - container should be "Up (healthy)"
- Wait a few seconds after starting - database needs time to initialize

**Reset everything:**
```bash
docker-compose down -v  # -v removes volumes (deletes all data)
docker-compose up -d
```
