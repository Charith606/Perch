from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .routers import auth, properties, owner, inquiries

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Perch - Smart Rental & Accommodation API",
    description="Intelligent search engine & discovery platform for Rent-Houses, PGs, and Hotels with real-time location, distance calculations, and demographic filtering.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register sub-routers
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(owner.router)
app.include_router(inquiries.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Perch API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "properties": "/api/properties",
            "featured": "/api/properties/featured",
            "auth": "/api/auth"
        }
    }
