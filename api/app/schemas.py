from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# --- Auth & User Schemas ---

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    is_owner: bool = False
    role: Optional[str] = "tenant"

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OwnerProfileSchema(BaseModel):
    company_name: Optional[str] = None
    business_phone: Optional[str] = None
    business_email: Optional[str] = None
    whatsapp_number: Optional[str] = None
    address: Optional[str] = None
    is_verified: bool = True

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    is_owner: bool
    role: str
    avatar: Optional[str] = None
    created_at: datetime
    owner_profile: Optional[OwnerProfileSchema] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Property Schemas ---

class PropertyBase(BaseModel):
    title: str
    description: str
    category: str  # house, pg, hotel, villa, apartment
    gender_preference: str = "all"  # male, female, unisex, family, all
    
    address: str
    locality: str
    city: str
    state: str
    pincode: Optional[str] = None
    latitude: float
    longitude: float
    
    price: float
    deposit: Optional[float] = 0.0
    maintenance_charges: Optional[float] = 0.0
    food_included: Optional[bool] = False
    electricity_charges: Optional[str] = "Included"
    
    property_size_sqft: Optional[int] = 500
    bedrooms_or_sharing: Optional[str] = "1 BHK"
    bathrooms: Optional[int] = 1
    furnishing: Optional[str] = "Furnished"
    
    amenities: List[str] = []
    photos: List[str] = []
    rules: List[str] = []
    
    is_available: bool = True
    is_featured: bool = False
    
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    gender_preference: Optional[str] = None
    address: Optional[str] = None
    locality: Optional[str] = None
    city: Optional[str] = None
    price: Optional[float] = None
    deposit: Optional[float] = None
    is_available: Optional[bool] = None
    amenities: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    rules: Optional[List[str]] = None

class PropertyResponse(PropertyBase):
    id: int
    owner_id: int
    rating: float
    total_reviews: int
    created_at: datetime
    updated_at: datetime
    distance_km: Optional[float] = None  # Populated dynamically when user coords are passed
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None
    owner_email: Optional[str] = None

    class Config:
        from_attributes = True


# --- Inquiry Schemas ---

class InquiryCreate(BaseModel):
    property_id: int
    name: str
    email: EmailStr
    phone: str
    message: str
    preferred_visit_date: Optional[str] = None

class InquiryResponse(InquiryCreate):
    id: int
    user_id: Optional[int] = None
    status: str
    created_at: datetime
    property_title: Optional[str] = None

    class Config:
        from_attributes = True


# --- Review Schemas ---

class ReviewCreate(BaseModel):
    property_id: int
    rating: float = Field(..., ge=1, le=5)
    comment: str
    user_name: Optional[str] = "Anonymous"

class ReviewResponse(ReviewCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Geo & Filter Schemas ---

class GeocodeResult(BaseModel):
    display_name: str
    latitude: float
    longitude: float
    city: Optional[str] = None
    locality: Optional[str] = None
