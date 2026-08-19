'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockFleetTrucks, mockLoads, mockDrivers } from '@/lib/mockData';

export default function FleetDashboard() {
  const [activeTab, setActiveTab] = useState<'roster' | 'bidding' | 'drivers'>('roster');
  const [selectedTruckId, setSelectedTruckId] = useState<string>('TRK-001');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('DRV-001');
  const [bidAmount, setBidAmount] = useState<string>('');
  const [selectedLoad, setSelectedLoad] = useState<typeof mockLoads[0] | null>(null);

  const fleetRosterDrivers = [
    { id: 'DRV-001', name: 'Muhammad Aslam', phone: '+92 301 2345678', truck: 'LHR-5678 (Trailer)', cnicVerified: true, status: 'On Duty' },
    { id: 'DRV-002', name: 'Abdul Rasheed', phone: '+92 333 9876543', truck: 'KHI-1234 (Container)', cnicVerified: true, status: 'On Duty' },
    { id: 'DRV-003', name: 'Tariq Mehmood', phone: '+92 321 5551234', truck: 'FSD-9012 (Dumper)', cnicVerified: true, status: 'Available' },
    { id: 'DRV-004', name: 'Shahbaz Ali', phone: '+92 300 7778899', truck: 'RWP-3456 (22-Wheeler)', cnicVerified: true, status: 'Available' },
    { id: 'DRV-005', name: 'Khan Muhammad', phone: '+92 302 1122334', truck: 'PSH-7890 (Bedford)', cnicVerified: true, status: 'On Duty' },
    { id: 'DRV-006', name: 'Zahid Khan', phone: '+92 304 9988776', truck: 'MLT-4567 (Trailer)', cnicVerified: true, status: 'Available' },
    { id: 'DRV-007', name: 'Kamran Akmal', phone: '+92 305 4433221', truck: 'LHR-9988 (Container)', cnicVerified: true, status: 'On Duty' },
    { id: 'DRV-008', name: 'Rizwan Ahmed', phone: '+92 306 6655443', truck: 'ISB-1122 (Mazda)', cnicVerified: true, status: 'Available' },
    { id: 'DRV-009', name: 'Imran Shah', phone: '+92 307 8899001', truck: 'GUJ-3344 (Trailer)', cnicVerified: true, status: 'Available' },
    { id: 'DRV-010', name: 'Farooq Azam', phone: '+92 308 2233445', truck: 'SKT-5566 (Shehzore)', cnicVerified: true, status: 'Available' },
    { id: 'DRV-011', name: 'Bilal Hassan', phone: '+92 309 7766554', truck: 'Unassigned (Reserve)', cnicVerified: true, status: 'Standby' },
    { id: 'DRV-012', name: 'Noman Riaz', phone: '+92 310 1144778', truck: 'Unassigned (Reserve)', cnicVerified: true, status: 'Standby' },
  ];

  const handleOpenFleetBidModal = (load: typeof mockLoads[0]) => {
    setSelectedLoad(load);
    setBidAmount(load.price.toString());
  };

  const handleFleetBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad) return;
    const selectedDriver = fleetRosterDrivers.find((d) => d.id === selectedDriverId);
    alert(`🚚 Fleet Bid Submitted!\nCompany: Al-Farooq Transport\nAssigned Truck: ${selectedTruckId}\nAssigned Driver: ${selectedDriver?.name}\nBid Price: Rs. ${Number(bidAmount).toLocaleString()} (Excl. 4% Commission)\nTolls & Challan Protection Included.`);
    setSelectedLoad(null);
  };

  return (
    <div className={styles.container} dir="ltr">
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Fleet Command Center <span className={styles.titleUrdu}>/ فلیٹ کمانڈ سینٹر</span>
          </h1>
          <div className={styles.badge} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            🏢 Al-Farooq Transport Co. | 10 Trucks | 12 Drivers
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard/loads" className="btn btn-primary btn-sm">
            📋 Find Live Cargo Loads
          </Link>
          <Link href="/dashboard/tracking" className="btn btn-outline btn-sm">
            📍 GPS Fleet Map
          </Link>
        </div>
      </header>

      {/* Fleet Overview Metrics */}
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-card-icon">🚛</div>
          <div className="stat-card-value">10</div>
          <div className="stat-card-label">Total Fleet Trucks</div>
          <div className="stat-card-change positive">6 Active | 4 Idle</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">👨‍✈️</div>
          <div className="stat-card-value">12</div>
          <div className="stat-card-label">Verified Fleet Drivers</div>
          <div className="stat-card-change positive">100% CNIC Verified</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">Rs. 1,420,000</div>
          <div className="stat-card-label">Monthly Gross Revenue</div>
          <div className="stat-card-change positive">↑ +14% MoM</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">⛽</div>
          <div className="stat-card-value">Rs. 420,000</div>
          <div className="stat-card-label">Fuel Advances Claimed</div>
          <div className="stat-card-change positive">JazzCash Escrow</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabsRow}>
        <button
          onClick={() => setActiveTab('roster')}
          className={`${styles.tabBtn} ${activeTab === 'roster' ? styles.activeTab : ''}`}
        >
          🚛 Fleet Vehicle Roster (10 Trucks)
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`${styles.tabBtn} ${activeTab === 'drivers' ? styles.activeTab : ''}`}
        >
          👨‍✈️ Fleet Drivers Directory (12 Drivers)
        </button>
        <button
          onClick={() => setActiveTab('bidding')}
          className={`${styles.tabBtn} ${activeTab === 'bidding' ? styles.activeTab : ''}`}
        >
          📋 Fleet Cargo Bidding & Load Assignment
        </button>
      </div>

      {/* TAB 1: FLEET TRUCKS ROSTER */}
      {activeTab === 'roster' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <h3>🚛 Active Fleet Vehicles & Real-Time Status</h3>
            <span className="badge badge-success">10 Vehicles Monitored</span>
          </div>

          <div className="tableContainer">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Truck Reg #</th>
                  <th>Vehicle Type</th>
                  <th>Assigned Driver</th>
                  <th>Current City</th>
                  <th>Fuel Level</th>
                  <th>Maintenance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockFleetTrucks.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.registrationNumber}</strong></td>
                    <td>{t.typeIcon} {t.type}</td>
                    <td>👨‍✈️ {t.driverName}</td>
                    <td>📍 {t.currentCity}</td>
                    <td>
                      <div className={styles.fuelMeter}>
                        <div className={styles.fuelFill} style={{ width: `${t.fuelLevel}%` }}></div>
                        <span>{t.fuelLevel}%</span>
                      </div>
                    </td>
                    <td>Next: {t.nextMaintenance}</td>
                    <td>
                      {t.status === 'active' && <span className="badge badge-success">Active / راستے میں</span>}
                      {t.status === 'idle' && <span className="badge badge-info">Idle / فارغ</span>}
                      {t.status === 'maintenance' && <span className="badge badge-warning">Maintenance</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FLEET DRIVERS ROSTER (12 DRIVERS) */}
      {activeTab === 'drivers' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <h3>👨‍✈️ Fleet Drivers Directory (12 Company Drivers)</h3>
            <span className="badge badge-success">12 CNIC Verified</span>
          </div>

          <div className="tableContainer">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Phone Number</th>
                  <th>Assigned Vehicle</th>
                  <th>KYC CNIC Status</th>
                  <th>Duty Status</th>
                  <th>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {fleetRosterDrivers.map((d) => (
                  <tr key={d.id}>
                    <td><strong>👨‍✈️ {d.name}</strong></td>
                    <td>{d.phone}</td>
                    <td>🚛 {d.truck}</td>
                    <td><span className="badge badge-success">✅ CNIC Verified</span></td>
                    <td>
                      {d.status === 'On Duty' && <span className="badge badge-info">On Duty</span>}
                      {d.status === 'Available' && <span className="badge badge-success">Available</span>}
                      {d.status === 'Standby' && <span className="badge badge-warning">Standby Reserve</span>}
                    </td>
                    <td>
                      <button onClick={() => alert(`📞 Contacting ${d.name} (${d.phone})...`)} className="btn btn-glass btn-sm">
                        📞 Call Driver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FLEET LOAD MARKETPLACE & BIDDING */}
      {activeTab === 'bidding' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <h3>📋 Fleet Cargo Marketplace & Direct Bidding</h3>
            <p>Accept fixed rates or submit fleet counter bids and assign specific trucks & drivers.</p>
          </div>

          <div className={styles.loadsGrid}>
            {mockLoads.map((load) => (
              <div key={load.id} className={styles.fleetLoadCard}>
                <div className={styles.loadHeaderRow}>
                  <strong>{load.pickupCity} → {load.dropoffCity}</strong>
                  <span className={styles.priceTag}>Rs. {load.price.toLocaleString()}</span>
                </div>

                <div className={styles.loadMeta}>
                  <p>📦 Cargo: {load.cargoType} ({load.weight} Tons)</p>
                  <p>🚛 Required: {load.truckType}</p>
                  <p>🏢 Shipper: {load.shipperName}</p>
                </div>

                <div className={styles.cardActions}>
                  <button onClick={() => handleOpenFleetBidModal(load)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    ⚡ Submit Fleet Bid & Assign Truck
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FLEET BIDDING & TRUCK ASSIGNMENT MODAL */}
      {selectedLoad && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🚚 Fleet Bid & Driver Assignment — {selectedLoad.pickupCity} → {selectedLoad.dropoffCity}</h3>
              <button onClick={() => setSelectedLoad(null)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleFleetBidSubmit}>
              <div className={styles.inputGroup}>
                <label>Select Fleet Vehicle (گاڑی منتخب کریں)</label>
                <select value={selectedTruckId} onChange={(e) => setSelectedTruckId(e.target.value)} className="input">
                  {mockFleetTrucks.map((t) => (
                    <option key={t.id} value={t.registrationNumber}>
                      {t.registrationNumber} ({t.type}) — Located in {t.currentCity}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Assign Fleet Driver (ڈرائیور منتخب کریں)</label>
                <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="input">
                  {fleetRosterDrivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.phone}) — Status: {d.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Fleet Freight Rate Bid (PKR - Excl. 4% Commission)</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="input input-lg"
                  required
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  * SafarLoad 4% Commission (Rs. {(Number(bidAmount) * 0.04).toLocaleString()}) added upon deal lock. Includes Tolls & Challan Protection.
                </span>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setSelectedLoad(null)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  🚀 Confirm Fleet Bid & Lock Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
