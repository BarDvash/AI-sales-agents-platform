"""
Webhook endpoints for receiving messages from communication channels.
"""
from typing import Optional
from fastapi import APIRouter, Request, HTTPException
from agent.orchestrator import process_message
from channels import get_adapter, ChannelType, ChannelResponse
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
    return await _handle_channel_webhook(
        request=request,
        tenant_id=tenant_id,
        channel=ChannelType.TELEGRAM
    )


async def _handle_channel_webhook(
    request: Request,
    tenant_id: str,
    channel: ChannelType
) -> dict:
    """
    Unified webhook handler for all channels.

    Args:
        request: FastAPI request object
        tenant_id: Tenant identifier from URL
        channel: The channel type

    Returns:
        {"ok": True} on success
    """
    # Get database session
    db_gen = get_db()
    db = next(db_gen)

    try:
        # Load tenant
        tenant_repo = TenantRepository(db)
        tenant = tenant_repo.get_by_id(tenant_id)

        if not tenant:
            raise HTTPException(status_code=404, detail=f"Tenant '{tenant_id}' not found")

        # Get channel adapter
        adapter = get_adapter(channel)

        # Parse payload based on channel
        payload = await request.json()

        # Parse into unified message format
        message = adapter.parse_webhook(payload, tenant_id)

        # Ignore non-message webhooks (e.g., edited messages, reactions)
        if not message:
            return {"ok": True}

        # Get channel-specific config from tenant
        channel_config = _get_channel_config(tenant, channel)
        if not channel_config:
            raise HTTPException(
                status_code=500,
                detail=f"Tenant '{tenant_id}' has no {channel.value} configuration"
            )

        # Process message through agent orchestrator
        result = await process_message(
            message.text,
            message.sender_id,
            tenant_id=tenant_id
        )

        # Send response back through the same channel
        response = ChannelResponse(text=result.response_text)
        await adapter.send_message(message.sender_id, response, channel_config)

        return {"ok": True}

    finally:
        # Close database session
        try:
            next(db_gen)
        except StopIteration:
            pass


def _get_channel_config(tenant, channel: ChannelType) -> Optional[dict]:
    """
    Extract channel-specific configuration from tenant.

    Args:
        tenant: Tenant database model
        channel: The channel type

    Returns:
        Channel configuration dict, or None if not configured
    """
    if channel == ChannelType.TELEGRAM:
        if tenant.bot_token:
            return {"bot_token": tenant.bot_token}
        return None

    elif channel == ChannelType.WHATSAPP:
        # Future: return tenant.whatsapp_config
        return None

    return None
