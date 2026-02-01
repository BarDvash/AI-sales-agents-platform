"""
Abstract base class for channel adapters.
"""
from abc import ABC, abstractmethod
from typing import Optional
from .models import ChannelMessage, ChannelResponse


class ChannelAdapter(ABC):
    """
    Base class for all channel adapters.

    Each channel (Telegram, WhatsApp, etc.) implements this interface
    to normalize incoming messages and send responses.
    """

    @abstractmethod
    def parse_webhook(self, payload: dict, tenant_id: str) -> Optional[ChannelMessage]:
        """
        Parse incoming webhook payload into unified ChannelMessage.

        Args:
            payload: Raw webhook payload from the channel
            tenant_id: Tenant identifier from the webhook URL

        Returns:
            ChannelMessage if the payload contains a valid message, None otherwise
            (e.g., for webhook verification requests or non-message events)
        """
        pass

    @abstractmethod
    async def send_message(
        self,
        sender_id: str,
        response: ChannelResponse,
        channel_config: dict
    ) -> bool:
        """
        Send response back to user through this channel.

        Args:
            sender_id: Recipient identifier (chat_id, phone number, etc.)
            response: The response to send
            channel_config: Channel-specific configuration (bot token, API keys, etc.)

        Returns:
            True if message was sent successfully, False otherwise
        """
        pass

    @abstractmethod
    def verify_webhook(self, payload: dict, headers: dict, channel_config: dict) -> bool:
        """
        Verify webhook authenticity (signature/token validation).

        Args:
            payload: Raw webhook payload
            headers: HTTP headers from the request
            channel_config: Channel-specific configuration for verification

        Returns:
            True if webhook is authentic, False otherwise
        """
        pass
