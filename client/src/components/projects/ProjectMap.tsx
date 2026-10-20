import React, { useEffect, useRef, useState } from 'react';
import type { Project } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ExternalLink, X, Building2, ArrowRight, Layers, Sparkles, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const themeMode = useThemeStore((state) => state.mode);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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

      marker.on('click', () => {
        setSelectedProject(project);
        map.panTo(coords);
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

      {/* Selected Project Floating Preview Card */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-30 glass-card p-4 rounded-2xl border border-plasma/40 bg-void/95 shadow-2xl space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-plasma uppercase tracking-wider block">
                  {selectedProject.developerName}
                </span>
                <h4 className="text-base font-bold text-starlight line-clamp-1">{selectedProject.name}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-lg text-nebula-text hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Thumbnail and Details */}
            <div className="flex gap-3">
              <div className="w-24 h-20 rounded-xl overflow-hidden bg-black/40 shrink-0">
                <img
                  src={selectedProject.coverImage}
                  alt={selectedProject.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center gap-1 text-nebula-text line-clamp-1">
                  <MapPin size={12} className="text-nova shrink-0" />
                  <span>{selectedProject.district} {selectedProject.khoroo ? `, ${selectedProject.khoroo}` : ''}</span>
                </div>
                <div>
                  <span className="text-[11px] text-nebula-text block">1 м.кв эхлэх үнэ:</span>
                  <span className="text-sm font-bold text-plasma font-mono">
                    {selectedProject.minPricePerSqm
                      ? `${(Number(selectedProject.minPricePerSqm) / 1000000).toFixed(1)} сая ₮`
                      : 'Тохиролцоно'}
                  </span>
                </div>
                {selectedProject.tour3dUrl && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-plasma/20 text-plasma">
                    <Sparkles size={10} /> 3D Tour
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              {selectedProject.salesPhone && (
                <a
                  href={`tel:${selectedProject.salesPhone.split(',')[0].trim()}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center gap-1 border border-emerald-500/30"
                >
                  <Phone size={13} />
                  <span>Залгах</span>
                </a>
              )}

              <Link
                to={`/projects/${selectedProject.id}`}
                className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-plasma to-nova text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-plasma/20 hover:shadow-plasma/40 transition-all"
              >
                <span>Дэлгэрэнгүй үзэх</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
