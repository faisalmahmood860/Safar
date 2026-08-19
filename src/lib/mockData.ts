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
  status: 'pending' | 'accepted' | 'rejected';
  
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
export const mockDriverCounterBids: DriverCounterBid[] = [
  {
    id: 'BID-801',
    loadId: 'LD-2026-001',
    loadTitle: 'Cotton Bales — Multan to Karachi',
    route: 'Multan → Karachi',
    shipperName: 'Noor Textile Mills',
    driverName: 'Muhammad Aslam',
    driverNameUr: 'محمد اسلم',
    driverPhone: '+92 301 2345678',
    driverRating: 4.8,
    driverTrips: 456,
    truckNumber: 'LHR-5678',
    truckType: 'Trailer (25 Tons)',
    originalPrice: 185000,
    offeredBidPrice: 178000,
    bidMessage: 'Ready to load today evening. Tarpaulin and belts ready.',
    submittedTime: '15 mins ago',
    status: 'pending',
  },
  {
    id: 'BID-802',
    loadId: 'LD-2026-001',
    loadTitle: 'Cotton Bales — Multan to Karachi',
    route: 'Multan → Karachi',
    shipperName: 'Noor Textile Mills',
    driverName: 'Abdul Rasheed',
    driverNameUr: 'عبدالرشید',
    driverPhone: '+92 333 9876543',
    driverRating: 4.5,
    driverTrips: 234,
    truckNumber: 'KHI-1234',
    truckType: 'Container (30 Tons)',
    originalPrice: 185000,
    offeredBidPrice: 180000,
    bidMessage: 'Container truck ready at Multan Bypass. Instant dispatch.',
    submittedTime: '30 mins ago',
    status: 'pending',
  },
  {
    id: 'BID-803',
    loadId: 'LD-2026-003',
    loadTitle: 'Cement Bags — DG Khan to Lahore',
    route: 'DG Khan → Lahore',
    shipperName: 'DG Khan Cement Ltd',
    driverName: 'Tariq Mehmood',
    driverNameUr: 'طارق محمود',
    driverPhone: '+92 321 5551234',
    driverRating: 4.9,
    driverTrips: 678,
    truckNumber: 'FSD-9012',
    truckType: 'Dumper (20 Tons)',
    originalPrice: 95000,
    offeredBidPrice: 92000,
    bidMessage: 'At factory gate right now. Can load within 1 hour.',
    submittedTime: '5 mins ago',
    status: 'pending',
  },
];

// ===== MOCK DRIVER AVAILABILITY BROADCASTS (RETURN TRIPS RADAR) =====
export const mockDriverAvailabilities: DriverAvailabilityBroadcast[] = [
  {
    id: 'AVAL-301',
    driverName: 'Muhammad Aslam',
    driverNameUr: 'محمد اسلم',
    driverPhone: '+92 301 2345678',
    driverRating: 4.8,
    truckNumber: 'LHR-5678',
    truckType: 'Trailer (25 Tons)',
    currentCity: 'Karachi',
    currentCityUr: 'کراچی',
    currentLocation: 'Port Qasim Gate 2 (Reached & Unloaded)',
    preferredDestination: 'Multan or Faisalabad',
    preferredDestinationUr: 'ملتان یا فیصل آباد',
    availableCapacityTons: 25,
    departureTime: 'Today 6:00 PM',
    status: 'available',
    postedAgo: '10 mins ago',
  },
  {
    id: 'AVAL-302',
    driverName: 'Khan Muhammad',
    driverNameUr: 'خان محمد',
    driverPhone: '+92 300 1122334',
    driverRating: 4.7,
    truckNumber: 'PSH-7890',
    truckType: 'Bedford (15 Tons)',
    currentCity: 'Lahore',
    currentCityUr: 'لاہور',
    currentLocation: 'Thokar Niaz Baig Adda',
    preferredDestination: 'Open for Any Route in Pakistan (تمام روٹس کے لیے دستیاب)',
    preferredDestinationUr: 'تمام روٹس کے لیے دستیاب',
    availableCapacityTons: 15,
    departureTime: 'Tomorrow Morning 08:00 AM',
    status: 'available',
    postedAgo: '25 mins ago',
  },
  {
    id: 'AVAL-303',
    driverName: 'Shahbaz Ali',
    driverNameUr: 'شہباز علی',
    driverPhone: '+92 321 4455667',
    driverRating: 4.9,
    truckNumber: 'RWP-2345',
    truckType: 'Mazda (10 Tons)',
    currentCity: 'Peshawar',
    currentCityUr: 'پشاور',
    currentLocation: 'Industrial Estate Hayatabad',
    preferredDestination: 'Rawalpindi / Islamabad',
    preferredDestinationUr: 'راولپنڈی / اسلام آباد',
    availableCapacityTons: 10,
    departureTime: 'Immediate Departure',
    status: 'available',
    postedAgo: '5 mins ago',
  },
];

// ===== PRESET TEST ACCOUNTS =====
export const presetTestAccounts: TestAccount[] = [
  {
    role: 'driver',
    name: 'Muhammad Aslam',
    nameUr: 'محمد اسلم',
    email: 'driver@safarload.pk',
    phone: '+92 301 2345678',
    password: 'Driver@123',
    details: 'Verified Driver | Trailer LHR-5678 | 4.8 Rating',
  },
  {
    role: 'shipper',
    name: 'Noor Textile Mills',
    nameUr: 'نور ٹیکسٹائل ملز',
    email: 'shipper@safarload.pk',
    phone: '+92 42 35789000',
    password: 'Shipper@123',
    details: 'Enterprise Cargo Sender | NTN: 3456789-2',
  },
  {
    role: 'fleet',
    name: 'Al-Farooq Logistics',
    nameUr: 'الفاروق لاجسٹکس',
    email: 'fleet@safarload.pk',
    phone: '+92 51 9876543',
    password: 'Fleet@123',
    details: 'Fleet Transport Owner | 6 Active Trucks',
  },
  {
    role: 'support',
    name: 'Ayesha Khan (KYC Support)',
    nameUr: 'عائشہ خان (سپورٹ ایجنٹ)',
    email: 'support@safarload.pk',
    phone: '+92 42 111-SUPPORT',
    password: 'Support@123',
    details: 'Support Agent | Driver & Shipper KYC Document Verification',
  },
  {
    role: 'finance',
    name: 'Salman Ahmed (Finance Manager)',
    nameUr: 'سلمان احمد (فنانس مینیجر)',
    email: 'finance@safarload.pk',
    phone: '+92 42 111-FINANCE',
    password: 'Finance@123',
    details: 'SafarLoad Financial Manager | Revenue Tracking & Invoicing',
  },
  {
    role: 'admin',
    name: 'Platform Super Admin',
    nameUr: 'سپر ایڈمن',
    email: 'admin@safarload.pk',
    phone: '+92 300 0000000',
    password: 'SafarLoad@2026#Admin',
    details: 'Super Admin | System Creation, Access Controls, & Rules',
  },
];

// ===== MOCK KYC SUBMISSIONS (FOR SUPPORT STAFF) =====
export const mockKYCSubmissions: KYCSubmission[] = [
  {
    id: 'KYC-DRV-001',
    userType: 'driver',
    applicantName: 'Tariq Mehmood',
    applicantNameUr: 'طارق محمود',
    phone: '+92 321 5551234',
    cnicFrontUrl: '📄 Driver_CNIC_Front_36302.jpg',
    cnicBackUrl: '📄 Driver_CNIC_Back_36302.jpg',
    permanentAddress: 'House 45, Street 8, Samanabad, Faisalabad',
    city: 'Faisalabad',
    truckNumber: 'FSD-9012',
    truckType: 'Dumper',
    isTruckOwnerDifferent: true,
    truckOwnerName: 'Chaudhry Ghulam Rasool (Father)',
    truckOwnerCnicFrontUrl: '📄 Owner_CNIC_Front_36301.jpg',
    truckOwnerCnicBackUrl: '📄 Owner_CNIC_Back_36301.jpg',
    truckOwnerAddress: 'Chak 204 RB, Canal Road, Faisalabad',
    status: 'pending',
    submittedDate: '2026-08-19 10:30 AM',
  },
  {
    id: 'KYC-DRV-002',
    userType: 'driver',
    applicantName: 'Zahid Khan',
    applicantNameUr: 'زاہد خان',
    phone: '+92 300 9988776',
    cnicFrontUrl: '📄 Driver_CNIC_Front_17301.jpg',
    cnicBackUrl: '📄 Driver_CNIC_Back_17301.jpg',
    permanentAddress: 'Village Warsak, Tehsil & District Peshawar',
    city: 'Peshawar',
    truckNumber: 'PSH-4455',
    truckType: 'Bedford',
    isTruckOwnerDifferent: false,
    status: 'pending',
    submittedDate: '2026-08-19 11:15 AM',
  },
  {
    id: 'KYC-SHP-003',
    userType: 'shipper',
    applicantName: 'Sindh Agriculture Traders',
    applicantNameUr: 'سندھ ایگری کلچر ٹریڈرز',
    phone: '+92 21 34567890',
    cnicFrontUrl: '📄 Owner_CNIC_Front_42101.jpg',
    cnicBackUrl: '📄 Owner_CNIC_Back_42101.jpg',
    permanentAddress: 'Plot 12-B, Commercial Area, Latifabad, Hyderabad',
    city: 'Hyderabad',
    companyName: 'Sindh Agriculture Traders (Pvt) Ltd',
    ntnNumber: '7891234-9',
    companyRegistrationUrl: '📄 SECP_Registration_Cert.pdf',
    status: 'pending',
    submittedDate: '2026-08-18 04:45 PM',
  },
  {
    id: 'KYC-DRV-004',
    userType: 'driver',
    applicantName: 'Muhammad Aslam',
    applicantNameUr: 'محمد اسلم',
    phone: '+92 301 2345678',
    cnicFrontUrl: '📄 Driver_CNIC_Front_35201.jpg',
    cnicBackUrl: '📄 Driver_CNIC_Back_35201.jpg',
    permanentAddress: 'Chung Stop, Multan Road, Lahore',
    city: 'Lahore',
    truckNumber: 'LHR-5678',
    truckType: 'Trailer',
    isTruckOwnerDifferent: false,
    status: 'approved',
    submittedDate: '2026-08-10 09:00 AM',
    assignedSupportAgent: 'Ayesha Khan',
    reviewNotes: 'All CNIC & vehicle registration docs verified cleanly.',
  },
];

// ===== MOCK REVENUE & COMMISSION INVOICES (FOR FINANCE MANAGER) =====
export const mockCommissionInvoices: CommissionInvoice[] = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'SL-INV-8901',
    entityName: 'Noor Textile Mills Ltd',
    entityType: 'Shipper',
    loadId: 'LD-2026-001',
    route: 'Multan → Karachi',
    grossFreightAmount: 185000,
    commissionRatePercent: 4.0,
    commissionAmount: 7400,
    paymentStatus: 'paid',
    dueDate: '2026-08-20',
    paidDate: '2026-08-18',
    paymentMethod: 'JazzCash Direct Escrow',
  },
  {
    id: 'INV-2026-002',
    invoiceNumber: 'SL-INV-8902',
    entityName: 'DG Khan Cement Corp',
    entityType: 'Shipper',
    loadId: 'LD-2026-003',
    route: 'DG Khan → Lahore',
    grossFreightAmount: 95000,
    commissionRatePercent: 4.0,
    commissionAmount: 3800,
    paymentStatus: 'paid',
    dueDate: '2026-08-19',
    paidDate: '2026-08-17',
    paymentMethod: 'Easypaisa Gateway',
  },
  {
    id: 'INV-2026-003',
    invoiceNumber: 'SL-INV-8903',
    entityName: 'Sindh Rice Exporters',
    entityType: 'Shipper',
    loadId: 'LD-2026-002',
    route: 'Larkana → Karachi',
    grossFreightAmount: 145000,
    commissionRatePercent: 4.0,
    commissionAmount: 5800,
    paymentStatus: 'pending',
    dueDate: '2026-08-22',
  },
  {
    id: 'INV-2026-004',
    invoiceNumber: 'SL-INV-8904',
    entityName: 'Al-Farooq Logistics Co',
    entityType: 'Transport Company',
    loadId: 'LD-2026-006',
    route: 'Faisalabad → Peshawar',
    grossFreightAmount: 155000,
    commissionRatePercent: 3.5,
    commissionAmount: 5425,
    paymentStatus: 'overdue',
    dueDate: '2026-08-15',
  },
  {
    id: 'INV-2026-005',
    invoiceNumber: 'SL-INV-8905',
    entityName: 'Pakistan State Oil (PSO)',
    entityType: 'Shipper',
    loadId: 'LD-2026-008',
    route: 'Hub → Quetta',
    grossFreightAmount: 250000,
    commissionRatePercent: 4.0,
    commissionAmount: 10000,
    paymentStatus: 'paid',
    dueDate: '2026-08-23',
    paidDate: '2026-08-19',
    paymentMethod: 'HBL Bank Transfer',
  },
];

// ===== MOCK LOADS =====
export const mockLoads = [
  {
    id: 'LD-2026-001',
    title: 'Cotton Bales — Multan to Karachi',
    pickupCity: 'Multan',
    pickupCityUr: 'ملتان',
    pickupAddress: 'Industrial Estate, Bosan Road',
    dropoffCity: 'Karachi',
    dropoffCityUr: 'کراچی',
    dropoffAddress: 'Port Qasim, Bin Qasim Town',
    pickupLat: 30.1575,
    pickupLng: 71.5249,
    dropoffLat: 24.8607,
    dropoffLng: 67.0011,
    cargoType: 'Textile',
    cargoTypeUr: 'ٹیکسٹائل',
    cargoIcon: '🧵',
    truckType: 'Trailer',
    truckTypeUr: 'ٹریلر',
    weight: 25,
    price: 185000,
    pricePerKm: 24,
    distance: 870,
    estimatedHours: 14,
    pickupDate: '2026-08-20',
    pickupTime: '06:00 AM',
    specialRequirements: ['Tarpaulin Cover', 'No Rain Exposure'],
    shipperName: 'Noor Textile Mills',
    shipperRating: 4.8,
    shipperLoads: 342,
    shipperVerified: true,
    status: 'posted',
    postedAgo: '2 hours ago',
    bidsCount: 5,
    isUrgent: false,
    isBookNow: true,
  },
  {
    id: 'LD-2026-002',
    title: 'Rice Bags — Larkana to Karachi Port',
    pickupCity: 'Larkana',
    pickupCityUr: 'لاڑکانہ',
    pickupAddress: 'Rice Mill Area, Ratodero Road',
    dropoffCity: 'Karachi',
    dropoffCityUr: 'کراچی',
    dropoffAddress: 'Keamari Port, West Wharf',
    pickupLat: 27.5570,
    pickupLng: 68.2141,
    dropoffLat: 24.8454,
    dropoffLng: 66.9903,
    cargoType: 'Food & Grain',
    cargoTypeUr: 'خوراک اور اناج',
    cargoIcon: '🌾',
    truckType: '22-Wheeler',
    truckTypeUr: '22 وہیلر',
    weight: 30,
    price: 145000,
    pricePerKm: 28,
    distance: 520,
    estimatedHours: 9,
    pickupDate: '2026-08-21',
    pickupTime: '04:00 AM',
    specialRequirements: ['Covered Truck', 'Moisture Protection'],
    shipperName: 'Sindh Rice Exports',
    shipperRating: 4.5,
    shipperLoads: 128,
    shipperVerified: true,
    status: 'posted',
    postedAgo: '45 min ago',
    bidsCount: 3,
    isUrgent: true,
    isBookNow: false,
  },
  {
    id: 'LD-2026-003',
    title: 'Cement Bags — DG Khan to Lahore',
    pickupCity: 'DG Khan',
    pickupCityUr: 'ڈی جی خان',
    pickupAddress: 'DG Khan Cement Factory',
    dropoffCity: 'Lahore',
    dropoffCityUr: 'لاہور',
    dropoffAddress: 'Raiwind Road, Construction Site',
    pickupLat: 30.0489,
    pickupLng: 70.6355,
    dropoffLat: 31.5204,
    dropoffLng: 74.3587,
    cargoType: 'Construction Material',
    cargoTypeUr: 'تعمیراتی سامان',
    cargoIcon: '🧱',
    truckType: 'Dumper',
    truckTypeUr: 'ڈمپر',
    weight: 20,
    price: 95000,
    pricePerKm: 22,
    distance: 430,
    estimatedHours: 7,
    pickupDate: '2026-08-20',
    pickupTime: '05:00 AM',
    specialRequirements: ['Heavy Load', 'Weight Bridge Certificate'],
    shipperName: 'DG Khan Cement Ltd',
    shipperRating: 4.9,
    shipperLoads: 890,
    shipperVerified: true,
    status: 'posted',
    postedAgo: '1 hour ago',
    bidsCount: 8,
    isUrgent: false,
    isBookNow: true,
  },
];

// ===== MOCK FLEET TRUCKS =====
export const mockFleetTrucks = [
  {
    id: 'TRK-001',
    registrationNumber: 'LHR-5678',
    type: 'Trailer',
    typeUr: 'ٹریلر',
    typeIcon: '🚛',
    driverName: 'Muhammad Aslam',
    driverNameUr: 'محمد اسلم',
    status: 'active',
    currentCity: 'Multan',
    currentCityUr: 'ملتان',
    lat: 30.1575,
    lng: 71.5249,
    fuelLevel: 72,
    lastMaintenance: '2026-07-15',
    nextMaintenance: '2026-09-15',
    totalKm: 245000,
    currentLoad: 'LD-2026-001',
  },
  {
    id: 'TRK-002',
    registrationNumber: 'KHI-1234',
    type: 'Container',
    typeUr: 'کنٹینر',
    typeIcon: '📦',
    driverName: 'Abdul Rasheed',
    driverNameUr: 'عبدالرشید',
    status: 'idle',
    currentCity: 'Karachi',
    currentCityUr: 'کراچی',
    lat: 24.8607,
    lng: 67.0011,
    fuelLevel: 45,
    lastMaintenance: '2026-08-01',
    nextMaintenance: '2026-10-01',
    totalKm: 178000,
  },
];

// ===== POPULAR ROUTES =====
export const popularRoutes = [
  { from: 'Lahore', fromUr: 'لاہور', to: 'Karachi', toUr: 'کراچی', distance: 1220, avgPrice: 195000, loads: 340 },
  { from: 'Faisalabad', fromUr: 'فیصل آباد', to: 'Karachi', toUr: 'کراچی', distance: 1050, avgPrice: 175000, loads: 280 },
  { from: 'Islamabad', fromUr: 'اسلام آباد', to: 'Lahore', toUr: 'لاہور', distance: 380, avgPrice: 65000, loads: 520 },
];

// ===== MOCK DRIVERS =====
export const mockDrivers = [
  {
    id: 'DRV-001',
    name: 'Muhammad Aslam',
    nameUr: 'محمد اسلم',
    phone: '+92 301 2345678',
    cnic: '35201-1234567-1',
    rating: 4.8,
    totalTrips: 456,
    truckType: 'Trailer',
    truckTypeUr: 'ٹریلر',
    truckNumber: 'LHR-5678',
    location: 'Lahore',
    locationUr: 'لاہور',
    isAvailable: true,
    isVerified: true,
    experience: 12,
    languages: ['Urdu', 'Punjabi'],
    avatar: '👨‍✈️',
  },
  {
    id: 'DRV-002',
    name: 'Abdul Rasheed',
    nameUr: 'عبدالرشید',
    phone: '+92 333 9876543',
    cnic: '42301-9876543-3',
    rating: 4.5,
    totalTrips: 234,
    truckType: 'Container',
    truckTypeUr: 'کنٹینر',
    truckNumber: 'KHI-1234',
    location: 'Karachi',
    locationUr: 'کراچی',
    isAvailable: true,
    isVerified: true,
    experience: 8,
    languages: ['Urdu', 'Sindhi'],
    avatar: '👨‍✈️',
  },
];

// ===== MOCK TRANSACTIONS =====
export const mockTransactions = [
  {
    id: 'TXN-001',
    type: 'credit',
    amount: 185000,
    description: 'Payment for Load LD-2026-001 (Multan → Karachi)',
    descriptionUr: 'لوڈ LD-2026-001 کی ادائیگی (ملتان → کراچی)',
    method: 'JazzCash',
    methodIcon: '📱',
    date: '2026-08-18',
    status: 'completed',
    loadId: 'LD-2026-001',
    route: 'Multan → Karachi',
  },
  {
    id: 'TXN-002',
    type: 'debit',
    amount: 15000,
    description: 'Fuel Advance Withdrawal',
    descriptionUr: 'ایندھن ایڈوانس نکلوائی',
    method: 'Easypaisa',
    methodIcon: '💰',
    date: '2026-08-17',
    status: 'completed',
  },
  {
    id: 'TXN-003',
    type: 'credit',
    amount: 95000,
    description: 'Payment for Load LD-2026-003 (DG Khan → Lahore)',
    descriptionUr: 'لوڈ LD-2026-003 کی ادائیگی (ڈی جی خان → لاہور)',
    method: 'Bank Transfer',
    methodIcon: '🏦',
    date: '2026-08-16',
    status: 'completed',
    loadId: 'LD-2026-003',
    route: 'DG Khan → Lahore',
  },
];

// ===== DASHBOARD STATS =====
export const dashboardStats = {
  activeLoads: 3,
  completedLoads: 456,
  totalDistance: 125430,
  avgRating: 4.8,
  walletBalance: 425000,
  pendingPayments: 145000,
  thisMonthEarnings: 680000,
  lastMonthEarnings: 590000,
  totalDrivers: 6,
  activeTrucks: 4,
  idleTrucks: 1,
  maintenanceTrucks: 1,
};

