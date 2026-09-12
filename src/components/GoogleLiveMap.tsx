'use client';

import React, { useEffect, useRef, useState } from 'react';

interface LocationPoint {
  lat: number;
  lng: number;
  label?: string;
  address?: string;
}

interface GoogleLiveMapProps {
  origin?: LocationPoint;
  destination?: LocationPoint;
  currentLocation?: LocationPoint;
  truckNumber?: string;
  driverName?: string;
  speed?: string;
  height?: string;
}

declare global {
  interface Window {
    google?: any;
    initSafarGoogleMap?: () => void;
  }
}

export default function GoogleLiveMap({
  origin = { lat: 30.1575, lng: 71.5249, label: 'Multan', address: 'Multan Industrial Estate' },
  destination = { lat: 24.7732, lng: 67.3481, label: 'Karachi', address: 'Port Qasim Gate 3, Karachi' },
  currentLocation = { lat: 24.9312, lng: 68.1254, label: 'Nooriabad M-9 Highway', address: 'Nooriabad M-9 Motorway Rest Area' },
  truckNumber = 'LHR-5678',
  driverName = 'Muhammad Aslam',
  speed = '85 km/h',
  height = '420px',
}: GoogleLiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    setApiKey(key);

    if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      return;
    }

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    // Load Google Maps Script
    const existingScript = document.getElementById('safarload-google-maps-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'safarload-google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,geometry,directions`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
        initMap();
      };
      script.onerror = () => {
        setLoadError('Failed to load Google Maps API script. Please check your API Key restrictions or network.');
      };
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
      initMap();
    }
  }, []);

  const initMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) return;

    try {
      const maps = window.google.maps;
      const map = new maps.Map(mapRef.current, {
        center: { lat: currentLocation.lat, lng: currentLocation.lng },
        zoom: 7,
        mapTypeId: 'roadmap',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
          { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
          { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
        ],
      });

      // Markers
      const originMarker = new maps.Marker({
        position: { lat: origin.lat, lng: origin.lng },
        map,
        title: `Origin: ${origin.label}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        },
      });

      const destMarker = new maps.Marker({
        position: { lat: destination.lat, lng: destination.lng },
        map,
        title: `Destination: ${destination.label}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        },
      });

      // Truck Marker
      const truckMarker = new maps.Marker({
        position: { lat: currentLocation.lat, lng: currentLocation.lng },
        map,
        title: `Truck ${truckNumber} (${driverName})`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });

      // Info Window
      const infoWindow = new maps.InfoWindow({
        content: `
          <div style="color: #1e293b; padding: 6px; font-family: sans-serif;">
            <strong style="font-size: 14px; color: #0284c7;">🚛 Truck ${truckNumber}</strong><br/>
            <span>Driver: <strong>${driverName}</strong></span><br/>
            <span>Speed: <strong style="color: #16a34a;">${speed}</strong></span><br/>
            <small style="color: #64748b;">Location: ${currentLocation.address || currentLocation.label}</small>
          </div>
        `,
      });

      infoWindow.open(map, truckMarker);
      truckMarker.addListener('click', () => {
        infoWindow.open(map, truckMarker);
      });

      // Directions Service
      const directionsService = new maps.DirectionsService();
      const directionsRenderer = new maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#38bdf8',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });

      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: maps.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          }
        }
      );
    } catch (err) {
      console.error('Google Maps initialization error:', err);
    }
  };

  const hasKey = apiKey && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color, #334155)' }}>
      {hasKey ? (
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            textAlign: 'center',
            color: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🗺️</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8' }}>Google Maps Live Tracking API Integration</h3>
          <p style={{ maxWidth: '540px', fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
            Google Maps API Key is currently not set in your environment file. Add your API Key to <code>.env.local</code> to activate live satellite route maps!
          </p>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #334155',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: '#4ade80',
              marginBottom: '1rem',
              maxWidth: '90%',
              overflowX: 'auto',
            }}
          >
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge badge-success" style={{ background: '#0284c7', color: '#fff', padding: '0.4rem 0.8rem' }}>
              📍 Origin: {origin.label}
            </span>
            <span className="badge badge-warning" style={{ background: '#f59e0b', color: '#fff', padding: '0.4rem 0.8rem' }}>
              🚛 Current: {currentLocation.label} ({speed})
            </span>
            <span className="badge badge-info" style={{ background: '#10b981', color: '#fff', padding: '0.4rem 0.8rem' }}>
              🏁 Destination: {destination.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
