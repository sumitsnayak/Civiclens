import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Report } from '../../types';
import { STATUS_CONFIG, CATEGORIES_CONFIG } from '../../lib/constants';

interface CivicMapProps {
  reports: Report[];
  selectedReportId?: string | null;
  onSelectReport?: (report: Report) => void;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

export const CivicMap: React.FC<CivicMapProps> = ({
  reports,
  selectedReportId,
  onSelectReport,
  height = '500px',
  center = [12.9141, 74.8560],
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when reports change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (reports.length === 0) return;

    const bounds = L.latLngBounds([]);

    reports.forEach((report) => {
      if (!report.latitude || !report.longitude) return;

      const latLng = L.latLng(report.latitude, report.longitude);
      bounds.extend(latLng);

      const statusConf = STATUS_CONFIG[report.status] || STATUS_CONFIG.reported;
      const catConf = CATEGORIES_CONFIG[report.category] || CATEGORIES_CONFIG.other;

      // Custom SVG Pin Icon
      const pinColor = statusConf.color;
      const isSelected = selectedReportId === report.id;

      const iconHtml = `
        <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${isSelected ? 'scale-125 ring-4 ring-white' : 'hover:scale-110'}" style="background-color: ${pinColor}; border: 2px solid white;">
            <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
          </div>
          <div class="w-2 h-2 rotate-45 mx-auto -mt-1 shadow-sm" style="background-color: ${pinColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'civic-marker-pin',
        html: iconHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40],
      });

      const marker = L.marker(latLng, { icon: customIcon }).addTo(map);

      // Popup content
      const popupHtml = `
        <div style="font-family: Inter, sans-serif; width: 230px; border-radius: 12px; overflow: hidden; padding: 2px;">
          <img src="${report.image_path}" onerror="this.src='/images/issues/pothole.jpg'" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" alt="${report.title}" />
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${pinColor}; margin-bottom: 2px;">
            ${statusConf.label} • ${catConf.label}
          </div>
          <div style="font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.3; margin-bottom: 6px;">
            ${report.title.length > 50 ? report.title.substring(0, 50) + '...' : report.title}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            📍 ${report.address || 'Location registered'}
          </div>
          <button id="view-report-${report.id}" style="width: 100%; background-color: #0B132B; color: white; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; text-align: center;">
            View Full Report →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 250,
        className: 'civic-leaflet-popup',
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-report-${report.id}`);
        if (btn && onSelectReport) {
          btn.onclick = () => onSelectReport(report);
        }
      });

      marker.on('click', () => {
        if (onSelectReport) onSelectReport(report);
      });

      markersRef.current[report.id] = marker;
    });

    // Fit map bounds if reports exist
    if (bounds.isValid() && reports.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (reports.length === 1 && bounds.isValid()) {
      map.setView([reports[0].latitude, reports[0].longitude], 14);
    }
  }, [reports, selectedReportId]);

  // Center selected report if changed
  useEffect(() => {
    if (selectedReportId && markersRef.current[selectedReportId] && mapInstanceRef.current) {
      const marker = markersRef.current[selectedReportId];
      mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.8 });
      marker.openPopup();
    }
  }, [selectedReportId]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />
      <div className="absolute top-3 right-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-medium text-slate-700 dark:text-slate-300">
        Showing <span className="font-bold text-electric-600 dark:text-electric-400">{reports.length}</span> civic reports
      </div>
    </div>
  );
};

