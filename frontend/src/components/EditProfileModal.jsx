import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Mail, Lock, Check, Navigation, Save } from 'lucide-react';
import { api, setStoredUser } from '../services/api';

export default function EditProfileModal({ isOpen, onClose, user, onProfileUpdated }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleDetectAddress = () => {
    if ('geolocation' in navigator) {
      setDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await api.geocode(`${latitude}, ${longitude}`);
            if (res && res.length > 0) {
              setAddress(res[0].display_name || `${res[0].locality}, ${res[0].city}`);
            } else {
              setAddress(`Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            }
          } catch (e) {
            console.error(e);
          } finally {
            setDetectingGps(false);
          }
        },
        (err) => {
          alert('GPS location access denied or unavailable.');
          setDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Name and Phone number are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim()
      });

      setStoredUser(updated);
      setSuccess(true);
      if (onProfileUpdated) onProfileUpdated(updated);

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-100 text-brand-700 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Edit Profile</h2>
              <p className="text-xs text-slate-500">Update your name, phone, and address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Email (Read Only) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600">Email Address</label>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Cannot be changed</span>
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-500 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                placeholder="Your Full Name"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          {/* Address with Live GPS Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-600">Home / Current Address</label>
              <button
                type="button"
                onClick={handleDetectAddress}
                disabled={detectingGps}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Navigation className="w-3 h-3 text-brand-600 animate-pulse" />
                <span>{detectingGps ? 'Detecting...' : 'Use Live GPS'}</span>
              </button>
            </div>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                placeholder="e.g. 5th Cross, Indiranagar, Bangalore"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
