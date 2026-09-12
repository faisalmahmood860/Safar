'use client';

import React, { useState, useEffect } from 'react';
import { pakistaniCities, DriverAvailabilityBroadcast } from '@/lib/mockData';

interface DriverAvailabilityWidgetProps {
  onBroadcastSuccess?: (broadcast: DriverAvailabilityBroadcast) => void;
  driverName?: string;
  driverPhone?: string;
}

export default function DriverAvailabilityWidget({
  onBroadcastSuccess,
  driverName = 'Verified Driver',
  driverPhone = '+92 300 1234567',
}: DriverAvailabilityWidgetProps) {
  const [currentCity, setCurrentCity] = useState('Lahore');
  const [isOpenToAnywhere, setIsOpenToAnywhere] = useState(true);
  const [targetDestination, setTargetDestination] = useState('Karachi');
  const [capacityTons, setCapacityTons] = useState('25');
  const [truckType, setTruckType] = useState('22-Wheeler Flatbed Trailer');
  const [truckNumber, setTruckNumber] = useState('LHR-5678');
  const [departureTime, setDepartureTime] = useState('Immediate / Ready Now');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState<DriverAvailabilityBroadcast | null>(null);

  useEffect(() => {
    // Check local storage for active driver broadcast
    const stored = localStorage.getItem('safarload_driver_active_broadcast');
    if (stored) {
      try {
        setActiveBroadcast(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const destinationText = isOpenToAnywhere
      ? 'Open to Go Anywhere in Pakistan 🇵🇰'
      : targetDestination;

    const payload = {
      driverName,
      driverPhone,
      truckNumber,
      truckType,
      currentCity,
      isOpenToAnywhere,
      preferredDestination: destinationText,
      availableCapacityTons: parseFloat(capacityTons) || 25,
      departureTime,
    };

    try {
      const res = await fetch('/api/radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.broadcast) {
        setActiveBroadcast(data.broadcast);
        localStorage.setItem('safarload_driver_active_broadcast', JSON.stringify(data.broadcast));

        // Also add to global availabilities list in localStorage for instant offline sync
        const globalStored = localStorage.getItem('safarload_driver_availabilities');
        const list = globalStored ? JSON.parse(globalStored) : [];
        const updatedList = [data.broadcast, ...list];
        localStorage.setItem('safarload_driver_availabilities', JSON.stringify(updatedList));

        if (onBroadcastSuccess) {
          onBroadcastSuccess(data.broadcast);
        }
        alert(`📡 Availability Broadcasted Successfully!\n\nCurrent City: ${currentCity}\nTarget Route: ${destinationText}\nCapacity: ${capacityTons} Tons\n\nShippers searching for trucks on this route can now view your availability and contact you directly!`);
      }
    } catch (err) {
      // Fallback local broadcast
      const fallbackBroadcast: DriverAvailabilityBroadcast = {
        id: `RADAR-${Date.now()}`,
        driverName,
        driverNameUr: driverName,
        driverPhone,
        driverRating: 4.9,
        completedTrips: 128,
        healthStatus: 'Excellent',
        isFleetManaged: false,
        truckNumber,
        truckType,
        currentCity,
        currentCityUr: currentCity,
        currentLocation: `${currentCity} Logistics Hub`,
        preferredDestination: destinationText,
        preferredDestinationUr: destinationText,
        availableCapacityTons: parseFloat(capacityTons) || 25,
        departureTime,
        status: 'available',
        postedAgo: 'Just now',
      };

      setActiveBroadcast(fallbackBroadcast);
      localStorage.setItem('safarload_driver_active_broadcast', JSON.stringify(fallbackBroadcast));

      const globalStored = localStorage.getItem('safarload_driver_availabilities');
      const list = globalStored ? JSON.parse(globalStored) : [];
      const updatedList = [fallbackBroadcast, ...list];
      localStorage.setItem('safarload_driver_availabilities', JSON.stringify(updatedList));

      if (onBroadcastSuccess) {
        onBroadcastSuccess(fallbackBroadcast);
      }
      alert(`📡 Availability Broadcasted Successfully!\n\nCurrent City: ${currentCity}\nTarget Route: ${destinationText}\nCapacity: ${capacityTons} Tons`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleOffline = () => {
    setActiveBroadcast(null);
    localStorage.removeItem('safarload_driver_active_broadcast');
    alert('🔴 Your status is now set to Offline. Shippers will no longer see your truck on the active radar.');
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📡</span> Driver Return-Trip Radar & Availability Broadcast
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
            Broadcast your current truck location & target destination so shippers can book you directly!
          </p>
        </div>

        {activeBroadcast ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ padding: '0.35rem 0.85rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', color: '#34D399', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700 }}>
              🟢 Live & Visible on Shipper Radar
            </span>
            <button
              onClick={handleToggleOffline}
              className="btn btn-outline btn-sm"
              style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
            >
              🔴 Go Offline
            </button>
          </div>
        ) : (
          <span style={{ padding: '0.35rem 0.85rem', background: 'rgba(148, 163, 184, 0.15)', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#CBD5E1', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600 }}>
            ⚪ Currently Not Broadcasted
          </span>
        )}
      </div>

      {/* Active Broadcast Alert Box */}
      {activeBroadcast && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
              🚛 {activeBroadcast.truckType} ({activeBroadcast.truckNumber})
            </div>
            <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '2px' }}>
              Current Location: <strong style={{ color: '#38BDF8' }}>{activeBroadcast.currentCity}</strong> ➔ Target Route:{' '}
              <strong style={{ color: '#F59E0B' }}>{activeBroadcast.preferredDestination}</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '2px' }}>
              Capacity: <strong>{activeBroadcast.availableCapacityTons} Tons</strong> | Departure: <strong>{activeBroadcast.departureTime}</strong>
            </div>
          </div>
          <button
            onClick={() => setActiveBroadcast(null)}
            className="btn btn-primary btn-sm"
            style={{ color: '#0F172A', fontWeight: 700 }}
          >
            ✏️ Update Target Route / Availability
          </button>
        </div>
      )}

      {/* Broadcast Setup Form */}
      <form onSubmit={handleBroadcastSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
        {/* Current City */}
        <div>
          <label htmlFor="driverCurrentCity" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
            📍 Current Location / City:
          </label>
          <select
            id="driverCurrentCity"
            aria-label="Current Location City"
            value={currentCity}
            onChange={(e) => setCurrentCity(e.target.value)}
            className="input"
            style={{ width: '100%', background: '#1E293B', color: '#F1F5F9', borderColor: 'rgba(148, 163, 184, 0.3)' }}
          >
            {pakistaniCities.map((c) => (
              <option key={c.en} value={c.en}>
                {c.en} ({c.ur})
              </option>
            ))}
          </select>
        </div>

        {/* Target Destination Choice */}
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
            🎯 Target Destination / Route:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#F59E0B', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isOpenToAnywhere}
                onChange={(e) => setIsOpenToAnywhere(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#F59E0B' }}
              />
              🌐 Open to Go Anywhere in Pakistan 🇵🇰
            </label>

            {!isOpenToAnywhere && (
              <select
                id="driverTargetCity"
                aria-label="Target Destination City"
                value={targetDestination}
                onChange={(e) => setTargetDestination(e.target.value)}
                className="input"
                style={{ width: '100%', background: '#1E293B', color: '#F1F5F9', borderColor: 'rgba(148, 163, 184, 0.3)' }}
              >
                {pakistaniCities.map((c) => (
                  <option key={c.en} value={c.en}>
                    {c.en} ({c.ur})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Available Capacity (Tons) */}
        <div>
          <label htmlFor="driverCapacityTons" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
            📦 Available Capacity (Tons):
          </label>
          <input
            id="driverCapacityTons"
            aria-label="Available Capacity Tons"
            type="number"
            value={capacityTons}
            onChange={(e) => setCapacityTons(e.target.value)}
            className="input"
            placeholder="e.g. 25"
            style={{ width: '100%', background: '#1E293B', color: '#F1F5F9', borderColor: 'rgba(148, 163, 184, 0.3)' }}
            required
          />
        </div>

        {/* Truck Type */}
        <div>
          <label htmlFor="driverTruckType" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
            🚛 Truck / Vehicle Type:
          </label>
          <select
            id="driverTruckType"
            aria-label="Truck Vehicle Type"
            value={truckType}
            onChange={(e) => setTruckType(e.target.value)}
            className="input"
            style={{ width: '100%', background: '#1E293B', color: '#F1F5F9', borderColor: 'rgba(148, 163, 184, 0.3)' }}
          >
            <option value="22-Wheeler Flatbed Trailer">22-Wheeler Flatbed Trailer</option>
            <option value="22-Wheeler High Bed Trailer">22-Wheeler High Bed Trailer</option>
            <option value="6-Wheeler Dumper Truck">6-Wheeler Dumper Truck</option>
            <option value="10-Wheeler Rigid Truck">10-Wheeler Rigid Truck</option>
            <option value="Mazda T3500 Open Body">Mazda T3500 Open Body</option>
            <option value="40ft Container Semi-Trailer">40ft Container Semi-Trailer</option>
            <option value="Cold Chain Reefer Truck">Cold Chain Reefer Truck</option>
          </select>
        </div>

        {/* Departure Time */}
        <div>
          <label htmlFor="driverDepartureTime" style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '4px' }}>
            ⏰ Departure Schedule:
          </label>
          <select
            id="driverDepartureTime"
            aria-label="Departure Schedule"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="input"
            style={{ width: '100%', background: '#1E293B', color: '#F1F5F9', borderColor: 'rgba(148, 163, 184, 0.3)' }}
          >
            <option value="Immediate / Ready Now">⚡ Immediate / Ready Now</option>
            <option value="Today Evening (6:00 PM)">🌆 Today Evening (6:00 PM)</option>
            <option value="Tomorrow Morning (8:00 AM)">🌅 Tomorrow Morning (8:00 AM)</option>
            <option value="Flexible (Within 24 Hours)">⏳ Flexible (Within 24 Hours)</option>
          </select>
        </div>

        {/* Submit Broadcast Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', color: '#0F172A', fontWeight: 700, padding: '0.75rem 1rem' }}
          >
            {isSubmitting ? '⌛ Broadcasting...' : '📡 Broadcast My Truck Availability →'}
          </button>
        </div>
      </form>
    </div>
  );
}
