import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin, Sparkles, Navigation, Users, Video } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { isVideoUrl, getMediaUrl } from '../utils/media';

export default function TopRatedSlider({ properties = [], onSelectProperty, currency = 'INR' }) {
  const scrollContainerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll effect
  useEffect(() => {
    if (isHovered || !properties.length) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isHovered, properties.length]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!properties || properties.length === 0) return null;

  const getGenderBadge = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return { label: "Men's Only", color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'female':
        return { label: "Women's Only", color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'family':
        return { label: 'Family Friendly', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'unisex':
        return { label: 'Co-Living / Unisex', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'All Welcome', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  if (!properties || properties.length === 0) return null;

  return (
    <div className="relative py-6 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white overflow-hidden rounded-3xl my-6 shadow-2xl border border-slate-800">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header with Title & Navigation buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Trending & Top-Rated Stays
                </h2>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-500 text-slate-950 uppercase tracking-wider">
                  Live Feed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hand-picked top verified PGs, rental apartments & boutique hotels near you
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Swipeable / Auto-scrolling Cards Banner */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {properties.map((item) => {
            const genderBadge = getGenderBadge(item.gender_preference);
            const photoUrl = item.photos && item.photos.length > 0 ? item.photos[0] : null;

            return (
              <div
                key={item.id}
                onClick={() => onSelectProperty(item)}
                className="flex-shrink-0 w-80 sm:w-[320px] bg-slate-800/90 hover:bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/60 hover:border-brand-500/50 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-2xl hover:-translate-y-1 flex flex-col"
              >
                {/* Image & Badges */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  {isVideoUrl(photoUrl) ? (
                    <video
                      src={getMediaUrl(photoUrl)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      muted
                      autoPlay
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={getMediaUrl(photoUrl)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>

                  {/* Video Indicator */}
                  {isVideoUrl(photoUrl) && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider backdrop-blur-md">
                      <Video className="w-2.5 h-2.5 animate-pulse" />
                      Video
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-white border border-white/10">
                      {item.category.toUpperCase()}
                    </span>
                    {!isVideoUrl(photoUrl) && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>{item.rating || '4.8'}</span>
                      </div>
                    )}
                  </div>

                  {/* Gender / Demographic Badge & Distance */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md ${genderBadge.color}`}>
                      {genderBadge.label}
                    </span>

                    {item.distance_km !== null && item.distance_km !== undefined && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-500 text-slate-950">
                        <Navigation className="w-3 h-3" />
                        {item.distance_km} km away
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-brand-400 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{item.locality}, {item.city}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-tight">Starting from</span>
                      <span className="text-base font-extrabold text-brand-400">
                        {formatCurrency(item.price, currency)}
                        <span className="text-xs font-normal text-slate-400">
                          {item.category === 'hotel' ? '/night' : '/month'}
                        </span>
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white flex items-center gap-1">
                      View Details →
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
