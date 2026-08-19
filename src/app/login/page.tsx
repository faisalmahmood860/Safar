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
  { role: 'support', email: 'support@safarload.pk', password: 'Support@123', name: 'Ayesha Khan (Support Staff)', redirectUrl: '/dashboard/support' },
  { role: 'finance', email: 'finance@safarload.pk', password: 'Finance@123', name: 'Kamran Ali (Finance Desk)', redirectUrl: '/dashboard/finance' },
  { role: 'admin', email: 'admin@safarload.pk', password: 'SafarLoad@2026#Admin', name: 'Super Admin System', redirectUrl: '/dashboard/admin' },
];

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();

  const t = (key: string) => {
    return translations[lang]?.[key] || key;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const inputClean = emailOrPhone.trim().toLowerCase();

    // Match against system registered users across all roles automatically
    const targetUser = validSystemUsers.find(
      (u) => u.email.toLowerCase() === inputClean || u.phone === inputClean || u.role === inputClean
    );

    if (!targetUser) {
      setErrorMsg('❌ Invalid Username or Email! Please enter a registered SafarLoad account email (e.g., driver@safarload.pk, shipper@safarload.pk, finance@safarload.pk, support@safarload.pk, admin@safarload.pk).');
      return;
    }

    if (targetUser.password !== password) {
      setErrorMsg('❌ Incorrect Password! Please check your account password and try again.');
      return;
    }

    // Save User Session to localStorage
    try {
      localStorage.setItem('safarload_logged_user', JSON.stringify(targetUser));
      localStorage.setItem('safarload_user_role', targetUser.role);
    } catch (e) {
      console.error(e);
    }

    // Auto Route to Assigned Role Dashboard
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
              ? 'Connecting drivers, fleet owners, enterprise shippers, finance desks, and support across Pakistan.'
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
          <p className={styles.subtitle}>Enter your username/email and password to log in</p>

          {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

          {/* Direct Login Form */}
          <form onSubmit={handleLoginSubmit} className={styles.formStack}>
            <div className={styles.inputGroup}>
              <label>Username / Email / Registered Phone</label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="input input-lg"
                placeholder="e.g. driver@safarload.pk, finance@safarload.pk..."
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

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              🔐 Log In to SafarLoad →
            </button>
          </form>
        </div>

        <div className={styles.footerTerms}>
          By continuing, you agree to SafarLoad Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  );
}
