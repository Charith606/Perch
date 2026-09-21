import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Bell, MapPin, Check, Save, Globe, Edit3, Sparkles } from 'lucide-react';
import { CURRENCIES } from '../utils/currency';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  user, 
  locationName, 
  onOpenEditProfile,
  selectedCurrency,
  onCurrencyChange
}) {
  const [currency, setCurrency] = useState(selectedCurrency || 'INR');
  const [notifications, setNotifications] = useState(true);
  const [autoLocation, setAutoLocation] = useState(true);
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Application Settings</h2>
              <p className="text-xs text-slate-500">Configure currency, location & notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Preferences saved successfully!</span>
            </div>
          )}

          {/* Account Profile Box with Edit Button */}
          {user && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
                <span className="text-[11px] text-slate-500">{user.email}</span>
                {user.phone && <span className="text-[11px] text-slate-500 block">{user.phone}</span>}
                {user.address && <span className="text-[11px] text-brand-700 block truncate max-w-xs mt-0.5">📍 {user.address}</span>}
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenEditProfile) onOpenEditProfile();
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-brand-700 flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}

          {/* Location-Aware Currency Setting */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-600" />
                <span>Currency (Location-Based Auto Detect)</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Auto-Selected</span>
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Display Currency</span>
                  <span className="text-[11px] text-slate-500">Auto-converts amounts based on your region</span>
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-white rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                >
                  {Object.values(CURRENCIES).map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.label} ({curr.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location & Distance Unit */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Location & Geo Distance</span>
            </h3>
            
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Auto-Detect GPS Location</span>
                  <span className="text-[11px] text-slate-500">Currently: {locationName}</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoLocation}
                  onChange={(e) => setAutoLocation(e.target.checked)}
                  className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span className="text-xs font-bold text-slate-800">Distance Unit</span>
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="px-2.5 py-1 text-xs font-bold bg-white rounded-lg border border-slate-200"
                >
                  <option value="km">Kilometers (km)</option>
                  <option value="miles">Miles (mi)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-brand-600" />
              <span>Alerts & Updates</span>
            </h3>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Instant Visit & Message Alerts</span>
                <span className="text-[11px] text-slate-500">Receive real-time notifications for responses</span>
              </div>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
