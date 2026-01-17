"""
Webhook endpoints for receiving messages from communication channels.
"""
import os
import requests
from fastapi import APIRouter, Request
from agent.orchestrator import process_message
from storage.state import conversation_history, orders, order_counter

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

BOT_TOKEN = os.getenv("BOT_TOKEN")
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"


@router.post("/telegram")
async def telegram_webhook(request: Request):
    """
    Telegram webhook endpoint.
    Receives messages from Telegram and processes them through the agent.
    """
    payload = await request.json()

    message = payload.get("message", {})
    chat_id = message.get("chat", {}).get("id")
    text = message.get("text")

    if chat_id and text:
        # Process message through agent orchestrator
        reply = await process_message(text, chat_id)
        send_telegram_message(chat_id, reply)

    return {"ok": True}


def send_telegram_message(chat_id: int, text: str):
    """Send a message to Telegram user."""
    requests.post(
        f"{TELEGRAM_API}/sendMessage",
        json={"chat_id": chat_id, "text": text}
    )
