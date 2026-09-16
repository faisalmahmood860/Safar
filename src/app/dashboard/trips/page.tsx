'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { pakistaniCities, mockDriverCounterBids, DriverCounterBid } from '@/lib/mockData';

import DigitalBiltyModal, { BiltyData } from '@/components/DigitalBiltyModal';
import GlobalBannerContainer from '@/components/GlobalBannerContainer';
import { useBiltyEnabled } from '@/lib/biltyConfig';

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
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [selectedBilty, setSelectedBilty] = useState<BiltyData | null>(null);
  const biltyEnabled = useBiltyEnabled();
  const [showPoliceModal, setShowPoliceModal] = useState(false);

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
      driverName: 'Tariq Mehmood',
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

  const defaultTrips: TripItem[] = [
    {
      id: 'TRIP-901',
      loadId: 'LD-2026-001',
      route: 'Multan → Karachi',
      cargo: 'Textile Bales (25 Tons)',
      weight: 25,
      price: 185000,
      shipper: 'Noor Textile Mills Ltd',
      status: 'in_transit',
      pickupDate: 'Today 08:00 AM',
      biltyUploaded: true,
      fuelAdvanceRequested: true,
    },
    {
      id: 'TRIP-902',
      loadId: 'LD-2026-002',
      route: 'Lahore → Islamabad',
      cargo: 'Packaging Materials (20 Tons)',
      weight: 20,
      price: 65000,
      shipper: 'Packages Limited',
      status: 'assigned',
      pickupDate: 'Tomorrow 09:00 AM',
      biltyUploaded: false,
      fuelAdvanceRequested: false,
    },
  ];

  const [trips, setTrips] = useState<TripItem[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripItem | null>(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Complete Trip & ePOD Delivery Verification State
  const [showCompleteTripModal, setShowCompleteTripModal] = useState(false);
  const [receiverName, setReceiverName] = useState('Pak Cotton Terminal Manager');
  const [deliveryOtpCode, setDeliveryOtpCode] = useState('4829');
  const [cargoConditionNote, setCargoConditionNote] = useState('Cargo delivered in 100% sound condition without damage or shortage.');

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

  // Sync trips and bids with localStorage
  useEffect(() => {
    try {
      const storedTrips = localStorage.getItem('safarload_driver_trips');
      if (storedTrips) {
        const parsed = JSON.parse(storedTrips);
        setTrips(parsed);
        if (parsed.length > 0) setActiveTrip(parsed[0]);
      } else {
        setTrips(defaultTrips);
        setActiveTrip(defaultTrips[0]);
        localStorage.setItem('safarload_driver_trips', JSON.stringify(defaultTrips));
      }

      const storedBids = localStorage.getItem('safarload_global_bids');
      if (storedBids) {
        setDriverBids(JSON.parse(storedBids));
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

  const handleAdvanceTripStatus = (nextStatus: 'at_pickup' | 'in_transit') => {
    if (!activeTrip) return;
    const updatedTrips = trips.map((t) =>
      t.id === activeTrip.id ? { ...t, status: nextStatus } : t
    );
    setTrips(updatedTrips);
    setActiveTrip({ ...activeTrip, status: nextStatus });
    try {
      localStorage.setItem('safarload_driver_trips', JSON.stringify(updatedTrips));
    } catch (err) {
      console.error(err);
    }
    if (nextStatus === 'at_pickup') {
      alert(`📍 Vehicle Arrived at Factory Gate!\nShipper ${activeTrip.shipper} notified that vehicle is ready at pickup location.`);
    } else if (nextStatus === 'in_transit') {
      alert(`🚛 Transit Started!\nVehicle departed factory gate en-route on highway. Live GPS telematics active.`);
    }
  };

  const handleCompleteTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    const finalFreight = activeTrip.price;
    const final70PercentBalance = Math.round(finalFreight * 0.7);

    // 1. Update trip status to 'delivered' (Awaiting Shipper Acknowledgment)
    const updatedTrips = trips.map((t) =>
      t.id === activeTrip.id ? { ...t, status: 'delivered' as const, isAwaitingShipperAck: true } : t
    );
    setTrips(updatedTrips);
    setActiveTrip({ ...activeTrip, status: 'delivered' as const, isAwaitingShipperAck: true });

    try {
      localStorage.setItem('safarload_driver_trips', JSON.stringify(updatedTrips));
    } catch (err) {
      console.error(err);
    }

    // 2. Update global bids / booked loads status in localStorage to 'delivered'
    try {
      const storedBids = localStorage.getItem('safarload_global_bids');
      if (storedBids) {
        let bidsList = JSON.parse(storedBids);
        bidsList = bidsList.map((b: any) =>
          b.loadId === activeTrip.loadId || b.id === activeTrip.id || b.loadTitle === activeTrip.cargo
            ? { ...b, status: 'delivered', isDelivered: true, awaitingShipperAck: true, deliveryProof: { receiverName, deliveryOtpCode, notes: cargoConditionNotes, submittedAt: new Date().toLocaleDateString() } }
            : b
        );
        localStorage.setItem('safarload_global_bids', JSON.stringify(bidsList));
      }
    } catch (err) {
      console.error(err);
    }

    // 3. Update API backend status
    apiClient.updateLoadStatus(activeTrip.loadId, 'delivered').catch(console.error);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('safarload_bid_change'));
      window.dispatchEvent(new Event('safarload_loads_change'));
    }

    alert(
      `🚚 DELIVERY PROOF & OTP SUBMITTED SUCCESSFULLY!\n\n🚚 Trip ID: ${activeTrip.id}\n📍 Route: ${activeTrip.route}\n🏢 Shipper: ${activeTrip.shipper}\n👤 Receiver: ${receiverName}\n🔑 Delivery OTP Code: ${deliveryOtpCode}\n\nStatus set to 'Delivered & Awaiting Shipper Acknowledgment'. Once the Shipper acknowledges receipt, your 70% final freight payment (Rs. ${final70PercentBalance.toLocaleString()}) will be transferred directly to your driver account.`
    );

    setShowCompleteTripModal(false);
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
      {/* GLOBAL PLATFORM BANNERS & OVERDUE PAYMENT WARNINGS */}
      <GlobalBannerContainer />

      {/* Header */}
      <header className={styles.header}>
        <div>
          <span className={styles.badge}>👨‍✈️ Driver Logistics Desk / ڈرائیور پورٹل</span>
          <h1>{lang === 'ur' ? 'میرے ٹرپس اور بولیوں کی تفصیلات' : 'My Booked Trips & Active Bids'}</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setShowPoliceModal(true)} className="btn btn-warning btn-sm" title="Launch Roadside Police Inspection Mode">
            👮 NHMP Police Inspection Mode
          </button>
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
                {biltyEnabled && (
                  <button onClick={() => handleOpenBilty(t)} className="btn btn-glass btn-sm" style={{ flex: 1 }}>
                    📜 {lang === 'ur' ? 'بلٹی دیکھیں' : 'View Bilty'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Active Trip Control Center */}
        {activeTrip ? (
          <div className={`${styles.activeTripPanel} glass-card`}>
            <div className={styles.panelHeader}>
              <div>
                <h3>🚚 Active Trip Command Center — {activeTrip.id}</h3>
                <p>Shipper: {activeTrip.shipper} | Route: {activeTrip.route}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {biltyEnabled && (
                  <button onClick={() => handleOpenBilty(activeTrip)} className="btn btn-glass btn-sm">
                    📜 {lang === 'ur' ? 'بلٹی رسید دیکھیں' : 'View Digital Bilty'}
                  </button>
                )}
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
                <small style={{ color: '#F59E0B' }}>JazzCash Wallet Paid</small>
              </div>
            </div>

            {/* Trip Lifecycle Progress Stepper */}
            <div style={{ margin: '1.25rem 0', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '0.75rem' }}>
                🚚 Trip Status Progression (ٹرپ کی موجودہ صورتحال):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: activeTrip.status === 'assigned' ? '#3B82F6' : '#1E293B', color: activeTrip.status === 'assigned' ? '#FFF' : '#94A3B8', fontWeight: activeTrip.status === 'assigned' ? 800 : 400 }}>
                  1. Assigned
                </div>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: activeTrip.status === 'at_pickup' ? '#F59E0B' : '#1E293B', color: activeTrip.status === 'at_pickup' ? '#FFF' : '#94A3B8', fontWeight: activeTrip.status === 'at_pickup' ? 800 : 400 }}>
                  2. At Pickup Gate
                </div>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: activeTrip.status === 'in_transit' ? '#0284C7' : '#1E293B', color: activeTrip.status === 'in_transit' ? '#FFF' : '#94A3B8', fontWeight: activeTrip.status === 'in_transit' ? 800 : 400 }}>
                  3. In Transit
                </div>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: activeTrip.status === 'delivered' ? '#10B981' : '#1E293B', color: activeTrip.status === 'delivered' ? '#FFF' : '#94A3B8', fontWeight: activeTrip.status === 'delivered' ? 800 : 400 }}>
                  4. Delivered ✅
                </div>
              </div>
            </div>

            {/* Interactive Status Advancement & Complete Trip Action Controls */}
            <div style={{ marginTop: '1rem' }}>
              {activeTrip.status === 'assigned' && (
                <button onClick={() => handleAdvanceTripStatus('at_pickup')} className="btn btn-warning" style={{ width: '100%', padding: '0.85rem' }}>
                  📍 Mark Arrived at Factory / Pickup Gate
                </button>
              )}
              {activeTrip.status === 'at_pickup' && (
                <button onClick={() => handleAdvanceTripStatus('in_transit')} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                  🚛 Start Transit / Depart for Destination
                </button>
              )}
              {activeTrip.status === 'in_transit' && (
                <button onClick={() => setShowCompleteTripModal(true)} className="btn btn-success" style={{ width: '100%', padding: '0.85rem', background: '#10B981', borderColor: '#10B981', color: '#FFF', fontWeight: 800 }}>
                  ✅ Complete Trip & Upload Delivery Proof (ePOD / OTP)
                </button>
              )}
              {activeTrip.status === 'delivered' && (
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', color: '#10B981', fontWeight: 800 }}>🎉 TRIP COMPLETED & DELIVERED!</div>
                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '4px' }}>
                    100% Escrow freight payment (Rs. {activeTrip.price.toLocaleString()}) cleared. Digital ePOD generated.
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={`${styles.activeTripPanel} glass-card`} style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚚</div>
            <h3>{lang === 'ur' ? 'کوئی فعال سفر نہیں ہے' : 'No Active Trip Selected'}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {lang === 'ur' ? 'جب شپر آپ کی بولی یا ٹرک کو قبول کرے گا، یہاں ٹرپ کی تفصیلات اور بلٹی دکھائی دے گی۔' : 'When a load is booked or assigned, active trip command center and digital bilty will appear here.'}
            </p>
          </div>
        )}
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

      {/* NHMP HIGHWAY POLICE ROADSIDE INSPECTION MODAL */}
      {showPoliceModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '640px', border: '2px solid #F59E0B' }}>
            <div className={styles.modalHeader} style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
              <h3 style={{ color: '#F59E0B' }}>👮 NHMP Police Inspection Mode (موٹروے پولیس ہیلپ ڈیسک)</h3>
              <button onClick={() => setShowPoliceModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <div style={{ padding: '1.25rem', lineHeight: 1.6, color: '#F8FAFC' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', padding: '0.85rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ color: '#10B981', fontSize: '1.1rem' }}>✅ Officer Verified Driver & Carrier</strong>
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1' }}>SafarLoad Digital Verification Token: <strong>SL-POLICE-88421</strong></div>
                </div>
                <span style={{ fontSize: '2rem' }}>🇵🇰</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.9rem' }}>
                <div style={{ background: '#1E293B', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Driver Name:</div>
                  <strong>Tariq Mehmood</strong>
                </div>

                <div style={{ background: '#1E293B', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>CNIC Number:</div>
                  <strong>35201-1234567-1</strong>
                </div>

                <div style={{ background: '#1E293B', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Vehicle Registration:</div>
                  <strong>LHR-5678 (Trailer)</strong>
                </div>

                <div style={{ background: '#1E293B', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Commercial License (HTV):</div>
                  <strong style={{ color: '#10B981' }}>VALID & VERIFIED ✅</strong>
                </div>

                <div style={{ background: '#1E293B', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Vehicle Token Tax:</div>
                  <strong style={{ color: '#10B981' }}>PAID (June 2027)</strong>
                </div>

                <div style={{ background: '#1E293B', padding: '0.75rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Fitness Certificate:</div>
                  <strong style={{ color: '#10B981' }}>PASSED & VALID</strong>
                </div>
              </div>

              <div style={{ marginTop: '1rem', background: '#0F172A', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px dashed #334155' }}>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.4rem' }}>Digital Bilty QR & Manifest Verification:</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '4px', color: '#38BDF8' }}>║▌║█║▌│║▌║▌█</div>
                <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '0.2rem' }}>Cargo: 25 Tons Textile (Multan → Karachi)</div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowPoliceModal(false)} className="btn btn-primary">
                Done & Return to Trip Control
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP & EPOD DELIVERY PROOF MODAL */}
      {showCompleteTripModal && activeTrip && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '560px', border: '2px solid #10B981' }}>
            <div className={styles.modalHeader} style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
              <h3 style={{ color: '#10B981' }}>✅ Complete Trip & Upload Delivery Proof (ePOD / OTP)</h3>
              <button onClick={() => setShowCompleteTripModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleCompleteTripSubmit} style={{ padding: '1.25rem' }}>
              <div style={{ background: '#1E293B', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Trip Being Completed:</div>
                <strong style={{ fontSize: '1.05rem', color: '#10B981' }}>{activeTrip.id} — {activeTrip.route}</strong>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '2px' }}>
                  🏢 Shipper: <strong>{activeTrip.shipper}</strong> | 💰 70% Balance Release: <strong>Rs. {Math.round(activeTrip.price * 0.7).toLocaleString()}</strong>
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>
                  👤 Consignee / Receiver Person Name (وصول کنندہ کا نام):
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>
                  🔑 Digital Delivery OTP Verification Code (شپر کا OTP کوڈ):
                </label>
                <input
                  type="text"
                  value={deliveryOtpCode}
                  onChange={(e) => setDeliveryOtpCode(e.target.value)}
                  className="input input-lg"
                  placeholder="e.g. 4829"
                  style={{ fontWeight: 800, letterSpacing: '2px', color: '#F59E0B' }}
                  required
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  * Ask consignee/receiver at gate for their 4-digit SafarLoad Delivery Confirmation OTP.
                </span>
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>
                  📸 Upload Unloading Slip / ePOD Receipt Photo:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="file" accept="image/*,.pdf" className="input" style={{ flex: 1 }} />
                  <span className="badge badge-success">✅ Photo Attached</span>
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>
                  📋 Cargo Condition & Unloading Notes (مال کی صورتحال):
                </label>
                <textarea
                  value={cargoConditionNote}
                  onChange={(e) => setCargoConditionNote(e.target.value)}
                  className="input"
                  rows={2}
                  style={{ width: '100%' }}
                />
              </div>

              <div className={styles.modalActions} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCompleteTripModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#10B981', borderColor: '#10B981', color: '#FFF', fontWeight: 800 }}>
                  🚀 Submit ePOD & Release 70% Freight (Rs. {Math.round(activeTrip.price * 0.7).toLocaleString()})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL BILTY MODAL */}
      {biltyEnabled && selectedBilty && (
        <DigitalBiltyModal bilty={selectedBilty} onClose={() => setSelectedBilty(null)} />
      )}
    </div>
  );
}
