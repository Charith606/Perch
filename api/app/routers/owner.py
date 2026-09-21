from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, OwnerProfile, PropertyListing, Inquiry
from ..schemas import PropertyCreate, PropertyUpdate, PropertyResponse, InquiryResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/owner", tags=["Owner Management"])

@router.post("/properties", response_model=PropertyResponse)
def create_property(
    prop_in: PropertyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If user is not yet marked as owner, automatically upgrade their profile
    if not current_user.is_owner or current_user.role != "owner":
        current_user.is_owner = True
        current_user.role = "owner"
        if not current_user.owner_profile:
            profile = OwnerProfile(
                user_id=current_user.id,
                business_phone=prop_in.contact_phone or current_user.phone,
                business_email=prop_in.contact_email or current_user.email,
                whatsapp_number=prop_in.contact_phone or current_user.phone,
                is_verified=True
            )
            db.add(profile)
        db.flush()

    # Create listing
    listing = PropertyListing(
        owner_id=current_user.id,
        title=prop_in.title,
        description=prop_in.description,
        category=prop_in.category.lower(),
        gender_preference=prop_in.gender_preference.lower(),
        address=prop_in.address,
        locality=prop_in.locality,
        city=prop_in.city,
        state=prop_in.state,
        pincode=prop_in.pincode,
        latitude=prop_in.latitude,
        longitude=prop_in.longitude,
        price=prop_in.price,
        deposit=prop_in.deposit,
        maintenance_charges=prop_in.maintenance_charges,
        food_included=prop_in.food_included,
        electricity_charges=prop_in.electricity_charges,
        property_size_sqft=prop_in.property_size_sqft,
        bedrooms_or_sharing=prop_in.bedrooms_or_sharing,
        bathrooms=prop_in.bathrooms,
        furnishing=prop_in.furnishing,
        is_available=prop_in.is_available,
        is_featured=prop_in.is_featured,
        contact_name=prop_in.contact_name or current_user.name,
        contact_phone=prop_in.contact_phone or current_user.phone,
        contact_email=prop_in.contact_email or current_user.email
    )
    listing.amenities = prop_in.amenities
    listing.photos = prop_in.photos if prop_in.photos else [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80"
    ]
    listing.rules = prop_in.rules

    db.add(listing)
    db.commit()
    db.refresh(listing)

    return {
        "id": listing.id,
        "owner_id": listing.owner_id,
        "title": listing.title,
        "description": listing.description,
        "category": listing.category,
        "gender_preference": listing.gender_preference,
        "address": listing.address,
        "locality": listing.locality,
        "city": listing.city,
        "state": listing.state,
        "pincode": listing.pincode,
        "latitude": listing.latitude,
        "longitude": listing.longitude,
        "price": listing.price,
        "deposit": listing.deposit,
        "maintenance_charges": listing.maintenance_charges,
        "food_included": listing.food_included,
        "electricity_charges": listing.electricity_charges,
        "property_size_sqft": listing.property_size_sqft,
        "bedrooms_or_sharing": listing.bedrooms_or_sharing,
        "bathrooms": listing.bathrooms,
        "furnishing": listing.furnishing,
        "amenities": listing.amenities,
        "photos": listing.photos,
        "rules": listing.rules,
        "is_available": listing.is_available,
        "is_featured": listing.is_featured,
        "rating": listing.rating,
        "total_reviews": listing.total_reviews,
        "created_at": listing.created_at,
        "updated_at": listing.updated_at,
        "contact_name": listing.contact_name,
        "contact_phone": listing.contact_phone,
        "contact_email": listing.contact_email,
        "owner_name": current_user.name,
        "owner_phone": current_user.phone,
        "owner_email": current_user.email
    }

@router.get("/properties", response_model=List[PropertyResponse])
def get_my_properties(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    props = db.query(PropertyListing).filter(PropertyListing.owner_id == current_user.id).all()
    results = []
    for prop in props:
        results.append({
            "id": prop.id,
            "owner_id": prop.owner_id,
            "title": prop.title,
            "description": prop.description,
            "category": prop.category,
            "gender_preference": prop.gender_preference,
            "address": prop.address,
            "locality": prop.locality,
            "city": prop.city,
            "state": prop.state,
            "pincode": prop.pincode,
            "latitude": prop.latitude,
            "longitude": prop.longitude,
            "price": prop.price,
            "deposit": prop.deposit,
            "maintenance_charges": prop.maintenance_charges,
            "food_included": prop.food_included,
            "electricity_charges": prop.electricity_charges,
            "property_size_sqft": prop.property_size_sqft,
            "bedrooms_or_sharing": prop.bedrooms_or_sharing,
            "bathrooms": prop.bathrooms,
            "furnishing": prop.furnishing,
            "amenities": prop.amenities,
            "photos": prop.photos,
            "rules": prop.rules,
            "is_available": prop.is_available,
            "is_featured": prop.is_featured,
            "rating": prop.rating,
            "total_reviews": prop.total_reviews,
            "created_at": prop.created_at,
            "updated_at": prop.updated_at,
            "contact_name": prop.contact_name or current_user.name,
            "contact_phone": prop.contact_phone or current_user.phone,
            "contact_email": prop.contact_email or current_user.email
        })
    return results

@router.patch("/properties/{property_id}/toggle-status")
def toggle_property_availability(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(PropertyListing).filter(
        PropertyListing.id == property_id,
        PropertyListing.owner_id == current_user.id
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found or unauthorized")
    
    prop.is_available = not prop.is_available
    db.commit()
    return {"message": "Status updated", "is_available": prop.is_available}

@router.delete("/properties/{property_id}")
def delete_property(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prop = db.query(PropertyListing).filter(
        PropertyListing.id == property_id,
        PropertyListing.owner_id == current_user.id
    ).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found or unauthorized")
    
    db.delete(prop)
    db.commit()
    return {"message": "Property deleted successfully"}

@router.get("/inquiries", response_model=List[InquiryResponse])
def get_owner_inquiries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get inquiries for all properties owned by this user
    inquiries = db.query(Inquiry).join(PropertyListing).filter(
        PropertyListing.owner_id == current_user.id
    ).order_by(Inquiry.created_at.desc()).all()

    result = []
    for inq in inquiries:
        result.append({
            "id": inq.id,
            "property_id": inq.property_id,
            "user_id": inq.user_id,
            "name": inq.name,
            "email": inq.email,
            "phone": inq.phone,
            "message": inq.message,
            "preferred_visit_date": inq.preferred_visit_date,
            "status": inq.status,
            "created_at": inq.created_at,
            "property_title": inq.property.title if inq.property else ""
        })
    return result
