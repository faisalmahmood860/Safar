'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockFleetTrucks, mockLoads, mockDrivers } from '@/lib/mockData';
import { initiateVoIPCall, triggerIncomingDriverCall } from '@/lib/voipCallSystem';
import { apiClient } from '@/lib/apiClient';

export default function FleetDashboard() {
  const [activeTab, setActiveTab] = useState<'roster' | 'bidding' | 'drivers' | 'my-bids'>('my-bids');
  const [selectedTruckId, setSelectedTruckId] = useState<string>('TRK-001');
  const [selectedDriverId, setSelectedDriverId] = useState<string>('DRV-001');
  const [bidAmount, setBidAmount] = useState<string>('');
  const [selectedLoad, setSelectedLoad] = useState<typeof mockLoads[0] | null>(null);
  const [submittedBids, setSubmittedBids] = useState<any[]>([]);

  const loadSubmittedBids = async () => {
    try {
      const res = await apiClient.getBids();
      if (res && res.success && res.data && res.data.length > 0) {
        setSubmittedBids(res.data);
        return;
      }
    } catch {
      // fallback to localStorage
    }

    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('safarload_global_bids');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSubmittedBids(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSubmittedBids();

    const handleSync = () => {
      loadSubmittedBids();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('safarload_bid_change', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('safarload_bid_change', handleSync);
    };
  }, []);

  const fleetRosterDrivers = [
    { id: 'DRV-001', name: 'Tariq Mehmood', phone: '+92 301 2345678', truck: 'LHR-5678 (Trailer)', cnicVerified: true, status: 'On Duty' },
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
    const assignedTruckObj = mockFleetTrucks.find((t) => t.registrationNumber === selectedTruckId);

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

      // Save booked load ID
      const storedBookedStr = localStorage.getItem('safarload_booked_loads');
      const bookedList = storedBookedStr ? JSON.parse(storedBookedStr) : [];
      if (!bookedList.includes(selectedLoad.id)) {
        bookedList.push(selectedLoad.id);
        localStorage.setItem('safarload_booked_loads', JSON.stringify(bookedList));
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
            🏢 Al-Farooq Transport Co. | 10 Trucks | 12 Drivers
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
          <div className="stat-card-icon">🎫</div>
          <div className="stat-card-value">42 / 50 Trips</div>
          <div className="stat-card-label">Trip SaaS Pack Usage</div>
          <div className="stat-card-change positive">8 Trips Remaining (Rs. 15,000 / 50 Pack)</div>
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
                    justify: 'space-between',
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
                  <th>VoIP Call</th>
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
                    <td>
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
                      >
                        📞 Call Driver Direct
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
