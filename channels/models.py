"""
Unified message models for all communication channels.
"""
from dataclasses import dataclass
from typing import Optional
from enum import Enum


class ChannelType(str, Enum):
    """Supported communication channels."""
    TELEGRAM = "telegram"
    WHATSAPP = "whatsapp"


@dataclass
class ChannelMessage:
    """
    Unified incoming message format across all channels.

    Each channel adapter converts its native format to this structure,
    allowing the orchestrator to process messages channel-agnostically.
    """
    channel: ChannelType
    sender_id: str           # Unique ID within channel (chat_id, phone number)
    text: str                # Message content
    tenant_id: str           # Resolved from webhook URL

    # Optional metadata
    sender_name: Optional[str] = None
    media_url: Optional[str] = None      # Future: images, documents
    media_type: Optional[str] = None     # Future: "image", "document", "audio"
    raw_payload: Optional[dict] = None   # Original webhook payload for debugging


@dataclass
class ChannelResponse:
    """
    Response to send back through a channel.

    The adapter converts this to the channel's native format.
    """
    text: str
    # Future: buttons, quick_replies, media
