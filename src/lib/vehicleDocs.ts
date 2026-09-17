export interface DriverVehicleDocs {
  driverName: string;
  cnicNumber: string;
  cnicStatus: 'verified' | 'pending' | 'rejected';
  cnicFrontUrl: string;
  cnicBackUrl: string;
  truckNumber: string;
  truckType: string;
  truckCardStatus: 'verified' | 'pending';
  truckCardCopyUrl: string;
  tokenTaxStatus: 'paid' | 'due' | 'expired';
  tokenTaxExpiryDate: string;
  tokenTaxReceiptUrl: string;
  fitnessCertStatus: 'passed' | 'due_renewal' | 'expired';
  fitnessCertExpiryDate: string;
  fitnessCertUrl: string;
  lastUpdated: string;
}

export const defaultDriverVehicleDocs: DriverVehicleDocs = {
  driverName: 'Tariq Mehmood',
  cnicNumber: '35201-1234567-1',
  cnicStatus: 'verified',
  cnicFrontUrl: 'CNIC_Front_TariqMehmood_35201-1234567-1.jpg',
  cnicBackUrl: 'CNIC_Back_TariqMehmood_35201-1234567-1.jpg',
  truckNumber: 'LHR-5678',
  truckType: 'Flatbed Trailer (25 Tons)',
  truckCardStatus: 'verified',
  truckCardCopyUrl: 'Truck_SmartCard_LHR5678.pdf',
  tokenTaxStatus: 'due',
  tokenTaxExpiryDate: '2026-09-30',
  tokenTaxReceiptUrl: 'TokenTax_PaidReceipt_2025.pdf',
  fitnessCertStatus: 'due_renewal',
  fitnessCertExpiryDate: '2026-09-22',
  fitnessCertUrl: 'Vehicle_Fitness_Certificate_2025.pdf',
  lastUpdated: new Date().toISOString().split('T')[0],
};

const STORAGE_KEY = 'safarload_driver_vehicle_docs';

export function getDriverVehicleDocs(): DriverVehicleDocs {
  if (typeof window === 'undefined') return defaultDriverVehicleDocs;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load driver vehicle docs', e);
  }
  return defaultDriverVehicleDocs;
}

export function saveDriverVehicleDocs(docs: DriverVehicleDocs): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    window.dispatchEvent(new Event('safarload_vehicledocs_change'));
  } catch (e) {
    console.error('Failed to save driver vehicle docs', e);
  }
}
