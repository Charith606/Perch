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
import streamlit.components.v1 as components
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
        if db.query(PropertyListing).count() == 0:
            seed_database(db)
    except Exception as e:
        print(f"Seed notice: {e}")
    return db

# Initialize DB once on start
db = get_db()
db.close()

# Page Configuration
st.set_page_config(
    page_title="Perch | Smart Rent-House, PG & Hotel Discovery",
    page_icon="🏡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom Styling to maximize screen for Custom React App
st.markdown("""
<style>
    /* Full width container optimization */
    .block-container {
        padding-top: 0.5rem !important;
        padding-bottom: 0rem !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
        max-width: 100% !important;
    }
    header[data-testid="stHeader"] {
        background-color: transparent !important;
        z-index: 1000;
    }
    footer {
        display: none !important;
    }
</style>
""", unsafe_allow_html=True)

# Helper to load standalone React bundle
@st.cache_data
def load_react_bundle():
    bundle_path = os.path.join(CURRENT_DIR, "static", "bundle.html")
    if os.path.exists(bundle_path):
        with open(bundle_path, "r", encoding="utf-8") as f:
            return f.read()
    
    # Fallback to building if not present
    dist_html_path = os.path.join(CURRENT_DIR, "frontend", "dist", "index.html")
    if os.path.exists(dist_html_path):
        with open(dist_html_path, "r", encoding="utf-8") as f:
            return f.read()
    return None

# Sidebar controls
with st.sidebar:
    st.title("🏡 Perch Platform")
    view_mode = st.radio(
        "Application Mode",
        ["✨ Full Custom React UI (Recommended)", "📊 Streamlit Analytics & Admin View"],
        index=0
    )
    st.info("💡 You can switch views anytime from this sidebar.")

# Render UI based on chosen mode
if view_mode == "✨ Full Custom React UI (Recommended)":
    react_html = load_react_bundle()
    if react_html:
        # Render the exact custom React frontend
        components.html(react_html, height=1200, scrolling=True)
    else:
        st.error("React bundle not found. Please run 'python build_react_bundle.py'.")

else:
    # Analytics & Streamlit Dashboard View
    st.title("📊 Perch Database & Analytics View")
    db = get_db()
    
    col1, col2, col3, col4 = st.columns(4)
    total_props = db.query(PropertyListing).count()
    total_inquiries = db.query(Inquiry).count()
    total_users = db.query(User).count()
    total_reviews = db.query(Review).count()
    
    col1.metric("Total Properties", total_props)
    col2.metric("Inquiries Received", total_inquiries)
    col3.metric("Registered Users", total_users)
    col4.metric("Verified Reviews", total_reviews)
    
    st.divider()
    
    tab1, tab2, tab3 = st.tabs(["📋 Properties Explorer", "📬 Inquiries Table", "⭐ Reviews Table"])
    with tab1:
        props = db.query(PropertyListing).all()
        data = [{
            "ID": p.id,
            "Title": p.title,
            "Category": p.category,
            "Gender Target": p.gender_preference,
            "Locality": p.locality,
            "City": p.city,
            "Rent (₹)": p.price,
            "Rating": p.rating,
            "Available": p.is_available
        } for p in props]
        st.dataframe(pd.DataFrame(data), use_container_width=True)
        
    with tab2:
        inqs = db.query(Inquiry).all()
        inq_data = [{
            "ID": i.id,
            "Property ID": i.property_id,
            "Name": i.name,
            "Phone": i.phone,
            "Email": i.email,
            "Visit Date": i.preferred_visit_date,
            "Status": i.status,
            "Message": i.message
        } for i in inqs]
        st.dataframe(pd.DataFrame(inq_data), use_container_width=True)
        
    with tab3:
        revs = db.query(Review).all()
        rev_data = [{
            "ID": r.id,
            "Property ID": r.property_id,
            "User Name": r.user_name,
            "Rating": r.rating,
            "Comment": r.comment
        } for r in revs]
        st.dataframe(pd.DataFrame(rev_data), use_container_width=True)
    
    db.close()
