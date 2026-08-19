'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { pakistaniCities } from '@/lib/mockData';

interface TripItem {
  id: string;
  loadId: string;
  route: string;
  cargo: string;
  weight: number;
  price: number;
  shipper: string;
  status: 'assigned' | 'at_pickup' | 'in_transit' | 'delivered';
  pickupDate: string;
  biltyUploaded: boolean;
  fuelAdvanceRequested: boolean;
}

export default function DriverTripsPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('ur');
  const [trips, setTrips] = useState<TripItem[]>([
    {
      id: 'TRIP-901',
      loadId: 'LD-2026-001',
      route: 'Multan → Karachi',
      cargo: '25 Tons Cotton Bales',
      weight: 25,
      price: 185000,
      shipper: 'Noor Textile Mills',
      status: 'in_transit',
      pickupDate: '2026-08-19 (Today)',
      biltyUploaded: true,
      fuelAdvanceRequested: true,
    },
    {
      id: 'TRIP-902',
      loadId: 'LD-2026-003',
      route: 'DG Khan → Lahore',
      cargo: '20 Tons Cement Bags',
      weight: 20,
      price: 95000,
      shipper: 'DG Khan Cement Corp',
      status: 'assigned',
      pickupDate: '2026-08-21 (Tomorrow)',
      biltyUploaded: false,
      fuelAdvanceRequested: false,
    },
  ]);

  const [activeTrip, setActiveTrip] = useState<TripItem>(trips[0]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Driver Availability Broadcast Form State
  const [unloadedCity, setUnloadedCity] = useState('Karachi');
  const [unloadedLocation, setUnloadedLocation] = useState('Port Qasim Gate 2 (Reached & Unloaded)');
  const [destPreference, setDestPreference] = useState<'specific' | 'any'>('any');
  const [preferredRoute, setPreferredRoute] = useState('Multan / Faisalabad');
  const [readyTime, setReadyTime] = useState('Today 6:00 PM');
  const [broadcastActive, setBroadcastActive] = useState(true);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const handleUpdateStatus = (tripId: string, newStatus: TripItem['status']) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: newStatus } : t))
    );
    if (activeTrip.id === tripId) {
      setActiveTrip((prev) => ({ ...prev, status: newStatus }));
    }
    alert(`Trip status updated to: ${newStatus.toUpperCase()}`);
  };

  const handleUploadBilty = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, biltyUploaded: true } : t))
    );
    if (activeTrip.id === tripId) {
      setActiveTrip((prev) => ({ ...prev, biltyUploaded: true }));
    }
    alert('📄 Digital Bilty photo uploaded successfully! Escrow clearing triggered.');
  };

  const handleRequestFuelAdvance = (tripId: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, fuelAdvanceRequested: true } : t))
    );
    if (activeTrip.id === tripId) {
      setActiveTrip((prev) => ({ ...prev, fuelAdvanceRequested: true }));
    }
    alert('⛽ Rs. 30,000 Fuel Advance request sent to shipper via JazzCash!');
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastActive(true);
    setShowAvailabilityModal(false);
    alert(`📢 Return Availability Broadcasted Live across Pakistan!\nLocation: ${unloadedLocation} (${unloadedCity})\nPreference: ${destPreference === 'any' ? 'Open for Any Route in Pakistan' : preferredRoute}\nShippers and SafarLoad Brokers have been notified!`);
  };

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <div className={styles.tripBadge}>🚛 Driver Trips & Deliveries | میرے سفر</div>
          <h1>{lang === 'ur' ? 'میرے رجسٹرڈ اور آن گوئنگ سفر' : 'My Active Booked Trips'}</h1>
          <p>{lang === 'ur' ? 'سفر کی حالت اپ ڈیٹ کریں، بلٹی اپ لوڈ کریں اور ایندھن ایڈوانس حاصل کریں' : 'Update status, upload Bilty, and claim fuel advance'}</p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <button onClick={() => setShowAvailabilityModal(true)} className="btn btn-secondary btn-sm">
            🟢 {lang === 'ur' ? 'خالی گاڑی کا اعلان کریں' : 'Broadcast Return Availability'}
          </button>
          <Link href="/dashboard/loads" className="btn btn-primary btn-sm">
            📋 {lang === 'ur' ? 'مزید لوڈز تلاش کریں' : 'Find More Loads'}
          </Link>
        </div>
      </header>

      {/* Broadcast Status Indicator Banner */}
      {broadcastActive && (
        <div className={styles.broadcastBanner}>
          <div className={styles.broadcastInfo}>
            <span className={styles.broadcastDot}></span>
            <div>
              <strong>{lang === 'ur' ? '🟢 خالی گاڑی کا لائیو اعلان فعال ہے' : '🟢 Live Return Availability Broadcast Active'}</strong>
              <div className={styles.broadcastSub}>
                📍 Current: {unloadedLocation} | Target: {destPreference === 'any' ? 'Open for Any Route in Pakistan (تمام روٹس)' : preferredRoute}
              </div>
            </div>
          </div>
          <button onClick={() => setShowAvailabilityModal(true)} className="btn btn-glass btn-sm">
            ⚙️ Edit Broadcast
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className={styles.tripsGrid}>
        {/* Left Side: Trip Cards List */}
        <div className={styles.tripsList}>
          <h3>📋 {lang === 'ur' ? 'سفر کی فہرست' : 'Trips List'} ({trips.length})</h3>

          {trips.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTrip(t)}
              className={`${styles.tripCard} ${activeTrip.id === t.id ? styles.selectedTripCard : ''}`}
            >
              <div className={styles.tripCardHeader}>
                <strong>{t.route}</strong>
                {t.status === 'assigned' && <span className="badge badge-warning">Assigned / تفویض</span>}
                {t.status === 'at_pickup' && <span className="badge badge-info">At Pickup / فیکٹری پر</span>}
                {t.status === 'in_transit' && <span className="badge badge-success">In Transit / راستے میں</span>}
                {t.status === 'delivered' && <span className="badge badge-primary">Delivered / مکمل</span>}
              </div>

              <div className={styles.tripCardBody}>
                <p>📦 {t.cargo}</p>
                <div className={styles.priceMeta}>
                  <strong>Rs. {t.price.toLocaleString()}</strong>
                  <span>🏢 {t.shipper}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Active Trip Detail & Driver Action Controls */}
        {activeTrip && (
          <div className={`${styles.tripDetailPanel} glass-card animate-fadeIn`}>
            <div className={styles.detailHeader}>
              <div>
                <h2>{activeTrip.route}</h2>
                <span className={styles.loadIdTag}>Load ID: {activeTrip.loadId} | {activeTrip.id}</span>
              </div>
              <div className={styles.pricePill}>Rs. {activeTrip.price.toLocaleString()}</div>
            </div>

            {/* Trip Specs */}
            <div className={styles.specsRow}>
              <div><span>Cargo:</span> <strong>{activeTrip.cargo}</strong></div>
              <div><span>Weight:</span> <strong>{activeTrip.weight} Tons</strong></div>
              <div><span>Shipper:</span> <strong>{activeTrip.shipper}</strong></div>
              <div><span>Pickup Date:</span> <strong>{activeTrip.pickupDate}</strong></div>
            </div>

            {/* Driver One-Tap Status Buttons */}
            <div className={styles.statusSection}>
              <h4>🚦 {lang === 'ur' ? 'سفر کی موجودہ حالت اپ ڈیٹ کریں' : 'Update Journey Milestone Status'}</h4>
              <div className={styles.statusBtnsRow}>
                <button
                  onClick={() => handleUpdateStatus(activeTrip.id, 'at_pickup')}
                  className={`${styles.statusBtn} ${activeTrip.status === 'at_pickup' ? styles.activeStatusBtn : ''}`}
                >
                  🏭 {lang === 'ur' ? 'پک اپ فیکٹری پہنچ گیا' : 'At Pickup'}
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeTrip.id, 'in_transit')}
                  className={`${styles.statusBtn} ${activeTrip.status === 'in_transit' ? styles.activeStatusBtn : ''}`}
                >
                  🚛 {lang === 'ur' ? 'راستے میں روانہ' : 'In Transit'}
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeTrip.id, 'delivered')}
                  className={`${styles.statusBtn} ${activeTrip.status === 'delivered' ? styles.activeStatusBtn : ''}`}
                >
                  📦 {lang === 'ur' ? 'ڈیلیور ہو گیا' : 'Delivered'}
                </button>
              </div>
            </div>

            {/* Bilty Photo & Fuel Advance Action Section */}
            <div className={styles.actionBoxRow}>
              {/* Bilty Upload */}
              <div className={styles.actionBox}>
                <h5>📄 {lang === 'ur' ? 'ڈیجیٹل بلٹی (Bilty) اپ لوڈ کریں' : 'Digital Bilty Photo (POD)'}</h5>
                <p>{lang === 'ur' ? 'بلٹی کی تصویر اپ لوڈ کریں تاکہ ایسکرو سے رقم فوراً والٹ میں منتقل ہو سکے' : 'Upload proof of delivery photo for instant escrow payout.'}</p>
                {activeTrip.biltyUploaded ? (
                  <span className="badge badge-success">✅ Bilty Photo Uploaded (بلٹی اپ لوڈ شدہ)</span>
                ) : (
                  <button onClick={() => handleUploadBilty(activeTrip.id)} className="btn btn-primary btn-sm">
                    📷 {lang === 'ur' ? 'بلٹی فوٹو اپ لوڈ کریں' : 'Upload Bilty Photo'}
                  </button>
                )}
              </div>

              {/* Fuel Advance */}
              <div className={styles.actionBox}>
                <h5>⛽ {lang === 'ur' ? 'ایندھن ایڈوانس درخواست' : 'Fuel Advance Request'}</h5>
                <p>{lang === 'ur' ? 'سفر شروع کرنے سے پہلے 30% ایندھن کا ایڈوانس جاز کیش پر حاصل کریں' : 'Claim 30% fuel advance via JazzCash before trip start.'}</p>
                {activeTrip.fuelAdvanceRequested ? (
                  <span className="badge badge-info">⛽ Fuel Advance Claimed (Rs. 30,000)</span>
                ) : (
                  <button onClick={() => handleRequestFuelAdvance(activeTrip.id)} className="btn btn-secondary btn-sm">
                    💸 {lang === 'ur' ? 'ایندھن ایڈوانس مانگیں' : 'Request Fuel Advance'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DRIVER AVAILABILITY BROADCAST MODAL */}
      {showAvailabilityModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🟢 Broadcast Return Load Availability (خالی گاڑی کا لائیو اعلان)</h3>
              <button onClick={() => setShowAvailabilityModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleBroadcastSubmit}>
              <div className={styles.inputGroup}>
                <label>Current Unloaded City (شہر جہاں اب گاڑی موجود ہے)</label>
                <select value={unloadedCity} onChange={(e) => setUnloadedCity(e.target.value)} className="input">
                  {pakistaniCities.map((c) => (
                    <option key={c.en} value={c.en}>
                      {c.en} ({c.ur}) — {c.province}
                    </option>
                  ))}
                  <option value="custom">➕ {lang === 'ur' ? 'نیا شہر درج کریں (دیگر)' : '+ Add Custom City...'}</option>
                </select>
                {unloadedCity === 'custom' && (
                  <input
                    type="text"
                    className="input"
                    placeholder={lang === 'ur' ? 'شہر کا نام ٹائپ کریں' : 'Type custom city name'}
                    onChange={(e) => setUnloadedCity(e.target.value)}
                    style={{ marginTop: '0.5rem' }}
                  />
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Exact Location / Adda (موجودہ اڈا یا پورٹ لوکیشن)</label>
                <input
                  type="text"
                  value={unloadedLocation}
                  onChange={(e) => setUnloadedLocation(e.target.value)}
                  className="input"
                  placeholder="e.g. Port Qasim Gate 2 / Hawkesbay Adda / Multan Bypass"
                />
              </div>

              {/* Destination Preference */}
              <div className={styles.inputGroup}>
                <label>Destination Route Preference (کہاں کا لوڈ چاہیے؟)</label>
                <div className={styles.destToggleRow}>
                  <button
                    type="button"
                    onClick={() => setDestPreference('any')}
                    className={`${styles.destBtn} ${destPreference === 'any' ? styles.activeDestBtn : ''}`}
                  >
                    🇵🇰 Open for Any Route in Pakistan (تمام روٹس کے لیے کھلی گاڑی)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestPreference('specific')}
                    className={`${styles.destBtn} ${destPreference === 'specific' ? styles.activeDestBtn : ''}`}
                  >
                    🎯 Specific Return Route (مخصوص روٹ)
                  </button>
                </div>
              </div>

              {destPreference === 'specific' && (
                <div className={styles.inputGroup}>
                  <label>Preferred Destination Route (مطلوبہ روٹ)</label>
                  <input
                    type="text"
                    value={preferredRoute}
                    onChange={(e) => setPreferredRoute(e.target.value)}
                    className="input"
                    placeholder="e.g. Multan, Faisalabad, or Rawalpindi"
                  />
                </div>
              )}

              <div className={styles.inputGroup}>
                <label>Ready Departure Time (کب روانگی کے لیے تیار ہیں)</label>
                <select value={readyTime} onChange={(e) => setReadyTime(e.target.value)} className="input">
                  <option value="Immediate Departure">Immediate Departure (ابھی روانہ ہو سکتا ہوں)</option>
                  <option value="Today 6:00 PM">Today Evening (آج شام)</option>
                  <option value="Tomorrow Morning 08:00 AM">Tomorrow Morning (کل صبح)</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAvailabilityModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  📢 Broadcast Availability Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
