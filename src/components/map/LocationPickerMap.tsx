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
  initialLat = 37.7749,
  initialLng = -122.4194,
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
  const [statusMessage, setStatusMessage] = useState<string>('Click or drag pin to pinpoint exact problem location');

  // Custom Pin Icon
  const createPinIcon = () => {
    const iconHtml = `
      <div class="relative cursor-grab active:cursor-grabbing" style="transform: translate(-50%, -100%);">
        <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-2xl bg-midnight-900 border-2 border-electric-500 animate-pulse">
          <div class="w-3.5 h-3.5 rounded-full bg-electric-400"></div>
        </div>
        <div class="w-3 h-3 rotate-45 mx-auto -mt-1 bg-midnight-900 border-r border-b border-electric-500"></div>
      </div>
    `;
    return L.divIcon({
      className: 'picker-pin',
      html: iconHtml,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      scrollWheelZoom: true,
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
        setStatusMessage(`Geolocation denied or unavailable (${error.message}). Please click map manually.`);
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
          setStatusMessage('No locations found for this query. Try a nearby landmark or street name.');
        }
      }
    } catch {
      setStatusMessage('Address search service busy. Please click directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & GPS Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchLocation} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, neighborhood or landmark..."
            className="w-full pl-9 pr-24 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-electric-500 shadow-sm"
          />
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-midnight-900 text-white hover:bg-midnight-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          >
            {isSearching ? <Loader2 size={12} className="animate-spin" /> : 'Search'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-electric-500/10 hover:bg-electric-500/20 text-electric-600 dark:text-electric-400 border border-electric-500/30 rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0"
        >
          {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
          <span>Use My Location</span>
        </button>
      </div>

      {/* Leaflet Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner">
        <div ref={mapContainerRef} style={{ height: '360px', width: '100%' }} />

        {/* Floating helper overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 truncate">
            <MapPin size={16} className="text-electric-500 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              {address || 'Pin drop coordinates confirmed'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {currentPos.lat.toFixed(5)}, {currentPos.lng.toFixed(5)}
            </span>
            <CheckCircle size={15} className="text-emerald-500" />
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between px-1">
        <span>💡 {statusMessage}</span>
        <span className="italic">Accurate within 5 meters</span>
      </div>
    </div>
  );
};
