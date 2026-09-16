'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockLoads, mockDriverAvailabilities } from '@/lib/mockData';
import { translations, Language } from '@/lib/translations';
import { triggerBidSubmittedNotification, triggerDriverAvailableNotification } from '@/lib/notificationSystem';
import { apiClient } from '@/lib/apiClient';
import { initiateVoIPCall } from '@/lib/voipCallSystem';
import UrduVoiceSearchModal from '@/components/UrduVoiceSearchModal';

export default function LoadsPage() {
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];
  const isRtl = language === 'ur';
  
  const [marketTab, setMarketTab] = useState<'cargo' | 'fleet-trucks' | 'driver-radar'>('cargo');
  const [fleetTrucks, setFleetTrucks] = useState<any[]>([]);
  const [driverBroadcasts, setDriverBroadcasts] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('driver');

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [filterCityFrom, setFilterCityFrom] = useState('');
  const [filterCityTo, setFilterCityTo] = useState('');
  const [filterTruckType, setFilterTruckType] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  // Interactive Modal & Booking State
  const [selectedLoad, setSelectedLoad] = useState<typeof mockLoads[0] | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bookedLoadIds, setBookedLoadIds] = useState<string[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('LHR-5678 (Flatbed Trailer)');
  const [selectedDriverName, setSelectedDriverName] = useState('Tariq Mehmood (+92 301 2345678)');

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

  const loadFleetTrucksAndRadar = () => {
    try {
      const storedFleet = localStorage.getItem('safarload_fleet_trucks');
      if (storedFleet) {
        setFleetTrucks(JSON.parse(storedFleet));
      } else {
        const defaultTrucks = [
          { id: 'TRK-001', registrationNumber: 'LHR-5678', type: 'Flatbed Trailer (25 Tons)', typeIcon: '🚛', driverName: 'Tariq Mehmood', driverPhone: '+92 301 2345678', currentCity: 'Multan', fuelLevel: 85, status: 'idle', operatorName: 'Al-Farooq Logistics' },
          { id: 'TRK-002', registrationNumber: 'KHI-1234', type: 'Container (22ft / 20 Tons)', typeIcon: '📦', driverName: 'Abdul Rasheed', driverPhone: '+92 333 9876543', currentCity: 'Karachi', fuelLevel: 92, status: 'idle', operatorName: 'Port Freight Lines' },
          { id: 'TRK-003', registrationNumber: 'FSD-9012', type: 'Dumper Truck (30 Tons)', typeIcon: '🚛', driverName: 'Muhammad Aslam', driverPhone: '+92 321 5551234', currentCity: 'Faisalabad', fuelLevel: 45, status: 'idle', operatorName: 'Faisalabad Heavy Fleet' },
          { id: 'TRK-004', registrationNumber: 'RWP-3456', type: '22-Wheeler Heavy Trailer', typeIcon: '🚛', driverName: 'Shahbaz Ali', driverPhone: '+92 300 7778899', currentCity: 'Rawalpindi', fuelLevel: 78, status: 'idle', operatorName: 'Northern Freight Co.' },
          { id: 'TRK-005', registrationNumber: 'PSH-7890', type: 'Bedford Open Rig (15 Tons)', typeIcon: '🚛', driverName: 'Khan Muhammad', driverPhone: '+92 302 1122334', currentCity: 'Peshawar', fuelLevel: 60, status: 'idle', operatorName: 'Khyber Express Fleet' },
          { id: 'TRK-006', registrationNumber: 'MLT-4567', type: 'Flatbed Trailer (25 Tons)', typeIcon: '🚛', driverName: 'Zahid Khan', driverPhone: '+92 304 9988776', currentCity: 'Multan', fuelLevel: 90, status: 'idle', operatorName: 'South Punjab Transport' },
        ];
        setFleetTrucks(defaultTrucks);
      }

      const storedRadar = localStorage.getItem('safarload_driver_availabilities');
      if (storedRadar) {
        setDriverBroadcasts(JSON.parse(storedRadar));
      } else {
        setDriverBroadcasts(mockDriverAvailabilities);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    const storedRole = localStorage.getItem('safarload_user_role');
    if (storedRole) setUserRole(storedRole);

    loadAllLoadsFromStorage();
    loadFleetTrucksAndRadar();

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
      loadFleetTrucksAndRadar();
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

  // Track global bids from storage to alert drivers when their bids are rejected or countered
  const [globalBidsList, setGlobalBidsList] = useState<any[]>([]);

  useEffect(() => {
    const loadGlobalBids = () => {
      try {
        const stored = localStorage.getItem('safarload_global_bids');
        if (stored) {
          setGlobalBidsList(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadGlobalBids();

    if (typeof window !== 'undefined') {
      window.addEventListener('safarload_bid_change', loadGlobalBids);
      return () => window.removeEventListener('safarload_bid_change', loadGlobalBids);
    }
  }, []);

  const handleDismissRejectedBid = (bidId: string) => {
    try {
      const stored = localStorage.getItem('safarload_global_bids');
      let list = stored ? JSON.parse(stored) : [];
      list = list.filter((b: any) => b.id !== bidId);
      localStorage.setItem('safarload_global_bids', JSON.stringify(list));
      setGlobalBidsList(list);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_bid_change'));
      }
    } catch (e) {
      console.error(e);
    }
  };

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

      const newTripItem = {
        id: `TRIP-${Math.floor(100 + Math.random() * 900)}`,
        loadId: selectedLoad.id,
        route: `${selectedLoad.pickupCity} → ${selectedLoad.dropoffCity}`,
        cargo: `${selectedLoad.cargoType} (${selectedLoad.weight} Tons)`,
        weight: Number(selectedLoad.weight) || 25,
        price: selectedLoad.price,
        shipper: selectedLoad.shipperName,
        driverName: driverNameOnly,
        status: 'assigned',
        pickupDate: 'Tomorrow',
        biltyUploaded: false,
        fuelAdvanceRequested: false,
        bookedByUserRole: userRole,
        bookedByUserName: driverNameOnly
      };

      const storedTripsStr = localStorage.getItem('safarload_driver_trips');
      const tripsList = storedTripsStr ? JSON.parse(storedTripsStr) : [];
      tripsList.unshift(newTripItem);
      localStorage.setItem('safarload_driver_trips', JSON.stringify(tripsList));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_bid_change'));
        window.dispatchEvent(new Event('safarload_loads_change'));
        window.dispatchEvent(new Event('safarload_trips_change'));
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_bid_change'));
      }
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
          
          <button className={styles.micBtn} onClick={() => setShowVoiceModal(true)} title="Urdu Voice Search">
            🎤
          </button>
        </div>
      </header>

      {/* 3-Category Marketplace Switcher Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', margin: '0 0 1.25rem 0', flexWrap: 'wrap' }}>
        <button
          onClick={() => setMarketTab('cargo')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: marketTab === 'cargo' ? '2px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
            background: marketTab === 'cargo' ? 'rgba(16, 185, 129, 0.2)' : '#1E293B',
            color: marketTab === 'cargo' ? '#10B981' : '#94A3B8',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          📦 {isRtl ? 'پوسٹ شدہ کارگو لوڈز' : 'Cargo Loads Board'} ({filteredLoads.length})
        </button>
        <button
          onClick={() => setMarketTab('fleet-trucks')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: marketTab === 'fleet-trucks' ? '2px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.1)',
            background: marketTab === 'fleet-trucks' ? 'rgba(59, 130, 246, 0.2)' : '#1E293B',
            color: marketTab === 'fleet-trucks' ? '#60A5FA' : '#94A3B8',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          🚛 {isRtl ? 'دستیاب فلیٹ گاڑیاں' : 'Available Fleet Trucks'} ({fleetTrucks.filter((t) => t.status === 'idle').length})
        </button>
        <button
          onClick={() => setMarketTab('driver-radar')}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '12px',
            border: marketTab === 'driver-radar' ? '2px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.1)',
            background: marketTab === 'driver-radar' ? 'rgba(245, 158, 11, 0.2)' : '#1E293B',
            color: marketTab === 'driver-radar' ? '#FBBF24' : '#94A3B8',
            fontWeight: 800,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          🟢 {isRtl ? 'ڈرائیور واپسی رڈار' : 'Driver Return Radar'} ({driverBroadcasts.length})
        </button>
      </div>

      {/* DRIVER BID REJECTION & COUNTER OFFER ALERTS BANNER */}
      {marketTab === 'cargo' && globalBidsList.some(b => b.status === 'rejected' || (b.status === 'pending' && b.lastUpdatedBy === 'shipper')) && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {globalBidsList.filter(b => b.status === 'rejected').map((bid: any) => (
            <div
              key={bid.id}
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(30, 41, 59, 0.95) 100%)',
                border: '2px solid #EF4444',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '3px 8px', fontWeight: 700 }}>
                    🔴 REJECTED BY SHIPPER
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Load ID: {bid.loadId}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF' }}>
                  📦 {bid.loadTitle || bid.route}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#E2E8F0', marginTop: '4px' }}>
                  🏢 Shipper <strong>{bid.shipperName}</strong> rejected your rate offer of <strong style={{ color: '#EF4444', textDecoration: 'line-through' }}>Rs. {bid.offeredBidPrice?.toLocaleString()}</strong>.
                </div>
                <div style={{ fontSize: '0.82rem', color: '#F59E0B', marginTop: '2px' }}>
                  💡 Tip: You can submit a lower counter bid or accept the standard load rate to secure dispatch.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const matchedLoad = allLoads.find(l => l.id === bid.loadId) || {
                      id: bid.loadId,
                      title: bid.loadTitle || bid.route,
                      pickupCity: (bid.route || '').split('→')[0]?.trim() || 'Multan',
                      dropoffCity: (bid.route || '').split('→')[1]?.trim() || 'Karachi',
                      pickupAddress: 'Industrial Area',
                      dropoffAddress: 'City Goods Yard',
                      cargoType: bid.loadTitle?.split('—')[0]?.trim() || 'Cargo Freight',
                      weight: '25 Tons',
                      truckType: bid.truckType || 'Trailer',
                      price: bid.originalPrice || bid.offeredBidPrice,
                      shipperName: bid.shipperName,
                    };
                    handleOpenLoadModal(matchedLoad as any);
                  }}
                  className="btn btn-warning btn-md"
                  style={{ fontWeight: 700, padding: '0.65rem 1.1rem', borderRadius: '10px' }}
                >
                  ✏️ {isRtl ? 'دوبارہ بولی دیں (Re-Bid)' : 'Submit Revised Counter Bid'}
                </button>
                <button
                  onClick={() => handleDismissRejectedBid(bid.id)}
                  className="btn btn-glass btn-sm"
                  style={{ fontSize: '0.85rem', padding: '0.6rem 0.9rem' }}
                >
                  ✕ Dismiss
                </button>
              </div>
            </div>
          ))}

          {globalBidsList.filter(b => b.status === 'pending' && b.lastUpdatedBy === 'shipper').map((bid: any) => (
            <div
              key={bid.id}
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 41, 59, 0.95) 100%)',
                border: '2px solid #3B82F6',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.25)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '3px 8px', fontWeight: 700 }}>
                    🔄 REVISED SHIPPER COUNTER OFFER
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Load ID: {bid.loadId}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF' }}>
                  📦 {bid.loadTitle || bid.route}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#E2E8F0', marginTop: '4px' }}>
                  🏢 Shipper <strong>{bid.shipperName}</strong> offered revised rate: <strong style={{ color: '#10B981', fontSize: '1.1rem' }}>Rs. {bid.shipperCounterPrice?.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href="/dashboard/fleet" className="btn btn-primary btn-md" style={{ fontWeight: 700, padding: '0.65rem 1.1rem', borderRadius: '10px' }}>
                  ⚡ Review & Accept Offer in Fleet
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH & FILTERS */}
      {marketTab === 'cargo' && (
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
      )}

      {/* VIEW CATEGORY 1: CARGO LOADS BOARD */}
      {marketTab === 'cargo' && (
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
      )}

      {/* VIEW CATEGORY 2: AVAILABLE FLEET TRUCKS */}
      {marketTab === 'fleet-trucks' && (
        <div className={styles.grid}>
          {fleetTrucks.filter((t) => t.status === 'idle').length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#94A3B8', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px' }}>
              🚛 No idle fleet trucks currently available. Check back soon!
            </div>
          ) : (
            fleetTrucks.filter((t) => t.status === 'idle').map((truck) => (
              <div key={truck.id} className={`${styles.card} glass-card`}>
                <div className={styles.cardHeader}>
                  <div className={styles.routeGroup}>
                    <span className={styles.city}>{truck.typeIcon || '🚛'} {truck.registrationNumber}</span>
                  </div>
                  <span className="badge badge-success">🟢 Idle & Available</span>
                </div>

                <div className={styles.cargoInfo}>
                  <span className={styles.cargoText}>
                    <strong>Vehicle:</strong> {truck.type}
                  </span>
                </div>

                <div className={styles.metaRow}>
                  <span>📍 Location: <strong>{truck.currentCity}</strong></span>
                  <span>👨‍✈️ Driver: <strong>{truck.driverName}</strong></span>
                </div>

                <div className={styles.shipperRow}>
                  <div className={styles.shipperMeta}>
                    <span className={styles.shipperName}>🏢 Operator: {truck.operatorName || 'Fleet Logistics Partner'}</span>
                  </div>
                </div>

                <div className={styles.cardActions} style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
                  <button
                    onClick={() =>
                      initiateVoIPCall({
                        id: truck.id,
                        name: truck.driverName,
                        phone: truck.driverPhone || '+92 301 2345678',
                        truck: `${truck.registrationNumber} (${truck.type})`,
                        role: 'driver',
                      })
                    }
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    📞 Call Driver Direct
                  </button>
                  {userRole !== 'driver' && (
                    <Link
                      href={`/dashboard/post-load?targetTruck=${encodeURIComponent(truck.registrationNumber)}`}
                      className="btn btn-success btn-sm"
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      ⚡ Assign Cargo Load
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW CATEGORY 3: DRIVER RETURN RADAR */}
      {marketTab === 'driver-radar' && (
        <div className={styles.grid}>
          {driverBroadcasts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: '#94A3B8', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px' }}>
              🟢 No active driver return broadcasts.
            </div>
          ) : (
            driverBroadcasts.map((radar) => (
              <div key={radar.id} className={`${styles.card} glass-card`}>
                <div className={styles.cardHeader}>
                  <div className={styles.routeGroup}>
                    <span className={styles.city}>{radar.currentCity}</span>
                    <span className={styles.arrow}>➔</span>
                    <span className={styles.city}>{radar.preferredDestination}</span>
                  </div>
                  <span className="badge badge-warning">🟢 Return Leg</span>
                </div>

                <div className={styles.cargoInfo}>
                  <span className={styles.cargoText}>
                    🚛 {radar.truckType} ({radar.truckNumber})
                  </span>
                </div>

                <div className={styles.metaRow}>
                  <span>⚖️ Available Capacity: <strong>{radar.availableCapacityTons} Tons</strong></span>
                  <span>⏱️ Departure: <strong>{radar.departureTime}</strong></span>
                </div>

                <div className={styles.shipperRow}>
                  <div className={styles.shipperMeta}>
                    <span className={styles.shipperName}>👨‍✈️ {radar.driverName} ({radar.driverPhone})</span>
                  </div>
                </div>

                <div className={styles.cardActions} style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem' }}>
                  <button
                    onClick={() =>
                      initiateVoIPCall({
                        id: radar.id,
                        name: radar.driverName,
                        phone: radar.driverPhone,
                        truck: `${radar.truckNumber} (${radar.truckType})`,
                        role: 'driver',
                      })
                    }
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    📞 Call Driver Direct
                  </button>
                  {userRole !== 'driver' && (
                    <Link
                      href={`/dashboard/post-load?pickupCity=${encodeURIComponent(radar.currentCity)}&dropoffCity=${encodeURIComponent(radar.preferredDestination)}`}
                      className="btn btn-success btn-sm"
                      style={{ flex: 1, textAlign: 'center' }}
                    >
                      ⚡ Offer Return Cargo Load
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
                    {(selectedLoad.specialRequirements || []).map((r: any, i: number) => (
                      <span key={i} className={styles.reqChip}>✅ {r}</span>
                    ))}
                  </div>
                </div>

                {/* Fleet Vehicle & Driver Assignment Panel */}
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🚚 Vehicle & Driver Dispatch Assignment (گاڑی اور ڈرائیور کا انتخاب)
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                        🚛 Fleet Vehicle (گاڑی):
                      </label>
                      <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="input" style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.92rem', borderRadius: '10px' }}>
                        <option value="LHR-5678 (Flatbed Trailer 25T)">LHR-5678 (Flatbed Trailer 25T)</option>
                        <option value="KHI-1234 (Container Truck 40ft)">KHI-1234 (Container Truck 40ft)</option>
                        <option value="FSD-9012 (Dumper Truck 20T)">FSD-9012 (Dumper Truck 20T)</option>
                        <option value="RWP-3456 (22-Wheeler 40T)">RWP-3456 (22-Wheeler 40T)</option>
                        <option value="SKT-5566 (Shehzore 3T)">SKT-5566 (Shehzore 3T)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                        👨‍✈️ Company Driver (ڈرائیور):
                      </label>
                      <select value={selectedDriverName} onChange={(e) => setSelectedDriverName(e.target.value)} className="input" style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.92rem', borderRadius: '10px' }}>
                        <option value="Tariq Mehmood (+92 301 2345678)">Tariq Mehmood (+92 301 2345678)</option>
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
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⚡ Instant Fixed Booking
                      </h4>
                      <div className={styles.priceDisplay}>
                        Rs. {selectedLoad.price.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={handleConfirmBooking}
                      className="btn btn-primary btn-lg"
                      style={{
                        width: '100%',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        padding: '0.9rem 1.25rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
                      }}
                    >
                      ⚡ Confirm Booking Now (ابھی بوک کریں)
                    </button>
                  </div>

                  <div className={styles.biddingBox}>
                    <div>
                      <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🏷️ Or Submit Counter Bid
                      </h4>
                      <form onSubmit={handleSubmitBid}>
                        <div style={{ marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                            Your Rate Bid (PKR):
                          </label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: '14px', color: '#F59E0B', fontWeight: 800, fontSize: '1rem' }}>
                              PKR
                            </span>
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="input"
                              style={{
                                width: '100%',
                                paddingLeft: '3.5rem',
                                paddingRight: '1rem',
                                paddingTop: '0.75rem',
                                paddingBottom: '0.75rem',
                                fontSize: '1.35rem',
                                fontWeight: 800,
                                color: '#F59E0B',
                                border: '2px solid rgba(245, 158, 11, 0.5)',
                                background: 'rgba(15, 23, 42, 0.9)',
                                borderRadius: '12px'
                              }}
                              required
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-lg"
                          style={{
                            width: '100%',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            padding: '0.9rem 1.25rem',
                            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
                            cursor: 'pointer'
                          }}
                        >
                          📩 Submit Bid to Shipper
                        </button>
                      </form>
                    </div>
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
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '880px', width: '92%' }}>
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

      {/* Urdu & English Voice Search Assistant Modal */}
      <UrduVoiceSearchModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSelectSearchQuery={(query) => setSearch(query)}
      />
    </div>
  );
}
