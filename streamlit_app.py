import os
import sys
import json
import math
from datetime import datetime

# Ensure project backend can be imported
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import streamlit as st
import pandas as pd
from sqlalchemy.orm import Session

# Import backend modules
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import User, OwnerProfile, PropertyListing, Inquiry, Review
from backend.app.seed_data import seed_database
from backend.app.services.geo_service import calculate_haversine_distance

# Initialize DB safely
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        # Check if database is empty and seed
        if db.query(PropertyListing).count() == 0:
            seed_database(db)
    except Exception as e:
        print(f"Seed check error: {e}")
    return db

# Page Configuration
st.set_page_config(
    page_title="Perch - Smart Rental & Accommodation Discovery",
    page_icon="🏡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern styling
st.markdown("""
<style>
    /* Global Styles */
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    .stApp {
        background-color: #0b0f19;
        color: #f1f5f9;
    }
    
    /* Header Banner */
    .hero-container {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(14, 165, 233, 0.12) 100%);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 16px;
        padding: 28px;
        margin-bottom: 24px;
        text-align: center;
        backdrop-filter: blur(12px);
    }
    
    .hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        background: linear-gradient(90deg, #34d399, #38bdf8, #818cf8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 8px;
    }
    
    .hero-subtitle {
        font-size: 1.05rem;
        color: #94a3b8;
        max-width: 700px;
        margin: 0 auto;
    }
    
    /* Property Cards */
    .property-card {
        background: #131b2e;
        border: 1px solid #1e293b;
        border-radius: 14px;
        overflow: hidden;
        transition: transform 0.2s ease, border-color 0.2s ease;
        margin-bottom: 20px;
    }
    
    .property-card:hover {
        border-color: #10b981;
        transform: translateY(-2px);
    }
    
    .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        margin-right: 6px;
    }
    
    .badge-pg { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
    .badge-house { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); }
    .badge-hotel { background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4); }
    .badge-villa { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    
    .badge-gender {
        background: rgba(244, 63, 94, 0.15);
        color: #fb7185;
        border: 1px solid rgba(244, 63, 94, 0.3);
    }
    
    .price-text {
        font-size: 1.35rem;
        font-weight: 700;
        color: #10b981;
    }
    
    .amenity-chip {
        display: inline-block;
        background: #1e293b;
        color: #cbd5e1;
        font-size: 0.75rem;
        padding: 3px 8px;
        border-radius: 6px;
        margin: 2px 4px 2px 0;
    }
    
    /* Stats Bar */
    .stat-box {
        background: #131b2e;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 14px;
        text-align: center;
    }
    .stat-number {
        font-size: 1.5rem;
        font-weight: 700;
        color: #38bdf8;
    }
    .stat-label {
        font-size: 0.8rem;
        color: #64748b;
        text-transform: uppercase;
    }
</style>
""", unsafe_allow_html=True)

# Session State Initialization
if "current_role" not in st.session_state:
    st.session_state.current_role = "Tenant / Guest"
if "selected_property_id" not in st.session_state:
    st.session_state.selected_property_id = None
if "inquiry_submitted" not in st.session_state:
    st.session_state.inquiry_submitted = False
if "review_submitted" not in st.session_state:
    st.session_state.review_submitted = False

# Sidebar Navigation & Settings
with st.sidebar:
    st.image("https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80", use_container_width=True)
    st.title("🏡 Perch Portal")
    st.caption("Intelligent Rental & Stay Finder")
    
    # Role Switcher
    role = st.radio(
        "Select Portal Mode",
        ["🔍 Find Accommodations (Tenant)", "🏢 Owner & Host Portal", "🧭 Distance & Commute Tool"],
        index=0
    )
    
    st.divider()

# Top Stats & Hero Section
def render_hero():
    st.markdown("""
    <div class="hero-container">
        <div class="hero-title">🏡 Find Your Next Home, PG or Stay</div>
        <div class="hero-subtitle">
            Explore verified Rent Houses, Executive PGs, and Hotels with real-time location mapping, distance calculations, and demographic filtering.
        </div>
    </div>
    """, unsafe_allow_html=True)

# Helper: Render Map with Folium or Pydeck
def render_map_view(properties, center_lat=12.9716, center_lng=77.5946, zoom=12):
    try:
        import folium
        from streamlit_folium import st_folium
        
        m = folium.Map(
            location=[center_lat, center_lng],
            zoom_start=zoom,
            tiles="CartoDB dark_matter"
        )
        
        for p in properties:
            color = "green"
            if p.category == "house":
                color = "blue"
            elif p.category == "hotel":
                color = "purple"
            elif p.category == "villa":
                color = "orange"
                
            popup_html = f"""
            <div style="font-family: sans-serif; width: 220px; color: #111;">
                <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">{p.title}</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #555;">📍 {p.locality}, {p.city}</p>
                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #059669;">₹{p.price:,.0f} / month</p>
                <p style="margin: 0; font-size: 11px; color: #666;">⭐ {p.rating:.1f} ({p.total_reviews} reviews)</p>
            </div>
            """
            
            folium.Marker(
                location=[p.latitude, p.longitude],
                popup=folium.Popup(popup_html, max_width=250),
                tooltip=f"{p.title} - ₹{p.price:,.0f}",
                icon=folium.Icon(color=color, icon="home", prefix="fa")
            ).add_to(m)
            
        st_folium(m, width="100%", height=420, returned_objects=[])
    except Exception:
        # Fallback to Pydeck / st.map
        if properties:
            df = pd.DataFrame([
                {
                    "lat": p.latitude,
                    "lon": p.longitude,
                    "title": p.title,
                    "price": p.price
                }
                for p in properties
            ])
            st.map(df, zoom=zoom)
        else:
            st.info("No properties to display on map for current filters.")

# -------------------------------------------------------------
# MODE 1: FIND ACCOMMODATIONS (TENANT DISCOVERY)
# -------------------------------------------------------------
if role == "🔍 Find Accommodations (Tenant)":
    render_hero()
    
    db = get_db()
    
    # Live database summary metrics
    total_listings = db.query(PropertyListing).filter(PropertyListing.is_available == True).count()
    total_pgs = db.query(PropertyListing).filter(PropertyListing.category == "pg").count()
    total_houses = db.query(PropertyListing).filter(PropertyListing.category.in_(["house", "apartment", "villa"])).count()
    cities = [c[0] for c in db.query(PropertyListing.city).distinct().all() if c[0]]
    
    mcol1, mcol2, mcol3, mcol4 = st.columns(4)
    with mcol1:
        st.markdown(f'<div class="stat-box"><div class="stat-number">{total_listings}</div><div class="stat-label">Available Stays</div></div>', unsafe_allow_html=True)
    with mcol2:
        st.markdown(f'<div class="stat-box"><div class="stat-number">{total_pgs}</div><div class="stat-label">PGs & Co-Living</div></div>', unsafe_allow_html=True)
    with mcol3:
        st.markdown(f'<div class="stat-box"><div class="stat-number">{total_houses}</div><div class="stat-label">Houses & Flats</div></div>', unsafe_allow_html=True)
    with mcol4:
        st.markdown(f'<div class="stat-box"><div class="stat-number">{len(cities)}</div><div class="stat-label">Active Cities</div></div>', unsafe_allow_html=True)
        
    st.write("")
    
    # Filter Bar
    with st.expander("🎯 Search Filters & Demographic Preferences", expanded=True):
        fcol1, fcol2, fcol3 = st.columns(3)
        with fcol1:
            city_options = ["All Cities"] + sorted(cities)
            selected_city = st.selectbox("📍 Select City", city_options, index=0)
            
            search_query = st.text_input("🔍 Search locality, title, or landmark", placeholder="e.g. Koramangala, Indiranagar, HSR Layout...")
            
        with fcol2:
            category_filter = st.selectbox(
                "🏠 Property Category",
                ["All Categories", "PG & Co-living", "Rent House", "Hotel & Short Stay", "Luxury Villa", "Apartment / Flat"]
            )
            
            gender_filter = st.selectbox(
                "👥 Demographic Preference",
                ["All Demographics", "Male / Boys Only", "Female / Girls Only", "Family Only", "Unisex / Any"]
            )
            
        with fcol3:
            price_range = st.slider(
                "💰 Monthly Rent Budget (₹)",
                min_value=3000,
                max_value=120000,
                value=(3000, 80000),
                step=1000
            )
            
            sharing_filter = st.selectbox(
                "🛏️ Rooms / Sharing",
                ["All Configurations", "Single Room", "2 Sharing", "3 Sharing", "1 BHK", "2 BHK", "3 BHK", "4 BHK+"]
            )
            
        st.write("**Extra Amenities & Preferences**")
        acol1, acol2, acol3, acol4, acol5 = st.columns(5)
        with acol1:
            filter_wifi = st.checkbox("📶 High-Speed WiFi")
        with acol2:
            filter_ac = st.checkbox("❄️ Air Conditioning")
        with acol3:
            filter_food = st.checkbox("🍱 Meals / Food Included")
        with acol4:
            filter_power = st.checkbox("⚡ Power Backup")
        with acol5:
            filter_furnished = st.checkbox("🛋️ Fully Furnished")

    # Construct SQLAlchemy Query
    query = db.query(PropertyListing).filter(PropertyListing.is_available == True)
    
    if selected_city != "All Cities":
        query = query.filter(PropertyListing.city.ilike(f"%{selected_city}%"))
        
    if search_query:
        search_pattern = f"%{search_query}%"
        query = query.filter(
            (PropertyListing.title.ilike(search_pattern)) |
            (PropertyListing.locality.ilike(search_pattern)) |
            (PropertyListing.address.ilike(search_pattern)) |
            (PropertyListing.description.ilike(search_pattern))
        )
        
    # Category mapping
    cat_map = {
        "PG & Co-living": "pg",
        "Rent House": "house",
        "Hotel & Short Stay": "hotel",
        "Luxury Villa": "villa",
        "Apartment / Flat": "apartment"
    }
    if category_filter in cat_map:
        query = query.filter(PropertyListing.category == cat_map[category_filter])
        
    # Demographic mapping
    dem_map = {
        "Male / Boys Only": "male",
        "Female / Girls Only": "female",
        "Family Only": "family",
        "Unisex / Any": "unisex"
    }
    if gender_filter in dem_map:
        query = query.filter(PropertyListing.gender_preference.in_([dem_map[gender_filter], "all"]))
        
    # Price filtering
    query = query.filter(PropertyListing.price >= price_range[0], PropertyListing.price <= price_range[1])
    
    # Sharing filtering
    if sharing_filter != "All Configurations":
        query = query.filter(PropertyListing.bedrooms_or_sharing.ilike(f"%{sharing_filter}%"))
        
    if filter_food:
        query = query.filter(PropertyListing.food_included == True)
        
    if filter_furnished:
        query = query.filter(PropertyListing.furnishing == "Furnished")

    # Execute query
    listings = query.order_by(PropertyListing.is_featured.desc(), PropertyListing.rating.desc()).all()
    
    # Amenity post-filtering
    filtered_listings = []
    for item in listings:
        amenities_list = [a.lower() for a in item.amenities]
        if filter_wifi and not any("wifi" in a for a in amenities_list):
            continue
        if filter_ac and not any("ac" in a or "air" in a for a in amenities_list):
            continue
        if filter_power and not any("power" in a or "backup" in a or "generator" in a for a in amenities_list):
            continue
        filtered_listings.append(item)

    # Display Map
    st.subheader(f"🗺️ Interactive Discovery Map ({len(filtered_listings)} listings found)")
    if filtered_listings:
        center_lat = filtered_listings[0].latitude
        center_lng = filtered_listings[0].longitude
        render_map_view(filtered_listings, center_lat=center_lat, center_lng=center_lng, zoom=12)
    else:
        render_map_view([], zoom=11)
        
    st.divider()

    # Detail View Modal or Expanded View
    if st.session_state.selected_property_id:
        selected_prop = db.query(PropertyListing).filter(PropertyListing.id == st.session_state.selected_property_id).first()
        if selected_prop:
            st.markdown(f"### 📋 {selected_prop.title}")
            
            col_close, _ = st.columns([1, 5])
            with col_close:
                if st.button("⬅️ Back to Search Grid"):
                    st.session_state.selected_property_id = None
                    st.rerun()

            pcol1, pcol2 = st.columns([1.2, 1])
            with pcol1:
                # Photos
                photos = selected_prop.photos or ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80"]
                st.image(photos[0], use_container_width=True, caption=f"{selected_prop.title} - Main View")
                if len(photos) > 1:
                    t_cols = st.columns(min(len(photos) - 1, 3))
                    for i, p_url in enumerate(photos[1:4]):
                        with t_cols[i]:
                            st.image(p_url, use_container_width=True)

                st.write("**About This Property**")
                st.write(selected_prop.description)

                st.write("**✨ Included Amenities**")
                amenity_chips = "".join([f'<span class="amenity-chip">✓ {a}</span>' for a in selected_prop.amenities])
                st.markdown(amenity_chips, unsafe_allow_html=True)
                
                if selected_prop.rules:
                    st.write("**📜 House Rules & Policies**")
                    for rule in selected_prop.rules:
                        st.markdown(f"- {rule}")

            with pcol2:
                # Specs Box
                st.markdown(f"""
                <div class="property-card" style="padding: 20px;">
                    <div style="font-size: 1.8rem; font-weight: 800; color: #10b981;">₹{selected_prop.price:,.0f} <span style="font-size: 0.9rem; color: #94a3b8;">/ month</span></div>
                    <div style="color: #cbd5e1; font-size: 0.9rem; margin-top: 4px;">📍 {selected_prop.address}, {selected_prop.locality}, {selected_prop.city} - {selected_prop.pincode or ''}</div>
                    <hr style="border-color: #1e293b; margin: 12px 0;">
                    <div style="font-size: 0.85rem; line-height: 1.8;">
                        <div>💰 <b>Security Deposit:</b> ₹{selected_prop.deposit:,.0f}</div>
                        <div>⚡ <b>Electricity:</b> {selected_prop.electricity_charges}</div>
                        <div>🧹 <b>Maintenance:</b> ₹{selected_prop.maintenance_charges:,.0f}/mo</div>
                        <div>🍱 <b>Food Included:</b> {'Yes (Included in Rent)' if selected_prop.food_included else 'No / Self-cooking'}</div>
                        <div>🛋️ <b>Furnishing:</b> {selected_prop.furnishing}</div>
                        <div>📐 <b>Carpet Area:</b> {selected_prop.property_size_sqft} sq.ft</div>
                        <div>👥 <b>Demographic:</b> {selected_prop.gender_preference.capitalize()}</div>
                        <div>⭐ <b>Rating:</b> {selected_prop.rating:.1f} / 5.0 ({selected_prop.total_reviews} verified reviews)</div>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                st.write("#### 📩 Send Inquiry / Schedule Visit")
                with st.form(f"inquiry_form_{selected_prop.id}"):
                    inq_name = st.text_input("Your Full Name", placeholder="e.g. John Doe")
                    inq_phone = st.text_input("Phone Number", placeholder="e.g. +91 98765 43210")
                    inq_email = st.text_input("Email Address", placeholder="e.g. john@example.com")
                    inq_date = st.date_input("Preferred Visit Date")
                    inq_msg = st.text_area("Message / Questions for Owner", "Hi, I am interested in viewing this property. Is it available for immediate move-in?")
                    submit_inquiry = st.form_submit_button("🚀 Submit Inquiry to Owner", use_container_width=True)
                    
                    if submit_inquiry:
                        if not inq_name or not inq_phone:
                            st.error("Please provide your name and contact phone number.")
                        else:
                            new_inquiry = Inquiry(
                                property_id=selected_prop.id,
                                name=inq_name,
                                email=inq_email or "not_provided@perch.local",
                                phone=inq_phone,
                                message=inq_msg,
                                preferred_visit_date=str(inq_date),
                                status="pending"
                            )
                            db.add(new_inquiry)
                            db.commit()
                            st.success("✅ Inquiry sent successfully! The property manager will reach out shortly.")

                # Review Section
                st.write("#### ⭐ Reviews & Feedback")
                reviews = db.query(Review).filter(Review.property_id == selected_prop.id).order_by(Review.created_at.desc()).all()
                if reviews:
                    for r in reviews:
                        st.markdown(f"""
                        <div style="background: #1e293b; padding: 10px 14px; border-radius: 8px; margin-bottom: 8px;">
                            <div style="font-weight: 600; font-size: 0.85rem; color: #38bdf8;">{r.user_name} • {'★' * int(r.rating)}{'☆' * (5 - int(r.rating))}</div>
                            <div style="font-size: 0.8rem; color: #cbd5e1; margin-top: 4px;">{r.comment}</div>
                        </div>
                        """, unsafe_allow_html=True)
                else:
                    st.caption("No reviews yet. Be the first to leave a review!")

                with st.expander("Write a Review"):
                    with st.form(f"review_form_{selected_prop.id}"):
                        rev_name = st.text_input("Reviewer Name", placeholder="Anonymous Guest")
                        rev_rating = st.slider("Rating", 1, 5, 5)
                        rev_comment = st.text_area("Your Review", placeholder="Clean rooms, prompt staff, great location...")
                        submit_review = st.form_submit_button("Post Review")
                        if submit_review:
                            if rev_comment:
                                new_rev = Review(
                                    property_id=selected_prop.id,
                                    user_name=rev_name or "Verified Tenant",
                                    rating=float(rev_rating),
                                    comment=rev_comment
                                )
                                db.add(new_rev)
                                # Update property rating
                                selected_prop.total_reviews += 1
                                selected_prop.rating = round(((selected_prop.rating * (selected_prop.total_reviews - 1)) + rev_rating) / selected_prop.total_reviews, 1)
                                db.commit()
                                st.success("Review posted successfully!")
                                st.rerun()

            st.divider()

    # Listings Grid
    st.subheader("🏠 Available Properties")
    if not filtered_listings:
        st.warning("No properties matched your filter criteria. Try adjusting the budget or removing demographic filters.")
    else:
        # Display 2 columns grid
        cols = st.columns(2)
        for idx, prop in enumerate(filtered_listings):
            with cols[idx % 2]:
                category_class = f"badge-{prop.category}" if prop.category in ["pg", "house", "hotel", "villa"] else "badge-house"
                photos = prop.photos or ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"]
                thumbnail = photos[0]
                
                amenities_preview = "".join([f'<span class="amenity-chip">{a}</span>' for a in prop.amenities[:4]])
                
                st.markdown(f"""
                <div class="property-card">
                    <img src="{thumbnail}" style="width: 100%; height: 210px; object-fit: cover; border-top-left-radius: 14px; border-top-right-radius: 14px;" />
                    <div style="padding: 16px;">
                        <div style="margin-bottom: 8px;">
                            <span class="badge {category_class}">{prop.category.upper()}</span>
                            <span class="badge badge-gender">{prop.gender_preference.upper()}</span>
                            <span style="float: right; color: #fbbf24; font-weight: 700; font-size: 0.85rem;">★ {prop.rating:.1f} ({prop.total_reviews})</span>
                        </div>
                        <h4 style="margin: 6px 0; font-size: 1.15rem; font-weight: 700; color: #f8fafc;">{prop.title}</h4>
                        <div style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 8px;">📍 {prop.locality}, {prop.city} • {prop.bedrooms_or_sharing}</div>
                        <div style="margin-bottom: 12px;">{amenities_preview}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #1e293b; padding-top: 10px;">
                            <div class="price-text">₹{prop.price:,.0f} <span style="font-size: 0.8rem; color: #94a3b8; font-weight: normal;">/ mo</span></div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                btn_col1, btn_col2 = st.columns([1, 1])
                with btn_col1:
                    if st.button(f"👁️ View Details", key=f"view_btn_{prop.id}", use_container_width=True):
                        st.session_state.selected_property_id = prop.id
                        st.rerun()
                with btn_col2:
                    if st.button(f"📩 Inquire Now", key=f"inq_btn_{prop.id}", use_container_width=True):
                        st.session_state.selected_property_id = prop.id
                        st.rerun()
                        
                st.write("")

# -------------------------------------------------------------
# MODE 2: OWNER & HOST PORTAL
# -------------------------------------------------------------
elif role == "🏢 Owner & Host Portal":
    st.markdown("""
    <div class="hero-container" style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(129, 140, 248, 0.15) 100%);">
        <div class="hero-title">🏢 Perch Owner & Host Dashboard</div>
        <div class="hero-subtitle">List your property, manage existing units, and respond to incoming tenant visit requests.</div>
    </div>
    """, unsafe_allow_html=True)
    
    db = get_db()
    owner_tab1, owner_tab2, owner_tab3 = st.tabs(["➕ List New Property", "📋 Manage Listings", "📬 Tenant Inquiries"])
    
    # Tab 1: List New Property
    with owner_tab1:
        st.subheader("Create a New Rental / Stay Listing")
        with st.form("create_listing_form"):
            c1, c2 = st.columns(2)
            with c1:
                new_title = st.text_input("Listing Title *", placeholder="e.g. Luxury 2 BHK Apartment near Tech Park")
                new_category = st.selectbox("Category *", ["pg", "house", "apartment", "villa", "hotel"])
                new_gender = st.selectbox("Demographic Target *", ["all", "male", "female", "family", "unisex"])
                new_price = st.number_input("Monthly Rent / Nightly Rate (₹) *", min_value=1000, max_value=500000, value=15000, step=500)
                new_deposit = st.number_input("Security Deposit (₹)", min_value=0, max_value=1000000, value=30000, step=1000)
                new_size = st.number_input("Carpet Area (sq.ft)", min_value=100, max_value=10000, value=650)
                new_furnishing = st.selectbox("Furnishing", ["Furnished", "Semi-Furnished", "Unfurnished"])
                new_sharing = st.text_input("Bedrooms / Sharing *", "2 BHK", placeholder="e.g. 1 BHK, 2 Sharing, Single Room")

            with c2:
                new_address = st.text_input("Street Address *", placeholder="e.g. 12th Cross, Indiranagar")
                new_locality = st.text_input("Locality / Area *", placeholder="e.g. Indiranagar")
                new_city = st.text_input("City *", value="Bangalore")
                new_state = st.text_input("State *", value="Karnataka")
                new_pincode = st.text_input("Pincode", "560038")
                new_lat = st.number_input("Latitude *", value=12.9784, format="%.6f")
                new_lng = st.number_input("Longitude *", value=77.6408, format="%.6f")
                new_food = st.checkbox("Food / Meals Included in Rent")

            new_desc = st.text_area("Detailed Description *", placeholder="Highlight distance from metro, security, modern amenities, water supply...")
            
            st.write("**Amenities Selection**")
            am_c1, am_c2, am_c3, am_c4 = st.columns(4)
            with am_c1:
                am_wifi = st.checkbox("High-Speed WiFi", value=True)
                am_ac = st.checkbox("Air Conditioning")
            with am_c2:
                am_power = st.checkbox("Power Backup", value=True)
                am_wash = st.checkbox("Washing Machine", value=True)
            with am_c3:
                am_cctv = st.checkbox("CCTV Security", value=True)
                am_gym = st.checkbox("Gym / Fitness Center")
            with am_c4:
                am_park = st.checkbox("Parking Space", value=True)
                am_housekeep = st.checkbox("Daily Housekeeping")

            new_photos_text = st.text_area("Photo URLs (one URL per line)", "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80\nhttps://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80")
            new_rules_text = st.text_area("House Rules (one rule per line)", "No smoking indoors\nVisitors allowed in lounge area")

            submit_listing = st.form_submit_button("🚀 Publish Property Listing", use_container_width=True)
            
            if submit_listing:
                if not new_title or not new_address or not new_locality or not new_city:
                    st.error("Please fill in all mandatory fields (Title, Address, Locality, City).")
                else:
                    # Collect amenities
                    selected_ams = []
                    if am_wifi: selected_ams.append("High-Speed WiFi")
                    if am_ac: selected_ams.append("Air Conditioning")
                    if am_power: selected_ams.append("Power Backup")
                    if am_wash: selected_ams.append("Washing Machine")
                    if am_cctv: selected_ams.append("CCTV & Security")
                    if am_gym: selected_ams.append("Gym")
                    if am_park: selected_ams.append("Car & Bike Parking")
                    if am_housekeep: selected_ams.append("Daily Housekeeping")
                    
                    photo_list = [p.strip() for p in new_photos_text.splitlines() if p.strip()]
                    rule_list = [r.strip() for r in new_rules_text.splitlines() if r.strip()]
                    
                    # Ensure a default owner user exists
                    owner_user = db.query(User).filter(User.is_owner == True).first()
                    owner_id = owner_user.id if owner_user else 1
                    
                    new_item = PropertyListing(
                        owner_id=owner_id,
                        title=new_title,
                        description=new_desc or "Quality accommodation with essential amenities.",
                        category=new_category,
                        gender_preference=new_gender,
                        address=new_address,
                        locality=new_locality,
                        city=new_city,
                        state=new_state,
                        pincode=new_pincode,
                        latitude=new_lat,
                        longitude=new_lng,
                        price=float(new_price),
                        deposit=float(new_deposit),
                        maintenance_charges=0.0,
                        food_included=new_food,
                        property_size_sqft=int(new_size),
                        bedrooms_or_sharing=new_sharing,
                        bathrooms=1,
                        furnishing=new_furnishing,
                        is_available=True,
                        is_featured=False,
                        rating=5.0,
                        total_reviews=0,
                        contact_name="Property Host",
                        contact_phone="+91 98450 12389"
                    )
                    new_item.amenities = selected_ams
                    new_item.photos = photo_list
                    new_item.rules = rule_list
                    
                    db.add(new_item)
                    db.commit()
                    st.success(f"🎉 Successfully published '{new_title}'! It is now live on the map and search portal.")

    # Tab 2: Manage Listings
    with owner_tab2:
        st.subheader("Your Active & Listed Properties")
        all_props = db.query(PropertyListing).order_by(PropertyListing.id.desc()).all()
        
        if not all_props:
            st.info("No properties in database.")
        else:
            for p in all_props:
                mcol1, mcol2, mcol3, mcol4 = st.columns([2, 1, 1, 1])
                with mcol1:
                    st.write(f"**{p.title}**")
                    st.caption(f"📍 {p.locality}, {p.city} | ₹{p.price:,.0f}/mo | {p.category.upper()}")
                with mcol2:
                    status_str = "🟢 Available" if p.is_available else "🔴 Rented Out"
                    st.write(f"Status: **{status_str}**")
                with mcol3:
                    if st.button("Toggle Status", key=f"toggle_{p.id}"):
                        p.is_available = not p.is_available
                        db.commit()
                        st.rerun()
                with mcol4:
                    if st.button("🗑️ Delete", key=f"del_{p.id}"):
                        db.delete(p)
                        db.commit()
                        st.warning(f"Deleted listing {p.id}")
                        st.rerun()
                st.divider()

    # Tab 3: Tenant Inquiries
    with owner_tab3:
        st.subheader("📬 Incoming Tenant Inquiries & Booking Requests")
        inquiries = db.query(Inquiry).order_by(Inquiry.created_at.desc()).all()
        
        if not inquiries:
            st.info("No inquiries received yet.")
        else:
            for inq in inquiries:
                prop = db.query(PropertyListing).filter(PropertyListing.id == inq.property_id).first()
                prop_title = prop.title if prop else "General Inquiry"
                
                with st.expander(f"📩 {inq.name} - for {prop_title} ({inq.status.upper()})"):
                    icol1, icol2 = st.columns(2)
                    with icol1:
                        st.write(f"**Tenant Name:** {inq.name}")
                        st.write(f"**Phone:** `{inq.phone}`")
                        st.write(f"**Email:** `{inq.email}`")
                        st.write(f"**Visit Date:** `{inq.preferred_visit_date or 'Immediate'}`")
                    with icol2:
                        st.write(f"**Message:**")
                        st.info(inq.message)
                        new_status = st.selectbox(
                            "Update Status",
                            ["pending", "contacted", "scheduled", "closed"],
                            index=["pending", "contacted", "scheduled", "closed"].index(inq.status) if inq.status in ["pending", "contacted", "scheduled", "closed"] else 0,
                            key=f"status_select_{inq.id}"
                        )
                        if new_status != inq.status:
                            inq.status = new_status
                            db.commit()
                            st.success(f"Status updated to {new_status}")
                            st.rerun()

# -------------------------------------------------------------
# MODE 3: DISTANCE & COMMUTE CALCULATOR
# -------------------------------------------------------------
elif role == "🧭 Distance & Commute Tool":
    st.markdown("""
    <div class="hero-container" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%);">
        <div class="hero-title">🧭 Commute Distance Calculator</div>
        <div class="hero-subtitle">Calculate exact radial distance from any tech park, college, hospital or metro station to your shortlisted properties.</div>
    </div>
    """, unsafe_allow_html=True)
    
    db = get_db()
    all_props = db.query(PropertyListing).filter(PropertyListing.is_available == True).all()
    
    dcol1, dcol2 = st.columns([1, 1.2])
    with dcol1:
        st.write("#### 📍 Select Target Landmark or Work Location")
        
        # Predefined popular tech hubs
        hub_choice = st.selectbox(
            "Quick Select Tech Hub / Landmark",
            [
                "Custom Coordinates / Address",
                "Sony World Signal, Koramangala (12.9352, 77.6245)",
                "Manyata Tech Park, Hebbal (13.0489, 77.6212)",
                "Bagmane Tech Park, CV Raman Nagar (12.9818, 77.6622)",
                "Ecospace, Bellandur (12.9260, 77.6834)",
                "Electronic City Phase 1 (12.8399, 77.6770)",
                "BKC, Mumbai (19.0657, 72.8687)",
                "Cyber City, Gurgaon / Delhi NCR (28.4907, 77.0898)",
                "HITEC City, Hyderabad (17.4474, 78.3762)"
            ]
        )
        
        hub_coords = {
            "Sony World Signal, Koramangala (12.9352, 77.6245)": (12.9352, 77.6245),
            "Manyata Tech Park, Hebbal (13.0489, 77.6212)": (13.0489, 77.6212),
            "Bagmane Tech Park, CV Raman Nagar (12.9818, 77.6622)": (12.9818, 77.6622),
            "Ecospace, Bellandur (12.9260, 77.6834)": (12.9260, 77.6834),
            "Electronic City Phase 1 (12.8399, 77.6770)": (12.8399, 77.6770),
            "BKC, Mumbai (19.0657, 72.8687)": (19.0657, 72.8687),
            "Cyber City, Gurgaon / Delhi NCR (28.4907, 77.0898)": (28.4907, 77.0898),
            "HITEC City, Hyderabad (17.4474, 78.3762)": (17.4474, 78.3762)
        }
        
        if hub_choice in hub_coords:
            ref_lat, ref_lng = hub_coords[hub_choice]
            st.info(f"Target Anchor: `{ref_lat:.4f}, {ref_lng:.4f}`")
        else:
            ref_lat = st.number_input("Custom Latitude", value=12.9352, format="%.6f")
            ref_lng = st.number_input("Custom Longitude", value=77.6245, format="%.6f")
            
        max_commute_km = st.slider("Maximum Desired Distance (km)", 1.0, 30.0, 10.0, 0.5)

    with dcol2:
        # Compute distances
        results = []
        for p in all_props:
            dist = calculate_haversine_distance(ref_lat, ref_lng, p.latitude, p.longitude)
            if dist <= max_commute_km:
                results.append({
                    "Property": p.title,
                    "Locality": p.locality,
                    "City": p.city,
                    "Category": p.category.upper(),
                    "Demographic": p.gender_preference.upper(),
                    "Rent (₹)": f"₹{p.price:,.0f}",
                    "Distance (km)": dist,
                    "Rating": f"⭐ {p.rating:.1f}"
                })
                
        results = sorted(results, key=lambda x: x["Distance (km)"])
        st.write(f"#### 🎯 Properties within {max_commute_km} km ({len(results)} found)")
        
        if results:
            df_dist = pd.DataFrame(results)
            st.dataframe(df_dist, use_container_width=True)
        else:
            st.warning("No properties within this radius. Try increasing the distance slider.")
