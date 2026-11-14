import React, { useEffect, useRef, useState } from 'react';
import type { Project } from '@/types';
import { ExternalLink, Building2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/useThemeStore';
import L from 'leaflet';

interface ProjectMapProps {
  projects: Project[];
  centerLat?: number;
  centerLng?: number;
  height?: string;
  zoom?: number;
}

const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Хан-Уул': [47.8864, 106.9056],
  'Сүхбаатар': [47.9250, 106.9200],
  'Баянзүрх': [47.9150, 106.9600],
  'Баянгол': [47.9120, 106.8700],
  'Чингэлтэй': [47.9350, 106.9100],
  'Сонгинохайрхан': [47.9100, 106.7800],
};

export const ProjectMap: React.FC<ProjectMapProps> = ({
  projects,
  centerLat = 47.9184,
  centerLng = 106.9177,
  height = '600px',
  zoom = 12,
}) => {
  const navigate = useNavigate();
  const themeMode = useThemeStore((state) => state.mode);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [tileMode, setTileMode] = useState<'dark' | 'light'>(themeMode === 'light' ? 'light' : 'dark');

  useEffect(() => {
    setTileMode(themeMode === 'light' ? 'light' : 'dark');
  }, [themeMode]);

  const getCoordinates = (project: Project, index: number): [number, number] => {
    const lat = Number(project.latitude);
    const lng = Number(project.longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat > 40 && lat < 55 && lng > 90 && lng < 120) {
      return [lat, lng];
    }

    if (project.district && DISTRICT_COORDS[project.district]) {
      const [presetLat, presetLng] = DISTRICT_COORDS[project.district];
      return [presetLat + ((index % 3) - 1) * 0.007, presetLng + (Math.floor(index / 3) - 1) * 0.007];
    }

    return [
      centerLat + ((index % 5) - 2) * 0.015,
      centerLng + (Math.floor(index / 2) - 1.5) * 0.02,
    ];
  };

  const createPopupElement = (project: Project): HTMLElement => {
    const root = document.createElement('div');
    root.style.fontFamily = 'inherit';

    // Thumbnail
    if (project.coverImage) {
      const imgWrap = document.createElement('div');
      imgWrap.style.cssText = 'position: relative; width: 100%; height: 120px; overflow: hidden; cursor: pointer;';
      const img = document.createElement('img');
      img.src = project.coverImage;
      img.alt = project.name || '';
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
      img.onerror = () => {
        img.onerror = null;
        img.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop';
      };
      imgWrap.appendChild(img);
      imgWrap.addEventListener('click', () => {
        navigate(`/projects/${project.id}`);
      });
      root.appendChild(imgWrap);
    }

    const body = document.createElement('div');
    body.style.cssText = 'padding: 12px 14px;';

    // Developer name
    if (project.developerName) {
      const dev = document.createElement('div');
      dev.textContent = project.developerName;
      dev.style.cssText = 'font-size: 10px; font-weight: 700; color: #6c5ce7; text-transform: uppercase; margin-bottom: 2px; padding-right: 20px;';
      body.appendChild(dev);
    }

    // Name
    const title = document.createElement('h4');
    title.textContent = project.name || '';
    title.style.cssText = 'font-weight: 700; font-size: 14px; line-height: 1.35; margin: 0 0 6px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
    body.appendChild(title);

    // District & 3D Tour
    const meta = document.createElement('div');
    meta.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 8px; font-size: 11px; opacity: 0.8;';
    const loc = document.createElement('span');
    loc.textContent = project.khoroo ? `${project.district}, ${project.khoroo}` : project.district;
    meta.appendChild(loc);

    if (project.tour3dUrl) {
      const tour = document.createElement('span');
      tour.textContent = '✨ 3D Tour';
      tour.style.cssText = 'padding: 1px 6px; border-radius: 6px; background: rgba(108, 92, 231, 0.15); color: #6c5ce7; font-weight: 700; font-size: 10px;';
      meta.appendChild(tour);
    }
    body.appendChild(meta);

    // Price
    const price = document.createElement('div');
    const minPrice = project.minPricePerSqm
      ? `${(Number(project.minPricePerSqm) / 1000000).toFixed(1)} сая ₮ / м.кв-аас`
      : 'Тохиролцоно';
    price.textContent = minPrice;
    price.style.cssText = 'font-size: 14px; font-weight: 800; color: #6c5ce7; margin-bottom: 10px;';
    body.appendChild(price);

    // Footer actions
    const footer = document.createElement('div');
    footer.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 8px; border-top: 1px solid rgba(148, 163, 184, 0.2); font-size: 12px;';

    if (project.salesPhone) {
      const phoneBtn = document.createElement('a');
      const cleanPhone = project.salesPhone.split(',')[0].trim();
      phoneBtn.href = `tel:${cleanPhone}`;
      phoneBtn.textContent = `📞 ${cleanPhone}`;
      phoneBtn.style.cssText = 'padding: 4px 8px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); color: #059669; font-weight: 700; text-decoration: none; font-size: 11px;';
      footer.appendChild(phoneBtn);
    }

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.textContent = 'Дэлгэрэнгүй үзэх →';
    viewBtn.style.cssText = 'background: none; border: none; padding: 0; color: #6c5ce7; font-weight: 700; font-size: 12px; cursor: pointer; margin-left: auto;';
    viewBtn.addEventListener('click', () => {
      navigate(`/projects/${project.id}`);
    });
    footer.appendChild(viewBtn);

    body.appendChild(footer);
    root.appendChild(body);
    return root;
  };

  // Initialize Map
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

  // Tile layer switch
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

  // Render Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    const bounds = L.latLngBounds([]);

    projects.forEach((project, index) => {
      const coords = getCoordinates(project, index);
      bounds.extend(coords);

      const priceLabel = project.minPricePerSqm
        ? `${(Number(project.minPricePerSqm) / 1000000).toFixed(1)}M`
        : 'Төсөл';

      const customIcon = L.divIcon({
        className: 'custom-project-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #1877F2 0%, #7928CA 100%);
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(24, 119, 242, 0.4);
            border: 1.5px solid rgba(255, 255, 255, 0.6);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            cursor: pointer;
            transform: translate(-50%, -50%);
            transition: transform 0.2s ease;
          ">
            <span>🏢</span>
            <span>${priceLabel}</span>
            ${project.tour3dUrl ? '<span style="font-size: 9px; background: rgba(0,0,0,0.4); padding: 1px 4px; border-radius: 6px;">3D</span>' : ''}
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const marker = L.marker(coords, { icon: customIcon });

      marker.bindPopup(() => createPopupElement(project), {
        className: 'vmax-map-popup',
        closeButton: true,
        maxWidth: 320,
        minWidth: 280,
        offset: [0, -12],
        autoPan: true,
        autoPanPaddingTopLeft: [20, 72],
        autoPanPaddingBottomRight: [20, 20],
      });

      markersGroup.addLayer(marker);
    });

    if (bounds.isValid() && projects.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [projects]);

  const isLightMap = tileMode === 'light';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl transition-colors duration-300" style={{ height }}>
      {/* Leaflet Map DOM Container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 relative transition-colors duration-300 ${
          isLightMap ? 'bg-[#f8fafc]' : 'bg-[#0a0a14]'
        }`}
      />

      {/* Top Bar Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        <div className="bg-void/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-plasma flex items-center space-x-2 pointer-events-auto shadow-lg">
          <Building2 size={14} className="text-plasma" />
          <span>PROJECTS MAP [{projects.length} ХОТХОН]</span>
        </div>

        <div className="flex space-x-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setTileMode(tileMode === 'dark' ? 'light' : 'dark')}
            title="Switch Map Theme Style"
            className="p-2 rounded-xl text-xs font-medium bg-void/80 backdrop-blur-md text-starlight border border-white/10 hover:border-plasma transition-all shadow-lg flex items-center gap-1 cursor-pointer"
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
            <span className="hidden sm:inline">Google Maps</span>
          </a>
        </div>
      </div>

    </div>
  );
};
