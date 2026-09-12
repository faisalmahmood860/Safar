'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockLoads } from '@/lib/mockData';
import { translations, Language } from '@/lib/translations';
import { triggerBidSubmittedNotification, triggerDriverAvailableNotification } from '@/lib/notificationSystem';
import { apiClient } from '@/lib/apiClient';

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
  const [selectedVehicle, setSelectedVehicle] = useState('LHR-5678 (Flatbed Trailer)');
  const [selectedDriverName, setSelectedDriverName] = useState('Muhammad Aslam (+92 301 2345678)');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ur' : 'en');
  };
  
  // Dynamic Loads State & Real-time Sync
  const [allLoads, setAllLoads] = useState<any[]>(mockLoads);
  const [editingLoadTarget, setEditingLoadTarget] = useState<any | null>(null);

  const loadAllLoadsFromStorage = async () => {
    try {
      const res = await apiClient.getLoads({ status: 'all', limit: 100 });
      if (res && res.success && res.data && res.data.length > 0) {
        setAllLoads(res.data);
        return;
      }
    } catch {
      // Fallback to localStorage if offline/local
    }

    try {
      const stored = localStorage.getItem('safarload_global_posted_loads');
      const deletedStr = localStorage.getItem('safarload_deleted_loads');
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];

      const userLoads: any[] = stored ? JSON.parse(stored) : [];
      const combinedMap = new Map<string, any>();
      userLoads.forEach((l) => combinedMap.set(l.id, l));
      mockLoads.forEach((l) => {
        if (!combinedMap.has(l.id)) combinedMap.set(l.id, l);
      });

      const list = Array.from(combinedMap.values()).filter((l) => !deletedIds.includes(l.id));
      setAllLoads(list);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    loadAllLoadsFromStorage();

    try {
      const storedBooked = localStorage.getItem('safarload_booked_loads');
      if (storedBooked) {
        setBookedLoadIds(JSON.parse(storedBooked));
      }
    } catch (e) {
      console.error(e);
    }

    const handleSyncLoads = () => {
      loadAllLoadsFromStorage();
      try {
        const storedBooked = localStorage.getItem('safarload_booked_loads');
        if (storedBooked) {
          setBookedLoadIds(JSON.parse(storedBooked));
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('storage', handleSyncLoads);
    window.addEventListener('safarload_loads_change', handleSyncLoads);
    return () => {
      window.removeEventListener('storage', handleSyncLoads);
      window.removeEventListener('safarload_loads_change', handleSyncLoads);
    };
  }, []);

  const handleDeleteLoad = (loadId: string) => {
    if (!confirm(`Are you sure you want to delete / cancel load posting ${loadId}?`)) return;

    try {
      // Async database deletion
      apiClient.deleteLoad(loadId).catch(console.error);

      const stored = localStorage.getItem('safarload_global_posted_loads');
      let currentList = stored ? JSON.parse(stored) : [];
      currentList = currentList.filter((l: any) => l.id !== loadId);
      localStorage.setItem('safarload_global_posted_loads', JSON.stringify(currentList));

      const deletedStr = localStorage.getItem('safarload_deleted_loads');
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedIds.includes(loadId)) {
        deletedIds.push(loadId);
        localStorage.setItem('safarload_deleted_loads', JSON.stringify(deletedIds));
      }

      setAllLoads(prev => prev.filter(l => l.id !== loadId));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_loads_change'));
      }
      alert(`🗑️ Load ${loadId} deleted successfully from the Load Board!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEditedLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoadTarget) return;

    try {
      const stored = localStorage.getItem('safarload_global_posted_loads');
      let currentList: any[] = stored ? JSON.parse(stored) : [...mockLoads];

      let found = false;
      const updatedList = currentList.map((l: any) => {
        if (l.id === editingLoadTarget.id) {
          found = true;
          return {
            ...l,
            ...editingLoadTarget,
            title: `${editingLoadTarget.cargoType} — ${editingLoadTarget.pickupCity} to ${editingLoadTarget.dropoffCity}`,
            weight: `${editingLoadTarget.weightTons || editingLoadTarget.weight} Tons`,
            price: Number(editingLoadTarget.price),
          };
        }
        return l;
      });

      if (!found) {
        updatedList.unshift({
          ...editingLoadTarget,
          title: `${editingLoadTarget.cargoType} — ${editingLoadTarget.pickupCity} to ${editingLoadTarget.dropoffCity}`,
          weight: `${editingLoadTarget.weightTons || editingLoadTarget.weight} Tons`,
          price: Number(editingLoadTarget.price),
        });
      }

      localStorage.setItem('safarload_global_posted_loads', JSON.stringify(updatedList));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_loads_change'));
      }

      alert(`✏️ Load ${editingLoadTarget.id} updated successfully! Public Load Board updated.`);
      setEditingLoadTarget(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtering (Hides booked shipments)
  const filteredLoads = allLoads.filter(load => {
    if (bookedLoadIds.includes(load.id)) return false;

    const s = search.toLowerCase();
    const matchSearch = !search || 
      load.pickupCity.toLowerCase().includes(s) ||
      (load.pickupCityUr && load.pickupCityUr.includes(s)) ||
      load.dropoffCity.toLowerCase().includes(s) ||
      (load.dropoffCityUr && load.dropoffCityUr.includes(s)) ||
      load.cargoType.toLowerCase().includes(s) ||
      (load.cargoTypeUr && load.cargoTypeUr.includes(s));
      
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

    // Parse driver name & phone
    const driverNameOnly = selectedDriverName.split('(')[0].trim();
    const truckRegOnly = selectedVehicle.split('(')[0].trim();

    const newAcceptedBid = {
      id: `BID-BOOK-${Date.now()}`,
      loadId: selectedLoad.id,
      loadTitle: `${selectedLoad.cargoType} — ${selectedLoad.pickupCity} to ${selectedLoad.dropoffCity}`,
      route: `${selectedLoad.pickupCity} → ${selectedLoad.dropoffCity}`,
      shipperName: selectedLoad.shipperName,
      driverName: driverNameOnly,
      driverNameUr: driverNameOnly,
      driverPhone: '+92 301 2345678',
      driverRating: 4.9,
      driverTrips: 480,
      truckNumber: truckRegOnly,
      truckType: selectedLoad.truckType,
      originalPrice: selectedLoad.price,
      offeredBidPrice: selectedLoad.price,
      bidMessage: `Booking Locked! Assigned Vehicle: ${selectedVehicle} | Assigned Driver: ${selectedDriverName}`,
      submittedTime: 'Just now',
      status: 'accepted' as const,
      lastUpdatedBy: 'fleet' as const,
    };

    try {
      // Persist to SQLite Database via API
      apiClient.createBid(newAcceptedBid).catch(console.error);
      apiClient.updateLoadStatus(selectedLoad.id, 'booked').catch(console.error);

      const existingBidsJson = localStorage.getItem('safarload_global_bids');
      let currentBids = existingBidsJson ? JSON.parse(existingBidsJson) : [];
      currentBids = currentBids.filter((b: any) => b.loadId !== selectedLoad.id);
      currentBids.unshift(newAcceptedBid);
      localStorage.setItem('safarload_global_bids', JSON.stringify(currentBids));

      const storedBookedStr = localStorage.getItem('safarload_booked_loads');
      const bookedList = storedBookedStr ? JSON.parse(storedBookedStr) : [];
      if (!bookedList.includes(selectedLoad.id)) {
        bookedList.push(selectedLoad.id);
        localStorage.setItem('safarload_booked_loads', JSON.stringify(bookedList));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoad) return;

    const newPrice = Number(bidAmount);
    const driverNameOnly = selectedDriverName.split('(')[0].trim();
    const truckRegOnly = selectedVehicle.split('(')[0].trim();

    const newBidObj = {
      id: `BID-${Date.now()}`,
      loadId: selectedLoad.id,
      loadTitle: `${selectedLoad.cargoType} — ${selectedLoad.pickupCity} to ${selectedLoad.dropoffCity}`,
      route: `${selectedLoad.pickupCity} → ${selectedLoad.dropoffCity}`,
      shipperName: selectedLoad.shipperName,
      driverName: driverNameOnly,
      driverNameUr: driverNameOnly,
      driverPhone: '+92 301 2345678',
      driverRating: 4.8,
      driverTrips: 456,
      truckNumber: truckRegOnly,
      truckType: `${selectedLoad.truckType} (25 Tons)`,
      originalPrice: selectedLoad.price,
      offeredBidPrice: newPrice,
      bidMessage: `Bid Submitted! Assigned Vehicle: ${selectedVehicle} | Assigned Driver: ${selectedDriverName}`,
      submittedTime: 'Just now',
      status: 'pending' as const,
      lastUpdatedBy: 'fleet' as const,
    };

    // Update local driver state
    setDriverBidsMap(prev => ({
      ...prev,
      [selectedLoad.id]: { price: newPrice, note: newBidObj.bidMessage }
    }));

    // Update global localStorage bids for Shipper sync
    try {
      // Persist to SQLite Database via API
      apiClient.createBid(newBidObj).catch(console.error);

      const existingBidsJson = localStorage.getItem('safarload_global_bids');
      let currentBids = existingBidsJson ? JSON.parse(existingBidsJson) : [];
      currentBids = currentBids.filter((b: any) => b.loadId !== selectedLoad.id);
      currentBids.unshift(newBidObj);
      localStorage.setItem('safarload_global_bids', JSON.stringify(currentBids));
      triggerBidSubmittedNotification(driverNameOnly, newPrice, `${selectedLoad.pickupCity} → ${selectedLoad.dropoffCity}`);
    } catch (err) {
      console.error(err);
    }

    alert(`🏷️ Bid of Rs. ${newPrice.toLocaleString()} submitted with Assigned Vehicle (${truckRegOnly}) & Driver (${driverNameOnly})! Shipper portal updated.`);
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
              
              <div className={styles.cardActions} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <button className={styles.btnDetails} onClick={() => handleOpenLoadModal(load)} style={{ flex: 1 }}>
                  {isRtl ? 'تفصیلات دیکھیں' : 'View Details'}
                </button>

                {isBooked ? (
                  <Link href="/dashboard/trips" className="btn btn-success btn-sm" style={{ flex: 1, textAlign: 'center' }}>
                    🚛 Track Trip →
                  </Link>
                ) : (
                  <button className={styles.btnApply} onClick={() => handleOpenLoadModal(load)} style={{ flex: 1 }}>
                    ⚡ {isRtl ? 'بکنگ' : 'Book / Bid'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setEditingLoadTarget(load)}
                  className="btn btn-glass btn-sm"
                  title="Edit Load"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteLoad(load.id)}
                  className="btn btn-accent btn-sm"
                  title="Delete Load"
                  style={{ padding: '0.4rem 0.6rem' }}
                >
                  🗑️
                </button>
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

                {/* Fleet Vehicle & Driver Assignment Panel */}
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🚚 Vehicle & Driver Dispatch Assignment (گاڑی اور ڈرائیور کا انتخاب)
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                        🚛 Fleet Vehicle (گاڑی):
                      </label>
                      <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="input input-sm" style={{ width: '100%' }}>
                        <option value="LHR-5678 (Flatbed Trailer 25T)">LHR-5678 (Flatbed Trailer 25T)</option>
                        <option value="KHI-1234 (Container Truck 40ft)">KHI-1234 (Container Truck 40ft)</option>
                        <option value="FSD-9012 (Dumper Truck 20T)">FSD-9012 (Dumper Truck 20T)</option>
                        <option value="RWP-3456 (22-Wheeler 40T)">RWP-3456 (22-Wheeler 40T)</option>
                        <option value="SKT-5566 (Shehzore 3T)">SKT-5566 (Shehzore 3T)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                        👨‍✈️ Company Driver (ڈرائیور):
                      </label>
                      <select value={selectedDriverName} onChange={(e) => setSelectedDriverName(e.target.value)} className="input input-sm" style={{ width: '100%' }}>
                        <option value="Muhammad Aslam (+92 301 2345678)">Muhammad Aslam (+92 301 2345678)</option>
                        <option value="Abdul Rasheed (+92 333 9876543)">Abdul Rasheed (+92 333 9876543)</option>
                        <option value="Tariq Mehmood (+92 321 5551234)">Tariq Mehmood (+92 321 5551234)</option>
                        <option value="Shahbaz Ali (+92 300 7778899)">Shahbaz Ali (+92 300 7778899)</option>
                        <option value="Imran Shah (+92 307 8899001)">Imran Shah (+92 307 8899001)</option>
                      </select>
                    </div>
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

      {/* EDIT LOAD MODAL FOR SHIPPER */}
      {editingLoadTarget && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '650px', width: '90%' }}>
            <div className={styles.modalHeader}>
              <h3>✏️ Edit Load Details — {editingLoadTarget.id}</h3>
              <button onClick={() => setEditingLoadTarget(null)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSaveEditedLoad}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>📍 Pickup City:</label>
                  <input
                    type="text"
                    value={editingLoadTarget.pickupCity || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, pickupCity: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>🏁 Delivery City:</label>
                  <input
                    type="text"
                    value={editingLoadTarget.dropoffCity || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, dropoffCity: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>🏭 Pickup Address / Warehouse:</label>
                <input
                  type="text"
                  value={editingLoadTarget.pickupAddress || ''}
                  onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, pickupAddress: e.target.value })}
                  className="input"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>🏢 Dropoff Address / Destination:</label>
                <input
                  type="text"
                  value={editingLoadTarget.dropoffAddress || ''}
                  onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, dropoffAddress: e.target.value })}
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>📦 Cargo Type:</label>
                  <input
                    type="text"
                    value={editingLoadTarget.cargoType || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, cargoType: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>⚖️ Weight (Tons):</label>
                  <input
                    type="text"
                    value={editingLoadTarget.weightTons || editingLoadTarget.weight || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, weightTons: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>🚛 Truck Type:</label>
                  <input
                    type="text"
                    value={editingLoadTarget.truckType || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, truckType: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px' }}>💰 Offered Freight Price (PKR):</label>
                  <input
                    type="number"
                    value={editingLoadTarget.price || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, price: e.target.value })}
                    className="input input-lg"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setEditingLoadTarget(null)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Save Changes & Update Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
