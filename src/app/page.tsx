'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { translations, getTranslation, isRTL, Language } from '@/lib/translations';
import { popularRoutes } from '@/lib/mockData';

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en');
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'drivers' | 'companies' | 'shippers'>('drivers');

  const dir = isRTL(lang) ? 'rtl' : 'ltr';
  const t = (key: keyof typeof translations.en) => getTranslation(lang, key);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ur' : 'en');
  };

  return (
    <div className={styles.container} dir={dir}>
      {/* Navigation */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <Link href="/" className={styles.logo}>
          🚛 Safar<span>Load</span>
          {lang === 'ur' && ' | سفر لوڈ'}
        </Link>
        
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>{t('features')}</a>
          <a href="#for-drivers" className={styles.navLink}>{t('forDrivers')}</a>
          <a href="#for-companies" className={styles.navLink}>{t('forCompanies')}</a>
        </div>

        <div className={styles.navActions}>
          <button className={styles.langToggle} onClick={toggleLanguage}>
            🌐 {lang === 'en' ? 'اردو' : 'EN'}
          </button>
          <Link href="/login" className={styles.loginBtn}>
            {t('login')}
          </Link>
          <Link href="/login" className={styles.primaryBtn}>
            {t('getStarted')}
          </Link>
          <Link href="/admin" className={styles.loginBtn} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444' }}>
            👑 Super Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.particles}></div>
        <div className={`${styles.floatingTruck} ${styles.truck1}`}>🚛</div>
        <div className={`${styles.floatingTruck} ${styles.truck2}`}>🚚</div>
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {lang === 'en' ? (
              <>The Future of <span>Trucking</span> in Pakistan</>
            ) : (
              <>پاکستان میں <span>ٹرکنگ</span> کا مستقبل</>
            )}
          </h1>
          <p className={styles.heroSubtitle}>
            {lang === 'en' 
              ? 'Connect with thousands of loads and trucks across Pakistan. No more brokers, no more waiting at Addas.' 
              : t('heroSubtitle')}
          </p>
          
          <div className={styles.heroCtas}>
            <Link href="/login?role=driver" className={styles.primaryBtn}>
              🚛 {lang === 'en' ? 'Driver Registration' : 'ڈرائیور رجسٹریشن'}
            </Link>
            <Link href="/login?role=shipper" className={styles.glassOutlineBtn}>
              🏢 {lang === 'en' ? 'Shipper & Company Portal' : 'شپر پورٹل'}
            </Link>
          </div>

          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>52k+</span>
              <span className={styles.statLabel}>{t('registeredDrivers')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>1.8L+</span>
              <span className={styles.statLabel}>{t('loadsPosted')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>450+</span>
              <span className={styles.statLabel}>{t('citiesCovered')}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>Rs 15B+</span>
              <span className={styles.statLabel}>{t('totalPayouts')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.truckArtLine}></div>

      {/* Problem / Solution Section */}
      <section className={styles.section} id="problem-solution">
        <h2 className={styles.sectionTitle}>
          {lang === 'en' ? 'Say Goodbye to the Old Way' : 'پرانے طریقوں کو خیرباد کہیں'}
        </h2>
        
        <div className={styles.comparisonGrid}>
          <div className={styles.problemCard}>
            <h3 className={styles.comparisonTitle}>
              <span className={styles.problemIcon}>❌</span> 
              {lang === 'en' ? 'Traditional Adda System' : 'روایتی اڈہ سسٹم'}
            </h3>
            <ul className={styles.comparisonList}>
              <li><span className={styles.problemIcon}>❌</span> {lang === 'en' ? 'Hidden broker commissions (15-25%)' : 'پوشیدہ بروکر کمیشن (15-25%)'}</li>
              <li><span className={styles.problemIcon}>❌</span> {lang === 'en' ? 'Physical presence at Adda required' : 'اڈے پر جسمانی موجودگی ضروری'}</li>
              <li><span className={styles.problemIcon}>❌</span> {lang === 'en' ? 'No tracking or visibility' : 'کوئی ٹریکنگ یا مرئیت نہیں'}</li>
              <li><span className={styles.problemIcon}>❌</span> {lang === 'en' ? 'Cash-only delayed payments' : 'صرف کیش اور تاخیر سے ادائیگی'}</li>
            </ul>
          </div>

          <div className={styles.solutionCard}>
            <h3 className={styles.comparisonTitle}>
              <span className={styles.solutionIcon}>✅</span> 
              {lang === 'en' ? 'SafarLoad Digital Network' : 'سفر لوڈ ڈیجیٹل نیٹ ورک'}
            </h3>
            <ul className={styles.comparisonList}>
              <li><span className={styles.solutionIcon}>✅</span> {lang === 'en' ? 'Transparent 3-5% commission' : 'شفاف 3-5% کمیشن'}</li>
              <li><span className={styles.solutionIcon}>✅</span> {lang === 'en' ? 'Find loads from your phone anywhere' : 'کہیں بھی فون سے لوڈ تلاش کریں'}</li>
              <li><span className={styles.solutionIcon}>✅</span> {lang === 'en' ? 'Real-time GPS tracking & status' : 'ریئل ٹائم GPS ٹریکنگ'}</li>
              <li><span className={styles.solutionIcon}>✅</span> {lang === 'en' ? 'JazzCash & Easypaisa instant payout' : 'جاز کیش اور ایزی پیسہ سے فوری ادائیگی'}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.section} id="features">
        <div className={styles.sectionHeader}>
          <h2>{t('features')}</h2>
          <p>{lang === 'en' ? 'Everything you need to manage logistics seamlessly' : 'لاجسٹکس کو آسانی سے منظم کرنے کے لیے سب کچھ'}</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📋</div>
            <h3>{t('featureLoadBoard')}</h3>
            <p>{t('featureLoadBoardDesc')}</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📍</div>
            <h3>{t('featureTracking')}</h3>
            <p>{t('featureTrackingDesc')}</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>💰</div>
            <h3>{t('featurePayments')}</h3>
            <p>{t('featurePaymentsDesc')}</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🗣️</div>
            <h3>{t('featureVoice')}</h3>
            <p>{t('featureVoiceDesc')}</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚛</div>
            <h3>{t('featureFleet')}</h3>
            <p>{t('featureFleetDesc')}</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⭐</div>
            <h3>{t('featureRatings')}</h3>
            <p>{t('featureRatingsDesc')}</p>
          </div>
        </div>
      </section>

      {/* Target Audiences Section */}
      <section className={styles.section} id="for-drivers">
        <div className={styles.tabsHeader}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'drivers' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            🚛 {t('forDrivers')}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'companies' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('companies')}
          >
            🏢 {t('forCompanies')}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'shippers' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('shippers')}
          >
            📦 {t('forShippers')}
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'drivers' && (
            <div className={styles.audienceCard}>
              <div className={styles.audienceInfo}>
                <h3>{t('forDrivers')}</h3>
                <p>{t('driversDesc')}</p>
                <ul className={styles.audienceList}>
                  <li>✅ {lang === 'en' ? 'Find loads instantly based on your location' : 'اپنے مقام کی بنیاد پر فوری لوڈ حاصل کریں'}</li>
                  <li>✅ {lang === 'en' ? 'No reading needed — full Urdu voice commands' : 'اردو وائس کمانڈز — پڑھنے کی ضرورت نہیں'}</li>
                  <li>✅ {lang === 'en' ? 'Direct withdrawal to JazzCash & Easypaisa' : 'جاز کیش اور ایزی پیسہ میں مستقیم منتقلی'}</li>
                </ul>
                <Link href="/login?role=driver" className={styles.primaryBtn} style={{ width: 'fit-content', marginTop: '1rem' }}>
                  {t('getStarted')}
                </Link>
              </div>
              <div className={styles.audienceVisual}>
                <div className={styles.mockPhone}>
                  <div className={styles.phoneScreen}>
                    <div className={styles.mockCard}>
                      <span>📍 Multan → Karachi</span>
                      <strong>Rs 185,000</strong>
                      <span className="badge badge-success">Book Now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className={styles.audienceCard}>
              <div className={styles.audienceInfo}>
                <h3>{t('forCompanies')}</h3>
                <p>{t('companiesDesc')}</p>
                <ul className={styles.audienceList}>
                  <li>✅ {lang === 'en' ? 'Complete Fleet Management & Tracking' : 'مکمل فلیٹ مینجمنٹ اور ٹریکنگ'}</li>
                  <li>✅ {lang === 'en' ? 'Visual drag-and-drop dispatch board' : 'ڈسپیچ بورڈ'}</li>
                  <li>✅ {lang === 'en' ? 'Fuel monitoring & maintenance alerts' : 'مرمت کی اطلاع'}</li>
                </ul>
                <Link href="/login?role=fleet" className={styles.primaryBtn} style={{ width: 'fit-content', marginTop: '1rem' }}>
                  {t('getStarted')}
                </Link>
              </div>
              <div className={styles.audienceVisual}>
                <div className={styles.mockDashboard}>
                  <div>🚛 Fleet Active: 6 Trucks</div>
                  <div>🛣️ Total Distance: 125,430 km</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shippers' && (
            <div className={styles.audienceCard}>
              <div className={styles.audienceInfo}>
                <h3>{t('forShippers')}</h3>
                <p>{t('shippersDesc')}</p>
                <ul className={styles.audienceList}>
                  <li>✅ {lang === 'en' ? 'Post single or bulk cargo loads in seconds' : 'سیکنڈوں میں کارگو لوڈ پوسٹ کریں'}</li>
                  <li>✅ {lang === 'en' ? 'Escrow protected payment releases' : 'ایسکرو محفوظ ادائیگیاں'}</li>
                  <li>✅ {lang === 'en' ? 'Real-time GPS tracking & digital Bilty' : 'ریئل ٹائم ٹریکنگ اور ڈیجیٹل بلٹی'}</li>
                </ul>
                <Link href="/dashboard/post-load" className={styles.primaryBtn} style={{ width: 'fit-content', marginTop: '1rem' }}>
                  🏢 Post Cargo Load
                </Link>
              </div>
              <div className={styles.audienceVisual}>
                <div className={styles.mockDashboard}>
                  <div>📦 Cargo: 25 Tons Textile</div>
                  <div>📍 Multan → Karachi</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Popular Routes */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>{lang === 'en' ? 'Popular Logistics Routes' : 'مقبول ترین لاجسٹکس روٹس'}</h2>
          <p>{lang === 'en' ? 'Top freight lanes across Pakistan' : 'پاکستان بھر میں اعلیٰ فریٹ راستے'}</p>
        </div>

        <div className={styles.routesGrid}>
          {popularRoutes.map((route, index) => (
            <div key={index} className={styles.routeCard}>
              <div className={styles.routeHeader}>
                <span>{lang === 'en' ? route.from : route.fromUr}</span>
                <span className={styles.routeArrow}>➡️</span>
                <span>{lang === 'en' ? route.to : route.toUr}</span>
              </div>
              <div className={styles.routeDetails}>
                <div>
                  <span className={styles.routeLabel}>{t('distance')}:</span>
                  <strong>{route.distance} {t('km')}</strong>
                </div>
                <div>
                  <span className={styles.routeLabel}>Avg Price:</span>
                  <strong className={styles.priceTag}>Rs {route.avgPrice.toLocaleString()}</strong>
                </div>
              </div>
              <div className={styles.routeFooter}>
                <span className={styles.loadsCount}>🔥 {route.loads} Active Loads</span>
                <Link href="/dashboard/loads" className={styles.routeLink}>
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2>{lang === 'en' ? 'Start Earning More Today' : 'آج ہی زیادہ کمانا شروع کریں'}</h2>
          <p>{lang === 'en' ? 'Join Pakistan\'s largest digital freight network' : 'پاکستان کے سب سے بڑے ڈیجیٹل فریٹ نیٹ ورک میں شامل ہوں'}</p>
          <div className={styles.ctaForm}>
            <input 
              type="tel" 
              placeholder={lang === 'en' ? 'Enter phone number (+92...)' : 'فون نمبر درج کریں (+92...)'} 
              className={styles.ctaInput}
            />
            <Link href="/login" className={styles.ctaBtn}>
              {t('getStarted')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>🚛 Safar<span>Load</span></div>
            <p>{t('tagline')}</p>
            <p className={styles.copyright}>{t('madeInPakistan')}</p>
          </div>
          
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <h4>Company</h4>
              <a href="#">{t('aboutUs')}</a>
              <a href="#">{t('contactUs')}</a>
              <Link href="/admin">Super Admin</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>Support</h4>
              <a href="#">{t('helpCenter')}</a>
              <a href="#">{t('privacyPolicy')}</a>
              <a href="#">{t('termsOfService')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
