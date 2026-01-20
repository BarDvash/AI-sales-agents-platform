# Database Migration Complete

All 10 steps of the database migration are now complete. The platform now uses PostgreSQL for persistent storage.

## What Changed

### Before (In-Memory Storage)
- Conversations and orders stored in Python dictionaries
- Data lost on server restart
- No multi-tenant support
- Single bot token

### After (PostgreSQL Database)
- All data persisted in PostgreSQL
- Data survives restarts
- Multi-tenant architecture ready
- Scalable and production-ready

## Architecture Overview

```
api/routes/webhooks.py
    ↓ (receives message)
agent/orchestrator.py
    ↓ (loads tenant config from DB)
tenants/loader.py → storage/repositories/tenant_repo.py
    ↓ (saves messages to DB)
storage/repositories/conversation_repo.py
    ↓ (calls tools)
tools/orders/create_order.py → storage/repositories/order_repo.py
    ↓ (saves to database)
PostgreSQL Database
```

## Database Schema

**Tables:**
- `tenants` - Business customers (Valdman, Joanna's Bakery, etc.)
- `products` - Product catalogs per tenant
- `customers` - End users identified by chat_id
- `orders` - Customer orders with JSON items
- `conversations` - Chat sessions
- `messages` - Individual messages in conversations

**Relationships:**
```
tenants
  ├── products (1:many)
  ├── customers (1:many)
  ├── orders (1:many)
  └── conversations (1:many)

customers
  ├── orders (1:many)
  └── conversations (1:many)

conversations
  └── messages (1:many)
```

## Testing Instructions

### 1. Run Database Setup

```bash
# This will: start PostgreSQL, install deps, run migrations, seed data
./scripts/setup_database.sh
```

**What this does:**
- Starts PostgreSQL container via Docker
- Installs SQLAlchemy, Alembic, psycopg
- Creates all database tables
- Seeds Valdman tenant + product catalog

### 2. Start the Server

```bash
uvicorn api.main:app --reload
```

Server runs at: http://localhost:8000

### 3. Expose Webhook (in new terminal)

```bash
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 4. Set Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://abc123.ngrok.io/webhooks/telegram"
```

Replace `<YOUR_BOT_TOKEN>` with your actual bot token from `.env`

### 5. Test with Telegram

Open your Telegram bot and test:

**Test 1: Create Order**
```
User: I want to order 2kg of rye bread
Bot: [creates order, saves to database]
```

**Test 2: Restart Server**
```
# Stop server (Ctrl+C)
# Start server again
uvicorn api.main:app --reload
```

**Test 3: Retrieve Order**
```
User: What are my orders?
Bot: [retrieves orders from database - they persisted!]
```

**Success Criteria:**
- ✓ Orders persist after server restart
- ✓ Conversation history persists
- ✓ Customer profile saved in database
- ✓ Console shows database operations

## Verification

Check the database directly:

```bash
# Connect to PostgreSQL
docker exec -it ai_sales_agents_db psql -U sales_agent_user -d sales_agents_platform

# List tables
\dt

# View tenants
SELECT * FROM tenants;

# View products
SELECT id, name, price FROM products;

# View orders (after creating some via Telegram)
SELECT id, total, status, created_at FROM orders;

# View customers
SELECT id, chat_id, name FROM customers;

# Exit
\q
```

## Files Changed

**New Files:**
- `storage/database.py` - Database connection and session management
- `storage/models/*.py` - SQLAlchemy models (Tenant, Order, Customer, etc.)
- `storage/repositories/*.py` - Data access layer
- `alembic/` - Migration configuration and scripts
- `scripts/setup_database.sh` - Automated setup script
- `scripts/seed_database.py` - Database seeding script

**Modified Files:**
- `agent/orchestrator.py` - Now uses database repositories
- `tools/orders/create_order.py` - Saves to database
- `tools/orders/get_customer_orders.py` - Reads from database
- `tenants/loader.py` - Loads config from database
- `api/routes/webhooks.py` - Passes tenant_id
- `requirements.txt` - Added database dependencies

**Removed Files:**
- `storage/state.py` - No longer needed (replaced by database)

## Next Steps

After successful testing:

1. **Multi-Tenant Support** - Add second tenant (Joanna's Bakery)
2. **WhatsApp Integration** - Add WhatsApp Business API channel
3. **Cloud Deployment** - Deploy to Railway/Render with managed PostgreSQL
4. **Analytics Dashboard** - Track orders, conversations, customers

## Troubleshooting

**Error: Docker not running**
```
Solution: Start Docker Desktop
```

**Error: Database connection failed**
```
Solution: Check DATABASE_URL in .env matches docker-compose.yml
```

**Error: No module named 'storage.repositories'**
```
Solution: Make sure you ran: pip install -r requirements.txt
```

**Error: Table doesn't exist**
```
Solution: Run migrations: alembic upgrade head
```

**Error: Tenant 'valdman' not found**
```
Solution: Run seed script: python scripts/seed_database.py
```
