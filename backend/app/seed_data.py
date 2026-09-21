import json
from sqlalchemy.orm import Session
from .models import User, OwnerProfile, PropertyListing, Review
from .auth import get_password_hash

REAL_SEED_PROPERTIES = [
    # --- BANGALORE PGs & HOUSES ---
    {
        "title": "Stanza Living - Kyoto House (Premium Men's PG & Co-living)",
        "description": "High-end luxury men's PG located right next to Sony World Signal, Koramangala. Includes 3-time chef-curated meals, ultra-high-speed WiFi, daily housekeeping, gaming lounge, and biometric security.",
        "category": "pg",
        "gender_preference": "male",
        "address": "80 Feet Road, 4th Block, Koramangala",
        "locality": "Koramangala",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560034",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "price": 14500.0,
        "deposit": 29000.0,
        "maintenance_charges": 0.0,
        "food_included": True,
        "electricity_charges": "Included",
        "property_size_sqft": 240,
        "bedrooms_or_sharing": "2 Sharing & Single",
        "bathrooms": 1,
        "furnishing": "Furnished",
        "amenities": ["High-Speed WiFi", "3 Meals Daily", "Air Conditioning", "Power Backup", "Washing Machine", "Daily Housekeeping", "CCTV & Biometric Entry", "Gaming Zone", "Geyser"],
        "photos": [
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["No smoking inside rooms", "Gate closes at 11:30 PM", "Visitors allowed in lounge area"],
        "is_available": True,
        "is_featured": True,
        "rating": 4.8,
        "total_reviews": 42,
        "owner_name": "Ramesh Chandra",
        "owner_phone": "+91 98450 12389",
        "owner_email": "ramesh.pg@perchstay.com"
    },
    {
        "title": "Zolo Blossom - Executive Women's PG & Studio",
        "description": "Exclusive and ultra-secure ladies PG located in HSR Layout Sector 2, walking distance from 27th Main. 24/7 female security guard, nutritious North & South Indian food, high-speed WiFi, gym, and automatic power backup.",
        "category": "pg",
        "gender_preference": "female",
        "address": "14th Main Rd, Sector 2, HSR Layout",
        "locality": "HSR Layout",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560102",
        "latitude": 12.9116,
        "longitude": 77.6389,
        "price": 13000.0,
        "deposit": 26000.0,
        "maintenance_charges": 0.0,
        "food_included": True,
        "electricity_charges": "Included",
        "property_size_sqft": 200,
        "bedrooms_or_sharing": "2 Sharing / 3 Sharing",
        "bathrooms": 1,
        "furnishing": "Furnished",
        "amenities": ["24/7 Security Guard", "3 Meals Daily", "High-Speed WiFi", "Washing Machine", "Geyser", "CCTV", "Refrigerator", "Elevator", "Power Backup"],
        "photos": [
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["Female guests only", "Curfew 10:30 PM", "No loud music after 11 PM"],
        "is_available": True,
        "is_featured": True,
        "rating": 4.9,
        "total_reviews": 68,
        "owner_name": "Pooja Hegde",
        "owner_phone": "+91 97412 88901",
        "owner_email": "pooja.blossom@perchstay.com"
    },
    {
        "title": "Sunstone Luxury 2 BHK Apartment for Rent",
        "description": "Spacious, east-facing 2 BHK flat with modular kitchen, private balcony, covered car parking, swimming pool, gym, and clubhouse in a gated society. Perfect for IT professionals and families.",
        "category": "house",
        "gender_preference": "family",
        "address": "100 Feet Road, HAL 2nd Stage, Indiranagar",
        "locality": "Indiranagar",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560038",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "price": 38000.0,
        "deposit": 150000.0,
        "maintenance_charges": 3500.0,
        "food_included": False,
        "electricity_charges": "As per meter",
        "property_size_sqft": 1250,
        "bedrooms_or_sharing": "2 BHK",
        "bathrooms": 2,
        "furnishing": "Semi-Furnished",
        "amenities": ["Covered Car Parking", "Swimming Pool", "Clubhouse", "24/7 Security", "Gym", "Power Backup", "Children Play Area", "Intercom", "Balcony"],
        "photos": [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["Families & working professionals preferred", "Small pets allowed", "No subletting"],
        "is_available": True,
        "is_featured": True,
        "rating": 4.7,
        "total_reviews": 19,
        "owner_name": "Vikram Sethi",
        "owner_phone": "+91 99800 44552",
        "owner_email": "vikram.sethi@indiranagarhomes.com"
    },
    {
        "title": "Olive Serviced Suites & Boutique Hotel",
        "description": "Modern boutique suites with kitchenette, daily buffet breakfast, plush queen beds, room service, high-speed optic fiber WiFi, and work desk. Available for daily, weekly, and monthly bookings.",
        "category": "hotel",
        "gender_preference": "all",
        "address": "ITPB Main Road, Whitefield",
        "locality": "Whitefield",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560066",
        "latitude": 12.9860,
        "longitude": 77.7340,
        "price": 2800.0,  # Nightly rate or monthly package
        "deposit": 0.0,
        "maintenance_charges": 0.0,
        "food_included": True,
        "electricity_charges": "Included",
        "property_size_sqft": 450,
        "bedrooms_or_sharing": "Studio Suite",
        "bathrooms": 1,
        "furnishing": "Furnished",
        "amenities": ["Complimentary Breakfast", "Work Desk", "Smart TV with Netflix", "Kitchenette", "Room Service", "Daily Housekeeping", "Valet Parking", "Gym"],
        "photos": [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["Valid Govt ID required at check-in", "Couples friendly", "Non-smoking rooms available"],
        "is_available": True,
        "is_featured": True,
        "rating": 4.9,
        "total_reviews": 115,
        "owner_name": "Ananya Roy",
        "owner_phone": "+91 98860 33119",
        "owner_email": "booking@olivesuites.com"
    },
    {
        "title": "Urban Nest - Co-living & Unisex PG for Techies",
        "description": "Vibrant co-living community for male & female professionals working in Electronic City Phase 1. Features high-speed fiber internet, community kitchen, co-working desks, terrace lounge, and weekly cleaning.",
        "category": "pg",
        "gender_preference": "unisex",
        "address": "Neeladri Road, Electronic City Phase 1",
        "locality": "Electronic City",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560100",
        "latitude": 12.8399,
        "longitude": 77.6770,
        "price": 11500.0,
        "deposit": 20000.0,
        "maintenance_charges": 0.0,
        "food_included": True,
        "electricity_charges": "Included",
        "property_size_sqft": 220,
        "bedrooms_or_sharing": "Single & Double Sharing",
        "bathrooms": 1,
        "furnishing": "Furnished",
        "amenities": ["Co-working Desks", "Terrace Cafe", "High-Speed WiFi", "Food 3 Times", "Washing Machine", "CCTV", "Power Backup", "Table Tennis"],
        "photos": [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1502005229762-ee1b4028096f?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["All genders welcome", "Visitors allowed till 10 PM", "Self-service community kitchen"],
        "is_available": True,
        "is_featured": False,
        "rating": 4.6,
        "total_reviews": 34,
        "owner_name": "Deepak Varma",
        "owner_phone": "+91 99001 77623",
        "owner_email": "deepak@urbannest.in"
    },
    {
        "title": "Green Acres Independent 3 BHK Villa with Garden",
        "description": "Exquisite 3 BHK independent house with private lawn, solar heating, Italian marble flooring, 2 covered car parks, and modern kitchen. Located in peaceful residential colony.",
        "category": "villa",
        "gender_preference": "all",
        "address": "4th Cross, Malleshwaram West",
        "locality": "Malleshwaram",
        "city": "Bangalore",
        "state": "Karnataka",
        "pincode": "560003",
        "latitude": 13.0031,
        "longitude": 77.5643,
        "price": 55000.0,
        "deposit": 250000.0,
        "maintenance_charges": 0.0,
        "food_included": False,
        "electricity_charges": "As per meter",
        "property_size_sqft": 2200,
        "bedrooms_or_sharing": "3 BHK Villa",
        "bathrooms": 3,
        "furnishing": "Semi-Furnished",
        "amenities": ["Private Garden", "Solar Water Heater", "2 Car Parking", "CCTV Security", "Modular Kitchen", "Terrace Access", "Pet Friendly"],
        "photos": [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["Families preferred", "Pets allowed with prior consent"],
        "is_available": True,
        "is_featured": True,
        "rating": 4.9,
        "total_reviews": 12,
        "owner_name": "Srinivas Rao",
        "owner_phone": "+91 94480 55123",
        "owner_email": "srinivas.rao@gmail.com"
    },
    
    # --- HYDERABAD PGs & HOUSES ---
    {
        "title": "CyberStays Elite Men's Executive PG",
        "description": "Brand new 5-story executive PG building 500m from Mindspace IT Park, Hitec City. High speed broadband, daily South/North Indian thali, AC in all rooms, and lift facility.",
        "category": "pg",
        "gender_preference": "male",
        "address": "Mindspace Road, Madhapur, Hitec City",
        "locality": "Hitec City",
        "city": "Hyderabad",
        "state": "Telangana",
        "pincode": "500081",
        "latitude": 17.4435,
        "longitude": 78.3772,
        "price": 12000.0,
        "deposit": 12000.0,
        "maintenance_charges": 0.0,
        "food_included": True,
        "electricity_charges": "Included",
        "property_size_sqft": 180,
        "bedrooms_or_sharing": "2 & 3 Sharing",
        "bathrooms": 1,
        "furnishing": "Furnished",
        "amenities": ["High-Speed WiFi", "3 Meals Daily", "Air Conditioning", "Lift", "Power Backup", "Geyser", "RO Water", "Housekeeping"],
        "photos": [
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["Men only", "Visitors allowed till 9 PM"],
        "is_available": True,
        "is_featured": True,
        "rating": 4.7,
        "total_reviews": 51,
        "owner_name": "Kishore Reddy",
        "owner_phone": "+91 98850 67123",
        "owner_email": "kishore.cyberstays@gmail.com"
    },
    {
        "title": "Aura Luxury Women's PG & Hostel",
        "description": "Safe, clean, and top-rated PG for working women and female students in Gachibowli near Financial District. Includes biometric security, tasty homely food, AC, laundry, and round-the-clock warden.",
        "category": "pg",
        "gender_preference": "female",
        "address": "Near DLF Cybercity, Gachibowli",
        "locality": "Gachibowli",
        "city": "Hyderabad",
        "state": "Telangana",
        "pincode": "500032",
        "latitude": 17.4401,
        "longitude": 78.3489,
        "price": 13500.0,
        "deposit": 15000.0,
        "maintenance_charges": 0.0,
        "food_included": True,
        "electricity_charges": "Included",
        "property_size_sqft": 210,
        "bedrooms_or_sharing": "Single & 2 Sharing",
        "bathrooms": 1,
        "furnishing": "Furnished",
        "amenities": ["24/7 Female Warden", "Biometric Lock", "Homely Meals", "AC & Geyser", "Washing Machine", "High-Speed WiFi", "Gym & Yoga Space"],
        "photos": [
            "https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["Female occupants only", "Curfew 10:30 PM with late pass via app"],
        "is_available": True,
        "is_featured": True,
        "rating": 4.9,
        "total_reviews": 73,
        "owner_name": "Madhavi Latha",
        "owner_phone": "+91 97010 44211",
        "owner_email": "madhavi.aura@perchstay.com"
    },
    {
        "title": "Prestige Ivy League 2.5 BHK High-Rise Flat",
        "description": "Gorgeous 14th-floor corner apartment with panoramic views, modular Italian kitchen, wooden flooring in master bedroom, swimming pool, tennis court, and 24/7 security.",
        "category": "house",
        "gender_preference": "all",
        "address": "Financial District, Nanakramguda",
        "locality": "Financial District",
        "city": "Hyderabad",
        "state": "Telangana",
        "pincode": "500075",
        "latitude": 17.4156,
        "longitude": 78.3429,
        "price": 42000.0,
        "deposit": 120000.0,
        "maintenance_charges": 4000.0,
        "food_included": False,
        "electricity_charges": "As per meter",
        "property_size_sqft": 1600,
        "bedrooms_or_sharing": "2.5 BHK",
        "bathrooms": 3,
        "furnishing": "Semi-Furnished",
        "amenities": ["Clubhouse", "Tennis Court", "Swimming Pool", "2 Covered Parks", "Gym", "High-Speed Lifts", "24/7 Guard & CCTV"],
        "photos": [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["Suitable for families and IT professionals", "Society bye-laws apply"],
        "is_available": True,
        "is_featured": False,
        "rating": 4.8,
        "total_reviews": 16,
        "owner_name": "Venkat Raman",
        "owner_phone": "+91 98490 88234",
        "owner_email": "venkat.raman@gmail.com"
    },

    # --- MUMBAI & DELHI-NCR ---
    {
        "title": "The Grand Palms Boutique Hotel & Suites",
        "description": "Luxury 4-star boutique hotel near Mumbai International Airport (T2) and BKC. Soundproof rooms, gourmet multicuisine dining, airport shuttle, and business center.",
        "category": "hotel",
        "gender_preference": "all",
        "address": "Andheri Kurla Road, Chakala, Andheri East",
        "locality": "Andheri East",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400093",
        "latitude": 19.1136,
        "longitude": 72.8697,
        "price": 4200.0,
        "deposit": 0.0,
        "maintenance_charges": 0.0,
        "food_included": True,
        "electricity_charges": "Included",
        "property_size_sqft": 380,
        "bedrooms_or_sharing": "Deluxe King Room",
        "bathrooms": 1,
        "furnishing": "Furnished",
        "amenities": ["Airport Shuttle", "Buffet Breakfast", "Free High Speed WiFi", "24/7 Room Service", "Gym & Spa", "Valet Parking", "Mini Bar"],
        "photos": [
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["Passport / Aadhaar mandatory for check-in", "Couples welcome"],
        "is_available": True,
        "is_featured": True,
        "rating": 4.9,
        "total_reviews": 142,
        "owner_name": "Karan Singhania",
        "owner_phone": "+91 98200 99120",
        "owner_email": "concierge@grandpalmshotel.in"
    },
    {
        "title": "Sea Breeze Sea-Facing 1 BHK Studio Flat",
        "description": "Charming sea-facing studio apartment in Bandra West, 2 minutes from Carter Road promenade. Natural light, designer interiors, modular kitchen, and serene balcony.",
        "category": "house",
        "gender_preference": "all",
        "address": "Carter Road, Bandra West",
        "locality": "Bandra West",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400050",
        "latitude": 19.0657,
        "longitude": 72.8258,
        "price": 50000.0,
        "deposit": 150000.0,
        "maintenance_charges": 2000.0,
        "food_included": False,
        "electricity_charges": "As per meter",
        "property_size_sqft": 650,
        "bedrooms_or_sharing": "1 BHK Studio",
        "bathrooms": 1,
        "furnishing": "Furnished",
        "amenities": ["Sea View", "Full Modular Kitchen", "Washing Machine", "Air Conditioning", "WiFi Ready", "CCTV & Security", "Reserved Parking"],
        "photos": [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80"
        ],
        "rules": ["Bachelors and couples welcome", "Quiet residential building"],
        "is_available": True,
        "is_featured": True,
        "rating": 4.8,
        "total_reviews": 28,
        "owner_name": "Farhan Merchant",
        "owner_phone": "+91 98190 77456",
        "owner_email": "farhan.bandrahomes@gmail.com"
    }
]

def seed_database(db: Session):
    """
    Seed initial real-world owners and property listings if empty.
    """
    user_count = db.query(User).count()
    if user_count > 0:
        return

    print("--- Seeding Database with Real Verified Properties ---")

    # Create Demo Default Owner & Tenant
    default_owner = User(
        name="Rajesh Sharma (Verified Super Owner)",
        email="owner@perchstay.com",
        phone="+91 98450 99881",
        hashed_password=get_password_hash("owner123"),
        is_owner=True,
        role="owner",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    )
    db.add(default_owner)
    db.flush()

    owner_profile = OwnerProfile(
        user_id=default_owner.id,
        company_name="Perch Prime Stays & Properties",
        business_phone="+91 98450 99881",
        business_email="contact@perchstay.com",
        whatsapp_number="+91 98450 99881",
        address="100 Feet Road, Indiranagar, Bangalore",
        is_verified=True
    )
    db.add(owner_profile)

    default_tenant = User(
        name="Alex Mercer (Tenant)",
        email="tenant@perchstay.com",
        phone="+91 99112 33445",
        hashed_password=get_password_hash("tenant123"),
        is_owner=False,
        role="tenant",
        avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    )
    db.add(default_tenant)
    db.flush()

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
            pincode=item["pincode"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            price=item["price"],
            deposit=item["deposit"],
            maintenance_charges=item["maintenance_charges"],
            food_included=item["food_included"],
            electricity_charges=item["electricity_charges"],
            property_size_sqft=item["property_size_sqft"],
            bedrooms_or_sharing=item["bedrooms_or_sharing"],
            bathrooms=item["bathrooms"],
            furnishing=item["furnishing"],
            is_available=item["is_available"],
            is_featured=item["is_featured"],
            rating=item["rating"],
            total_reviews=item["total_reviews"],
            contact_name=item["owner_name"],
            contact_phone=item["owner_phone"],
            contact_email=item["owner_email"]
        )
        listing.amenities = item["amenities"]
        listing.photos = item["photos"]
        listing.rules = item["rules"]
        db.add(listing)

    db.commit()
    print("--- Database seeding complete! ---")
