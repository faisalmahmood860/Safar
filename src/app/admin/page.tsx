'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface DriverUser {
  id: string;
  name: string;
  nameUr: string;
  phone: string;
  cnic: string;
  truck: string;
  city: string;
  rating: number;
  status: 'active' | 'blocked' | 'pending';
  blockReason?: string;
}

interface ShipperOrg {
  id: string;
  name: string;
  type: 'Enterprise' | 'SME Shipper' | 'Logistics Company';
  contactPerson: string;
  phone: string;
  customCommission: number;
  subscriptionPlan: 'Free' | 'Pro' | 'Enterprise';
  status: 'active' | 'blocked';
  totalLoads: number;
  totalSpent: number;
}

export default function SuperAdminPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [activeTab, setActiveTab] = useState<'overview' | 'drivers' | 'shippers' | 'orgs' | 'commission'>('overview');

  // Super Admin Credentials
  const adminCredentials = {
    username: 'admin@safarload.pk',
    phone: '+92 300 0000000',
    password: 'SafarLoad@2026#Admin',
    securityPin: '786-921',
  };

  // Global Commission & Monetization State
  const [defaultCommission, setDefaultCommission] = useState(4.0);
  const [subscriptionPricePro, setSubscriptionPricePro] = useState(10000);
  const [subscriptionPriceEnterprise, setSubscriptionPriceEnterprise] = useState(50000);

  // New Organization Modal Form State
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState<'Enterprise' | 'SME Shipper' | 'Logistics Company'>('Enterprise');
  const [newOrgContact, setNewOrgContact] = useState('');
  const [newOrgCommission, setNewOrgCommission] = useState(3.0);
  const [newOrgPlan, setNewOrgPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Enterprise');

  // Drivers State
  const [drivers, setDrivers] = useState<DriverUser[]>([
    { id: 'DRV-101', name: 'Muhammad Aslam', nameUr: 'محمد اسلم', phone: '+92 301 2345678', cnic: '35201-1234567-1', truck: 'LHR-5678 (Trailer)', city: 'Lahore', rating: 4.8, status: 'active' },
    { id: 'DRV-102', name: 'Abdul Rasheed', nameUr: 'عبدالرشید', phone: '+92 333 9876543', cnic: '42301-9876543-3', truck: 'KHI-1234 (Container)', city: 'Karachi', rating: 4.5, status: 'active' },
    { id: 'DRV-103', name: 'Tariq Mehmood', nameUr: 'طارق محمود', phone: '+92 321 5551234', cnic: '36302-5551234-7', truck: 'FSD-9012 (Dumper)', city: 'Faisalabad', rating: 4.9, status: 'active' },
    { id: 'DRV-104', name: 'Zahid Khan', nameUr: 'زاہد خان', phone: '+92 300 9988776', cnic: '17301-9988776-9', truck: 'PSH-4455 (Bedford)', city: 'Peshawar', rating: 2.1, status: 'blocked', blockReason: 'Repeated late deliveries & damaged cargo dispute' },
    { id: 'DRV-105', name: 'Imran Bilal', nameUr: 'عمران بلال', phone: '+92 312 4433221', cnic: '31102-4433221-5', truck: 'MUL-8899 (Mazda)', city: 'Multan', rating: 4.2, status: 'pending' },
  ]);

  // Shippers & Organizations State
  const [shippers, setShippers] = useState<ShipperOrg[]>([
    { id: 'ORG-001', name: 'Noor Textile Mills Ltd', type: 'Enterprise', contactPerson: 'Bilal Chaudhry', phone: '+92 42 35789000', customCommission: 2.5, subscriptionPlan: 'Enterprise', status: 'active', totalLoads: 342, totalSpent: 63200000 },
    { id: 'ORG-002', name: 'DG Khan Cement Corp', type: 'Enterprise', contactPerson: 'Asad Shah', phone: '+92 42 111 345 345', customCommission: 2.0, subscriptionPlan: 'Enterprise', status: 'active', totalLoads: 890, totalSpent: 84500000 },
    { id: 'ORG-003', name: 'Sindh Rice Exporters', type: 'SME Shipper', contactPerson: 'Tariq Soomro', phone: '+92 21 34567890', customCommission: 4.0, subscriptionPlan: 'Pro', status: 'active', totalLoads: 128, totalSpent: 18500000 },
    { id: 'ORG-004', name: 'Al-Farooq Logistics Co', type: 'Logistics Company', contactPerson: 'Farooq Ahmed', phone: '+92 51 9876543', customCommission: 3.5, subscriptionPlan: 'Pro', status: 'active', totalLoads: 215, totalSpent: 39000000 },
    { id: 'ORG-005', name: 'Khyber Trading Agency', type: 'SME Shipper', contactPerson: 'Zulqarnain Khattak', phone: '+92 91 5544332', customCommission: 4.0, subscriptionPlan: 'Free', status: 'blocked', totalLoads: 14, totalSpent: 1200000 },
  ]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const handleToggleBlockDriver = (id: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const newStatus = d.status === 'blocked' ? 'active' : 'blocked';
          const reason = newStatus === 'blocked' ? 'Suspended by Super Admin (Policy Violation)' : undefined;
          return { ...d, status: newStatus, blockReason: reason };
        }
        return d;
      })
    );
  };

  const handleRemoveDriver = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this driver account?')) {
      setDrivers((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const handleToggleBlockShipper = (id: string) => {
    setShippers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'blocked' ? 'active' : 'blocked' } : s))
    );
  };

  const handleRemoveShipper = (id: string) => {
    if (confirm('Are you sure you want to remove access for this organization?')) {
      setShippers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;

    const newEntry: ShipperOrg = {
      id: `ORG-${Math.floor(100 + Math.random() * 900)}`,
      name: newOrgName,
      type: newOrgType,
      contactPerson: newOrgContact || 'Admin Manager',
      phone: '+92 42 111-SAFAR',
      customCommission: Number(newOrgCommission),
      subscriptionPlan: newOrgPlan,
      status: 'active',
      totalLoads: 0,
      totalSpent: 0,
    };

    setShippers([newEntry, ...shippers]);
    setShowOrgModal(false);
    setNewOrgName('');
    setNewOrgContact('');
    alert(`Organization "${newOrgName}" created successfully!`);
  };

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Super Admin Top Header */}
      <header className={styles.header}>
        <div>
          <div className={styles.adminBadge}>👑 Super Admin System | سپر ایڈمن پورٹل</div>
          <h1>SafarLoad Platform Super Admin</h1>
          <p>Global Access Control, Enterprise Organization Setup, Commission & Subscription Management.</p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <button onClick={() => setShowOrgModal(true)} className="btn btn-primary btn-sm">
            🏢 Create Organization
          </button>
          <Link href="/dashboard" className="btn btn-outline btn-sm">
            📊 Operations Dashboard
          </Link>
        </div>
      </header>

      {/* Generated Super Admin Credentials Banner */}
      <div className={styles.credentialsCard}>
        <div className={styles.credInfo}>
          <div className={styles.credIcon}>🔑</div>
          <div>
            <strong>Super Admin Credentials Generated</strong>
            <p>Use these credentials to log in as System Super Admin anytime.</p>
          </div>
        </div>

        <div className={styles.credDetails}>
          <div>
            <span>Username:</span>
            <div className={styles.credBadge}>{adminCredentials.username}</div>
          </div>
          <div>
            <span>Password:</span>
            <div className={styles.credBadge}>{adminCredentials.password}</div>
          </div>
          <div>
            <span>Security PIN:</span>
            <div className={styles.credBadge}>{adminCredentials.securityPin}</div>
          </div>
        </div>
      </div>

      {/* Global Overview KPI Cards */}
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-card-icon">🏢</div>
          <div className="stat-card-value">{shippers.length}</div>
          <div className="stat-card-label">Logistics Organizations</div>
          <div className="stat-card-change positive">↑ 4 Enterprise Plans</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">🚛</div>
          <div className="stat-card-value">{drivers.length}</div>
          <div className="stat-card-label">Managed Drivers</div>
          <div className="stat-card-change negative">
            🚫 {drivers.filter((d) => d.status === 'blocked').length} Blocked
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">{defaultCommission}%</div>
          <div className="stat-card-label">Default Platform Commission</div>
          <div className="stat-card-change positive">Customizable Per Org</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">💵</div>
          <div className="stat-card-value">Rs. 15.4B</div>
          <div className="stat-card-label">Total Freight Revenue</div>
          <div className="stat-card-change positive">↑ Rs. 616M Earned</div>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className={styles.tabsRow}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTab : ''}`}
        >
          📊 System Overview
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`${styles.tabBtn} ${activeTab === 'drivers' ? styles.activeTab : ''}`}
        >
          🚛 Driver Access Control ({drivers.length})
        </button>
        <button
          onClick={() => setActiveTab('shippers')}
          className={`${styles.tabBtn} ${activeTab === 'shippers' ? styles.activeTab : ''}`}
        >
          🏢 Shippers & Companies ({shippers.length})
        </button>
        <button
          onClick={() => setActiveTab('commission')}
          className={`${styles.tabBtn} ${activeTab === 'commission' ? styles.activeTab : ''}`}
        >
          ⚙️ Subscription & Commission Settings
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <h3>🌐 SafarLoad Super Admin Command Matrix</h3>
          <p className={styles.panelSubtitle}>
            Full oversight over all user roles: Drivers, Shippers, Logistics Enterprises, and System Commissions.
          </p>

          <div className={styles.matrixGrid}>
            <div className={styles.matrixCard}>
              <h4>🛡️ Access Control & Safety Status</h4>
              <ul>
                <li>Active Drivers: <strong>{drivers.filter((d) => d.status === 'active').length}</strong></li>
                <li>Blocked Drivers: <strong className={styles.dangerText}>{drivers.filter((d) => d.status === 'blocked').length}</strong></li>
                <li>Pending CNIC Verification: <strong>{drivers.filter((d) => d.status === 'pending').length}</strong></li>
                <li>Active Shippers: <strong>{shippers.filter((s) => s.status === 'active').length}</strong></li>
                <li>Blocked Shippers: <strong className={styles.dangerText}>{shippers.filter((s) => s.status === 'blocked').length}</strong></li>
              </ul>
            </div>

            <div className={styles.matrixCard}>
              <h4>💳 Monetization Breakdown</h4>
              <ul>
                <li>Default Platform Commission: <strong>{defaultCommission}%</strong></li>
                <li>Pro Tier Subscription: <strong>Rs. {subscriptionPricePro.toLocaleString()}/month</strong></li>
                <li>Enterprise Tier Subscription: <strong>Rs. {subscriptionPriceEnterprise.toLocaleString()}/month</strong></li>
                <li>Total Gross Escrow Cleared: <strong>Rs. 206,700,000</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVER ACCESS CONTROL (BLOCKING SYSTEM) */}
      {activeTab === 'drivers' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>🚛 Driver Directory & Access Control</h3>
              <p>Manage, suspend, block, or restore access for Pakistani truck drivers.</p>
            </div>
            <div className={styles.filterGroup}>
              <span className="badge badge-primary">{drivers.length} Drivers Loaded</span>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Driver ID / Name</th>
                  <th>Phone & CNIC</th>
                  <th>Truck Details</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Block Reason / Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id} className={d.status === 'blocked' ? styles.blockedRow : ''}>
                    <td>
                      <strong>{d.name}</strong>
                      <br />
                      <small>{d.nameUr} ({d.id})</small>
                    </td>
                    <td>
                      {d.phone}
                      <br />
                      <small>🪪 {d.cnic}</small>
                    </td>
                    <td>
                      {d.truck}
                      <br />
                      <small>📍 {d.city}</small>
                    </td>
                    <td>⭐ {d.rating} / 5.0</td>
                    <td>
                      {d.status === 'active' && <span className="badge badge-success">Active ✅</span>}
                      {d.status === 'blocked' && <span className="badge badge-danger">Blocked 🚫</span>}
                      {d.status === 'pending' && <span className="badge badge-warning">Pending ⏳</span>}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        {d.status === 'blocked' ? (
                          <button onClick={() => handleToggleBlockDriver(d.id)} className="btn btn-primary btn-sm">
                            ✅ Restore Access
                          </button>
                        ) : (
                          <button onClick={() => handleToggleBlockDriver(d.id)} className="btn btn-accent btn-sm">
                            🚫 Block Driver
                          </button>
                        )}
                        <button onClick={() => handleRemoveDriver(d.id)} className="btn btn-glass btn-sm">
                          🗑️ Delete
                        </button>
                      </div>
                      {d.blockReason && <div className={styles.reasonNote}>Note: {d.blockReason}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SHIPPERS & ORGANIZATIONS ACCESS CONTROL */}
      {activeTab === 'shippers' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>🏢 Shippers & Enterprise Organizations Directory</h3>
              <p>Control company accounts, revoke access, and set custom commission rates per business.</p>
            </div>
            <button onClick={() => setShowOrgModal(true)} className="btn btn-primary btn-sm">
              ➕ Create Organization System
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Organization Name</th>
                  <th>Type & Plan</th>
                  <th>Contact</th>
                  <th>Custom Commission</th>
                  <th>Total Spent</th>
                  <th>Status & Actions</th>
                </tr>
              </thead>
              <tbody>
                {shippers.map((s) => (
                  <tr key={s.id} className={s.status === 'blocked' ? styles.blockedRow : ''}>
                    <td>
                      <strong>{s.name}</strong>
                      <br />
                      <small>{s.id}</small>
                    </td>
                    <td>
                      <span className="badge badge-info">{s.type}</span>
                      <br />
                      <small>Plan: {s.subscriptionPlan}</small>
                    </td>
                    <td>
                      {s.contactPerson}
                      <br />
                      <small>{s.phone}</small>
                    </td>
                    <td>
                      <strong>{s.customCommission}%</strong>
                      <br />
                      <small>(Default: {defaultCommission}%)</small>
                    </td>
                    <td>Rs. {(s.totalSpent / 1000000).toFixed(1)} Million ({s.totalLoads} Loads)</td>
                    <td>
                      <div className={styles.actionBtns}>
                        {s.status === 'blocked' ? (
                          <button onClick={() => handleToggleBlockShipper(s.id)} className="btn btn-primary btn-sm">
                            ✅ Restore Access
                          </button>
                        ) : (
                          <button onClick={() => handleToggleBlockShipper(s.id)} className="btn btn-accent btn-sm">
                            🔒 Revoke Access
                          </button>
                        )}
                        <button onClick={() => handleRemoveShipper(s.id)} className="btn btn-glass btn-sm">
                          🗑️ Delete
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

      {/* TAB 4: MONETIZATION & COMMISSION MODEL CONTROLS */}
      {activeTab === 'commission' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <h3>⚙️ Monetization Model, Commission & Subscription Rules</h3>
          <p className={styles.panelSubtitle}>
            Configure standard commission take rates and subscription prices for fleet owners and enterprise shippers.
          </p>

          <div className={styles.settingsGrid}>
            <div className={styles.settingCard}>
              <h4>📊 Default Platform Commission Rate</h4>
              <p>Applied by default on every load transaction unless overridden per organization.</p>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  step="0.1"
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(Number(e.target.value))}
                  className="input input-lg"
                />
                <span className={styles.unitTag}>%</span>
              </div>
              <small className={styles.hint}>Current industry standard: 3.5% - 5.0%</small>
            </div>

            <div className={styles.settingCard}>
              <h4>💳 Fleet Pro Monthly Subscription</h4>
              <p>Fixed monthly fee for mid-sized transport companies & fleet managers.</p>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  value={subscriptionPricePro}
                  onChange={(e) => setSubscriptionPricePro(Number(e.target.value))}
                  className="input input-lg"
                />
                <span className={styles.unitTag}>PKR / mo</span>
              </div>
            </div>

            <div className={styles.settingCard}>
              <h4>🏢 Enterprise Logistics System Subscription</h4>
              <p>Monthly fee for nationwide enterprises with custom API integrations and dedicated brokers.</p>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  value={subscriptionPriceEnterprise}
                  onChange={(e) => setSubscriptionPriceEnterprise(Number(e.target.value))}
                  className="input input-lg"
                />
                <span className={styles.unitTag}>PKR / mo</span>
              </div>
            </div>
          </div>

          <div className={styles.saveSection}>
            <button onClick={() => alert('Platform commission & subscription settings saved!')} className="btn btn-primary btn-lg">
              💾 Save All Global Business Settings
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ENTERPRISE ORGANIZATION */}
      {showOrgModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🏢 Create Enterprise Organization System</h3>
              <button onClick={() => setShowOrgModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleCreateOrg}>
              <div className={styles.inputGroup}>
                <label>Organization Name</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="input"
                  placeholder="e.g. National Logistics Cell (NLC) / Packages Ltd"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Organization Category</label>
                <select
                  value={newOrgType}
                  onChange={(e) => setNewOrgType(e.target.value as any)}
                  className="input"
                >
                  <option value="Enterprise">Enterprise Factory / Manufacturer</option>
                  <option value="SME Shipper">SME Shipper / Trader</option>
                  <option value="Logistics Company">Logistics & Fleet Transport Company</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Primary Admin Manager</label>
                <input
                  type="text"
                  value={newOrgContact}
                  onChange={(e) => setNewOrgContact(e.target.value)}
                  className="input"
                  placeholder="e.g. Tariq Mehmood (Head of Supply Chain)"
                />
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label>Custom Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newOrgCommission}
                    onChange={(e) => setNewOrgCommission(Number(e.target.value))}
                    className="input"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Subscription Tier</label>
                  <select
                    value={newOrgPlan}
                    onChange={(e) => setNewOrgPlan(e.target.value as any)}
                    className="input"
                  >
                    <option value="Free">Free Tier (Pay Commission Only)</option>
                    <option value="Pro">Pro Fleet Tier (Rs. 10,000/mo)</option>
                    <option value="Enterprise">Enterprise System (Rs. 50,000/mo)</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowOrgModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  🚀 Launch Organization System
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
