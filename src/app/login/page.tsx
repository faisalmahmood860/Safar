'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  redirectUrl: string;
  provider?: 'email' | 'google' | 'facebook';
}

export const validSystemUsers: SystemUser[] = [
  { role: 'driver', email: 'driver@safarload.pk', phone: '03001234567', password: 'Driver@123', name: 'Muhammad Aslam (Verified Driver)', redirectUrl: '/dashboard', provider: 'email' },
  { role: 'shipper', email: 'shipper@safarload.pk', phone: '03111234567', password: 'Shipper@123', name: 'Noor Textile Mills Ltd', redirectUrl: '/dashboard/post-load', provider: 'email' },
  { role: 'fleet', email: 'fleet@safarload.pk', phone: '03221234567', password: 'Fleet@123', name: 'Al-Farooq Fleet Logistics', redirectUrl: '/dashboard/fleet', provider: 'email' },
  { role: 'support', email: 'support@safarload.pk', phone: '03331234567', password: 'Support@123', name: 'Ayesha Khan (Support Staff)', redirectUrl: '/dashboard/support', provider: 'email' },
  { role: 'finance', email: 'finance@safarload.pk', phone: '03441234567', password: 'Finance@123', name: 'Kamran Ali (Finance Desk)', redirectUrl: '/dashboard/finance', provider: 'email' },
  { role: 'admin', email: 'admin@safarload.pk', phone: '03551234567', password: 'SafarLoad@2026#Admin', name: 'Super Admin System', redirectUrl: '/dashboard/admin', provider: 'email' },
];

const roleDetails: Record<UserRole, { labelEn: string; labelUr: string; icon: string; redirect: string; desc: string }> = {
  driver: { labelEn: 'Truck Driver', labelUr: 'ڈرائیور', icon: '👨‍✈️', redirect: '/dashboard', desc: 'Find loads, track trips, and receive payments.' },
  shipper: { labelEn: 'Enterprise Shipper', labelUr: 'کارگو مالک', icon: '🏢', redirect: '/dashboard/post-load', desc: 'Post cargo loads & track freight live.' },
  fleet: { labelEn: 'Fleet Operator', labelUr: 'فلیٹ آپریٹر', icon: '🚚', redirect: '/dashboard/fleet', desc: 'Manage truck fleet & driver dispatching.' },
  support: { labelEn: 'KYC & Support Desk', labelUr: 'ڈاکومنٹ ڈیسک', icon: '🎧', redirect: '/dashboard/support', desc: 'Verify user credentials & KYC documents.' },
  finance: { labelEn: 'Finance & Revenue Desk', labelUr: 'مالیاتی ڈیسک', icon: '💵', redirect: '/dashboard/finance', desc: 'Manage payouts, tax invoices & commission.' },
  admin: { labelEn: 'System Super Admin', labelUr: 'سپر ایڈمن', icon: '👑', redirect: '/dashboard/admin', desc: 'Complete platform administration & monitoring.' },
};

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('driver');
  
  // Login Form States
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCnic, setRegCnic] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status & Social Modal States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'Google' | 'Facebook' | null>(null);
  
  // 2-Step Social OAuth Flow States
  const [socialStep, setSocialStep] = useState<1 | 2>(1);
  const [selectedSocialName, setSelectedSocialName] = useState('Muhammad Aslam Khan');
  const [selectedSocialEmail, setSelectedSocialEmail] = useState('aslam.driver@gmail.com');
  const [customSocialInput, setCustomSocialInput] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const router = useRouter();

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

    const inputClean = loginEmailOrPhone.trim().toLowerCase();

    const targetUser = validSystemUsers.find(
      (u) => u.email.toLowerCase() === inputClean || u.phone === inputClean || u.role === inputClean
    );

    if (!targetUser) {
      setErrorMsg('❌ Invalid Credentials! Registered emails: driver@safarload.pk, shipper@safarload.pk, fleet@safarload.pk, support@safarload.pk, finance@safarload.pk, admin@safarload.pk');
      return;
    }

    if (targetUser.password !== loginPassword) {
      setErrorMsg('❌ Incorrect Password! Please check your credentials and try again.');
      return;
    }

    saveSessionAndRedirect(targetUser);
  };

  // Execute Account Creation / Registration for Any Role
  const handleRegisterSubmit = (e: React.FormEvent) => {
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
      cnicOrNtn: regCnic.trim() || '35202-0000000-1',
      password: regPassword,
      redirectUrl: roleDetails[selectedRole].redirect,
      provider: 'email',
    };

    validSystemUsers.push(newUser);
    setSuccessMsg(`🎉 Account created successfully as ${roleDetails[selectedRole].labelEn}! Logging you in...`);

    setTimeout(() => {
      saveSessionAndRedirect(newUser);
    }, 1000);
  };

  // Step 1: Open Google or Facebook OAuth Popup
  const triggerSocialAuth = (provider: 'Google' | 'Facebook') => {
    setSocialProvider(provider);
    setSocialStep(1);
    setSocialModalOpen(true);
    setIsAuthenticating(false);
  };

  // Step 1 -> Step 2: Select Social Account Credential
  const selectSocialAccountCredential = (name: string, email: string) => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setSelectedSocialName(name);
      setSelectedSocialEmail(email);
      setIsAuthenticating(false);
      setSocialStep(2);
    }, 800);
  };

  // Custom Social Email Submit
  const handleCustomSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSocialInput.trim()) return;
    const email = customSocialInput.trim().toLowerCase();
    const name = email.split('@')[0].replace('.', ' ').toUpperCase();
    selectSocialAccountCredential(name, email);
  };

  // Step 2: Finalize Role Assignment & OAuth Token Redirect
  const completeSocialAuthWithRole = (role: UserRole) => {
    setIsAuthenticating(true);

    setTimeout(() => {
      const socialUser: SystemUser = {
        role,
        name: `${selectedSocialName} (${roleDetails[role].labelEn})`,
        email: selectedSocialEmail,
        redirectUrl: roleDetails[role].redirect,
        provider: socialProvider === 'Google' ? 'google' : 'facebook',
      };

      setSocialModalOpen(false);
      saveSessionAndRedirect(socialUser);
    }, 900);
  };

  const saveSessionAndRedirect = (user: SystemUser) => {
    try {
      localStorage.setItem('safarload_logged_user', JSON.stringify(user));
      localStorage.setItem('safarload_user_role', user.role);
    } catch (err) {
      console.error(err);
    }
    router.push(user.redirectUrl);
  };

  // Quick Preset Fill for Testing
  const applyPresetAccount = (user: SystemUser) => {
    setAuthMode('login');
    setLoginEmailOrPhone(user.email);
    setLoginPassword(user.password || '');
    setErrorMsg('');
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
              ? (lang === 'en' ? 'Sign in using your account credentials or social login' : 'اپنے پاس ورڈ یا سوشل اکاؤنٹ کے ساتھ لاگ ان کریں')
              : (lang === 'en' ? 'Choose your user role and fill out the registration form below' : 'اپنا رول منتخب کریں اور اکاؤنٹ کی رجسٹریشن مکمل کریں')}
          </p>

          {/* Social Login Buttons (Google & Facebook) */}
          <div className={styles.socialButtonsContainer}>
            <button
              type="button"
              className={styles.googleBtn}
              onClick={() => triggerSocialAuth('Google')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{lang === 'en' ? 'Continue with Google' : 'گوگل سے لاگ ان کریں'}</span>
            </button>

            <button
              type="button"
              className={styles.facebookBtn}
              onClick={() => triggerSocialAuth('Facebook')}
            >
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>{lang === 'en' ? 'Continue with Facebook' : 'فیس بک سے لاگ ان کریں'}</span>
            </button>
          </div>

          <div className={styles.divider}>
            <span>{lang === 'en' ? 'OR USE EMAIL / USERNAME' : 'یا ای میل کے ذریعے'}</span>
          </div>

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

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                🔐 {lang === 'en' ? 'Log In to SafarLoad →' : 'لاگ ان کریں →'}
              </button>

              {/* Quick Fill Test Accounts */}
              <div className={styles.presetBox}>
                <span className={styles.presetLabel}>⚡ Quick Test Fill By Role:</span>
                <div className={styles.presetChips}>
                  {validSystemUsers.map((user) => (
                    <button
                      key={user.role}
                      type="button"
                      className={`${styles.presetChip} ${user.role === 'admin' ? styles.adminChip : ''}`}
                      onClick={() => applyPresetAccount(user)}
                    >
                      {roleDetails[user.role].icon} {roleDetails[user.role].labelEn}
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
              <div className={styles.inputGroup}>
                <label>{lang === 'en' ? 'Full Name / Business Title' : 'مکمل نام / بزنس کا نام'}</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="input input-lg"
                  placeholder={selectedRole === 'shipper' || selectedRole === 'fleet' ? 'e.g. Al-Madina Transport Co.' : 'e.g. Muhammad Aslam'}
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
                  <label>{lang === 'en' ? 'Mobile Phone' : 'موبائل نمبر'}</label>
                  <input
                    type="tel"
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
                  <label>{lang === 'en' ? 'CNIC / NTN Number' : 'شناختی کارڈ / این ٹی این'}</label>
                  <input
                    type="text"
                    value={regCnic}
                    onChange={(e) => setRegCnic(e.target.value)}
                    className="input input-lg"
                    placeholder="35202-1234567-1"
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

      {/* REALISTIC 2-STEP SOCIAL AUTHENTICATION MODAL (GOOGLE & FACEBOOK OAUTH) */}
      {socialModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.oauthModalCard} ${socialProvider === 'Facebook' ? styles.fbOAuthTheme : ''}`}>
            {/* Modal Top Bar */}
            <div className={styles.oauthHeader}>
              <div className={styles.oauthBrand}>
                {socialProvider === 'Google' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                <span>Sign in with <strong>{socialProvider}</strong></span>
              </div>
              <button className={styles.closeBtn} onClick={() => setSocialModalOpen(false)}>✕</button>
            </div>

            {/* STEP 1: CHOOSE SOCIAL ACCOUNT CREDENTIAL */}
            {socialStep === 1 && (
              <div className={styles.oauthBody}>
                <div className={styles.appPromptBox}>
                  <div className={styles.appLogoMini}>🚛 SafarLoad</div>
                  <p className={styles.oauthSubText}>
                    Select an account to authorize and sign in to <strong>SafarLoad Logistics Platform</strong>.
                  </p>
                </div>

                {isAuthenticating ? (
                  <div className={styles.loadingBox}>
                    <div className={styles.spinner}></div>
                    <p>Connecting to {socialProvider} Authentication Servers...</p>
                  </div>
                ) : (
                  <>
                    <div className={styles.socialAccountsList}>
                      <button
                        type="button"
                        className={styles.socialAccountItem}
                        onClick={() => selectSocialAccountCredential('Muhammad Aslam Khan', 'aslam.driver@gmail.com')}
                      >
                        <div className={styles.accountAvatar}>👨‍✈️</div>
                        <div className={styles.accountMeta}>
                          <strong>Muhammad Aslam Khan</strong>
                          <span>aslam.driver@gmail.com</span>
                        </div>
                        <span className={styles.verifiedBadge}>Verified</span>
                      </button>

                      <button
                        type="button"
                        className={styles.socialAccountItem}
                        onClick={() => selectSocialAccountCredential('Noor Textile Mills', 'dispatch@noortextile.com')}
                      >
                        <div className={styles.accountAvatar}>🏢</div>
                        <div className={styles.accountMeta}>
                          <strong>Noor Textile Mills Ltd</strong>
                          <span>dispatch@noortextile.com</span>
                        </div>
                        <span className={styles.verifiedBadge}>Verified</span>
                      </button>

                      <button
                        type="button"
                        className={styles.socialAccountItem}
                        onClick={() => selectSocialAccountCredential('Al-Farooq Fleet Logistics', 'fleet@alfarooq.pk')}
                      >
                        <div className={styles.accountAvatar}>🚚</div>
                        <div className={styles.accountMeta}>
                          <strong>Al-Farooq Fleet Logistics</strong>
                          <span>fleet@alfarooq.pk</span>
                        </div>
                        <span className={styles.verifiedBadge}>Verified</span>
                      </button>
                    </div>

                    {/* Custom Email Input */}
                    <form onSubmit={handleCustomSocialSubmit} className={styles.customEmailForm}>
                      <label>Or enter another {socialProvider} email address:</label>
                      <div className={styles.inputRow}>
                        <input
                          type="email"
                          value={customSocialInput}
                          onChange={(e) => setCustomSocialInput(e.target.value)}
                          placeholder="e.g. myname@domain.com"
                          className="input"
                        />
                        <button type="submit" className="btn btn-primary btn-sm">
                          Next →
                        </button>
                      </div>
                    </form>
                  </>
                )}

                <div className={styles.oauthFooterText}>
                  To continue, {socialProvider} will share your name, email address, language preference, and profile picture with SafarLoad. See SafarLoad’s <a href="#">Privacy Policy</a>.
                </div>
              </div>
            )}

            {/* STEP 2: SELECT SAFARLOAD ROLE PORTAL & COMPLETE AUTH HANDSHAKE */}
            {socialStep === 2 && (
              <div className={styles.oauthBody}>
                <div className={styles.authVerifiedBanner}>
                  <span className={styles.checkIcon}>✅</span>
                  <div>
                    <strong>{socialProvider} Authentication Verified!</strong>
                    <span>Signed in as <strong>{selectedSocialName}</strong> ({selectedSocialEmail})</span>
                  </div>
                </div>

                <h3 className={styles.step2Title}>Select SafarLoad Portal Role:</h3>
                <p className={styles.step2Sub}>Choose which platform role to bind with this {socialProvider} credential:</p>

                {isAuthenticating ? (
                  <div className={styles.loadingBox}>
                    <div className={styles.spinner}></div>
                    <p>Securing OAuth Session & Opening Dashboard...</p>
                  </div>
                ) : (
                  <div className={styles.socialRoleList}>
                    {(Object.keys(roleDetails) as UserRole[]).map((roleKey) => (
                      <button
                        key={roleKey}
                        type="button"
                        className={styles.socialRoleBtn}
                        onClick={() => completeSocialAuthWithRole(roleKey)}
                      >
                        <span className={styles.roleIconLarge}>{roleDetails[roleKey].icon}</span>
                        <div className={styles.roleInfoBlock}>
                          <strong>{roleDetails[roleKey].labelEn}</strong>
                          <span className={styles.socialRoleDesc}>{roleDetails[roleKey].desc}</span>
                        </div>
                        <span className={styles.arrowIcon}>Log In →</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
