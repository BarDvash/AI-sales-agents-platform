# AI Sales Agents Platform

A multi-tenant SaaS platform for AI-powered sales agents using Claude's function calling capabilities.

## Vision

**What we're building:** A platform that allows any business to deploy AI-powered sales agents that handle customer conversations, take orders, and manage sales workflows across multiple communication channels.

**Target customers:** Small to medium businesses (butchers, bakeries, restaurants, service providers) who want 24/7 automated sales capability.

**Business model:** Monthly subscription per tenant + usage-based pricing for message volume.

---

## Current Status

**Phase:** Multi-tenant foundation complete - Ready for tenant management tools.

**What works:**
- ✅ Conversational AI sales agent (Valdman persona)
- ✅ Tool calling framework (create, retrieve, cancel, update orders)
- ✅ Modular codebase ready for multi-tenant scaling
- ✅ Telegram integration
- ✅ PostgreSQL database with full persistence
- ✅ Database models (Tenant, Order, Customer, Conversation, Product, Message)
- ✅ Repository layer for data access
- ✅ Database migrations with Alembic
- ✅ Product catalog with pricing (unit, currency support)
- ✅ Multi-tenant webhook routing (/webhooks/telegram/{tenant_id})
- ✅ Two operational tenants (Valdman, Joanna's Bakery)
- ✅ Tenant-specific bot tokens and configurations
- ✅ Complete tenant data isolation
- ✅ Conversation summarization for extended memory (30 msg context + rolling summary)
- ✅ Customer profile tracking (auto-extracts name, address, language, notes from conversations)
- ✅ Agent CLI for E2E testing (scripts/agent_cli.py)

**Current Work:** Step 3 complete - Intelligence Layer done

**Next:** Multi-Channel Expansion → Tenant Management → Production Layer

---

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                Communication Channels                    │
│           (Telegram, WhatsApp, SMS, Web...)             │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│              API Layer (api/)                            │
│  • Webhook routing: /webhooks/{channel}/{tenant_id}     │
│  • Multi-tenant context injection                        │
│  • Admin endpoints (future)                              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│           Agent Intelligence (agent/)                    │
│  • Orchestrator: Main agent loop                        │
│  • Prompt Builder: Dynamic prompts from config          │
│  • LLM Integration: Claude (Anthropic)                  │
└──────────┬───────────────────────────────┬──────────────┘
           │                               │
           ▼                               ▼
┌──────────────────────┐        ┌─────────────────────────┐
│  Tools (tools/)      │        │  Storage (storage/)     │
│  • orders/           │        │  • PostgreSQL (now)     │
│  • products/         │        │  • Database models      │
│  • customers/        │        │  • Repository layer     │
└──────────────────────┘        └─────────────────────────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
                  ┌─────────────────────┐
                  │ Tenants (tenants/)  │
                  │ Config per business │
                  └─────────────────────┘
```

### Current Directory Structure

```
api/                    # HTTP layer
├── main.py            # FastAPI app initialization, health check
└── routes/
    └── webhooks.py    # Webhook endpoint: POST /webhooks/telegram/{tenant_id}

agent/                  # AI orchestration
├── orchestrator.py    # Main agent loop (LLM calls, tool execution)
├── prompt_builder.py  # Dynamic prompt construction from tenant config
├── summarizer.py      # Conversation summarization for extended memory
├── profile_extractor.py  # Auto-extract customer info from conversations
└── profile_context.py    # Build customer profile context for prompts

tools/                  # Agent capabilities (function calling)
├── __init__.py        # Tool registry and dispatcher
└── orders/
    ├── create_order.py         # Create structured orders
    ├── get_customer_orders.py  # Retrieve customer orders
    ├── cancel_order.py         # Cancel pending orders
    └── update_order.py         # Update pending orders

storage/                # Data persistence
├── database.py        # Database connection and session management
├── models/            # SQLAlchemy models (Tenant, Order, Customer, etc.)
└── repositories/      # Data access layer (TenantRepo, OrderRepo, etc.)

tenants/                # Multi-tenant configuration
└── loader.py          # Load tenant config from database

config/                 # Business configurations
├── valdman.py         # Valdman meat/sausage business
└── joannas_bakery.py  # Joanna's Bakery business

scripts/                # Development and testing tools
├── agent_cli.py       # E2E agent testing CLI (send messages, see tool calls)
├── dev.sh             # Start/stop development environment
├── seed_database.py   # Seed DB with tenant data and products
└── view_orders.py     # View all orders in database
```

### Key Architectural Principles

1. **Separation of Concerns**
   - `api/` - Only HTTP concerns
   - `agent/` - Only AI logic
   - `tools/` - Only action execution
   - `storage/` - Only data persistence
   - No cross-layer dependencies

2. **Multi-Tenant Ready**
   - Webhook routing: `/webhooks/{channel}/{tenant_id}`
   - Tenant context injected at API boundary
   - All queries filtered by tenant_id

3. **Tool-Based Actions**
   - LLM decides when to call tools (Claude function calling)
   - Structured data instead of string parsing
   - Tools organized by domain (orders/, products/, customers/)

4. **Async & Scalable**
   - FastAPI async endpoints
   - Stateless API servers
   - Horizontal scaling ready

---

## Features

### Current Features
- ✅ Telegram Bot webhook integration
- ✅ FastAPI-based async web server
- ✅ Claude Sonnet 4 LLM integration
- ✅ Async message handling
- ✅ Environment-based configuration
- ✅ Multilingual support (auto-detects language)
- ✅ Sales agent persona (configurable per tenant)
- ✅ Conversation memory (last 5 messages)
- ✅ Proper message role structure (user/assistant)
- ✅ Product catalog with pricing
- ✅ Order tracking and storage
- ✅ Tool calling framework (agent function calling)
- ✅ Modular layered architecture
- ✅ Error handling and logging

### Planned Features
- 🔄 WhatsApp integration
- 🔄 Admin dashboard
- 🔄 Payment processing
- 🔄 E-commerce integrations (Shopify, WooCommerce)
- 🔄 Manager/customer role separation
- 🔄 Human handoff capability

---

## Setup

### Prerequisites
- Python 3.9+
- Docker Desktop (for PostgreSQL)
- Telegram Bot (create via [@BotFather](https://t.me/botfather))
- Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repo-url>
cd AI-sales-agents-platform
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env and add:
# VALDMAN_BOT_TOKEN=your_valdman_bot_token
# JOANNAS_BOT_TOKEN=your_joannas_bot_token
# ANTHROPIC_API_KEY=your_anthropic_api_key
# DATABASE_URL=postgresql://sales_agent_user:dev_password_change_in_production@localhost:5432/sales_agents_platform
```

3. **Set up the database:**
```bash
# Start PostgreSQL in Docker
docker-compose up -d postgres

# Run migrations to create tables
alembic upgrade head

# Seed database with Valdman tenant and products
python scripts/seed_database.py
```

4. **Start the development environment:**
```bash
# Starts PostgreSQL, runs migrations, launches server + ngrok, sets webhooks
./scripts/dev.sh start

# Other commands:
./scripts/dev.sh start valdman      # Start specific tenant only
./scripts/dev.sh stop               # Stop server + ngrok (DB stays running)
./scripts/dev.sh restart            # Restart everything
./scripts/dev.sh status             # Show running services status
```

### Database Management

**View all orders in the database:**
```bash
python scripts/view_orders.py
```

**Access PostgreSQL directly:**
```bash
# Using psql command line
docker exec -it ai-sales-agents-platform-postgres-1 psql -U sales_agent_user -d sales_agents_platform

# Or use a GUI tool like:
# - pgAdmin (https://www.pgadmin.org/)
# - Postico (Mac)
# - DBeaver (cross-platform)
# Connection: localhost:5432, user: sales_agent_user, password: dev_password_change_in_production
```

**Reset database (careful - deletes all data):**
```bash
# Drop and recreate database
docker-compose down -v
docker-compose up -d postgres
alembic upgrade head
python scripts/seed_database.py
```

---

## Testing

### Agent CLI (E2E Testing Tool)

The `scripts/agent_cli.py` script provides a direct CLI interface to the agent orchestrator — no server or Telegram needed. It calls the same `process_message` function that production uses, giving full E2E testing capabilities.

**Usage:**
```bash
./venv/bin/python3 scripts/agent_cli.py --chat-id <ID> -m "<message>"
```

**Parameters:**
- `--chat-id` (required) — conversation identifier. Use the same ID across calls for multi-turn conversations.
- `-m` (required) — the message to send to the agent.
- `--tenant` (optional, default: `valdman`) — which tenant's agent to test.

**Example multi-turn conversation:**
```bash
# Start a conversation
./venv/bin/python3 scripts/agent_cli.py --chat-id test-001 -m "מה יש לכם?"

# Continue the same conversation (same chat-id)
./venv/bin/python3 scripts/agent_cli.py --chat-id test-001 -m "אני רוצה 2 קילו בשר טחון"

# Confirm the order
./venv/bin/python3 scripts/agent_cli.py --chat-id test-001 -m "כן, אשר"

# Cancel it
./venv/bin/python3 scripts/agent_cli.py --chat-id test-001 -m "תבטל את ההזמנה"
```

**Output sections:**
- **Server Logs** — orchestrator internal logs (request metadata, tool execution summaries)
- **Agent Trace** — full tool call details (name, input JSON, result)
- **Agent:** — the final response text

**Requirements:** PostgreSQL running + `.env` file in project root (DATABASE_URL, ANTHROPIC_API_KEY). The script auto-loads `.env` — no need to source it manually. No FastAPI server needed.

**Development workflow (Claude Code):** After implementing new tools or modifying agent behavior, you are EXPECTED to use this script to validate changes E2E before considering the task done. This is part of the standard development process:
1. Make code changes (new tool, prompt update, etc.)
2. Run `scripts/agent_cli.py` with a fresh `--chat-id` to test the change
3. Read the output (tool calls, agent response) and send follow-up messages to verify the full flow
4. Adapt messages based on what the agent actually says (don't pre-script)
5. Confirm the feature works correctly before committing

This gives near-production confidence without needing Telegram.

### Quick Import Test
Verify all modules load correctly:
```bash
source venv/bin/activate
python -c "
from api.main import app
from agent.orchestrator import process_message
from tools import TOOL_DEFINITIONS
from tenants.loader import load_tenant_config

print('✅ All modules loaded')
print(f'✅ {len(TOOL_DEFINITIONS)} tools registered')
print(f'✅ Tenant: {load_tenant_config().COMPANY_NAME}')
"
```

### Local Testing with Telegram

```bash
./scripts/dev.sh start
```

This starts PostgreSQL, the server, ngrok, and registers all webhooks. Ctrl+C to stop.

**Test conversation flow:**
- Basic greeting and product inquiry
- Order creation with price calculation
- Order confirmation using `create_order` tool
- Order retrieval using `get_customer_orders` tool

**Monitor Terminal 1** for tool execution logs and order creation.

---

## Development Roadmap

### Immediate Priorities

**Foundation Layer**
- [x] Database persistence (PostgreSQL) ✅ COMPLETE
- [x] Multi-tenant webhook routing ✅ COMPLETE

**Intelligence Layer** ⬅️ **CURRENT PRIORITY**
- [x] Conversation summarization (extended memory) ✅ COMPLETE
- [x] Customer profile tracking ✅ COMPLETE
- [x] cancel_order tool ✅ COMPLETE
- [x] update_order tool ✅ COMPLETE
- [ ] search_products tool (deferred until real-time inventory/larger catalogs)

**Multi-Channel Expansion** ⬅️ **NEXT**
- [ ] Channel abstraction layer
- [ ] WhatsApp integration
- [ ] Unified Message model

**Tenant Management**
- [ ] CLI script to add new tenant
- [ ] Configure products, agent persona, bot token
- [ ] Webhook registration automation
- [ ] Simple admin endpoint (list tenants, view orders)

**Production Layer**
- [ ] E-commerce integrations (Shopify, WooCommerce)
- [ ] Payment processing (Stripe, PayPal)
- [ ] Real-time inventory sync
- [ ] CRM integrations
- [ ] Admin dashboard
- [ ] Manager/customer role separation

---

## Next Steps - Choose Your Path

**Current State:** Multi-tenant platform with 2 operational tenants and complete data isolation.

### Path A: Intelligence Layer 🧠 ⬅️ **CURRENT PRIORITY**
*Improving agent memory and capabilities*

**Status:** Steps 1-2 Complete ✅ - Ready for Step 3 (Intelligence Layer)

#### Step 1: Database Layer ✅ COMPLETE
**Goal:** Replace in-memory storage with PostgreSQL

**Tasks:**
- [x] Set up PostgreSQL locally (Docker)
- [x] Install SQLAlchemy + Alembic
- [x] Create database models:
  - `Tenant` - Business configurations (company_name, products, agent_role, etc.)
  - `Order` - Order records with items
  - `Customer` - Customer profiles
  - `Conversation` - Message history
  - `Product` - Product catalogs per tenant
- [x] Create repository layer (data access)
- [x] Migrate `storage/state.py` → database queries
- [x] Database migrations with Alembic
- [x] Test: Create order → restart server → order still exists

**Status:** ✅ Complete - Orders persist to PostgreSQL, view with `python scripts/view_orders.py`

---

#### Step 2: Multi-Tenant Routing ✅ COMPLETE
**Goal:** Support multiple businesses simultaneously

**Tasks:**
- [x] Change webhook route: `/webhooks/telegram` → `/webhooks/telegram/{tenant_id}`
- [x] Extract tenant_id from URL
- [x] Load tenant config from database (not hardcoded)
- [x] Tenant isolation (each tenant sees only their data)
- [x] Test with 2 tenants (Valdman + Joanna's Bakery)

**Status:** ✅ Complete - Two tenants operational with complete data isolation

---

#### Step 3: Intelligence Layer ✅ COMPLETE
**Goal:** Improve agent memory and add more capabilities

**Tasks:**
- [x] Conversation summarization for extended memory ✅ COMPLETE
- [x] Customer profile tracking across sessions ✅ COMPLETE
- [x] cancel_order tool ✅ COMPLETE
- [x] update_order tool ✅ COMPLETE
- [ ] search_products tool (deferred until real-time inventory/larger catalogs)

**Why third:** Better user experience and more helpful agents

**Completed:**
- Conversation summarization - agent now keeps 30 messages in context and summarizes every 15 messages into a rolling summary for extended memory.
- Customer profile tracking - agent auto-extracts customer info (name, address, language, notes) from conversations and persists across sessions. Profile + order history injected into system prompt.
- cancel_order tool - customers can cancel pending orders. Tool validates ownership and status. Prompt auto-generates Available Tools from registry.
- update_order tool - customers can modify pending orders (add/remove items, change quantities). Replaces full order contents with validated ownership checks.

---

#### Step 4: Multi-Channel Expansion
**Goal:** Support multiple messaging platforms

**Tasks:**
- [ ] Create channel abstraction layer
- [ ] Implement WhatsApp integration
- [ ] Unified Message model
- [ ] Test same agent on both channels

**Why fourth:** Reach customers on their preferred platforms

---

#### Step 5: Tenant Management
**Goal:** Easy way to add/configure new businesses

**Tasks:**
- [ ] CLI script to add new tenant
- [ ] Configure products, agent persona, bot token
- [ ] Webhook registration automation
- [ ] Simple admin endpoint (list tenants, view orders)

**Why fifth:** Can onboard pilots without writing code

---

#### Step 6: Production Layer
**Goal:** Production-ready features for real businesses

**Tasks:**
- [ ] E-commerce integrations (Shopify, WooCommerce)
- [ ] Payment processing (Stripe, PayPal)
- [ ] Real-time inventory sync
- [ ] CRM integrations
- [ ] Admin dashboard
- [ ] Manager/customer role separation

**Why sixth:** Revenue-generating features for real deployments

---

**Total Timeline:** ~4-6 weeks
**Outcome:** Production-ready SaaS platform with intelligent agents across multiple channels

---

## Contributing

This is currently a solo project. Following atomic milestone approach - each PR should:
- Complete one specific step from roadmap
- Include tests
- Update this README

---

## Tech Stack

### Current Stack
- **Backend:** FastAPI (async Python web framework)
- **LLM:** Claude Sonnet 4 via Anthropic SDK
- **Messaging:** Telegram Bot API (WhatsApp planned)
- **Storage:** In-memory (temporary - migration in progress)
- **Config:** python-dotenv
- **Tools:** Claude function calling (tool use API)

### Production Stack (In Progress)

**Database Layer:**
- **PostgreSQL** - Primary database for all persistent data
  - Tenants (business configurations)
  - Orders (order data, items, status)
  - Customers (profiles, preferences)
  - Products (catalogs)
  - Conversations (message history)
  - **Why:** Industry standard, ACID transactions, relational data, scales to millions of records
  - **Tooling:** SQLAlchemy ORM + Alembic migrations
  - **Hosting:** Railway/Render (development) → AWS RDS (scale)

- **Redis** - Cache layer (optional, add when needed)
  - Tenant config cache (fast lookups)
  - Rate limiting
  - Session data
  - **Why:** Microsecond reads, reduces DB load
  - **Hosting:** Railway/Render or Upstash

**Migration Strategy:**
- Phase 1: PostgreSQL locally via Docker (development)
- Phase 2: PostgreSQL on Railway/Render (production-ready)
- Phase 3: Add Redis when traffic demands it
- **No database migration needed** - PostgreSQL is final destination

---

## License

[Add license]

---

## Contact

[Add contact info]
