# AI Sales Agents Platform

A Telegram bot platform for AI-powered sales agents.

## Current Status

Basic Telegram webhook handler built with FastAPI. Currently implements a simple echo bot as foundation for AI sales agent functionality.

## Features

- Telegram Bot webhook integration
- FastAPI-based web server
- Environment-based configuration

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your Telegram bot token
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

- **FastAPI**: Web framework for webhook endpoint
- **Telegram Bot API**: Message handling and responses
- **python-dotenv**: Environment configuration

## Next Steps

- [ ] Integrate AI capabilities (OpenAI/Anthropic)
- [ ] Add sales-specific conversation flows
- [ ] Implement customer data management
- [ ] Add conversation state tracking
- [ ] Multi-agent orchestration
