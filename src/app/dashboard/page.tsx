'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import DriverAvailabilityWidget from '@/components/DriverAvailabilityWidget';
import { pakistaniCities } from '@/lib/mockData';
import { triggerDriverAvailableNotification } from '@/lib/notificationSystem';

const mockLoads = [
  {
    id: 'LD-2026-001',
    routeEn: 'Multan → Karachi',
    routeUr: 'ملتان سے کراچی',
    typeIcon: '📦',
    type: 'In Transit — M-5 Motorway',
    price: 'Rs 185,000',
    progress: 68,
    shipper: 'Noor Textile Mills',
    vehicle: 'LHR-5678 (Flatbed Trailer)',
    driver: 'Tariq Mehmood',
    driverPhone: '+92 301 2345678',
    status: 'In Transit',
  },
  {
    id: 'LD-2026-002',
    routeEn: 'Lahore → Islamabad',
    routeUr: 'لاہور سے اسلام آباد',
    typeIcon: '🚛',
    type: 'Loading at Factory Gate 3',
    price: 'Rs 65,000',
    progress: 20,
    shipper: 'Packages Limited',
    vehicle: 'KHI-1234 (22ft Container)',
    driver: 'Abdul Rasheed',
    driverPhone: '+92 333 9876543',
    status: 'At Pickup',
  },
  {
    id: 'LD-2026-003',
    routeEn: 'Faisalabad → Peshawar',
    routeUr: 'فیصل آباد سے پشاور',
    typeIcon: '🌾',
    type: 'Delivered — Unloading Complete',
    price: 'Rs 140,000',
    progress: 100,
    shipper: 'Sitara Chemical Industries',
    vehicle: 'FSD-9012 (Dumper Truck)',
    driver: 'Zahid Khan',
    driverPhone: '+92 304 9988776',
    status: 'Delivered',
  },
];

const mockMessages = [
  {
    id: 'MSG-101',
    avatar: '👨‍✈️',
    senderEn: 'Driver Tariq Mehmood',
    senderUr: 'ڈرائیور طارق محمود',
    time: '10:45 AM',
    previewEn: 'Vehicle LHR-5678 crossed Sukkur Toll Plaza. ETA Karachi 08:00 PM.',
    previewUr: 'گاڑی LHR-5678 سکھر ٹول پلازہ کراس کر چکی ہے۔',
    fullText: 'Assalam-o-Alaikum! Vehicle LHR-5678 is running smoothly on M-5 Motorway. Cargo tarpaulin and belts inspected. Fuel level normal.',
    phone: '+92 301 2345678',
  },
  {
    id: 'MSG-102',
    avatar: '🏢',
    senderEn: 'Noor Textile Dispatch Desk',
    senderUr: 'نور ٹیکسٹائل ڈسپیچ ڈیسک',
    time: '09:30 AM',
    previewEn: 'Bilty #BLT-2026-904 approved! Advance payment 30% credited to wallet.',
    previewUr: 'بلٹی منظور! 30 فیصد ایڈوانس والٹ میں منتقل کر دیا گیا۔',
    fullText: 'Your digital Bilty document has been verified by Noor Textile finance team. 30% advance freight (Rs. 55,500) has been released into your SafarLoad wallet.',
    phone: '+92 42 35789000',
  },
  {
    id: 'MSG-103',
    avatar: '🎧',
    senderEn: 'SafarLoad KYC Desk',
    senderUr: 'سفر لوڈ سپورٹ ڈیسک',
    time: 'Yesterday',
    previewEn: 'Driver CNIC and Route Fitness Certificate updated successfully.',
    previewUr: 'ڈرائیور کا شناختی کارڈ اور روٹ سرٹیفکیٹ منظور ہو گیا۔',
    fullText: 'Driver Tariq Mehmood CNIC verification renewal has been completed. Account status: 100% Active with Tier 1 Dispatch Rights.',
    phone: '+92 42 111 72327',
  },
];

const dashboardStats = {
  activeLoads: 3,
  completed: 48,
  distance: '12,450',
  rating: 4.9,
};

const weeklyEarnings = [
  { dayEn: 'Mon', dayUr: 'پیر', amount: 45000, height: '45%' },
  { dayEn: 'Tue', dayUr: 'منگل', amount: 65000, height: '65%' },
  { dayEn: 'Wed', dayUr: 'بدھ', amount: 50000, height: '50%' },
  { dayEn: 'Thu', dayUr: 'جمعرات', amount: 85000, height: '85%' },
  { dayEn: 'Fri', dayUr: 'جمعہ', amount: 30000, height: '30%' },
  { dayEn: 'Sat', dayUr: 'ہفتہ', amount: 95000, height: '95%' },
  { dayEn: 'Sun', dayUr: 'اتوار', amount: 70000, height: '70%' },
];

export default function DashboardPage() {
  const [lang, setLang] = useState('en');
  const [mounted, setMounted] = useState(false);
  const [showPostTripModal, setShowPostTripModal] = useState(false);

  // Informational & Breakdown Modals State
  const [statModal, setStatModal] = useState<'active' | 'completed' | 'distance' | 'rating' | null>(null);
  const [selectedLoadDetail, setSelectedLoadDetail] = useState<any | null>(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState<any | null>(null);
  const [showSosModal, setShowSosModal] = useState(false);
  
  // Trip Availability Form State
  const [fromCity, setFromCity] = useState('Lahore');
  const [toCity, setToCity] = useState('Multan');
  const [capacityTons, setCapacityTons] = useState('25');
  const [availableDate, setAvailableDate] = useState('2026-08-20');

  const [userName, setUserName] = useState('Driver');
  const [userRole, setUserRole] = useState<string>('driver');

  useEffect(() => {
    setMounted(true);
    const isRtl = document.documentElement.dir === 'rtl';
    setLang(isRtl ? 'ur' : 'en');

    const storedUser = localStorage.getItem('safarload_logged_user');
    const storedRole = localStorage.getItem('safarload_user_role');
    
    if (storedUser) {
      try {
        const p = JSON.parse(storedUser);
        if (p.name) setUserName(p.name);
        const activeRole = storedRole || p.role || 'driver';
        setUserRole(activeRole);

        // Strict User-Centric Role Routing
        if (activeRole === 'shipper') {
          window.location.href = '/dashboard/post-load';
          return;
        } else if (activeRole === 'fleet') {
          window.location.href = '/dashboard/fleet';
          return;
        } else if (activeRole === 'finance') {
          window.location.href = '/dashboard/finance';
          return;
        } else if (activeRole === 'support') {
          window.location.href = '/dashboard/support';
          return;
        }
      } catch (e) {}
    }
    
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
    triggerDriverAvailableNotification(userName, 'Flatbed Trailer (25 Tons)', `${fromCity} → ${toCity}`);
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
            {lang === 'en' ? `Welcome back, ${userName}! 👨‍✈️` : `خوش آمدید، ${userName}! 👨‍✈️`}
          </h1>
          <p className={styles.dateText}>
            {lang === 'en' 
              ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              : new Date().toLocaleDateString('ur-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className={styles.bannerActions}>
            <Link href="/dashboard/loads" className="btn btn-primary">
              📋 {lang === 'en' ? 'Find Cargo Loads' : 'لوڈ تلاش کریں'}
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('driverAvailabilitySection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn btn-secondary"
            >
              🟢 {lang === 'en' ? 'Broadcast Route Availability' : 'روٹ کی دستیابی درج کریں'}
            </button>
            <Link href="/dashboard/wallet" className="btn btn-glass">
              💰 {lang === 'en' ? 'Earnings & Wallet' : 'بٹوہ اور آمدنی'}
            </Link>
            <Link href="/dashboard/trips" className="btn btn-outline">
              🚛 {lang === 'en' ? 'My Active Trips' : 'میرے فعال سفر'}
            </Link>
          </div>
        </div>
        <div className={styles.bannerDecorations}>
          <div className={styles.decorationCircle1}></div>
          <div className={styles.decorationCircle2}></div>
        </div>
      </div>

      {/* Driver Availability & Target Route Broadcast Widget */}
      <div id="driverAvailabilitySection">
        <DriverAvailabilityWidget driverName={userName} />
      </div>

      {/* Motive-Grade Telematics & DRIVE Safety Scorecard Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid #10B981', borderRadius: '16px', padding: '1.25rem', margin: '1.25rem 0 1.5rem 0', boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🛡️</span>
              <h3 style={{ margin: 0, color: '#10B981', fontSize: '1.2rem', fontWeight: 800 }}>
                Motive-Grade Telematics & DRIVE Safety Score Suite <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 400 }}>/ موٹیو سیفٹی سسٹم</span>
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#CBD5E1' }}>
              Real-time ELD compliance logging, vehicle gateway telematics, driver ratings, and AI safety scorecard.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/dashboard/tracking" className="btn btn-primary btn-sm">
              📍 Live Telematics Radar
            </Link>
            <Link href="/dashboard/trips" className="btn btn-outline btn-sm">
              ⏱️ HOS ELD Logbook
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Motive DRIVE Score */}
          <div style={{ background: '#1E293B', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⭐ Motive DRIVE Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981', margin: '4px 0' }}>98 / 100</div>
            <div style={{ fontSize: '0.78rem', color: '#38BDF8' }}>Top 5% Network Driver • 0 Hard Brakes</div>
          </div>

          {/* Motive ELD HOS Logbook */}
          <div style={{ background: '#1E293B', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⏱️ HOS Duty Log (ELD)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#3B82F6', margin: '4px 0' }}>6h 45m</div>
            <div style={{ fontSize: '0.78rem', color: '#10B981' }}>11h Driving Limit • 0 HOS Violations</div>
          </div>

          {/* Motive Vehicle Telematics */}
          <div style={{ background: '#1E293B', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🩺 Gateway Telematics</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F59E0B', margin: '4px 0' }}>0 DTC Faults</div>
            <div style={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Fuel 85% • Batt 24.2V • 3.8 km/L</div>
          </div>

          {/* Shipper Driver Rating */}
          <div style={{ background: '#1E293B', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💬 Shipper Rating Score</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EC4899', margin: '4px 0' }}>4.9 ★</div>
            <div style={{ fontSize: '0.78rem', color: '#10B981' }}>100% Punctual Delivery Feedback</div>
          </div>
        </div>
      </div>

      {/* Stats Grid — Clickable Cards with Info Modals */}
      <div className={`${styles.statsGrid} ${styles.stagger2}`}>
        <div
          onClick={() => setStatModal('active')}
          className={`${styles.statCard} ${styles.borderPrimary}`}
          style={{ cursor: 'pointer' }}
          title="Click for Active Shipments Breakdown"
        >
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>{lang === 'en' ? 'Active Loads' : 'فعال لوڈز'}</span>
            <span className={`${styles.statIcon} ${styles.pulseAnim}`}>📦</span>
          </div>
          <div className={styles.statValue}>{dashboardStats.activeLoads}</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>↑ 1</span> {lang === 'en' ? 'vs last week (Click for Info)' : 'پچھلے ہفتے کی نسبت (تفصیل دیکھیں)'}
          </div>
        </div>
        
        <div
          onClick={() => setStatModal('completed')}
          className={`${styles.statCard} ${styles.borderSuccess}`}
          style={{ cursor: 'pointer' }}
          title="Click for Completed Trips History"
        >
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>{lang === 'en' ? 'Completed' : 'مکمل شدہ'}</span>
            <span className={styles.statIcon}>✅</span>
          </div>
          <div className={styles.statValue}>{dashboardStats.completed}</div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>↑ 12%</span> {lang === 'en' ? 'this month (Click for History)' : 'اس مہینے (تفصیل دیکھیں)'}
          </div>
        </div>

        <div
          onClick={() => setStatModal('distance')}
          className={`${styles.statCard} ${styles.borderInfo}`}
          style={{ cursor: 'pointer' }}
          title="Click for Total Distance Log"
        >
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>{lang === 'en' ? 'Total Distance' : 'کل فاصلہ'}</span>
            <span className={styles.statIcon}>🛣️</span>
          </div>
          <div className={styles.statValue}>{dashboardStats.distance} <span className={styles.unit}>km</span></div>
          <div className={styles.statFooter}>
            <span className={styles.trendNeutral}>~</span> {lang === 'en' ? 'steady average (Click for Log)' : 'مستقل اوسط (تفصیل دیکھیں)'}
          </div>
        </div>

        <div
          onClick={() => setStatModal('rating')}
          className={`${styles.statCard} ${styles.borderSecondary}`}
          style={{ cursor: 'pointer' }}
          title="Click for Driver Rating Reviews"
        >
          <div className={styles.statHeader}>
            <span className={styles.statTitle}>{lang === 'en' ? 'Rating' : 'ریٹنگ'}</span>
            <span className={styles.statIcon}>⭐</span>
          </div>
          <div className={styles.statValue}>{dashboardStats.rating}<span className={styles.unit}>/5.0</span></div>
          <div className={styles.statFooter}>
            <span className={styles.trendUp}>↑ 0.2</span> {lang === 'en' ? 'from last trip (Click for Reviews)' : 'پچھلے سفر سے (تفصیل دیکھیں)'}
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
            <button onClick={() => setShowSosModal(true)} className={styles.actionCard} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444' }}>
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
                    <span>{load.type}</span>
                    <span>{load.progress}%</span>
                  </div>
                </div>
                <div className={styles.loadActions}>
                  <Link href="/dashboard/tracking" className="btn btn-glass btn-sm">
                    📍 {lang === 'en' ? 'Live Track' : 'لائیو ٹریک'}
                  </Link>
                  <button onClick={() => setSelectedLoadDetail(load)} className="btn btn-primary btn-sm">
                    🚛 {lang === 'en' ? 'Trip Details' : 'تفصیلات'}
                  </button>
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
              <div key={msg.id} onClick={() => setSelectedMessageDetail(msg)} className={styles.messageItem} style={{ cursor: 'pointer' }} title="Click to Read & Reply">
                <div className={styles.msgAvatar}>{msg.avatar}</div>
                <div className={styles.msgContent}>
                  <div className={styles.msgHeader}>
                    <span className={styles.msgSender}>{lang === 'en' ? msg.senderEn : msg.senderUr}</span>
                    <span className={styles.msgTime}>{msg.time}</span>
                  </div>
                  <p className={styles.msgPreview}>{lang === 'en' ? msg.previewEn : msg.previewUr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI STATS BREAKDOWN MODAL */}
      {statModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>
                {statModal === 'active' && '📦 Active Shipments Overview'}
                {statModal === 'completed' && '✅ Completed Trips Log & Certificates'}
                {statModal === 'distance' && '🛣️ Distance Log & Fleet Odometers'}
                {statModal === 'rating' && '⭐ Driver Performance & Customer Reviews'}
              </h3>
              <button onClick={() => setStatModal(null)} className={styles.closeBtn}>✕</button>
            </div>

            <div style={{ padding: '1rem', lineHeight: 1.6 }}>
              {statModal === 'active' && (
                <div>
                  <p><strong>Total Active Shipments:</strong> 3 Shipments currently on route across Pakistan.</p>
                  <ul>
                    <li>📍 <strong>Multan → Karachi:</strong> 25 Tons Textile (68% Complete, M-5 Motorway)</li>
                    <li>📍 <strong>Lahore → Islamabad:</strong> 22ft Container (20% Complete, Factory Gate)</li>
                    <li>📍 <strong>Faisalabad → Peshawar:</strong> 30 Tons Chemicals (Unloading at Terminal)</li>
                  </ul>
                  <div style={{ marginTop: '1rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
                    ℹ️ Real-time GPS pings are updated every 15 seconds.
                  </div>
                </div>
              )}

              {statModal === 'completed' && (
                <div>
                  <p><strong>Total Completed Trips:</strong> 48 Successfully Delivered Freight Orders.</p>
                  <p><strong>On-Time Arrival Index:</strong> 98.6% | <strong>Zero Cargo Damage Claims!</strong></p>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#10B981' }}>
                    🏆 Verified Carrier Certificate issued by SafarLoad Dispatch Oversight.
                  </div>
                </div>
              )}

              {statModal === 'distance' && (
                <div>
                  <p><strong>Total Cumulative Distance Logged:</strong> 12,450 km across National Highways & Motorways.</p>
                  <p><strong>Top Active Route:</strong> Multan ↔ Karachi (M-5 Motorway — 945 km)</p>
                  <p><strong>Fuel Saved by AI Route Optimizer:</strong> ~340 Liters Diesel saved this month!</p>
                </div>
              )}

              {statModal === 'rating' && (
                <div>
                  <p><strong>Overall Platform Rating:</strong> ⭐ 4.9 / 5.0 (Based on 52 Shipper Reviews)</p>
                  <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                    💬 <em>"Excellent driver Tariq Mehmood! Cargo loaded on time in Multan and delivered safely to Karachi Port Qasim."</em> — Noor Textile Mills
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setStatModal(null)} className="btn btn-primary">
                Close Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE SHIPMENT DETAIL MODAL */}
      {selectedLoadDetail && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🚛 Shipment Details: {selectedLoadDetail.id}</h3>
              <button onClick={() => setSelectedLoadDetail(null)} className={styles.closeBtn}>✕</button>
            </div>

            <div style={{ padding: '1rem', lineHeight: 1.6 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38BDF8', marginBottom: '0.5rem' }}>
                {selectedLoadDetail.routeEn} ({selectedLoadDetail.routeUr})
              </div>
              <p><strong>Shipper Name:</strong> {selectedLoadDetail.shipper}</p>
              <p><strong>Assigned Truck:</strong> {selectedLoadDetail.vehicle}</p>
              <p><strong>Driver:</strong> {selectedLoadDetail.driver} ({selectedLoadDetail.driverPhone})</p>
              <p><strong>Total Agreed Freight:</strong> <strong style={{ color: '#10B981' }}>{selectedLoadDetail.price}</strong></p>
              <p><strong>Current Transit Status:</strong> {selectedLoadDetail.type} ({selectedLoadDetail.progress}%)</p>
            </div>

            <div className={styles.modalActions}>
              <Link href="/dashboard/tracking" className="btn btn-primary">
                📍 Open Live GPS Satellite Map
              </Link>
              <button onClick={() => setSelectedLoadDetail(null)} className="btn btn-glass">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE READER & REPLY MODAL */}
      {selectedMessageDetail && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>{selectedMessageDetail.avatar} {selectedMessageDetail.senderEn}</h3>
              <button onClick={() => setSelectedMessageDetail(null)} className={styles.closeBtn}>✕</button>
            </div>

            <div style={{ padding: '1rem', lineHeight: 1.6 }}>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.5rem' }}>Received: {selectedMessageDetail.time}</div>
              <p style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '1rem', borderRadius: '12px', color: '#F8FAFC' }}>
                {selectedMessageDetail.fullText}
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}><strong>Contact Phone:</strong> {selectedMessageDetail.phone}</p>
            </div>

            <div className={styles.modalActions}>
              <a href={`tel:${selectedMessageDetail.phone}`} className="btn btn-success">
                📞 Call {selectedMessageDetail.senderEn}
              </a>
              <button onClick={() => { alert(`💬 Reply sent to ${selectedMessageDetail.senderEn}!`); setSelectedMessageDetail(null); }} className="btn btn-primary">
                ✉️ Send Quick Reply
              </button>
              <button onClick={() => setSelectedMessageDetail(null)} className="btn btn-glass">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMERGENCY SOS HIGHWAY POLICE DISPATCH MODAL */}
      {showSosModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ borderColor: '#EF4444' }}>
            <div className={styles.modalHeader} style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ color: '#EF4444' }}>🚨 EMERGENCY SOS HIGHWAY POLICE & DESK NOTIFIED</h3>
              <button onClick={() => setShowSosModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <div style={{ padding: '1.25rem', lineHeight: 1.6 }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                <strong style={{ color: '#EF4444', fontSize: '1.1rem' }}>⚠️ Emergency Alarm Broadcasted Live!</strong>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem', color: '#F8FAFC' }}>
                  GPS Coordinates captured: <strong>30.1978° N, 71.4697° E (M-5 Motorway)</strong>.<br />
                  Emergency package transmitted to <strong>NHMP National Highway & Motorway Police (130)</strong> and SafarLoad Dispatch Control Desk.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="tel:130" className="btn btn-accent" style={{ textAlign: 'center', fontWeight: 800 }}>
                  📞 Call Highway Police Helpline (NHMP 130)
                </a>
                <a href="tel:+924211172327" className="btn btn-primary" style={{ textAlign: 'center' }}>
                  📞 Call 24/7 SafarLoad Rescue Hotline (+92 42 111 SAFAR)
                </a>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowSosModal(false)} className="btn btn-glass">
                Cancel Emergency Alert
              </button>
            </div>
          </div>
        </div>
      )}

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
