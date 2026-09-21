from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PropertyListing, Inquiry, User
from ..schemas import InquiryCreate, InquiryResponse
from ..auth import get_current_user_optional

router = APIRouter(prefix="/api/inquiries", tags=["Inquiries & Booking"])

@router.post("", response_model=InquiryResponse)
def submit_inquiry(
    inquiry_in: InquiryCreate,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    prop = db.query(PropertyListing).filter(PropertyListing.id == inquiry_in.property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    
    inquiry = Inquiry(
        property_id=inquiry_in.property_id,
        user_id=current_user.id if current_user else None,
        name=inquiry_in.name,
        email=inquiry_in.email,
        phone=inquiry_in.phone,
        message=inquiry_in.message,
        preferred_visit_date=inquiry_in.preferred_visit_date,
        status="pending"
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    return {
        "id": inquiry.id,
        "property_id": inquiry.property_id,
        "user_id": inquiry.user_id,
        "name": inquiry.name,
        "email": inquiry.email,
        "phone": inquiry.phone,
        "message": inquiry.message,
        "preferred_visit_date": inquiry.preferred_visit_date,
        "status": inquiry.status,
        "created_at": inquiry.created_at,
        "property_title": prop.title
    }
