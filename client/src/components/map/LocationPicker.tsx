import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useI18n } from '@/i18n';

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude = 47.9184,
  longitude = 106.9177,
  onChange,
}) => {
  const { t } = useI18n();
  const [lat, setLat] = useState<number>(latitude);
  const [lng, setLng] = useState<number>(longitude);

  const handleLatChange = (newLat: number) => {
    setLat(newLat);
    onChange(newLat, lng);
  };

  const handleLngChange = (newLng: number) => {
    setLng(newLng);
    onChange(lat, newLng);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const currentLat = Number(pos.coords.latitude.toFixed(6));
        const currentLng = Number(pos.coords.longitude.toFixed(6));
        setLat(currentLat);
        setLng(currentLng);
        onChange(currentLat, currentLng);
      });
    }
  };

  // Quick preset coordinates for UB 9 districts
  const districtPresets = [
    { name: 'Хан-Уул', lat: 47.8864, lng: 106.9056 },
    { name: 'Сүхбаатар', lat: 47.9250, lng: 106.9200 },
    { name: 'Баянзүрх', lat: 47.9150, lng: 106.9600 },
    { name: 'Баянгол', lat: 47.9120, lng: 106.8700 },
    { name: 'Чингэлтэй', lat: 47.9350, lng: 106.9100 },
    { name: 'Сонгинохайрхан', lat: 47.9100, lng: 106.7800 },
  ];

  return (
    <div className="space-y-4 glass-card p-5 rounded-2xl border border-white/10">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-starlight flex items-center">
          <MapPin size={18} className="mr-2 text-plasma" />
          <span>{t.map.selectLocation}</span>
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-xs flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-plasma/20 text-plasma hover:bg-plasma/30 transition-colors"
        >
          <Navigation size={12} />
          <span>Миний байршил</span>
        </button>
      </div>

      <p className="text-xs text-nebula-text">{t.map.mapHint}</p>

      {/* Preset district location selector buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        {districtPresets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => {
              setLat(preset.lat);
              setLng(preset.lng);
              onChange(preset.lat, preset.lng);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
              Math.abs(lat - preset.lat) < 0.01 && Math.abs(lng - preset.lng) < 0.01
                ? 'bg-plasma text-white border-plasma shadow-md shadow-plasma/30'
                : 'bg-void/50 text-nebula-text border-white/10 hover:border-plasma hover:text-white'
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Latitude / Longitude Manual Coordinate Inputs */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-medium text-nebula-text mb-1">{t.map.lat}</label>
          <input
            type="number"
            step="0.0001"
            value={lat}
            onChange={(e) => handleLatChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-plasma"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-nebula-text mb-1">{t.map.lng}</label>
          <input
            type="number"
            step="0.0001"
            value={lng}
            onChange={(e) => handleLngChange(parseFloat(e.target.value) || 0)}
            className="w-full bg-void/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-plasma"
          />
        </div>
      </div>

      {/* Interactive Location Preview */}
      <div className="h-40 rounded-xl overflow-hidden relative border border-white/10 bg-[#0a0a14] flex items-center justify-center">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6c5ce7_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col items-center text-center p-3">
          <div className="w-10 h-10 rounded-full bg-plasma/20 border border-plasma flex items-center justify-center mb-2 animate-bounce">
            <MapPin size={20} className="text-plasma" />
          </div>
          <span className="text-xs font-bold text-starlight">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
          <span className="text-[10px] text-nebula-text mt-0.5">Google Maps Pin point</span>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
