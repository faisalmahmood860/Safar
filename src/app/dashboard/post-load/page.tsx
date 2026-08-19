'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import DigitalBiltyModal, { BiltyData } from '@/components/DigitalBiltyModal';
import { mockDriverCounterBids, mockDriverAvailabilities, DriverCounterBid, DriverAvailabilityBroadcast, pakistaniCities } from '@/lib/mockData';

export default function PostLoadPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('ur');
  const [selectedBilty, setSelectedBilty] = useState<BiltyData | null>(null);

  const handleOpenBilty = (b: DriverCounterBid) => {
    setSelectedBilty({
      biltyNumber: `BLT-2026-${b.id.replace('BID-', '')}`,
      date: '2026-08-19',
      consignorName: 'Noor Textile Mills Ltd',
      consignorCnic: '35202-9842107-1',
      consignorPhone: '+92 42 35789000',
      pickupAddress: 'Industrial Estate Gate 3, Multan',
      consigneeName: 'Pak Cotton Trading Co.',
      consigneeCnic: '42201-1122334-9',
      consigneePhone: '+92 21 34567890',
      dropoffAddress: 'Port Qasim, Bin Qasim Town, Karachi',
      driverName: b.driverName,
      driverCnic: '35201-1234567-1',
      driverPhone: b.driverPhone,
      truckNumber: b.truckNumber,
      truckType: b.truckType,
      cargoDescription: b.loadTitle,
      packageCount: '500 Bales',
      weightTons: '25',
      declaredValuePkr: 4500000,
      totalFreightPkr: b.offeredBidPrice,
      paymentTerm: '30% Advance + 70% Delivery Pay',
      tollsIncluded: true,
      challanProtected: true,
    });
  };
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [voicePosting, setVoicePosting] = useState(false);
  const [loadPostedSuccess, setLoadPostedSuccess] = useState(false);
  const [bids, setBids] = useState<DriverCounterBid[]>(mockDriverCounterBids);
  const [availabilities] = useState<DriverAvailabilityBroadcast[]>(mockDriverAvailabilities);

  // Sync bids with localStorage on mount & update
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('safarload_global_bids');
      if (stored) {
        setBids(JSON.parse(stored));
      } else {
        localStorage.setItem('safarload_global_bids', JSON.stringify(mockDriverCounterBids));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveBidsToStorage = (updatedBids: DriverCounterBid[]) => {
    setBids(updatedBids);
    try {
      localStorage.setItem('safarload_global_bids', JSON.stringify(updatedBids));
    } catch (e) {
      console.error(e);
    }
  };

  // Shipper Counter-Counter Bid Modal State
  const [counterBidTarget, setCounterBidTarget] = useState<DriverCounterBid | null>(null);
  const [shipperRevisedPrice, setShipperRevisedPrice] = useState<string>('');
  const [shipperCounterNote, setShipperCounterNote] = useState<string>('Final offer: Tolls included, loading labor on site.');

  // Direct Driver Chat Modal State
  const [chatTargetDriver, setChatTargetDriver] = useState<DriverCounterBid | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'driver', text: 'Assalam-o-Alaikum! Pickup truck is ready in Multan.', time: '02:30 PM' },
    { sender: 'shipper', text: 'Walaikum Assalam! Please arrive at Gate 3 Bosan Road.', time: '02:32 PM' }
  ]);
  const [chatInputText, setChatInputText] = useState('');

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

  // Shipper Filter State (Default: Noor Textile Mills)
  const [currentShipperName] = useState('Noor Textile Mills');
  const [shipperTab, setShipperTab] = useState<'pending' | 'booked' | 'escrow'>('pending');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('200000');

  const handleReleaseFinalEscrow = (bidId: string) => {
    alert(`⚡ 70% Final Settlement Escrow Released for load ${bidId}!\nFunds transferred to driver's verified account. Tax invoice generated.`);
  };

  const handleReportShortageDispute = (bidId: string) => {
    alert(`⚠️ Shortage / Damage Claim logged for shipment ${bidId}!\n70% Escrow balance held in Vault. SafarLoad Support Inspection Agent assigned.`);
  };

  // Enhanced AI Agent Deal Lock Modal State
  const [agentDealTarget, setAgentDealTarget] = useState<DriverAvailabilityBroadcast | null>(null);
  const [aiPickupCity, setAiPickupCity] = useState('Karachi');
  const [aiDropoffCity, setAiDropoffCity] = useState('Multan');
  const [aiProposedPrice, setAiProposedPrice] = useState('180000');
  const [aiTollIncluded, setAiTollIncluded] = useState(true);
  const [aiChallanProtected, setAiChallanProtected] = useState(true);
  const [aiLaborIncluded, setAiLaborIncluded] = useState(true);
  const [aiFuelAdvance, setAiFuelAdvance] = useState(true);

  const handleOpenAiAgentModal = (avail: DriverAvailabilityBroadcast) => {
    setAgentDealTarget(avail);
    setAiPickupCity(avail.currentCity);
    setAiDropoffCity(avail.preferredDestination.includes('Multan') ? 'Multan' : 'Lahore');
    setAiProposedPrice('180000');
  };

  const handleAcceptBid = (bidId: string) => {
    const targetBid = bids.find(b => b.id === bidId);
    const updated = bids.map((b) => (b.id === bidId ? { ...b, status: 'accepted' as const } : b));
    saveBidsToStorage(updated);

    // Save booked load ID to localStorage so it is removed from Driver Find Loads Board
    if (targetBid) {
      try {
        const storedBooked = localStorage.getItem('safarload_booked_loads');
        const bookedArr: string[] = storedBooked ? JSON.parse(storedBooked) : [];
        if (!bookedArr.includes(targetBid.loadId)) {
          bookedArr.push(targetBid.loadId);
          localStorage.setItem('safarload_booked_loads', JSON.stringify(bookedArr));
        }
      } catch (e) {
        console.error(e);
      }
    }

    alert(`✅ Driver Counter Bid ACCEPTED! Load assigned, Escrow payment locked, and load moved to Booked Trips. Auto-removed from Driver Find Loads board.`);
  };

  const handleRejectBid = (bidId: string) => {
    const updated = bids.map((b) => (b.id === bidId ? { ...b, status: 'rejected' as const } : b));
    saveBidsToStorage(updated);
  };

  const handleOpenCounterBackModal = (bid: DriverCounterBid) => {
    setCounterBidTarget(bid);
    setShipperRevisedPrice((bid.offeredBidPrice + 3000).toString());
  };

  const handleSendShipperCounterOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterBidTarget) return;

    const revisedPrice = Number(shipperRevisedPrice);
    const updated = bids.map((b) =>
      b.id === counterBidTarget.id
        ? {
            ...b,
            shipperCounterPrice: revisedPrice,
            shipperCounterNote,
            bidMessage: `Shipper Counter Offer: Rs. ${revisedPrice.toLocaleString()} (${shipperCounterNote})`,
            lastUpdatedBy: 'shipper' as const,
          }
        : b
    );

    saveBidsToStorage(updated);
    alert(`🔄 Revised Counter Offer of Rs. ${revisedPrice.toLocaleString()} sent back to driver ${counterBidTarget.driverName}! Driver dashboard updated.`);
    setCounterBidTarget(null);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        sender: 'shipper',
        text: chatInputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setChatInputText('');
  };

  const handleInitiateAgentDealLock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentDealTarget) return;

    const newDealBid: DriverCounterBid = {
      id: `BID-AI-${Date.now()}`,
      loadId: `LD-AI-${Date.now()}`,
      loadTitle: `Return Trip — ${aiPickupCity} to ${aiDropoffCity}`,
      route: `${aiPickupCity} → ${aiDropoffCity}`,
      shipperName: currentShipperName,
      driverName: agentDealTarget.driverName,
      driverNameUr: agentDealTarget.driverNameUr,
      driverPhone: agentDealTarget.driverPhone,
      driverRating: agentDealTarget.driverRating,
      driverTrips: 340,
      truckNumber: agentDealTarget.truckNumber,
      truckType: agentDealTarget.truckType,
      originalPrice: Number(aiProposedPrice),
      offeredBidPrice: Number(aiProposedPrice),
      bidMessage: `AI Agent Negotiated Deal: Route ${aiPickupCity} → ${aiDropoffCity}. Inclusions: Tolls ${aiTollIncluded ? 'Yes' : 'No'}, Challan ${aiChallanProtected ? 'Yes' : 'No'}, Fuel Advance ${aiFuelAdvance ? 'Yes' : 'No'}`,
      submittedTime: 'Just now',
      status: 'accepted',
      lastUpdatedBy: 'shipper'
    };

    saveBidsToStorage([newDealBid, ...bids]);

    // Save to booked loads so it removes from public board
    try {
      const storedBooked = localStorage.getItem('safarload_booked_loads');
      const bookedArr: string[] = storedBooked ? JSON.parse(storedBooked) : [];
      bookedArr.push(newDealBid.loadId);
      localStorage.setItem('safarload_booked_loads', JSON.stringify(bookedArr));
    } catch (e) {
      console.error(e);
    }

    alert(
      `🤖 SafarLoad AI Matchmaker & Broker Agent Deal LOCKED!\nDriver: ${agentDealTarget.driverName} (${agentDealTarget.truckNumber})\nRoute: ${aiPickupCity} → ${aiDropoffCity}\nAgreed Rate: Rs. ${Number(aiProposedPrice).toLocaleString()}\n\nEscrow payment locked. Load assigned and moved to Booked Trips!`
    );
    setAgentDealTarget(null);
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

      {/* INCOMING DRIVER COUNTER BIDS SECTION & BOOKED TRIPS */}
      <section className={`${styles.bidsSection} glass-card`}>
        <div className={styles.bidsHeader}>
          <div>
            <h3>🏢 {currentShipperName} — Freight Bids & Booked Shipments</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Scoped strictly to {currentShipperName} loads</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShipperTab('pending')}
              className={`btn ${shipperTab === 'pending' ? 'btn-primary' : 'btn-glass'} btn-sm`}
            >
              🏷️ Pending Bids ({bids.filter((b) => b.shipperName === currentShipperName && b.status === 'pending').length})
            </button>
            <button
              onClick={() => setShipperTab('booked')}
              className={`btn ${shipperTab === 'booked' ? 'btn-primary' : 'btn-glass'} btn-sm`}
            >
              ✅ Booked & En Route ({bids.filter((b) => b.shipperName === currentShipperName && b.status === 'accepted').length})
            </button>
            <button
              onClick={() => setShipperTab('escrow')}
              className={`btn ${shipperTab === 'escrow' ? 'btn-primary' : 'btn-glass'} btn-sm`}
            >
              🛡️ Escrow Hub (ایسکرو ہب)
            </button>
          </div>
        </div>

        {shipperTab === 'escrow' ? (
          /* SHIPPER ESCROW CONTROL HUB PANEL */
          <div className="animate-fadeIn" style={{ padding: '0.5rem 0' }}>
            {/* ESCROW STATS OVERVIEW CARDS */}
            <div className={styles.rowGrid} style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <div className="stat-card-icon">🛡️</div>
                <div className="stat-card-value">Rs. 420,000</div>
                <div className="stat-card-label">Active Escrow Vault Balance</div>
                <div className="stat-card-change positive">100% Protected Guarantee</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-icon">⛽</div>
                <div className="stat-card-value">Rs. 126,000</div>
                <div className="stat-card-label">30% Fuel Advances Released</div>
                <div className="stat-card-change positive">Paid to Driver JazzCash</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-icon">🔒</div>
                <div className="stat-card-value">Rs. 294,000</div>
                <div className="stat-card-label">70% Final Delivery Balances</div>
                <div className="stat-card-change positive">Locked Pending Unloading</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-icon">🧾</div>
                <div className="stat-card-value">Rs. 16,800</div>
                <div className="stat-card-label">Platform Fee (4%) & WHT</div>
                <div className="stat-card-change positive">Tax Receipt Ready</div>
              </div>
            </div>

            {/* DEPOSIT ACTION BANNER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10B981', padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ color: '#10B981', fontSize: '1.05rem' }}>🔒 SafarLoad Bank & JazzCash Escrow Protection</strong>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#CBD5E1' }}>
                  Shipper deposits are held safely in Escrow. 30% fuel advance is auto-paid upon Bilty pickup, and 70% final balance is released upon OTP delivery code.
                </p>
              </div>
              <button onClick={() => setShowDepositModal(true)} className="btn btn-primary btn-sm">
                💳 + Deposit Funds to Escrow Vault
              </button>
            </div>

            {/* TRANCHE ESCROW TRANSACTIONS TABLE */}
            <div className="tableContainer">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shipment ID & Route</th>
                    <th>Driver & Vehicle</th>
                    <th>Total Freight</th>
                    <th>30% Fuel Advance (Tranche 1)</th>
                    <th>70% Delivery Balance (Tranche 2)</th>
                    <th>Delivery Proof</th>
                    <th>Escrow Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bids
                    .filter((b) => b.shipperName === currentShipperName && b.status === 'accepted')
                    .map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.loadTitle}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>📍 {b.route}</div>
                        </td>
                        <td>
                          👨‍✈️ {b.driverName}
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>🚛 {b.truckNumber} ({b.truckType})</div>
                        </td>
                        <td><strong>Rs. {b.offeredBidPrice.toLocaleString()}</strong></td>
                        <td>
                          <span className="badge badge-success">
                            Rs. {(b.offeredBidPrice * 0.3).toLocaleString()} (Paid JazzCash ✅)
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-warning">
                            Rs. {(b.offeredBidPrice * 0.7).toLocaleString()} (Vault Locked 🔒)
                          </span>
                        </td>
                        <td>
                          <button onClick={() => handleOpenBilty(b)} className="btn btn-glass btn-sm">
                            📜 Bilty Verified ✅
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button onClick={() => handleReleaseFinalEscrow(b.id)} className="btn btn-primary btn-sm">
                              ⚡ Release 70% Escrow
                            </button>
                            <button onClick={() => handleReportShortageDispute(b.id)} className="btn btn-accent btn-sm">
                              ⚠️ Hold / Shortage Claim
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={styles.bidsGrid}>
            {bids
              .filter((b) => b.shipperName === currentShipperName && (shipperTab === 'pending' ? b.status === 'pending' : b.status === 'accepted'))
              .map((b) => (
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
                          ✅ {lang === 'ur' ? 'بولی قبول کریں' : 'Accept Bid'}
                        </button>
                        <button onClick={() => handleOpenCounterBackModal(b)} className="btn btn-secondary btn-sm">
                          🔄 {lang === 'ur' ? 'جوابی آفر بھیجیں' : 'Counter Back'}
                        </button>
                        <button onClick={() => handleRejectBid(b.id)} className="btn btn-accent btn-sm">
                          ❌ {lang === 'ur' ? 'مسترد' : 'Reject'}
                        </button>
                      </>
                    )}
                    {b.status === 'accepted' && (
                      <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}>
                        <span className="badge badge-success" style={{ flex: 1, textAlign: 'center' }}>✅ Booked & Escrow Locked!</span>
                        <button onClick={() => setChatTargetDriver(b)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                          💬 Chat with Driver ({b.driverName})
                        </button>
                        <button onClick={() => handleOpenBilty(b)} className="btn btn-glass btn-sm" style={{ flex: 1 }}>
                          📜 {lang === 'ur' ? 'بلٹی دیکھیں' : 'View Bilty'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* DRIVER AVAILABILITY STREAM (RETURN TRIPS RADAR - AI & AGENT MATCHING) */}
      <section className={`${styles.availSection} glass-card`}>
        <div className={styles.availHeader}>
          <div>
            <h3>🟢 {lang === 'ur' ? 'خالی گاڑی اور ریٹرن روٹ ڈرائیور رڈار' : 'Available Driver Return Radar Stream'}</h3>
            <p>{lang === 'ur' ? 'ہماری AI یا سفرلوڈ ایجنٹ کے ذریعے ڈرائیور سے محفوظ ڈیل کریں (براہ راست نمبر افشا نہیں ہوتا)' : 'Protected negotiation via SafarLoad AI System & Dispatcher Agent.'}</p>
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
                  onClick={() => setAgentDealTarget(a)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  🤖 {lang === 'ur' ? 'AI / ایجنٹ کے ذریعے ڈیل مکمل کریں' : 'AI & Agent Deal Lock'}
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
                <span className="badge badge-warning">{bids.filter((b) => b.status === 'pending').length} New</span>
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
                          <button onClick={() => handleAcceptBid(b.id)} className="btn btn-primary btn-sm">
                            ✅ Accept
                          </button>
                          <button onClick={() => handleOpenCounterBackModal(b)} className="btn btn-secondary btn-sm">
                            🔄 Counter
                          </button>
                          <button onClick={() => handleRejectBid(b.id)} className="btn btn-accent btn-sm">
                            ❌
                          </button>
                        </>
                      ) : (
                        <span className="badge badge-success" style={{ width: '100%', textAlign: 'center' }}>
                          ✅ Accepted — Escrow Locked!
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

      {/* SHIPPER COUNTER-COUNTER BID MODAL */}
      {counterBidTarget && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🔄 Send Counter Offer to Driver — {counterBidTarget.driverName}</h3>
              <button onClick={() => setCounterBidTarget(null)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSendShipperCounterOffer}>
              <div className={styles.routeSpecBox}>
                <div><span>Driver Offered Rate:</span> <strong>Rs. {counterBidTarget.offeredBidPrice.toLocaleString()}</strong></div>
                <div><span>Driver Vehicle:</span> <strong>{counterBidTarget.truckNumber} ({counterBidTarget.truckType})</strong></div>
              </div>

              <div className={styles.inputGroup}>
                <label>Your Revised Shipper Counter Offer (PKR):</label>
                <input
                  type="number"
                  value={shipperRevisedPrice}
                  onChange={(e) => setShipperRevisedPrice(e.target.value)}
                  className="input input-lg"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Terms Note to Driver (مجموعی شرائط):</label>
                <input
                  type="text"
                  value={shipperCounterNote}
                  onChange={(e) => setShipperCounterNote(e.target.value)}
                  className="input"
                  placeholder="e.g. Final offer: Tolls included, loading labor on site."
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setCounterBidTarget(null)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  📩 Send Revised Counter Offer to Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI MATCHMAKER & AGENT DEAL LOCK MODAL */}
      {agentDealTarget && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>🤖 SafarLoad AI Matchmaker & Broker Agent Negotiation</h3>
              <button onClick={() => setAgentDealTarget(null)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleInitiateAgentDealLock}>
              <div className={styles.aiNoticeBox}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', color: '#10B981' }}>🛡️ SafarLoad Protected Deal Matchmaker</div>
                <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0 }}>
                  Our AI system and dispatcher agents will negotiate with driver <strong>{agentDealTarget.driverName} ({agentDealTarget.truckNumber})</strong> on your behalf, verify CNIC documents, and lock Escrow.
                </p>
              </div>

              {/* ROUTE SELECTION */}
              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label>📍 Pickup City (پک اپ شہر):</label>
                  <select value={aiPickupCity} onChange={(e) => setAiPickupCity(e.target.value)} className="input">
                    {pakistaniCities.map((c) => (
                      <option key={c.en} value={c.en}>{c.en} ({c.ur})</option>
                    ))}
                    <option value="custom">➕ Add Custom City...</option>
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>🏁 Delivery Destination (ڈیلیوری شہر):</label>
                  <select value={aiDropoffCity} onChange={(e) => setAiDropoffCity(e.target.value)} className="input">
                    {pakistaniCities.map((c) => (
                      <option key={c.en} value={c.en}>{c.en} ({c.ur})</option>
                    ))}
                    <option value="custom">➕ Add Custom City...</option>
                  </select>
                </div>
              </div>

              {/* RATE PROPOSAL */}
              <div className={styles.inputGroup}>
                <label>💰 Proposed Freight Rate (PKR - پیش کردہ کرایہ):</label>
                <input
                  type="number"
                  value={aiProposedPrice}
                  onChange={(e) => setAiProposedPrice(e.target.value)}
                  className="input input-lg"
                  required
                />
              </div>

              {/* EXPENSE INCLUSIONS CHECKLIST */}
              <div className={styles.inclusionsSection} style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px' }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                  📋 Expense Inclusions Checklist (اخراجات شامل ہیں):
                </label>
                <div className={styles.checkboxGrid}>
                  <label className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={aiTollIncluded}
                      onChange={(e) => setAiTollIncluded(e.target.checked)}
                    />
                    <span>🛣️ Toll Plaza Taxes Included</span>
                  </label>
                  <label className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={aiChallanProtected}
                      onChange={(e) => setAiChallanProtected(e.target.checked)}
                    />
                    <span>👮 Highway Police Challan Protection</span>
                  </label>
                  <label className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={aiLaborIncluded}
                      onChange={(e) => setAiLaborIncluded(e.target.checked)}
                    />
                    <span>👷 Loading Labor Included</span>
                  </label>
                  <label className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={aiFuelAdvance}
                      onChange={(e) => setAiFuelAdvance(e.target.checked)}
                    />
                    <span>⛽ 30% JazzCash Fuel Advance</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setAgentDealTarget(null)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  ⚡ Confirm AI Agent Negotiation & Lock Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT CHAT DRAWER MODAL FOR ACCEPTED BID */}
      {chatTargetDriver && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.chatCard} glass-card animate-scaleIn`}>
            <div className={styles.chatHeader}>
              <div>
                <h3>💬 Direct Chat: 👨‍✈️ {chatTargetDriver.driverName} ({chatTargetDriver.driverNameUr})</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Vehicle: {chatTargetDriver.truckNumber} | Route: {chatTargetDriver.route}</span>
              </div>
              <button onClick={() => setChatTargetDriver(null)} className={styles.closeBtn}>✕</button>
            </div>

            <div className={styles.chatBody}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${styles.chatBubble} ${msg.sender === 'shipper' ? styles.sentBubble : styles.receivedBubble}`}
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
                placeholder="Type message to driver..."
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

      {/* DEPOSIT ESCROW FUNDS MODAL */}
      {showDepositModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <h3>💳 Deposit Funds into SafarLoad Escrow Vault</h3>
              <button onClick={() => setShowDepositModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              alert(`✅ Escrow Vault Top Up Received!\nRs. ${Number(depositAmount).toLocaleString()} deposited via Bank Direct Escrow Transfer.\nVault Balance Updated.`);
              setShowDepositModal(false);
            }}>
              <div className={styles.inputGroup}>
                <label>Deposit Amount (PKR - رقم درج کریں):</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="input input-lg"
                  required
                />
              </div>

              <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '10px', margin: '1rem 0', fontSize: '0.85rem' }}>
                <strong style={{ color: '#F59E0B' }}>🏛️ Bank Escrow Deposit Account:</strong>
                <p style={{ margin: '4px 0 0', color: '#CBD5E1' }}>Bank: Meezan Bank Ltd (Corporate Freight Escrow Branch)</p>
                <p style={{ margin: '2px 0 0', color: '#CBD5E1' }}>Account Title: SafarLoad Pakistan Pvt Ltd (Escrow Vault)</p>
                <p style={{ margin: '2px 0 0', color: '#CBD5E1' }}>IBAN: PK42 MEZN 0001 9842 1074 0102</p>
                <p style={{ margin: '2px 0 0', color: '#10B981' }}>JazzCash Business Merchant Till ID: 0984210</p>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowDepositModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💳 Confirm Bank Escrow Top Up
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
