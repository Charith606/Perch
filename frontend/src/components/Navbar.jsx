import React, { useState } from 'react';
import { 
  Home, 
  MapPin, 
  Navigation, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Compass, 
  Menu,
  Building2,
  Edit3,
  Settings
} from 'lucide-react';

export default function Navbar({ 
  user, 
  onOpenAuth, 
  onLogout, 
  locationName, 
  onDetectLocation, 
  onSelectCity,
  searchQuery,
  onSearchChange,
  isOwnerMode,
  onToggleOwnerMode,
  onOpenHamburger,
  onOpenEditProfile,
  onOpenSettings
}) {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const POPULAR_CITIES = [
    { name: 'Bangalore, KA', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad, TS', lat: 17.3850, lng: 78.4867 },
    { name: 'Mumbai, MH', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi NCR', lat: 28.6139, lng: 77.2090 },
    { name: 'Pune, MH', lat: 18.5204, lng: 73.8567 },
    { name: 'Chennai, TN', lat: 13.0827, lng: 80.2707 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Hamburger Button, Logo, and City Selector */}
          <div className="flex items-center gap-3">
            
            {/* Hamburger Button (Slides drawer from the left) */}
            <button
              onClick={onOpenHamburger}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-950 transition-all border border-slate-200/60 active:scale-95 flex items-center justify-center group"
              title="Open Navigation Menu"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5 group-hover:scale-105 transition-transform text-slate-800" />
            </button>

            {/* Perch Logo */}
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
                <Home className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                  Perch
                  <span className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">
                  Rent House • PG • Hotel
                </span>
              </div>
            </a>

            {/* Location Selector Pill */}
            <div className="relative ml-2 hidden md:block">
              <button 
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100/90 hover:bg-slate-200/80 rounded-full text-xs font-semibold text-slate-700 transition-colors border border-slate-200/60"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span className="max-w-[140px] truncate">{locationName || 'Select Location'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </button>

              {showLocationMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-2 border-b border-slate-100">
                    <button 
                      onClick={() => {
                        onDetectLocation();
                        setShowLocationMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Use Live GPS Location
                    </button>
                  </div>
                  <div className="py-1">
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Popular Indian Tech Hubs</p>
                    {POPULAR_CITIES.map(city => (
                      <button
                        key={city.name}
                        onClick={() => {
                          onSelectCity(city);
                          setShowLocationMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors"
                      >
                        <span>{city.name}</span>
                        <Compass className="w-3.5 h-3.5 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Search Input (Desktop) */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search area, Men's PG, 2BHK flat, hotel..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm text-slate-900 rounded-full border border-slate-200/80 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
              />
            </div>
          </div>

          {/* Right: User Profile Avatar & Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pl-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors border border-slate-200/80"
                >
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">{user.name}</span>
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.phone && <p className="text-[10px] text-slate-400 truncate">{user.phone}</p>}
                      <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700">
                        {isOwnerMode ? 'Owner Active' : 'User Active'}
                      </span>
                    </div>
                    
                    <div className="py-1">
                      {/* Edit Profile Option */}
                      <button
                        onClick={() => {
                          onOpenEditProfile();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          onToggleOwnerMode();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isOwnerMode ? 'Switch to User View' : 'Switch to Owner Mode'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenSettings();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-brand-600/20 hover:shadow-brand-600/30"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
            )}

          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search area, PG, 1BHK, hotel..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 focus:bg-white text-xs text-slate-900 rounded-full border border-slate-200 outline-none"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
