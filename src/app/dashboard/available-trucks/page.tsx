'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import GlobalBannerContainer from '@/components/GlobalBannerContainer';
import { pakistaniCities } from '@/lib/mockData';
import { initiateVoIPCall } from '@/lib/voipCallSystem';

interface FleetTruck {
  id: string;
  registrationNumber: string;
  type: string;
  typeIcon: string;
  driverName: string;
  driverPhone?: string;
  currentCity: string;
  fuelLevel: number;
  nextMaintenance?: string;
  status: 'idle' | 'active' | 'maintenance';
  operatorName?: string;
  capacityTons?: number;
  ratePerKm?: number;
}

const defaultFleetTrucks: FleetTruck[] = [
  { id: 'TRK-001', registrationNumber: 'LHR-5678', type: 'Flatbed Trailer (25 Tons)', typeIcon: '🚛', driverName: 'Tariq Mehmood', driverPhone: '+92 301 2345678', currentCity: 'Multan', fuelLevel: 85, status: 'idle', operatorName: 'Al-Farooq Logistics', capacityTons: 25, ratePerKm: 195 },
  { id: 'TRK-002', registrationNumber: 'KHI-1234', type: 'Container (22ft / 20 Tons)', typeIcon: '📦', driverName: 'Abdul Rasheed', driverPhone: '+92 333 9876543', currentCity: 'Karachi', fuelLevel: 92, status: 'idle', operatorName: 'Port Freight Lines', capacityTons: 20, ratePerKm: 180 },
  { id: 'TRK-003', registrationNumber: 'FSD-9012', type: 'Dumper Truck (30 Tons)', typeIcon: '🚛', driverName: 'Muhammad Aslam', driverPhone: '+92 321 5551234', currentCity: 'Faisalabad', fuelLevel: 45, status: 'idle', operatorName: 'Faisalabad Heavy Fleet', capacityTons: 30, ratePerKm: 210 },
  { id: 'TRK-004', registrationNumber: 'RWP-3456', type: '22-Wheeler Heavy Trailer', typeIcon: '🚛', driverName: 'Shahbaz Ali', driverPhone: '+92 300 7778899', currentCity: 'Rawalpindi', fuelLevel: 78, status: 'idle', operatorName: 'Northern Freight Co.', capacityTons: 35, ratePerKm: 220 },
  { id: 'TRK-005', registrationNumber: 'PSH-7890', type: 'Bedford Open Rig (15 Tons)', typeIcon: '🚛', driverName: 'Khan Muhammad', driverPhone: '+92 302 1122334', currentCity: 'Peshawar', fuelLevel: 60, status: 'idle', operatorName: 'Khyber Express Fleet', capacityTons: 15, ratePerKm: 160 },
  { id: 'TRK-006', registrationNumber: 'MLT-4567', type: 'Flatbed Trailer (25 Tons)', typeIcon: '🚛', driverName: 'Zahid Khan', driverPhone: '+92 304 9988776', currentCity: 'Multan', fuelLevel: 90, status: 'idle', operatorName: 'South Punjab Transport', capacityTons: 25, ratePerKm: 195 },
  { id: 'TRK-008', registrationNumber: 'ISB-1122', type: 'Mazda Master (10 Tons)', typeIcon: '🚚', driverName: 'Rizwan Ahmed', driverPhone: '+92 306 6655443', currentCity: 'Islamabad', fuelLevel: 95, status: 'idle', operatorName: 'Capital Fast Logistics', capacityTons: 10, ratePerKm: 140 },
  { id: 'TRK-009', registrationNumber: 'GUJ-3344', type: 'Heavy Trailer (30 Tons)', typeIcon: '🚛', driverName: 'Imran Shah', driverPhone: '+92 307 8899001', currentCity: 'Gujranwala', fuelLevel: 72, status: 'idle', operatorName: 'Guiranwala Industrial Fleet', capacityTons: 30, ratePerKm: 205 },
  { id: 'TRK-010', registrationNumber: 'SKT-5566', type: 'Shehzore Pickup (3 Tons)', typeIcon: '🛻', driverName: 'Farooq Azam', driverPhone: '+92 308 2233445', currentCity: 'Sialkot', fuelLevel: 88, status: 'idle', operatorName: 'Sialkot Export Cargo', capacityTons: 3, ratePerKm: 95 },
];

export default function AvailableTrucksPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [trucks, setTrucks] = useState<FleetTruck[]>(defaultFleetTrucks);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('safarload_fleet_trucks');
      if (stored) {
        const list: FleetTruck[] = JSON.parse(stored);
        setTrucks(list.length > 0 ? list : defaultFleetTrucks);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const filteredTrucks = trucks.filter((t) => {
    const matchesCity = selectedCity === 'all' || t.currentCity.toLowerCase() === selectedCity.toLowerCase();
    const matchesType = selectedType === 'all' || t.type.toLowerCase().includes(selectedType.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      t.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.currentCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCity && matchesType && matchesSearch;
  });

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      <GlobalBannerContainer />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.headerBadge}>🏢 Shipper Portal • Live Vehicle Finder</span>
          <h1>{lang === 'ur' ? 'دستیاب فلیٹ گاڑیاں (ٹرکس)' : 'Available Fleet Trucks Across Pakistan'}</h1>
          <p>
            {lang === 'ur'
              ? 'پاکستان بھر میں ڈائریکٹ فلیٹ آپریٹرز کی فارغ اور دستیاب گاڑیاں دیکھیں۔ ڈائریکٹ رابطہ کریں یا آرڈر بک کریں'
              : 'Browse idle & available trucks broadcasted live by Fleet Operators across all Pakistani industrial hubs'}
          </p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <Link href="/dashboard/post-load" className="btn btn-primary btn-sm">
            ➕ Post Cargo Load
          </Link>
          <Link href="/dashboard" className="btn btn-glass btn-sm">
            🏠 Main Dashboard
          </Link>
        </div>
      </header>

      {/* Filter Bar */}
      <div className={styles.filterCard}>
        <div className={styles.filterGrid}>
          {/* City Filter */}
          <div className={styles.filterGroup}>
            <label>📍 Filter by Location / City:</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input"
            >
              <option value="all">🌐 All Pakistani Hubs (تمام شہر)</option>
              {pakistaniCities.map((c: any) => {
                const name = typeof c === 'string' ? c : c.en;
                const ur = typeof c === 'string' ? c : c.ur;
                return (
                  <option key={name} value={name}>
                    {name} ({ur})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div className={styles.filterGroup}>
            <label>🚛 Filter by Truck Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              <option value="all">📦 All Vehicle Types (تمام اقسام)</option>
              <option value="Flatbed">Flatbed Trailer (25 Tons)</option>
              <option value="Container">Container (22ft / 40ft)</option>
              <option value="Dumper">Dumper Heavy Rig</option>
              <option value="22-Wheeler">22-Wheeler Heavy Trailer</option>
              <option value="Mazda">Mazda Master (10 Tons)</option>
              <option value="Shehzore">Shehzore Pickup (3 Tons)</option>
            </select>
          </div>

          {/* Search Box */}
          <div className={styles.filterGroup}>
            <label>🔍 Quick Search:</label>
            <input
              type="text"
              placeholder="Search Reg #, Driver or City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className={styles.statsCount}>
          🟢 Showing <strong>{filteredTrucks.length}</strong> Ready & Idle Fleet Vehicles Ready for Dispatch
        </div>
      </div>

      {/* Trucks Grid */}
      <div className={styles.trucksGrid}>
        {filteredTrucks.length === 0 ? (
          <div className={styles.emptyState}>
            🔍 No fleet trucks found matching your filters. Try selecting "All Pakistani Hubs" or reset search.
          </div>
        ) : (
          filteredTrucks.map((truck) => (
            <div key={truck.id} className={`${styles.truckCard} glass-card animate-fadeIn`}>
              <div className={styles.cardHeader}>
                <div className={styles.truckBadge}>
                  <span className={styles.icon}>{truck.typeIcon || '🚛'}</span>
                  <div>
                    <h3 className={styles.regNumber}>{truck.registrationNumber}</h3>
                    <span className={styles.typeText}>{truck.type}</span>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${truck.status === 'idle' ? styles.idle : styles.active}`}>
                  {truck.status === 'idle' ? '🟢 Ready for Freight' : '🚚 En Route'}
                </span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span>📍 Current Location:</span>
                  <strong>{truck.currentCity}</strong>
                </div>

                <div className={styles.infoRow}>
                  <span>👨‍✈️ Driver:</span>
                  <strong>{truck.driverName}</strong>
                </div>

                <div className={styles.infoRow}>
                  <span>🏢 Operator:</span>
                  <span>{truck.operatorName || 'Verified Fleet Partner'}</span>
                </div>

                <div className={styles.infoRow}>
                  <span>⛽ Fuel Status:</span>
                  <div className={styles.fuelBarWrapper}>
                    <div className={styles.fuelFill} style={{ width: `${truck.fuelLevel}%` }}></div>
                    <span className={styles.fuelText}>{truck.fuelLevel}%</span>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <span>💰 Benchmark Rate:</span>
                  <strong style={{ color: '#10B981' }}>
                    Rs. {truck.ratePerKm || 190} / km
                  </strong>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  onClick={() =>
                    initiateVoIPCall({
                      id: truck.id,
                      name: truck.driverName,
                      phone: truck.driverPhone || '+92 301 2345678',
                      truck: `${truck.registrationNumber} (${truck.type})`,
                      role: 'driver',
                    })
                  }
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  📞 Call Driver Direct
                </button>
                <Link
                  href={`/dashboard/post-load?targetTruck=${encodeURIComponent(truck.registrationNumber)}`}
                  className="btn btn-success btn-sm"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  ⚡ Assign Load to Truck
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
