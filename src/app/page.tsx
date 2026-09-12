'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { translations, getTranslation, isRTL, Language } from '@/lib/translations';
import { popularRoutes } from '@/lib/mockData';

import Cinematic3DBackground from '@/components/Cinematic3DBackground';

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
        <Link href="/" className={styles.logo} aria-label="SafarLoad Home">
          🚛 Safar<span>Load</span>
          {lang === 'ur' && ' | سفر لوڈ'}
        </Link>
        
        <div className={styles.navLinks}>
          <a href="#features" className={styles.navLink}>{t('features')}</a>
          <a href="#for-drivers" className={styles.navLink}>{t('forDrivers')}</a>
          <a href="#for-companies" className={styles.navLink}>{t('forCompanies')}</a>
        </div>

        <div className={styles.navActions}>
          <button className={styles.langToggle} onClick={toggleLanguage} aria-label="Toggle language">
            🌐 {lang === 'en' ? 'اردو' : 'EN'}
          </button>
          <Link href="/dashboard" className={styles.loginBtn}>
            {lang === 'en' ? 'Open App' : 'ایپ کھولیں'}
          </Link>
          <Link href="/dashboard" className={styles.primaryBtn} aria-label="Get Started — It's Free">
            {t('getStarted')}
          </Link>
        </div>
      </nav>

      {/* Hero Section with Cinematic 3D Moving Containers & Connected Laser Mesh */}
      <section className={styles.hero}>
        <Cinematic3DBackground />
        
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {lang === 'en' ? (
              <>The Future of <span>Trucking</span> in Pakistan</>
            ) : (
              <>پاکستان میں <span>ٹرکنگ</span> کا مستقل</>
            )}
          </h1>
          <p className={styles.heroSubtitle}>
            {lang === 'en' 
              ? 'Connect with thousands of loads and trucks across Pakistan. Direct access for drivers, shippers, and fleet operators.' 
              : t('heroSubtitle')}
          </p>
          
          <div className={styles.heroCtas}>
            <Link href="/dashboard/loads" className={styles.primaryBtn} aria-label="Find and Browse Loads">
              🚛 {lang === 'en' ? 'Find & Browse Loads' : 'لوڈز کا جائزہ لیں'}
            </Link>
            <Link href="/dashboard/post-load" className={styles.glassOutlineBtn} aria-label="Post Cargo Load">
              🏢 {lang === 'en' ? 'Post Cargo Load' : 'کارگو پوسٹ کریں'}
            </Link>
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
        <h2 className={styles.sectionTitle}>
          {lang === 'en' ? 'Built for Everyone in Pakistani Logistics' : 'پاکستان کی ٹرانسپورٹ کے لیے'}
        </h2>

        <div className={styles.tabsHeader}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'drivers' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('drivers')}
            aria-label="View Solutions for Drivers"
          >
            🚛 {t('forDrivers')}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'companies' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('companies')}
            aria-label="View Solutions for Companies"
          >
            🏢 {t('forCompanies')}
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'shippers' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('shippers')}
            aria-label="View Solutions for Shippers"
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
                <Link href="/login?role=driver" className={styles.primaryBtn} style={{ width: 'fit-content', marginTop: '1rem' }} aria-label="Get Started as Driver">
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
                <Link href="/login?role=fleet" className={styles.primaryBtn} style={{ width: 'fit-content', marginTop: '1rem' }} aria-label="Get Started as Fleet Company">
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
                <Link href="/dashboard/post-load" className={styles.primaryBtn} style={{ width: 'fit-content', marginTop: '1rem' }} aria-label="Post Cargo Load">
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
                <Link href="/dashboard/loads" className={styles.routeLink} aria-label={`View loads for ${route.from} to ${route.to}`}>
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
              id="ctaPhoneNumberInput"
              type="tel" 
              aria-label={lang === 'en' ? 'Enter phone number (+92...)' : 'فون نمبر درج کریں (+92...)'}
              placeholder={lang === 'en' ? 'Enter phone number (+92...)' : 'فون نمبر درج کریں (+92...)'} 
              className={styles.ctaInput}
            />
            <Link href="/login" className={styles.ctaBtn} aria-label="Get Started Now">
              {t('getStarted')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.truckArtLine}></div>
        <div className={styles.footerContainer}>
          <div className={styles.footerGrid}>
            {/* Brand & Contact Column */}
            <div className={styles.footerBrandCol}>
              <div className={styles.logo}>🚛 Safar<span>Load</span></div>
              <p className={styles.footerTagline}>
                {lang === 'en'
                  ? 'Pakistan\'s #1 Truck Dispatching & Digital Freight Platform. Connecting drivers, fleet owners, and enterprise shippers.'
                  : 'پاکستان کا سب سے بڑا ڈیجیٹل فریٹ اور ٹرک ڈسپیچنگ نیٹ ورک۔'}
              </p>
              <div className={styles.footerContactList}>
                <div>📞 <strong>{lang === 'en' ? 'Helpline:' : 'ہیلپ لائن:'}</strong> +92 42 111 SAFAR (72327)</div>
                <div>✉️ <strong>{lang === 'en' ? 'Email:' : 'ای میل:'}</strong> support@safarload.pk</div>
                <div>📍 <strong>{lang === 'en' ? 'Location:' : 'مقام:'}</strong> Gulberg III, Lahore, Pakistan</div>
              </div>
            </div>

            {/* Quick Portals Column */}
            <div className={styles.footerCol}>
              <h3>{lang === 'en' ? 'Portals & Solutions' : 'پورٹلز اور سہولیات'}</h3>
              <Link href="/login?role=driver">👨‍✈️ {lang === 'en' ? 'Driver Load Board' : 'ڈرائیور پورٹل'}</Link>
              <Link href="/login?role=shipper">🏢 {lang === 'en' ? 'Shipper Escrow Hub' : 'کارگو شیپنگ پورٹل'}</Link>
              <Link href="/login?role=fleet">🚚 {lang === 'en' ? 'Fleet Operator Hub' : 'فلیٹ کمانڈ سینٹر'}</Link>
              <Link href="/login?role=support">🎧 {lang === 'en' ? 'KYC Support Desk' : 'ڈاکومنٹ ڈیسک'}</Link>
              <Link href="/login?role=finance">💵 {lang === 'en' ? 'Revenue & Settlements' : 'مالیاتی پورٹل'}</Link>
            </div>

            {/* Top Freight Lanes Column */}
            <div className={styles.footerCol}>
              <h3>{lang === 'en' ? 'Top Freight Routes' : 'مشہور فریٹ روٹس'}</h3>
              <Link href="/dashboard/loads">📍 Lahore → Karachi</Link>
              <Link href="/dashboard/loads">📍 Multan → Faisalabad</Link>
              <Link href="/dashboard/loads">📍 Peshawar → Rawalpindi</Link>
              <Link href="/dashboard/loads">📍 Quetta → Sukkur</Link>
              <Link href="/dashboard/loads">📍 Gwadar → Islamabad</Link>
            </div>

            {/* Company & Support Column */}
            <div className={styles.footerCol}>
              <h3>{lang === 'en' ? 'Company & Legal' : 'کمپنی اور معلومات'}</h3>
              <a href="#">{t('aboutUs')}</a>
              <a href="#">{t('helpCenter')}</a>
              <a href="#">🛡️ {lang === 'en' ? 'Escrow Protection' : 'ایسکرو سیکیورٹی'}</a>
              <a href="#">{t('privacyPolicy')}</a>
              <a href="#">{t('termsOfService')}</a>
            </div>
          </div>

          <div className={styles.footerBottomBar}>
            <div className={styles.copyrightText}>
              © 2026 SafarLoad Technologies (Pvt) Ltd. {t('madeInPakistan')}
            </div>
            <div className={styles.footerSocials}>
              <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" title="WhatsApp Support">💬 WhatsApp</a>
              <a href="#" title="Facebook">📘 Facebook</a>
              <a href="#" title="LinkedIn">💼 LinkedIn</a>
              <a href="#" title="YouTube">📺 YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
