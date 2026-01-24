"""
Webhook endpoints for receiving messages from communication channels.
"""
import os
import requests
from fastapi import APIRouter, Request, HTTPException
from agent.orchestrator import process_message
from storage.database import get_db
from storage.repositories import TenantRepository

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/telegram/{tenant_id}")
async def telegram_webhook(request: Request, tenant_id: str):
    """
    Telegram webhook endpoint with multi-tenant support.
    Receives messages from Telegram and processes them through the agent.

    Args:
        tenant_id: Unique identifier for the tenant (e.g., "valdman", "joannas_bakery")
    """
    # Get database session
    db_gen = get_db()
    db = next(db_gen)

    try:
        # Load tenant to get bot token
        tenant_repo = TenantRepository(db)
        tenant = tenant_repo.get_by_id(tenant_id)

        if not tenant:
            raise HTTPException(status_code=404, detail=f"Tenant '{tenant_id}' not found")

        if not tenant.bot_token:
            raise HTTPException(status_code=500, detail=f"Tenant '{tenant_id}' has no bot token configured")

        payload = await request.json()

        message = payload.get("message", {})
        chat_id = message.get("chat", {}).get("id")
        text = message.get("text")

        if chat_id and text:
            # Process message through agent orchestrator
            # Convert chat_id to string for consistency with database
            result = await process_message(text, str(chat_id), tenant_id=tenant_id)
            send_telegram_message(chat_id, result.response_text, tenant.bot_token)

        return {"ok": True}

    finally:
        # Close database session
        try:
            next(db_gen)
        except StopIteration:
            pass


def send_telegram_message(chat_id: int, text: str, bot_token: str):
    """Send a message to Telegram user using tenant-specific bot token."""
    telegram_api = f"https://api.telegram.org/bot{bot_token}"
    requests.post(
        f"{telegram_api}/sendMessage",
        json={"chat_id": chat_id, "text": text}
    )
