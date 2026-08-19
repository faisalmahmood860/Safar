'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { translations } from '@/lib/translations';
import { presetTestAccounts, TestAccount } from '@/lib/mockData';

type Lang = 'en' | 'ur';

export interface SystemUser {
  role: 'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin';
  email: string;
  phone?: string;
  password: string;
  name: string;
  redirectUrl: string;
}

export const validSystemUsers: SystemUser[] = [
  { role: 'driver', email: 'driver@safarload.pk', password: 'Driver@123', name: 'Muhammad Aslam (Verified Driver)', redirectUrl: '/dashboard' },
  { role: 'shipper', email: 'shipper@safarload.pk', password: 'Shipper@123', name: 'Noor Textile Mills Ltd', redirectUrl: '/dashboard/post-load' },
  { role: 'fleet', email: 'fleet@safarload.pk', password: 'Fleet@123', name: 'Al-Farooq Fleet Logistics', redirectUrl: '/dashboard/fleet' },
  { role: 'support', email: 'support@safarload.pk', password: 'Support@123', name: 'Ayesha Khan (Support Staff)', redirectUrl: '/support' },
  { role: 'finance', email: 'finance@safarload.pk', password: 'Finance@123', name: 'Kamran Ali (Finance Desk)', redirectUrl: '/finance' },
  { role: 'admin', email: 'admin@safarload.pk', password: 'SafarLoad@2026#Admin', name: 'Super Admin System', redirectUrl: '/admin' },
];

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [selectedRole, setSelectedRole] = useState<'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin'>('driver');
  
  // Credentials Inputs
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();

  const t = (key: string) => {
    return translations[lang]?.[key] || key;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const handleRoleSelect = (role: 'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin') => {
    setSelectedRole(role);
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetUser = validSystemUsers.find(
      (u) => u.role === selectedRole && (u.email.toLowerCase() === emailOrPhone.trim().toLowerCase() || u.phone === emailOrPhone.trim())
    );

    if (!targetUser) {
      setErrorMsg(`❌ Invalid email or phone number for ${selectedRole.toUpperCase()} login!`);
      return;
    }

    if (targetUser.password !== password) {
      setErrorMsg('❌ Incorrect Password! Please enter the valid password for your account.');
      return;
    }

    // Save User Session to localStorage
    try {
      localStorage.setItem('safarload_logged_user', JSON.stringify(targetUser));
      localStorage.setItem('safarload_user_role', targetUser.role);
    } catch (e) {
      console.error(e);
    }

    router.push(targetUser.redirectUrl);
  };

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Branding Left Panel */}
      <div className={styles.brandingPanel}>
        <div className={styles.brandingContent}>
          <Link href="/" className={styles.logo}>
            🚛 Safar<span>Load</span>
          </Link>
          <h2 className={styles.tagline}>{t('brand.tagline')}</h2>
          <p className={styles.taglineDesc}>
            {lang === 'en'
              ? 'Connecting drivers, fleet owners, enterprise shippers, and support desks across Pakistan.'
              : 'پاکستان کے تمام اضلاع میں ڈرائیورز اور لاجسٹکس سسٹمز کا بااعتماد نیٹ ورک۔'}
          </p>

          <div className={styles.statsBadgeContainer}>
            <div className={styles.statBadge}>
              <span className={styles.statIcon}>👨‍✈️</span>
              <div>
                <div className={styles.statVal}>52,000+</div>
                <div className={styles.statLbl}>Verified Drivers</div>
              </div>
            </div>
            
            <div className={styles.statBadge}>
              <span className={styles.statIcon}>🏙️</span>
              <div>
                <div className={styles.statVal}>450+</div>
                <div className={styles.statLbl}>Active Cities</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.truckArtLine}></div>
      </div>

      {/* Login Form Right Panel */}
      <div className={styles.formPanel}>
        <div className={styles.topBar}>
          <button className={styles.langToggle} onClick={toggleLang}>
            🌐 {lang === 'en' ? 'اردو' : 'EN'}
          </button>
        </div>

        <div className={styles.formCardBox}>
          <h1 className={styles.title}>{t('login.welcome')}</h1>
          <p className={styles.subtitle}>Select your assigned role and log in with your password</p>

          {/* User Role Selection Tabs */}
          <div className={styles.roleTabs}>
            <button
              type="button"
              onClick={() => handleRoleSelect('driver')}
              className={`${styles.roleTab} ${selectedRole === 'driver' ? styles.activeRoleTab : ''}`}
            >
              🚛 Driver
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('shipper')}
              className={`${styles.roleTab} ${selectedRole === 'shipper' ? styles.activeRoleTab : ''}`}
            >
              🏢 Shipper
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('fleet')}
              className={`${styles.roleTab} ${selectedRole === 'fleet' ? styles.activeRoleTab : ''}`}
            >
              🚚 Fleet Owner
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('support')}
              className={`${styles.roleTab} ${selectedRole === 'support' ? styles.activeRoleTab : ''}`}
            >
              🎧 KYC Support
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('finance')}
              className={`${styles.roleTab} ${selectedRole === 'finance' ? styles.activeRoleTab : ''}`}
            >
              💵 Finance
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`${styles.roleTab} ${selectedRole === 'admin' ? styles.adminRoleTab : ''}`}
            >
              👑 Super Admin
            </button>
          </div>

          {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className={styles.formStack}>
            <div className={styles.inputGroup}>
              <label>Email or Registered Phone Number</label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="input input-lg"
                placeholder={`e.g. ${selectedRole}@safarload.pk`}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Account Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-lg"
                placeholder="Enter password"
                required
              />
            </div>

            {selectedRole === 'admin' && (
              <div className={styles.inputGroup}>
                <label>Super Admin Security PIN (Optional)</label>
                <input
                  type="text"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="input"
                  placeholder="e.g. 786-921"
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              🔐 Log In to {selectedRole.toUpperCase()} System →
            </button>
          </form>

          {/* Credential Reference Box */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
            <strong style={{ color: 'var(--color-primary)' }}>🔑 Registered Account Credentials:</strong>
            <ul style={{ margin: '4px 0 0', paddingLeft: '1.25rem', color: 'var(--color-text-secondary)' }}>
              <li><strong>Driver:</strong> driver@safarload.pk / <code>Driver@123</code></li>
              <li><strong>Shipper:</strong> shipper@safarload.pk / <code>Shipper@123</code></li>
              <li><strong>Fleet Manager:</strong> fleet@safarload.pk / <code>Fleet@123</code></li>
              <li><strong>KYC Support:</strong> support@safarload.pk / <code>Support@123</code></li>
              <li><strong>Finance Desk:</strong> finance@safarload.pk / <code>Finance@123</code></li>
              <li><strong>Super Admin:</strong> admin@safarload.pk / <code>SafarLoad@2026#Admin</code></li>
            </ul>
          </div>
        </div>

        <div className={styles.footerTerms}>
          By continuing, you agree to SafarLoad Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  );
}
