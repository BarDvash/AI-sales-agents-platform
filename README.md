# AI Sales Agents Platform

A multi-tenant SaaS platform for AI-powered sales agents using Claude's function calling capabilities.

## Vision

**What we're building:** A platform that allows any business to deploy AI-powered sales agents that handle customer conversations, take orders, and manage sales workflows across multiple communication channels.

**Target customers:** Small to medium businesses (butchers, bakeries, restaurants, service providers) who want 24/7 automated sales capability.

**Business model:** Monthly subscription per tenant + usage-based pricing for message volume.

---

## Current Status

**Phase:** Building production foundation - Adding database persistence and multi-tenant support.

**What works:**
- ✅ Conversational AI sales agent (Valdman persona)
- ✅ Tool calling framework (create orders, retrieve orders)
- ✅ Modular codebase ready for multi-tenant scaling
- ✅ Telegram integration

**Current Work:** Path A - Multi-Tenant Foundation (Week 1: Database Layer)
- 🔄 Setting up PostgreSQL + SQLAlchemy + Alembic
- 🔄 Creating database models (Tenant, Order, Customer, Conversation, Product)
- 🔄 Building repository layer for data access
- 🔄 Migrating from in-memory storage to database

**Next:** Multi-tenant routing → Tenant management → WhatsApp integration → Cloud deployment

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
│  • orders/           │        │  • In-memory (now)      │
│  • products/         │        │  • PostgreSQL (future)  │
│  • customers/        │        │  • Redis cache          │
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
    └── webhooks.py    # Webhook endpoint: POST /webhooks/telegram

agent/                  # AI orchestration
├── orchestrator.py    # Main agent loop (LLM calls, tool execution)
└── prompt_builder.py  # Dynamic prompt construction from tenant config

tools/                  # Agent capabilities (function calling)
├── __init__.py        # Tool registry and dispatcher
└── orders/
    ├── create_order.py         # Create structured orders
    └── get_customer_orders.py  # Retrieve customer orders

storage/                # State management
└── state.py           # In-memory storage (conversation, orders, counter)
                       # TODO: Replace with PostgreSQL + Redis

tenants/                # Multi-tenant configuration
└── loader.py          # Load tenant config (currently from files, will be DB)

config/                 # Business configurations
├── valdman.py         # Valdman meat/sausage business
└── joannas_bakery.py  # Joanna's Bakery business
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
- ✅ Claude 3 Haiku LLM integration
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
- 🔄 Database persistence (PostgreSQL)
- 🔄 Multi-tenant webhook routing
- 🔄 Conversation summarization (extended memory)
- 🔄 Customer profile tracking
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
- Telegram Bot (create via [@BotFather](https://t.me/botfather))
- Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repo-url>
cd AI-sales-agents-platform
pip install -r requirements.txt
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env and add:
# BOT_TOKEN=your_telegram_bot_token
# ANTHROPIC_API_KEY=your_anthropic_api_key
```

3. **Run the server:**
```bash
uvicorn api.main:app --reload
```

4. **Set up Telegram webhook (for production):**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_SERVER_URL>/webhooks/telegram"
```

---

## Testing

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

**Terminal 1: Start server**
```bash
cd /Users/bardvash/Projects/AI-sales-agents-platform
source venv/bin/activate
uvicorn api.main:app --reload
```

**Terminal 2: Expose with ngrok**
```bash
ngrok http 8000
# Copy the https URL (e.g., https://abc123.ngrok-free.app)
```

**Terminal 3: Set webhook**
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<NGROK_URL>/webhooks/telegram"
```

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
- [ ] Database persistence (PostgreSQL + Redis)
- [ ] Multi-tenant webhook routing
- [ ] Tenant management (CRUD, provisioning)

**Intelligence Layer**
- [ ] Conversation summarization (extended memory)
- [ ] Customer profile tracking
- [ ] Additional tools (search, cancel, update orders)

**Scale Layer**
- [ ] Multi-channel support (WhatsApp, SMS, Web)
- [ ] Admin dashboard
- [ ] Manager/customer role separation

**Production Layer**
- [ ] E-commerce integrations (Shopify, WooCommerce)
- [ ] Payment processing (Stripe, PayPal)
- [ ] Real-time inventory sync
- [ ] CRM integrations

---

## Next Steps - Choose Your Path

**Current State:** Single-tenant MVP with working tool framework and clean architecture.

### Path A: Multi-Tenant Foundation 🏗️ ⬅️ **CURRENT PRIORITY**
*Building production-ready multi-tenant capability*

**Status:** In Progress - Starting with database layer

#### Step 1: Database Layer (2-3 days) - IN PROGRESS
**Goal:** Replace in-memory storage with PostgreSQL

**Tasks:**
- [ ] Set up PostgreSQL locally (Docker)
- [ ] Install SQLAlchemy + Alembic
- [ ] Create database models:
  - `Tenant` - Business configurations (company_name, products, agent_role, etc.)
  - `Order` - Order records with items
  - `Customer` - Customer profiles
  - `Conversation` - Message history
  - `Product` - Product catalogs per tenant
- [ ] Create repository layer (data access)
- [ ] Migrate `storage/state.py` → database queries
- [ ] Database migrations with Alembic
- [ ] Test: Create order → restart server → order still exists

**Why first:** Can't run pilots without data persistence

---

#### Step 2: Multi-Tenant Routing (1-2 days)
**Goal:** Support multiple businesses simultaneously

**Tasks:**
- [ ] Change webhook route: `/webhooks/telegram` → `/webhooks/telegram/{tenant_id}`
- [ ] Extract tenant_id from URL
- [ ] Load tenant config from database (not hardcoded)
- [ ] Tenant isolation (each tenant sees only their data)
- [ ] Test with 2 tenants (Valdman + Joanna's Bakery)

**Why second:** Foundation for serving 10+ businesses

---

#### Step 3: Tenant Management (1 day)
**Goal:** Easy way to add/configure new businesses

**Tasks:**
- [ ] CLI script to add new tenant
- [ ] Configure products, agent persona, bot token
- [ ] Webhook registration automation
- [ ] Simple admin endpoint (list tenants, view orders)

**Why third:** Can onboard pilots without writing code

---

**Total Timeline:** ~1 week
**Outcome:** Platform ready for 10+ businesses, data persists, can onboard pilots

---

### Path B: Better Agent Intelligence 🧠
*Priority if improving conversation quality*

1. **Conversation Summarization** (2 days)
   - Compress long conversations → summaries
   - Extend memory beyond 5 messages
   - Better context retention

2. **Customer Profile Memory** (2 days)
   - Track preferences across sessions
   - Remember past orders
   - Personalized recommendations

3. **Additional Tools** (1-2 days each)
   - Add `search_products` (tested incrementally)
   - Add `cancel_order`
   - Add `update_order`

**Outcome:** Smarter, more helpful agents with better memory.

---

### Path C: Multi-Channel Expansion 📱
*Priority if reaching customers on their preferred platforms*

1. **Channel Abstraction** (2 days)
   - Create `channels/` directory
   - Abstract channel interface
   - Refactor Telegram to adapter pattern
   - Unified Message model

2. **WhatsApp Integration** (3 days)
   - WhatsApp Business API setup
   - Channel adapter implementation
   - Webhook: `/webhooks/whatsapp/{tenant_id}`
   - Test same agent on both channels

**Outcome:** Reach customers on Telegram, WhatsApp, and beyond.

---

## Recommended Next: Path A (Multi-Tenant)

**Why:**
- Unlocks business model (multiple paying customers)
- Architecture already prepared for it
- Other improvements can happen in parallel per tenant
- Foundation for scaling to hundreds of tenants

**Timeline:** ~1 week for basic multi-tenant capability

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
- **LLM:** Claude 3 Haiku via Anthropic SDK
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
