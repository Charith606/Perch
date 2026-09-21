from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from ..database import get_db
from ..models import PropertyListing, User, Review
from ..schemas import PropertyResponse, ReviewCreate, ReviewResponse, GeocodeResult
from ..services.geo_service import calculate_haversine_distance, geocode_query, reverse_geocode
from ..services.osm_service import sync_osm_to_db, fetch_osm_places
from ..auth import get_current_user_optional

router = APIRouter(prefix="/api/properties", tags=["Properties Discovery"])

@router.get("", response_model=List[PropertyResponse])
def get_properties(
    category: Optional[str] = Query(None, description="house, pg, hotel, villa, apartment, or all"),
    gender: Optional[str] = Query(None, description="male, female, unisex, family, all"),
    city: Optional[str] = Query(None),
    search: Optional[str] = Query(None, description="Keyword search"),
    lat: Optional[float] = Query(None, description="User current latitude for distance & radius filter"),
    lng: Optional[float] = Query(None, description="User current longitude for distance & radius filter"),
    radius_km: Optional[float] = Query(None, description="Radius in kilometers (e.g. 5, 10, 25, 50)"),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    furnishing: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("recommended", description="recommended, distance, price_asc, price_desc, rating"),
    db: Session = Depends(get_db)
):
    query = db.query(PropertyListing).filter(PropertyListing.is_available == True)

    # 1. Category Filter
    if category and category.lower() != "all":
        query = query.filter(PropertyListing.category == category.lower())

    # 2. Gender / Demographic Filter (Men's PG, Women's PG, Family, Unisex, All)
    if gender and gender.lower() != "all":
        target_g = gender.lower()
        if target_g in ["male", "female"]:
            # Match specific gender or properties open to 'unisex' / 'all'
            query = query.filter(
                or_(
                    PropertyListing.gender_preference == target_g,
                    PropertyListing.gender_preference == "unisex",
                    PropertyListing.gender_preference == "all"
                )
            )
        elif target_g == "family":
            query = query.filter(
                or_(
                    PropertyListing.gender_preference == "family",
                    PropertyListing.gender_preference == "all"
                )
            )
        else:
            query = query.filter(PropertyListing.gender_preference == target_g)

    # 3. City Filter
    if city and city.strip():
        query = query.filter(PropertyListing.city.ilike(f"%{city.strip()}%"))

    # 4. Keyword search (title, description, locality, address)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                PropertyListing.title.ilike(term),
                PropertyListing.description.ilike(term),
                PropertyListing.locality.ilike(term),
                PropertyListing.address.ilike(term),
                PropertyListing.city.ilike(term)
            )
        )

    # 5. Price range
    if min_price is not None:
        query = query.filter(PropertyListing.price >= min_price)
    if max_price is not None:
        query = query.filter(PropertyListing.price <= max_price)

    # 6. Furnishing
    if furnishing and furnishing.lower() != "all":
        query = query.filter(PropertyListing.furnishing.ilike(furnishing))

    results = query.all()

    # Convert to response objects and compute distance if coordinates are supplied
    property_list = []
    for prop in results:
        dist = None
        if lat is not None and lng is not None:
            dist = calculate_haversine_distance(lat, lng, prop.latitude, prop.longitude)
            # Filter by radius if provided
            if radius_km is not None and radius_km > 0 and dist > radius_km:
                continue

        p_dict = {
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
            "distance_km": dist,
            "contact_name": prop.contact_name or (prop.owner.name if prop.owner else None),
            "contact_phone": prop.contact_phone or (prop.owner.phone if prop.owner else None),
            "contact_email": prop.contact_email or (prop.owner.email if prop.owner else None),
            "owner_name": prop.owner.name if prop.owner else None,
            "owner_phone": prop.owner.phone if prop.owner else None,
            "owner_email": prop.owner.email if prop.owner else None,
        }
        property_list.append(p_dict)

    # Sorting logic
    if sort_by == "distance" and lat is not None and lng is not None:
        property_list.sort(key=lambda x: x["distance_km"] if x["distance_km"] is not None else float("inf"))
    elif sort_by == "price_asc":
        property_list.sort(key=lambda x: x["price"])
    elif sort_by == "price_desc":
        property_list.sort(key=lambda x: x["price"], reverse=True)
    elif sort_by == "rating":
        property_list.sort(key=lambda x: (x["rating"], x["total_reviews"]), reverse=True)
    elif sort_by == "newest":
        property_list.sort(key=lambda x: x["created_at"], reverse=True)
    else:
        # Recommended: Featured first, then high rating
        property_list.sort(key=lambda x: (x["is_featured"], x["rating"]), reverse=True)

    return property_list

@router.get("/featured", response_model=List[PropertyResponse])
def get_featured_and_top_rated(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns top-rated and featured properties for the auto-scrolling banner / slider.
    """
    query = db.query(PropertyListing).filter(
        PropertyListing.is_available == True,
        or_(PropertyListing.is_featured == True, PropertyListing.rating >= 4.7)
    ).order_by(PropertyListing.rating.desc()).limit(10)

    props = query.all()
    result = []
    for prop in props:
        dist = None
        if lat is not None and lng is not None:
            dist = calculate_haversine_distance(lat, lng, prop.latitude, prop.longitude)
        
        result.append({
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
            "distance_km": dist,
            "contact_name": prop.contact_name or (prop.owner.name if prop.owner else None),
            "contact_phone": prop.contact_phone or (prop.owner.phone if prop.owner else None),
            "contact_email": prop.contact_email or (prop.owner.email if prop.owner else None),
        })
    return result

@router.get("/geocode", response_model=List[GeocodeResult])
async def geocode_location(q: str = Query(..., min_length=2)):
    """
    Search real geocoded coordinates for any city, locality or area name.
    """
    return await geocode_query(q)

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property_by_id(
    property_id: int,
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    prop = db.query(PropertyListing).filter(PropertyListing.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property listing not found")
    
    dist = None
    if lat is not None and lng is not None:
        dist = calculate_haversine_distance(lat, lng, prop.latitude, prop.longitude)

    return {
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
        "distance_km": dist,
        "contact_name": prop.contact_name or (prop.owner.name if prop.owner else None),
        "contact_phone": prop.contact_phone or (prop.owner.phone if prop.owner else None),
        "contact_email": prop.contact_email or (prop.owner.email if prop.owner else None),
        "owner_name": prop.owner.name if prop.owner else None,
        "owner_phone": prop.owner.phone if prop.owner else None,
        "owner_email": prop.owner.email if prop.owner else None,
    }

@router.post("/{property_id}/reviews", response_model=ReviewResponse)
def add_property_review(
    property_id: int,
    review_in: ReviewCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    prop = db.query(PropertyListing).filter(PropertyListing.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    user_name = review_in.user_name or (current_user.name if current_user else "Guest Tenant")
    review = Review(
        property_id=property_id,
        user_id=current_user.id if current_user else None,
        user_name=user_name,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(review)
    
    # Recalculate average rating
    all_reviews = db.query(Review).filter(Review.property_id == property_id).all()
    ratings = [r.rating for r in all_reviews] + [review_in.rating]
    prop.rating = round(sum(ratings) / len(ratings), 1)
    prop.total_reviews = len(ratings)

    db.commit()
    db.refresh(review)
    return review

@router.post("/sync-osm")
async def sync_osm_listings(
    lat: float = Query(..., description="Latitude of center point"),
    lng: float = Query(..., description="Longitude of center point"),
    radius_km: float = Query(25.0, description="Radius in km to discover places"),
    db: Session = Depends(get_db)
):
    """
    Query OpenStreetMap (Overpass API) to discover real PGs, Hotels, and Rentals around the given location and sync them to the database.
    """
    added = await sync_osm_to_db(db=db, lat=lat, lon=lng, radius_km=radius_km)
    return {
        "status": "success",
        "synced_count": added,
        "message": f"Discovered and saved {added} real places from OpenStreetMap within {radius_km}km"
    }
