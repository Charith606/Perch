import React, { useState } from 'react';
import { Compass, Navigation, MapPin, Clock, Car, Bike, Footprints, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function DistanceCalculatorWidget({ userLocation }) {
  const [destQuery, setDestQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);

  const calculateCommute = async (e) => {
    e.preventDefault();
    if (!destQuery.trim() || !userLocation) return;

    setSearching(true);
    try {
      const geocoded = await api.geocode(destQuery);
      if (geocoded && geocoded.length > 0) {
        const dest = geocoded[0];
        
        // Haversine formula client-side
        const R = 6371.0;
        const dLat = (dest.latitude - userLocation.lat) * (Math.PI / 180);
        const dLon = (dest.longitude - userLocation.lng) * (Math.PI / 180);
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLocation.lat * (Math.PI / 180)) * Math.cos(dest.latitude * (Math.PI / 180)) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Math.round(R * c * 10) / 10;

        // Estimated commute times
        const bikeMins = Math.round(distanceKm * 2.8);
        const carMins = Math.round(distanceKm * 3.5);
        const walkMins = Math.round(distanceKm * 12);

        setResult({
          destinationName: dest.display_name,
          distanceKm,
          bikeMins,
          carMins,
          walkMins
        });
      } else {
        alert('Could not locate landmark. Try "Manyata Tech Park" or "Indiranagar Metro"');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl my-6 border border-emerald-900/40 relative overflow-hidden">
      <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-brand-500 text-slate-950">
            Smart Commute Radar
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
          Calculate Exact Distance to your Office or College
        </h3>
        <p className="text-xs text-slate-400 mb-5 max-w-2xl">
          Enter your workplace, tech park, or university to instantly check road distance and estimated commute times from surrounding rental houses & PGs.
        </p>

        <form onSubmit={calculateCommute} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Ecospace Bellandur, IIT Madras, Mindspace Hitec..."
              value={destQuery}
              onChange={(e) => setDestQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/90 text-xs font-medium rounded-2xl border border-slate-700 text-white placeholder-slate-400 outline-none focus:border-brand-400"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md shadow-brand-500/20 whitespace-nowrap"
          >
            {searching ? 'Computing Distance...' : 'Calculate Distance'}
          </button>
        </form>

        {result && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">Target Location:</p>
                <p className="text-xs font-bold text-white line-clamp-1">{result.destinationName}</p>
                <p className="text-base font-black text-brand-400 mt-1">
                  📍 {result.distanceKm} km away from your search pin
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-2">
                  <Bike className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Two Wheeler</span>
                    <span className="font-bold text-white">~{result.bikeMins} mins</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cab / Car</span>
                    <span className="font-bold text-white">~{result.carMins} mins</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Walking</span>
                    <span className="font-bold text-white">~{result.walkMins} mins</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
