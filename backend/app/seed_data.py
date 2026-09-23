import os
import json
from sqlalchemy.orm import Session
from .models import User, OwnerProfile, PropertyListing, Review
from .auth import get_password_hash

REAL_SEED_PROPERTIES = []

def seed_database(db: Session):
    # Ensure default verified owner account exists so owners can log in and add real properties
    default_owner = db.query(User).filter(User.email == "owner@perchstay.com").first()
    if not default_owner:
        default_owner = User(
            name="Property Host (Admin)",
            email="owner@perchstay.com",
            phone="+91 98450 12389",
            address="Bangalore, Karnataka",
            hashed_password=get_password_hash("owner123"),
            is_owner=True,
            role="owner",
            avatar=None
        )
        db.add(default_owner)
        db.flush()

        profile = OwnerProfile(
            user_id=default_owner.id,
            company_name="Perch Verified Host Network",
            business_phone="+91 98450 12389",
            business_email="owner@perchstay.com",
            is_verified=True
        )
        db.add(profile)
        db.commit()
    print("Database initialized cleanly with 0 mock properties.")
