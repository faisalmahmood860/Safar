'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockLoads } from '@/lib/mockData';
import { translations, Language } from '@/lib/translations';

export default function LoadsPage() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];
  const isRtl = language === 'ur';
  
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [filterCityFrom, setFilterCityFrom] = useState('');
  const [filterCityTo, setFilterCityTo] = useState('');
  const [filterTruckType, setFilterTruckType] = useState('');
  
  // Interactive Modal & Booking State
  const [selectedLoad, setSelectedLoad] = useState<typeof mockLoads[0] | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bookedLoadIds, setBookedLoadIds] = useState<string[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ur' : 'en');
  };
  
  // Basic filtering
  const filteredLoads = mockLoads.filter(load => {
    const s = search.toLowerCase();
    const matchSearch = !search || 
      load.pickupCity.toLowerCase().includes(s) ||
      load.pickupCityUr.includes(s) ||
      load.dropoffCity.toLowerCase().includes(s) ||
      load.dropoffCityUr.includes(s) ||
      load.cargoType.toLowerCase().includes(s) ||
      load.cargoTypeUr.includes(s);
      
    const matchCityFrom = !filterCityFrom || load.pickupCity === filterCityFrom;
    const matchCityTo = !filterCityTo || load.dropoffCity === filterCityTo;
    const matchTruck = !filterTruckType || load.truckType === filterTruckType;
    
    return matchSearch && matchCityFrom && matchCityTo && matchTruck;
  });

  // Track driver bids per load ID
  const [driverBidsMap, setDriverBidsMap] = useState<Record<string, { price: number; note: string }>>({
    'LD-2026-001': { price: 178000, note: 'Ready to load today evening. Tarpaulin and belts ready.' }
  });

  const handleOpenLoadModal = (load: typeof mockLoads[0]) => {
    setSelectedLoad(load);
    const existingBid = driverBidsMap[load.id];
    setBidAmount(existingBid ? existingBid.price.toString() : load.price.toString());
    setBookingSuccess(false);
  };

  const handleConfirmBooking = () => {
    if (!selectedLoad) return;
    setBookedLoadIds(prev => [...prev, selectedLoad.id]);
    setBookingSuccess(true);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad) return;

    const newPrice = Number(bidAmount);
    const newBidObj = {
      id: `BID-${Date.now()}`,
      loadId: selectedLoad.id,
      loadTitle: `${selectedLoad.cargoType} — ${selectedLoad.pickupCity} to ${selectedLoad.dropoffCity}`,
      route: `${selectedLoad.pickupCity} → ${selectedLoad.dropoffCity}`,
      shipperName: selectedLoad.shipperName,
      driverName: 'Muhammad Aslam',
      driverNameUr: 'محمد اسلم',
      driverPhone: '+92 301 2345678',
      driverRating: 4.8,
      driverTrips: 456,
      truckNumber: 'LHR-5678',
      truckType: `${selectedLoad.truckType} (25 Tons)`,
      originalPrice: selectedLoad.price,
      offeredBidPrice: newPrice,
      bidMessage: 'Driver Counter Offer: Ready for immediate dispatch.',
      submittedTime: 'Just now',
      status: 'pending' as const,
      lastUpdatedBy: 'driver' as const
    };

    // Update local driver state
    setDriverBidsMap(prev => ({
      ...prev,
      [selectedLoad.id]: { price: newPrice, note: newBidObj.bidMessage }
    }));

    // Update global localStorage bids for Shipper sync
    try {
      const existingBidsJson = localStorage.getItem('safarload_global_bids');
      let currentBids = existingBidsJson ? JSON.parse(existingBidsJson) : [];
      // Replace existing bid for same load or add new
      currentBids = currentBids.filter((b: any) => b.loadId !== selectedLoad.id);
      currentBids.unshift(newBidObj);
      localStorage.setItem('safarload_global_bids', JSON.stringify(currentBids));
    } catch (err) {
      console.error(err);
    }

    alert(`🏷️ Bid of Rs. ${newPrice.toLocaleString()} submitted to ${selectedLoad.shipperName}! Shipper portal updated.`);
    setSelectedLoad(null);
  };
  
  return (
    <div className={styles.container} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{isRtl ? 'لوڈ بورڈ (دستیاب لوڈز)' : 'Load Board Marketplace'}</h1>
          <span className={styles.titleCount}>({filteredLoads.length} {isRtl ? 'لوڈز' : 'Loads Available'})</span>
        </div>
        
        <div className={styles.headerActions}>
          <button className={styles.langToggle} onClick={toggleLanguage}>
            🌐 {language === 'en' ? 'اردو' : 'English'}
          </button>
          
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`}
              onClick={() => setView('list')}
            >
              📋 {isRtl ? 'فہرست' : 'List'}
            </button>
            <button 
              className={`${styles.viewBtn} ${view === 'map' ? styles.active : ''}`}
              onClick={() => setView('map')}
            >
              🗺️ {isRtl ? 'نقشہ' : 'Map'}
            </button>
          </div>
          
          <button className={styles.micBtn} onClick={() => alert('🎤 Voice Search Activated: Speak city name in Urdu')}>
            🎤
          </button>
        </div>
      </header>
      
      {/* Search & Filters */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input 
            type="text" 
            className={styles.searchInput}
            placeholder={isRtl ? 'روٹ، شہر یا کارگو کے لحاظ سے سرچ کریں...' : 'Search loads by route, city, cargo type...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        
        <div className={styles.filtersBar}>
          <select 
            className={styles.filterSelect}
            value={filterCityFrom}
            onChange={(e) => setFilterCityFrom(e.target.value)}
          >
            <option value="">📍 {isRtl ? 'پک اپ شہر (تمام)' : 'From City (All)'}</option>
            <option value="Multan">Multan (ملتان)</option>
            <option value="Lahore">Lahore (لاہور)</option>
            <option value="Faisalabad">Faisalabad (فیصل آباد)</option>
            <option value="DG Khan">DG Khan (ڈی جی خان)</option>
            <option value="Larkana">Larkana (لاڑکانہ)</option>
          </select>
          
          <select 
            className={styles.filterSelect}
            value={filterCityTo}
            onChange={(e) => setFilterCityTo(e.target.value)}
          >
            <option value="">🏁 {isRtl ? 'ڈیلیوری شہر (تمام)' : 'To City (All)'}</option>
            <option value="Karachi">Karachi (کراچی)</option>
            <option value="Lahore">Lahore (لاہور)</option>
            <option value="Peshawar">Peshawar (پشاور)</option>
          </select>
          
          <select 
            className={styles.filterSelect}
            value={filterTruckType}
            onChange={(e) => setFilterTruckType(e.target.value)}
          >
            <option value="">🚛 {isRtl ? 'ٹرک کی قسم (تمام)' : 'Truck Type (All)'}</option>
            <option value="Trailer">Trailer (ٹریلر)</option>
            <option value="22-Wheeler">22-Wheeler (22 وہیلر)</option>
            <option value="Dumper">Dumper (ڈمپر)</option>
            <option value="Container">Container (کنٹینر)</option>
          </select>
          
          {(filterCityFrom || filterCityTo || filterTruckType) && (
            <button 
              className={styles.resetFiltersBtn}
              onClick={() => {
                setFilterCityFrom('');
                setFilterCityTo('');
                setFilterTruckType('');
              }}
            >
              🔄 {isRtl ? 'فلٹر صاف کریں' : 'Reset'}
            </button>
          )}
        </div>
      </div>

      {/* Load Cards Grid */}
      <div className={styles.grid}>
        {filteredLoads.map((load) => {
          const isBooked = bookedLoadIds.includes(load.id);
          return (
            <div key={load.id} className={`${styles.card} ${isBooked ? styles.bookedCard : ''}`}>
              <div className={styles.cardHeader}>
                <div className={styles.routeGroup}>
                  <span className={styles.city}>{isRtl ? load.pickupCityUr : load.pickupCity}</span>
                  <span className={styles.arrow}>➔</span>
                  <span className={styles.city}>{isRtl ? load.dropoffCityUr : load.dropoffCity}</span>
                </div>
                <div className={styles.badgesGroup}>
                  {isBooked ? (
                    <span className="badge badge-success">✅ Booked (بوک شدہ)</span>
                  ) : (
                    <>
                      {load.isUrgent && <span className={styles.badgeUrgent}>{isRtl ? 'فوری' : 'Urgent'}</span>}
                      {load.isBookNow && <span className={styles.badgeBookNow}>{isRtl ? 'فوری بکنگ' : 'Book Now'}</span>}
                    </>
                  )}
                </div>
              </div>
              
              <div className={styles.cargoInfo}>
                <span className={styles.cargoIcon}>{load.cargoIcon}</span>
                <span className={styles.cargoText}>
                  {isRtl ? load.cargoTypeUr : load.cargoType} • {load.weight} {isRtl ? 'ٹن' : 'Tons'}
                </span>
                <span className={styles.truckTag}>🚛 {isRtl ? load.truckTypeUr : load.truckType}</span>
              </div>
              
              <div className={styles.priceSection}>
                <div className={styles.priceMain}>
                  <span className={styles.currency}>Rs.</span>
                  <span className={styles.priceValue}>{load.price.toLocaleString()}</span>
                </div>
                <div className={styles.priceSub}>
                  Rs. {load.pricePerKm}/{isRtl ? 'کلومیٹر' : 'km'} • {load.distance} {isRtl ? 'کلومیٹر' : 'km'}
                </div>
              </div>
              
              <div className={styles.metaRow}>
                <span>📅 {load.pickupDate} ({load.pickupTime})</span>
                <span>⏱️ Est. {load.estimatedHours} hrs</span>
              </div>
              
              <div className={styles.shipperRow}>
                <div className={styles.shipperMeta}>
                  <span className={styles.shipperName}>{load.shipperName}</span>
                  <span className={styles.shipperRating}>⭐ {load.shipperRating} ({load.shipperLoads} {isRtl ? 'لوڈز' : 'loads'})</span>
                </div>
                {load.shipperVerified && <span className={styles.verifiedBadge} title="CNIC Verified">✅</span>}
              </div>
              
              <div className={styles.cardActions}>
                <button className={styles.btnDetails} onClick={() => handleOpenLoadModal(load)}>
                  {isRtl ? 'تفصیلات دیکھیں' : 'View Details'}
                </button>
                
                {isBooked ? (
                  <Link href="/dashboard/trips" className="btn btn-success btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                    🚛 Track Trip →
                  </Link>
                ) : (
                  <button className={styles.btnApply} onClick={() => handleOpenLoadModal(load)}>
                    ⚡ {isRtl ? 'ابھی بک کریں' : 'Book / Bid'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE LOAD BOOKING & BIDDING MODAL */}
      {selectedLoad && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <div>
                <h2>{selectedLoad.title}</h2>
                <span className={styles.loadIdTag}>Load ID: {selectedLoad.id}</span>
              </div>
              <button onClick={() => setSelectedLoad(null)} className={styles.closeBtn}>✕</button>
            </div>

            {bookingSuccess ? (
              <div className={styles.successBox}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h3>{isRtl ? 'لوڈ کاملیت کے ساتھ بک ہو گیا!' : 'Load Booked Successfully!'}</h3>
                <p>
                  {isRtl
                    ? `آپ نے ${selectedLoad.pickupCity} سے ${selectedLoad.dropoffCity} کا لوڈ بک کر لیا ہے۔`
                    : `You have successfully booked cargo from ${selectedLoad.pickupCity} to ${selectedLoad.dropoffCity}.`}
                </p>
                <div className={styles.successActions}>
                  <Link href="/dashboard/trips" className="btn btn-primary btn-lg">
                    🚛 {isRtl ? 'میرے سفر میں دیکھیں' : 'Go to My Booked Trips'}
                  </Link>
                  <button onClick={() => setSelectedLoad(null)} className="btn btn-glass">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.modalBody}>
                {/* Route & Cargo Specs */}
                <div className={styles.routeSpecBox}>
                  <div className={styles.specItem}>
                    <span>📍 Pickup Address:</span>
                    <strong>{selectedLoad.pickupAddress} ({selectedLoad.pickupCity})</strong>
                  </div>
                  <div className={styles.specItem}>
                    <span>🏁 Dropoff Address:</span>
                    <strong>{selectedLoad.dropoffAddress} ({selectedLoad.dropoffCity})</strong>
                  </div>
                  <div className={styles.specItem}>
                    <span>📦 Cargo & Weight:</span>
                    <strong>{selectedLoad.cargoType} ({selectedLoad.weight} Tons)</strong>
                  </div>
                  <div className={styles.specItem}>
                    <span>🚛 Required Truck:</span>
                    <strong>{selectedLoad.truckType}</strong>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className={styles.reqsBox}>
                  <span>⚠️ Special Driver Requirements:</span>
                  <div className={styles.reqChips}>
                    {selectedLoad.specialRequirements.map((r, i) => (
                      <span key={i} className={styles.reqChip}>✅ {r}</span>
                    ))}
                  </div>
                </div>

                {/* Instant Booking or Submit Bid */}
                <div className={styles.actionTabsBox}>
                  <div className={styles.instantBookingBox}>
                    <h4>⚡ Instant Fixed Booking</h4>
                    <div className={styles.priceDisplay}>
                      Rs. {selectedLoad.price.toLocaleString()}
                    </div>
                    <button onClick={handleConfirmBooking} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                      ⚡ Confirm Booking Now (ابھی بوک کریں)
                    </button>
                  </div>

                  <div className={styles.biddingBox}>
                    <h4>🏷️ Or Submit Counter Bid</h4>
                    <form onSubmit={handleSubmitBid}>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Your Rate Bid (PKR):</label>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="input"
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                        📩 Submit Bid to Shipper
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
