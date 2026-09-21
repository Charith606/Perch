import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    address = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_owner = Column(Boolean, default=False)
    role = Column(String(20), default="tenant")  # tenant, owner, admin
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    owner_profile = relationship("OwnerProfile", back_populates="user", uselist=False)
    properties = relationship("PropertyListing", back_populates="owner")
    inquiries = relationship("Inquiry", back_populates="user")
    reviews = relationship("Review", back_populates="user")


class OwnerProfile(Base):
    __tablename__ = "owner_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String(150), nullable=True)
    business_phone = Column(String(20), nullable=True)
    business_email = Column(String(150), nullable=True)
    whatsapp_number = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="owner_profile")


class PropertyListing(Base):
    __tablename__ = "property_listings"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(30), nullable=False, index=True)  # house, pg, hotel, villa, apartment
    
    # Target Demographic: male, female, unisex, family, all
    gender_preference = Column(String(30), default="all", index=True)
    
    # Location
    address = Column(String(255), nullable=False)
    locality = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    
    # Pricing & Terms
    price = Column(Float, nullable=False, index=True)  # Rent per month or room rate per night
    deposit = Column(Float, default=0.0)
    maintenance_charges = Column(Float, default=0.0)
    food_included = Column(Boolean, default=False)
    electricity_charges = Column(String(100), default="Included")  # e.g., "As per meter", "Included"
    
    # Specs
    property_size_sqft = Column(Integer, default=500)
    bedrooms_or_sharing = Column(String(50), default="1 BHK")  # e.g., "Single Room", "2 Sharing", "2 BHK", "3 BHK"
    bathrooms = Column(Integer, default=1)
    furnishing = Column(String(50), default="Furnished")  # Furnished, Semi-Furnished, Unfurnished
    
    # Stored as JSON strings
    _amenities = Column("amenities", Text, default="[]")
    _photos = Column("photos", Text, default="[]")
    _rules = Column("rules", Text, default="[]")
    
    # Availability & Highlights
    is_available = Column(Boolean, default=True, index=True)
    is_featured = Column(Boolean, default=False, index=True)
    rating = Column(Float, default=4.5)
    total_reviews = Column(Integer, default=0)
    
    # Contact override (if owner specifies distinct on-site manager)
    contact_name = Column(String(100), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    contact_email = Column(String(150), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="properties")
    inquiries = relationship("Inquiry", back_populates="property", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="property", cascade="all, delete-orphan")

    @property
    def amenities(self):
        try:
            return json.loads(self._amenities or "[]")
        except Exception:
            return []

    @amenities.setter
    def amenities(self, val):
        self._amenities = json.dumps(val if isinstance(val, list) else [])

    @property
    def photos(self):
        try:
            return json.loads(self._photos or "[]")
        except Exception:
            return []

    @photos.setter
    def photos(self, val):
        self._photos = json.dumps(val if isinstance(val, list) else [])

    @property
    def rules(self):
        try:
            return json.loads(self._rules or "[]")
        except Exception:
            return []

    @rules.setter
    def rules(self, val):
        self._rules = json.dumps(val if isinstance(val, list) else [])


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("property_listings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    preferred_visit_date = Column(String(50), nullable=True)
    status = Column(String(30), default="pending")  # pending, contacted, scheduled, closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    property = relationship("PropertyListing", back_populates="inquiries")
    user = relationship("User", back_populates="inquiries")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("property_listings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(100), default="Anonymous Guest")
    rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    property = relationship("PropertyListing", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
