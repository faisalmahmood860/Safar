'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { pakistaniCities } from '@/lib/mockData';

const mockLoads = [
  { id: 1, routeEn: 'Multan → Karachi', routeUr: 'ملتان ← کراچی', type: 'Cotton Bales', typeIcon: '🧵', status: 'in_transit', statusEn: 'In Transit', statusUr: 'راستے میں', price: 'Rs. 185,000', progress: 65 },
  { id: 2, routeEn: 'DG Khan → Lahore', routeUr: 'ڈی جی خان ← لاہور', type: 'Cement Bags', typeIcon: '🧱', status: 'picked_up', statusEn: 'Picked Up', statusUr: 'اٹھا لیا گیا', price: 'Rs. 95,000', progress: 20 },
  { id: 3, routeEn: 'Larkana → Karachi', routeUr: 'لاڑکانہ ← کراچی', type: 'Rice Bags', typeIcon: '🌾', status: 'assigned', statusEn: 'Assigned', statusUr: 'مختص شدہ', price: 'Rs. 145,000', progress: 0 }
];

const mockMessages = [
  { id: 1, senderEn: 'Noor Textile Dispatch', senderUr: 'نور ٹیکسٹائل ڈسپیچ', avatar: 'NT', previewEn: 'When will you reach Karachi port?', previewUr: 'آپ کراچی پورٹ کب پہنچیں گے؟', time: '10:30 AM', unread: 2 },
  { id: 2, senderEn: 'SafarLoad Support Desk', senderUr: 'سفرلوڈ سپورٹ ڈیسک', avatar: 'SD', previewEn: 'CNIC and Truck docs verified cleanly.', previewUr: 'شناختی کارڈ اور ٹرک کی تصدیق مکمل ہو گئی ہے۔', time: '09:15 AM', unread: 1 },
  { id: 3, senderEn: 'JazzCash Clearing', senderUr: 'جاز کیش کلئیرنگ', avatar: 'JC', previewEn: 'Rs. 185,000 held in Escrow ready for POD.', previewUr: 'رقم ایسکرو میں محفوظ ہے۔', time: 'Yesterday', unread: 0 }
];

const dashboardStats = {
  activeLoads: 3,
  completed: 456,
  distance: '125,430',
  rating: 4.8
};

const weeklyEarnings = [
  { dayEn: 'Mon', dayUr: 'پیر', amount: 35000, height: '55%' },
  { dayEn: 'Tue', dayUr: 'منگل', amount: 42000, height: '65%' },
  { dayEn: 'Wed', dayUr: 'بدھ', amount: 28000, height: '40%' },
  { dayEn: 'Thu', dayUr: 'جمعرات', amount: 55000, height: '85%' },
  { dayEn: 'Fri', dayUr: 'جمعہ', amount: 48000, height: '75%' },
  { dayEn: 'Sat', dayUr: 'ہفتہ', amount: 62000, height: '95%' },
  { dayEn: 'Sun', dayUr: 'اتوار', amount: 38000, height: '60%' },
];

export default function DashboardPage() {
  const [lang, setLang] = useState('en');
  const [mounted, setMounted] = useState(false);
  const [showPostTripModal, setShowPostTripModal] = useState(false);
  
  // Trip Availability Form State
  const [fromCity, setFromCity] = useState('Lahore');
  const [toCity, setToCity] = useState('Multan');
  const [capacityTons, setCapacityTons] = useState('25');
  const [availableDate, setAvailableDate] = useState('2026-08-20');

  useEffect(() => {
    setMounted(true);
    const isRtl = document.documentElement.dir === 'rtl';
    setLang(isRtl ? 'ur' : 'en');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'dir') {
          setLang(document.documentElement.dir === 'rtl' ? 'ur' : 'en');
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handlePostTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`🚛 Trip Availability Posted!\nRoute: ${fromCity} → ${toCity}\nCapacity: ${capacityTons} Tons\nDate: ${availableDate}\nShippers on this route have been notified!`);
    setShowPostTripModal(false);
  };

  if (!mounted) return null;

  return (
    <div className={styles.dashboardContainer}>
      {/* Welcome Banner */}
      <div className={`${styles.welcomeBanner} ${styles.stagger1}`}>
        <div className={styles.bannerContent}>
          <h1 className={styles.welcomeTitle}>
            {lang === 'en' ? 'Welcome back, Muhammad Aslam! 👋' : 'خوش آمدید، محمد اسلم! 👋'}
          </h1>
          <p className={styles.dateText}>
            {lang === 'en' 
              ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              : new Date().toLocaleDateString('ur-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className={styles.bannerActions}>
            <Link href="/dashboard/loads" className="btn btn-primary">
              📋 {lang === 'en' ? 'Find Load' : 'لوڈ تلاش کریں'}
            </Link>
            <button onClick={() => setShowPostTripModal(true)} className="btn btn-secondary">
              🚛 {lang === 'en' ? 'Post Return Trip' : 'سفر پوسٹ کریں'}
            </button>
            <Link href="/dashboard/wallet" className="btn btn-glass">
              💰 {lang === 'en' ? 'View Wallet' : 'بٹوہ دیکھیں'}
            </Link>
          </div>
        </div>
        <div className={styles.bannerDecorations}>
          <div className={styles.decorationCircle1}></div>
          <div className={styles.decorationCircle2}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`${styles.statsGrid} ${styles.stagger2}`}>
        <div className={`${styles.statCard} ${styles.borderPrimary}`}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>{lang === 'en' ? 'Active Loads' : 'فعال لوڈز'}</span>
            <span className={`${styles.statIcon} ${styles.pulseAnim}`}>📦</span>
          </div>
          <div className={styles.statValue}>{dashboardStats.activeLoads}</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>↑ 1</span> {lang === 'en' ? 'vs last week' : 'پچھلے ہفتے کی نسبت'}
          </div>
        </div>
        
        <div className={`${styles.statCard} ${styles.borderSuccess}`}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>{lang === 'en' ? 'Completed' : 'مکمل شدہ'}</span>
            <span className={styles.statIcon}>✅</span>
          </div>
          <div className={styles.statValue}>{dashboardStats.completed}</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>↑ 12%</span> {lang === 'en' ? 'this month' : 'اس مہینے'}
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.borderInfo}`}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>{lang === 'en' ? 'Total Distance' : 'کل فاصلہ'}</span>
            <span className={styles.statIcon}>🛣️</span>
          </div>
          <div className={styles.statValue}>{dashboardStats.distance} <span className={styles.unit}>km</span></div>
          <div className={styles.statFooter}>
            <span className={styles.trendNeutral}>~</span> {lang === 'en' ? 'steady average' : 'مستقل اوسط'}
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.borderSecondary}`}>
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>{lang === 'en' ? 'Rating' : 'ریٹنگ'}</span>
            <span className={styles.statIcon}>⭐</span>
          </div>
          <div className={styles.statValue}>{dashboardStats.rating}<span className={styles.unit}>/5.0</span></div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>↑ 0.2</span> {lang === 'en' ? 'from last trip' : 'پچھلے سفر سے'}
          </div>
        </div>
      </div>

      <div className={styles.middleSection}>
        {/* Revenue Chart */}
        <div className={`${styles.chartSection} ${styles.stagger3}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{lang === 'en' ? 'Earnings Overview' : 'کمائی کا جائزہ'}</h2>
            <div className={styles.chartLegend}>
              <span className={styles.totalWeek}>Rs. 308,000</span>
              <span className={styles.trendBadge}>+15% {lang === 'en' ? 'vs last week' : 'پچھلے ہفتے سے'}</span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {weeklyEarnings.map((day, idx) => (
              <div key={idx} className={styles.barWrapper}>
                <div className={styles.barValueTooltip}>Rs. {day.amount.toLocaleString()}</div>
                <div className={styles.barTrack}>
                  <div className={styles.barFill} style={{ height: day.height }}></div>
                </div>
                <div className={styles.barLabel}>{lang === 'en' ? day.dayEn : day.dayUr}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className={`${styles.quickActionsSection} ${styles.stagger4}`}>
          <h2 className={styles.sectionTitle}>{lang === 'en' ? 'Quick Actions' : 'فوری اقدامات'}</h2>
          <div className={styles.actionGrid}>
            <Link href="/dashboard/loads" className={styles.actionCard}>
              <div className={styles.actionIcon}>🔍</div>
              <div className={styles.actionLabel}>{lang === 'en' ? 'Find Load' : 'لوڈ تلاش کریں'}</div>
            </Link>
            <Link href="/dashboard/tracking" className={styles.actionCard}>
              <div className={styles.actionIcon}>📍</div>
              <div className={styles.actionLabel}>{lang === 'en' ? 'Track Trip' : 'سفر ٹریک کریں'}</div>
            </Link>
            <Link href="/dashboard/wallet" className={styles.actionCard}>
              <div className={styles.actionIcon}>💰</div>
              <div className={styles.actionLabel}>{lang === 'en' ? 'My Wallet' : 'میرا بٹوہ'}</div>
            </Link>
            <button onClick={() => alert('🆘 Emergency SOS Triggered! SafarLoad Helpline & Highway Police Notified.')} className={styles.actionCard} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444' }}>
              <div className={styles.actionIcon}>🆘</div>
              <div className={styles.actionLabel} style={{ color: '#EF4444' }}>{lang === 'en' ? 'Emergency SOS' : 'ہنگامی مدد'}</div>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        {/* Active Loads Section */}
        <div className={`${styles.activeLoadsSection} ${styles.stagger5}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{lang === 'en' ? 'Active Shipments' : 'فعال شپمنٹس'}</h2>
            <Link href="/dashboard/trips" className={styles.viewAllLink}>{lang === 'en' ? 'View All Trips →' : 'تمام سفر دیکھیں ←'}</Link>
          </div>

          <div className={styles.loadsList}>
            {mockLoads.map((load) => (
              <div key={load.id} className={styles.loadItemCard}>
                <div className={styles.loadItemHeader}>
                  <div className={styles.routeText}>
                    <span>{load.typeIcon}</span>
                    <span>{lang === 'en' ? load.routeEn : load.routeUr}</span>
                  </div>
                  <span className={styles.priceTag}>{load.price}</span>
                </div>
                <div className={styles.progressSection}>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{ width: `${load.progress}%` }}></div>
                  </div>
                  <div className={styles.progressText}>
                    <span>{lang === 'en' ? load.type : load.type}</span>
                    <span>{load.progress}%</span>
                  </div>
                </div>
                <div className={styles.loadActions}>
                  <Link href="/dashboard/tracking" className="btn btn-glass btn-sm">
                    📍 {lang === 'en' ? 'Live Track' : 'لائیو ٹریک'}
                  </Link>
                  <Link href="/dashboard/trips" className="btn btn-primary btn-sm">
                    🚛 {lang === 'en' ? 'Trip Details' : 'تفصیلات'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Widget */}
        <div className={`${styles.messagesSection} ${styles.stagger6}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{lang === 'en' ? 'Recent Messages' : 'حالیہ پیغامات'}</h2>
            <span className={styles.unreadCount}>3 unread</span>
          </div>

          <div className={styles.messagesList}>
            {mockMessages.map((msg) => (
              <div key={msg.id} className={styles.messageItem}>
                <div className={styles.msgAvatar}>{msg.avatar}</div>
                <div className={styles.msgContent}>
                  <div className={styles.msgHeader}>
                    <span className={styles.msgSender}>{lang === 'en' ? msg.senderEn : msg.senderUr}</span>
                    <span className={styles.msgTime}>{msg.time}</span>
                  </div>
                  <p className={styles.msgPreview}>{lang === 'en' ? msg.previewEn : msg.previewUr}</p>
                </div>
                {msg.unread > 0 && <span className={styles.msgBadge}>{msg.unread}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POST RETURN TRIP MODAL */}
      {showPostTripModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🚛 Post Return Trip Availability (خالی گاڑی رجسٹر کریں)</h3>
              <button onClick={() => setShowPostTripModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handlePostTripSubmit}>
              <div className={styles.inputGroup}>
                <label>Current Location / Departing City (کہاں سے)</label>
                <select value={fromCity} onChange={(e) => setFromCity(e.target.value)} className="input">
                  {pakistaniCities.map((c) => (
                    <option key={c.en} value={c.en}>
                      {c.en} ({c.ur}) — {c.province}
                    </option>
                  ))}
                  <option value="custom">➕ {lang === 'ur' ? 'نیا شہر درج کریں (دیگر)' : '+ Add Custom City...'}</option>
                </select>
                {fromCity === 'custom' && (
                  <input
                    type="text"
                    className="input"
                    placeholder={lang === 'ur' ? 'شہر کا نام ٹائپ کریں' : 'Type custom city name'}
                    onChange={(e) => setFromCity(e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Destination City (کہاں جانا ہے)</label>
                <select value={toCity} onChange={(e) => setToCity(e.target.value)} className="input">
                  <option value="Open for Any Route (تمام روٹس کے لیے کھلی گاڑی)">
                    🇵🇰 Open for Any Route in Pakistan (تمام روٹس کے لیے کھلی گاڑی)
                  </option>
                  {pakistaniCities.map((c) => (
                    <option key={c.en} value={c.en}>
                      {c.en} ({c.ur}) — {c.province}
                    </option>
                  ))}
                  <option value="custom">➕ {lang === 'ur' ? 'نیا شہر درج کریں (دیگر)' : '+ Add Custom City...'}</option>
                </select>
                {toCity === 'custom' && (
                  <input
                    type="text"
                    className="input"
                    placeholder={lang === 'ur' ? 'شہر کا نام ٹائپ کریں' : 'Type custom city name'}
                    onChange={(e) => setToCity(e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label>Available Capacity (Tons)</label>
                  <input
                    type="number"
                    value={capacityTons}
                    onChange={(e) => setCapacityTons(e.target.value)}
                    className="input"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Departure Date</label>
                  <input
                    type="date"
                    value={availableDate}
                    onChange={(e) => setAvailableDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowPostTripModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  🚀 Publish Trip Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
