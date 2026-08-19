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

      {/* TAB 4: ESCROW PAYMENT & TRANSACTION MECHANISM HUB */}
      {activeTab === 'escrow' && (
        <div className={`${styles.panelCard} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>💳 Complete End-to-End Payment & Transaction Mechanism Hub</h3>
              <p>Model 3 Dual-Sided Marketplace Clearing Engine (2.0% Shipper Fee + 3.0% Driver QuickPay Fee).</p>
            </div>
            <span className="badge badge-success">Model 3 Dual Escrow Active</span>
          </div>

          {/* Interactive Calculation Demo Card */}
          <div style={{ padding: '1.25rem', background: 'var(--color-bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--color-primary)', marginTop: 0, marginBottom: '0.75rem' }}>
              📊 Model 3 Transaction Ledger Calculation (Example: Rs. 150,000 Base Freight)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--color-bg-dark)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>1. Shipper Escrow Deposit</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>Rs. 153,000</div>
                <small style={{ color: 'var(--color-text-secondary)' }}>Rs. 150,000 Base + 2% Escrow Fee (Rs. 3,000)</small>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--color-bg-dark)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>2. Tranche 1: 30% Fuel Advance</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B' }}>Rs. 43,650</div>
                <small style={{ color: 'var(--color-text-secondary)' }}>Disbursed instantly via JazzCash on trip start</small>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--color-bg-dark)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>3. Tranche 2: 70% Bilty Settlement</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>Rs. 101,850</div>
                <small style={{ color: 'var(--color-text-secondary)' }}>Released to Driver upon Digital POD verification</small>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--color-bg-dark)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>4. SafarLoad Net Profit</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#8B5CF6' }}>Rs. 7,500</div>
                <small style={{ color: 'var(--color-text-secondary)' }}>5.0% Combined Platform Revenue Realized</small>
              </div>
            </div>
          </div>

          {/* Step-by-Step Lifecycle Tranches */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--color-bg-primary)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>Step 1: Shipper Escrow Deposit 🏦</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
                Shipper posts route and transfers <strong>Rs. 153,000</strong> (Base + 2% Fee) into SafarLoad Corporate Escrow Account via 1Link IBFT / Card. Funds are locked safely (`STATUS: ESCROW_SECURED`).
              </p>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--color-bg-primary)' }}>
              <strong style={{ color: '#F59E0B' }}>Step 2: 30% JazzCash Fuel Advance ⛽</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
                When Driver arrives at pickup warehouse and clicks "Start Trip", SafarLoad automatically transfers <strong>Rs. 43,650</strong> (30% of Net Rs. 145,500) to Driver JazzCash/Easypaisa for diesel.
              </p>
            </div>

            <div style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--color-bg-primary)' }}>
              <strong style={{ color: '#10B981' }}>Step 3: 70% Bilty Delivery Settlement 🧾</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
                Upon unloading, Driver uploads signed Digital Bilty POD. SafarLoad AI validates the receipt and releases the final <strong>Rs. 101,850</strong> balance to Driver's bank account.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
