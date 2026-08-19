'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { pakistaniCities, mockDriverCounterBids, DriverCounterBid } from '@/lib/mockData';

import DigitalBiltyModal, { BiltyData } from '@/components/DigitalBiltyModal';

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
  const [selectedBilty, setSelectedBilty] = useState<BiltyData | null>(null);

  const handleOpenBilty = (trip: TripItem) => {
    setSelectedBilty({
      biltyNumber: `BLT-2026-${trip.id.replace('TRIP-', '')}`,
      date: '2026-08-19',
      consignorName: trip.shipper,
      consignorCnic: '35202-9842107-1',
      consignorPhone: '+92 42 35789000',
      pickupAddress: 'Industrial Estate Gate 3, Multan',
      consigneeName: 'Pak Cotton Trading Co.',
      consigneeCnic: '42201-1122334-9',
      consigneePhone: '+92 21 34567890',
      dropoffAddress: 'Port Qasim, Bin Qasim Town, Karachi',
      driverName: 'Muhammad Aslam',
      driverCnic: '35201-1234567-1',
      driverPhone: '+92 301 2345678',
      truckNumber: 'LHR-5678',
      truckType: 'Flatbed Trailer (25 Tons)',
      cargoDescription: trip.cargo,
      packageCount: '500 Bales',
      weightTons: trip.weight.toString(),
      declaredValuePkr: 4500000,
      totalFreightPkr: trip.price,
      paymentTerm: '30% Advance + 70% Delivery Pay',
      tollsIncluded: true,
      challanProtected: true,
    });
  };
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

  // Dynamic Driver Bids State Synced with localStorage
  const [driverBids, setDriverBids] = useState<DriverCounterBid[]>(mockDriverCounterBids);
  const [modifyBidTarget, setModifyBidTarget] = useState<DriverCounterBid | null>(null);
  const [newDriverBidPrice, setNewDriverBidPrice] = useState<string>('');
  const [newDriverBidMsg, setNewDriverBidMsg] = useState<string>('');

  // Direct Shipper Chat Modal State
  const [chatTargetShipper, setChatTargetShipper] = useState<TripItem | DriverCounterBid | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'shipper', text: 'Assalam-o-Alaikum! Please notify when vehicle arrives at Multan factory gate.', time: '02:15 PM' },
    { sender: 'driver', text: 'Walaikum Assalam Tariq sahib! Vehicle LHR-5678 is currently at Toll Plaza, arriving in 20 minutes.', time: '02:20 PM' }
  ]);
  const [chatInputText, setChatInputText] = useState('');

  // Sync bids with localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('safarload_global_bids');
      if (stored) {
        setDriverBids(JSON.parse(stored));
      } else {
        localStorage.setItem('safarload_global_bids', JSON.stringify(mockDriverCounterBids));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveBidsToStorage = (updatedBids: DriverCounterBid[]) => {
    setDriverBids(updatedBids);
    try {
      localStorage.setItem('safarload_global_bids', JSON.stringify(updatedBids));
    } catch (e) {
      console.error(e);
    }
  };

  // Driver Availability Broadcast Form State
  const [unloadedCity, setUnloadedCity] = useState('Karachi');
  const [unloadedLocation, setUnloadedLocation] = useState('Port Qasim Gate 2 (Reached & Unloaded)');
  const [destPreference, setDestPreference] = useState<'specific' | 'any'>('any');
  const [preferredRoute, setPreferredRoute] = useState('Multan / Faisalabad');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const handleOpenModifyBidModal = (b: DriverCounterBid) => {
    setModifyBidTarget(b);
    setNewDriverBidPrice(b.offeredBidPrice.toString());
    setNewDriverBidMsg(b.bidMessage);
  };

  const handleSaveModifiedBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyBidTarget) return;

    const updatedPrice = Number(newDriverBidPrice);
    const updated = driverBids.map((b) =>
      b.id === modifyBidTarget.id
        ? {
            ...b,
            offeredBidPrice: updatedPrice,
            bidMessage: newDriverBidMsg,
            lastUpdatedBy: 'driver' as const,
          }
        : b
    );

    saveBidsToStorage(updated);
    alert(`✏️ Bid price updated to Rs. ${updatedPrice.toLocaleString()}! Shipper portal updated.`);
    setModifyBidTarget(null);
  };

  const handleAcceptShipperCounterOffer = (bidId: string) => {
    const targetBid = driverBids.find(b => b.id === bidId);
    if (!targetBid) return;

    const acceptedPrice = targetBid.shipperCounterPrice || targetBid.offeredBidPrice;

    // Convert bid to active trip
    const newTrip: TripItem = {
      id: `TRIP-${Math.floor(100 + Math.random() * 900)}`,
      loadId: targetBid.loadId,
      route: targetBid.route,
      cargo: targetBid.loadTitle,
      weight: 25,
      price: acceptedPrice,
      shipper: targetBid.shipperName,
      status: 'assigned',
      pickupDate: 'Tomorrow',
      biltyUploaded: false,
      fuelAdvanceRequested: false
    };

    setTrips(prev => [newTrip, ...prev]);

    const updated = driverBids.map((b) => (b.id === bidId ? { ...b, status: 'accepted' as const } : b));
    saveBidsToStorage(updated);

    alert(`🎉 Shipper Counter Offer Accepted! Trip locked at Rs. ${acceptedPrice.toLocaleString()}. Added to your Booked Trips.`);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        sender: 'driver',
        text: chatInputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInputText('');
  };

  const handleBroadcastReturnAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    const routeText = destPreference === 'any' ? 'Open for Any Route in Pakistan (تمام روٹس کے لیے کھلی گاڑی)' : preferredRoute;
    alert(`🟢 Return Load Availability Broadcasted Live!\nLocation: ${unloadedLocation}, ${unloadedCity}\nRoute: ${routeText}\nOur AI system & dispatch agents will contact shippers to lock your return trip!`);
    setShowAvailabilityModal(false);
  };

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <span className={styles.badge}>👨‍✈️ Driver Logistics Desk / ڈرائیور پورٹل</span>
          <h1>{lang === 'ur' ? 'میرے ٹرپس اور بولیوں کی تفصیلات' : 'My Booked Trips & Active Bids'}</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <button onClick={() => setShowAvailabilityModal(true)} className="btn btn-primary btn-sm">
            🟢 {lang === 'ur' ? 'خالی گاڑی کی واپسی کی اطلاع دیں' : 'Broadcast Return Load Availability'}
          </button>
        </div>
      </header>

      {/* DRIVER ACTIVE BIDS & SHIPPER COUNTER OFFERS SECTION */}
      <section className={`${styles.bidsSection} glass-card`} style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3>🏷️ {lang === 'ur' ? 'میری فعال بولیاں اور شپر کاؤنٹر آفرز' : 'My Active Bids & Shipper Counter Offers'}</h3>
          <span className="badge badge-info">{driverBids.length} Active Bids</span>
        </div>

        <div className={styles.bidsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {driverBids.map((b) => (
            <div key={b.id} className={`${styles.bidCard} glass-card`} style={{ padding: '1.25rem', borderRadius: '14px', background: 'var(--color-bg-secondary, #1E293B)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <strong>🏢 {b.shipperName}</strong>
                  <span className="badge badge-warning">{b.status.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', marginTop: '4px' }}>📍 {b.route}</div>
              </div>

              <div style={{ fontSize: '0.85rem' }}>
                <p><strong>Your Bid Price:</strong> <span style={{ color: '#F59E0B', fontWeight: 800 }}>Rs. {b.offeredBidPrice.toLocaleString()}</span></p>

                {b.shipperCounterPrice && (
                  <div style={{ margin: '0.5rem 0', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 700 }}>📩 Shipper Counter Offer:</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>Rs. {b.shipperCounterPrice.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>💬 "{b.shipperCounterNote}"</div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {b.shipperCounterPrice && b.status === 'pending' && (
                  <button onClick={() => handleAcceptShipperCounterOffer(b.id)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    ✅ {lang === 'ur' ? 'شپر آفر قبول کریں' : 'Accept Shipper Offer & Lock Trip'}
                  </button>
                )}

                {b.status === 'pending' && (
                  <button onClick={() => handleOpenModifyBidModal(b)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    ✏️ {lang === 'ur' ? 'بولی تبدیل کریں' : 'Modify My Bid'}
                  </button>
                )}

                {b.status === 'accepted' && (
                  <button onClick={() => setChatTargetShipper(b)} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    💬 {lang === 'ur' ? 'شپر سے چیٹ کریں' : 'Chat with Shipper'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid: Booked Trips List & Active Trip Details */}
      <div className={styles.mainGrid}>
        {/* Left Side: Booked Trips Cards */}
        <div className={styles.tripsList}>
          <h3 style={{ marginBottom: '1rem' }}>📋 {lang === 'ur' ? 'کامیاب بک شدہ ٹرپس' : 'Booked Freight Trips'}</h3>

          {trips.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTrip(t)}
              className={`${styles.tripCard} ${activeTrip.id === t.id ? styles.activeTripCard : ''} glass-card`}
            >
              <div className={styles.tripCardHeader}>
                <strong>{t.route}</strong>
                <span className="badge badge-success">Rs. {t.price.toLocaleString()}</span>
              </div>

              <div className={styles.tripCardMeta}>
                <p>📦 Cargo: {t.cargo}</p>
                <p>🏢 Shipper: {t.shipper}</p>
                <p>📅 Pickup: {t.pickupDate}</p>
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => setChatTargetShipper(t)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  💬 {lang === 'ur' ? 'شپر سے چیٹ کریں' : 'Chat with Shipper'}
                </button>
                <button onClick={() => handleOpenBilty(t)} className="btn btn-glass btn-sm" style={{ flex: 1 }}>
                  📜 {lang === 'ur' ? 'بلٹی دیکھیں' : 'View Bilty'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Active Trip Control Center */}
        <div className={`${styles.activeTripPanel} glass-card`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>🚚 Active Trip Command Center — {activeTrip.id}</h3>
              <p>Shipper: {activeTrip.shipper} | Route: {activeTrip.route}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleOpenBilty(activeTrip)} className="btn btn-glass btn-sm">
                📜 {lang === 'ur' ? 'بلٹی رسید دیکھیں' : 'View Digital Bilty'}
              </button>
              <button onClick={() => setChatTargetShipper(activeTrip)} className="btn btn-primary btn-sm">
                💬 {lang === 'ur' ? 'شپر سے چیٹ کریں' : 'Chat with Shipper'}
              </button>
            </div>
          </div>

          <div className={styles.infoBoxGrid}>
            <div className={styles.infoBox}>
              <span>Freight Payment:</span>
              <strong>Rs. {activeTrip.price.toLocaleString()}</strong>
              <small style={{ color: 'var(--color-primary)' }}>Escrow Guaranteed ✅</small>
            </div>
            <div className={styles.infoBox}>
              <span>Fuel Advance (30%):</span>
              <strong>Rs. {(activeTrip.price * 0.3).toLocaleString()}</strong>
              <small style={{ color: '#F59E0B' }}>JazzCash Wallet Ready</small>
            </div>
          </div>
        </div>
      </div>

      {/* MODIFY DRIVER BID MODAL */}
      {modifyBidTarget && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>✏️ Modify / Update Your Bid — {modifyBidTarget.route}</h3>
              <button onClick={() => setModifyBidTarget(null)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSaveModifiedBid}>
              <div className={styles.inputGroup}>
                <label>New Offered Rate (PKR):</label>
                <input
                  type="number"
                  value={newDriverBidPrice}
                  onChange={(e) => setNewDriverBidPrice(e.target.value)}
                  className="input input-lg"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Message / Note to Shipper (پیغام):</label>
                <input
                  type="text"
                  value={newDriverBidMsg}
                  onChange={(e) => setNewDriverBidMsg(e.target.value)}
                  className="input"
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setModifyBidTarget(null)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Update Bid & Notify Shipper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT SHIPPER CHAT DRAWER MODAL */}
      {chatTargetShipper && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.chatCard} glass-card animate-scaleIn`}>
            <div className={styles.chatHeader}>
              <div>
                <h3>💬 Direct Chat with Shipper: {'shipper' in chatTargetShipper ? chatTargetShipper.shipper : chatTargetShipper.shipperName}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Load Route: {chatTargetShipper.route}</span>
              </div>
              <button onClick={() => setChatTargetShipper(null)} className={styles.closeBtn}>✕</button>
            </div>

            <div className={styles.chatBody}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${styles.chatBubble} ${msg.sender === 'driver' ? styles.sentBubble : styles.receivedBubble}`}
                >
                  <div className={styles.bubbleText}>{msg.text}</div>
                  <span className={styles.bubbleTime}>{msg.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChatMessage} className={styles.chatInputRow}>
              <input
                type="text"
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder="Type message to shipper..."
                className="input"
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                📤 Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DRIVER RETURN AVAILABILITY BROADCAST MODAL */}
      {showAvailabilityModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🟢 Broadcast Return Load Availability (خالی گاڑی کی واپسی کی اطلاع)</h3>
              <button onClick={() => setShowAvailabilityModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleBroadcastReturnAvailability}>
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
                <label>Specific Pickup Location / Yard (مقام)</label>
                <input
                  type="text"
                  value={unloadedLocation}
                  onChange={(e) => setUnloadedLocation(e.target.value)}
                  className="input"
                  placeholder="e.g. Port Qasim Gate 2, Bin Qasim Town"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Return Route Preference (کہاں جانا ہے)</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setDestPreference('any')}
                    className={`btn ${destPreference === 'any' ? 'btn-primary' : 'btn-glass'} btn-sm`}
                  >
                    🇵🇰 Open for Any Route (تمام روٹس کے لیے کھلی گاڑی)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDestPreference('specific')}
                    className={`btn ${destPreference === 'specific' ? 'btn-primary' : 'btn-glass'} btn-sm`}
                  >
                    🎯 Specific Route (خاص شہر)
                  </button>
                </div>
              </div>

              {destPreference === 'specific' && (
                <div className={styles.inputGroup}>
                  <label>Preferred Destination City / Hub:</label>
                  <input
                    type="text"
                    value={preferredRoute}
                    onChange={(e) => setPreferredRoute(e.target.value)}
                    className="input"
                    placeholder="e.g. Multan, Faisalabad, Lahore"
                    required
                  />
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAvailabilityModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  📡 Broadcast Availability Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL BILTY MODAL */}
      {selectedBilty && (
        <DigitalBiltyModal bilty={selectedBilty} onClose={() => setSelectedBilty(null)} />
      )}
    </div>
  );
}
