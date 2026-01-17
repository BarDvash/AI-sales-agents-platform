"""
Tenant configuration loader.
Currently loads from config files, will load from database in future.
"""
from config import valdman


def load_tenant_config(tenant_id: str = "valdman"):
    """
    Load tenant configuration.

    Args:
        tenant_id: Identifier for the tenant (currently hardcoded to valdman)

    Returns:
        Tenant configuration module with COMPANY_NAME, PRODUCTS, etc.

    TODO: In Milestone 7, this will:
    - Accept tenant_id from webhook URL
    - Query database for tenant config
    - Cache tenant config in Redis
    - Return dynamic configuration
    """
    # Currently hardcoded - will be replaced with DB lookup
    if tenant_id == "valdman":
        return valdman
    else:
        # Default to valdman for now
        return valdman
