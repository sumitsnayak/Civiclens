import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Search, CheckCircle, Loader2 } from 'lucide-react';
import { reverseGeocode } from '../../lib/utils';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onLocationSelected: (data: { lat: number; lng: number; address: string }) => void;
}

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
  initialLat = 12.9141,
  initialLng = 74.8560,
  initialAddress = '',
  onLocationSelected,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [address, setAddress] = useState<string>(initialAddress);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Click or drag pin to adjust coordinates');

  // Custom Pin Icon matching Dribbble Plum Palette
  const createPinIcon = () => {
    const iconHtml = `
      <div class="relative cursor-grab active:cursor-grabbing" style="transform: translate(-50%, -100%);">
        <div class="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg bg-[#442646] border-2 border-white">
          <div class="w-3 h-3 rounded-full bg-[#E5B5E8]"></div>
        </div>
        <div class="w-2.5 h-2.5 rotate-45 mx-auto -mt-1 bg-[#442646]"></div>
      </div>
    `;
    return L.divIcon({
      className: 'picker-pin',
      html: iconHtml,
      iconSize: [36, 44],
      iconAnchor: [18, 44],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: createPinIcon(),
    }).addTo(map);

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Handle marker drag
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      setCurrentPos({ lat: pos.lat, lng: pos.lng });
      setStatusMessage('Resolving street address...');
      const resolvedAddress = await reverseGeocode(pos.lat, pos.lng);
      setAddress(resolvedAddress);
      setStatusMessage('Location confirmed');
      onLocationSelected({ lat: pos.lat, lng: pos.lng, address: resolvedAddress });
    });

    // Handle map click
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setCurrentPos({ lat, lng });
      setStatusMessage('Resolving street address...');
      const resolvedAddress = await reverseGeocode(lat, lng);
      setAddress(resolvedAddress);
      setStatusMessage('Location confirmed');
      onLocationSelected({ lat, lng, address: resolvedAddress });
    });

    // Initial reverse geocode if no address provided
    if (!initialAddress) {
      reverseGeocode(initialLat, initialLng).then((addr) => {
        setAddress(addr);
        onLocationSelected({ lat: initialLat, lng: initialLng, address: addr });
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setStatusMessage('Requesting GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPos({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16, { animate: true });
          markerRef.current.setLatLng([latitude, longitude]);
        }

        const resolved = await reverseGeocode(latitude, longitude);
        setAddress(resolved);
        setIsLocating(false);
        setStatusMessage('GPS position locked');
        onLocationSelected({ lat: latitude, lng: longitude, address: resolved });
      },
      (error) => {
        setIsLocating(false);
        setStatusMessage(`Geolocation unavailable. Please click map manually.`);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatusMessage(`Searching for "${searchQuery}"...`);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { Accept: 'application/json' } }
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);

          setCurrentPos({ lat, lng });
          setAddress(first.display_name);

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
            markerRef.current.setLatLng([lat, lng]);
          }

          setStatusMessage('Location found');
          onLocationSelected({ lat, lng, address: first.display_name });
        } else {
          setStatusMessage('No locations found. Try a nearby street name.');
        }
      }
    } catch {
      setStatusMessage('Address lookup busy. Please click directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Search & GPS Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchLocation} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search street, neighborhood, or landmark..."
            className="w-full pl-8 pr-20 py-2 bg-[#F5F4F8] border border-[#E7E2ED] rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#552B58] focus:bg-white transition-all"
          />
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 top-1 px-3 py-1 bg-[#442646] hover:bg-[#341B36] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
          >
            {isSearching ? <Loader2 size={11} className="animate-spin" /> : 'Search'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#EDE5F0] hover:bg-[#E5DAE9] text-[#552B58] border border-[#DFCEE2] rounded-xl text-xs font-bold transition-colors shadow-2xs shrink-0"
        >
          {isLocating ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
          <span>Use GPS</span>
        </button>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E7E2ED] shadow-2xs">
        <div ref={mapContainerRef} style={{ height: '240px', width: '100%' }} />

        {/* Floating Address Bar */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-[1000] bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-[#E7E2ED] shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs truncate">
            <MapPin size={14} className="text-[#552B58] shrink-0" />
            <span className="font-semibold text-slate-900 truncate text-[11px]">
              {address || 'Pin location confirmed'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-slate-500 bg-[#F5F4F8] px-2 py-0.5 rounded-md border border-[#E7E2ED]">
              {currentPos.lat.toFixed(4)}, {currentPos.lng.toFixed(4)}
            </span>
            <CheckCircle size={13} className="text-emerald-600" />
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
        <span>📍 {statusMessage}</span>
        <span className="italic">Drag pin anywhere on map</span>
      </div>
    </div>
  );
};
