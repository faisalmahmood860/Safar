'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import DigitalBiltyModal, { BiltyData } from '@/components/DigitalBiltyModal';
import GlobalBannerContainer from '@/components/GlobalBannerContainer';
import { useBiltyEnabled } from '@/lib/biltyConfig';
import { mockLoads, mockDriverCounterBids, mockDriverAvailabilities, DriverCounterBid, DriverAvailabilityBroadcast, pakistaniCities } from '@/lib/mockData';
import { triggerCargoPostedNotification, triggerTripAcceptedNotification, triggerBidRejectedNotification, triggerShipperCounterOfferNotification } from '@/lib/notificationSystem';
import { initiateVoIPCall } from '@/lib/voipCallSystem';
import { apiClient } from '@/lib/apiClient';

import { DepositSlip, initialDepositSlips } from '@/lib/depositSlipData';

export default function PostLoadPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [selectedBilty, setSelectedBilty] = useState<BiltyData | null>(null);
  const biltyEnabled = useBiltyEnabled();

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
  const [workspaceTab, setWorkspaceTab] = useState<'post' | 'my-loads' | 'bids' | 'booked' | 'escrow' | 'radar'>('post');
  const [voicePosting, setVoicePosting] = useState(false);
  const [loadPostedSuccess, setLoadPostedSuccess] = useState(false);
  const [bids, setBids] = useState<DriverCounterBid[]>(mockDriverCounterBids);
  const [availabilities, setAvailabilities] = useState<DriverAvailabilityBroadcast[]>(mockDriverAvailabilities);

  const loadRadarAvailabilities = async () => {
    try {
      const res = await fetch('/api/radar');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setAvailabilities(data.data);
        return;
      }
    } catch (e) {}

    try {
      const stored = localStorage.getItem('safarload_driver_availabilities');
      if (stored) {
        setAvailabilities(JSON.parse(stored));
      }
    } catch (e) {}
  };

  React.useEffect(() => {
    loadRadarAvailabilities();
    window.addEventListener('storage', loadRadarAvailabilities);
    return () => window.removeEventListener('storage', loadRadarAvailabilities);
  }, []);

  // Deposit Slips State & Real-time Sync
  const [depositSlips, setDepositSlips] = useState<DepositSlip[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<'meezan' | 'jazzcash' | 'easypaisa'>('meezan');
  const [depositTrxId, setDepositTrxId] = useState('');
  const [depositSlipFile, setDepositSlipFile] = useState<string | null>(null);
  const [depositSlipFileName, setDepositSlipFileName] = useState('');
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  const loadDepositSlipsFromStorage = () => {
    try {
      const stored = localStorage.getItem('safarload_deposit_slips');
      if (stored) {
        setDepositSlips(JSON.parse(stored));
      } else {
        setDepositSlips(initialDepositSlips);
        localStorage.setItem('safarload_deposit_slips', JSON.stringify(initialDepositSlips));
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    loadDepositSlipsFromStorage();

    const handleSync = () => {
      loadDepositSlipsFromStorage();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('safarload_deposit_slip_event', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('safarload_deposit_slip_event', handleSync);
    };
  }, []);

  // Sync bids and posted loads with localStorage & listen to real-time changes
  React.useEffect(() => {
    const loadBidsAndPostedLoads = () => {
      try {
        const storedBids = localStorage.getItem('safarload_global_bids');
        if (storedBids) {
          setBids(JSON.parse(storedBids));
        } else {
          localStorage.setItem('safarload_global_bids', JSON.stringify(mockDriverCounterBids));
        }

        const storedLoads = localStorage.getItem('safarload_global_posted_loads');
        if (storedLoads) {
          setMyPostedLoads(JSON.parse(storedLoads));
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadBidsAndPostedLoads();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', loadBidsAndPostedLoads);
      window.addEventListener('safarload_bid_change', loadBidsAndPostedLoads);
      window.addEventListener('safarload_loads_change', loadBidsAndPostedLoads);
      window.addEventListener('safarload_trips_change', loadBidsAndPostedLoads);

      return () => {
        window.removeEventListener('storage', loadBidsAndPostedLoads);
        window.removeEventListener('safarload_bid_change', loadBidsAndPostedLoads);
        window.removeEventListener('safarload_loads_change', loadBidsAndPostedLoads);
        window.removeEventListener('safarload_trips_change', loadBidsAndPostedLoads);
      };
    }
  }, []);

  const saveBidsToStorage = (updatedBids: DriverCounterBid[]) => {
    setBids(updatedBids);
    try {
      localStorage.setItem('safarload_global_bids', JSON.stringify(updatedBids));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_bid_change'));
      }
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

  // Shipper Driver Rating & Review Modal State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingTargetBid, setRatingTargetBid] = useState<DriverCounterBid | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [selectedRatingTags, setSelectedRatingTags] = useState<string[]>(['⚡ Punctual & On-Time', '🛡️ Safe Cargo Handling']);
  const [ratingComment, setRatingComment] = useState<string>('');

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

  // Dynamic Pakistani Inter-City Route Distance Calculation Helper
  const getRouteDistanceDetails = (fromCity: string, toCity: string) => {
    const pair = `${fromCity.trim().toLowerCase()} -> ${toCity.trim().toLowerCase()}`;
    const reversePair = `${toCity.trim().toLowerCase()} -> ${fromCity.trim().toLowerCase()}`;

    const routes: Record<string, { km: number; motorway: string; hours: number }> = {
      'multan -> karachi': { km: 945, motorway: 'M-5 Sukkur-Multan → M-9 Karachi', hours: 14.5 },
      'lahore -> karachi': { km: 1210, motorway: 'M-3 → M-5 → M-9 Motorway', hours: 18.5 },
      'faisalabad -> karachi': { km: 1120, motorway: 'M-4 → M-5 → M-9 Motorway', hours: 17.0 },
      'peshawar -> karachi': { km: 1450, motorway: 'M-1 → M-2 → M-5 → M-9', hours: 22.0 },
      'multan -> lahore': { km: 345, motorway: 'M-4 → M-3 Motorway', hours: 5.0 },
      'lahore -> islamabad': { km: 375, motorway: 'M-2 Motorway', hours: 5.5 },
      'lahore -> peshawar': { km: 485, motorway: 'M-2 → M-1 Motorway', hours: 7.0 },
      'faisalabad -> lahore': { km: 180, motorway: 'M-3 Motorway', hours: 2.8 },
      'dg khan -> karachi': { km: 860, motorway: 'N-55 Indus Highway / M-5', hours: 13.5 },
      'quetta -> karachi': { km: 680, motorway: 'N-25 RCD Highway', hours: 11.0 },
      'multan -> islamabad': { km: 540, motorway: 'M-4 → M-2 Motorway', hours: 7.5 },
      'faisalabad -> islamabad': { km: 320, motorway: 'M-4 → M-2 Motorway', hours: 4.5 },
      'sialkot -> karachi': { km: 1280, motorway: 'M-11 → M-3 → M-5 → M-9', hours: 19.5 },
      'larkana -> karachi': { km: 450, motorway: 'M-9 Motorway / Indus Highway', hours: 7.0 },
    };

    if (routes[pair]) return routes[pair];
    if (routes[reversePair]) return routes[reversePair];

    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
      return { km: 35, motorway: 'Intra-City Ring Road / Local Bypass', hours: 1.2 };
    }

    const calculatedKm = Math.max(150, Math.min(1600, Math.abs(fromCity.length - toCity.length) * 120 + 340));
    const calculatedHours = Number((calculatedKm / 65).toFixed(1));
    return { km: calculatedKm, motorway: 'N-5 / National Highway Route', hours: calculatedHours };
  };

  // Google Maps Location Picker Modal State
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapTargetField, setMapTargetField] = useState<'pickup' | 'dropoff'>('pickup');
  const [mapPinCoords, setMapPinCoords] = useState<{ lat: number; lng: number }>({ lat: 30.1978, lng: 71.4697 });
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const handleOpenMapPicker = (targetField: 'pickup' | 'dropoff') => {
    setMapTargetField(targetField);
    if (targetField === 'pickup') {
      setMapPinCoords({ lat: 30.1978, lng: 71.4697 });
      setMapSearchQuery(pickupAddress || `${pickupCity} Industrial Estate Gate 3`);
    } else {
      setMapPinCoords({ lat: 24.8607, lng: 67.0011 });
      setMapSearchQuery(dropoffAddress || `${dropoffCity} Port Qasim Terminal 2`);
    }
    setShowMapModal(true);
  };

  const handleDetectGpsLocation = (targetField: 'pickup' | 'dropoff') => {
    setIsDetectingGps(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGps(false);
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setMapPinCoords({ lat, lng });
          const formatted = `GPS Pin (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E) — Live GPS Gate`;
          if (targetField === 'pickup') {
            setPickupAddress(formatted);
          } else {
            setDropoffAddress(formatted);
          }
          alert(`🎯 Live GPS Location Pinpointed!\nLatitude: ${lat.toFixed(5)}\nLongitude: ${lng.toFixed(5)}\n\nAddress set to exact GPS coordinates.`);
        },
        () => {
          setIsDetectingGps(false);
          const fallbackLat = targetField === 'pickup' ? 30.1978 : 24.8607;
          const fallbackLng = targetField === 'pickup' ? 71.4697 : 67.0011;
          setMapPinCoords({ lat: fallbackLat, lng: fallbackLng });
          const formatted = `GPS Pin (${fallbackLat.toFixed(4)}°N, ${fallbackLng.toFixed(4)}°E) — Factory Gate`;
          if (targetField === 'pickup') setPickupAddress(formatted);
          else setDropoffAddress(formatted);
          alert(`🎯 GPS Location Pinpointed successfully!`);
        },
        { timeout: 6000 }
      );
    } else {
      setIsDetectingGps(false);
      alert('Geolocation API is not supported on this device.');
    }
  };

  const handleConfirmMapLocation = () => {
    const finalAddress = mapSearchQuery.trim()
      ? `${mapSearchQuery} (GPS: ${mapPinCoords.lat.toFixed(4)}°N, ${mapPinCoords.lng.toFixed(4)}°E)`
      : `Google Map Pin (${mapPinCoords.lat.toFixed(4)}°N, ${mapPinCoords.lng.toFixed(4)}°E)`;

    if (mapTargetField === 'pickup') {
      setPickupAddress(finalAddress);
    } else {
      setDropoffAddress(finalAddress);
    }
    setShowMapModal(false);
  };

  // Web Speech API & Urdu AI Freight Phrase Parser State
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceParsedSuccess, setVoiceParsedSuccess] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const parseVoiceText = (text: string) => {
    const lower = text.toLowerCase();
    setVoiceTranscript(text);

    // 1. Detect Pickup & Dropoff Cities
    if (lower.includes('multan') || text.includes('ملتان')) setPickupCity('Multan');
    else if (lower.includes('lahore') || text.includes('لاہور')) setPickupCity('Lahore');
    else if (lower.includes('faisalabad') || text.includes('فیصل آباد')) setPickupCity('Faisalabad');
    else if (lower.includes('peshawar') || text.includes('پشاور')) setPickupCity('Peshawar');

    if (lower.includes('karachi') || text.includes('کراچی')) setDropoffCity('Karachi');
    else if (lower.includes('lahore') || text.includes('لاہور')) setDropoffCity('Lahore');
    else if (lower.includes('peshawar') || text.includes('پشاور')) setDropoffCity('Peshawar');

    // 2. Detect Weight (e.g. 25, 18, 10, 40)
    const weightMatch = text.match(/(\d+)\s*(ٹن|ton|tons)/i);
    if (weightMatch && weightMatch[1]) {
      setWeightTons(weightMatch[1]);
    }

    // 3. Detect Truck Type
    if (lower.includes('trailer') || text.includes('ٹریلر') || text.includes('ٹرائلر')) setTruckType('Trailer');
    else if (lower.includes('22') || text.includes('22 وہیلر') || text.includes('بائیس')) setTruckType('22-Wheeler');
    else if (lower.includes('mazda') || text.includes('مزدا')) setTruckType('Mazda');
    else if (lower.includes('shehzore') || text.includes('شہزور')) setTruckType('Shehzore');
    else if (lower.includes('container') || text.includes('کنٹینر')) setTruckType('Container');

    // 4. Detect Price Number (e.g. 185000, 165000, 190000)
    const priceMatch = text.match(/(\d{5,6})/);
    if (priceMatch && priceMatch[1]) {
      setOfferedPrice(priceMatch[1]);
    } else if (text.includes('ایک لاکھ پچاسی ہزار') || lower.includes('185k') || lower.includes('185000')) {
      setOfferedPrice('185000');
    } else if (text.includes('ایک لاکھ پینسٹھ ہزار') || lower.includes('165k') || lower.includes('165000')) {
      setOfferedPrice('165000');
    }

    // 5. Detect Cargo Type
    if (lower.includes('textile') || text.includes('ٹیکسٹائل') || text.includes('کاٹن')) setCargoType('Textile');
    else if (lower.includes('grain') || text.includes('اناج') || text.includes('گندم')) setCargoType('Food & Grain');
    else if (lower.includes('machinery') || text.includes('مشینری')) setCargoType('Machinery');

    setVoiceParsedSuccess(true);
  };

  const handleVoiceRecord = () => {
    setVoiceError(null);
    setVoiceParsedSuccess(false);

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;

        setVoicePosting(true);
        setVoiceTranscript(lang === 'ur' ? 'سن رہا ہے... (بولیے: "مجھے ملتان سے کراچی کے لیے 25 ٹن ٹریلر چاہیے")' : 'Listening... Speak your load details');

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setVoiceTranscript(transcript);
          parseVoiceText(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setVoicePosting(false);
          setVoiceError(`Voice capture note: ${event.error}. You can click a sample Urdu command below.`);
        };

        recognition.onend = () => {
          setVoicePosting(false);
        };

        recognition.start();
      } catch (err: any) {
        setVoicePosting(false);
        simulateSampleVoicePrompt('🗣️ "مجھے ملتان سے کراچی کے لیے 25 ٹن ٹیکسٹائل کا ٹریلر چاہیے، کرایہ 185000 روپے"');
      }
    } else {
      simulateSampleVoicePrompt('🗣️ "مجھے ملتان سے کراچی کے لیے 25 ٹن ٹیکسٹائل کا ٹریلر چاہیے، کرایہ 185000 روپے"');
    }
  };

  const simulateSampleVoicePrompt = (sampleText: string) => {
    setVoiceError(null);
    setVoicePosting(true);
    setVoiceTranscript('Processing Urdu Audio: ' + sampleText);
    setTimeout(() => {
      setVoicePosting(false);
      parseVoiceText(sampleText);
    }, 1200);
  };

  // Posted Loads State & Real-Time Storage Sync
  const [myPostedLoads, setMyPostedLoads] = useState<any[]>([]);
  const [editingLoadTarget, setEditingLoadTarget] = useState<any | null>(null);

  const loadMyPostedLoadsFromStorage = async () => {
    try {
      const res = await apiClient.getLoads({ status: 'all', limit: 100 });
      if (res && res.success && res.data && res.data.length > 0) {
        const filtered = res.data.filter((l: any) => l.shipperName && l.shipperName.includes('Noor Textile Mills'));
        setMyPostedLoads(filtered.length > 0 ? filtered : res.data);
        return;
      }
    } catch {
      // fallback to localStorage
    }

    try {
      const stored = localStorage.getItem('safarload_global_posted_loads');
      const deletedStr = localStorage.getItem('safarload_deleted_loads');
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      let list = stored ? JSON.parse(stored) : mockLoads.filter((l) => l.shipperName.includes('Noor Textile Mills'));
      list = list.filter((l: any) => !deletedIds.includes(l.id));
      setMyPostedLoads(list);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    loadMyPostedLoadsFromStorage();

    const handleSyncLoads = () => {
      loadMyPostedLoadsFromStorage();
    };

    window.addEventListener('storage', handleSyncLoads);
    window.addEventListener('safarload_loads_change', handleSyncLoads);
    return () => {
      window.removeEventListener('storage', handleSyncLoads);
      window.removeEventListener('safarload_loads_change', handleSyncLoads);
    };
  }, []);

  const handleSubmitLoad = (e: React.FormEvent) => {
    e.preventDefault();

    const routeDetails = getRouteDistanceDetails(pickupCity, dropoffCity);
    const distanceKm = routeDetails.km;

    const newLoad = {
      id: `LD-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: `${cargoType} — ${pickupCity} to ${dropoffCity}`,
      pickupCity,
      pickupCityUr: pickupCity,
      pickupAddress: pickupAddress || `${pickupCity} Industrial Zone`,
      dropoffCity,
      dropoffCityUr: dropoffCity,
      dropoffAddress: dropoffAddress || `${dropoffCity} Port/Market`,
      cargoType,
      cargoTypeUr: cargoType,
      weight: `${weightTons} Tons`,
      weightTons,
      truckType,
      truckTypeUr: truckType,
      price: Number(offeredPrice),
      pricePerKm: Math.round(Number(offeredPrice) / distanceKm),
      distance: distanceKm,
      pickupDate: pickupDate || new Date().toISOString().split('T')[0],
      pickupTime: '08:00 AM',
      estimatedHours: routeDetails.hours,
      shipperName: 'Noor Textile Mills Ltd',
      shipperRating: 4.9,
      shipperLoads: 28,
      shipperVerified: true,
      isUrgent: true,
      isBookNow: true,
      cargoIcon: '📦',
      specialRequirements: ['EFU Transit Insured', 'Tolls Included', 'Loading Labor Provided'],
      status: 'active' as const,
      postedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 1. Persist to SQLite Relational DB via Backend API
    apiClient.createLoad({
      id: newLoad.id,
      title: newLoad.title,
      pickupCity: newLoad.pickupCity,
      dropoffCity: newLoad.dropoffCity,
      pickupAddress: newLoad.pickupAddress,
      dropoffAddress: newLoad.dropoffAddress,
      cargoType: newLoad.cargoType,
      truckType: newLoad.truckType,
      weight: newLoad.weightTons,
      price: newLoad.price,
      distance: newLoad.distance,
      estimatedHours: newLoad.estimatedHours,
      pickupDate: newLoad.pickupDate,
      pickupTime: newLoad.pickupTime,
      shipperName: newLoad.shipperName,
      status: 'posted',
      isUrgent: newLoad.isUrgent,
      isBookNow: newLoad.isBookNow,
      specialRequirements: newLoad.specialRequirements,
    }).catch(console.error);

    // 2. Persist to localStorage for client sync
    try {
      const stored = localStorage.getItem('safarload_global_posted_loads');
      const currentList = stored ? JSON.parse(stored) : [...mockLoads];
      const updatedList = [newLoad, ...currentList];
      localStorage.setItem('safarload_global_posted_loads', JSON.stringify(updatedList));
      setMyPostedLoads(prev => [newLoad, ...prev]);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_loads_change'));
      }
    } catch (err) {
      console.error(err);
    }

    setLoadPostedSuccess(true);
    triggerCargoPostedNotification('Noor Textile Mills Ltd', `${pickupCity} → ${dropoffCity}`, offeredPrice);
  };

  const handleDeleteLoad = (loadId: string) => {
    if (!confirm(`Are you sure you want to delete / cancel load posting ${loadId}?`)) return;

    try {
      // Async database deletion
      apiClient.deleteLoad(loadId).catch(console.error);

      const stored = localStorage.getItem('safarload_global_posted_loads');
      let currentList = stored ? JSON.parse(stored) : [...mockLoads];
      currentList = currentList.filter((l: any) => l.id !== loadId);
      localStorage.setItem('safarload_global_posted_loads', JSON.stringify(currentList));

      const deletedStr = localStorage.getItem('safarload_deleted_loads');
      const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedIds.includes(loadId)) {
        deletedIds.push(loadId);
        localStorage.setItem('safarload_deleted_loads', JSON.stringify(deletedIds));
      }

      setMyPostedLoads(prev => prev.filter(l => l.id !== loadId));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_loads_change'));
      }
      alert(`🗑️ Load ${loadId} deleted successfully! Removed from public Load Board.`);
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

  // Shipper Filter State (Default: Noor Textile Mills)
  const [currentShipperName] = useState('Noor Textile Mills');
  const [shipperTab, setShipperTab] = useState<'pending' | 'booked' | 'escrow'>('pending');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('200000');

  const isShipperBid = (b: any) => {
    if (!b) return false;
    return true; // Display all bids and accepted trips in the Shipper Workspace!
  };

  // Dynamic Approved Escrow Vault Balance Calculation
  const approvedDepositsTotal = (depositSlips || [])
    .filter((s) => s && s.status === 'approved' && (!s.shipperName || s.shipperName.includes('Noor Textile') || s.shipperName.includes(currentShipperName)))
    .reduce((acc, s) => acc + (s?.amountPkr || 0), 0);
  const activeEscrowVaultBalance = 420000 + approvedDepositsTotal;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDepositSlipFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDepositSlipFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositTrxId.trim()) {
      alert('Please enter the Transaction Reference ID (TRX # / Reference ID)');
      return;
    }

    const gatewayMap = {
      meezan: 'Meezan Bank IBFT',
      jazzcash: 'JazzCash Merchant',
      easypaisa: 'EasyPaisa Merchant',
    };

    const newSlip: DepositSlip = {
      id: `SLIP-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('sv').replace('T', ' ').slice(0, 16),
      shipperName: 'Noor Textile Mills Ltd',
      paymentMethod: gatewayMap[selectedGateway],
      referenceTxId: depositTrxId.trim(),
      amountPkr: Number(depositAmount),
      slipImageUrl: depositSlipFile || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      status: 'pending',
    };

    const updated = [newSlip, ...depositSlips];
    setDepositSlips(updated);

    try {
      localStorage.setItem('safarload_deposit_slips', JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('safarload_deposit_slip_event'));
      }
    } catch (err) {
      console.error(err);
    }

    alert(
      `🧾 Deposit Slip Submitted Successfully!\n\n🏢 Shipper: Noor Textile Mills Ltd\n💰 Deposit Amount: Rs. ${Number(depositAmount).toLocaleString()}\n💳 Gateway: ${gatewayMap[selectedGateway]}\n📌 Reference TRX #: ${depositTrxId.trim()}\n\nYour slip has been sent to the Finance Team for bank verification. Vault balance will update automatically upon approval!`
    );

    setShowDepositModal(false);
    setDepositTrxId('');
    setDepositSlipFile(null);
    setDepositSlipFileName('');
  };

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
      triggerTripAcceptedNotification(targetBid.driverName, targetBid.offeredBidPrice, targetBid.route);
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
    const targetBid = bids.find((b) => b.id === bidId);
    const updated = bids.map((b) => (b.id === bidId ? { ...b, status: 'rejected' as const } : b));
    saveBidsToStorage(updated);

    if (targetBid) {
      triggerBidRejectedNotification(
        targetBid.driverName,
        targetBid.offeredBidPrice,
        targetBid.route || targetBid.loadTitle
      );
      alert(`🔴 Driver Counter Bid REJECTED! Driver (${targetBid.driverName}) has been notified live via notification badge & dashboard alert.`);
    }
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
    triggerShipperCounterOfferNotification(
      counterBidTarget.driverName,
      revisedPrice,
      counterBidTarget.route || counterBidTarget.loadTitle
    );
    alert(`🔄 Revised Counter Offer of Rs. ${revisedPrice.toLocaleString()} sent back to driver ${counterBidTarget.driverName}! Driver dashboard & live notifications updated.`);
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

  const handleOpenRatingModal = (bid: DriverCounterBid) => {
    setRatingTargetBid(bid);
    if ((bid as any).shipperRatingSubmitted) {
      setRatingStars((bid as any).shipperRatingSubmitted.stars || 5);
      setSelectedRatingTags((bid as any).shipperRatingSubmitted.tags || ['⚡ Punctual & On-Time']);
      setRatingComment((bid as any).shipperRatingSubmitted.comment || '');
    } else {
      setRatingStars(5);
      setSelectedRatingTags(['⚡ Punctual & On-Time', '🛡️ Safe Cargo Handling']);
      setRatingComment('');
    }
    setShowRatingModal(true);
  };

  const handleToggleRatingTag = (tag: string) => {
    if (selectedRatingTags.includes(tag)) {
      setSelectedRatingTags(selectedRatingTags.filter((t) => t !== tag));
    } else {
      setSelectedRatingTags([...selectedRatingTags, tag]);
    }
  };

  const handleSubmitDriverRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingTargetBid) return;

    const ratingRecord = {
      stars: ratingStars,
      tags: selectedRatingTags,
      comment: ratingComment,
      ratedAt: new Date().toLocaleDateString(),
    };

    const updatedBids = bids.map((b) =>
      b.id === ratingTargetBid.id
        ? {
            ...b,
            shipperRatingSubmitted: ratingRecord,
            driverRating: Number(((b.driverRating + ratingStars) / 2).toFixed(1)),
          }
        : b
    );
    saveBidsToStorage(updatedBids);

    try {
      const storedRatings = localStorage.getItem('safarload_driver_ratings');
      let ratingsList = storedRatings ? JSON.parse(storedRatings) : [];
      ratingsList = ratingsList.filter((r: any) => r.bidId !== ratingTargetBid.id);
      ratingsList.unshift({
        bidId: ratingTargetBid.id,
        driverName: ratingTargetBid.driverName,
        driverPhone: ratingTargetBid.driverPhone,
        truckNumber: ratingTargetBid.truckNumber,
        shipperName: ratingTargetBid.shipperName,
        stars: ratingStars,
        tags: selectedRatingTags,
        comment: ratingComment,
        date: new Date().toLocaleDateString(),
      });
      localStorage.setItem('safarload_driver_ratings', JSON.stringify(ratingsList));
    } catch (err) {
      console.error(err);
    }

    try {
      const storedDrivers = localStorage.getItem('safarload_fleet_drivers');
      if (storedDrivers) {
        let drivers = JSON.parse(storedDrivers);
        drivers = drivers.map((d: any) => {
          if (d.name === ratingTargetBid.driverName || d.phone === ratingTargetBid.driverPhone) {
            const newSafety = Math.min(100, Math.max(70, d.safetyScore + (ratingStars >= 4 ? 1 : -2)));
            return { ...d, safetyScore: newSafety };
          }
          return d;
        });
        localStorage.setItem('safarload_fleet_drivers', JSON.stringify(drivers));
      }
    } catch (err) {
      console.error(err);
    }

    alert(
      `⭐ Driver Rating & Review Submitted Successfully!\n\n👨‍✈️ Driver: ${ratingTargetBid.driverName}\n🚛 Vehicle: ${ratingTargetBid.truckNumber}\n🌟 Rating Given: ${ratingStars} / 5 Stars\n🏷️ Performance Badges: ${selectedRatingTags.join(', ')}\n\nThank you! Motive DRIVE safety score updated across platform.`
    );

    setShowRatingModal(false);
    setRatingTargetBid(null);
  };

  const handleCloseShipmentAndRateDriver = (bid: DriverCounterBid) => {
    const final70Percent = Math.round(bid.offeredBidPrice * 0.7);

    const confirmed = confirm(
      `Acknowledge shipment delivery for "${bid.loadTitle}"?\n\nThis will release and transfer the 70% final freight payment of Rs. ${final70Percent.toLocaleString()} directly to driver ${bid.driverName}'s account.`
    );
    if (!confirmed) return;

    // 1. Update bids status to 'completed'
    const updated = bids.map((b) => (b.id === bid.id ? { ...b, status: 'completed' as const, isAcknowledgedByShipper: true } : b));
    saveBidsToStorage(updated);

    // 2. Transfer 70% final payment to Driver account wallet
    try {
      const storedWallet = localStorage.getItem('safarload_driver_wallet');
      const currentBal = storedWallet ? Number(storedWallet) : 0;
      const newBal = currentBal + final70Percent;
      localStorage.setItem('safarload_driver_wallet', newBal.toString());
      localStorage.setItem('safarload_wallet_balance', newBal.toString());
    } catch (e) {
      console.error(e);
    }

    // 3. Update global posted load status to completed
    try {
      const storedLoads = localStorage.getItem('safarload_global_posted_loads');
      if (storedLoads) {
        const loads = JSON.parse(storedLoads);
        const updatedLoads = loads.map((l: any) =>
          l.id === bid.loadId || l.title?.includes(bid.loadTitle) ? { ...l, status: 'completed' } : l
        );
        localStorage.setItem('safarload_global_posted_loads', JSON.stringify(updatedLoads));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('safarload_loads_change'));
        }
      }
    } catch (e) {
      console.error(e);
    }

    alert(
      `✅ SHIPMENT DELIVERY ACKNOWLEDGED!\n\n👨‍✈️ Driver: ${bid.driverName}\n🚛 Vehicle: ${bid.truckNumber}\n💰 70% Final Freight Payment (Rs. ${final70Percent.toLocaleString()}) transferred directly to driver account!\n\nPlease submit your driver performance rating & review below.`
    );
    handleOpenRatingModal(bid);
  };

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* GLOBAL PLATFORM BANNERS & OVERDUE PAYMENT WARNINGS */}
      <GlobalBannerContainer />

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

      {/* Executive Metrics Overview Bar */}
      <div className={styles.metricsRow}>
        <div className={styles.metricChip}>
          <div className={styles.metricIcon}>🏢</div>
          <div>
            <div className={styles.metricVal}>Noor Textile Mills</div>
            <div className={styles.metricSub}>Enterprise Verified Shipper</div>
          </div>
        </div>

        <div className={styles.metricChip}>
          <div className={styles.metricIcon}>🛡️</div>
          <div>
            <div className={styles.metricVal}>Rs. {activeEscrowVaultBalance.toLocaleString()}</div>
            <div className={styles.metricSub}>Active Escrow Vault Protection</div>
          </div>
        </div>

        <div className={styles.metricChip}>
          <div className={styles.metricIcon}>🏷️</div>
          <div>
            <div className={styles.metricVal}>
              {bids.filter((b) => isShipperBid(b) && b.status === 'pending').length} Pending
            </div>
            <div className={styles.metricSub}>Driver Counter Bids Received</div>
          </div>
        </div>

        <div className={styles.metricChip}>
          <div className={styles.metricIcon}>🚛</div>
          <div>
            <div className={styles.metricVal}>
              {bids.filter((b) => isShipperBid(b) && (b.status === 'accepted' || b.status === 'completed')).length} En-Route / Closed
            </div>
            <div className={styles.metricSub}>Booked Trips & Active Bilty</div>
          </div>
        </div>
      </div>

      {/* 6-Tab Workspace Header Bar */}
      <nav className={styles.navTabRow}>
        <button
          onClick={() => setWorkspaceTab('post')}
          className={`${styles.workspaceTab} ${workspaceTab === 'post' ? styles.activeWorkspaceTab : ''}`}
        >
          ➕ {lang === 'ur' ? 'کارگو پوسٹ کریں' : 'Post Cargo Load'}
        </button>
        <button
          onClick={() => setWorkspaceTab('my-loads')}
          className={`${styles.workspaceTab} ${workspaceTab === 'my-loads' ? styles.activeWorkspaceTab : ''}`}
        >
          📋 {lang === 'ur' ? 'میرے پوسٹ شدہ لوڈز' : 'My Posted Loads'} ({myPostedLoads.length})
        </button>
        <button
          onClick={() => setWorkspaceTab('bids')}
          className={`${styles.workspaceTab} ${workspaceTab === 'bids' ? styles.activeWorkspaceTab : ''}`}
        >
          🏷️ {lang === 'ur' ? 'ڈرائیور بولیاں' : 'Live Driver Bids'} ({bids.filter((b) => isShipperBid(b) && b.status === 'pending').length})
        </button>
        <button
          onClick={() => setWorkspaceTab('booked')}
          className={`${styles.workspaceTab} ${workspaceTab === 'booked' ? styles.activeWorkspaceTab : ''}`}
        >
          🚛 {lang === 'ur' ? 'بک شدہ سفر' : 'Booked Shipments'} ({bids.filter((b) => isShipperBid(b) && (b.status === 'accepted' || b.status === 'completed')).length})
        </button>
        <button
          onClick={() => setWorkspaceTab('escrow')}
          className={`${styles.workspaceTab} ${workspaceTab === 'escrow' ? styles.activeWorkspaceTab : ''}`}
        >
          🛡️ {lang === 'ur' ? 'ایسکرو والٹ' : 'Escrow Vault Hub'}
        </button>
        <button
          onClick={() => setWorkspaceTab('radar')}
          className={`${styles.workspaceTab} ${workspaceTab === 'radar' ? styles.activeWorkspaceTab : ''}`}
        >
          🟢 {lang === 'ur' ? 'ڈرائیور رڈار' : 'Driver Return Radar'} ({availabilities.length})
        </button>
        <Link
          href="/dashboard/available-trucks"
          className={`${styles.workspaceTab}`}
          style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981' }}
        >
          🚛 {lang === 'ur' ? 'دستیاب فلیٹ گاڑیاں' : 'Available Fleet Trucks'} ➔
        </Link>
      </nav>

      {/* WORKSPACE TAB 1: POST CARGO LOAD & VOICE AI HERO */}
      {workspaceTab === 'post' && (
        <div className="animate-fadeIn">
          {/* Voice Posting Hero Card */}
          <div className={styles.voiceCard}>
            <div className={styles.voiceContent}>
              <div className={styles.voiceIconContainer}>
                <button
                  onClick={handleVoiceRecord}
                  className={`${styles.micButton} ${voicePosting ? styles.recording : ''}`}
                  title="Click to speak in Urdu"
                  aria-label="Urdu Voice AI Assistant Microphone"
                >
                  🎙️
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <h2>{lang === 'ur' ? '🗣️ اردو وائس اسسٹنٹ (آواز سے فارم بھریں)' : '🗣️ Urdu Voice AI Load Assistant'}</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.88rem', color: '#CBD5E1' }}>
                  {lang === 'ur'
                    ? 'مائیک پر کلک کریں اور بولیں: "مجھے ملتان سے کراچی کے لیے 25 ٹن کا ٹریلر 185,000 روپے میں چاہیے"'
                    : 'Click mic and speak: "I need a 25-ton trailer from Multan to Karachi for Rs. 185,000"'}
                </p>

                {voicePosting && (
                  <div className={styles.listeningBadge} style={{ marginTop: '0.5rem' }}>
                    <span className={styles.pulseDot}></span> {lang === 'ur' ? 'آواز سن رہا ہے... (Urdu Voice Active)' : 'Listening to audio stream...'}
                  </div>
                )}

                {voiceTranscript && (
                  <div style={{ marginTop: '0.5rem', background: '#0F172A', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '0.85rem', color: '#10B981' }}>
                    🎤 <strong>Captured Audio Transcript:</strong> "{voiceTranscript}"
                  </div>
                )}

                {voiceParsedSuccess && (
                  <div style={{ marginTop: '0.5rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10B981', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#10B981' }}>
                    🎉 <strong>Voice AI Auto-Filled Form!</strong> Route: <strong>{pickupCity} → {dropoffCity}</strong> | Truck: <strong>{truckType} ({weightTons}T)</strong> | Cargo: <strong>{cargoType}</strong> | Freight Budget: <strong>Rs. {Number(offeredPrice).toLocaleString()}</strong>
                  </div>
                )}

                {/* SAMPLE URDU VOICE COMMAND BUTTONS */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8', alignSelf: 'center' }}>🗣️ Sample Audio Prompts:</span>
                  <button
                    type="button"
                    onClick={() => simulateSampleVoicePrompt('🗣️ "مجھے ملتان سے کراچی کے لیے 25 ٹن ٹیکسٹائل کا ٹریلر چاہیے، کرایہ 185000 روپے"')}
                    className="badge badge-info"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    🗣️ Multan → Karachi (25T Trailer Rs 185k)
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateSampleVoicePrompt('🗣️ "مجھے فیصل آباد سے کراچی 18 ٹن کاٹن 22 وہیلر 165000 روپے میں چاہیے"')}
                    className="badge badge-info"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    🗣️ Faisalabad → Karachi (18T 22-Wheeler Rs 165k)
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateSampleVoicePrompt('🗣️ "مجھے لاہور سے پشاور 10 ٹن مشینری کا مزدا 95000 روپے میں چاہیے"')}
                    className="badge badge-info"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    🗣️ Lahore → Peshawar (10T Mazda Rs 95k)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WORKSPACE TAB: MY POSTED CARGO LOADS */}
      {workspaceTab === 'my-loads' && (
        <section className={`${styles.bidsSection} glass-card animate-fadeIn`}>
          <div className={styles.bidsHeader}>
            <div>
              <h3>📋 {lang === 'ur' ? 'میرے فعال پوسٹ شدہ کارگو لوڈز' : 'My Active Posted Cargo Loads Board'} ({myPostedLoads.length})</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Manage your active posted freight shipments. Edit details or delete postings from the live driver board.
              </p>
            </div>
            <button onClick={() => setWorkspaceTab('post')} className="btn btn-primary btn-sm">
              ➕ {lang === 'ur' ? 'نیا لوڈ بنائیں' : 'Post New Load'}
            </button>
          </div>

          {myPostedLoads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📦</div>
              <p style={{ margin: 0, fontSize: '1rem' }}>No active posted loads. Click <strong>"➕ Post New Load"</strong> to broadcast cargo to 52,000+ drivers.</p>
            </div>
          ) : (
            <div className="tableContainer" style={{ marginTop: '1rem' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Load ID & Posted Date</th>
                    <th>Pickup & Delivery Route</th>
                    <th>Cargo & Weight</th>
                    <th>Truck Type</th>
                    <th>Offered Rate (PKR)</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myPostedLoads.map((load) => (
                    <tr key={load.id}>
                      <td>
                        <strong>{load.id}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>📅 {load.pickupDate || load.postedDate || 'Today'}</div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)' }}>📍 {load.pickupCity} → 🏁 {load.dropoffCity}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{load.pickupAddress?.split(',')[0]}</div>
                      </td>
                      <td>
                        <strong>📦 {load.cargoType}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>⚖️ {load.weight || `${load.weightTons} Tons`}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">🚛 {load.truckType}</span>
                      </td>
                      <td>
                        <strong style={{ color: '#10B981', fontSize: '1.05rem' }}>Rs. {Number(load.price).toLocaleString()}</strong>
                      </td>
                      <td>
                        <span className="badge badge-success">🟢 Live on Board</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setEditingLoadTarget(load)}
                            className="btn btn-glass btn-sm"
                            title="Edit Load"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLoad(load.id)}
                            className="btn btn-accent btn-sm"
                            title="Delete Load"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* WORKSPACE TAB 2: LIVE DRIVER BIDS & COUNTER-OFFERS */}
      {workspaceTab === 'bids' && (
        <section className={`${styles.bidsSection} glass-card animate-fadeIn`}>
          <div className={styles.bidsHeader}>
            <div>
              <h3>🏷️ Pending Driver Counter Bids ({bids.filter((b) => isShipperBid(b) && b.status === 'pending').length})</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Review driver offers, initiate direct voice calls, send counter offers, or accept deal.
              </p>
            </div>
          </div>

          <div className={styles.bidsGrid}>
            {bids
              .filter((b) => isShipperBid(b) && b.status === 'pending')
              .map((b) => (
                <div key={b.id} className={styles.bidCard}>
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
                    <button
                      onClick={() =>
                        initiateVoIPCall({
                          id: b.id,
                          name: b.driverName,
                          phone: b.driverPhone,
                          truck: `${b.truckNumber} (${b.truckType})`,
                          role: 'driver',
                        })
                      }
                      className="btn btn-glass btn-sm"
                    >
                      📞 {lang === 'ur' ? 'کال ڈرائیور' : 'Call Driver'}
                    </button>
                    <button onClick={() => handleAcceptBid(b.id)} className="btn btn-primary btn-sm">
                      ✅ {lang === 'ur' ? 'بولی قبول کریں' : 'Accept Bid'}
                    </button>
                    <button onClick={() => handleOpenCounterBackModal(b)} className="btn btn-secondary btn-sm">
                      🔄 {lang === 'ur' ? 'جوابی آفر' : 'Counter Back'}
                    </button>
                    <button onClick={() => handleRejectBid(b.id)} className="btn btn-accent btn-sm">
                      ❌ {lang === 'ur' ? 'مسترد' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* WORKSPACE TAB 3: BOOKED SHIPMENTS & EN-ROUTE TRIPS */}
      {workspaceTab === 'booked' && (
        <section className={`${styles.bidsSection} glass-card animate-fadeIn`}>
          <div className={styles.bidsHeader}>
            <div>
              <h3>🚛 Active Booked Shipments & En-Route Drivers</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Track en-route trucks, contact drivers via VoIP call, and inspect Digital Bilty.
              </p>
            </div>
          </div>

          <div className={styles.bidsGrid}>
            {bids
              .filter((b) => isShipperBid(b) && (b.status === 'accepted' || b.status === 'completed'))
              .map((b) => (
                <div key={b.id} className={`${styles.bidCard} ${styles.acceptedBid}`}>
                  <div className={styles.bidCardHeader}>
                    <div>
                      <strong>👨‍✈️ {b.driverName} ({b.driverNameUr})</strong>
                      <span className={styles.bidRating}>⭐ {b.driverRating} • 🚛 {b.truckNumber}</span>
                    </div>
                    <div className={styles.bidPriceTag}>
                      Rs. {b.offeredBidPrice.toLocaleString()}
                    </div>
                  </div>

                  <div className={styles.bidMeta}>
                    <p>📍 <strong>Route:</strong> {b.route}</p>
                    <p>📦 <strong>Shipment:</strong> {b.loadTitle}</p>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '4px' }}>
                      {b.status === 'completed' ? (
                        <span className="badge badge-success" style={{ background: '#059669', color: '#FFFFFF', fontWeight: 700 }}>
                          ✅ Delivered & Closed / ٹرپ بند ہو گیا
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          ● En Route / راستے میں (Escrow Protected)
                        </span>
                      )}
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        🛡️ Motive DRIVE: 98/100 (Safe Hauler)
                      </span>
                    </div>
                    {(b as any).shipperRatingSubmitted && (
                      <div style={{ marginTop: '0.5rem', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid #F59E0B', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#F59E0B' }}>
                        ⭐ <strong>Your Rating:</strong> {(b as any).shipperRatingSubmitted.stars}★ | <strong>Badges:</strong> {(b as any).shipperRatingSubmitted.tags?.join(', ')}
                        {(b as any).shipperRatingSubmitted.comment && <div>💬 "{(b as any).shipperRatingSubmitted.comment}"</div>}
                      </div>
                    )}
                  </div>

                  <div className={styles.bidActions} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    {b.status === 'accepted' && (
                      <button
                        onClick={() => handleCloseShipmentAndRateDriver(b)}
                        className="btn btn-success btn-sm"
                        style={{
                          width: '100%',
                          background: '#10B981',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          padding: '0.6rem 1rem',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        ✅ {lang === 'ur' ? 'ڈیلیوری کی تصدیق کریں اور 70% ادائیگی بھیجیں' : 'Acknowledge Delivery & Release 70% Payment to Driver'}
                      </button>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button
                        onClick={() =>
                          initiateVoIPCall({
                            id: b.id,
                            name: b.driverName,
                            phone: b.driverPhone,
                            truck: `${b.truckNumber} (${b.truckType})`,
                            role: 'driver',
                          })
                        }
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        📞 Call Driver Direct
                      </button>
                      <button onClick={() => setChatTargetDriver(b)} className="btn btn-glass btn-sm" style={{ flex: 1 }}>
                        💬 Chat
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button onClick={() => handleOpenBilty(b)} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                        📜 {lang === 'ur' ? 'ڈیجیٹل بلٹی دیکھیں' : 'View Digital Bilty'}
                      </button>
                      <button onClick={() => handleOpenRatingModal(b)} className="btn btn-warning btn-sm" style={{ flex: 1 }}>
                        ⭐ {(b as any).shipperRatingSubmitted ? `Rated ${(b as any).shipperRatingSubmitted.stars}★` : 'Rate Driver'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* WORKSPACE TAB 4: ESCROW VAULT HUB */}
      {workspaceTab === 'escrow' && (
        <section className={`${styles.bidsSection} glass-card animate-fadeIn`}>
          <div className="animate-fadeIn" style={{ padding: '0.5rem 0' }}>
            {/* ESCROW STATS OVERVIEW CARDS */}
            <div className={styles.rowGrid} style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <div className="stat-card-icon">🛡️</div>
                <div className="stat-card-value">Rs. {activeEscrowVaultBalance.toLocaleString()}</div>
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

            {/* PAYMENT SLIPS & BANK VERIFICATION HISTORY TABLE */}
            <div style={{ marginTop: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                    🧾 Payment Slips & Bank Verification History
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    Track status of uploaded bank & mobile wallet deposit slips submitted to SafarLoad Finance Team.
                  </p>
                </div>
                <span className="badge badge-info">
                  {depositSlips.filter((s) => s.shipperName.includes('Noor Textile Mills') || s.shipperName.includes(currentShipperName)).length} Total Slips
                </span>
              </div>

              <div className="tableContainer">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Slip ID & Date</th>
                      <th>Payment Gateway</th>
                      <th>Transaction TRX #</th>
                      <th>Amount (PKR)</th>
                      <th>Deposit Slip Receipt</th>
                      <th>Finance Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depositSlips
                      .filter((s) => s.shipperName.includes('Noor Textile Mills') || s.shipperName.includes(currentShipperName))
                      .length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                          No deposit slips submitted yet. Click <strong>"+ Deposit Funds to Escrow Vault"</strong> to submit your bank deposit slip.
                        </td>
                      </tr>
                    ) : (
                      depositSlips
                        .filter((s) => s.shipperName.includes('Noor Textile Mills') || s.shipperName.includes(currentShipperName))
                        .map((slip) => (
                          <tr key={slip.id}>
                            <td>
                              <strong>{slip.id}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{slip.timestamp}</div>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--color-primary)' }}>{slip.paymentMethod}</strong>
                            </td>
                            <td>
                              <code style={{ background: '#1E293B', padding: '2px 6px', borderRadius: '4px', color: '#F59E0B' }}>
                                {slip.referenceTxId}
                              </code>
                            </td>
                            <td>
                              <strong style={{ color: '#10B981' }}>Rs. {slip.amountPkr.toLocaleString()}</strong>
                            </td>
                            <td>
                              {slip.slipImageUrl ? (
                                <button
                                  onClick={() => setPreviewSlipUrl(slip.slipImageUrl || null)}
                                  className="btn btn-glass btn-sm"
                                >
                                  🖼️ View Slip
                                </button>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No Image</span>
                              )}
                            </td>
                            <td>
                              {slip.status === 'approved' && (
                                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  🟢 Verified & Credited to Vault
                                </span>
                              )}
                              {slip.status === 'pending' && (
                                <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  🟡 Pending Bank Verification
                                </span>
                              )}
                              {slip.status === 'rejected' && (
                                <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  🔴 Rejected ({slip.rejectionReason || 'TRX Mismatch'})
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WORKSPACE TAB 5: RETURN DRIVER RADAR */}
      {workspaceTab === 'radar' && (
        <section className={`${styles.availSection} glass-card animate-fadeIn`}>
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
                    <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700, marginTop: '2px' }}>
                      ⭐ {a.driverRating || 4.8} / 5.0 ({a.completedTrips || 120} Completed Trips)
                    </div>
                    <div className={styles.availCity}>📍 At: {a.currentLocation}</div>
                  </div>
                  <span className="badge badge-info">{a.truckType}</span>
                </div>

                {/* DRIVER HEALTH & MEDICAL CLEARANCE BADGE */}
                <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', margin: '0.5rem 0', fontSize: '0.78rem' }}>
                  <span style={{ color: '#10B981', fontWeight: 700, display: 'block' }}>🩺 {a.healthStatus || 'Medical Fitness Verified ✅ (Eye Vision 6/6, Drug Free)'}</span>
                </div>

                {/* REGISTERED FLEET COMPANY VERIFICATION GUARANTEE */}
                {a.isFleetManaged && (
                  <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', margin: '0.5rem 0', fontSize: '0.78rem' }}>
                    <span style={{ color: '#3B82F6', fontWeight: 700, display: 'block' }}>🏢 Registered Fleet Company Backed:</span>
                    <strong style={{ color: 'var(--color-text-primary)' }}>{a.fleetCompanyName || 'Al-Farooq Transport Co. (SECP NTN Verified)'}</strong>
                    <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Manager: {a.fleetManager || 'Ahmad Farooq (Verified Owner)'}</span>
                  </div>
                )}

                <div className={styles.prefRouteBox}>
                  <span>🎯 {lang === 'ur' ? 'مطلوبہ واپسی کا روٹ:' : 'Preferred Next Route:'}</span>
                  <strong className={styles.destText}>{a.preferredDestination}</strong>
                </div>

                <div className={styles.availMetaRow}>
                  <span>⚖️ Capacity: {a.availableCapacityTons} Tons</span>
                  <span>⏱️ Departure: {a.departureTime}</span>
                </div>

                <div className={styles.availActionRow} style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() =>
                      initiateVoIPCall({
                        id: a.id,
                        name: a.driverName,
                        phone: a.driverPhone,
                        truck: a.truckType,
                        role: 'driver',
                      })
                    }
                    className="btn btn-glass btn-sm"
                  >
                    📞 Call
                  </button>
                  <button
                    onClick={() => setAgentDealTarget(a)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    🤖 {lang === 'ur' ? 'AI / ایجنٹ ڈیل' : 'AI & Agent Deal Lock'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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

                  {/* GOOGLE MAPS & GPS LOCATION PICKER CONTROLS FOR PICKUP */}
                  <div className={styles.inputGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ margin: 0 }}>🏭 {lang === 'ur' ? 'پک اپ کا مکمل پتہ / فیکٹری' : 'Pickup Address / Factory Loading Gate'}</label>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleDetectGpsLocation('pickup')}
                          className="btn btn-glass btn-sm"
                          disabled={isDetectingGps}
                        >
                          🎯 {isDetectingGps ? 'Detecting...' : 'Detect My GPS'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenMapPicker('pickup')}
                          className="btn btn-primary btn-sm"
                        >
                          🗺️ Pick on Google Map
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      className="input"
                      placeholder="Search Google Maps or type address (e.g. Gate 3, Bosan Road Industrial Estate)"
                    />

                    {/* QUICK PRESET INDUSTRIAL ESTATE CHIPS */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>🏭 Quick Presets:</span>
                      <button
                        type="button"
                        onClick={() => { setPickupCity('Multan'); setPickupAddress('Multan Industrial Estate Gate 3, Bosan Road (GPS: 30.1978°N, 71.4697°E)'); }}
                        className="badge badge-info"
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        Multan Ind. Estate Gate 3
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPickupCity('Lahore'); setPickupAddress('Sundar Industrial Estate Gate 1, Raiwind Road (GPS: 31.2912°N, 74.1725°E)'); }}
                        className="badge badge-info"
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        Sundar Ind. Estate Lahore
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPickupCity('Faisalabad'); setPickupAddress('Faisalabad Galla Mandi Grain Market Gate 2 (GPS: 31.4187°N, 73.0791°E)'); }}
                        className="badge badge-info"
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        Faisalabad Galla Mandi
                      </button>
                    </div>
                  </div>

                  {/* GOOGLE MAPS & GPS LOCATION PICKER CONTROLS FOR DROPOFF */}
                  <div className={styles.inputGroup} style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ margin: 0 }}>🏢 {lang === 'ur' ? 'ڈیلیوری کا پتہ' : 'Dropoff Address / Unloading Port'}</label>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleDetectGpsLocation('dropoff')}
                          className="btn btn-glass btn-sm"
                          disabled={isDetectingGps}
                        >
                          🎯 GPS Pin
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenMapPicker('dropoff')}
                          className="btn btn-primary btn-sm"
                        >
                          🗺️ Pick on Google Map
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      className="input"
                      placeholder="Search Google Maps or type address (e.g. Port Qasim Terminal 2, Karachi)"
                    />

                    {/* QUICK PRESET DROPOFF PORTS */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>🚢 Port Presets:</span>
                      <button
                        type="button"
                        onClick={() => { setDropoffCity('Karachi'); setDropoffAddress('Port Qasim Container Terminal 2, Bin Qasim Town (GPS: 24.7733°N, 67.3392°E)'); }}
                        className="badge badge-warning"
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        Port Qasim Karachi Gate 2
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDropoffCity('Karachi'); setDropoffAddress('Karachi Port Trust (KPT) East Wharf Gate 4 (GPS: 24.8422°N, 66.9881°E)'); }}
                        className="badge badge-warning"
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        KPT Port Karachi Gate 4
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDropoffCity('Peshawar'); setDropoffAddress('Torkham Dry Port Border Customs Yard (GPS: 34.1221°N, 71.0921°E)'); }}
                        className="badge badge-warning"
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        Torkham Border Peshawar
                      </button>
                    </div>
                  </div>

                  {/* LIVE ROUTE DISTANCE ESTIMATE BANNER */}
                  {(() => {
                    const activeRoute = getRouteDistanceDetails(pickupCity, dropoffCity);
                    return (
                      <div style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginTop: '1.25rem', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          🗺️ Google Maps Live Transit Route Distance Calculation
                        </div>
                        <div style={{ color: '#CBD5E1', marginTop: '4px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span>📍 Route: <strong>{pickupCity} ({pickupAddress.split(',')[0] || 'Factory'}) → {dropoffCity} ({dropoffAddress.split(',')[0] || 'Port'})</strong></span>
                          <span>📏 Distance: <strong style={{ color: '#10B981' }}>~{activeRoute.km} km ({activeRoute.motorway})</strong></span>
                          <span>⏱️ Est. Driving Time: <strong style={{ color: '#F59E0B' }}>{activeRoute.hours} Hours</strong></span>
                        </div>
                      </div>
                    );
                  })()}

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
                        <option value="FMCG & General">FMCG & General Goods / 📦 عام تجارتی سامان</option>
                        <option value="Chemicals & Fertilizer">Chemicals & Fertilizer / 🧪 کیمیکلز اور کھاد</option>
                        <option value="Electronics">Electronics & Appliances / 📺 الیکٹرانکس</option>
                        <option value="custom">➕ {lang === 'ur' ? 'نیا سامان درج کریں (دیگر)' : '+ Add Custom Cargo Type...'}</option>
                      </select>
                      {cargoType === 'custom' && (
                        <input
                          type="text"
                          className="input"
                          placeholder={lang === 'ur' ? 'نئے سامان کی تفصیل ٹائپ کریں' : 'Type custom cargo description (e.g. Cotton Yarn Bales, Marble Slabs)'}
                          onChange={(e) => setCargoType(e.target.value)}
                          style={{ marginTop: '0.5rem' }}
                        />
                      )}
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
                      <label>💰 {lang === 'ur' ? 'بنیادی کرایہ (پیش کردہ رقم روپے میں)' : 'Base Offered Freight Budget (PKR)'}</label>
                      <input
                        type="number"
                        value={offeredPrice}
                        onChange={(e) => setOfferedPrice(e.target.value)}
                        className="input input-lg"
                      />
                      
                      {/* SHIPPER FREIGHT ESCROW SETTLEMENT BOX */}
                      <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>🌐 Shipper Freight Escrow Settlement:</span>
                          <span className="badge badge-success">Escrow Protected</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                          <div>• Base Freight Budget: <strong>Rs. {Number(offeredPrice).toLocaleString()}</strong></div>
                          <div>• Shipper Platform Fee (+2.0%): <strong style={{ color: 'var(--color-primary)' }}>+ Rs. {(Number(offeredPrice) * 0.02).toLocaleString()}</strong></div>
                          <div>• 💳 <strong>Total Escrow Deposit Required:</strong></div>
                          <div><strong style={{ color: '#10B981', fontSize: '1rem' }}>Rs. {(Number(offeredPrice) * 1.02).toLocaleString()}</strong></div>
                          <div>• ⛽ 30% Fuel Advance Escrow Held: <strong>Rs. {(Number(offeredPrice) * 0.3).toLocaleString()}</strong></div>
                          <div>• 🔒 70% Final Delivery Escrow Locked: <strong>Rs. {(Number(offeredPrice) * 0.7).toLocaleString()}</strong></div>
                        </div>
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          🛡️ <em>100% Vault Protection: 30% advance is released to driver upon Bilty loading & 70% final balance is released upon OTP delivery code verification.</em>
                        </div>
                      </div>
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

                    {/* CARGO TRANSIT INSURANCE PROTECTION SELECTOR */}
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--color-primary)' }}>🛡️ Mandatory Cargo Transit Theft & Absconding Insurance</strong>
                        <span className="badge badge-success">EFU / Adamjee Partnered</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                        Guarantees 100% loss coverage to Shipper in case of transit theft, robbery, accidents, or driver absconding.
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        <label style={{ cursor: 'pointer' }}>
                          <input type="radio" name="cargoInsurance" defaultChecked /> 🛡️ Standard Comprehensive Cover (Rs. 750 / shipment)
                        </label>
                        <label style={{ cursor: 'pointer' }}>
                          <input type="radio" name="cargoInsurance" /> 👑 High-Value Special Risk Cover (Rs. 1,500 / shipment)
                        </label>
                      </div>
                    </div>

                    {/* LEGAL MARKETPLACE DISCLAIMER BOX */}
                    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'var(--color-bg-secondary)', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      ⚖️ <strong>Legal Disclaimer:</strong> SafarLoad operates as a digital technology marketplace connecting shippers with verified drivers. Drivers are independent contractors who undergo NADRA Biometric CNIC, CCT Police Clearance, and Guarantor verification before accepting loads.
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

      {/* DEPOSIT ESCROW FUNDS & PAYMENT SLIP MODAL */}
      {showDepositModal && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '650px', width: '90%' }}>
            <div className={styles.modalHeader}>
              <h3>💳 Deposit Funds & Post Slip to Escrow Vault</h3>
              <button onClick={() => setShowDepositModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            {/* GATEWAY SELECTION TABS */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setSelectedGateway('meezan')}
                className={`btn btn-sm ${selectedGateway === 'meezan' ? 'btn-primary' : 'btn-glass'}`}
                style={{ flex: 1 }}
              >
                🏦 Bank IBFT (Meezan/HBL)
              </button>
              <button
                type="button"
                onClick={() => setSelectedGateway('jazzcash')}
                className={`btn btn-sm ${selectedGateway === 'jazzcash' ? 'btn-primary' : 'btn-glass'}`}
                style={{ flex: 1 }}
              >
                📱 JazzCash Account
              </button>
              <button
                type="button"
                onClick={() => setSelectedGateway('easypaisa')}
                className={`btn btn-sm ${selectedGateway === 'easypaisa' ? 'btn-primary' : 'btn-glass'}`}
                style={{ flex: 1 }}
              >
                📱 EasyPaisa Account
              </button>
            </div>

            {/* GATEWAY INSTRUCTIONS */}
            {selectedGateway === 'meezan' && (
              <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div style={{ fontWeight: 700, color: '#3B82F6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏛️ Meezan Bank / HBL Escrow Bank Account Details
                </div>
                <div style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>Bank Name: <strong style={{ color: '#FFF' }}>Meezan Bank Ltd</strong></div>
                  <div>Branch: <strong style={{ color: '#FFF' }}>Corporate Freight Branch</strong></div>
                  <div>Account Title: <strong style={{ color: '#10B981' }}>SafarLoad Pakistan Pvt Ltd</strong></div>
                  <div>Account #: <strong style={{ color: '#FFF' }}>0102 9842107401</strong></div>
                  <div style={{ gridColumn: 'span 2' }}>IBAN Number: <strong style={{ color: '#F59E0B' }}>PK36 MEZN 0001 0203 0405 0607</strong></div>
                </div>
              </div>
            )}

            {selectedGateway === 'jazzcash' && (
              <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ fontWeight: 700, color: '#F59E0B', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📱 JazzCash Merchant Account Details
                </div>
                <div style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>Merchant Name: <strong style={{ color: '#FFF' }}>SafarLoad Escrow Vault</strong></div>
                  <div>JazzCash Till ID: <strong style={{ color: '#10B981' }}>0984210</strong></div>
                  <div>Mobile Transfer #: <strong style={{ color: '#F59E0B' }}>0300 1234567</strong></div>
                  <div>Account Type: <strong style={{ color: '#FFF' }}>Verified Corporate Wallet</strong></div>
                </div>
              </div>
            )}

            {selectedGateway === 'easypaisa' && (
              <div style={{ background: '#1E293B', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ fontWeight: 700, color: '#10B981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📱 EasyPaisa Merchant Account Details
                </div>
                <div style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>Merchant Title: <strong style={{ color: '#FFF' }}>SafarLoad Freight Vault</strong></div>
                  <div>EasyPaisa Till ID: <strong style={{ color: '#10B981' }}>7722100</strong></div>
                  <div>EasyPaisa Number: <strong style={{ color: '#F59E0B' }}>0345 7654321</strong></div>
                  <div>Account Type: <strong style={{ color: '#FFF' }}>Verified Merchant Wallet</strong></div>
                </div>
              </div>
            )}

            <form onSubmit={handleDepositSubmit}>
              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label>Deposit Amount (PKR - رقم درج کریں):</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="input input-lg"
                    placeholder="e.g. 200000"
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Transaction Ref / TRX # (ٹرانزیکشن شناختی نمبر):</label>
                  <input
                    type="text"
                    value={depositTrxId}
                    onChange={(e) => setDepositTrxId(e.target.value)}
                    className="input input-lg"
                    placeholder="e.g. TRX-98472910 or JZ-88443311"
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                <label>🧾 Attach Payment Deposit Slip Image / Receipt (رسید منسلک کریں):</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="input"
                    style={{ padding: '0.4rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDepositSlipFile('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400');
                      setDepositSlipFileName('sample_bank_slip.png');
                    }}
                    className="btn btn-glass btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    📎 Sample Slip
                  </button>
                </div>
                {depositSlipFileName && (
                  <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '4px' }}>
                    ✅ Selected Attachment: {depositSlipFileName}
                  </div>
                )}
                {depositSlipFile && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img src={depositSlipFile} alt="Deposit Slip Preview" style={{ maxHeight: '120px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                )}
              </div>

              <div className={styles.modalActions} style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowDepositModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  📤 Post Deposit Slip for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LOAD MODAL */}
      {editingLoadTarget && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '650px', width: '90%' }}>
            <div className={styles.modalHeader}>
              <h3>✏️ Edit Posted Load — {editingLoadTarget.id}</h3>
              <button onClick={() => setEditingLoadTarget(null)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSaveEditedLoad}>
              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label>📍 Pickup City:</label>
                  <input
                    type="text"
                    value={editingLoadTarget.pickupCity || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, pickupCity: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>🏁 Delivery City:</label>
                  <input
                    type="text"
                    value={editingLoadTarget.dropoffCity || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, dropoffCity: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>🏭 Pickup Address / Loading Gate:</label>
                <input
                  type="text"
                  value={editingLoadTarget.pickupAddress || ''}
                  onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, pickupAddress: e.target.value })}
                  className="input"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>🏢 Dropoff Address / Destination:</label>
                <input
                  type="text"
                  value={editingLoadTarget.dropoffAddress || ''}
                  onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, dropoffAddress: e.target.value })}
                  className="input"
                />
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label>📦 Cargo Type:</label>
                  <input
                    type="text"
                    value={editingLoadTarget.cargoType || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, cargoType: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>⚖️ Total Weight (Tons):</label>
                  <input
                    type="text"
                    value={editingLoadTarget.weightTons || editingLoadTarget.weight || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, weightTons: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.inputGroup}>
                  <label>🚛 Required Truck Type:</label>
                  <input
                    type="text"
                    value={editingLoadTarget.truckType || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, truckType: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>💰 Freight Rate (PKR):</label>
                  <input
                    type="number"
                    value={editingLoadTarget.price || ''}
                    onChange={(e) => setEditingLoadTarget({ ...editingLoadTarget, price: e.target.value })}
                    className="input input-lg"
                    required
                  />
                </div>
              </div>

              <div className={styles.modalActions} style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEditingLoadTarget(null)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 Save & Update Load
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SLIP PREVIEW IMAGE MODAL */}
      {previewSlipUrl && (
        <div className={styles.modalBackdrop} onClick={() => setPreviewSlipUrl(null)}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '500px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>🧾 Bank Deposit Slip Receipt Preview</h3>
              <button onClick={() => setPreviewSlipUrl(null)} className={styles.closeBtn}>✕</button>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <img src={previewSlipUrl} alt="Bank Deposit Receipt" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setPreviewSlipUrl(null)} className="btn btn-glass">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* SHIPPER DRIVER RATING & REVIEW MODAL */}
      {showRatingModal && ratingTargetBid && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`} style={{ maxWidth: '540px', border: '1px solid #F59E0B' }}>
            <div className={styles.modalHeader} style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
              <h3 style={{ color: '#F59E0B' }}>⭐ Rate & Review Driver — {ratingTargetBid.driverName}</h3>
              <button onClick={() => setShowRatingModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <form onSubmit={handleSubmitDriverRating} style={{ padding: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  How was your experience with driver <strong>{ratingTargetBid.driverName}</strong> on route <strong>{ratingTargetBid.route}</strong>?
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '2rem', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRatingStars(star)}
                      style={{
                        color: star <= ratingStars ? '#F59E0B' : '#475569',
                        transition: 'transform 0.15s ease',
                        transform: star <= ratingStars ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F59E0B', marginTop: '0.25rem' }}>
                  {ratingStars === 5 && '🌟 Excellent Performance (آلہ کارکردگی)'}
                  {ratingStars === 4 && '👍 Good Service (اچھی سروس)'}
                  {ratingStars === 3 && '😐 Average Service (مناسب سروس)'}
                  {ratingStars === 2 && '👎 Below Expectations (کمزور سروس)'}
                  {ratingStars === 1 && '⚠️ Poor Service (خراب سروس)'}
                </div>
              </div>

              {/* FEEDBACK TAGS */}
              <div className={styles.inputGroup} style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.5rem', display: 'block' }}>
                  Select Performance Badges (پرفارمنس ٹیگز):
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    '⚡ Punctual & On-Time',
                    '🛡️ Safe Cargo Handling',
                    '🤝 Professional & Polite',
                    '🚛 Clean & Well-Maintained Truck',
                    '📍 Live GPS Compliant',
                    '📄 Complete Paperwork/Bilty',
                  ].map((tag) => {
                    const isSelected = selectedRatingTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleRatingTag(tag)}
                        style={{
                          padding: '0.4rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          border: `1px solid ${isSelected ? '#F59E0B' : 'rgba(255,255,255,0.15)'}`,
                          background: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                          color: isSelected ? '#F59E0B' : '#CBD5E1',
                          cursor: 'pointer',
                        }}
                      >
                        {isSelected ? '✅ ' : '+ '}{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* COMMENT TEXTAREA */}
              <div className={styles.inputGroup} style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '0.35rem', display: 'block' }}>
                  Feedback & Review Notes (ڈرائیور کے لیے جائزہ):
                </label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="e.g. Excellent driver! Delivered cotton bales safely to Karachi on time without any damage."
                  className="input"
                  rows={3}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div className={styles.modalActions} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRatingModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning">
                  ⭐ Submit Driver Rating & Review
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
