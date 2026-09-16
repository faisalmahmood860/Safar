export interface TestAccount {
  role: 'driver' | 'shipper' | 'fleet' | 'support' | 'finance' | 'admin';
  name: string;
  nameUr: string;
  email: string;
  phone: string;
  password: string;
  details: string;
}

export interface CityOption {
  en: string;
  ur: string;
  province: string;
}

// Comprehensive List of All Major Pakistani Freight & Logistics Cities
export const pakistaniCities: CityOption[] = [
  // Punjab
  { en: 'Lahore', ur: 'لاہور', province: 'Punjab' },
  { en: 'Karachi', ur: 'کراچی', province: 'Sindh' },
  { en: 'Faisalabad', ur: 'فیصل آباد', province: 'Punjab' },
  { en: 'Rawalpindi', ur: 'راولپنڈی', province: 'Punjab' },
  { en: 'Islamabad', ur: 'اسلام آباد', province: 'ICT' },
  { en: 'Multan', ur: 'ملتان', province: 'Punjab' },
  { en: 'Gujranwala', ur: 'گوجرانوالہ', province: 'Punjab' },
  { en: 'Peshawar', ur: 'پشاور', province: 'KPK' },
  { en: 'Quetta', ur: 'کوئٹہ', province: 'Balochistan' },
  { en: 'Sialkot', ur: 'سیالکوٹ', province: 'Punjab' },
  { en: 'Hyderabad', ur: 'حیدرآباد', province: 'Sindh' },
  { en: 'Sukkur', ur: 'سکھر', province: 'Sindh' },
  { en: 'Larkana', ur: 'لاڑکانہ', province: 'Sindh' },
  { en: 'Sargodha', ur: 'سرگودھا', province: 'Punjab' },
  { en: 'Bahawalpur', ur: 'بہاولپور', province: 'Punjab' },
  { en: 'Sheikhupura', ur: 'شیخوپورہ', province: 'Punjab' },
  { en: 'Rahim Yar Khan', ur: 'رحیم یار خان', province: 'Punjab' },
  { en: 'DG Khan', ur: 'ڈی جی خان', province: 'Punjab' },
  { en: 'Gujrat', ur: 'گجرات', province: 'Punjab' },
  { en: 'Sahiwal', ur: 'ساہیوال', province: 'Punjab' },
  { en: 'Kasur', ur: 'قصور', province: 'Punjab' },
  { en: 'Jhang', ur: 'جھنگ', province: 'Punjab' },
  { en: 'Okara', ur: 'اوکاڑہ', province: 'Punjab' },
  { en: 'Chiniot', ur: 'چنیوٹ', province: 'Punjab' },
  { en: 'Mardan', ur: 'مردان', province: 'KPK' },
  { en: 'Abbottabad', ur: 'ایبٹ آباد', province: 'KPK' },
  { en: 'Swat / Mingora', ur: 'سوات / سوات', province: 'KPK' },
  { en: 'DI Khan', ur: 'ڈی آئی خان', province: 'KPK' },
  { en: 'Kohat', ur: 'کوہاٹ', province: 'KPK' },
  { en: 'Nowshera', ur: 'نوشہرہ', province: 'KPK' },
  { en: 'Gwadar', ur: 'گوادر', province: 'Balochistan' },
  { en: 'Hub', ur: 'حب', province: 'Balochistan' },
  { en: 'Khuzdar', ur: 'خضدار', province: 'Balochistan' },
  { en: 'Chaman', ur: 'چمن', province: 'Balochistan' },
  { en: 'Turbat', ur: 'تربت', province: 'Balochistan' },
  { en: 'Mirpurkhas', ur: 'میرپور خاص', province: 'Sindh' },
  { en: 'Nawabshah', ur: 'نواب شاہ', province: 'Sindh' },
  { en: 'Jacobabad', ur: 'جیکب آباد', province: 'Sindh' },
  { en: 'Shikarpur', ur: 'شکارپور', province: 'Sindh' },
  { en: 'Thatta', ur: 'ٹھٹہ', province: 'Sindh' },
  { en: 'Muzaffarabad', ur: 'مظفرآباد', province: 'AJK' },
  { en: 'Mirpur (AJK)', ur: 'میرپور (آزاد کشمیر)', province: 'AJK' },
  { en: 'Gilgit', ur: 'گلگت', province: 'GB' },
  { en: 'Skardu', ur: 'سکردو', province: 'GB' },
];

export interface KYCSubmission {
  id: string;
  userType: 'driver' | 'shipper';
  applicantName: string;
  applicantNameUr: string;
  phone: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
  permanentAddress: string;
  city: string;
  
  // Driver / Truck Specific
  truckNumber?: string;
  truckType?: string;
  isTruckOwnerDifferent?: boolean;
  truckOwnerName?: string;
  truckOwnerCnicFrontUrl?: string;
  truckOwnerCnicBackUrl?: string;
  truckOwnerAddress?: string;

  // Shipper Specific
  companyName?: string;
  ntnNumber?: string;
  companyRegistrationUrl?: string;

  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  assignedSupportAgent?: string;
  reviewNotes?: string;
}

export interface DriverCounterBid {
  id: string;
  loadId: string;
  loadTitle: string;
  route: string;
  shipperName: string;
  driverName: string;
  driverNameUr: string;
  driverPhone: string;
  driverRating: number;
  driverTrips: number;
  truckNumber: string;
  truckType: string;
  originalPrice: number;
  offeredBidPrice: number;
  bidMessage: string;
  submittedTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  
  // Shipper Counter-Counter Fields
  shipperCounterPrice?: number;
  shipperCounterNote?: string;
  lastUpdatedBy?: 'driver' | 'shipper';
}

export interface DriverAvailabilityBroadcast {
  id: string;
  driverName: string;
  driverNameUr: string;
  driverPhone: string;
  driverRating: number;
  completedTrips: number;
  healthStatus: string;
  isFleetManaged: boolean;
  fleetCompanyName?: string;
  fleetManager?: string;
  truckNumber: string;
  truckType: string;
  currentCity: string;
  currentCityUr: string;
  currentLocation: string; // e.g. Port Qasim, Karachi
  preferredDestination: string; // e.g. "Multan", "Lahore", or "Open for Any Route in Pakistan"
  preferredDestinationUr: string;
  availableCapacityTons: number;
  departureTime: string;
  status: 'available' | 'matched' | 'offline';
  postedAgo: string;
}

export interface CommissionInvoice {
  id: string;
  invoiceNumber: string;
  entityName: string;
  entityType: 'Shipper' | 'Transport Company';
  loadId: string;
  route: string;
  grossFreightAmount: number;
  commissionRatePercent: number;
  commissionAmount: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
}

// ===== MOCK DRIVER COUNTER BIDS (FOR SHIPPERS & BROKERS) =====
export const mockDriverCounterBids: DriverCounterBid[] = [];

// ===== MOCK DRIVER AVAILABILITY BROADCASTS (RETURN TRIPS RADAR) =====
export const mockDriverAvailabilities: DriverAvailabilityBroadcast[] = [];

// ===== PRESET TEST ACCOUNTS =====
export const presetTestAccounts: TestAccount[] = [];

// ===== MOCK KYC SUBMISSIONS (FOR SUPPORT STAFF) =====
export const mockKYCSubmissions: KYCSubmission[] = [];

// ===== MOCK REVENUE & COMMISSION INVOICES (FOR FINANCE MANAGER) =====
export const mockCommissionInvoices: CommissionInvoice[] = [];

// ===== MOCK LOADS =====
export const mockLoads: any[] = [];

// ===== MOCK FLEET TRUCKS =====
export const mockFleetTrucks: any[] = [];

// ===== POPULAR ROUTES =====
export const popularRoutes = [
  { from: 'Lahore', fromUr: 'لاہور', to: 'Karachi', toUr: 'کراچی', distance: 1220, avgPrice: 195000, loads: 0 },
  { from: 'Faisalabad', fromUr: 'فیصل آباد', to: 'Karachi', toUr: 'کراچی', distance: 1050, avgPrice: 175000, loads: 0 },
  { from: 'Islamabad', fromUr: 'اسلام آباد', to: 'Lahore', toUr: 'لاہور', distance: 380, avgPrice: 65000, loads: 0 },
];

// ===== MOCK DRIVERS =====
export const mockDrivers: any[] = [];

// ===== MOCK TRANSACTIONS =====
export const mockTransactions: any[] = [];

// ===== DASHBOARD STATS =====
export const dashboardStats = {
  activeLoads: 0,
  completedLoads: 0,
  totalDistance: 0,
  avgRating: 0,
  walletBalance: 0,
  pendingPayments: 0,
  thisMonthEarnings: 0,
  lastMonthEarnings: 0,
  totalDrivers: 0,
  activeTrucks: 0,
  idleTrucks: 0,
  maintenanceTrucks: 0,
};

