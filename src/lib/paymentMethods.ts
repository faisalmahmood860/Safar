export interface UserPaymentMethod {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  channelType: 'bank' | 'jazzcash' | 'easypaisa' | 'nayapay' | 'sadapay';
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  addedDate: string;
  status: 'verified' | 'pending';
  isDefault?: boolean;
}

export const pakistaniLocalBanks = [
  'Meezan Bank Limited',
  'Habib Bank Limited (HBL)',
  'MCB Bank Limited',
  'Allied Bank Limited (ABL)',
  'United Bank Limited (UBL)',
  'Bank Alfalah',
  'Faysal Bank',
  'Askari Bank',
  'BankIslami Pakistan',
  'Dubai Islamic Bank (DIB)',
  'Bank of Punjab (BOP)',
  'Standard Chartered Bank',
  'National Bank of Pakistan (NBP)',
  'JS Bank',
  'Soneri Bank',
  'Habib Metropolitan Bank',
  'JazzCash (Mobilink Microfinance)',
  'Easypaisa (Telenor Microfinance)',
  'SadaPay (Fintech)',
  'NayaPay (Fintech)',
  'Other Local Bank / Microfinance',
];

export const defaultPaymentMethods: UserPaymentMethod[] = [
  {
    id: 'PM-901',
    userName: 'Tariq Mehmood',
    userRole: 'driver',
    channelType: 'bank',
    bankName: 'Meezan Bank Limited',
    accountTitle: 'Tariq Mehmood',
    accountNumber: 'PK36 MEZN 0099 2301 0482 9101',
    addedDate: '2026-08-15',
    status: 'verified',
    isDefault: true,
  },
  {
    id: 'PM-902',
    userName: 'Abdul Rasheed',
    userRole: 'driver',
    channelType: 'jazzcash',
    bankName: 'JazzCash (Mobilink Microfinance)',
    accountTitle: 'Abdul Rasheed',
    accountNumber: '0333 9876543',
    addedDate: '2026-08-18',
    status: 'verified',
    isDefault: true,
  },
  {
    id: 'PM-903',
    userName: 'Noor Textile Mills Pvt Ltd',
    userRole: 'shipper',
    channelType: 'bank',
    bankName: 'Habib Bank Limited (HBL)',
    accountTitle: 'Noor Textile Mills Corporate',
    accountNumber: 'PK12 HABB 0109 8421 9012 3456',
    addedDate: '2026-07-20',
    status: 'verified',
    isDefault: true,
  },
  {
    id: 'PM-904',
    userName: 'Khyber Freight Transport Co.',
    userRole: 'fleet',
    channelType: 'bank',
    bankName: 'Bank Alfalah',
    accountTitle: 'Khyber Freight Transport',
    accountNumber: 'PK89 ALFH 0012 7781 9901 2233',
    addedDate: '2026-08-01',
    status: 'verified',
    isDefault: true,
  },
];

const STORAGE_KEY = 'safarload_payment_methods';

export function getSavedPaymentMethods(): UserPaymentMethod[] {
  if (typeof window === 'undefined') return defaultPaymentMethods;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPaymentMethods));
    }
  } catch (e) {
    console.error('Failed to load payment methods', e);
  }
  return defaultPaymentMethods;
}

export function savePaymentMethod(pm: UserPaymentMethod): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedPaymentMethods();
    const existingIndex = current.findIndex((item) => item.id === pm.id);
    let updated: UserPaymentMethod[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = pm;
    } else {
      updated = [pm, ...current];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('safarload_payment_methods_change'));
  } catch (e) {
    console.error('Failed to save payment method', e);
  }
}

export function deletePaymentMethod(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSavedPaymentMethods();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('safarload_payment_methods_change'));
  } catch (e) {
    console.error('Failed to delete payment method', e);
  }
}
