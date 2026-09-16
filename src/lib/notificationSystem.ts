export interface AppNotification {
  id: string;
  titleEn: string;
  titleUr: string;
  messageEn: string;
  messageUr: string;
  timestamp: string;
  type: 'cargo_posted' | 'driver_available' | 'bid_received' | 'trip_accepted' | 'escrow_released' | 'kyc_verified';
  targetRole: 'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin' | 'all';
  read: boolean;
  actionUrl?: string;
}

export const initialNotifications: AppNotification[] = [
  {
    id: 'NOTIF-101',
    titleEn: '📦 New Cargo Request Posted',
    titleUr: '📦 نیا کارگو لوڈ شائع ہوا',
    messageEn: 'Noor Textile Mills posted a 25-Ton load: Multan → Karachi (Rs. 185,000). Tap to view and bid.',
    messageUr: 'نور ٹیکسٹائل ملز نے ملتان تا کراچی 25 ٹن کارگو پوسٹ کیا (185,000 روپے)۔',
    timestamp: 'Just now',
    type: 'cargo_posted',
    targetRole: 'driver',
    read: false,
    actionUrl: '/dashboard/loads',
  },
  {
    id: 'NOTIF-102',
    titleEn: '🚛 Driver Available Nearby',
    titleUr: '🚛 ڈرائیور دستیاب ہے',
    messageEn: 'Driver (Flatbed Trailer LHR-5678) marked AVAILABLE in Multan!',
    messageUr: 'محمد اسلم (ٹرالر LHR-5678) ملتان میں خالی گاڑی کے ساتھ دستیاب ہے۔',
    timestamp: '5m ago',
    type: 'driver_available',
    targetRole: 'shipper',
    read: false,
    actionUrl: '/dashboard/post-load',
  },
  {
    id: 'NOTIF-103',
    titleEn: '⚡ Counter Offer Received',
    titleUr: '⚡ نئی بولی موصول ہوئی',
    messageEn: 'Abdul Rasheed offered Rs. 160,000 for Faisalabad → Karachi cargo.',
    messageUr: 'عبد الرشید نے فیصل آباد تا کراچی کارگو کے لیے 160,000 روپے کی پیشکش کی۔',
    timestamp: '12m ago',
    type: 'bid_received',
    targetRole: 'shipper',
    read: false,
    actionUrl: '/dashboard/post-load',
  },
  {
    id: 'NOTIF-104',
    titleEn: '🎉 Load Booked & Escrow Locked',
    titleUr: '🎉 سفر کنفرم اور ایسکرو محفوظ',
    messageEn: 'Rs. 185,000 locked in SafarLoad Escrow for Multan → Karachi trip. Bilty generated.',
    messageUr: '185,000 روپے ایسکرو میں محفوظ۔ ڈیجیٹل بلٹی تیار ہے۔',
    timestamp: '1h ago',
    type: 'trip_accepted',
    targetRole: 'driver',
    read: true,
    actionUrl: '/dashboard/trips',
  },
];

export function getStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return initialNotifications;
  try {
    const raw = localStorage.getItem('safarload_notifications');
    if (raw) return JSON.parse(raw);
    localStorage.setItem('safarload_notifications', JSON.stringify(initialNotifications));
    return initialNotifications;
  } catch (e) {
    return initialNotifications;
  }
}

export function saveStoredNotifications(notifs: AppNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('safarload_notifications', JSON.stringify(notifs));
    window.dispatchEvent(new CustomEvent('safarload_notification_change', { detail: notifs }));
  } catch (e) {
    console.error(e);
  }
}

export function dispatchAppNotification(notifData: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
  const current = getStoredNotifications();
  const newNotif: AppNotification = {
    ...notifData,
    id: `NOTIF-${Date.now().toString().slice(-4)}`,
    timestamp: 'Just now',
    read: false,
  };
  const updated = [newNotif, ...current];
  saveStoredNotifications(updated);

  // Dispatch Toast Event for UI Banner popup
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('safarload_toast_event', { detail: newNotif }));
    
    // Request Native / Browser Web Push Notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotif.titleEn, {
        body: newNotif.messageEn,
        icon: '/favicon.ico',
      });
    }
  }
  return newNotif;
}

// Convenience Notification Triggers
export function triggerCargoPostedNotification(consignorName: string, route: string, pricePkr: number | string) {
  dispatchAppNotification({
    titleEn: '📦 New Cargo Request Posted!',
    titleUr: '📦 نیا کارگو لوڈ شائع ہوا!',
    messageEn: `${consignorName} posted a cargo load: ${route} (Rs. ${Number(pricePkr).toLocaleString()}). Tap to bid!`,
    messageUr: `${consignorName} نے کارگو لوڈ شائع کیا: ${route} (${Number(pricePkr).toLocaleString()} روپے)۔`,
    type: 'cargo_posted',
    targetRole: 'driver',
    actionUrl: '/dashboard/loads',
  });
}

export function triggerDriverAvailableNotification(driverName: string, truckType: string, city: string) {
  dispatchAppNotification({
    titleEn: '🚛 Driver Marked Available (خالی گاڑی)!',
    titleUr: '🚛 ڈرائیور دستیاب ہے (خالی گاڑی)!',
    messageEn: `${driverName} (${truckType}) is empty & available near ${city}. Tap to assign shipment!`,
    messageUr: `${driverName} (${truckType}) ${city} میں گاڑی کے ساتھ دستیاب ہے۔`,
    type: 'driver_available',
    targetRole: 'shipper',
    actionUrl: '/dashboard/post-load',
  });
}

export function triggerBidSubmittedNotification(driverName: string, pricePkr: number | string, route: string) {
  dispatchAppNotification({
    titleEn: '⚡ Counter Bid Submitted!',
    titleUr: '⚡ نئی بولی موصول ہوئی!',
    messageEn: `${driverName} submitted a counter bid of Rs. ${Number(pricePkr).toLocaleString()} for ${route}.`,
    messageUr: `${driverName} نے ${route} کے لیے ${Number(pricePkr).toLocaleString()} روپے کی بولی دی۔`,
    type: 'bid_received',
    targetRole: 'shipper',
    actionUrl: '/dashboard/post-load',
  });
}

export function triggerTripAcceptedNotification(driverName: string, pricePkr: number | string, route: string) {
  dispatchAppNotification({
    titleEn: '🎉 Trip Confirmed & Escrow Deposited!',
    titleUr: '🎉 سفر کنفرم اور ایسکرو محفوظ!',
    messageEn: `Trip for ${driverName} on ${route} confirmed. Rs. ${Number(pricePkr).toLocaleString()} locked in Escrow.`,
    messageUr: `${route} کے لیے سفر کی تصدیق ہو گئی۔ ${Number(pricePkr).toLocaleString()} روپے ایسکرو میں محفوظ۔`,
    type: 'trip_accepted',
    targetRole: 'driver',
    actionUrl: '/dashboard/trips',
  });
}

export function triggerBidRejectedNotification(driverName: string, pricePkr: number | string, route: string) {
  dispatchAppNotification({
    titleEn: '🔴 Counter Bid Rejected by Shipper',
    titleUr: '🔴 بولی شیپر نے مسترد کر دی',
    messageEn: `Your counter bid of Rs. ${Number(pricePkr).toLocaleString()} for ${route} was rejected by the Shipper. Tap to re-bid or view standard rates.`,
    messageUr: `${route} کے لیے آپ کی ${Number(pricePkr).toLocaleString()} روپے کی بولی شیپر نے مسترد کر دی ہے۔`,
    type: 'bid_rejected',
    targetRole: 'driver',
    actionUrl: '/dashboard/loads',
  });
}

export function triggerShipperCounterOfferNotification(driverName: string, pricePkr: number | string, route: string) {
  dispatchAppNotification({
    titleEn: '🔄 Shipper Sent Revised Counter Offer!',
    titleUr: '🔄 شیپر نے نئی پیشکش بھیجی!',
    messageEn: `Shipper sent a revised offer of Rs. ${Number(pricePkr).toLocaleString()} for ${route}. Tap to accept or respond!`,
    messageUr: `شیپر نے ${route} کے لیے ${Number(pricePkr).toLocaleString()} روپے کی نیں پیشکش بھیجی ہے۔`,
    type: 'bid_countered',
    targetRole: 'driver',
    actionUrl: '/dashboard/loads',
  });
}

