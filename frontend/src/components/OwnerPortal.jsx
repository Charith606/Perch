import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Home, 
  BedDouble, 
  Hotel, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Check, 
  X,
  Search,
  Navigation,
  Camera,
  Video,
  UploadCloud,
  Play,
  Film,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { isVideoUrl, getMediaUrl } from '../utils/media';
import CameraCaptureModal from './CameraCaptureModal';
import MediaLightboxModal from './MediaLightboxModal';

const AMENITY_OPTIONS = [
  'High-Speed WiFi',
  '3 Meals Daily',
  'Air Conditioning',
  'Power Backup',
  'Washing Machine',
  'Geyser / Hot Water',
  'Daily Housekeeping',
  'CCTV & Security Guard',
  'Attached Bathroom',
  'Covered Parking',
  'Elevator / Lift',
  'Refrigerator',
  'Gym & Fitness',
  'Swimming Pool',
  'RO Drinking Water',
  'Smart TV',
  'Balcony'
];

export default function OwnerPortal({ user, onOpenAuth, currency = 'INR' }) {
  const [activeTab, setActiveTab] = useState('properties'); // 'properties' | 'inquiries'
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pg',
    gender_preference: 'male',
    address: '',
    locality: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '',
    latitude: 12.9716,
    longitude: 77.5946,
    price: 12000,
    deposit: 24000,
    maintenance_charges: 0,
    food_included: true,
    electricity_charges: 'Included',
    property_size_sqft: 250,
    bedrooms_or_sharing: '2 Sharing',
    bathrooms: 1,
    furnishing: 'Furnished',
    amenities: ['High-Speed WiFi', 'Power Backup'],
    photos: [],
    photoInput: '',
    rules: ['No smoking in rooms', 'Gate closes at 11:00 PM'],
    ruleInput: '',
    contact_name: user?.name || '',
    contact_phone: user?.phone || '',
    contact_email: user?.email || '',
  });

  const [geocoding, setGeocoding] = useState(false);
  const [lightboxState, setLightboxState] = useState({ isOpen: false, index: 0, mediaList: [] });

  useEffect(() => {
    if (user) {
      fetchOwnerData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const [propsRes, inqRes] = await Promise.all([
        api.getMyProperties().catch(() => []),
        api.getOwnerInquiries().catch(() => [])
      ]);
      setProperties(propsRes);
      setInquiries(inqRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.toggleStatus(id);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, is_available: !p.is_available } : p));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing?')) return;
    try {
      await api.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const fileInputRef = useRef(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraModalMode, setCameraModalMode] = useState('photo'); // 'photo' | 'video'

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, reader.result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCameraCapture = (mediaUrl) => {
    if (mediaUrl) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, mediaUrl]
      }));
    }
  };

  const handleAddPhoto = () => {
    if (!formData.photoInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, prev.photoInput.trim()],
      photoInput: ''
    }));
  };

  const handleRemovePhoto = (idx) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    }));
  };

  const handleAddRule = () => {
    if (!formData.ruleInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, prev.ruleInput.trim()],
      ruleInput: ''
    }));
  };

  const handleAutoGeocode = async () => {
    const fullQuery = `${formData.address}, ${formData.locality}, ${formData.city}`;
    if (!formData.locality && !formData.city) return;
    setGeocoding(true);
    try {
      const results = await api.geocode(fullQuery);
      if (results && results.length > 0) {
        setFormData(prev => ({
          ...prev,
          latitude: results[0].latitude,
          longitude: results[0].longitude
        }));
        alert(`Location coordinates resolved: ${results[0].latitude.toFixed(4)}, ${results[0].longitude.toFixed(4)}`);
      } else {
        alert('Could not auto-detect coordinates for this address. You can keep default coords or refine address.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmitProperty = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await api.createProperty({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        gender_preference: formData.gender_preference,
        address: formData.address,
        locality: formData.locality,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        price: parseFloat(formData.price),
        deposit: parseFloat(formData.deposit || 0),
        maintenance_charges: parseFloat(formData.maintenance_charges || 0),
        food_included: Boolean(formData.food_included),
        electricity_charges: formData.electricity_charges,
        property_size_sqft: parseInt(formData.property_size_sqft || 300),
        bedrooms_or_sharing: formData.bedrooms_or_sharing,
        bathrooms: parseInt(formData.bathrooms || 1),
        furnishing: formData.furnishing,
        amenities: formData.amenities,
        photos: formData.photos,
        rules: formData.rules,
        is_available: true,
        is_featured: true,
        contact_name: formData.contact_name || user?.name,
        contact_phone: formData.contact_phone || user?.phone,
        contact_email: formData.contact_email || user?.email,
      });

      setSuccessMsg('Property successfully listed on Perch!');
      setShowAddModal(false);
      fetchOwnerData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center max-w-lg mx-auto my-12 border border-slate-200 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Perch Owner Portal</h2>
        <p className="text-xs text-slate-500 mb-6">
          List your PG, Flat, House, or Hotel and connect directly with thousands of verified tenants with 0% brokerage.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-brand-600/20"
        >
          Sign In as Owner
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-brand-500 text-slate-950">
              Owner Management Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Manage your property listings, adjust pricing & availability, and track incoming tenant inquiries in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-400 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-lg shadow-brand-500/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add New Property</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs (Properties vs Inquiries) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'properties'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>My Listings ({properties.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inquiries'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Messages & Visits ({inquiries.length})</span>
        </button>
      </div>

      {/* Listings Tab */}
      {activeTab === 'properties' && (
        <div>
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading listings...</div>
          ) : properties.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No properties listed yet</h3>
              <p className="text-xs text-slate-400 mb-4">Click below to publish your first PG, Flat or Hotel listing.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl"
              >
                + Add Property
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="relative h-44 w-full bg-slate-100">
                      <img
                        src={prop.photos && prop.photos[0] ? prop.photos[0] : ''}
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-900 text-white">
                        {prop.category}
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prop.is_available ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {prop.is_available ? 'Available' : 'Rented Out'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{prop.title}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{prop.locality}, {prop.city}</p>
                      
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Rent</span>
                          <span className="font-extrabold text-slate-900">{formatCurrency(prop.price, currency)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Demographic</span>
                          <span className="font-bold text-brand-700 capitalize">{prop.gender_preference}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Type</span>
                          <span className="font-bold text-slate-700">{prop.bedrooms_or_sharing}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStatus(prop.id)}
                      className="text-xs font-bold text-slate-700 hover:text-brand-600 flex items-center gap-1.5"
                    >
                      {prop.is_available ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                      <span>{prop.is_available ? 'Mark Rented' : 'Mark Available'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(prop.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inquiries Tab */}
      {activeTab === 'inquiries' && (
        <div>
          {inquiries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No messages or visit requests yet</h3>
              <p className="text-xs text-slate-400">When interested renters send a message or request a walkthrough visit, their details will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900">{inq.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-brand-700 mb-1">Property: {inq.property_title}</p>
                    <p className="text-xs text-slate-600 italic">"{inq.message}"</p>
                    {inq.preferred_visit_date && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        📅 Preferred Visit: <span className="font-bold text-slate-800">{inq.preferred_visit_date}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`tel:${inq.phone}`}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{inq.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(inq.name)},%20I%20received%20your%20inquiry%20on%20Perch.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD PROPERTY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 max-h-[92vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-600" />
                <span>List a New Property / PG / Hotel</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProperty} className="overflow-y-auto p-6 space-y-5 flex-1">
              {error && <p className="text-xs font-bold text-red-600">{error}</p>}

              {/* Basic Details */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">1. Property Overview</h3>
                
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Listing Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Palms Executive Men's PG near Tech Park"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                    >
                      <option value="pg">PG / Co-Living Hostels</option>
                      <option value="house">Rent House / Flat / Apartment</option>
                      <option value="hotel">Hotel / Serviced Suites</option>
                      <option value="villa">Villa / Independent House</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Occupant / Gender *</label>
                    <select
                      value={formData.gender_preference}
                      onChange={(e) => setFormData({ ...formData, gender_preference: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                    >
                      <option value="male">Men Only (Male PG)</option>
                      <option value="female">Women Only (Female PG)</option>
                      <option value="family">Family Preferred</option>
                      <option value="unisex">Co-Living / Unisex</option>
                      <option value="all">All Welcome</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Description *</label>
                  <textarea
                    rows="3"
                    placeholder="Describe room amenities, food menu, proximity to offices/metro..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>

              {/* Location Details with Auto-Geocoding */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">2. Location & Live Coordinates</h3>
                  <button
                    type="button"
                    onClick={handleAutoGeocode}
                    disabled={geocoding}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{geocoding ? 'Detecting Pin...' : 'Auto-Resolve GPS Coords'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Street Address *</label>
                    <input
                      type="text"
                      placeholder="e.g. 100 Feet Rd, HAL 2nd Stage"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Locality / Area *</label>
                    <input
                      type="text"
                      placeholder="e.g. Indiranagar"
                      value={formData.locality}
                      onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Terms */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">3. Pricing, Food & Sharing</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹ / Month or Night) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Security Deposit (₹)</label>
                    <input
                      type="number"
                      value={formData.deposit}
                      onChange={(e) => setFormData({ ...formData, deposit: parseFloat(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Room / Sharing Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Single Room, 2 Sharing, 2 BHK"
                      value={formData.bedrooms_or_sharing}
                      onChange={(e) => setFormData({ ...formData, bedrooms_or_sharing: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="food_inc"
                      checked={formData.food_included}
                      onChange={(e) => setFormData({ ...formData, food_included: e.target.checked })}
                      className="w-4 h-4 accent-brand-600 rounded"
                    />
                    <label htmlFor="food_inc" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Food / 3 Meals Included in Rent
                    </label>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Electricity Charges</label>
                    <input
                      type="text"
                      value={formData.electricity_charges}
                      onChange={(e) => setFormData({ ...formData, electricity_charges: e.target.value })}
                      placeholder="e.g. Included / As per meter"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities Selection */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">4. Select Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const isChecked = formData.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`p-2 rounded-xl text-left text-xs font-semibold border flex items-center gap-2 transition-all ${
                          isChecked 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center ${
                          isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo & Video Walkthrough Media */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-brand-600" />
                      <span>5. Photos & Walkthrough Videos</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Upload pictures and room walkthrough videos to attract 5x more tenants.
                    </p>
                  </div>

                  {/* Hidden Device File Picker */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Action Buttons for Media */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-sm"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-brand-600" />
                      <span>Upload from Device</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCameraModalMode('photo');
                        setShowCameraModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-brand-200 shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCameraModalMode('video');
                        setShowCameraModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200 shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Record Video</span>
                    </button>
                  </div>
                </div>

                {/* Paste Web Link Input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste direct image / video link (e.g. https://...)"
                    value={formData.photoInput}
                    onChange={(e) => setFormData({ ...formData, photoInput: e.target.value })}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    Add Link
                  </button>
                </div>

                {/* Media Showcase Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                  {formData.photos.map((item, idx) => {
                    const isVideo = isVideoUrl(item);
                    return (
                      <div 
                        key={idx} 
                        onClick={() => setLightboxState({ isOpen: true, index: idx, mediaList: formData.photos })}
                        className="relative h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 group shadow-sm cursor-pointer hover:border-brand-500 transition-all"
                        title="Click to view full uncropped media"
                      >
                        {isVideo ? (
                          <div className="w-full h-full relative flex items-center justify-center">
                            <video src={getMediaUrl(item)} className="w-full h-full object-contain" muted />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              </div>
                            </div>
                            <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-rose-600/90 text-white text-[9px] font-black uppercase">
                              Video
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900">
                            <img src={getMediaUrl(item)} alt="" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <span className="px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                                <Eye className="w-3 h-3" /> View Full
                              </span>
                            </div>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(idx);
                          }}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs shadow-md z-10"
                          title="Remove media"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Owner Contact Details */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">6. Owner / Manager Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Host / Owner Name *</label>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Direct Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email ID</label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/20"
                >
                  {saving ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Camera & Video Capture Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        mode={cameraModalMode}
        onClose={() => setShowCameraModal(false)}
        onCaptureComplete={handleCameraCapture}
      />

      {/* Full-Screen Media Lightbox Modal for Uncropped Viewing */}
      <MediaLightboxModal
        isOpen={lightboxState.isOpen}
        mediaList={lightboxState.mediaList}
        initialIndex={lightboxState.index}
        onClose={() => setLightboxState({ isOpen: false, index: 0, mediaList: [] })}
      />

    </div>
  );
}
