'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockDriverCounterBids, mockDriverAvailabilities, DriverCounterBid, DriverAvailabilityBroadcast } from '@/lib/mockData';

export default function BrokerHubPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [activeTab, setActiveTab] = useState<'bids' | 'availability' | 'matches' | 'escrow'>('bids');
  const [bids, setBids] = useState<DriverCounterBid[]>(mockDriverCounterBids);
  const [availabilities] = useState<DriverAvailabilityBroadcast[]>(mockDriverAvailabilities);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const handlePairDriverWithShipper = (availId: string, driverName: string) => {
    alert(`🤝 SafarLoad Broker matched ${driverName} with Shipper Noor Textile Mills! Deal locked and notification sent.`);
  };

  const handleApproveBidByBroker = (bidId: string) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'accepted' } : b))
    );
    alert(`🛡️ Broker approved Driver Counter Bid ${bidId}! Escrow funds reserved.`);
  };

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Broker Top Bar */}
      <header className={styles.header}>
        <div>
          <div className={styles.brokerBadge}>🛡️ Platform Broker & Admin Hub | ڈسپیچر کنٹرول روم</div>
          <h1>SafarLoad Operations Command Center</h1>
          <p>Manage shippers (logistics senders), driver supply, automated AI matching, & counter bid negotiations across Pakistan.</p>
        </div>

        <div className={styles.headerRight}>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <Link href="/dashboard/post-load" className="btn btn-primary btn-sm">
            ➕ Post Cargo as Shipper
          </Link>
        </div>
      </header>

      {/* Platform Real-Time Metrics */}
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-card-icon">🏢</div>
          <div className="stat-card-value">1,240</div>
          <div className="stat-card-label">Registered Shippers / Organizations</div>
          <div className="stat-card-change positive">↑ +24 this week</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">🚛</div>
          <div className="stat-card-value">52,180</div>
          <div className="stat-card-label">Active Verified Drivers</div>
          <div className="stat-card-change positive">↑ 94.8% Active</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">📦</div>
          <div className="stat-card-value">Rs. 4.2M</div>
          <div className="stat-card-label">Daily Gross Freight Value</div>
          <div className="stat-card-change positive">↑ +18.4% MoM</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">Rs. 168,000</div>
          <div className="stat-card-label">Platform Daily Take Rate (4.0%)</div>
          <div className="stat-card-change positive">↑ Escrow Protected</div>
        </div>
      </div>

      {/* Control Tabs */}
      <div className={styles.tabsNav}>
        <button
          onClick={() => setActiveTab('bids')}
          className={`${styles.tabBtn} ${activeTab === 'bids' ? styles.activeTab : ''}`}
        >
          🏷️ Driver Counter Bids Desk ({bids.length})
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`${styles.tabBtn} ${activeTab === 'availability' ? styles.activeTab : ''}`}
        >
          🟢 Driver Return Radar Stream ({availabilities.length})
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`${styles.tabBtn} ${activeTab === 'matches' ? styles.activeTab : ''}`}
        >
          🤖 AI Matchmaking Engine
        </button>
        <button
          onClick={() => setActiveTab('escrow')}
          className={`${styles.tabBtn} ${activeTab === 'escrow' ? styles.activeTab : ''}`}
        >
          🛡️ Escrow Guarantee Monitor
        </button>
      </div>

      {/* TAB 1: DRIVER COUNTER BIDS DESK */}
      {activeTab === 'bids' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <h3>🏷️ All Driver Counter Bids Across Pakistan Loads</h3>
            <span className="badge badge-warning">Active Bidding Desk</span>
          </div>

          <div className="tableContainer">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Load & Route</th>
                  <th>Shipper</th>
                  <th>Driver & Vehicle</th>
                  <th>Original Rate</th>
                  <th>Offered Counter Bid</th>
                  <th>Driver Note</th>
                  <th>Status & Action</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.route}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{b.loadTitle}</div>
                    </td>
                    <td>{b.shipperName}</td>
                    <td>
                      <strong>{b.driverName} ({b.driverNameUr})</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>⭐ {b.driverRating} | {b.truckNumber}</div>
                    </td>
                    <td>Rs. {b.originalPrice.toLocaleString()}</td>
                    <td>
                      <strong style={{ color: 'var(--color-primary)', fontSize: '1.05rem' }}>
                        Rs. {b.offeredBidPrice.toLocaleString()}
                      </strong>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>"{b.bidMessage}"</td>
                    <td>
                      {b.status === 'pending' ? (
                        <button onClick={() => handleApproveBidByBroker(b.id)} className="btn btn-primary btn-sm">
                          🤝 Confirm & Lock Escrow
                        </button>
                      ) : (
                        <span className="badge badge-success">✅ Bid Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVER RETURN AVAILABILITY STREAM */}
      {activeTab === 'availability' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <h3>🟢 Real-Time Driver Fleet Availability Broadcast Stream</h3>
            <p>Drivers who just reached a city in Pakistan and announced return trip readiness.</p>
          </div>

          <div className={styles.availGrid}>
            {availabilities.map((a) => (
              <div key={a.id} className={styles.availCard}>
                <div className={styles.availHeader}>
                  <div>
                    <strong>{a.driverName} ({a.driverNameUr})</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>📍 {a.currentLocation}</div>
                  </div>
                  <span className="badge badge-info">{a.truckNumber}</span>
                </div>

                <div className={styles.destBox}>
                  <span>🎯 Desired Next Route:</span>
                  <strong style={{ color: 'var(--color-secondary)', display: 'block', marginTop: '4px' }}>
                    {a.preferredDestination}
                  </strong>
                </div>

                <div className={styles.metaRow}>
                  <span>Capacity: {a.availableCapacityTons} Tons</span>
                  <span>Departure: {a.departureTime}</span>
                </div>

                <button
                  onClick={() => handlePairDriverWithShipper(a.id, a.driverName)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  🤝 Pair Driver with Shipper Cargo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI MATCHMAKING */}
      {activeTab === 'matches' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <h3>🤖 AI Matchmaking System</h3>
            <p>Automated distance-based pairing between open cargo and nearest available trucks.</p>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>AI engine active. 14 matches paired automatically today in Multan, Karachi, Lahore, and Faisalabad.</p>
        </div>
      )}

      {/* TAB 4: ESCROW */}
      {activeTab === 'escrow' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <h3>🛡️ Escrow Payment Monitor</h3>
            <p>Track payments held in escrow and releases triggered by uploaded Bilty PODs.</p>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>Total Funds Protected in Escrow: <strong>Rs. 425,000</strong> (JazzCash & Easypaisa Gateway)</p>
        </div>
      )}
    </div>
  );
}
