"""
Database seeding script.
Seeds the database with Valdman tenant and product catalog.

Run this once after running migrations:
    python scripts/seed_database.py
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from storage.database import SessionLocal
from storage.repositories import TenantRepository, ProductRepository
from config import valdman

# Load environment variables
load_dotenv()


def seed_database():
    """Seed database with Valdman tenant and products."""
    print("Starting database seed...")

    db = SessionLocal()

    try:
        tenant_repo = TenantRepository(db)
        product_repo = ProductRepository(db)

        # Check if Valdman already exists
        existing_tenant = tenant_repo.get_by_id("valdman")
        if existing_tenant:
            print("✓ Valdman tenant already exists. Skipping tenant creation.")
        else:
            # Create Valdman tenant
            print("Creating Valdman tenant...")
            tenant = tenant_repo.create(
                tenant_id="valdman",
                company_name=valdman.COMPANY_NAME,
                company_type=valdman.COMPANY_TYPE,
                business_description=valdman.BUSINESS_DESCRIPTION,
                agent_role=valdman.AGENT_ROLE,
                agent_instructions=valdman.AGENT_INSTRUCTIONS,
                bot_token=os.getenv("BOT_TOKEN"),
                currency=valdman.CURRENCY,
            )
            print(f"✓ Created tenant: {tenant.id} ({tenant.company_name})")

        # Check if products already exist
        existing_products = product_repo.get_by_tenant("valdman", available_only=False)
        if existing_products:
            print(f"✓ {len(existing_products)} products already exist. Skipping product creation.")
        else:
            # Seed products from valdman.PRODUCTS
            print(f"Seeding {len(valdman.PRODUCTS)} products...")
            for idx, product_data in enumerate(valdman.PRODUCTS, start=1):
                product = product_repo.create(
                    product_id=f"PROD-{idx:03d}",
                    tenant_id="valdman",
                    name=product_data["name"],
                    category=product_data["category"],
                    price=product_data["price"],
                    unit=product_data["unit"],
                    description=product_data["description"],
                    available=True,
                )
                print(f"  ✓ Created product: {product.id} - {product.name} ({product.price} {valdman.CURRENCY}/{product.unit})")

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
    seed_database()
