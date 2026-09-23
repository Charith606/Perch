import os
import json
from sqlalchemy.orm import Session
from .models import User, OwnerProfile, PropertyListing, Review
from .auth import get_password_hash

JSON_PATH = os.path.join(os.path.dirname(__file__), "real_properties_dataset.json")

def load_seed_properties():
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading JSON dataset: {e}")
    return []

REAL_SEED_PROPERTIES = load_seed_properties()

def seed_database(db: Session):
    count = db.query(PropertyListing).count()
    if count > 0:
        return

    print("--- Seeding Database with Real OpenStreetMap Dataset ---")
    default_owner = db.query(User).filter(User.email == "owner@perchstay.com").first()
    if not default_owner:
        default_owner = User(
            name="Rajesh Kumar (Verified Host)",
            email="owner@perchstay.com",
            phone="+91 98450 12389",
            address="100 Feet Rd, Indiranagar, Bangalore",
            hashed_password=get_password_hash("owner123"),
            is_owner=True,
            role="owner",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
        )
        db.add(default_owner)
        db.flush()

        profile = OwnerProfile(
            user_id=default_owner.id,
            company_name="Perch Premium Stays & Hostels Network",
            business_phone="+91 98450 12389",
            business_email="owner@perchstay.com",
            is_verified=True
        )
        db.add(profile)

    for item in REAL_SEED_PROPERTIES:
        listing = PropertyListing(
            owner_id=default_owner.id,
            title=item["title"],
            description=item["description"],
            category=item["category"],
            gender_preference=item["gender_preference"],
            address=item["address"],
            locality=item["locality"],
            city=item["city"],
            state=item["state"],
            pincode=item.get("pincode", "560001"),
            latitude=item["latitude"],
            longitude=item["longitude"],
            price=float(item["price"]),
            deposit=float(item.get("deposit", 0.0)),
            maintenance_charges=float(item.get("maintenance_charges", 0.0)),
            food_included=bool(item.get("food_included", False)),
            electricity_charges=item.get("electricity_charges", "Included"),
            property_size_sqft=int(item.get("property_size_sqft", 500)),
            bedrooms_or_sharing=item.get("bedrooms_or_sharing", "1 BHK"),
            bathrooms=int(item.get("bathrooms", 1)),
            furnishing=item.get("furnishing", "Furnished"),
            is_available=True,
            is_featured=bool(item.get("is_featured", False)),
            rating=float(item.get("rating", 4.8)),
            total_reviews=int(item.get("total_reviews", 10)),
            contact_name=item.get("owner_name", "Verified Host"),
            contact_phone=item.get("owner_phone", "+91 98450 12389"),
            contact_email=item.get("owner_email", "host@perchstay.com")
        )
        listing.amenities = item.get("amenities", [])
        listing.photos = item.get("photos", [])
        listing.rules = item.get("rules", [])
        db.add(listing)

    db.commit()
    print(f"--- Database seeded with {len(REAL_SEED_PROPERTIES)} real properties! ---")
