# Multi-Channel Expansion - Implementation Plan

This document details Step 5 of the platform roadmap: adding WhatsApp support via a channel abstraction layer.

---

## Overview

**Goal:** Support multiple messaging channels (Telegram, WhatsApp) through a unified abstraction, allowing tenants to reach customers on their preferred platform.

**Approach:**
- Channel abstraction layer that normalizes messages from any channel
- WhatsApp integration via Twilio (BSP model for frictionless tenant onboarding)
- Unified Message model with channel metadata
- Channel-agnostic orchestrator

**Provider Choice:** Twilio for WhatsApp
- Frictionless tenant onboarding (no Meta business verification required per tenant)
- Production-grade reliability
- Path to BSP status later when scale justifies it

---

## Architecture

### Current State
```
Telegram Webhook → webhooks.py → process_message() → send_telegram_message()
                     ↓
              Telegram-specific parsing
```

### Target State
```
┌─────────────────────────────────────────────────────────────────┐
│                     Incoming Webhooks                            │
│  /webhooks/telegram/{tenant_id}    /webhooks/whatsapp/{tenant_id}│
└──────────────────┬────────────────────────────┬─────────────────┘
                   │                            │
                   ▼                            ▼
         ┌─────────────────┐          ┌─────────────────┐
         │ TelegramAdapter │          │ WhatsAppAdapter │
         │   .parse()      │          │   .parse()      │
         │   .send()       │          │   .send()       │
         └────────┬────────┘          └────────┬────────┘
                  │                            │
                  └──────────┬─────────────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │ ChannelMessage    │
                   │ (unified model)   │
                   └─────────┬─────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │ process_message() │
                   │ (unchanged core)  │
                   └─────────┬─────────┘
                             │
                             ▼
                   ┌───────────────────┐
                   │ AgentResult       │
                   └─────────┬─────────┘
                             │
                             ▼
                   adapter.send(result)
```

---

## Data Model Changes

### New: Channel Configuration on Tenant

```python
# storage/models/tenant.py - additions

class Tenant(Base):
    # ... existing fields ...

    # Channel configurations (JSON fields for flexibility)
    telegram_config = Column(JSON, nullable=True)
    # Structure: {"bot_token": "...", "enabled": true}

    whatsapp_config = Column(JSON, nullable=True)
    # Structure: {"phone_number_id": "...", "enabled": true}
    # Note: Twilio credentials stored at platform level, not per-tenant
```

### New: Channel Field on Message

```python
# storage/models/conversation.py - additions

class Message(Base):
    # ... existing fields ...

    channel = Column(String, nullable=True, default="telegram")
    # Values: "telegram", "whatsapp", "web" (future)
```

---

## Implementation Milestones

### Milestone 1: Channel Abstraction Layer (Core) ✅ COMPLETE

**Goal:** Create the abstraction without changing any existing behavior

**Files created:**
```
channels/
├── __init__.py              # Channel registry with get_adapter(), register_adapter()
├── base.py                  # Abstract ChannelAdapter base class
├── models.py                # ChannelType, ChannelMessage, ChannelResponse
└── telegram.py              # TelegramAdapter implementation
```

**What was implemented:**
- `ChannelType` enum (TELEGRAM, WHATSAPP)
- `ChannelMessage` dataclass - unified incoming message format
- `ChannelResponse` dataclass - unified outgoing message format
- `ChannelAdapter` ABC with `parse_webhook()`, `send_message()`, `verify_webhook()`
- `TelegramAdapter` - full implementation for Telegram Bot API
- `webhooks.py` refactored to use `_handle_channel_webhook()` with adapter pattern
- Channel registry with `get_adapter()` and `register_adapter()` functions

**Acceptance Criteria:** ✅ All met
- ✅ Existing Telegram flow works exactly as before
- ✅ `webhooks.py` uses `TelegramAdapter` instead of inline code
- ✅ No changes to orchestrator or database

---

### Milestone 2: Database Migration ✅ COMPLETE

**Goal:** Add channel support to data model

**Migration:** `alembic/versions/20260203_0659_a4b0c2a94826_add_channel_support.py`

**What was implemented:**
1. Added `channel` column to `messages` table (default: "telegram")
2. Added `telegram_config` JSON column to `tenants` table
3. Added `whatsapp_config` JSON column to `tenants` table
4. Migrated existing `bot_token` values to `telegram_config.bot_token` with `enabled: true`
5. Updated `Message` model with `channel` field
6. Updated `Tenant` model with `telegram_config` and `whatsapp_config` JSON fields
7. Updated `ConversationRepository.add_message()` to accept `channel` parameter
8. Updated `process_message()` in orchestrator to accept and pass `channel`
9. Updated `webhooks.py` to pass channel to orchestrator and read from new JSON configs

**Acceptance Criteria:** ✅ All met
- ✅ `alembic upgrade head` runs successfully
- ✅ Existing data preserved
- ✅ New columns exist (`channel`, `telegram_config`, `whatsapp_config`)
- ✅ `bot_token` migrated to `telegram_config`
- ✅ New messages saved with correct `channel` value
- ✅ Agent CLI works with channel tracking

---

### Milestone 3: WhatsApp Adapter (Twilio)

**Goal:** Implement WhatsApp channel via Twilio

**Files to create:**
```
channels/
└── whatsapp.py              # WhatsApp/Twilio adapter
```

**Environment variables:**
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

**channels/whatsapp.py:**
```python
import os
import hmac
import hashlib
from twilio.rest import Client
from .base import ChannelAdapter
from .models import ChannelMessage, ChannelResponse, ChannelType

class WhatsAppAdapter(ChannelAdapter):
    """WhatsApp adapter via Twilio."""

    def __init__(self):
        self.client = Client(
            os.getenv("TWILIO_ACCOUNT_SID"),
            os.getenv("TWILIO_AUTH_TOKEN")
        )

    def parse_webhook(self, payload: dict, tenant_id: str) -> ChannelMessage | None:
        # Twilio webhook format
        from_number = payload.get("From", "").replace("whatsapp:", "")
        body = payload.get("Body", "")
        profile_name = payload.get("ProfileName")

        if not from_number or not body:
            return None

        return ChannelMessage(
            channel=ChannelType.WHATSAPP,
            sender_id=from_number,
            text=body,
            tenant_id=tenant_id,
            sender_name=profile_name,
            raw_payload=payload
        )

    async def send_message(self, sender_id: str, response: ChannelResponse, tenant_config: dict) -> bool:
        phone_number_id = tenant_config.get("phone_number_id")
        if not phone_number_id:
            return False

        message = self.client.messages.create(
            body=response.text,
            from_=f"whatsapp:{phone_number_id}",
            to=f"whatsapp:{sender_id}"
        )
        return message.sid is not None

    def verify_webhook(self, request) -> bool:
        # Twilio signature verification
        # Implementation depends on framework (FastAPI in our case)
        return True  # TODO: Implement proper verification
```

**Acceptance Criteria:**
- WhatsApp messages parse correctly
- Responses send via Twilio API
- Twilio sandbox works for testing

---

### Milestone 4: Unified Webhook Router

**Goal:** Single entry point that routes to correct adapter

**Files to modify:**
```
api/routes/webhooks.py       # Refactor to use adapters
channels/__init__.py         # Channel registry
```

**New webhook structure:**
```python
# api/routes/webhooks.py

from channels import get_adapter, ChannelType
from channels.models import ChannelResponse

@router.post("/telegram/{tenant_id}")
async def telegram_webhook(request: Request, tenant_id: str):
    return await handle_channel_webhook(request, tenant_id, ChannelType.TELEGRAM)

@router.post("/whatsapp/{tenant_id}")
async def whatsapp_webhook(request: Request, tenant_id: str):
    return await handle_channel_webhook(request, tenant_id, ChannelType.WHATSAPP)

async def handle_channel_webhook(request: Request, tenant_id: str, channel: ChannelType):
    """Unified webhook handler for all channels."""
    adapter = get_adapter(channel)

    # Parse payload
    payload = await request.json() if channel == ChannelType.TELEGRAM else dict(await request.form())
    message = adapter.parse_webhook(payload, tenant_id)

    if not message:
        return {"ok": True}  # Ignore non-message webhooks

    # Load tenant and get channel config
    tenant = load_tenant(tenant_id)
    channel_config = get_channel_config(tenant, channel)

    # Process through agent (unchanged)
    result = await process_message(message.text, message.sender_id, tenant_id)

    # Send response back through same channel
    response = ChannelResponse(text=result.response_text)
    await adapter.send_message(message.sender_id, response, channel_config)

    return {"ok": True}
```

**Acceptance Criteria:**
- Telegram works as before via new router
- WhatsApp webhook receives and processes messages
- Same tenant can have both channels enabled

---

### Milestone 5: Twilio Phone Number Provisioning

**Goal:** Allow tenants to get a WhatsApp number through the admin UI

**This milestone is about the Twilio setup, not UI (UI is future work)**

**Tasks:**
1. Create Twilio subaccount per tenant (isolation)
2. Purchase/provision WhatsApp-enabled number
3. Configure webhook URL for the number
4. Store phone_number_id in tenant's whatsapp_config

**Script: `scripts/provision_whatsapp.py`**
```python
"""
Provision a WhatsApp number for a tenant via Twilio.
Usage: python scripts/provision_whatsapp.py <tenant_id>
"""
# Implementation details...
```

**Acceptance Criteria:**
- Script provisions a new WhatsApp number for a tenant
- Number is configured to send webhooks to our endpoint
- Tenant can receive WhatsApp messages

---

### Milestone 6: Admin UI - Channel Configuration

**Goal:** Let tenant admin enable/configure channels

**Files to create/modify:**
```
admin-ui/src/app/[tenant]/settings/
└── page.tsx                 # Settings page with channel config

admin-ui/src/components/
├── ChannelConfig.tsx        # Channel configuration component
└── WhatsAppSetup.tsx        # WhatsApp-specific setup flow
```

**UI Flow:**
```
Settings Page
┌─────────────────────────────────────────────────────────────┐
│  Channels                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Telegram                                    [✓ Enabled]     │
│  Bot: @valdman_bot                                          │
│  [Change Bot Token]                                          │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  WhatsApp                                    [ Enable ]      │
│  Get a WhatsApp number for your business                    │
│  Customers can message you at this number                   │
│                                                              │
│  [Set Up WhatsApp →]                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

WhatsApp Setup Flow (after clicking "Set Up WhatsApp"):
┌─────────────────────────────────────────────────────────────┐
│  Set Up WhatsApp                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Choose your WhatsApp number                        │
│                                                              │
│  We'll provision a WhatsApp Business number for you.        │
│  Your customers will message this number to reach your      │
│  AI sales agent.                                            │
│                                                              │
│  Country: [Israel ▼]                                        │
│                                                              │
│  [Get Number]                                               │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Step 2: Done!                                              │
│                                                              │
│  Your WhatsApp number: +972-50-XXX-XXXX                     │
│  Share this with your customers.                            │
│                                                              │
│  [Copy Number]  [Generate QR Code]                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- Tenant can see current channel status
- Tenant can set up WhatsApp with one click
- Number is displayed after provisioning
- QR code generated for easy sharing

---

### Milestone 7: Message Channel Tracking

**Goal:** Track which channel each message came from

**Changes:**
1. Pass channel type through `process_message()`
2. Store channel on each Message record
3. Display channel indicator in Admin UI conversation view

**orchestrator.py changes:**
```python
async def process_message(
    user_message: str,
    chat_id: str,
    tenant_id: str = "valdman",
    channel: str = "telegram"  # NEW parameter
) -> AgentResult:
    # ...
    conv_repo.add_message(conversation.id, "user", user_message, channel=channel)
    # ...
```

**Admin UI changes:**
- Show channel icon (Telegram/WhatsApp) next to each message
- Filter conversations by channel

**Acceptance Criteria:**
- Messages have correct channel recorded
- Admin can see which channel a conversation is on
- Can filter by channel in Admin UI

---

## Deferred Items (Future Work)

These are noted for future implementation but NOT part of this plan:

### Media Support
- Receive images from customers (product photos, receipts)
- Send images back (product catalog images)
- Store media URLs in message metadata

### Rich Messages
- WhatsApp buttons and quick replies
- Telegram inline keyboards
- Template messages for WhatsApp (required for business-initiated conversations)

### Channel-Specific Features
- WhatsApp message templates (for outbound)
- Telegram bot commands (/start, /help)
- Read receipts
- Typing indicators

### BSP Migration
- Apply for Meta BSP status
- Migrate from Twilio to direct Meta API
- Embedded Signup for faster tenant onboarding

---

## Testing Strategy

### Twilio Sandbox Testing (Milestone 3)
1. Set up Twilio WhatsApp Sandbox
2. Connect personal WhatsApp to sandbox
3. Test message flow end-to-end

### Multi-Channel E2E Test (Milestone 4+)
```bash
# Terminal 1: Send via Telegram
./venv/bin/python3 scripts/agent_cli.py --chat-id multi-001 --tenant valdman -m "היי"

# Terminal 2: Send via WhatsApp (when implemented)
./venv/bin/python3 scripts/agent_cli.py --chat-id multi-001 --tenant valdman --channel whatsapp -m "מה יש לכם?"

# Verify: Same customer, same conversation, different channels logged
```

### Admin UI Verification
1. Create conversations via both channels
2. View in Admin Dashboard
3. Verify channel indicators display correctly
4. Test channel filter

---

## Summary

| # | Milestone | Description | Dependencies | Status |
|---|-----------|-------------|--------------|--------|
| 1 | Channel Abstraction | Base classes + Telegram adapter | None | ✅ COMPLETE |
| 2 | Database Migration | Add channel columns + UI indicator | M1 | ✅ COMPLETE |
| 3 | WhatsApp Adapter | Twilio integration | M1 | Pending |
| 4 | Unified Router | Single webhook handler | M1, M2, M3 | Pending |
| 5 | Number Provisioning | Script to provision numbers | M3 | Pending |
| 6 | Admin UI Channels | Settings page for channels | M4, M5 | Pending |
| 7 | Message Tracking | Channel filtering in Admin UI | M4 | Pending |

**Parallel work possible:**
- M2 + M3 can run in parallel after M1
- M5 can start after M3
- M6 + M7 can run in parallel after M4

---

## Environment Variables (New)

```bash
# .env additions
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

---

## References

- [Twilio WhatsApp API Docs](https://www.twilio.com/docs/whatsapp/api)
- [Twilio Webhook Security](https://www.twilio.com/docs/usage/webhooks/webhooks-security)
- [WhatsApp Business Platform Pricing](https://developers.facebook.com/docs/whatsapp/pricing)
