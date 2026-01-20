"""
Database seeding script.
Seeds the database with tenant configurations and product catalogs.

Run this once after running migrations:
    python scripts/seed_database.py             # Seeds all tenants
    python scripts/seed_database.py valdman    # Seeds only Valdman
    python scripts/seed_database.py joannas_bakery  # Seeds only Joanna's Bakery
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from storage.database import SessionLocal
from storage.repositories import TenantRepository, ProductRepository
from config import valdman, joannas_bakery

# Load environment variables
load_dotenv()

# Tenant configurations
TENANT_CONFIGS = {
    "valdman": {
        "config": valdman,
        "bot_token_env": "VALDMAN_BOT_TOKEN",  # Will use VALDMAN_BOT_TOKEN from .env
    },
    "joannas_bakery": {
        "config": joannas_bakery,
        "bot_token_env": "JOANNAS_BOT_TOKEN",  # Will use JOANNAS_BOT_TOKEN from .env
    }
}


def seed_tenant(db, tenant_id: str, tenant_data: dict):
    """Seed a single tenant with products."""
    config = tenant_data["config"]
    bot_token_env = tenant_data["bot_token_env"]

    tenant_repo = TenantRepository(db)
    product_repo = ProductRepository(db)

    print(f"\n{'='*60}")
    print(f"Seeding tenant: {tenant_id}")
    print(f"{'='*60}")

    # Check if tenant already exists
    existing_tenant = tenant_repo.get_by_id(tenant_id)
    if existing_tenant:
        print(f"✓ {config.COMPANY_NAME} tenant already exists. Skipping tenant creation.")
    else:
        # Create tenant
        print(f"Creating {config.COMPANY_NAME} tenant...")
        bot_token = os.getenv(bot_token_env)
        if not bot_token:
            print(f"⚠️  Warning: {bot_token_env} not found in .env file. Creating tenant without bot token.")

        tenant = tenant_repo.create(
            tenant_id=tenant_id,
            company_name=config.COMPANY_NAME,
            company_type=config.COMPANY_TYPE,
            business_description=config.BUSINESS_DESCRIPTION,
            agent_role=config.AGENT_ROLE,
            agent_instructions=config.AGENT_INSTRUCTIONS,
            bot_token=bot_token,
            currency=config.CURRENCY,
        )
        print(f"✓ Created tenant: {tenant.id} ({tenant.company_name})")

    # Check if products already exist
    existing_products = product_repo.get_by_tenant(tenant_id, available_only=False)
    if existing_products:
        print(f"✓ {len(existing_products)} products already exist. Skipping product creation.")
    else:
        # Seed products
        print(f"Seeding {len(config.PRODUCTS)} products...")
        for idx, product_data in enumerate(config.PRODUCTS, start=1):
            product = product_repo.create(
                product_id=f"{tenant_id.upper()[:3]}-PROD-{idx:03d}",
                tenant_id=tenant_id,
                name=product_data["name"],
                category=product_data["category"],
                price=product_data["price"],
                unit=product_data["unit"],
                description=product_data["description"],
                available=True,
            )
            print(f"  ✓ {product.name} ({product.price} {config.CURRENCY}/{product.unit})")


def seed_database(tenant_filter: str = None):
    """
    Seed database with tenant configurations and products.

    Args:
        tenant_filter: If provided, only seed this tenant (e.g., "valdman", "joannas_bakery")
    """
    print("Starting database seed...")

    db = SessionLocal()

    try:
        # Determine which tenants to seed
        if tenant_filter:
            if tenant_filter not in TENANT_CONFIGS:
                print(f"Error: Unknown tenant '{tenant_filter}'")
                print(f"Available tenants: {', '.join(TENANT_CONFIGS.keys())}")
                return
            tenants_to_seed = {tenant_filter: TENANT_CONFIGS[tenant_filter]}
        else:
            tenants_to_seed = TENANT_CONFIGS

        # Seed each tenant
        for tenant_id, tenant_data in tenants_to_seed.items():
            seed_tenant(db, tenant_id, tenant_data)

        print("\n" + "="*60)
        print("Database seeding complete!")
        print("="*60)

    except Exception as e:
        print(f"Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # Check if specific tenant was requested
    tenant_filter = sys.argv[1] if len(sys.argv) > 1 else None
    seed_database(tenant_filter)
