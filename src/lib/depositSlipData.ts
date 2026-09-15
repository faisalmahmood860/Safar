export interface LedgerEntry {
  id: string;
  timestamp: string;
  entityName: string;
  entityRole: 'shipper' | 'driver' | 'fleet';
  loadId: string;
  transactionType: 'ESCROW_DEPOSIT' | 'ADVANCE_RELEASE' | 'FINAL_SETTLEMENT' | 'REFUND';
  amount: number;
  paymentMethod: string;
  referenceId: string;
  status: 'cleared' | 'pending' | 'reversed';
  runningBalance: number;
}

export const initialLedgerEntries: LedgerEntry[] = [];

export interface DepositSlip {
  id: string;
  timestamp: string;
  shipperName: string;
  paymentMethod: string;
  referenceTxId: string;
  amountPkr: number;
  slipImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export const initialDepositSlips: DepositSlip[] = [];
