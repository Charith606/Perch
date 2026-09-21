import React from 'react';
import { 
  X, 
  Home, 
  Sparkles, 
  Map, 
  Building2, 
  MessageSquare, 
  PlusCircle, 
  Repeat, 
  Settings as SettingsIcon, 
  LogOut, 
  User as UserIcon, 
  HelpCircle, 
  ShieldCheck, 
  ChevronRight,
  Compass,
  Bell,
  Edit3
} from 'lucide-react';

export default function HamburgerDrawer({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onLogout,
  isOwnerMode,
  onToggleOwnerMode,
  onOpenSettings,
  onOpenEditProfile,
  onSelectCategory,
  onNavigateHome,
  onNavigateMap,
  ownerListingCount = 0,
  inquiryCount = 0
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel - SLIDING FROM THE LEFT */}
      <div className="absolute inset-y-0 left-0 max-w-full flex pr-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
          
          {/* Top Section: User Profile & Close button */}
          <div>
            <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                    P
                  </div>
                  <span className="text-xl font-black tracking-tight text-white">
                    Perch Menu
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card */}
              {user ? (
                <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700/80">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center font-bold text-base uppercase shadow-inner flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <button
                          onClick={() => {
                            onClose();
                            if (onOpenEditProfile) onOpenEditProfile();
                          }}
                          className="px-2 py-0.5 rounded-lg bg-slate-700 hover:bg-brand-600 text-slate-200 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      {user.phone && <p className="text-[11px] text-slate-400 truncate">{user.phone}</p>}
                      {user.address && (
                        <p className="text-[11px] text-brand-400 truncate mt-0.5">
                          📍 {user.address}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-500 text-slate-950 uppercase tracking-wider">
                          {isOwnerMode ? 'Owner Mode' : 'User Mode'}
                        </span>
                        {user.is_owner && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-200">
                            Verified Host
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700/80 text-center">
                  <p className="text-xs text-slate-300 mb-3">Sign in to save favorite stays and manage listings</p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
                  >
                    Log In / Create Account
                  </button>
                </div>
              )}
            </div>

            {/* Mode Switcher Banner inside Drawer */}
            <div className="p-4 bg-emerald-50/60 border-b border-emerald-100">
              <button
                onClick={() => {
                  onToggleOwnerMode();
                  onClose();
                }}
                className="w-full p-3 bg-white hover:bg-slate-50 border border-emerald-200 rounded-2xl shadow-sm flex items-center justify-between text-xs font-bold transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${isOwnerMode ? 'bg-slate-900 text-brand-400' : 'bg-emerald-100 text-emerald-700'}`}>
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-slate-900 font-extrabold">
                      {isOwnerMode ? 'Switch to User View' : 'Switch to Owner Mode'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {isOwnerMode ? 'Browse houses, PGs & hotels' : 'Manage your listed properties'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Navigation
              </p>

              <button
                onClick={() => {
                  onNavigateHome();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-brand-600" />
                  <span>Discover Stays (Home)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              <button
                onClick={() => {
                  onNavigateMap();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Live Map & Distance Radar</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {/* Owner Features: My Listings & Customer Messages */}
              <div className="pt-2">
                <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Owner Dashboard
                </p>

                <button
                  onClick={() => {
                    if (!isOwnerMode) onToggleOwnerMode();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>My Listings</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    {ownerListingCount} active
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (!isOwnerMode) onToggleOwnerMode();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span>Messages & Visits</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black">
                    {inquiryCount} new
                  </span>
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Settings & Logout */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-1">
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-white hover:shadow-sm transition-all"
            >
              <SettingsIcon className="w-4 h-4 text-slate-500" />
              <span>Settings & Preferences</span>
            </button>

            {user && (
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
