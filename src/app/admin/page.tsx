'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { PlatformBanner, initialPlatformBanners } from '@/components/GlobalBannerContainer';

export interface DriverUser {
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

export interface ShipperOrg {
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

export interface AdminUserAccount {
  id: string;
  role: 'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin';
  name: string;
  name_ur?: string;
  email: string;
  phone: string;
  password?: string;
  details?: string;
  created_at?: string;
}

const defaultAdminUserAccounts: AdminUserAccount[] = [
  { id: 'usr-driver-1', role: 'driver', name: 'Verified Driver', name_ur: 'تصدیق شدہ ڈرائیور', email: 'driver@safarload.pk', phone: '03001234567', password: 'Driver@123', details: JSON.stringify({ cnicOrNtn: '35202-1234567-1' }) },
  { id: 'usr-shipper-1', role: 'shipper', name: 'Noor Textile Mills Ltd', name_ur: 'نور ٹیکسٹائل ملز', email: 'shipper@safarload.pk', phone: '03111234567', password: 'Shipper@123', details: JSON.stringify({ cnicOrNtn: '1234567-8' }) },
  { id: 'usr-fleet-1', role: 'fleet', name: 'Al-Farooq Fleet Logistics', name_ur: 'ال فاروق فلیٹ', email: 'fleet@safarload.pk', phone: '03221234567', password: 'Fleet@123', details: JSON.stringify({ cnicOrNtn: '2345678-9' }) },
  { id: 'usr-support-1', role: 'support', name: 'Ayesha Khan (Support Staff)', name_ur: 'عائشہ خان', email: 'support@safarload.pk', phone: '03331234567', password: 'Support@123', details: JSON.stringify({ cnicOrNtn: '35202-3333333-3' }) },
  { id: 'usr-finance-1', role: 'finance', name: 'Kamran Ali (Finance Desk)', name_ur: 'کامران علی', email: 'finance@safarload.pk', phone: '03441234567', password: 'Finance@123', details: JSON.stringify({ cnicOrNtn: '35202-4444444-4' }) },
  { id: 'usr-admin-1', role: 'admin', name: 'Admin', name_ur: 'سپر ایڈمن', email: 'admin@safarload.pk', phone: '03551234567', password: 'SafarLoad@2026#Admin', details: JSON.stringify({ cnicOrNtn: '35202-5555555-5' }) },
];

const roleBadges: Record<string, { label: string; icon: string; bg: string }> = {
  driver: { label: 'Truck Driver', icon: '👨‍✈️', bg: '#10B981' },
  shipper: { label: 'Shipper', icon: '🏢', bg: '#3B82F6' },
  fleet: { label: 'Fleet Owner', icon: '🚚', bg: '#8B5CF6' },
  support: { label: 'KYC & Support', icon: '🎧', bg: '#F59E0B' },
  finance: { label: 'Finance Desk', icon: '💵', bg: '#EC4899' },
  admin: { label: 'Super Admin', icon: '👑', bg: '#EF4444' },
};

export default function SuperAdminPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'drivers' | 'shippers' | 'commission' | 'banners'>('overview');

  // Platform Banners State
  const [banners, setBanners] = useState<PlatformBanner[]>(initialPlatformBanners);
  const [bTitle, setBTitle] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [bType, setBType] = useState<'feature_update' | 'payment_warning' | 'system_alert'>('feature_update');
  const [bAudience, setBAudience] = useState<'all' | 'driver' | 'shipper' | 'fleet' | 'specific_user'>('all');
  const [bTargetUser, setBTargetUser] = useState('');
  const [bActionText, setBActionText] = useState('');
  const [bActionUrl, setBActionUrl] = useState('');

  // User Accounts State
  const [userAccounts, setUserAccounts] = useState<AdminUserAccount[]>(defaultAdminUserAccounts);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // User Account Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [uRole, setURole] = useState<'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin'>('driver');
  const [uName, setUName] = useState('');
  const [uNameUr, setUNameUr] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uCnicOrNtn, setUCnicOrNtn] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);

  // Sync Banners with localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('safarload_global_banners');
      if (stored) {
        setBanners(JSON.parse(stored));
      } else {
        localStorage.setItem('safarload_global_banners', JSON.stringify(initialPlatformBanners));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch Users from API & Sync to localStorage
  useEffect(() => {
    fetchUsers();
  }, []);

  const syncToLocalStorage = (users: AdminUserAccount[]) => {
    try {
      const formattedForLogin = users.map((u) => {
        let redirect = '/dashboard';
        if (u.role === 'shipper') redirect = '/dashboard/post-load';
        if (u.role === 'fleet') redirect = '/dashboard/fleet';
        if (u.role === 'support') redirect = '/dashboard/support';
        if (u.role === 'finance') redirect = '/dashboard/finance';
        if (u.role === 'admin') redirect = '/dashboard/admin';

        let cnicOrNtn = '';
        if (u.details) {
          try {
            const parsed = JSON.parse(u.details);
            cnicOrNtn = parsed.cnicOrNtn || '';
          } catch (e) {
            // ignore
          }
        }

        return {
          role: u.role,
          name: u.name,
          email: u.email,
          phone: u.phone,
          password: u.password,
          cnicOrNtn,
          redirectUrl: redirect,
        };
      });
      localStorage.setItem('safarload_registered_users', JSON.stringify(formattedForLogin));
    } catch (e) {
      console.error('Failed to sync users to localStorage:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setUserAccounts(data.users);
        syncToLocalStorage(data.users);
      } else {
        setUserAccounts(defaultAdminUserAccounts);
        syncToLocalStorage(defaultAdminUserAccounts);
      }
    } catch (err) {
      console.error('Failed to fetch user accounts:', err);
      setUserAccounts(defaultAdminUserAccounts);
    }
  };

  const saveBannersToStorage = (updated: PlatformBanner[]) => {
    setBanners(updated);
    try {
      localStorage.setItem('safarload_global_banners', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bMessage) return;

    const newBanner: PlatformBanner = {
      id: `BAN-${Date.now()}`,
      title: bTitle,
      message: bMessage,
      bannerType: bType,
      targetAudience: bAudience,
      targetUserEmail: bTargetUser || undefined,
      actionText: bActionText || undefined,
      actionUrl: bActionUrl || undefined,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newBanner, ...banners];
    saveBannersToStorage(updated);

    setBTitle('');
    setBMessage('');
    setBTargetUser('');
    setBActionText('');
    setBActionUrl('');
    alert(`📢 Platform Banner / Warning Notification Broadcasted Successfully!`);
  };

  const handleToggleBannerStatus = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, status: (b.status === 'active' ? 'archived' : 'active') as 'active' | 'archived' } : b));
    saveBannersToStorage(updated);
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Delete this banner announcement permanently?')) {
      const updated = banners.filter((b) => b.id !== id);
      saveBannersToStorage(updated);
    }
  };

  // Super Admin Credentials
  const adminCredentials = {
    username: 'admin@safarload.pk',
    phone: '+92 300 0000000',
    password: 'SafarLoad@2026#Admin',
    securityPin: '786-921',
  };

  // Global Commission & Monetization State (Model 3: Dual-Sided Marketplace Commission)
  const [shipperCommissionRate, setShipperCommissionRate] = useState(2.0);
  const [driverCommissionRate, setDriverCommissionRate] = useState(3.0);
  
  // SaaS Pricing Model
  const [perTripSaaSPrice, setPerTripSaaSPrice] = useState(500);
  const [perTruckSaaSPrice, setPerTruckSaaSPrice] = useState(1000);
  const [tripPack50, setTripPack50] = useState(15000);
  const [tripPack150, setTripPack150] = useState(40000);

  // New Organization Modal Form State
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState<'Enterprise' | 'SME Shipper' | 'Logistics Company'>('Enterprise');
  const [newOrgContact, setNewOrgContact] = useState('');
  const [newOrgCommission, setNewOrgCommission] = useState(3.0);
  const [newOrgPlan, setNewOrgPlan] = useState<'Free' | 'Pro' | 'Enterprise'>('Enterprise');

  // Drivers & Shippers State
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [shippers, setShippers] = useState<ShipperOrg[]>([]);

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

  // --- USER ACCOUNT MANAGMENT HANDLERS ---
  const openCreateUserModal = () => {
    setEditingUserId(null);
    setURole('driver');
    setUName('');
    setUNameUr('');
    setUEmail('');
    setUPhone('');
    setUPassword('');
    setUCnicOrNtn('');
    setShowModalPassword(false);
    setShowUserModal(true);
  };

  const openEditUserModal = (user: AdminUserAccount) => {
    setEditingUserId(user.id);
    setURole(user.role);
    setUName(user.name);
    setUNameUr(user.name_ur || '');
    setUEmail(user.email);
    setUPhone(user.phone);
    setUPassword(user.password || '');
    let cnicOrNtn = '';
    if (user.details) {
      try {
        const parsed = JSON.parse(user.details);
        cnicOrNtn = parsed.cnicOrNtn || '';
      } catch (e) {
        // ignore
      }
    }
    setUCnicOrNtn(cnicOrNtn);
    setShowModalPassword(false);
    setShowUserModal(true);
  };

  const handleUserModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName.trim() || !uEmail.trim() || !uPassword.trim()) {
      alert('Please fill in Name, Email, and Password!');
      return;
    }

    const payload = {
      id: editingUserId || undefined,
      role: uRole,
      name: uName.trim(),
      name_ur: uNameUr.trim() || undefined,
      email: uEmail.trim().toLowerCase(),
      phone: uPhone.trim(),
      password: uPassword,
      details: { cnicOrNtn: uCnicOrNtn.trim() },
    };

    try {
      const method = editingUserId ? 'PUT' : 'POST';
      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        let updatedList: AdminUserAccount[] = [];
        if (editingUserId) {
          updatedList = userAccounts.map((u) => (u.id === editingUserId ? { ...u, ...payload, id: editingUserId, details: JSON.stringify(payload.details) } : u));
        } else {
          const newUser: AdminUserAccount = {
            id: data.user?.id || `usr-${uRole}-${Date.now()}`,
            role: uRole,
            name: uName.trim(),
            name_ur: uNameUr.trim() || undefined,
            email: uEmail.trim().toLowerCase(),
            phone: uPhone.trim(),
            password: uPassword,
            details: JSON.stringify(payload.details),
          };
          updatedList = [...userAccounts, newUser];
        }

        setUserAccounts(updatedList);
        syncToLocalStorage(updatedList);
        setShowUserModal(false);
        alert(editingUserId ? `User account "${uName}" updated successfully!` : `New user account "${uName}" created successfully!`);
      } else {
        alert(`Failed to save user: ${data.error}`);
      }
    } catch (err: any) {
      console.error('User save error:', err);
      // Fallback local update
      let updatedList: AdminUserAccount[] = [];
      if (editingUserId) {
        updatedList = userAccounts.map((u) => (u.id === editingUserId ? { ...u, ...payload, id: editingUserId, details: JSON.stringify(payload.details) } : u));
      } else {
        const newUser: AdminUserAccount = {
          id: `usr-${uRole}-${Date.now()}`,
          role: uRole,
          name: uName.trim(),
          name_ur: uNameUr.trim() || undefined,
          email: uEmail.trim().toLowerCase(),
          phone: uPhone.trim(),
          password: uPassword,
          details: JSON.stringify(payload.details),
        };
        updatedList = [...userAccounts, newUser];
      }
      setUserAccounts(updatedList);
      syncToLocalStorage(updatedList);
      setShowUserModal(false);
      alert(editingUserId ? `User updated locally!` : `User created locally!`);
    }
  };

  const handleDeleteUserAccount = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the user account for "${name}"?`)) {
      return;
    }

    try {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete user via API:', err);
    }

    const updated = userAccounts.filter((u) => u.id !== id);
    setUserAccounts(updated);
    syncToLocalStorage(updated);
    alert(`User account "${name}" deleted.`);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered Users List
  const filteredUsers = userAccounts.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const q = userSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.role.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Super Admin Top Header */}
      <header className={styles.header}>
        <div>
          <div className={styles.adminBadge}>👑 Super Admin System | سپر ایڈمن پورٹل</div>
          <h1>SafarLoad Platform Super Admin</h1>
          <p>Global Access Control, User Account & Password Management, Commission & Subscription Rules.</p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm" aria-label="Toggle language">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <button onClick={openCreateUserModal} className="btn btn-primary btn-sm" aria-label="Add new user account">
            👤 Add New User Account
          </button>
          <button onClick={() => setShowOrgModal(true)} className="btn btn-outline btn-sm" aria-label="Create organization">
            🏢 Create Organization
          </button>
          <Link href="/dashboard/finance" className="btn btn-glass btn-sm">
            💵 Revenue & Invoices
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
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-value">{userAccounts.length}</div>
          <div className="stat-card-label">User Accounts</div>
          <div className="stat-card-change positive">🔐 Passwords Managed</div>
        </div>

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
          <div className="stat-card-value">{shipperCommissionRate + driverCommissionRate}%</div>
          <div className="stat-card-label">Model 3 Margin</div>
          <div className="stat-card-change positive">Shipper {shipperCommissionRate}% + Driver {driverCommissionRate}%</div>
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
          onClick={() => setActiveTab('users')}
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.activeTab : ''}`}
        >
          👥 User Accounts & Password Control ({userAccounts.length})
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
        <button
          onClick={() => setActiveTab('banners')}
          className={`${styles.tabBtn} ${activeTab === 'banners' ? styles.activeTab : ''}`}
        >
          📢 Platform Banners ({banners.filter((b) => b.status === 'active').length})
        </button>
      </div>

      {/* TAB: USER ACCOUNTS & PASSWORD MANAGEMENT */}
      {activeTab === 'users' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h3>👥 Platform User Accounts & Password Management</h3>
              <p className={styles.panelSubtitle}>
                Create new user accounts, update credentials, edit passwords, or delete existing platform accounts for Shippers, Drivers, Fleet Owners, Support & Finance staff.
              </p>
            </div>
            <button onClick={openCreateUserModal} className="btn btn-primary" aria-label="Create new user account">
              ➕ Create New User Account
            </button>
          </div>

          {/* Filters & Search Controls */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', background: 'var(--color-bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label htmlFor="userSearchInput" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Search User (تلاش کریں):</label>
              <input
                id="userSearchInput"
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, or role..."
                className="input"
                aria-label="Search users by name email phone or role"
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <label htmlFor="userRoleFilterSelect" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Filter by Role (کردار):</label>
              <select
                id="userRoleFilterSelect"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="input"
                aria-label="Filter users by role"
              >
                <option value="all">🌐 All Roles ({userAccounts.length})</option>
                <option value="shipper">🏢 Shipper ({userAccounts.filter((u) => u.role === 'shipper').length})</option>
                <option value="driver">👨‍✈️ Driver ({userAccounts.filter((u) => u.role === 'driver').length})</option>
                <option value="fleet">🚚 Fleet Operator ({userAccounts.filter((u) => u.role === 'fleet').length})</option>
                <option value="support">🎧 Support Desk ({userAccounts.filter((u) => u.role === 'support').length})</option>
                <option value="finance">💵 Finance Desk ({userAccounts.filter((u) => u.role === 'finance').length})</option>
                <option value="admin">👑 Super Admin ({userAccounts.filter((u) => u.role === 'admin').length})</option>
              </select>
            </div>
          </div>

          {/* User Accounts Data Table */}
          <div className="tableContainer">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Email / Username</th>
                  <th>Phone Number</th>
                  <th>Password (پاس ورڈ)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const badge = roleBadges[u.role] || { label: u.role, icon: '👤', bg: '#6B7280' };
                  const isPassVisible = showPasswordMap[u.id] || false;

                  return (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong>
                        {u.name_ur && <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{u.name_ur}</div>}
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {u.id}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: badge.bg, color: '#FFFFFF', fontWeight: 700 }}>
                          {badge.icon} {badge.label}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.85rem', color: '#38BDF8' }}>{u.email}</code>
                      </td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <code style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                            {isPassVisible ? u.password : '••••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="btn btn-glass btn-sm"
                            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                            title={isPassVisible ? 'Hide Password' : 'Show Password'}
                            aria-label={`Toggle password visibility for ${u.name}`}
                          >
                            {isPassVisible ? '🔒 Hide' : '👁️ Show'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => openEditUserModal(u)}
                            className="btn btn-primary btn-sm"
                            aria-label={`Edit user account ${u.name}`}
                          >
                            ✏️ Edit & Password
                          </button>
                          <button
                            onClick={() => handleDeleteUserAccount(u.id, u.name)}
                            className="btn btn-accent btn-sm"
                            aria-label={`Delete user account ${u.name}`}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8' }}>
                      No user accounts found matching query "{userSearchQuery}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PLATFORM BANNERS */}
      {activeTab === 'banners' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <h3>📢 Platform Announcement Banners & Overdue Payment Warnings</h3>
          <p className={styles.panelSubtitle}>
            Broadcast new feature releases to all users, or issue targeted overdue payment warnings to specific shippers/drivers.
          </p>

          <form onSubmit={handleCreateBanner} style={{ background: 'var(--color-bg-secondary)', padding: '1.5rem', borderRadius: '14px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 1rem', color: 'var(--color-primary)' }}>➕ Broadcast New Banner Announcement / Warning</h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label htmlFor="bannerTitleInput" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Announcement Title (عنوان):</label>
                <input
                  id="bannerTitleInput"
                  type="text"
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  placeholder="e.g. 🚀 NEW FEATURE: Pakistani Digital Bilty System Live!"
                  className="input"
                  required
                  aria-label="Announcement title"
                />
              </div>

              <div>
                <label htmlFor="bannerCategorySelect" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Banner Category (قسم):</label>
                <select
                  id="bannerCategorySelect"
                  value={bType}
                  onChange={(e: any) => setBType(e.target.value)}
                  className="input"
                  aria-label="Banner category"
                >
                  <option value="feature_update">📢 Feature Release Announcement (Green)</option>
                  <option value="payment_warning">⚠️ Overdue Payment Warning Notice (Amber/Red)</option>
                  <option value="system_alert">🚨 Critical System Alert (Red)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="bannerBodyTextarea" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Message Body (پیغام کی تفصیل):</label>
              <textarea
                id="bannerBodyTextarea"
                value={bMessage}
                onChange={(e) => setBMessage(e.target.value)}
                placeholder="Enter detailed notification text..."
                className="input"
                rows={2}
                required
                aria-label="Message body"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label htmlFor="bannerAudienceSelect" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Target Audience:</label>
                <select
                  id="bannerAudienceSelect"
                  value={bAudience}
                  onChange={(e: any) => setBAudience(e.target.value)}
                  className="input"
                  aria-label="Target audience"
                >
                  <option value="all">🌐 All Users (Public Broadcast)</option>
                  <option value="driver">🚛 Drivers Only</option>
                  <option value="shipper">🏢 Shippers Only</option>
                  <option value="fleet">🚚 Fleet Owners Only</option>
                  <option value="specific_user">🎯 Specific Selected User / Org</option>
                </select>
              </div>

              {bAudience === 'specific_user' && (
                <div>
                  <label htmlFor="bannerTargetUserInput" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Targeted User / Org Name:</label>
                  <input
                    id="bannerTargetUserInput"
                    type="text"
                    value={bTargetUser}
                    onChange={(e) => setBTargetUser(e.target.value)}
                    placeholder="e.g. Noor Textile Mills or driver@safarload.pk"
                    className="input"
                    required
                    aria-label="Targeted user or organization name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="bannerBtnTextInput" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Action Button Text:</label>
                <input
                  id="bannerBtnTextInput"
                  type="text"
                  value={bActionText}
                  onChange={(e) => setBActionText(e.target.value)}
                  placeholder="e.g. 💳 Clear Dues Now"
                  className="input"
                  aria-label="Action button text"
                />
              </div>

              <div>
                <label htmlFor="bannerBtnUrlInput" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>Action Link URL:</label>
                <input
                  id="bannerBtnUrlInput"
                  type="text"
                  value={bActionUrl}
                  onChange={(e) => setBActionUrl(e.target.value)}
                  placeholder="e.g. /dashboard/wallet"
                  className="input"
                  aria-label="Action link URL"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" aria-label="Broadcast banner now">
              📡 Broadcast Banner Now
            </button>
          </form>

          <h4 style={{ marginBottom: '1rem' }}>📋 Active Broadcast Banners ({banners.length})</h4>
          <div className="tableContainer">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category & Title</th>
                  <th>Target Audience</th>
                  <th>Message Body</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: b.bannerType === 'payment_warning' ? '#F59E0B' : '#10B981' }}>
                        {b.bannerType === 'payment_warning' ? '⚠️ Payment Warning' : '📢 Feature Update'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{b.targetAudience.toUpperCase()}</span>
                      {b.targetUserEmail && <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>🎯 {b.targetUserEmail}</div>}
                    </td>
                    <td><p style={{ margin: 0, fontSize: '0.8rem' }}>{b.message}</p></td>
                    <td>{b.createdAt}</td>
                    <td>
                      {b.status === 'active' ? (
                        <span className="badge badge-success">Active 🟢</span>
                      ) : (
                        <span className="badge badge-warning">Archived ⏸️</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleToggleBannerStatus(b.id)} className="btn btn-glass btn-sm" aria-label="Toggle banner status">
                          {b.status === 'active' ? '⏸️ Archive' : '▶️ Activate'}
                        </button>
                        <button onClick={() => handleDeleteBanner(b.id)} className="btn btn-accent btn-sm" aria-label="Delete banner">
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

      {/* TAB: SYSTEM OVERVIEW */}
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
                <li>Total User Accounts: <strong>{userAccounts.length}</strong></li>
                <li>Active Drivers: <strong>{drivers.filter((d) => d.status === 'active').length}</strong></li>
                <li>Blocked Drivers: <strong className={styles.dangerText}>{drivers.filter((d) => d.status === 'blocked').length}</strong></li>
                <li>Active Shippers: <strong>{shippers.filter((s) => s.status === 'active').length}</strong></li>
                <li>Blocked Shippers: <strong className={styles.dangerText}>{shippers.filter((s) => s.status === 'blocked').length}</strong></li>
              </ul>
            </div>

            <div className={styles.matrixCard}>
              <h4>💰 Financial Margins & Pricing Settings</h4>
              <ul>
                <li>Model 3 Dual Commission: <strong>{shipperCommissionRate}% Shipper + {driverCommissionRate}% Driver</strong></li>
                <li>Trip-Based Usage SaaS: <strong>Rs. {perTripSaaSPrice}/trip (or Rs. {perTruckSaaSPrice}/truck/mo)</strong></li>
                <li>Trip Wallet Bundles: <strong>50 Trips (Rs. {tripPack50.toLocaleString()}) | 150 Trips (Rs. {tripPack150.toLocaleString()})</strong></li>
                <li>Total Gross Escrow Cleared: <strong>Rs. 206,700,000</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DRIVER ACCESS CONTROL */}
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
                          <button onClick={() => handleToggleBlockDriver(d.id)} className="btn btn-primary btn-sm" aria-label="Restore driver access">
                            ✅ Restore Access
                          </button>
                        ) : (
                          <button onClick={() => handleToggleBlockDriver(d.id)} className="btn btn-accent btn-sm" aria-label="Block driver">
                            🚫 Block Driver
                          </button>
                        )}
                        <button onClick={() => handleRemoveDriver(d.id)} className="btn btn-glass btn-sm" aria-label="Delete driver">
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

      {/* TAB: SHIPPERS & ORGANIZATIONS */}
      {activeTab === 'shippers' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>🏢 Shippers & Enterprise Organizations Directory</h3>
              <p>Control company accounts, revoke access, and set custom commission rates per business.</p>
            </div>
            <button onClick={() => setShowOrgModal(true)} className="btn btn-primary btn-sm" aria-label="Create organization system">
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
                      <small>(Model 3: {shipperCommissionRate}% + {driverCommissionRate}%)</small>
                    </td>
                    <td>Rs. {(s.totalSpent / 1000000).toFixed(1)} Million ({s.totalLoads} Loads)</td>
                    <td>
                      <div className={styles.actionBtns}>
                        {s.status === 'blocked' ? (
                          <button onClick={() => handleToggleBlockShipper(s.id)} className="btn btn-primary btn-sm" aria-label="Restore shipper access">
                            ✅ Restore Access
                          </button>
                        ) : (
                          <button onClick={() => handleToggleBlockShipper(s.id)} className="btn btn-accent btn-sm" aria-label="Revoke shipper access">
                            🔒 Revoke Access
                          </button>
                        )}
                        <button onClick={() => handleRemoveShipper(s.id)} className="btn btn-glass btn-sm" aria-label="Delete shipper organization">
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

      {/* TAB: MONETIZATION & COMMISSION */}
      {activeTab === 'commission' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <h3>⚙️ Monetization Model, Commission & Subscription Rules</h3>
          <p className={styles.panelSubtitle}>
            Configure standard commission take rates and subscription prices for fleet owners and enterprise shippers.
          </p>

          <div className={styles.settingsGrid}>
            <div className={styles.settingCard}>
              <h4>🏢 Shipper Escrow Service Fee (Model 3)</h4>
              <p>Added on top of Shipper bill for escrow clearing, satellite tracking & guaranteed cargo insurance.</p>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  step="0.1"
                  value={shipperCommissionRate}
                  onChange={(e) => setShipperCommissionRate(Number(e.target.value))}
                  className="input input-lg"
                  aria-label="Shipper commission rate percentage"
                />
                <span className={styles.unitTag}>% Shipper Fee</span>
              </div>
              <small className={styles.hint}>Added to Shipper gross bill (e.g. +Rs. 3,000 on Rs. 150k)</small>
            </div>

            <div className={styles.settingCard}>
              <h4>🚛 Driver QuickPay Processing Fee (Model 3)</h4>
              <p>Deducted from gross freight rate for instant JazzCash/Easypaisa fuel advance payouts.</p>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  step="0.1"
                  value={driverCommissionRate}
                  onChange={(e) => setDriverCommissionRate(Number(e.target.value))}
                  className="input input-lg"
                  aria-label="Driver commission rate percentage"
                />
                <span className={styles.unitTag}>% Driver Fee</span>
              </div>
              <small className={styles.hint}>Deducted from Driver gross rate (e.g. -Rs. 4,500 on Rs. 150k)</small>
            </div>

            <div className={styles.settingCard}>
              <h4>🎫 Micro Per-Trip SaaS Fee</h4>
              <p>Direct usage-based fee deducted per completed trip execution.</p>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  value={perTripSaaSPrice}
                  onChange={(e) => setPerTripSaaSPrice(Number(e.target.value))}
                  className="input input-lg"
                  aria-label="Per trip SaaS price"
                />
                <span className={styles.unitTag}>PKR / Trip</span>
              </div>
              <small className={styles.hint}>e.g. 50 Trips = Rs. 25,000 | 100 Trips = Rs. 50,000</small>
            </div>

            <div className={styles.settingCard}>
              <h4>🚛 Per-Truck Active Fleet SaaS Rate</h4>
              <p>Monthly subscription charged per registered active truck in fleet.</p>
              <div className={styles.inputRow}>
                <input
                  type="number"
                  value={perTruckSaaSPrice}
                  onChange={(e) => setPerTruckSaaSPrice(Number(e.target.value))}
                  className="input input-lg"
                  aria-label="Per truck SaaS rate"
                />
                <span className={styles.unitTag}>PKR / Truck / mo</span>
              </div>
              <small className={styles.hint}>e.g. 10 Trucks = Rs. 10k/mo | 50 Trucks = Rs. 50k/mo</small>
            </div>

            <div className={styles.settingCard}>
              <h4>📦 Fleet Trip Bundle Packs (50 & 150 Trips)</h4>
              <p>Prepaid discounted trip bundles for high-frequency transport companies.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div>
                  <label htmlFor="pack50Input" style={{ fontSize: '0.8rem' }}>50 Trips Pack:</label>
                  <input
                    id="pack50Input"
                    type="number"
                    value={tripPack50}
                    onChange={(e) => setTripPack50(Number(e.target.value))}
                    className="input"
                    aria-label="50 trips pack price"
                  />
                </div>
                <div>
                  <label htmlFor="pack150Input" style={{ fontSize: '0.8rem' }}>150 Trips Pack:</label>
                  <input
                    id="pack150Input"
                    type="number"
                    value={tripPack150}
                    onChange={(e) => setTripPack150(Number(e.target.value))}
                    className="input"
                    aria-label="150 trips pack price"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.saveSection}>
            <button onClick={() => alert('Platform commission & subscription settings saved!')} className="btn btn-primary btn-lg" aria-label="Save global business settings">
              💾 Save All Global Business Settings
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT USER ACCOUNT */}
      {showUserModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '550px' }}>
            <div className={styles.modalHeader}>
              <h3>{editingUserId ? '✏️ Edit User Account & Password' : '👤 Create New User Account'}</h3>
              <button onClick={() => setShowUserModal(false)} className={styles.closeBtn} aria-label="Close modal">✕</button>
            </div>

            <form onSubmit={handleUserModalSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="userModalRole">User Role (کردار):</label>
                <select
                  id="userModalRole"
                  value={uRole}
                  onChange={(e: any) => setURole(e.target.value)}
                  className="input"
                  required
                >
                  <option value="driver">👨‍✈️ Truck Driver (ڈرائیور)</option>
                  <option value="shipper">🏢 Enterprise Shipper (کارگو مالک)</option>
                  <option value="fleet">🚚 Fleet Operator (فلیٹ آپریٹر)</option>
                  <option value="support">🎧 KYC & Support Desk (ڈاکومنٹ ڈیسک)</option>
                  <option value="finance">💵 Finance & Revenue Desk (مالیاتی ڈیسک)</option>
                  <option value="admin">👑 System Super Admin (سپر ایڈمن)</option>
                </select>
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="userModalName">Full Name (پورا نام):</label>
                  <input
                    id="userModalName"
                    type="text"
                    value={uName}
                    onChange={(e) => setUName(e.target.value)}
                    className="input"
                    placeholder="e.g. Mohammad Aslam"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="userModalNameUr">Name in Urdu (نام):</label>
                  <input
                    id="userModalNameUr"
                    type="text"
                    value={uNameUr}
                    onChange={(e) => setUNameUr(e.target.value)}
                    className="input"
                    placeholder="e.g. محمد اسلم"
                  />
                </div>
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="userModalEmail">Email / Username (ای میل):</label>
                  <input
                    id="userModalEmail"
                    type="email"
                    value={uEmail}
                    onChange={(e) => setUEmail(e.target.value)}
                    className="input"
                    placeholder="e.g. user@safarload.pk"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="userModalPhone">Mobile Phone (فون نمبر):</label>
                  <input
                    id="userModalPhone"
                    type="text"
                    value={uPhone}
                    onChange={(e) => setUPhone(e.target.value)}
                    className="input"
                    placeholder="e.g. 03001234567"
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="userModalPassword">Account Password (پاس ورڈ):</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    id="userModalPassword"
                    type={showModalPassword ? 'text' : 'password'}
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    className="input"
                    placeholder="Enter password..."
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="btn btn-glass"
                    aria-label="Toggle password visibility"
                  >
                    {showModalPassword ? '🔒 Hide' : '👁️ Show'}
                  </button>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="userModalCnic">CNIC or NTN Number (شناختی کارڈ / این ٹی این):</label>
                <input
                  id="userModalCnic"
                  type="text"
                  value={uCnicOrNtn}
                  onChange={(e) => setUCnicOrNtn(e.target.value)}
                  className="input"
                  placeholder="e.g. 35202-1234567-1 or 1234567-8"
                />
              </div>

              <div className={styles.modalActions} style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowUserModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUserId ? '💾 Save Changes & Password' : '🚀 Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ENTERPRISE ORGANIZATION */}
      {showOrgModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🏢 Create Enterprise Organization System</h3>
              <button onClick={() => setShowOrgModal(false)} className={styles.closeBtn} aria-label="Close modal">✕</button>
            </div>

            <form onSubmit={handleCreateOrg}>
              <div className={styles.inputGroup}>
                <label htmlFor="orgModalName">Organization Name</label>
                <input
                  id="orgModalName"
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="input"
                  placeholder="e.g. National Logistics Cell (NLC) / Packages Ltd"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="orgModalType">Organization Category</label>
                <select
                  id="orgModalType"
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
                <label htmlFor="orgModalContact">Primary Admin Manager</label>
                <input
                  id="orgModalContact"
                  type="text"
                  value={newOrgContact}
                  onChange={(e) => setNewOrgContact(e.target.value)}
                  className="input"
                  placeholder="e.g. Tariq Mehmood (Head of Supply Chain)"
                />
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="orgModalComm">Custom Commission Rate (%)</label>
                  <input
                    id="orgModalComm"
                    type="number"
                    step="0.5"
                    value={newOrgCommission}
                    onChange={(e) => setNewOrgCommission(Number(e.target.value))}
                    className="input"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="orgModalPlan">Subscription Tier</label>
                  <select
                    id="orgModalPlan"
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
