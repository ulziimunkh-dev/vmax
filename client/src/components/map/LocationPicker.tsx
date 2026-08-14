import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Layers } from 'lucide-react';
import { useI18n } from '@/i18n';
import { useThemeStore } from '@/store/useThemeStore';
import L from 'leaflet';

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
  const themeMode = useThemeStore((state) => state.mode);

  const [lat, setLat] = useState<number>(latitude);
  const [lng, setLng] = useState<number>(longitude);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync internal state when external latitude/longitude props change (e.g., when editing listing)
  useEffect(() => {
    if (latitude && longitude && (latitude !== lat || longitude !== lng)) {
      setLat(latitude);
      setLng(longitude);
    }
  }, [latitude, longitude]);

  // Create custom marker icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-full group cursor-grab active:cursor-grabbing">
          <div class="w-9 h-9 rounded-full bg-plasma text-white flex items-center justify-center shadow-xl border-2 border-white ring-4 ring-plasma/30 animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topleft' }).addTo(map);

      const tileUrl =
        themeMode === 'light'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Add Draggable Marker
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: createPinIcon(),
      }).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        const newLat = Number(position.lat.toFixed(6));
        const newLng = Number(position.lng.toFixed(6));
        setLat(newLat);
        setLng(newLng);
        onChange(newLat, newLng);
      });

      // Click on map to place pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        marker.setLatLng([newLat, newLng]);
        setLat(newLat);
        setLng(newLng);
        onChange(newLat, newLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update map and marker when lat or lng state changes from inputs / presets
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const currentMarkerPos = markerRef.current.getLatLng();
      if (
        Math.abs(currentMarkerPos.lat - lat) > 0.0001 ||
        Math.abs(currentMarkerPos.lng - lng) > 0.0001
      ) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng]);
      }
    }
  }, [lat, lng]);

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

      <p className="text-xs text-nebula-text">
        Газрын зураг дээр дарж эсвэл цэгийг чирэх (drag) замаар зарын байршлыг яг таг сонгоно уу.
      </p>

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

      {/* Interactive Leaflet Map Box */}
      <div className="h-64 rounded-2xl overflow-hidden relative border border-white/10 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 z-10 px-2.5 py-1 bg-void/80 backdrop-blur-md rounded-lg border border-white/10 text-[11px] font-mono text-plasma font-bold">
          📍 {lat.toFixed(6)}, {lng.toFixed(6)}
        </div>
      </div>

      {/* Latitude / Longitude Manual Coordinate Inputs */}
      <div className="grid grid-cols-2 gap-4 pt-1">
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
    </div>
  );
};

export default LocationPicker;
