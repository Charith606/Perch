import React, { useState } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Navigation, 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Check, 
  Info, 
  Home, 
  Users, 
  Zap, 
  Utensils, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { isVideoUrl, getMediaUrl } from '../utils/media';
import MediaLightboxModal from './MediaLightboxModal';

export default function PropertyDetailModal({ property, onClose, userLocation, onInquirySubmitted, currency = 'INR' }) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryDate, setInquiryDate] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('Hi, I am interested in this property and would like to schedule a visit.');
  const [submitting, setSubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [error, setError] = useState('');

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  if (!property) return null;

  const photos = property.photos && property.photos.length > 0
    ? property.photos
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'];

  const getGenderBadge = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return { label: "Men's Only Accommodation", color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'female':
        return { label: "Women's Only Accommodation", color: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'family':
        return { label: 'Family Only (Working Professionals)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'unisex':
        return { label: 'Co-Living / Unisex Stay', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      default:
        return { label: 'All Occupants Welcome', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  const genderBadge = getGenderBadge(property.gender_preference);

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryPhone) {
      setError('Please fill in your name, email and phone number');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.submitInquiry({
        property_id: property.id,
        name: inquiryName,
        email: inquiryEmail,
        phone: inquiryPhone,
        message: inquiryMsg,
        preferred_visit_date: inquiryDate || null
      });
      setInquirySuccess(true);
      if (onInquirySubmitted) onInquirySubmitted();
    } catch (err) {
      setError(err.message || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.addReview(property.id, {
        property_id: property.id,
        rating: reviewRating,
        comment: reviewComment,
        user_name: inquiryName || 'Verified Guest'
      });
      setReviewSuccess(true);
      setReviewComment('');
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const cleanPhone = (property.contact_phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(property.contact_name || 'Owner')},%20I%20saw%20your%20property%20listing%20"${encodeURIComponent(property.title)}"%20on%20Perch%20and%20wanted%20more%20details.`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-slate-900 text-white">
              {property.category}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${genderBadge.color}`}>
              {genderBadge.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          
          {/* Photo & Video Showcase Carousel */}
          <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-950 group flex items-center justify-center">
            {isVideoUrl(photos[activePhotoIdx]) ? (
              <video
                src={getMediaUrl(photos[activePhotoIdx])}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={getMediaUrl(photos[activePhotoIdx])}
                alt={property.title}
                onClick={() => setShowLightbox(true)}
                className="w-full h-full object-contain cursor-pointer"
              />
            )}
            
            {/* Top Right Controls & Video Tag */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {isVideoUrl(photos[activePhotoIdx]) && (
                <div className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase flex items-center gap-1 shadow-lg pointer-events-none">
                  <span>🎥 Walkthrough Video</span>
                </div>
              )}
              <button
                onClick={() => setShowLightbox(true)}
                className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition-all shadow-md"
                title="View Full Resolution Uncropped"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full View</span>
              </button>
            </div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev + 1) % photos.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === activePhotoIdx ? 'bg-white w-5' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Title & Distance Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {property.title}
              </h1>
              <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span>{property.address}, {property.locality}, {property.city}</span>
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-brand-50 p-4 rounded-2xl border border-brand-200/60 flex items-center justify-between md:flex-col md:items-end gap-1">
              <span className="text-xs font-bold text-brand-900 uppercase">
                {property.category === 'hotel' ? 'Nightly Rate' : 'Monthly Rent'}
              </span>
              <span className="text-2xl font-black text-brand-700">
                {formatCurrency(property.price, currency)}
              </span>
              {property.deposit > 0 && (
                <span className="text-xs text-brand-800">
                  Deposit: {formatCurrency(property.deposit, currency)}
                </span>
              )}
            </div>
          </div>

          {/* Real-time Distance & Directions */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 text-slate-950 flex items-center justify-center font-black">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Distance from your detected location</span>
                <span className="text-base font-extrabold text-white">
                  {property.distance_km !== null && property.distance_km !== undefined 
                    ? `${property.distance_km} km away` 
                    : 'Coordinates: ' + property.latitude.toFixed(4) + ', ' + property.longitude.toFixed(4)}
                </span>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              <span>Get Live Directions</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Bedrooms / Sharing</span>
              <span className="text-sm font-black text-slate-800">{property.bedrooms_or_sharing || '1 BHK'}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Furnishing</span>
              <span className="text-sm font-black text-slate-800">{property.furnishing || 'Furnished'}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Food Included</span>
              <span className="text-sm font-black text-slate-800">{property.food_included ? 'Yes (3 Meals)' : 'Self / Nearby'}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Electricity</span>
              <span className="text-sm font-black text-slate-800">{property.electricity_charges || 'Included'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
              About This Property
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Checklist */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Amenities & Facilities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {property.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* House Rules */}
          {property.rules && property.rules.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Property Rules & Guidelines
              </h3>
              <ul className="space-y-1.5">
                {property.rules.map((rule, idx) => (
                  <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-brand-600 font-bold">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verified Owner Card & Direct Action Buttons */}
          <div className="bg-gradient-to-tr from-slate-50 to-emerald-50/50 p-5 rounded-3xl border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-slate-900">
                    {property.contact_name || property.owner_name || 'Verified Property Host'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Verified Owner
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Direct contact with zero brokerage / hidden fees
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {property.contact_phone && (
                <>
                  <a
                    href={`tel:${property.contact_phone}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Now</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Message / Visit Request Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Message the Owner / Request a Visit</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Send a direct message or request a convenient time to visit the place in person.
            </p>

            {inquirySuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Message sent successfully! The owner will reach out via call or WhatsApp.</span>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                {error && <p className="text-xs font-bold text-red-600">{error}</p>}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9876543210"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Preferred Visit Date</label>
                    <input
                      type="date"
                      value={inquiryDate}
                      onChange={(e) => setInquiryDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Message</label>
                    <input
                      type="text"
                      value={inquiryMsg}
                      onChange={(e) => setInquiryMsg(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending Request...' : 'Send Inquiry to Owner'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Rating & Review Section */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Leave a Rating & Review
            </h3>
            {reviewSuccess ? (
              <p className="text-xs font-bold text-emerald-700">Thank you for rating this property!</p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Your Rating:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Share your experience (cleanliness, food, location, safety)..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows="2"
                  className="w-full p-3 text-xs rounded-xl bg-white border border-slate-200 focus:border-brand-500 outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

      {/* Lightbox for Full Resolution Viewing */}
      <MediaLightboxModal
        isOpen={showLightbox}
        mediaList={photos}
        initialIndex={activePhotoIdx}
        title={property.title}
        onClose={() => setShowLightbox(false)}
      />

    </div>
  );
}
