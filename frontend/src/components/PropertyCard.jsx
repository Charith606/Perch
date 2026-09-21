import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Navigation, 
  Phone, 
  MessageCircle, 
  Check, 
  ShieldCheck, 
  Utensils, 
  Wifi, 
  Wind, 
  Zap,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Video
} from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { isVideoUrl, getMediaUrl } from '../utils/media';

export default function PropertyCard({ property, onSelect, onContact, currency = 'INR' }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = property.photos && property.photos.length > 0 
    ? property.photos 
    : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'];

  const getGenderBadge = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return { label: "Men's Only", color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'female':
        return { label: "Women's Only", color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'family':
        return { label: 'Family Only', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'unisex':
        return { label: 'Co-Living / Unisex', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'All Welcome', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const nextPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const genderBadge = getGenderBadge(property.gender_preference);

  return (
    <div 
      onClick={() => onSelect(property)}
      className="bg-white rounded-3xl border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
    >
      
      {/* Card Image / Video Gallery */}
      <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
        {isVideoUrl(photos[photoIndex]) ? (
          <video
            src={getMediaUrl(photos[photoIndex])}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={getMediaUrl(photos[photoIndex])}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        {/* Video Indicator Badge */}
        {isVideoUrl(photos[photoIndex]) && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md pointer-events-none">
            <Video className="w-3 h-3 animate-pulse" />
            Walkthrough Video
          </div>
        )}

        {/* Dark gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/85 backdrop-blur-md text-white border border-white/10 shadow-sm">
              {property.category}
            </span>
            {property.is_featured && (
              <span className="px-2 py-1 rounded-full text-[10px] font-extrabold uppercase bg-brand-500 text-slate-950 shadow-sm">
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-900 font-extrabold text-xs shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{property.rating || '4.8'}</span>
            <span className="text-[10px] text-slate-400">({property.total_reviews || 0})</span>
          </div>
        </div>

        {/* Prev / Next photo controls on hover */}
        {photos.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevPhoto}
              className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPhoto}
              className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Photo dots */}
        {photos.length > 1 && (
          <div className="absolute bottom-2.5 right-3 flex items-center gap-1 pointer-events-none">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === photoIndex ? 'bg-white w-3.5' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Distance Indicator (Live Location) */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
          {property.distance_km !== null && property.distance_km !== undefined ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-brand-500 text-slate-950 shadow-md">
              <Navigation className="w-3 h-3" />
              {property.distance_km} km away
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-slate-200">
              {property.locality}
            </span>
          )}
        </div>

      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        
        {/* Title and Address */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${genderBadge.color}`}>
              {genderBadge.label}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              • {property.bedrooms_or_sharing}
            </span>
            {property.furnishing && (
              <span className="text-[11px] font-semibold text-slate-400">
                • {property.furnishing}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {property.title}
          </h3>

          <p className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{property.address}, {property.city}</span>
          </p>
        </div>

        {/* Amenities Highlights */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {property.amenities.slice(0, 3).map((amenity, idx) => (
              <span 
                key={idx} 
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-medium flex items-center gap-1"
              >
                <Check className="w-2.5 h-2.5 text-brand-600" />
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Pricing & Direct Owner Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">
              {property.category === 'hotel' ? 'Tariff' : 'Monthly Rent'}
            </div>
            <div className="text-lg font-black text-slate-900 flex items-baseline gap-1">
              {formatCurrency(property.price, currency)}
              <span className="text-xs font-medium text-slate-500">
                {property.category === 'hotel' ? '/ night' : '/ mo'}
              </span>
            </div>
            {property.deposit > 0 && (
              <div className="text-[10px] text-slate-400">
                Deposit: {formatCurrency(property.deposit, currency)}
              </div>
            )}
          </div>

          {/* Quick Contact Buttons */}
          <div className="flex items-center gap-1.5">
            {property.contact_phone && (
              <a
                href={`tel:${property.contact_phone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 transition-colors border border-slate-200"
                title={`Call ${property.contact_name || 'Owner'}`}
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(property);
              }}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/20 active:scale-95"
            >
              Details
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
