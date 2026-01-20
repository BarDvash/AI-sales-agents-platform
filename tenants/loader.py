"""
Tenant configuration loader.
Loads tenant configuration from database.
"""
from sqlalchemy.orm import Session
from storage.repositories import TenantRepository, ProductRepository


class TenantConfig:
    """Dynamic tenant configuration loaded from database."""

    def __init__(self, tenant_id: str, db: Session):
        tenant_repo = TenantRepository(db)
        product_repo = ProductRepository(db)

        # Load tenant from database
        tenant = tenant_repo.get_by_id(tenant_id)
        if not tenant:
            raise ValueError(f"Tenant '{tenant_id}' not found in database")

        # Load products
        products = product_repo.get_by_tenant(tenant_id, available_only=True)

        # Set attributes (matches old valdman.py structure)
        self.COMPANY_NAME = tenant.company_name
        self.COMPANY_TYPE = tenant.company_type
        self.BUSINESS_DESCRIPTION = tenant.business_description
        self.AGENT_ROLE = tenant.agent_role
        self.AGENT_INSTRUCTIONS = tenant.agent_instructions

        # Convert products to format expected by agent
        self.PRODUCTS = [
            {
                "name": p.name,
                "category": p.category,
                "price": p.price,
                "unit": p.unit,
                "description": p.description,
            }
            for p in products
        ]


def load_tenant_config(tenant_id: str = "valdman", db: Session = None) -> TenantConfig:
    """
    Load tenant configuration from database.

    Args:
        tenant_id: Identifier for the tenant (e.g., "valdman")
        db: Database session

    Returns:
        TenantConfig object with tenant data

    Raises:
        ValueError: If tenant not found in database
    """
    if db is None:
        raise ValueError("Database session is required")

    return TenantConfig(tenant_id, db)
