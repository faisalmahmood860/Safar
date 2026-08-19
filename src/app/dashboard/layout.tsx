'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './layout.module.css';

export type UserRole = 'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin';

interface NavItem {
  path: string;
  icon: string;
  labelEn: string;
  labelUr: string;
  badge?: number;
}

// Role-Specific Navigation Definitions
const roleNavItems: Record<UserRole, NavItem[]> = {
  driver: [
    { path: '/dashboard', icon: '🏠', labelEn: 'Driver Dashboard', labelUr: 'ڈرائیور ڈیش بورڈ' },
    { path: '/dashboard/loads', icon: '📋', labelEn: 'Find Loads', labelUr: 'لوڈ تلاش کریں' },
    { path: '/dashboard/trips', icon: '🚛', labelEn: 'My Booked Trips', labelUr: 'میرے سفر' },
    { path: '/dashboard/tracking', icon: '📍', labelEn: 'Live GPS Tracking', labelUr: 'لائیو ٹریکنگ' },
    { path: '/dashboard/wallet', icon: '💰', labelEn: 'My Wallet', labelUr: 'میرا والٹ' },
  ],
  shipper: [
    { path: '/dashboard/post-load', icon: '🏢', labelEn: 'Post Cargo Load', labelUr: 'لوڈ پوسٹ کریں' },
    { path: '/dashboard/loads', icon: '📦', labelEn: 'My Posted Shipments', labelUr: 'میرے کارگو' },
    { path: '/dashboard/tracking', icon: '📍', labelEn: 'Track Cargo Live', labelUr: 'شپمنٹ ٹریک کریں' },
    { path: '/dashboard/broker', icon: '🛡️', labelEn: 'Shipper Escrow Hub', labelUr: 'ایسکرو پورٹل' },
  ],
  fleet: [
    { path: '/dashboard/fleet', icon: '🚛', labelEn: 'Fleet Command Center', labelUr: 'فلیٹ کمانڈ سینٹر' },
    { path: '/dashboard/loads', icon: '📋', labelEn: 'Load Marketplace', labelUr: 'لوڈ مارکیٹ' },
    { path: '/dashboard/tracking', icon: '📍', labelEn: 'Fleet Live GPS', labelUr: 'فلیٹ ٹریکنگ' },
    { path: '/dashboard/wallet', icon: '💰', labelEn: 'Fleet Settlements', labelUr: 'فلیٹ والیٹ' },
  ],
  support: [
    { path: '/dashboard/support', icon: '🎧', labelEn: 'KYC Document Desk', labelUr: 'کے وائی سی ڈیسک' },
    { path: '/dashboard/broker', icon: '🛡️', labelEn: 'Broker Verification', labelUr: 'ڈسپیچ کنٹرول' },
    { path: '/dashboard/loads', icon: '📋', labelEn: 'All Platform Loads', labelUr: 'تمام لوڈز' },
  ],
  finance: [
    { path: '/dashboard/finance', icon: '💵', labelEn: 'Revenue & Tax Invoices', labelUr: 'ریونیو اور انوائسنگ' },
    { path: '/dashboard/broker', icon: '🛡️', labelEn: 'Escrow Clearing', labelUr: 'ایسکرو کلئیرنگ' },
    { path: '/dashboard/admin', icon: '⚙️', labelEn: 'Monetization Rules', labelUr: 'مونیٹائزیشن سیٹنگز' },
  ],
  admin: [
    { path: '/dashboard/admin', icon: '👑', labelEn: 'Super Admin System', labelUr: 'سپر ایڈمن' },
    { path: '/dashboard', icon: '📊', labelEn: 'Operations Overview', labelUr: 'آپریشنز ڈیش بورڈ' },
    { path: '/dashboard/loads', icon: '📋', labelEn: 'All Loads', labelUr: 'تمام لوڈز' },
    { path: '/dashboard/post-load', icon: '🏢', labelEn: 'Post Cargo', labelUr: 'کارگو پوسٹ کریں' },
    { path: '/dashboard/broker', icon: '🛡️', labelEn: 'Broker Hub', labelUr: 'بروکر پورٹل' },
    { path: '/dashboard/fleet', icon: '🚛', labelEn: 'Fleet Management', labelUr: 'فلیٹ مینجمنٹ' },
    { path: '/dashboard/support', icon: '🎧', labelEn: 'KYC Verification', labelUr: 'کے وائی سی ڈیسک' },
    { path: '/dashboard/finance', icon: '💵', labelEn: 'Revenue System', labelUr: 'ریونیو سسٹم' },
    { path: '/dashboard/tracking', icon: '📍', labelEn: 'GPS Map', labelUr: 'جی پی ایس میپ' },
    { path: '/dashboard/wallet', icon: '💰', labelEn: 'Wallet Accounts', labelUr: 'والٹ اکاؤنٹس' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [role, setRole] = useState<UserRole>('driver');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Read saved user role from localStorage if available
    const savedRole = localStorage.getItem('safarload_user_role') as UserRole;
    if (savedRole && roleNavItems[savedRole]) {
      setRole(savedRole);
    } else if (pathname.includes('/support')) {
      setRole('support');
    } else if (pathname.includes('/finance')) {
      setRole('finance');
    } else if (pathname.includes('/admin')) {
      setRole('admin');
    } else if (pathname.includes('/post-load')) {
      setRole('shipper');
    } else if (pathname.includes('/fleet')) {
      setRole('fleet');
    }
  }, [pathname]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [lang, theme, mounted]);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('safarload_user_role', newRole);
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentNavItems = roleNavItems[role] || roleNavItems.driver;
  const dir = lang === 'ur' ? 'rtl' : 'ltr';

  return (
    <div className={styles.layoutContainer} dir={dir} data-theme={theme} suppressHydrationWarning>
      {/* Sidebar Navigation - Strictly Filtered By User Role */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>🚛 SafarLoad</Link>
        </div>

        {/* User Identity Box */}
        <div className={styles.userSection}>
          <div className={styles.avatar}>
            {role === 'driver' && '👨‍✈️'}
            {role === 'shipper' && '🏢'}
            {role === 'fleet' && '🚚'}
            {role === 'support' && '🎧'}
            {role === 'finance' && '💵'}
            {role === 'admin' && '👑'}
            <span className={styles.onlineDot}></span>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {role === 'driver' && (lang === 'en' ? 'Muhammad Aslam' : 'محمد اسلم')}
              {role === 'shipper' && 'Noor Textile Mills'}
              {role === 'fleet' && 'Al-Farooq Transport'}
              {role === 'support' && 'Ayesha (Support Staff)'}
              {role === 'finance' && 'Salman (Finance Mgr)'}
              {role === 'admin' && 'Super Admin'}
            </span>
            <span className={styles.userRole}>
              {role === 'driver' && 'Verified Driver (LHR-5678)'}
              {role === 'shipper' && 'Enterprise Shipper'}
              {role === 'fleet' && 'Fleet Operator'}
              {role === 'support' && 'KYC Support Staff'}
              {role === 'finance' && 'Revenue Manager'}
              {role === 'admin' && 'System Super Admin'}
            </span>
          </div>
        </div>

        {/* Navigation Items (Role Filtered) */}
        <nav className={styles.navLinks}>
          {currentNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{lang === 'en' ? item.labelEn : item.labelUr}</span>
              {item.badge && <span className={styles.badge}>{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/login" className={styles.logoutBtn}>
            <span className={styles.navIcon}>🚪</span>
            <span className={styles.navLabel}>{lang === 'en' ? 'Log Out' : 'لاگ آؤٹ'}</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.searchBar}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={
                role === 'driver'
                  ? 'Search loads, routes, cities...'
                  : role === 'shipper'
                  ? 'Search cargo shipments, bilty...'
                  : 'Search platform records...'
              }
              className={styles.searchInput}
            />
          </div>

          <div className={styles.headerActions}>
            <button className={styles.langToggle} onClick={toggleTheme} title="Toggle Dark/Light Mode">
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button className={styles.langToggle} onClick={toggleLanguage}>
              🌐 {lang === 'en' ? 'اردو' : 'EN'}
            </button>

            {role === 'shipper' && (
              <Link href="/dashboard/post-load" className="btn btn-primary btn-sm">
                ➕ Post Cargo
              </Link>
            )}
            {role === 'driver' && (
              <Link href="/dashboard/loads" className="btn btn-primary btn-sm">
                📋 Find Loads
              </Link>
            )}
          </div>
        </header>

        <div className={styles.pageBody}>{children}</div>
      </main>
    </div>
  );
}
