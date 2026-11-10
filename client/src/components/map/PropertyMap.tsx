import React, { useEffect, useRef, useState } from 'react';
import type { Listing } from '@/types';
import { ExternalLink, Layers, Radar as RadarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { useThemeStore } from '@/store/useThemeStore';
import { getImageUrl } from '@/utils/imageUrl';
import { formatPriceMongolianWords } from '@/utils/formatPrice';
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

function formatMarkerPrice(rawPrice: number): string {
  const price = Number(rawPrice) || 0;
  if (price >= 1_000_000_000) {
    const b = (price / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '');
    return `${b}Т ₮`;
  }
  if (price >= 1_000_000) {
    const m = (price / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${m}М ₮`;
  }
  if (price >= 1_000) {
    return `${Math.round(price / 1_000)}К ₮`;
  }
  return `${price} ₮`;
}

const PropertyMap: React.FC<Props> = ({
  listings,
  centerLat = 47.9184,
  centerLng = 106.9177,
  height = '550px',
  zoom = 12,
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const themeMode = useThemeStore((state) => state.mode);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [tileMode, setTileMode] = useState<'dark' | 'voyager'>(themeMode === 'light' ? 'voyager' : 'dark');
  const [radarEffect, setRadarEffect] = useState<boolean>(true);

  useEffect(() => {
    setTileMode(themeMode === 'light' ? 'voyager' : 'dark');
  }, [themeMode]);

  const getCoordinates = (listing: Listing, index: number): [number, number] => {
    const lat = Number(listing.latitude);
    const lng = Number(listing.longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat > 40 && lat < 55 && lng > 90 && lng < 120) {
      return [lat, lng];
    }

    if (listing.district && DISTRICT_COORDS[listing.district]) {
      const [presetLat, presetLng] = DISTRICT_COORDS[listing.district];
      return [presetLat + ((index % 3) - 1) * 0.008, presetLng + (Math.floor(index / 3) - 1) * 0.008];
    }

    return [
      centerLat + ((index % 5) - 2) * 0.015,
      centerLng + (Math.floor(index / 2) - 1.5) * 0.02,
    ];
  };

  const createPopupElement = (listing: Listing): HTMLElement => {
    const listingType = String(listing.type || '').toUpperCase();
    const typeLabel =
      listingType === 'DAILY_RENT'
        ? 'Хоногоор'
        : listingType === 'SALE'
        ? t.listings.sale
        : t.listings.rent;

    const badgeColor =
      listingType === 'DAILY_RENT'
        ? 'background: rgba(245, 158, 11, 0.16); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.35);'
        : listingType === 'SALE'
        ? 'background: rgba(108, 92, 231, 0.16); color: #6c5ce7; border: 1px solid rgba(108, 92, 231, 0.35);'
        : 'background: rgba(16, 185, 129, 0.16); color: #059669; border: 1px solid rgba(16, 185, 129, 0.35);';

    const root = document.createElement('div');
    root.style.fontFamily = 'inherit';

    // Thumbnail image
    if (listing.images && listing.images.length > 0) {
      const imgWrap = document.createElement('div');
      imgWrap.style.cssText = 'position: relative; width: 100%; height: 120px; overflow: hidden; cursor: pointer;';
      const img = document.createElement('img');
      img.src = getImageUrl(listing.images[0]);
      img.alt = listing.title || '';
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
      img.onerror = () => {
        img.onerror = null;
        img.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop';
      };
      imgWrap.appendChild(img);
      imgWrap.addEventListener('click', () => {
        try {
          sessionStorage.setItem('vmax_home_scroll_pending', '1');
        } catch {
          // ignore
        }
        navigate(`/listings/${listing.id}`);
      });
      root.appendChild(imgWrap);
    }

    const body = document.createElement('div');
    body.style.cssText = 'padding: 12px 14px;';

    // Meta row (Type badge + District)
    const meta = document.createElement('div');
    meta.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 6px; padding-right: 22px;';

    const badge = document.createElement('span');
    badge.textContent = typeLabel;
    badge.style.cssText = `padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; ${badgeColor}`;
    meta.appendChild(badge);

    if (listing.district) {
      const dist = document.createElement('span');
      dist.textContent = listing.khoroo ? `${listing.district}, ${listing.khoroo}` : listing.district;
      dist.style.cssText = 'font-size: 11px; opacity: 0.75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
      meta.appendChild(dist);
    }
    body.appendChild(meta);

    // Title
    const title = document.createElement('h4');
    title.textContent = listing.title || '';
    title.style.cssText = 'font-weight: 700; font-size: 13px; line-height: 1.35; margin: 0 0 4px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;';
    body.appendChild(title);

    // Price
    const price = document.createElement('div');
    price.textContent = formatPriceMongolianWords(listing.price);
    price.style.cssText = 'font-size: 16px; font-weight: 800; color: #6c5ce7; margin-bottom: 10px;';
    body.appendChild(price);

    // Footer (Area + Rooms + Link button)
    const footer = document.createElement('div');
    footer.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid rgba(148, 163, 184, 0.2); font-size: 12px;';

    const specs = document.createElement('span');
    const rooms = listing.attributes?.bedrooms || listing.attributes?.rooms;
    specs.textContent = rooms
      ? `${listing.areaSqm} ${t.listings.sqm} · ${rooms} өрөө`
      : `${listing.areaSqm} ${t.listings.sqm}`;
    specs.style.cssText = 'opacity: 0.75; font-weight: 500;';
    footer.appendChild(specs);

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.textContent = `${t.map.viewProperty} →`;
    viewBtn.style.cssText = 'background: none; border: none; padding: 0; color: #6c5ce7; font-weight: 700; font-size: 12px; cursor: pointer;';
    viewBtn.addEventListener('click', () => {
      try {
        sessionStorage.setItem('vmax_home_scroll_pending', '1');
      } catch {
        // ignore
      }
      navigate(`/listings/${listing.id}`);
    });
    footer.appendChild(viewBtn);

    body.appendChild(footer);
    root.appendChild(body);
    return root;
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

      L.control.zoom({ position: 'bottomleft' }).addTo(map);

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

    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ['a', 'b', 'c'],
      maxZoom: 19,
      className: tileMode === 'dark' ? 'osm-dark-tiles' : 'osm-light-tiles',
    }).addTo(map);
  }, [tileMode]);

  // Render Listing Markers on Map with Anchored Popups
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

      const priceFormatted = formatMarkerPrice(listing.price);
      const isSale = String(listing.type || '').toUpperCase() === 'SALE';
      const isDaily = String(listing.type || '').toUpperCase() === 'DAILY_RENT';
      const pinBg = isDaily ? '#f59e0b' : isSale ? '#6c5ce7' : '#10b981';

      const customIcon = L.divIcon({
        className: 'custom-property-pin',
        html: `
          <div class="relative group cursor-pointer transform hover:scale-110 transition-transform">
            <div style="background: ${pinBg};" class="px-2.5 py-1 rounded-full text-xs font-bold text-white border border-white/50 shadow-lg flex items-center space-x-1 whitespace-nowrap">
              <span>${priceFormatted}</span>
            </div>
          </div>
        `,
        iconSize: [64, 28],
        iconAnchor: [32, 14],
      });

      const marker = L.marker(coords, { icon: customIcon });

      marker.bindPopup(() => createPopupElement(listing), {
        className: 'vmax-map-popup',
        closeButton: true,
        maxWidth: 300,
        minWidth: 260,
        offset: [0, -12],
        autoPan: true,
        autoPanPaddingTopLeft: [20, 72],
        autoPanPaddingBottomRight: [20, 20],
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
    </div>
  );
};

export default PropertyMap;
