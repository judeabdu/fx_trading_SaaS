import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print("DATABASE URL:", DATABASE_URL)

# ✅ FIXED: Connection pooling and keepalive configurations added to handle scaling and prevent timeouts
engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# =========================================================
# 🚀 AUTOMATED ON-STARTUP COLUMN MIGRATION HANDLER
# =========================================================
def run_db_migrations():
    """
    Safely runs raw text alter statements wrapped in text() 
    to create the required paywall column on Render instantly.
    """
    db = SessionLocal()
    try:
        print("⏳ Checking database table column integrity...")
        # ✅ FIXED: String explicitly wrapped inside text() to protect execution layers in modern SQLAlchemy
        db.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'SIGNALS_ONLY' NOT NULL;"
        ))
        db.commit()
        print("🚀 Database column 'subscription_tier' verified & patched successfully!")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Column structure sync bypassed or handled: {e}")
    finally:
        db.close()

# Execute migration checks straight into your app's global runtime memory thread
run_db_migrations()