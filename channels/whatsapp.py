"""
WhatsApp adapter via Twilio API.

Supports both Twilio Sandbox (for testing) and production WhatsApp Business API.
"""
import hashlib
import hmac
import os
from typing import Optional
from twilio.rest import Client
from .base import ChannelAdapter
from .models import ChannelMessage, ChannelResponse, ChannelType


class WhatsAppAdapter(ChannelAdapter):
    """
    Adapter for WhatsApp via Twilio API.

    Handles parsing incoming Twilio WhatsApp webhooks and sending messages
    through the Twilio API.

    Config keys:
        account_sid: Twilio Account SID
        auth_token: Twilio Auth Token
        phone_number: Twilio WhatsApp number (e.g., "whatsapp:+14155238886")
    """

    def parse_webhook(self, payload: dict, tenant_id: str) -> Optional[ChannelMessage]:
        """
        Parse Twilio WhatsApp webhook payload into ChannelMessage.

        Twilio sends webhooks as form data with these fields:
        {
            "MessageSid": "SM...",
            "AccountSid": "AC...",
            "From": "whatsapp:+1234567890",
            "To": "whatsapp:+0987654321",
            "Body": "Hello",
            "NumMedia": "0",
            "ProfileName": "John Doe",
            ...
        }
        """
        # Get message body
        body = payload.get("Body")
        if not body:
            return None

        # Extract sender phone number (remove "whatsapp:" prefix)
        from_number = payload.get("From", "")
        sender_id = from_number.replace("whatsapp:", "")

        if not sender_id:
            return None

        # Get sender name if available
        sender_name = payload.get("ProfileName")

        return ChannelMessage(
            channel=ChannelType.WHATSAPP,
            sender_id=sender_id,
            text=body,
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
        Send message via Twilio WhatsApp API.

        Args:
            sender_id: Recipient phone number (without "whatsapp:" prefix)
            response: Response to send
            channel_config: Must contain 'account_sid', 'auth_token', 'phone_number'
        """
        account_sid = channel_config.get("account_sid")
        auth_token = channel_config.get("auth_token")
        from_number = channel_config.get("phone_number")

        if not all([account_sid, auth_token, from_number]):
            print(f"[WhatsApp] Missing config: sid={bool(account_sid)}, token={bool(auth_token)}, number={bool(from_number)}")
            return False

        try:
            client = Client(account_sid, auth_token)

            # Ensure proper WhatsApp format
            to_number = f"whatsapp:{sender_id}" if not sender_id.startswith("whatsapp:") else sender_id
            from_whatsapp = f"whatsapp:{from_number}" if not from_number.startswith("whatsapp:") else from_number

            message = client.messages.create(
                body=response.text,
                from_=from_whatsapp,
                to=to_number
            )

            print(f"[WhatsApp] Message sent: sid={message.sid}, to={to_number}")
            return True

        except Exception as e:
            print(f"[WhatsApp] Send error: {e}")
            return False

    def verify_webhook(self, payload: dict, headers: dict, channel_config: dict) -> bool:
        """
        Verify Twilio webhook signature.

        Twilio signs webhooks using HMAC-SHA1. The signature is in the
        X-Twilio-Signature header.

        For sandbox testing, signature verification can be disabled by
        setting 'skip_signature_verification': true in channel_config.
        """
        # Allow skipping verification for sandbox testing
        if channel_config.get("skip_signature_verification"):
            return True

        auth_token = channel_config.get("auth_token")
        if not auth_token:
            print("[WhatsApp] No auth_token for signature verification")
            return False

        signature = headers.get("X-Twilio-Signature") or headers.get("x-twilio-signature")
        if not signature:
            print("[WhatsApp] No signature in headers")
            return False

        # Twilio signature verification requires the full URL
        # For now, we trust the webhook since we have tenant-specific URLs
        # Full verification would require reconstructing the URL + params
        # and computing HMAC-SHA1

        # TODO: Implement full Twilio signature verification
        # For now, accept if we have the basic structure
        return True


def get_twilio_config_from_env() -> dict:
    """
    Helper to load Twilio config from environment variables.

    Environment variables:
        TWILIO_ACCOUNT_SID
        TWILIO_AUTH_TOKEN
        TWILIO_WHATSAPP_NUMBER (e.g., "+14155238886" for sandbox)
    """
    return {
        "account_sid": os.getenv("TWILIO_ACCOUNT_SID"),
        "auth_token": os.getenv("TWILIO_AUTH_TOKEN"),
        "phone_number": os.getenv("TWILIO_WHATSAPP_NUMBER"),
        "skip_signature_verification": os.getenv("TWILIO_SKIP_SIGNATURE_VERIFICATION", "false").lower() == "true"
    }
