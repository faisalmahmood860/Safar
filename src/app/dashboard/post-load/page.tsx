'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockDriverCounterBids, mockDriverAvailabilities, DriverCounterBid, DriverAvailabilityBroadcast, pakistaniCities } from '@/lib/mockData';

export default function PostLoadPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('ur');
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [voicePosting, setVoicePosting] = useState(false);
  const [loadPostedSuccess, setLoadPostedSuccess] = useState(false);
  const [bids, setBids] = useState<DriverCounterBid[]>(mockDriverCounterBids);
  const [availabilities] = useState<DriverAvailabilityBroadcast[]>(mockDriverAvailabilities);

  // Form State
  const [pickupCity, setPickupCity] = useState('Multan');
  const [pickupAddress, setPickupAddress] = useState('Industrial Estate, Bosan Road');
  const [dropoffCity, setDropoffCity] = useState('Karachi');
  const [dropoffAddress, setDropoffAddress] = useState('Port Qasim, Bin Qasim Town');
  const [cargoType, setCargoType] = useState('Textile');
  const [weightTons, setWeightTons] = useState('25');
  const [truckType, setTruckType] = useState('Trailer');
  const [pricingType, setPricingType] = useState<'fixed' | 'bidding'>('fixed');
  const [offeredPrice, setOfferedPrice] = useState('185000');
  const [pickupDate, setPickupDate] = useState('2026-08-22');
  const [specialNotes, setSpecialNotes] = useState('Tarpaulin required, handle with care');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const handleVoiceRecord = () => {
    setVoicePosting(true);
    setTimeout(() => {
      setVoicePosting(false);
      setPickupCity('Faisalabad');
      setDropoffCity('Karachi');
      setCargoType('Cotton Bales');
      setWeightTons('18');
      setTruckType('22-Wheeler');
      setOfferedPrice('165000');
    }, 3000);
  };

  const handleSubmitLoad = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadPostedSuccess(true);
  };

  const handleAcceptBid = (bidId: string) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'accepted' } : b))
    );
    alert(`✅ Driver Counter Bid ${bidId} ACCEPTED! Load assigned and Escrow payment locked.`);
  };

  const handleRejectBid = (bidId: string) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: 'rejected' } : b))
    );
  };

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Top Header Bar */}
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.headerBadge}>🏢 Shipper & Business Portal | شپر پورٹل</span>
          <h1>{lang === 'ur' ? 'نیا کارگو / لوڈ پوسٹ کریں' : 'Post New Logistics Load'}</h1>
          <p>
            {lang === 'ur'
              ? 'اپنے کارگو کی تفصیلات درج کریں اور سیکنڈوں میں تصدیق شدہ ڈرائیورز سے جڑیں'
              : 'Post your cargo details and connect with verified Pakistani truck drivers in seconds'}
          </p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <Link href="/dashboard/broker" className="btn btn-outline btn-sm">
            🛡️ Broker Control Hub
          </Link>
        </div>
      </header>

      {/* Voice Posting Hero Prompt */}
      <div className={styles.voiceCard}>
        <div className={styles.voiceContent}>
          <div className={styles.voiceIconContainer}>
            <button
              onClick={handleVoiceRecord}
              className={`${styles.micButton} ${voicePosting ? styles.recording : ''}`}
            >
              🎤
            </button>
          </div>
          <div>
            <h3>{lang === 'ur' ? '🗣️ اردو وائس پوسٹنگ (آواز سے لوڈ بنائیں)' : '🗣️ Urdu Voice Load Posting'}</h3>
            <p>
              {lang === 'ur'
                ? 'مائیک پر کلک کریں اور بولیں: "مجھے ملتان سے کراچی کے لیے 25 ٹن کا ٹریلر چاہیے"'
                : 'Click mic and speak in Urdu: "I need a 25-ton trailer from Multan to Karachi"'}
            </p>
            {voicePosting && (
              <div className={styles.listeningBadge}>
                <span className={styles.pulseDot}></span> Listening to Urdu audio... (سن رہا ہے)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INCOMING DRIVER COUNTER BIDS SECTION */}
      <section className={`${styles.bidsSection} glass-card`}>
        <div className={styles.bidsHeader}>
          <h3>🏷️ {lang === 'ur' ? 'ڈرائیورز کی طرف سے موصول شدہ کاؤنٹر بولیاں' : 'Incoming Driver Counter Bids & Offers'}</h3>
          <span className="badge badge-warning">{bids.filter((b) => b.status === 'pending').length} {lang === 'ur' ? 'نیا کاؤنٹر آفرز' : 'New Bids Received'}</span>
        </div>

        <div className={styles.bidsGrid}>
          {bids.map((b) => (
            <div key={b.id} className={`${styles.bidCard} ${b.status === 'accepted' ? styles.acceptedBid : ''}`}>
              <div className={styles.bidCardHeader}>
                <div>
                  <strong>{b.driverName} ({b.driverNameUr})</strong>
                  <span className={styles.bidRating}>⭐ {b.driverRating} ({b.driverTrips} trips)</span>
                </div>
                <div className={styles.bidPriceTag}>
                  Rs. {b.offeredBidPrice.toLocaleString()}
                  <small>Original: Rs. {b.originalPrice.toLocaleString()}</small>
                </div>
              </div>

              <div className={styles.bidMeta}>
                <p>🚛 <strong>Vehicle:</strong> {b.truckNumber} ({b.truckType})</p>
                <p>📍 <strong>Route:</strong> {b.route}</p>
                <p className={styles.bidMsg}>💬 "{b.bidMessage}"</p>
              </div>

              <div className={styles.bidActions}>
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => handleAcceptBid(b.id)} className="btn btn-primary btn-sm">
                      ✅ {lang === 'ur' ? 'بولی قبول کریں اور بوک کریں' : 'Accept Bid & Lock Escrow'}
                    </button>
                    <button onClick={() => handleRejectBid(b.id)} className="btn btn-accent btn-sm">
                      ❌ {lang === 'ur' ? 'مسترد کریں' : 'Reject'}
                    </button>
                  </>
                )}
                {b.status === 'accepted' && (
                  <span className="badge badge-success">✅ Bid Accepted — Escrow Locked!</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DRIVER AVAILABILITY STREAM (RETURN TRIPS RADAR) */}
      <section className={`${styles.availSection} glass-card`}>
        <div className={styles.availHeader}>
          <div>
            <h3>🟢 {lang === 'ur' ? 'خالی گاڑی اور ریٹرن روٹ ڈرائیور رڈار' : 'Available Driver Return Radar Stream'}</h3>
            <p>{lang === 'ur' ? 'شہر پہنچے ہوئے ڈرائیورز کا اعلان — پوسٹ کرنے سے پہلے ڈرائیور منتخب کریں' : 'Drivers who recently unloaded and announced return trip availability.'}</p>
          </div>
          <span className="badge badge-success">3 Ready Drivers Streamed</span>
        </div>

        <div className={styles.availGrid}>
          {availabilities.map((a) => (
            <div key={a.id} className={styles.availCard}>
              <div className={styles.availHeaderRow}>
                <div>
                  <strong>{a.driverName} ({a.driverNameUr})</strong>
                  <div className={styles.availCity}>📍 At: {a.currentLocation}</div>
                </div>
                <span className="badge badge-info">{a.truckType}</span>
              </div>

              <div className={styles.prefRouteBox}>
                <span>🎯 {lang === 'ur' ? 'مطلوبہ واپسی کا روٹ:' : 'Preferred Next Route:'}</span>
                <strong className={styles.destText}>{a.preferredDestination}</strong>
              </div>

              <div className={styles.availMetaRow}>
                <span>⚖️ Capacity: {a.availableCapacityTons} Tons</span>
                <span>⏱️ Departure: {a.departureTime}</span>
              </div>

              <div className={styles.availActionRow}>
                <button
                  onClick={() => alert(`📞 SafarLoad Agent connecting with ${a.driverName} (${a.driverPhone}) for your load!`)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  🤝 {lang === 'ur' ? 'ایجنٹ سے ڈرائیور بک کرائیں' : 'Connect Agent & Book Driver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {loadPostedSuccess ? (
        <div className={`${styles.successCard} glass-card animate-scaleIn`}>
          <div className={styles.successIcon}>🎉</div>
          <h2>{lang === 'ur' ? 'لوڈ کاملیت کے ساتھ پوسٹ ہو گیا!' : 'Load Posted Successfully!'}</h2>
          <p>
            {lang === 'ur'
              ? `آپ کا لوڈ (LD-2026-089) ${pickupCity} سے ${dropoffCity} کے لیے فعال ڈرائیورز کو بھیج دیا گیا ہے۔`
              : `Your shipment from ${pickupCity} to ${dropoffCity} is now broadcasted to 52,000+ verified drivers.`}
          </p>
          <div className={styles.successMeta}>
            <div>
              <span>Estimated Rate:</span> <strong>Rs. {Number(offeredPrice).toLocaleString()}</strong>
            </div>
            <div>
              <span>Truck Required:</span> <strong>{truckType}</strong>
            </div>
            <div>
              <span>Cargo Type:</span> <strong>{cargoType}</strong>
            </div>
          </div>
          <div className={styles.successActions}>
            <Link href="/dashboard/loads" className="btn btn-primary">
              📋 View on Load Board
            </Link>
            <button onClick={() => setLoadPostedSuccess(false)} className="btn btn-glass">
              ➕ Post Another Load
            </button>
          </div>
        </div>
      ) : (
        /* Main Multi-Step Load Creation Form */
        <div className={styles.mainGrid}>
          <div className={`${styles.formCard} glass-card`}>
            {/* Step Wizard Header */}
            <div className={styles.wizardSteps}>
              <div
                onClick={() => setFormStep(1)}
                className={`${styles.stepItem} ${formStep === 1 ? styles.activeStep : ''}`}
              >
                <span>1</span> {lang === 'ur' ? 'روٹ اور لوکیشن' : 'Route & Location'}
              </div>
              <div
                onClick={() => setFormStep(2)}
                className={`${styles.stepItem} ${formStep === 2 ? styles.activeStep : ''}`}
              >
                <span>2</span> {lang === 'ur' ? 'کارگو اور ٹرک کی قسم' : 'Cargo & Truck'}
              </div>
              <div
                onClick={() => setFormStep(3)}
                className={`${styles.stepItem} ${formStep === 3 ? styles.activeStep : ''}`}
              >
                <span>3</span> {lang === 'ur' ? 'قیمت اور ادائیگیاں' : 'Price & Payment'}
              </div>
            </div>

            <form onSubmit={handleSubmitLoad}>
              {/* STEP 1: ROUTE */}
              {formStep === 1 && (
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>📍 {lang === 'ur' ? 'پک اپ اور ڈیلیوری لوکیشن' : 'Pickup & Delivery Route'}</h3>

                  <div className={styles.rowGrid}>
                    <div className={styles.inputGroup}>
                      <label>📍 {lang === 'ur' ? 'پک اپ شہر' : 'Pickup City'}</label>
                      <select value={pickupCity} onChange={(e) => setPickupCity(e.target.value)} className="input">
                        {pakistaniCities.map((c) => (
                          <option key={c.en} value={c.en}>
                            {c.en} ({c.ur}) — {c.province}
                          </option>
                        ))}
                        <option value="custom">➕ {lang === 'ur' ? 'نیا شہر درج کریں (دیگر)' : '+ Add Custom City...'}</option>
                      </select>
                      {pickupCity === 'custom' && (
                        <input
                          type="text"
                          className="input"
                          placeholder={lang === 'ur' ? 'شہر کا نام ٹائپ کریں' : 'Type custom city name'}
                          onChange={(e) => setPickupCity(e.target.value)}
                          style={{ marginTop: '0.5rem' }}
                        />
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label>🏁 {lang === 'ur' ? 'ڈیلیوری شہر' : 'Delivery City'}</label>
                      <select value={dropoffCity} onChange={(e) => setDropoffCity(e.target.value)} className="input">
                        {pakistaniCities.map((c) => (
                          <option key={c.en} value={c.en}>
                            {c.en} ({c.ur}) — {c.province}
                          </option>
                        ))}
                        <option value="custom">➕ {lang === 'ur' ? 'نیا شہر درج کریں (دیگر)' : '+ Add Custom City...'}</option>
                      </select>
                      {dropoffCity === 'custom' && (
                        <input
                          type="text"
                          className="input"
                          placeholder={lang === 'ur' ? 'شہر کا نام ٹائپ کریں' : 'Type custom city name'}
                          onChange={(e) => setDropoffCity(e.target.value)}
                          style={{ marginTop: '0.5rem' }}
                        />
                      )}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>🏭 {lang === 'ur' ? 'پک اپ کا مکمل پتہ / فیکٹری' : 'Pickup Address / Warehouse'}</label>
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="input"
                      placeholder="e.g. Gate 3, Sunrise Textile Mills, Sheikhupura Road"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>🏢 {lang === 'ur' ? 'ڈیلیوری کا پتہ' : 'Dropoff Address / Destination'}</label>
                    <input
                      type="text"
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      className="input"
                      placeholder="e.g. Plot 45, Sector 15, Korangi Industrial Area"
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>📅 {lang === 'ur' ? 'پک اپ تاریخ' : 'Pickup Date & Time'}</label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div className={styles.btnRow}>
                    <div></div>
                    <button type="button" onClick={() => setFormStep(2)} className="btn btn-primary">
                      {lang === 'ur' ? 'اگلا مرحلہ ➡️' : 'Next Step ➡️'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CARGO & TRUCK */}
              {formStep === 2 && (
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>📦 {lang === 'ur' ? 'سامان اور ٹرک کی قسم' : 'Cargo Specs & Truck Requirement'}</h3>

                  <div className={styles.rowGrid}>
                    <div className={styles.inputGroup}>
                      <label>📦 {lang === 'ur' ? 'کارگو کی قسم' : 'Cargo Type'}</label>
                      <select value={cargoType} onChange={(e) => setCargoType(e.target.value)} className="input">
                        <option value="Textile">Textile / 🧵 ٹیکسٹائل</option>
                        <option value="Food & Grain">Food & Grain / 🌾 اناج اور خوراک</option>
                        <option value="Construction">Construction Material / 🧱 تعمیراتی سامان</option>
                        <option value="Machinery">Industrial Machinery / 🔧 مشینری</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>⚖️ {lang === 'ur' ? 'وزن (ٹن)' : 'Total Weight (Tons)'}</label>
                      <input
                        type="number"
                        value={weightTons}
                        onChange={(e) => setWeightTons(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>🚛 {lang === 'ur' ? 'مطلوبہ ٹرک کی قسم' : 'Required Truck Type'}</label>
                    <div className={styles.truckRadioGrid}>
                      {[
                        { name: 'Shehzore', label: '🛻 Shehzore (3 Tons)' },
                        { name: 'Mazda', label: '🚚 Mazda (8-10 Tons)' },
                        { name: 'Trailer', label: '🚛 Flatbed Trailer (25 Tons)' },
                        { name: '22-Wheeler', label: '🚛 22-Wheeler (40 Tons)' },
                        { name: 'Container', label: '📦 Container Truck (20/40ft)' },
                      ].map((t) => (
                        <div
                          key={t.name}
                          onClick={() => setTruckType(t.name)}
                          className={`${styles.truckChip} ${truckType === t.name ? styles.selectedTruck : ''}`}
                        >
                          {t.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.btnRow}>
                    <button type="button" onClick={() => setFormStep(1)} className="btn btn-glass">
                      {lang === 'ur' ? '⬅️ پچھلا' : '⬅️ Back'}
                    </button>
                    <button type="button" onClick={() => setFormStep(3)} className="btn btn-primary">
                      {lang === 'ur' ? 'اگلا مرحلہ ➡️' : 'Next Step ➡️'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PRICING & FINISH */}
              {formStep === 3 && (
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>💰 {lang === 'ur' ? 'کرایہ اور ایسکرو گارنٹی' : 'Freight Rate & Payment Guarantee'}</h3>

                  <div className={styles.pricingToggle}>
                    <button
                      type="button"
                      onClick={() => setPricingType('fixed')}
                      className={`${styles.toggleTab} ${pricingType === 'fixed' ? styles.activeTab : ''}`}
                    >
                      💵 {lang === 'ur' ? 'مقررہ کرایہ' : 'Fixed Offered Rate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricingType('bidding')}
                      className={`${styles.toggleTab} ${pricingType === 'bidding' ? styles.activeTab : ''}`}
                    >
                      🏷️ {lang === 'ur' ? 'ڈرائیورز سے بولی لیں' : 'Allow Bidding'}
                    </button>
                  </div>

                  {pricingType === 'fixed' ? (
                    <div className={styles.inputGroup}>
                      <label>💰 {lang === 'ur' ? 'پیش کردہ خالص کرایہ (روپے میں - کمیشن کے بغیر)' : 'Offered Base Freight Rate (PKR - Excluding Commission)'}</label>
                      <input
                        type="number"
                        value={offeredPrice}
                        onChange={(e) => setOfferedPrice(e.target.value)}
                        className="input input-lg"
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        * SafarLoad 4.0% Platform Commission (Rs. {(Number(offeredPrice) * 0.04).toLocaleString()}) is added to final billing after deal confirmation.
                      </span>
                    </div>
                  ) : (
                    <div className={styles.biddingNotice}>
                      <p>📢 Drivers will submit counter bids which will appear in your Counter Bids Panel above.</p>
                    </div>
                  )}

                  {/* TOLL & CHALLAN EXPENSE INCLUSION CHECKLIST */}
                  <div className={styles.inclusionsSection}>
                    <label style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block', marginBottom: '0.75rem' }}>
                      📋 {lang === 'ur' ? 'کرائے میں شامل اخراجات کی تفصیل (Inclusions Checklist):' : 'Included Freight Expenses Checklist:'}
                    </label>
                    <div className={styles.checkboxGrid}>
                      <label className={styles.checkboxItem}>
                        <input type="checkbox" defaultChecked />
                        <span>🛣️ Toll Plaza Charges Included (ٹول ٹیکس شامل ہے)</span>
                      </label>
                      <label className={styles.checkboxItem}>
                        <input type="checkbox" defaultChecked />
                        <span>👮 Highway Police Challan Protection (چالان پروٹیکشن)</span>
                      </label>
                      <label className={styles.checkboxItem}>
                        <input type="checkbox" defaultChecked />
                        <span>👷 Loading & Unloading Labor Included (لیبر مزدوری شامل ہے)</span>
                      </label>
                      <label className={styles.checkboxItem}>
                        <input type="checkbox" defaultChecked />
                        <span>⛽ 30% JazzCash Fuel Advance (ڈیزل ایڈوانس شامل ہے)</span>
                      </label>
                    </div>
                  </div>

                  <div className={styles.btnRow}>
                    <button type="button" onClick={() => setFormStep(2)} className="btn btn-glass">
                      {lang === 'ur' ? '⬅️ پچھلا' : '⬅️ Back'}
                    </button>
                    <button type="submit" className="btn btn-primary btn-lg">
                      🚀 {lang === 'ur' ? 'لوڈ لائیو شائع کریں' : 'Publish Freight Load'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Sidebar Summary & Incoming Bids Panel */}
          <aside className={styles.summaryAside}>
            {/* DEDICATED INCOMING DRIVER COUNTER BIDS CARD */}
            <div className={`${styles.sidebarBidsCard} glass-card`}>
              <div className={styles.sidebarBidsHeader}>
                <h3>🏷️ {lang === 'ur' ? 'موصول شدہ کاؤنٹر بولیاں' : 'Incoming Driver Bids'}</h3>
                <span className="badge badge-warning">{bids.filter(b => b.status === 'pending').length} New</span>
              </div>

              <div className={styles.sidebarBidsList}>
                {bids.map((b) => (
                  <div key={b.id} className={`${styles.sidebarBidItem} ${b.status === 'accepted' ? styles.acceptedSidebarBid : ''}`}>
                    <div className={styles.sidebarBidTop}>
                      <div>
                        <strong>👨‍✈️ {b.driverName}</strong>
                        <div className={styles.bidVehicle}>{b.truckNumber} ({b.truckType})</div>
                      </div>
                      <div className={styles.sidebarPricePill}>
                        Rs. {b.offeredBidPrice.toLocaleString()}
                      </div>
                    </div>

                    <div className={styles.sidebarRouteInfo}>
                      <span>📍 {b.route}</span>
                      <span>⭐ {b.driverRating}</span>
                    </div>

                    <p className={styles.sidebarBidMsg}>💬 "{b.bidMessage}"</p>

                    <div className={styles.sidebarBidActions}>
                      {b.status === 'pending' ? (
                        <>
                          <button onClick={() => handleAcceptBid(b.id)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                            ✅ {lang === 'ur' ? 'بولی قبول کریں' : 'Accept & Lock Escrow'}
                          </button>
                          <button onClick={() => handleRejectBid(b.id)} className="btn btn-accent btn-sm">
                            ❌
                          </button>
                        </>
                      ) : (
                        <span className="badge badge-success" style={{ width: '100%', textAlign: 'center' }}>
                          ✅ Bid Accepted — Escrow Locked!
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Summary Stats */}
            <div className={`${styles.summaryCard} glass-card`}>
              <h3>📊 {lang === 'ur' ? 'شپر خلاصہ' : 'Shipper Summary'}</h3>
              <div className={styles.summaryStat}>
                <span>Account:</span>
                <strong>Noor Textile Mills (Verified ✅)</strong>
              </div>
              <div className={styles.summaryStat}>
                <span>Active Counter Bids:</span>
                <strong className={styles.highlightGreen}>{bids.length} Offers</strong>
              </div>
              <div className={styles.summaryStat}>
                <span>Available Drivers:</span>
                <strong>{availabilities.length} Streamed</strong>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
