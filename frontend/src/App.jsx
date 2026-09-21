import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HamburgerDrawer from './components/HamburgerDrawer';
import SettingsModal from './components/SettingsModal';
import EditProfileModal from './components/EditProfileModal';
import TopRatedSlider from './components/TopRatedSlider';
import FilterBar from './components/FilterBar';
import PropertyCard from './components/PropertyCard';
import PropertyDetailModal from './components/PropertyDetailModal';
import LiveMap from './components/LiveMap';
import OwnerPortal from './components/OwnerPortal';
import AuthModal from './components/AuthModal';
import DistanceCalculatorWidget from './components/DistanceCalculatorWidget';
import { api, getStoredUser, removeAuthToken, removeStoredUser } from './services/api';
import { detectLocalCurrency } from './utils/currency';
import { 
  Building2, 
  MapPin, 
  Search, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle2, 
  Heart,
  Compass
} from 'lucide-react';

export default function App() {
  // User & Auth State
  const [user, setUser] = useState(getStoredUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isOwnerMode, setIsOwnerMode] = useState(false);

  // Currency State (Auto-detected based on user's location/timeZone)
  const [currency, setCurrency] = useState(() => detectLocalCurrency());

  // User Location State (Default Bangalore)
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [locationName, setLocationName] = useState('Bangalore, KA');

  // Properties Discovery State
  const [properties, setProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Owner counts
  const [ownerListingCount, setOwnerListingCount] = useState(0);
  const [inquiryCount, setInquiryCount] = useState(0);

  // Filter States
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(25);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [syncingOsm, setSyncingOsm] = useState(false);

  // Detect Live GPS Location
  const handleDetectLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          try {
            const geocoded = await api.geocode(`${latitude}, ${longitude}`);
            if (geocoded && geocoded.length > 0) {
              setLocationName(geocoded[0].locality || geocoded[0].city || 'Current GPS Location');
            } else {
              setLocationName('Live GPS Location');
            }
          } catch (e) {
            setLocationName('Live GPS Location');
          }
        },
        (error) => {
          console.warn('Geolocation access denied or timed out:', error);
          alert('GPS location permission denied. You can select a city from the location menu.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }, []);

  const handleSelectCity = (city) => {
    setUserLocation({ lat: city.lat, lng: city.lng });
    setLocationName(city.name);
  };

  useEffect(() => {
    handleDetectLocation();
  }, [handleDetectLocation]);

  // Load Owner Counts
  useEffect(() => {
    if (user) {
      api.getMyProperties().then(res => setOwnerListingCount(res.length)).catch(() => {});
      api.getOwnerInquiries().then(res => setInquiryCount(res.length)).catch(() => {});
    }
  }, [user, isOwnerMode]);

  // Fetch Featured Top Rated Stays
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await api.getFeatured(userLocation || {});
        setFeaturedProperties(data);
      } catch (err) {
        console.error('Failed to load featured properties:', err);
      }
    };
    loadFeatured();
  }, [userLocation]);

  // Fetch Filtered Properties
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProperties({
        category: category || undefined,
        gender: gender || undefined,
        search: searchQuery || undefined,
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        radius_km: radiusKm || undefined,
        sort_by: sortBy || undefined,
      });
      setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    } finally {
      setLoading(false);
    }
  }, [category, gender, searchQuery, userLocation, radiusKm, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProperties]);

  const handleSyncOsm = async () => {
    if (!userLocation) return;
    setSyncingOsm(true);
    try {
      await api.syncOsm(userLocation, radiusKm);
      fetchProperties();
    } catch (err) {
      console.error('Failed to sync OSM:', err);
    } finally {
      setSyncingOsm(false);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    if (userData.is_owner || userData.role === 'owner') {
      setIsOwnerMode(true);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    removeStoredUser();
    setUser(null);
    setIsOwnerMode(false);
  };

  const handleToggleOwnerMode = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsOwnerMode(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Universal Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        locationName={locationName}
        onDetectLocation={handleDetectLocation}
        onSelectCity={handleSelectCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOwnerMode={isOwnerMode}
        onToggleOwnerMode={handleToggleOwnerMode}
        onOpenHamburger={() => setIsHamburgerOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Hamburger Sliding Drawer (Slides from Left) */}
      <HamburgerDrawer
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        isOwnerMode={isOwnerMode}
        onToggleOwnerMode={handleToggleOwnerMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onSelectCategory={(cat) => setCategory(cat)}
        onNavigateHome={() => {
          setIsOwnerMode(false);
          setViewMode('grid');
        }}
        onNavigateMap={() => {
          setIsOwnerMode(false);
          setViewMode('map');
        }}
        ownerListingCount={ownerListingCount}
        inquiryCount={inquiryCount}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onProfileUpdated={(updatedUser) => {
          setUser(updatedUser);
        }}
      />

      {/* Settings Modal with Currency Selection */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        locationName={locationName}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        selectedCurrency={currency}
        onCurrencyChange={(newCurr) => setCurrency(newCurr)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {isOwnerMode ? (
          /* OWNER PORTAL DASHBOARD */
          <OwnerPortal
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            currency={currency}
          />
        ) : (
          /* TENANT / USER DISCOVERY VIEW */
          <>
            {/* Auto-Scrolling & Swipeable Top Rated Slider */}
            <TopRatedSlider
              properties={featuredProperties}
              onSelectProperty={(prop) => setSelectedProperty(prop)}
              currency={currency}
            />

            {/* Smart Commute Radar / Distance Calculator */}
            <DistanceCalculatorWidget userLocation={userLocation} />

            {/* Filters Bar with 1-Click Live Map Toggle */}
            <FilterBar
              category={category}
              onCategoryChange={setCategory}
              gender={gender}
              onGenderChange={setGender}
              radiusKm={radiusKm}
              onRadiusChange={setRadiusKm}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalResults={properties.length}
              userLocation={userLocation}
            />

            {/* Dynamic Content: Map View vs Grid Cards View */}
            {viewMode === 'map' ? (
              <LiveMap
                properties={properties}
                userLocation={userLocation}
                radiusKm={radiusKm}
                onSelectProperty={(prop) => setSelectedProperty(prop)}
                currency={currency}
              />
            ) : (
              <div>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-3xl h-80 animate-pulse p-4 border border-slate-200">
                        <div className="bg-slate-200 h-44 rounded-2xl mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : properties.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center my-8 border border-slate-200 shadow-sm max-w-xl mx-auto">
                    <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No properties found in this radius</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Try expanding the search radius slider or adjusting the demographic/category filters.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => {
                          setCategory('');
                          setGender('');
                          setSearchQuery('');
                          setRadiusKm(50);
                        }}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        Reset All Filters
                      </button>
                      <button
                        onClick={handleSyncOsm}
                        disabled={syncingOsm}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
                      >
                        {syncingOsm ? 'Discovering from OpenStreetMap...' : '🌐 Discover OpenStreetMap Places'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onSelect={(prop) => setSelectedProperty(prop)}
                        currency={currency}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          userLocation={userLocation}
          onClose={() => setSelectedProperty(null)}
          onInquirySubmitted={() => {
            fetchProperties();
          }}
          currency={currency}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-16 border-t border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-white">Perch</span>
            <span>• Smart Rent-House, PG & Hotel Discovery</span>
          </div>
          <div>
            Built with live GPS routing & OpenStreetMap geospatial verification
          </div>
        </div>
      </footer>

    </div>
  );
}
