'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './layout.module.css';
import NotificationBell from '@/components/NotificationBell';
import VoIPCallModal from '@/components/VoIPCallModal';

export type UserRole = 'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin';

interface NavItem {
  path: string;
  icon: string;
  labelEn: string;
  labelUr: string;
  badge?: number;
}

// Role-Specific Navigation Definitions (Users only see their authorized reports & tools)
const roleNavItems: Record<UserRole, NavItem[]> = {
  driver: [
    { path: '/dashboard', icon: '🏠', labelEn: 'Dashboard Overview', labelUr: 'ڈیش بورڈ اوورویو' },
    { path: '/dashboard/loads', icon: '📋', labelEn: 'Load Marketplace', labelUr: 'لوڈ مارکیٹ' },
    { path: '/dashboard/trips', icon: '🚛', labelEn: 'Booked Trips & Bilty', labelUr: 'میرے سفر اور بلٹی' },
    { path: '/dashboard/tracking', icon: '📍', labelEn: 'Live GPS Tracking', labelUr: 'لائیو ٹریکنگ' },
    { path: '/dashboard/wallet', icon: '💰', labelEn: 'Wallet & Payouts', labelUr: 'والٹ اکاؤنٹس' },
  ],
  shipper: [
    { path: '/dashboard/post-load', icon: '🏢', labelEn: 'Post Cargo Load', labelUr: 'لوڈ پوسٹ کریں' },
    { path: '/dashboard/loads', icon: '📋', labelEn: 'Load Marketplace', labelUr: 'لوڈ مارکیٹ' },
    { path: '/dashboard/trips', icon: '🚛', labelEn: 'Booked Trips & Bilty', labelUr: 'میرے سفر اور بلٹی' },
    { path: '/dashboard/tracking', icon: '📍', labelEn: 'Live GPS Tracking', labelUr: 'لائیو ٹریکنگ' },
    { path: '/dashboard/broker', icon: '🛡️', labelEn: 'Broker & Escrow Hub', labelUr: 'بروکر پورٹل' },
  ],
  fleet: [
    { path: '/dashboard/fleet', icon: '🚚', labelEn: 'Fleet Management', labelUr: 'فلیٹ مینجمنٹ' },
    { path: '/dashboard/loads', icon: '📋', labelEn: 'Load Marketplace', labelUr: 'لوڈ مارکیٹ' },
    { path: '/dashboard/trips', icon: '🚛', labelEn: 'Booked Trips & Bilty', labelUr: 'میرے سفر اور بلٹی' },
    { path: '/dashboard/tracking', icon: '📍', labelEn: 'Live GPS Tracking', labelUr: 'لائیو ٹریکنگ' },
    { path: '/dashboard/wallet', icon: '💰', labelEn: 'Wallet & Payouts', labelUr: 'والٹ اکاؤنٹس' },
  ],
  support: [
    { path: '/dashboard/support', icon: '🎧', labelEn: 'KYC Document Desk', labelUr: 'کے وائی سی ڈیسک' },
    { path: '/dashboard/trips', icon: '🚛', labelEn: 'Booked Trips & Bilty', labelUr: 'میرے سفر اور بلٹی' },
    { path: '/dashboard/tracking', icon: '📍', labelEn: 'Live GPS Tracking', labelUr: 'لائیو ٹریکنگ' },
  ],
  finance: [
    { path: '/dashboard/finance', icon: '💵', labelEn: 'Finance & Revenue', labelUr: 'فنانس اور ریونیو' },
    { path: '/dashboard/wallet', icon: '💰', labelEn: 'Wallet & Payouts', labelUr: 'والٹ اکاؤنٹس' },
    { path: '/dashboard/broker', icon: '🛡️', labelEn: 'Broker & Escrow Hub', labelUr: 'بروکر پورٹل' },
  ],
  admin: [
    { path: '/dashboard', icon: '🏠', labelEn: 'Dashboard Overview', labelUr: 'ڈیش بورڈ اوورویو' },
    { path: '/dashboard/admin', icon: '👑', labelEn: 'Super Admin System', labelUr: 'سپر ایڈمن' },
    { path: '/dashboard/post-load', icon: '🏢', labelEn: 'Post Cargo Load', labelUr: 'لوڈ پوسٹ کریں' },
    { path: '/dashboard/loads', icon: '📋', labelEn: 'Load Marketplace', labelUr: 'لوڈ مارکیٹ' },
    { path: '/dashboard/trips', icon: '🚛', labelEn: 'Booked Trips & Bilty', labelUr: 'میرے سفر اور بلٹی' },
    { path: '/dashboard/fleet', icon: '🚚', labelEn: 'Fleet Management', labelUr: 'فلیٹ مینجمنٹ' },
    { path: '/dashboard/tracking', icon: '📍', labelEn: 'Live GPS Tracking', labelUr: 'لائیو ٹریکنگ' },
    { path: '/dashboard/wallet', icon: '💰', labelEn: 'Wallet & Payouts', labelUr: 'والٹ اکاؤنٹس' },
    { path: '/dashboard/broker', icon: '🛡️', labelEn: 'Broker & Escrow Hub', labelUr: 'بروکر پورٹل' },
    { path: '/dashboard/support', icon: '🎧', labelEn: 'KYC Document Desk', labelUr: 'کے وائی سی ڈیسک' },
    { path: '/dashboard/finance', icon: '💵', labelEn: 'Finance & Revenue', labelUr: 'فنانس اور ریونیو' },
  ],
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [role, setRole] = useState<UserRole>('driver');
  const [user, setUser] = useState<{ name: string; email: string; role: UserRole } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('safarload_logged_user');
    const savedRole = localStorage.getItem('safarload_user_role') as UserRole;

    if (!storedUser && !savedRole) {
      // Require Credentials: Redirect to Login if not authenticated
      router.push('/login');
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setRole(parsed.role || 'driver');
      } catch (err) {
        console.error(err);
        setRole(savedRole || 'driver');
      }
    } else if (savedRole) {
      setRole(savedRole);
    }
    setIsAuthenticated(true);
  }, [pathname, router]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [lang, theme, mounted]);

  const handleLogout = () => {
    localStorage.removeItem('safarload_logged_user');
    localStorage.removeItem('safarload_user_role');
    router.push('/login');
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('safarload_user_role', newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('safarload_logged_user', JSON.stringify(updatedUser));
    }
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0F172A', color: '#10B981', fontWeight: 800, fontSize: '1.2rem', gap: '0.75rem' }}>
        🔒 {lang === 'en' ? 'Authenticating Session Credentials & Loading Portal...' : 'سیشن کی تصدیق ہو رہی ہے...'}
      </div>
    );
  }

  const currentNavItems = roleNavItems[role] || roleNavItems['driver'];
  const dir = lang === 'ur' ? 'rtl' : 'ltr';

  return (
    <div className={styles.layoutContainer} dir={dir} data-theme={theme} suppressHydrationWarning>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.logo}>🚛 SafarLoad</Link>
        </div>

        {/* User Session Profile Header Box */}
        <div className={styles.userSection}>
          <div className={styles.avatar}>
            {role === 'driver' ? '👨‍✈️' : role === 'shipper' ? '🏢' : role === 'fleet' ? '🚚' : role === 'support' ? '🎧' : role === 'finance' ? '💵' : '👑'}
            <span className={styles.onlineDot}></span>
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.name || (lang === 'en' ? 'Authenticated User' : 'تصدیق شدہ صارف')}
            </span>
            <span className={styles.userRole}>
              {role ? role.toUpperCase() : 'USER'} • {lang === 'en' ? 'Role-Filtered Access' : 'مخصوص رسائی'}
            </span>
          </div>
        </div>

        {/* Role-Specific Navigation Items */}
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
          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutBtn}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span className={styles.navIcon}>🚪</span>
            <span className={styles.navLabel}>{lang === 'en' ? 'Log Out' : 'سائن آؤٹ'}</span>
          </button>
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
            <NotificationBell userRole={role} lang={lang as 'en' | 'ur'} />

            {/* Quick Role Switcher Selector */}
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className={styles.langToggle}
              style={{ fontWeight: 700, cursor: 'pointer', outline: 'none' }}
              title="Switch View Mode by User Role"
            >
              <option value="driver">👨‍✈️ Driver View</option>
              <option value="shipper">🏢 Shipper View</option>
              <option value="fleet">🚚 Fleet View</option>
              <option value="support">🎧 Support View</option>
              <option value="finance">💵 Finance View</option>
              <option value="admin">👑 Admin View</option>
            </select>

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

      {/* Global VoIP Call Overlay Modal */}
      <VoIPCallModal />
    </div>
  );
}
