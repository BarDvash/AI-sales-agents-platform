"""
Tenant Repository - manages tenant data access.
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from storage.models.tenant import Tenant


class TenantRepository:
    """Repository for Tenant operations."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, tenant_id: str) -> Optional[Tenant]:
        """Get tenant by ID."""
        return self.db.query(Tenant).filter(Tenant.id == tenant_id).first()

    def get_by_bot_token(self, bot_token: str) -> Optional[Tenant]:
        """Get tenant by bot token (for multi-tenant routing)."""
        return self.db.query(Tenant).filter(Tenant.bot_token == bot_token).first()

    def create(
        self,
        tenant_id: str,
        company_name: str,
        company_type: str,
        business_description: str,
        agent_role: str,
        agent_instructions: str,
        bot_token: Optional[str] = None,
        currency: str = "NIS",
    ) -> Tenant:
        """Create new tenant."""
        tenant = Tenant(
            id=tenant_id,
            company_name=company_name,
            company_type=company_type,
            business_description=business_description,
            agent_role=agent_role,
            agent_instructions=agent_instructions,
            bot_token=bot_token,
            currency=currency,
        )
        self.db.add(tenant)
        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    def list_all(self) -> List[Tenant]:
        """Get all tenants."""
        return self.db.query(Tenant).all()

    def update(self, tenant: Tenant) -> Tenant:
        """Update existing tenant."""
        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    def delete(self, tenant_id: str) -> bool:
        """Delete tenant and all related data (cascade)."""
        tenant = self.get_by_id(tenant_id)
        if tenant:
            self.db.delete(tenant)
            self.db.commit()
            return True
        return False
