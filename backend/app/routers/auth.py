from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, OwnerProfile
from ..schemas import UserCreate, UserLogin, UserResponse, TokenResponse, OwnerProfileSchema, UserProfileUpdate
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        address=user_in.address,
        hashed_password=hashed_pwd,
        is_owner=user_in.is_owner,
        role="owner" if user_in.is_owner else "tenant"
    )
    db.add(user)
    db.flush()

    if user_in.is_owner:
        owner_profile = OwnerProfile(
            user_id=user.id,
            business_phone=user_in.phone,
            business_email=user_in.email,
            whatsapp_number=user_in.phone,
            address=user_in.address,
            is_verified=True
        )
        db.add(owner_profile)

    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update User Name, Phone number, and Address.
    Email is immutable and cannot be modified.
    """
    if profile_in.name is not None and profile_in.name.strip():
        current_user.name = profile_in.name.strip()
    if profile_in.phone is not None and profile_in.phone.strip():
        current_user.phone = profile_in.phone.strip()
    if profile_in.address is not None:
        current_user.address = profile_in.address.strip()
        if current_user.owner_profile:
            current_user.owner_profile.address = profile_in.address.strip()

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/switch-role", response_model=UserResponse)
def switch_role(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Seamlessly switch user between 'tenant' and 'owner' mode.
    If turning into an owner, ensures owner profile exists.
    """
    if current_user.role == "tenant":
        current_user.role = "owner"
        current_user.is_owner = True
        if not current_user.owner_profile:
            profile = OwnerProfile(
                user_id=current_user.id,
                business_phone=current_user.phone,
                business_email=current_user.email,
                whatsapp_number=current_user.phone,
                address=current_user.address,
                is_verified=True
            )
            db.add(profile)
    else:
        current_user.role = "tenant"
    
    db.commit()
    db.refresh(current_user)
    return current_user
