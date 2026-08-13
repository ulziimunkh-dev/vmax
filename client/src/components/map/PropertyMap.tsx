import React, { useEffect, useRef, useState } from 'react';
import type { Listing } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ExternalLink, X, Home, ArrowRight, Layers, Radar as RadarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useThemeStore } from '@/store/useThemeStore';
import L from 'leaflet';

interface Props {
  listings: Listing[];
  centerLat?: number;
  centerLng?: number;
  height?: string;
  zoom?: number;
}

// Preset fallback coordinates for Ulaanbaatar districts if coordinates are missing
const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Хан-Уул': [47.8864, 106.9056],
  'Сүхбаатар': [47.9250, 106.9200],
  'Баянзүрх': [47.9150, 106.9600],
  'Баянгол': [47.9120, 106.8700],
  'Чингэлтэй': [47.9350, 106.9100],
  'Сонгинохайрхан': [47.9100, 106.7800],
  'Багануур': [47.7800, 108.3500],
  'Багахангай': [47.6200, 107.4700],
  'Налайх': [47.7700, 107.2500],
};

const PropertyMap: React.FC<Props> = ({
  listings,
  centerLat = 47.9184,
  centerLng = 106.9177,
  height = '550px',
  zoom = 12,
}) => {
  const { t } = useI18n();
  const themeMode = useThemeStore((state) => state.mode);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [tileMode, setTileMode] = useState<'dark' | 'voyager'>(themeMode === 'light' ? 'voyager' : 'dark');
  const [radarEffect, setRadarEffect] = useState<boolean>(true);

  // Synchronize map tile mode automatically when global theme changes
  useEffect(() => {
    setTileMode(themeMode === 'light' ? 'voyager' : 'dark');
  }, [themeMode]);

  // Safely resolve latitude and longitude for a listing
  const getCoordinates = (listing: Listing, index: number): [number, number] => {
    const lat = Number(listing.latitude);
    const lng = Number(listing.longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat > 40 && lat < 55 && lng > 90 && lng < 120) {
      return [lat, lng];
    }

    if (listing.district && DISTRICT_COORDS[listing.district]) {
      const [presetLat, presetLng] = DISTRICT_COORDS[listing.district];
      return [presetLat + (index % 3 - 1) * 0.008, presetLng + (Math.floor(index / 3) - 1) * 0.008];
    }

    return [
      centerLat + ((index % 5) - 2) * 0.015,
      centerLng + (Math.floor(index / 2) - 1.5) * 0.02,
    ];
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topleft' }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when tileMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    const tileUrl =
      tileMode === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);
  }, [tileMode]);

  // Render Listing Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (listings.length === 0) return;

    const bounds = L.latLngBounds([]);

    listings.forEach((listing, idx) => {
      const coords = getCoordinates(listing, idx);
      bounds.extend(coords);

      const priceFormatted =
        listing.price >= 1000000
          ? `${(Number(listing.price) / 1000000).toFixed(0)}М ₮`
          : `${(Number(listing.price) / 1000).toFixed(0)}К ₮`;

      const customIcon = L.divIcon({
        className: 'custom-property-pin',
        html: `
          <div class="relative group cursor-pointer transform hover:scale-110 transition-transform">
            <div class="px-2.5 py-1 rounded-full text-xs font-bold bg-[#6c5ce7] text-white border border-white/40 shadow-lg flex items-center space-x-1 whitespace-nowrap">
              <span>${priceFormatted}</span>
            </div>
          </div>
        `,
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });

      const marker = L.marker(coords, { icon: customIcon });

      marker.on('click', () => {
        setSelectedListing(listing);
        map.panTo(coords);
      });

      markersGroup.addLayer(marker);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [listings]);

  const isLightMap = tileMode === 'voyager';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl transition-colors duration-300" style={{ height }}>
      {/* Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 relative transition-colors duration-300 ${
          isLightMap ? 'bg-[#f8fafc]' : 'bg-[#0a0a14]'
        }`}
      />

      {/* Radar Overlay Effect */}
      {radarEffect && (
        <div className={`absolute inset-0 pointer-events-none z-10 overflow-hidden ${isLightMap ? 'opacity-15' : 'opacity-30'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-plasma/40 animate-ping opacity-25" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-aurora/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-plasma/50" />
        </div>
      )}

      {/* Top Bar Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-void/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-plasma flex items-center space-x-2 pointer-events-auto shadow-lg">
          <RadarIcon size={14} className={radarEffect ? 'animate-spin text-aurora' : ''} />
          <span>REAL ESTATE RADAR [{listings.length} PROPERTIES]</span>
        </div>

        <div className="flex space-x-2 pointer-events-auto">
          <button
            onClick={() => setRadarEffect(!radarEffect)}
            title="Toggle Radar Sweep Effect"
            className={`p-2 rounded-xl text-xs font-medium backdrop-blur-md border transition-all shadow-lg ${
              radarEffect
                ? 'bg-plasma text-white-force border-plasma'
                : 'bg-void/80 text-starlight border-white/10 hover:border-plasma'
            }`}
          >
            <RadarIcon size={16} />
          </button>

          <button
            onClick={() => setTileMode(tileMode === 'dark' ? 'voyager' : 'dark')}
            title="Switch Map Theme Style"
            className="p-2 rounded-xl text-xs font-medium bg-void/80 backdrop-blur-md text-starlight border border-white/10 hover:border-plasma transition-all shadow-lg flex items-center space-x-1"
          >
            <Layers size={16} />
          </button>

          <a
            href={`https://www.google.com/maps/@${centerLat},${centerLng},13z`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-void/80 backdrop-blur-md text-xs font-medium text-starlight border border-white/10 hover:border-plasma hover:text-plasma transition-all shadow-lg"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">{t.map.openGoogleMaps}</span>
          </a>
        </div>
      </div>

      {/* Selected Listing Floating Preview Card */}
      <AnimatePresence>
        {selectedListing && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30 glass-card p-4 rounded-2xl border-glow shadow-2xl"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-plasma/20 text-plasma border border-plasma/40 uppercase">
                  {selectedListing.type === 'sale' ? t.listings.sale : t.listings.rent}
                </span>
                <span className="text-xs text-nebula-text flex items-center">
                  <Home size={12} className="mr-1" />
                  {selectedListing.district}
                </span>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-nebula-text hover:text-starlight p-1 rounded-full hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <h4 className="font-bold text-starlight text-base truncate mb-1">{selectedListing.title}</h4>
            <p className="text-xl font-heading font-bold text-plasma mb-3">
              {Number(selectedListing.price).toLocaleString('mn-MN')} ₮
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-nebula-text">{selectedListing.areaSqm} {t.listings.sqm}</span>
              <Link
                to={`/listings/${selectedListing.id}`}
                className="flex items-center space-x-1 text-plasma font-semibold hover:text-plasma/80 transition-colors"
              >
                <span>{t.map.viewProperty}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyMap;
