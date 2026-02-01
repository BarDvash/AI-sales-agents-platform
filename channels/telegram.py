"""
Telegram Bot API adapter.
"""
from typing import Optional
import requests
from .base import ChannelAdapter
from .models import ChannelMessage, ChannelResponse, ChannelType


class TelegramAdapter(ChannelAdapter):
    """
    Adapter for Telegram Bot API.

    Handles parsing incoming Telegram webhooks and sending messages
    through the Telegram Bot API.
    """

    def parse_webhook(self, payload: dict, tenant_id: str) -> Optional[ChannelMessage]:
        """
        Parse Telegram webhook payload into ChannelMessage.

        Telegram webhook format:
        {
            "update_id": 123456789,
            "message": {
                "message_id": 1,
                "from": {"id": 123, "first_name": "John", ...},
                "chat": {"id": 123, "type": "private", ...},
                "date": 1234567890,
                "text": "Hello"
            }
        }
        """
        message = payload.get("message", {})
        chat_id = message.get("chat", {}).get("id")
        text = message.get("text")

        # Ignore non-text messages or missing data
        if not chat_id or not text:
            return None

        # Extract sender name if available
        from_user = message.get("from", {})
        sender_name = from_user.get("first_name")
        if from_user.get("last_name"):
            sender_name = f"{sender_name} {from_user.get('last_name')}"

        return ChannelMessage(
            channel=ChannelType.TELEGRAM,
            sender_id=str(chat_id),
            text=text,
            tenant_id=tenant_id,
            sender_name=sender_name,
            raw_payload=payload
        )

    async def send_message(
        self,
        sender_id: str,
        response: ChannelResponse,
        channel_config: dict
    ) -> bool:
        """
        Send message via Telegram Bot API.

        Args:
            sender_id: Telegram chat_id
            response: Response to send
            channel_config: Must contain 'bot_token'
        """
        bot_token = channel_config.get("bot_token")
        if not bot_token:
            return False

        telegram_api = f"https://api.telegram.org/bot{bot_token}"
        result = requests.post(
            f"{telegram_api}/sendMessage",
            json={"chat_id": sender_id, "text": response.text}
        )
        return result.ok

    def verify_webhook(self, payload: dict, headers: dict, channel_config: dict) -> bool:
        """
        Verify Telegram webhook.

        Telegram uses a secret token in the webhook URL for verification,
        which is already handled by our routing (tenant-specific URLs).
        Additional verification can be added here if needed.
        """
        # Telegram webhook verification is handled by the secret URL path
        # In production, you could also verify the X-Telegram-Bot-Api-Secret-Token header
        return True
