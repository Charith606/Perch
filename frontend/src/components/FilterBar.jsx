import React from 'react';
import { 
  Building2, 
  Home, 
  Hotel, 
  BedDouble, 
  Users, 
  UserCheck, 
  Sparkles, 
  SlidersHorizontal,
  Map,
  LayoutGrid,
  ArrowUpDown,
  Navigation,
  Check
} from 'lucide-react';

export default function FilterBar({
  category,
  onCategoryChange,
  gender,
  onGenderChange,
  radiusKm,
  onRadiusChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalResults = 0,
  userLocation
}) {
  const CATEGORIES = [
    { id: 'all', label: 'All Stays', icon: Sparkles },
    { id: 'house', label: 'Houses & Flats', icon: Home },
    { id: 'pg', label: "PG & Co-Living", icon: BedDouble },
    { id: 'hotel', label: 'Hotels & Suites', icon: Hotel },
    { id: 'villa', label: 'Villas', icon: Building2 },
  ];

  const GENDER_OPTIONS = [
    { id: 'all', label: 'All Occupants', badge: 'Everyone' },
    { id: 'male', label: "Men's Only PG/Flat", badge: "Men" },
    { id: 'female', label: "Women's Only PG/Flat", badge: "Women" },
    { id: 'family', label: 'Family Preferred', badge: "Family" },
    { id: 'unisex', label: 'Co-Ed / Unisex', badge: "Co-Ed" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm my-4 space-y-4">
      
      {/* Top Row: Categories Tabs & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id || (!category && cat.id === 'all');
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id === 'all' ? '' : cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                    : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Single 1-Click Live Map Toggle Button */}
        <div className="flex items-center self-end md:self-auto">
          <button
            onClick={() => onViewModeChange(viewMode === 'map' ? 'grid' : 'map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm active:scale-95 ${
              viewMode === 'map'
                ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/20 ring-2 ring-brand-500/20'
                : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
            }`}
            title={viewMode === 'map' ? 'Click to turn off map view' : 'Click to view properties on live map'}
          >
            <Map className={`w-4 h-4 ${viewMode === 'map' ? 'text-white animate-pulse' : 'text-brand-600'}`} />
            <span>{viewMode === 'map' ? 'Hide Map' : 'Live Map'}</span>
            {viewMode === 'map' && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            )}
          </button>
        </div>

      </div>

      {/* Middle Row: Gender & Demographic Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Target Occupant / Preference:
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {GENDER_OPTIONS.map((g) => {
              const isSelected = (gender === g.id) || (!gender && g.id === 'all');
              return (
                <button
                  key={g.id}
                  onClick={() => onGenderChange(g.id === 'all' ? '' : g.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-end">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/80 border-none rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
          >
            <option value="recommended">⭐ Top Recommended</option>
            {userLocation && <option value="distance">📍 Closest Distance First</option>}
            <option value="price_asc">💵 Price: Low to High</option>
            <option value="price_desc">💎 Price: High to Low</option>
            <option value="rating">✨ Highest Rated</option>
            <option value="newest">🆕 Recently Added</option>
          </select>
        </div>

      </div>

      {/* Bottom Row: Radius Slider (Live Location Distance Filter) */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="flex items-center gap-1.5 text-brand-700 font-bold flex-shrink-0">
            <Navigation className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
            <span>Search Radius:</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={radiusKm || 25}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            className="w-full accent-brand-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="px-2 py-0.5 rounded-md bg-brand-100 text-brand-800 font-black text-xs min-w-[55px] text-center">
            {radiusKm || 25} km
          </span>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{totalResults}</span> verified {totalResults === 1 ? 'place' : 'places'}
        </div>
      </div>

    </div>
  );
}
