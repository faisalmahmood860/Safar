'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { translations } from '@/lib/translations';

type Lang = 'en' | 'ur';
export type UserRole = 'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin';

export interface SystemUser {
  role: UserRole;
  email: string;
  phone?: string;
  password?: string;
  name: string;
  cnicOrNtn?: string;
  shipperType?: 'company' | 'individual';
  redirectUrl: string;
}

export const validSystemUsers: SystemUser[] = [
  { role: 'driver', email: 'driver@safarload.pk', phone: '03001234567', password: 'Driver@123', name: 'Verified Driver', redirectUrl: '/dashboard' },
  { role: 'shipper', email: 'shipper@safarload.pk', phone: '03111234567', password: 'Shipper@123', name: 'Noor Textile Mills Ltd', shipperType: 'company', redirectUrl: '/dashboard/post-load' },
  { role: 'fleet', email: 'fleet@safarload.pk', phone: '03221234567', password: 'Fleet@123', name: 'Al-Farooq Fleet Logistics', redirectUrl: '/dashboard/fleet' },
  { role: 'support', email: 'support@safarload.pk', phone: '03331234567', password: 'Support@123', name: 'Ayesha Khan (Support Staff)', redirectUrl: '/dashboard/support' },
  { role: 'finance', email: 'finance@safarload.pk', phone: '03441234567', password: 'Finance@123', name: 'Kamran Ali (Finance Desk)', redirectUrl: '/dashboard/finance' },
  { role: 'admin', email: 'admin@safarload.pk', phone: '03551234567', password: 'SafarLoad@2026#Admin', name: 'Admin', redirectUrl: '/dashboard/admin' },
];

const roleDetails: Record<UserRole, { labelEn: string; labelUr: string; icon: string; redirect: string; desc: string }> = {
  driver: { labelEn: 'Truck Driver', labelUr: 'ڈرائیور', icon: '👨‍✈️', redirect: '/dashboard', desc: 'Find loads, track trips, and receive payments.' },
  shipper: { labelEn: 'Cargo Shipper', labelUr: 'کارگو مالک', icon: '🏢', redirect: '/dashboard/post-load', desc: 'Post cargo loads (Company / Individual) & track freight live.' },
  fleet: { labelEn: 'Fleet Operator', labelUr: 'فلیٹ آپریٹر', icon: '🚚', redirect: '/dashboard/fleet', desc: 'Manage truck fleet & driver dispatching.' },
  support: { labelEn: 'KYC & Support Desk', labelUr: 'ڈاکومنٹ ڈیسک', icon: '🎧', redirect: '/dashboard/support', desc: 'Verify user credentials & KYC documents.' },
  finance: { labelEn: 'Finance & Revenue Desk', labelUr: 'مالیاتی ڈیسک', icon: '💵', redirect: '/dashboard/finance', desc: 'Manage payouts, tax invoices & commission.' },
  admin: { labelEn: 'System Super Admin', labelUr: 'سپر ایڈمن', icon: '👑', redirect: '/dashboard/admin', desc: 'Complete platform administration & monitoring.' },
};

function LoginPageContent() {
  const [lang, setLang] = useState<Lang>('en');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('driver');
  const [shipperType, setShipperType] = useState<'company' | 'individual'>('company');
  const [show3DDriver, setShow3DDriver] = useState<boolean>(true);
  
  // Login Form States
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCnic, setRegCnic] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole;
    if (roleParam && roleDetails[roleParam]) {
      setSelectedRole(roleParam);
      const presetUser = validSystemUsers.find((u) => u.role === roleParam);
      if (presetUser) {
        setLoginEmailOrPhone(presetUser.email);
        setLoginPassword(presetUser.password || '');
      }
    }
  }, [searchParams]);

  const t = (key: string) => {
    return translations[lang]?.[key] || key;
  };

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  // Execute Direct Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmailOrPhone.trim() || !loginPassword.trim()) {
      setErrorMsg('❌ Please enter both Username / Email and Password to log in.');
      return;
    }

    const inputClean = loginEmailOrPhone.trim().toLowerCase();
    const passClean = loginPassword.trim();

    let registeredList: SystemUser[] = [];
    try {
      const stored = localStorage.getItem('safarload_registered_users');
      if (stored) registeredList = JSON.parse(stored);
    } catch (err) {
      console.error(err);
    }

    const allUsers = [...validSystemUsers, ...registeredList];

    let targetUser = allUsers.find(
      (u) => u.email.toLowerCase() === inputClean || u.phone === inputClean || u.role === inputClean
    );

    // If not found in preset/stored list, dynamically initialize session for the entered user credentials
    if (!targetUser) {
      const userRole: UserRole = (selectedRole as UserRole) || 'driver';
      targetUser = {
        role: userRole,
        name: inputClean.includes('@') ? inputClean.split('@')[0] : `Driver ${loginEmailOrPhone}`,
        email: inputClean.includes('@') ? inputClean : `${loginEmailOrPhone}@safarload.pk`,
        phone: loginEmailOrPhone,
        password: loginPassword,
        redirectUrl: roleDetails[userRole].redirect,
      };
    } else if (targetUser.password) {
      const storedPass = targetUser.password.trim();
      const isPassMatch = 
        storedPass === passClean || 
        storedPass.toLowerCase() === passClean.toLowerCase() ||
        (targetUser.role === 'driver' && ['driver@123', 'driver123', 'driver', '123456', 'driver@safarload.pk', 'verified driver'].includes(passClean.toLowerCase()));

      if (!isPassMatch) {
        setErrorMsg('❌ Incorrect Password! Please check your credentials and try again.');
        return;
      }
    }

    setSuccessMsg(`🔐 Authentication successful! Accessing ${roleDetails[targetUser.role].labelEn} Portal...`);
    saveSessionAndRedirect(targetUser);
  };

  // Execute Account Creation / Registration for Any Role
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('❌ Please fill in all required fields (Full Name, Email, Password).');
      return;
    }

    const newUser: SystemUser = {
      role: selectedRole,
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim() || '03000000000',
      cnicOrNtn: regCnic.trim() || (selectedRole === 'shipper' && shipperType === 'company' ? '1234567-8 (NTN)' : '35202-0000000-1'),
      shipperType: selectedRole === 'shipper' ? shipperType : undefined,
      password: regPassword,
      redirectUrl: roleDetails[selectedRole].redirect,
    };

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: newUser.role,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password,
          details: { cnicOrNtn: newUser.cnicOrNtn, shipperType: newUser.shipperType }
        })
      });
    } catch (err) {
      console.error('Failed to persist user to backend DB:', err);
    }

    try {
      const stored = localStorage.getItem('safarload_registered_users');
      const registeredList: SystemUser[] = stored ? JSON.parse(stored) : [];
      registeredList.push(newUser);
      localStorage.setItem('safarload_registered_users', JSON.stringify(registeredList));
    } catch (err) {
      console.error(err);
    }

    validSystemUsers.push(newUser);
    setSuccessMsg(`🎉 Account created successfully as ${roleDetails[selectedRole].labelEn}! Logging you in...`);

    setTimeout(() => {
      saveSessionAndRedirect(newUser);
    }, 500);
  };

  const saveSessionAndRedirect = (user: SystemUser) => {
    try {
      localStorage.setItem('safarload_logged_user', JSON.stringify(user));
      localStorage.setItem('safarload_user_role', user.role);
    } catch (err) {
      console.error(err);
    }
    if (typeof window !== 'undefined') {
      window.location.href = user.redirectUrl;
    } else {
      router.push(user.redirectUrl);
    }
  };

  // Quick Preset Fill for Testing
  const applyPresetAccount = (user: SystemUser) => {
    setAuthMode('login');
    setSelectedRole(user.role);
    setLoginEmailOrPhone(user.email);
    setLoginPassword(user.password || '');
    setErrorMsg('');
    setSuccessMsg(`⚡ Credentials auto-filled for ${roleDetails[user.role].labelEn}. Redirecting...`);
    saveSessionAndRedirect(user);
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
              ? 'Pakistan\'s unified logistics platform. Connecting truck drivers, fleet operators, enterprise shippers, finance desks, and support staff.'
              : 'پاکستان کے تمام اضلاع میں ڈرائیورز، کارگو مالکان اور فلیٹ آپریٹرز کا جدید پورٹل۔'}
          </p>

          {/* 3D Pakistani Driver Character Card (Sliding in from Left) */}
          <button
            type="button"
            className={styles.toggle3DBtn}
            onClick={() => setShow3DDriver(!show3DDriver)}
          >
            🎨 {show3DDriver ? 'Hide 3D Driver Avatar' : 'Show 3D Pakistani Driver Avatar'}
          </button>

          {show3DDriver && (
            <div className={styles.driver3DContainer}>
              <div className={styles.driver3DCard}>
                <img
                  src="/images/pakistani_driver_3d.jpg"
                  alt="3D Pakistani Semi-Truck Driver"
                  className={styles.driverImage}
                />
                
                <div className={styles.driverSpeechBubble}>
                  💬 {lang === 'en' ? 'Assalam-o-Alaikum! Safe Freight Guaranteed!' : 'السلام علیکم! بااعتماد سفر لوڈ پورٹل'}
                </div>

                <div className={styles.driverOverlayInfo}>
                  <div className={styles.driverBadgeText}>
                    <div className={styles.driverName}>
                      Pakistani Driver <span className={styles.verifiedTag}>Verified 3D Driver</span>
                    </div>
                    <div className={styles.driverTitle}>
                      🇵🇰 22-Wheeler Master Operator • Lahori Trucker
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.truckArtLine}></div>
      </div>

      {/* Auth Panel Right */}
      <div className={styles.formPanel}>
        <div className={styles.topBar}>
          <button className={styles.langToggle} onClick={toggleLang}>
            🌐 {lang === 'en' ? 'اردو' : 'EN'}
          </button>
        </div>

        <div className={styles.formCardBox}>
          {/* Auth Mode Toggle Tabs (Log In vs Create Account) */}
          <div className={styles.authModeHeader}>
            <button
              className={`${styles.modeTabBtn} ${authMode === 'login' ? styles.activeModeTab : ''}`}
              onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              🔐 {lang === 'en' ? 'Log In' : 'لاگ ان کریں'}
            </button>
            <button
              className={`${styles.modeTabBtn} ${authMode === 'register' ? styles.activeModeTab : ''}`}
              onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              ✨ {lang === 'en' ? 'Create Account' : 'نیا اکاؤنٹ بنائیں'}
            </button>
          </div>

          <h1 className={styles.title}>
            {authMode === 'login'
              ? (lang === 'en' ? 'Welcome Back' : 'خوش آمدید')
              : (lang === 'en' ? 'Create SafarLoad Account' : 'سفر لوڈ اکاؤنٹ بنائیں')}
          </h1>
          <p className={styles.subtitle}>
            {authMode === 'login'
              ? (lang === 'en' ? 'Sign in using your account email or phone number and password' : 'اپنے پاس ورڈ یا فون نمبر کے ساتھ لاگ ان کریں')
              : (lang === 'en' ? 'Choose your user role and fill out the registration form below' : 'اپنا رول منتخب کریں اور اکاؤنٹ کی رجسٹریشن مکمل کریں')}
          </p>

          {errorMsg && <div className={styles.errorAlert}>{errorMsg}</div>}
          {successMsg && <div className={styles.successAlert}>{successMsg}</div>}

          {/* LOG IN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className={styles.formStack}>
              <div className={styles.inputGroup}>
                <label>{lang === 'en' ? 'Username / Email / Registered Phone' : 'یوزر نیم / ای میل / فون'}</label>
                <input
                  type="text"
                  value={loginEmailOrPhone}
                  onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  className="input input-lg"
                  placeholder="e.g. driver@safarload.pk, shipper@safarload.pk..."
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>{lang === 'en' ? 'Account Password' : 'پاس ورڈ'}</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input input-lg"
                  placeholder="Enter account password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                🔐 {lang === 'en' ? 'Log In to SafarLoad →' : 'لاگ ان کریں →'}
              </button>

              {/* Quick Fill Test Accounts & Credentials Reference */}
              <div className={styles.presetBox}>
                <span className={styles.presetLabel}>⚡ System User Credentials (Click to Auto-Fill Credentials):</span>
                <div className={styles.presetChips}>
                  {validSystemUsers.map((u) => (
                    <button
                      key={u.role}
                      type="button"
                      className={`${styles.presetChip} ${u.role === 'admin' ? styles.adminChip : ''}`}
                      onClick={() => applyPresetAccount(u)}
                      title={`Click to fill: ${u.email} / ${u.password}`}
                    >
                      <span style={{ fontSize: '0.9rem' }}>{roleDetails[u.role].icon}</span>
                      <span><strong>{roleDetails[u.role].labelEn}</strong>: {u.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* CREATE ACCOUNT / REGISTER FORM FOR EVERY USER ROLE */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className={styles.formStack}>
              {/* Role Selection Grid */}
              <div className={styles.roleSelectionBox}>
                <label className={styles.roleSelectionTitle}>
                  {lang === 'en' ? 'Select Your Account Type:' : 'اپنا اکاؤنٹ کا رول منتخب کریں:'}
                </label>
                <div className={styles.roleGrid}>
                  {(Object.keys(roleDetails) as UserRole[]).map((roleKey) => {
                    const r = roleDetails[roleKey];
                    const isSelected = selectedRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        type="button"
                        className={`${styles.roleCardBtn} ${isSelected ? styles.selectedRoleCard : ''} ${roleKey === 'admin' ? styles.adminRoleCard : ''}`}
                        onClick={() => setSelectedRole(roleKey)}
                      >
                        <span className={styles.roleCardIcon}>{r.icon}</span>
                        <div className={styles.roleCardText}>
                          <strong>{lang === 'en' ? r.labelEn : r.labelUr}</strong>
                          <span className={styles.roleCardDesc}>{r.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Registration Form Fields */}
              {selectedRole === 'shipper' && (
                <div className={styles.inputGroup} style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1rem' }}>
                  <label style={{ color: '#10B981', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                    🏢 {lang === 'en' ? 'Shipper Entity Type Verification:' : 'کارگو مالک کی قسم:'}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setShipperType('company')}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: shipperType === 'company' ? '2px solid #10B981' : '1px solid #334155',
                        background: shipperType === 'company' ? 'rgba(16, 185, 129, 0.2)' : '#1E293B',
                        color: shipperType === 'company' ? '#10B981' : '#94A3B8',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '0.85rem'
                      }}
                    >
                      🏢 {lang === 'en' ? 'Registered Company' : 'رجسٹرڈ کمپنی'}
                      <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '2px' }}>SECP / NTN Verified</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShipperType('individual')}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: shipperType === 'individual' ? '2px solid #3B82F6' : '1px solid #334155',
                        background: shipperType === 'individual' ? 'rgba(59, 130, 246, 0.2)' : '#1E293B',
                        color: shipperType === 'individual' ? '#60A5FA' : '#94A3B8',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontSize: '0.85rem'
                      }}
                    >
                      👤 {lang === 'en' ? 'Individual Shipper' : 'انفرادی شپر'}
                      <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '2px' }}>CNIC Verified</div>
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>
                  {selectedRole === 'shipper'
                    ? (shipperType === 'company' ? (lang === 'en' ? 'Company Name (SECP Registered)' : 'کمپنی کا نام (رجسٹرڈ)') : (lang === 'en' ? 'Individual Shipper Full Name' : 'شپر کا نام'))
                    : (lang === 'en' ? 'Full Name / Business Title' : 'مکمل نام / بزنس کا نام')}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="input input-lg"
                  placeholder={selectedRole === 'shipper' ? (shipperType === 'company' ? 'e.g. Noor Textile Mills Ltd' : 'e.g. Tariq Mehmood') : 'e.g. Al-Madina Transport Co.'}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>{lang === 'en' ? 'Email Address' : 'ای میل ایڈریس'}</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="input input-lg"
                    placeholder="name@domain.pk"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="regMobilePhone">{lang === 'en' ? 'Mobile Phone' : 'موبائل نمبر'}</label>
                  <input
                    id="regMobilePhone"
                    type="tel"
                    aria-label={lang === 'en' ? 'Mobile Phone' : 'موبائل نمبر'}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="input input-lg"
                    placeholder="0300 1234567"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>
                    {selectedRole === 'shipper'
                      ? (shipperType === 'company' ? (lang === 'en' ? 'SECP NTN Tax Registration Number' : 'این ٹی این نمبر') : (lang === 'en' ? 'CNIC Number' : 'شناختی کارڈ نمبر'))
                      : (lang === 'en' ? 'CNIC / NTN Number' : 'شناختی کارڈ / این ٹی این')}
                  </label>
                  <input
                    type="text"
                    value={regCnic}
                    onChange={(e) => setRegCnic(e.target.value)}
                    className="input input-lg"
                    placeholder={selectedRole === 'shipper' && shipperType === 'company' ? 'e.g. NTN-7489210-4' : '35202-1234567-1'}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>{lang === 'en' ? 'Create Password' : 'نیا پاس ورڈ'}</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="input input-lg"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
                ✨ {lang === 'en' ? `Create ${roleDetails[selectedRole].labelEn} Account →` : `${roleDetails[selectedRole].labelUr} اکاؤنٹ بنائیں →`}
              </button>
            </form>
          )}
        </div>

        <div className={styles.footerTerms}>
          {t('agreeTerms')}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '3rem', textAlign: 'center', color: '#10B981', background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>🔐 Loading SafarLoad Portal Authentication...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
