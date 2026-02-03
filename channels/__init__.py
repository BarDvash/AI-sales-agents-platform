"""
Channel abstraction layer.

Provides a unified interface for handling messages across different
communication channels (Telegram, WhatsApp, etc.).
"""
from typing import Dict
from .models import ChannelType, ChannelMessage, ChannelResponse
from .base import ChannelAdapter
from .telegram import TelegramAdapter
from .whatsapp import WhatsAppAdapter

# Channel adapter registry
_ADAPTERS: Dict[ChannelType, ChannelAdapter] = {
    ChannelType.TELEGRAM: TelegramAdapter(),
    ChannelType.WHATSAPP: WhatsAppAdapter(),
}


def get_adapter(channel: ChannelType) -> ChannelAdapter:
    """
    Get the adapter for a specific channel.

    Args:
        channel: The channel type

    Returns:
        The channel adapter instance

    Raises:
        ValueError: If the channel is not supported
    """
    adapter = _ADAPTERS.get(channel)
    if not adapter:
        raise ValueError(f"Unsupported channel: {channel}")
    return adapter


def register_adapter(channel: ChannelType, adapter: ChannelAdapter) -> None:
    """
    Register a new channel adapter.

    Args:
        channel: The channel type
        adapter: The adapter instance
    """
    _ADAPTERS[channel] = adapter


__all__ = [
    "ChannelType",
    "ChannelMessage",
    "ChannelResponse",
    "ChannelAdapter",
    "TelegramAdapter",
    "WhatsAppAdapter",
    "get_adapter",
    "register_adapter",
]
