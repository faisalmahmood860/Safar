'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockFleetTrucks, mockLoads, mockDrivers, pakistaniCities } from '@/lib/mockData';
import { initiateVoIPCall, triggerIncomingDriverCall } from '@/lib/voipCallSystem';
import { apiClient } from '@/lib/apiClient';

const defaultFleetTrucks: any[] = [];
const defaultFleetDrivers: any[] = [];

export default function FleetDashboard() {
  const [activeTab, setActiveTab] = useState<'roster' | 'bidding' | 'drivers' | 'my-bids'>('my-bids');
  const [selectedTruckId, setSelectedTruckId] = useState<string>('TRK-001');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('DRV-001');
  const [bidAmount, setBidAmount] = useState<string>('');
  const [selectedLoad, setSelectedLoad] = useState<typeof mockLoads[0] | null>(null);
  const [submittedBids, setSubmittedBids] = useState<any[]>([]);
  const [fleetModal, setFleetModal] = useState<'trucks' | 'drivers' | 'revenue' | 'saas' | null>(null);
  const [selectedSafetyDriver, setSelectedSafetyDriver] = useState<any>(null);

  // Dynamic Trucks and Drivers Roster State
  const [trucksList, setTrucksList] = useState<any[]>(defaultFleetTrucks);
  const [driversList, setDriversList] = useState<any[]>(defaultFleetDrivers);

  // Add Truck Form State
  const [showAddTruckModal, setShowAddTruckModal] = useState(false);
  const [newTruckReg, setNewTruckReg] = useState('');
  const [newTruckType, setNewTruckType] = useState('Flatbed Trailer (25 Tons)');
  const [newTruckDriver, setNewTruckDriver] = useState('Tariq Mehmood');
  const [newTruckCity, setNewTruckCity] = useState('Lahore');
  const [newTruckStatus, setNewTruckStatus] = useState<'idle' | 'active' | 'maintenance'>('idle');

  // Add Driver Form State
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverCnic, setNewDriverCnic] = useState('');
  const [newDriverTruck, setNewDriverTruck] = useState('Unassigned (Reserve)');
  const [newDriverStatus, setNewDriverStatus] = useState<'Available' | 'On Duty' | 'Standby'>('Available');

  useEffect(() => {
    try {
      const storedTrucks = localStorage.getItem('safarload_fleet_trucks');
      if (storedTrucks) setTrucksList(JSON.parse(storedTrucks));
      else localStorage.setItem('safarload_fleet_trucks', JSON.stringify(defaultFleetTrucks));

      const storedDrivers = localStorage.getItem('safarload_fleet_drivers');
      if (storedDrivers) setDriversList(JSON.parse(storedDrivers));
      else localStorage.setItem('safarload_fleet_drivers', JSON.stringify(defaultFleetDrivers));

      const storedBids = localStorage.getItem('safarload_global_bids');
      if (storedBids) setSubmittedBids(JSON.parse(storedBids));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleAddTruckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTruckReg.trim()) return;

    const newTruck = {
      id: `TRK-${Date.now()}`,
      registrationNumber: newTruckReg.trim().toUpperCase(),
      type: newTruckType,
      typeIcon: newTruckType.includes('Container') ? '📦' : newTruckType.includes('Shehzore') ? '🛻' : '🚛',
      driverName: newTruckDriver,
      currentCity: newTruckCity,
      fuelLevel: 100,
      nextMaintenance: '2026-10-30',
      status: newTruckStatus,
    };

    const updated = [newTruck, ...trucksList];
    setTrucksList(updated);
    try {
      localStorage.setItem('safarload_fleet_trucks', JSON.stringify(updated));
    } catch (e) { console.error(e); }

    setShowAddTruckModal(false);
    setNewTruckReg('');
    alert(`🚛 Vehicle ${newTruck.registrationNumber} added to fleet roster successfully!`);
  };

  const handleAddDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverName.trim()) return;

    const newDriver = {
      id: `DRV-${Date.now()}`,
      name: newDriverName.trim(),
      phone: newDriverPhone.trim() || '+92 300 0000000',
      cnic: newDriverCnic.trim() || '35202-0000000-1',
      truck: newDriverTruck,
      cnicVerified: true,
      status: newDriverStatus,
      safetyScore: 98,
      brakingScore: 99,
      idlingScore: 97,
      onTimeRate: '99%',
    };

    const updated = [newDriver, ...driversList];
    setDriversList(updated);
    try {
      localStorage.setItem('safarload_fleet_drivers', JSON.stringify(updated));
    } catch (e) { console.error(e); }

    setShowAddDriverModal(false);
    setNewDriverName('');
    setNewDriverPhone('');
    setNewDriverCnic('');
    alert(`👨‍✈️ Driver ${newDriver.name} registered and added to fleet directory!`);
  };

  const handleUpdateTruckStatus = (id: string, newStatus: 'idle' | 'active' | 'maintenance') => {
    const updated = trucksList.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    setTrucksList(updated);
    try {
      localStorage.setItem('safarload_fleet_trucks', JSON.stringify(updated));
    } catch (e) { console.error(e); }
  };

  const handleUpdateDriverStatus = (id: string, newStatus: 'Available' | 'On Duty' | 'Standby') => {
    const updated = driversList.map((d) => (d.id === id ? { ...d, status: newStatus } : d));
    setDriversList(updated);
    try {
      localStorage.setItem('safarload_fleet_drivers', JSON.stringify(updated));
    } catch (e) { console.error(e); }
  };

  const handleRemoveTruck = (id: string, regNum: string) => {
    if (confirm(`Are you sure you want to remove vehicle ${regNum} from your fleet roster?`)) {
      const updated = trucksList.filter((t) => t.id !== id);
      setTrucksList(updated);
      try {
        localStorage.setItem('safarload_fleet_trucks', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      alert(`🗑️ Vehicle ${regNum} removed from fleet roster.`);
    }
  };

  const handleRemoveDriver = (id: string, driverName: string) => {
    if (confirm(`Are you sure you want to remove driver ${driverName} from your fleet directory?`)) {
      const updated = driversList.filter((d) => d.id !== id);
      setDriversList(updated);
      try {
        localStorage.setItem('safarload_fleet_drivers', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      alert(`🗑️ Driver ${driverName} removed from fleet directory.`);
    }
  };

  const handleOpenFleetBidModal = (load: typeof mockLoads[0]) => {
    setSelectedLoad(load);
    setBidAmount(load.price.toString());
  };

  const handleFleetBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad) return;
    const selectedDriver = driversList.find((d) => d.id === selectedDriverId);
    const assignedTruckObj = trucksList.find((t) => t.registrationNumber === selectedTruckId);

    const newFleetBid = {
      id: `BID-FLT-${Date.now()}`,
      loadId: selectedLoad.id,
      loadTitle: `${selectedLoad.cargoType} — ${selectedLoad.pickupCity} to ${selectedLoad.dropoffCity}`,
      route: `${selectedLoad.pickupCity} → ${selectedLoad.dropoffCity}`,
      shipperName: selectedLoad.shipperName,
      driverName: selectedDriver?.name || 'Tariq Mehmood',
      driverNameUr: selectedDriver?.name || 'محمد اسلم',
      driverPhone: selectedDriver?.phone || '+92 301 2345678',
      driverRating: 4.9,
      driverTrips: 520,
      truckNumber: selectedTruckId,
      truckType: assignedTruckObj ? assignedTruckObj.type : selectedLoad.truckType,
      originalPrice: selectedLoad.price,
      offeredBidPrice: Number(bidAmount),
      bidMessage: `Fleet Booking Locked by Al-Farooq Transport. Assigned Vehicle: ${selectedTruckId} | Assigned Driver: ${selectedDriver?.name}`,
      submittedTime: 'Just now',
      status: 'accepted' as const,
      lastUpdatedBy: 'fleet' as const,
    };

    try {
      // Persist to SQLite Database via Backend API
      apiClient.createBid(newFleetBid).catch(console.error);
      apiClient.updateLoadStatus(selectedLoad.id, 'booked').catch(console.error);

      // Save bid record
      const storedBidsStr = localStorage.getItem('safarload_global_bids');
      let bidsList = storedBidsStr ? JSON.parse(storedBidsStr) : [];
      bidsList = bidsList.filter((b: any) => b.loadId !== selectedLoad.id);
      bidsList.unshift(newFleetBid);
      localStorage.setItem('safarload_global_bids', JSON.stringify(bidsList));
      setSubmittedBids(bidsList);

      // Save booked load ID
      const storedBookedStr = localStorage.getItem('safarload_booked_loads');
      const bookedList = storedBookedStr ? JSON.parse(storedBookedStr) : [];
      if (!bookedList.includes(selectedLoad.id)) {
        bookedList.push(selectedLoad.id);
        localStorage.setItem('safarload_booked_loads', JSON.stringify(bookedList));
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_bid_change'));
        window.dispatchEvent(new Event('safarload_loads_change'));
      }
    } catch (err) {
      console.error(err);
    }

    alert(
      `🚚 Fleet Vehicle & Driver Assigned Successfully!\n\n🏢 Company: Al-Farooq Transport Co.\n🚛 Assigned Vehicle: ${selectedTruckId} (${assignedTruckObj?.type || 'Trailer'})\n👨‍✈️ Assigned Driver: ${selectedDriver?.name} (${selectedDriver?.phone})\n📍 Route: ${selectedLoad.pickupCity} → ${selectedLoad.dropoffCity}\n💰 Locked Rate: Rs. ${Number(bidAmount).toLocaleString()}\n\nEscrow payment locked! Shipment moved to Active Booked Trips.`
    );
    setSelectedLoad(null);
  };

  const handleFleetAcceptShipperCounter = (bidId: string) => {
    try {
      // Persist update in SQLite Database
      apiClient.updateBid(bidId, { status: 'accepted' }).catch(console.error);

      const stored = localStorage.getItem('safarload_global_bids');
      let list = stored ? JSON.parse(stored) : [];
      list = list.map((b: any) =>
        b.id === bidId
          ? {
              ...b,
              status: 'accepted',
              offeredBidPrice: b.shipperCounterPrice || b.offeredBidPrice,
              bidMessage: 'Fleet Owner accepted Shipper Counter Offer! Deal Locked.',
            }
          : b
      );
      localStorage.setItem('safarload_global_bids', JSON.stringify(list));
      setSubmittedBids(list);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_bid_change'));
      }
      alert('✅ Shipper counter offer accepted! Deal locked and Escrow funds secured.');
    } catch (e) {
      console.error(e);
    }
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
            🏢 Al-Farooq Transport Co. | {trucksList.length} Trucks | {driversList.length} Drivers
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() =>
              triggerIncomingDriverCall({
                id: 'DRV-001',
                name: 'Tariq Mehmood',
                phone: '+92 301 2345678',
                truck: 'LHR-5678 (Trailer)',
                role: 'driver',
              })
            }
            className="btn btn-warning btn-sm"
          >
            🧪 Test Incoming Driver Call
          </button>
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
        <div onClick={() => setFleetModal('trucks')} className="stat-card" style={{ cursor: 'pointer' }} title="Click for Fleet Telematics & Roster">
          <div className="stat-card-icon">🚛</div>
          <div className="stat-card-value">{trucksList.length}</div>
          <div className="stat-card-label">Total Fleet Trucks</div>
          <div className="stat-card-change positive">
            {trucksList.filter((t) => t.status === 'active').length} Active | {trucksList.filter((t) => t.status === 'idle').length} Idle
          </div>
        </div>

        <div onClick={() => setFleetModal('drivers')} className="stat-card" style={{ cursor: 'pointer' }} title="Click for Driver Verification Roster">
          <div className="stat-card-icon">👨‍✈️</div>
          <div className="stat-card-value">{driversList.length}</div>
          <div className="stat-card-label">Verified Fleet Drivers</div>
          <div className="stat-card-change positive">100% CNIC Verified</div>
        </div>

        <div onClick={() => setFleetModal('revenue')} className="stat-card" style={{ cursor: 'pointer' }} title="Click for Gross Revenue Ledger">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">Rs. 1,420,000</div>
          <div className="stat-card-label">Monthly Gross Revenue</div>
          <div className="stat-card-change positive">↑ +14% MoM (Click for Breakdown)</div>
        </div>

        <div onClick={() => setFleetModal('saas')} className="stat-card" style={{ cursor: 'pointer' }} title="Click for SaaS Pack Renewal Options">
          <div className="stat-card-icon">🎫</div>
          <div className="stat-card-value">42 / 50 Trips</div>
          <div className="stat-card-label">Trip SaaS Pack Usage</div>
          <div className="stat-card-change positive">8 Trips Remaining (Click for SaaS Pack)</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabsRow}>
        <button
          onClick={() => setActiveTab('my-bids')}
          className={`${styles.tabBtn} ${activeTab === 'my-bids' ? styles.activeTab : ''}`}
        >
          🏷️ My Submitted Fleet Bids & Status Tracker ({submittedBids.length})
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`${styles.tabBtn} ${activeTab === 'roster' ? styles.activeTab : ''}`}
        >
          🚛 Fleet Vehicle Roster ({trucksList.length} Trucks)
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`${styles.tabBtn} ${activeTab === 'drivers' ? styles.activeTab : ''}`}
        >
          👨‍✈️ Fleet Drivers Directory ({driversList.length} Drivers)
        </button>
        <button
          onClick={() => setActiveTab('bidding')}
          className={`${styles.tabBtn} ${activeTab === 'bidding' ? styles.activeTab : ''}`}
        >
          📋 Fleet Cargo Bidding & Load Assignment
        </button>
      </div>

      {/* TAB 0: SUBMITTED FLEET BIDS & STATUS TRACKER */}
      {activeTab === 'my-bids' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>🏷️ My Submitted Fleet Bids & Live Status Tracker</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Track real-time approval status of bids submitted by Al-Farooq Transport Co. to shippers.
              </p>
            </div>
            <span className="badge badge-info">{submittedBids.length} Bids Tracked</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
            {submittedBids.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
                📋 No active fleet bids submitted yet. Go to <strong>Fleet Cargo Bidding</strong> tab to submit a bid and assign trucks!
              </div>
            ) : (
              submittedBids.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: `1px solid ${
                      b.status === 'accepted'
                        ? '#10B981'
                        : b.status === 'pending'
                        ? '#F59E0B'
                        : b.status === 'rejected'
                        ? '#EF4444'
                        : '#3B82F6'
                    }`,
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem' }}>{b.loadTitle || b.route}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        🏢 Shipper: {b.shipperName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10B981' }}>
                        Rs. {b.offeredBidPrice.toLocaleString()}
                      </div>
                      {b.shipperCounterPrice && (
                        <div style={{ fontSize: '0.72rem', color: '#F59E0B', textDecoration: 'line-through' }}>
                          Revised: Rs. {b.shipperCounterPrice.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ margin: '0.25rem 0' }}>
                    {b.status === 'pending' && (
                      <span className="badge badge-warning" style={{ fontSize: '0.825rem', padding: '0.4rem 0.85rem' }}>
                        🟡 Pending Shipper Review (شپر کی منظوری کا انتظار)
                      </span>
                    )}
                    {b.status === 'accepted' && (
                      <span className="badge badge-success" style={{ fontSize: '0.825rem', padding: '0.4rem 0.85rem' }}>
                        🟢 ACCEPTED & ESCROW LOCKED! (شپر نے بولی قبول کر لی)
                      </span>
                    )}
                    {b.status === 'rejected' && (
                      <span className="badge badge-accent" style={{ fontSize: '0.825rem', padding: '0.4rem 0.85rem' }}>
                        🔴 Rejected by Shipper (بولی مسترد)
                      </span>
                    )}
                    {b.lastUpdatedBy === 'shipper' && b.status === 'pending' && (
                      <span className="badge badge-info" style={{ fontSize: '0.825rem', padding: '0.4rem 0.85rem' }}>
                        🔄 Shipper Counter Offer Received!
                      </span>
                    )}
                  </div>

                  {/* Driver & Truck Details */}
                  <div style={{ fontSize: '0.85rem', background: 'rgba(15, 23, 42, 0.5)', padding: '0.75rem', borderRadius: '10px' }}>
                    <p style={{ margin: '0 0 4px 0' }}>🚛 <strong>Assigned Vehicle:</strong> {b.truckNumber} ({b.truckType})</p>
                    <p style={{ margin: '0 0 4px 0' }}>👨‍✈️ <strong>Assigned Driver:</strong> {b.driverName} ({b.driverPhone})</p>
                    <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>💬 "{b.bidMessage}"</p>
                  </div>

                  {/* Action Controls */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {b.lastUpdatedBy === 'shipper' && b.shipperCounterPrice && (
                      <button
                        onClick={() => handleFleetAcceptShipperCounter(b.id)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%' }}
                      >
                        ⚡ Accept Shipper Counter Rate (Rs. {b.shipperCounterPrice.toLocaleString()})
                      </button>
                    )}

                    {b.status === 'accepted' && (
                      <>
                        <button
                          onClick={() =>
                            initiateVoIPCall({
                              id: b.id,
                              name: b.driverName,
                              phone: b.driverPhone,
                              truck: `${b.truckNumber} (${b.truckType})`,
                              role: 'driver',
                            })
                          }
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                        >
                          📞 Call Driver
                        </button>
                        <Link href="/dashboard/tracking" className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                          📍 Live GPS Map
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 1: FLEET TRUCKS ROSTER */}
      {activeTab === 'roster' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>🚛 Active Fleet Vehicles & Real-Time Status</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Manage operational status and track vehicle telematics across your active fleet.
              </p>
            </div>
            <button onClick={() => setShowAddTruckModal(true)} className="btn btn-primary btn-sm">
              ➕ Add New Truck
            </button>
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
                  <th>Status / Availability</th>
                  <th>Roster Actions</th>
                </tr>
              </thead>
              <tbody>
                {trucksList.map((t) => (
                  <tr key={t.id}>
                    <td><strong>{t.registrationNumber}</strong></td>
                    <td>{t.typeIcon || '🚛'} {t.type}</td>
                    <td>👨‍✈️ {t.driverName}</td>
                    <td>📍 {t.currentCity}</td>
                    <td>
                      <div className={styles.fuelMeter}>
                        <div className={styles.fuelFill} style={{ width: `${t.fuelLevel || 100}%` }}></div>
                        <span>{t.fuelLevel || 100}%</span>
                      </div>
                    </td>
                    <td>Next: {t.nextMaintenance || '2026-10-30'}</td>
                    <td>
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateTruckStatus(t.id, e.target.value as 'idle' | 'active' | 'maintenance')}
                        className="input input-sm"
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          background: t.status === 'active' ? '#064E3B' : t.status === 'idle' ? '#1E3A8A' : '#78350F',
                          color: '#F8FAFC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="idle">Idle / Available (فارغ)</option>
                        <option value="active">Active / On Route (راستے میں)</option>
                        <option value="maintenance">In Maintenance (مرمت)</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() =>
                            initiateVoIPCall({
                              id: t.id,
                              name: t.driverName,
                              phone: '+92 301 2345678',
                              truck: `${t.registrationNumber} (${t.type})`,
                              role: 'driver',
                            })
                          }
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          📞 Call
                        </button>
                        <button
                          onClick={() => handleRemoveTruck(t.id, t.registrationNumber)}
                          className="btn btn-sm"
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Remove truck from fleet roster"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FLEET DRIVERS ROSTER */}
      {activeTab === 'drivers' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>👨‍✈️ Fleet Drivers Directory ({driversList.length} Drivers)</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Manage company driver roster, NADRA CNIC KYC status, and duty availability.
              </p>
            </div>
            <button onClick={() => setShowAddDriverModal(true)} className="btn btn-primary btn-sm">
              ➕ Add New Driver
            </button>
          </div>

          <div className="tableContainer">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Phone Number</th>
                  <th>Assigned Vehicle</th>
                  <th>DRIVE Safety Score</th>
                  <th>KYC CNIC Status</th>
                  <th>Duty Availability</th>
                  <th>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {driversList.map((d) => (
                  <tr key={d.id}>
                    <td><strong>👨‍✈️ {d.name}</strong></td>
                    <td>{d.phone}</td>
                    <td>🚛 {d.truck}</td>
                    <td>
                      <button
                        onClick={() => setSelectedSafetyDriver(d)}
                        className="btn btn-glass btn-sm"
                        style={{ color: '#10B981', fontWeight: 800, cursor: 'pointer' }}
                        title="Click to view Motive DRIVE Safety Score Breakdown"
                      >
                        ⭐ {d.safetyScore || 95} / 100
                      </button>
                    </td>
                    <td><span className="badge badge-success">✅ CNIC Verified</span></td>
                    <td>
                      <select
                        value={d.status}
                        onChange={(e) => handleUpdateDriverStatus(d.id, e.target.value as 'Available' | 'On Duty' | 'Standby')}
                        className="input input-sm"
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8rem',
                          borderRadius: '6px',
                          fontWeight: 600,
                          background: d.status === 'Available' ? '#064E3B' : d.status === 'On Duty' ? '#1E3A8A' : '#78350F',
                          color: '#F8FAFC',
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="Available">Available (دستیاب)</option>
                        <option value="On Duty">On Duty (ڈیوٹی پر)</option>
                        <option value="Standby">Standby Reserve (ریزرو)</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() =>
                            initiateVoIPCall({
                              id: d.id,
                              name: d.name,
                              phone: d.phone,
                              truck: d.truck,
                              role: 'driver',
                            })
                          }
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          📞 Call
                        </button>
                        <button
                          onClick={() => handleRemoveDriver(d.id, d.name)}
                          className="btn btn-sm"
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                          title="Remove driver from fleet directory"
                        >
                          🗑️ Remove
                        </button>
                      </div>
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

      {/* ADD TRUCK MODAL */}
      {showAddTruckModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🚛 Add New Vehicle to Fleet Roster</h3>
              <button onClick={() => setShowAddTruckModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleAddTruckSubmit}>
              <div className={styles.inputGroup}>
                <label>Registration Number (گاڑی کا نمبر)</label>
                <input
                  type="text"
                  placeholder="e.g. LHR-9900"
                  value={newTruckReg}
                  onChange={(e) => setNewTruckReg(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Vehicle Type (گاڑی کی قسم)</label>
                <select value={newTruckType} onChange={(e) => setNewTruckType(e.target.value)} className="input">
                  <option value="Flatbed Trailer (25 Tons)">Flatbed Trailer (25 Tons)</option>
                  <option value="Container (22ft / 20 Tons)">Container (22ft / 20 Tons)</option>
                  <option value="Container (40ft / 35 Tons)">Container (40ft / 35 Tons)</option>
                  <option value="Dumper Truck (30 Tons)">Dumper Truck (30 Tons)</option>
                  <option value="22-Wheeler Heavy Trailer">22-Wheeler Heavy Trailer</option>
                  <option value="Bedford Open Rig (15 Tons)">Bedford Open Rig (15 Tons)</option>
                  <option value="Mazda Master (10 Tons)">Mazda Master (10 Tons)</option>
                  <option value="Shehzore Pickup (3 Tons)">Shehzore Pickup (3 Tons)</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Assigned Driver Name (ڈرائیور)</label>
                <select value={newTruckDriver} onChange={(e) => setNewTruckDriver(e.target.value)} className="input">
                  {driversList.map((d) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.phone})</option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Current Location City (شہر)</label>
                <select value={newTruckCity} onChange={(e) => setNewTruckCity(e.target.value)} className="input">
                  {pakistaniCities.map((c: any) => {
                    const cityName = typeof c === 'string' ? c : c.en;
                    const cityUr = typeof c === 'string' ? c : c.ur;
                    return (
                      <option key={cityName} value={cityName}>
                        {cityName} ({cityUr})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Initial Fleet Status (حالت)</label>
                <select value={newTruckStatus} onChange={(e) => setNewTruckStatus(e.target.value as any)} className="input">
                  <option value="idle">Idle / Available (فارغ)</option>
                  <option value="active">Active / On Route (راستے میں)</option>
                  <option value="maintenance">Maintenance (مرمت)</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAddTruckModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  ➕ Save Vehicle to Fleet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD DRIVER MODAL */}
      {showAddDriverModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>👨‍✈️ Register New Driver to Fleet Directory</h3>
              <button onClick={() => setShowAddDriverModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleAddDriverSubmit}>
              <div className={styles.inputGroup}>
                <label>Driver Full Name (ڈرائیور کا نام)</label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Mehmood"
                  value={newDriverName}
                  onChange={(e) => setNewDriverName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Phone Number (فون نمبر)</label>
                <input
                  type="text"
                  placeholder="e.g. +92 301 2345678"
                  value={newDriverPhone}
                  onChange={(e) => setNewDriverPhone(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>CNIC Number (شناختی کارڈ)</label>
                <input
                  type="text"
                  placeholder="e.g. 35202-1234567-1"
                  value={newDriverCnic}
                  onChange={(e) => setNewDriverCnic(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Assigned Vehicle (گاڑی)</label>
                <select value={newDriverTruck} onChange={(e) => setNewDriverTruck(e.target.value)} className="input">
                  <option value="Unassigned (Reserve)">Unassigned (Reserve)</option>
                  {trucksList.map((t) => (
                    <option key={t.id} value={`${t.registrationNumber} (${t.type})`}>
                      {t.registrationNumber} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Duty Availability Status</label>
                <select value={newDriverStatus} onChange={(e) => setNewDriverStatus(e.target.value as any)} className="input">
                  <option value="Available">Available (دستیاب)</option>
                  <option value="On Duty">On Duty (ڈیوٹی پر)</option>
                  <option value="Standby">Standby Reserve (ریزرو)</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAddDriverModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  ➕ Register Driver
                </button>
              </div>
            </form>
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
                  {trucksList.map((t) => (
                    <option key={t.id} value={t.registrationNumber}>
                      {t.registrationNumber} ({t.type}) — Located in {t.currentCity}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Assign Fleet Driver (ڈرائیور منتخب کریں)</label>
                <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="input">
                  {driversList.map((d) => (
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

      {/* FLEET KPI BREAKDOWN MODAL */}
      {fleetModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>
                {fleetModal === 'trucks' && `🚛 Fleet Vehicle Telematics & Roster (${trucksList.length} Trucks)`}
                {fleetModal === 'drivers' && `👨‍✈️ Fleet Drivers CNIC & License Directory (${driversList.length} Drivers)`}
                {fleetModal === 'revenue' && '💰 Fleet Revenue & Escrow Settlement Breakdown'}
                {fleetModal === 'saas' && '🎫 Fleet SaaS Trip Pack Subscription'}
              </h3>
              <button onClick={() => setFleetModal(null)} className={styles.closeBtn}>✕</button>
            </div>

            <div style={{ padding: '1.25rem', lineHeight: 1.6 }}>
              {fleetModal === 'trucks' && (
                <div>
                  <p>
                    <strong>Fleet Status:</strong> {trucksList.filter((t) => t.status === 'active').length} Active Vehicles on Route |{' '}
                    {trucksList.filter((t) => t.status === 'idle').length} Available Idle at Base Hubs
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {trucksList.slice(0, 5).map((t) => (
                      <li key={t.id}>
                        {t.status === 'active' ? '✅' : '⏸️'} <strong>{t.registrationNumber} ({t.type}):</strong> {t.status === 'active' ? `Active near ${t.currentCity} (GPS Online 🟢)` : `Available at ${t.currentCity} Hub`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {fleetModal === 'drivers' && (
                <div>
                  <p><strong>Total Verified Fleet Drivers:</strong> {driversList.length} Commercial Heavy Transport Drivers</p>
                  <p><strong>CNIC Status:</strong> 100% Verified via NADRA Security Database</p>
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                    ✅ All {driversList.length} drivers carry valid HTV / LTV Commercial Driving Licenses and Emergency Medical Insurance.
                  </div>
                </div>
              )}

              {fleetModal === 'revenue' && (
                <div>
                  <p><strong>Gross Monthly Revenue:</strong> <strong style={{ color: '#10B981', fontSize: '1.2rem' }}>Rs. 1,420,000</strong></p>
                  <p><strong>Escrow Funds Secured:</strong> Rs. 980,000 Locked | <strong>Cleared Payouts:</strong> Rs. 440,000</p>
                  <p><strong>Platform Fees Paid (4%):</strong> Rs. 56,800</p>
                </div>
              )}

              {fleetModal === 'saas' && (
                <div>
                  <p><strong>Current Active Subscription:</strong> Al-Farooq Transport SaaS Tier 2</p>
                  <p><strong>Trips Consumed:</strong> 42 / 50 Trips (8 Trips Remaining)</p>
                  <p><strong>Renewal Rate:</strong> Rs. 15,000 / 50 Trip Dispatch Pack</p>
                  <button onClick={() => { alert('💳 SaaS 50-Trip Pack Renewed! 50 new trip credits added.'); setFleetModal(null); }} className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                    💳 Topup & Renew 50-Trip Pack Now
                  </button>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setFleetModal(null)} className="btn btn-glass">
                Close Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOTIVE-STYLE DRIVE SAFETY SCORE BREAKDOWN MODAL */}
      {selectedSafetyDriver && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '580px', border: '1px solid #10B981' }}>
            <div className={styles.modalHeader} style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <h3 style={{ color: '#10B981' }}>⭐ Motive DRIVE Safety Score: {selectedSafetyDriver.name}</h3>
              <button onClick={() => setSelectedSafetyDriver(null)} className={styles.closeBtn}>✕</button>
            </div>

            <div style={{ padding: '1.25rem', lineHeight: 1.6, color: '#F8FAFC' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem', background: '#1E293B', padding: '1rem', borderRadius: '14px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#10B981' }}>{selectedSafetyDriver.safetyScore || 95} / 100</div>
                <div style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>Overall Driving Performance Index (Top 5% Carrier Network)</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: '#1E293B', padding: '0.85rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Smooth Driving & Braking:</div>
                  <strong style={{ color: '#10B981', fontSize: '1.1rem' }}>{selectedSafetyDriver.brakingScore || 95} / 100</strong>
                </div>

                <div style={{ background: '#1E293B', padding: '0.85rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>On-Time Arrival Rate:</div>
                  <strong style={{ color: '#38BDF8', fontSize: '1.1rem' }}>{selectedSafetyDriver.onTimeRate || '98%'}</strong>
                </div>

                <div style={{ background: '#1E293B', padding: '0.85rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Engine Idle Time Efficiency:</div>
                  <strong style={{ color: '#F59E0B', fontSize: '1.1rem' }}>{selectedSafetyDriver.idlingScore || 92} / 100</strong>
                </div>

                <div style={{ background: '#1E293B', padding: '0.85rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Safety Violations:</div>
                  <strong style={{ color: '#10B981', fontSize: '1.1rem' }}>0 Risk Alerts</strong>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setSelectedSafetyDriver(null)} className="btn btn-primary">
                Close Safety Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
