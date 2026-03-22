'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export default function LocationMap({ latitude, longitude, name }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    // Dark mode tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Custom marker
    const markerIcon = L.divIcon({
      className: '',
      html: `<div style="
        width: 12px;
        height: 12px;
        background: #fff;
        border-radius: 50%;
        border: 2px solid #333;
        box-shadow: 0 0 0 4px rgba(255,255,255,0.15), 0 0 12px rgba(255,255,255,0.1);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    L.marker([latitude, longitude], { icon: markerIcon })
      .bindTooltip(name, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'leaflet-dark-tooltip',
      })
      .addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude, name]);

  return (
    <>
      <style jsx global>{`
        .leaflet-dark-tooltip {
          background: #1a1a1a !important;
          color: #ccc !important;
          border: 1px solid #333 !important;
          border-radius: 4px !important;
          font-size: 11px !important;
          padding: 4px 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        .leaflet-dark-tooltip::before {
          border-top-color: #333 !important;
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full h-[160px] rounded-lg overflow-hidden border border-[#1e1e1e]"
      />
    </>
  );
}
