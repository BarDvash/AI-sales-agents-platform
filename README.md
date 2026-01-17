# AI Sales Agents Platform

A multi-tenant SaaS platform for AI-powered sales agents using Claude's function calling capabilities.

## Vision

**What we're building:** A platform that allows any business to deploy AI-powered sales agents that handle customer conversations, take orders, and manage sales workflows across multiple communication channels.

**Target customers:** Small to medium businesses (butchers, bakeries, restaurants, service providers) who want 24/7 automated sales capability.

**Business model:** Monthly subscription per tenant + usage-based pricing for message volume.

---

## Current Status

**Phase:** Early MVP - Single tenant, working tool framework, refactored to scalable architecture.

**What works:**
- ✅ Conversational AI sales agent (Valdman persona)
- ✅ Tool calling framework (create orders, retrieve orders)
- ✅ Modular codebase ready for multi-tenant scaling
- ✅ Telegram integration

**What's next:** Choose path - Multi-tenant foundation, Better intelligence, or Multi-channel.

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

### Path A: Multi-Tenant Foundation 🏗️
*Priority if goal is to onboard multiple businesses*

1. **Database Layer** (1-2 days)
   - PostgreSQL setup with SQLAlchemy
   - Models: Tenant, Conversation, Order, Customer, Product
   - Repositories for data access
   - Migrate from in-memory to DB

2. **Dynamic Tenant Loading** (1 day)
   - Store Valdman + Joanna's configs in DB
   - Update `tenants/loader.py` to query DB
   - Redis caching layer

3. **Multi-Tenant Routing** (1 day)
   - Change webhook to `/webhooks/{channel}/{tenant_id}`
   - Each tenant gets unique bot token
   - Test with 2 real tenants

**Outcome:** Platform can serve 10+ businesses independently.

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

- **Backend:** FastAPI (async Python web framework)
- **LLM:** Claude 3 Haiku via Anthropic SDK
- **Messaging:** Telegram Bot API (WhatsApp planned)
- **Storage:** In-memory (PostgreSQL + Redis planned)
- **Config:** python-dotenv
- **Tools:** Claude function calling (tool use API)

---

## License

[Add license]

---

## Contact

[Add contact info]
