# 🏡 Perch - Smart Rental & Accommodation Discovery Platform

**Perch** is an intelligent discovery platform for Rent-Houses, Executive PGs, and Hotels with real-time location mapping, distance calculations, and demographic filtering.

---

## 🚀 Deploying to Streamlit Community Cloud (1-Click Deploy)

You can deploy Perch directly on [Streamlit Community Cloud](https://share.streamlit.io/) for free in just a few steps:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Streamlit deployment for Perch"
   git push origin main
   ```

2. **Deploy on Streamlit Cloud**:
   - Go to [share.streamlit.io](https://share.streamlit.io/) and log in with your GitHub account.
   - Click **"Create app"** (or **"New app"**).
   - Select your repository: `Charith606/Perch` (or your repository name).
   - Set **Main file path**: `streamlit_app.py` (or `app.py`).
   - Click **"Deploy!"**.

3. **Enjoy your live app**:
   Streamlit Cloud will install the dependencies from `requirements.txt`, initialize the database automatically, and launch your live web app with interactive maps and full booking/inquiry workflows!

---

## 💻 Running Locally

### 1. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 2. Launch Streamlit Web App
```bash
python -m streamlit run streamlit_app.py
```
Open [http://localhost:8501](http://localhost:8501) in your browser.

---

## ✨ Features Included

- 🗺️ **Interactive Leaflet & Folium Discovery Map**: Real-time property markers with pricing, rating, and popups.
- 🎯 **Demographic & Budget Filters**: Filter by PG / House / Hotel / Villa, Boys / Girls / Family / Unisex demographic, rent budget, BHK/sharing, and furnishing.
- ⚡ **Amenities Selection**: WiFi, AC, Power Backup, Gym, Food/Mess, CCTV, Parking, Housekeeping.
- 🧭 **Commute & Distance Tool**: Exact Haversine radial distance calculator from any Tech Park, Metro station, or custom coordinates.
- 📋 **Property Details & High-Res Gallery**: Full pricing breakdown (Rent, Deposit, Maintenance, Electricity terms), photos, and house rules.
- 📩 **Direct Tenant Inquiries**: Tenants can submit visit requests with contact information and preferred dates directly into the database.
- 🏢 **Owner & Host Management Portal**:
  - Add new property listings with images, custom coordinates, and amenities.
  - Toggle listing availability (Available / Rented Out).
  - Manage and update tenant inquiry statuses (`pending`, `contacted`, `scheduled`, `closed`).
- ⭐ **Reviews & Rating System**: Tenant feedback and verified review submissions.
