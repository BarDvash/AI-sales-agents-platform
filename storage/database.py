"""
Database connection and session management.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Create database engine
# echo=True logs all SQL statements (useful for debugging)
engine = create_engine(DATABASE_URL, echo=False)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


def get_db():
    """
    Dependency to get database session.
    Use with FastAPI Depends() or as a generator in standalone scripts.

    Usage (FastAPI):
        @app.get("/")
        def endpoint(db: Session = Depends(get_db)):
            db.query(...)

    Usage (standalone scripts):
        db_gen = get_db()
        db = next(db_gen)
        try:
            db.query(...)
        finally:
            try:
                next(db_gen)
            except StopIteration:
                pass
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
