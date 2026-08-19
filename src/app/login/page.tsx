'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { translations } from '@/lib/translations';
import { presetTestAccounts, TestAccount } from '@/lib/mockData';

type Lang = 'en' | 'ur';

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [selectedRole, setSelectedRole] = useState<'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin'>('driver');
  
  // Credentials Inputs
  const [emailOrPhone, setEmailOrPhone] = useState('driver@safarload.pk');
  const [password, setPassword] = useState('Driver@123');
  const [adminPin, setAdminPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const router = useRouter();

  const t = (key: string) => {
    return translations[lang]?.[key] || key;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  // Quick Preset Test Account Selector
  const handleSelectPreset = (acc: TestAccount) => {
    setSelectedRole(acc.role);
    setEmailOrPhone(acc.email);
    setPassword(acc.password);
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Secure Verification for Super Admin
    if (selectedRole === 'admin') {
      if (emailOrPhone !== 'admin@safarload.pk' || password !== 'SafarLoad@2026#Admin') {
        setErrorMsg('❌ Invalid Super Admin Credentials! Required: admin@safarload.pk / SafarLoad@2026#Admin');
        return;
      }
      router.push('/admin');
      return;
    }

    // Support Staff Verification
    if (selectedRole === 'support') {
      router.push('/support');
      return;
    }

    // Finance Manager Verification
    if (selectedRole === 'finance') {
      router.push('/finance');
      return;
    }

    // Shipper / Organization Verification
    if (selectedRole === 'shipper') {
      router.push('/dashboard/post-load');
      return;
    }

    // Fleet Owner Verification
    if (selectedRole === 'fleet') {
      router.push('/dashboard/fleet');
      return;
    }

    // Driver Verification
    router.push('/dashboard');
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
          <p className={styles.subtitle}>Select your user role and log in to SafarLoad</p>

          {/* User Role Selection Tabs */}
          <div className={styles.roleTabs}>
            <button
              type="button"
              onClick={() => handleSelectPreset(presetTestAccounts[0])}
              className={`${styles.roleTab} ${selectedRole === 'driver' ? styles.activeRoleTab : ''}`}
            >
              🚛 Driver
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset(presetTestAccounts[1])}
              className={`${styles.roleTab} ${selectedRole === 'shipper' ? styles.activeRoleTab : ''}`}
            >
              🏢 Shipper
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset(presetTestAccounts[2])}
              className={`${styles.roleTab} ${selectedRole === 'fleet' ? styles.activeRoleTab : ''}`}
            >
              🚚 Fleet Owner
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset(presetTestAccounts[3])}
              className={`${styles.roleTab} ${selectedRole === 'support' ? styles.activeRoleTab : ''}`}
            >
              🎧 KYC Support
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset(presetTestAccounts[4])}
              className={`${styles.roleTab} ${selectedRole === 'finance' ? styles.activeRoleTab : ''}`}
            >
              💵 Finance
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset(presetTestAccounts[5])}
              className={`${styles.roleTab} ${selectedRole === 'admin' ? styles.adminRoleTab : ''}`}
            >
              👑 Super Admin
            </button>
          </div>

          {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className={styles.formStack}>
            <div className={styles.inputGroup}>
              <label>Email or Phone Number</label>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="input input-lg"
                placeholder="e.g. driver@safarload.pk or +92 301 2345678"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
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
              🚀 Log In to {selectedRole.toUpperCase()} System →
            </button>
          </form>

          {/* Preset Quick Fill Demo Accounts */}
          <div className={styles.presetBox}>
            <span className={styles.presetLabel}>🧪 Test Account Quick Fill:</span>
            <div className={styles.presetChips}>
              {presetTestAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(acc)}
                  className={`${styles.presetChip} ${selectedRole === acc.role ? styles.activePreset : ''}`}
                >
                  {acc.role === 'driver' && '🚛 Driver'}
                  {acc.role === 'shipper' && '🏢 Shipper'}
                  {acc.role === 'fleet' && '🚚 Fleet'}
                  {acc.role === 'support' && '🎧 Support'}
                  {acc.role === 'finance' && '💵 Finance'}
                  {acc.role === 'admin' && '👑 Admin'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footerTerms}>
          By continuing, you agree to SafarLoad Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  );
}
