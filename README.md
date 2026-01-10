# AI Sales Agents Platform

A Telegram bot platform for AI-powered sales agents using Claude (Anthropic).

## Current Status

**Milestone 0.2 Complete** - Working AI bot with LLM integration. The bot responds intelligently to messages using Claude 3 Haiku with zero system prompt (raw LLM behavior).

## Features

- ✅ Telegram Bot webhook integration
- ✅ FastAPI-based async web server
- ✅ Claude 3 Haiku LLM integration
- ✅ Async message handling
- ✅ Environment-based configuration
- ✅ Basic error handling
- ✅ Multilingual support (auto-detects language)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add:
# - Your Telegram bot token (BOT_TOKEN)
# - Your Anthropic API key (ANTHROPIC_API_KEY)
```

3. Run the server:
```bash
uvicorn main:app --reload
```

4. Set up Telegram webhook:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_SERVER_URL>/webhook"
```

## Architecture

- **FastAPI**: Async web framework for webhook endpoint
- **Telegram Bot API**: Message handling and responses
- **Anthropic SDK**: Claude 3 Haiku for AI responses
- **python-dotenv**: Environment configuration

## Development Roadmap

Following the atomic milestone approach:

### ✅ Milestone 0 - Skeleton
- [x] Step 0.1: Echo bot (message relay)
- [x] Step 0.2: LLM integration (raw responses)

### 🚧 Milestone 1 - One Talking Agent
- [ ] Step 1.1: Add system prompt (sales persona)
- [ ] Step 1.2: Basic conversation continuity
- [ ] Step 1.3: Proper message role structure

### 📋 Milestone 2 - Sales Realism
- [ ] Step 2.1: Hardcode product catalog
- [ ] Step 2.2: Take fake orders
- [ ] Step 2.3: Explicit confirmation flow

### 📋 Milestone 3 - Memory
- [ ] Step 3.1: Conversation summarization
- [ ] Step 3.2: Client profile memory
- [ ] Step 3.3: Automatic memory extraction

### 📋 Milestone 4 - Actions & Tools
- [ ] Step 4.1: Tool calling framework
- [ ] Step 4.2: Tool constraints and validation

### 📋 Milestone 5 - Manager Control
- [ ] Step 5.1: Manager vs customer separation
- [ ] Step 5.2: Task assignment system

### 📋 Milestone 6 - WhatsApp
- [ ] Step 6.1: WhatsApp integration

### 📋 Milestone 7 - Multi-Agent System
- [ ] Agent templates
- [ ] Multi-tenant architecture
- [ ] Admin UI

## Next Immediate Steps

**Step 1.1** - Add system prompt to give the bot a sales agent identity and personality.
