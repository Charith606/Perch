import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User, Building2, MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import { api, setAuthToken, setStoredUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('tenant'); // 'tenant' | 'owner'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
          alert('GPS location permission denied. You can manually enter your address.');
          setDetectingGps(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await api.login({ email, password });
      } else {
        res = await api.register({
          name,
          email,
          phone,
          address: address || undefined,
          password,
          is_owner: role === 'owner',
          role: role
        });
      }

      setAuthToken(res.access_token);
      setStoredUser(res.user);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoTenant = () => {
    setEmail('tenant@perchstay.com');
    setPassword('tenant123');
    setMode('login');
  };

  const handleDemoOwner = () => {
    setEmail('owner@perchstay.com');
    setPassword('owner123');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {mode === 'login' ? 'Welcome to Perch' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login' ? 'Sign in to access your saved places and inquiries' : 'Join thousands discovering & listing rental properties'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Logins Banner */}
        <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-100 flex items-center justify-between text-[11px]">
          <span className="font-bold text-emerald-800">Quick Demo Access:</span>
          <div className="flex gap-2">
            <button
              onClick={handleDemoTenant}
              className="px-2 py-0.5 bg-white border border-emerald-300 rounded font-bold text-emerald-700 hover:bg-emerald-100"
            >
              Demo User
            </button>
            <button
              onClick={handleDemoOwner}
              className="px-2 py-0.5 bg-slate-900 text-white rounded font-bold hover:bg-slate-800"
            >
              Demo Owner
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Role selector on Register */}
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">I am registering as:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 ${
                    role === 'tenant' ? 'bg-brand-50 border-brand-500 text-brand-700' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Tenant / User</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 ${
                    role === 'owner' ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Property Owner</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Email ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Address with Live Location Permission (Sign up) */}
          {mode === 'register' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-600">Your Location / Address</label>
                <button
                  type="button"
                  onClick={handleDetectAddress}
                  disabled={detectingGps}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3 text-brand-600 animate-pulse" />
                  <span>{detectingGps ? 'Detecting Location...' : '📍 Use Live GPS Location'}</span>
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Koramangala, Bangalore"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-brand-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/20"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          {/* Toggle Login/Register */}
          <div className="text-center pt-2">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-brand-600 font-bold hover:underline"
                >
                  Sign Up Here
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-brand-600 font-bold hover:underline"
                >
                  Log In Here
                </button>
              </p>
            )}
          </div>
        </form>

      </div>

    </div>
  );
}
