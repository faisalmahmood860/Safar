'use client';

import React from 'react';
import styles from './DigitalBiltyModal.module.css';

export interface BiltyData {
  biltyNumber: string;
  date: string;
  consignorName: string; // Shipper / Sender
  consignorCnic: string;
  consignorPhone: string;
  pickupAddress: string;

  consigneeName: string; // Receiver
  consigneeCnic: string;
  consigneePhone: string;
  dropoffAddress: string;

  driverName: string;
  driverCnic: string;
  driverPhone: string;
  truckNumber: string;
  truckType: string;

  cargoDescription: string;
  packageCount: string;
  weightTons: string;
  declaredValuePkr: number;

  totalFreightPkr: number;
  paymentTerm: 'To Pay / رسید پر قابل ادا' | 'Paid in Full / مکمل ادا شدہ' | '30% Advance + 70% Delivery Pay';
  tollsIncluded: boolean;
  challanProtected: boolean;
}

interface Props {
  bilty: BiltyData;
  onClose: () => void;
}

export default function DigitalBiltyModal({ bilty, onClose }: Props) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.biltyPaper} glass-card animate-scaleIn`}>
        {/* Top Action Bar (Hidden on print) */}
        <div className={styles.topActions}>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            🖨️ Print / Download Bilty PDF (بلٹی پرنٹ کریں)
          </button>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {/* OFFICIAL PAKISTANI BILTY DOCUMENT HEADER */}
        <div className={styles.biltyHeader}>
          <div className={styles.companyTitle}>
            <h2>🚚 SAFARLOAD LOGISTICS PAKISTAN (PVT) LTD</h2>
            <p className={styles.urduSubtitle}>سفر لوڈ لاجسٹکس سروسز — آفیشل بلٹی رسید (Goods Freight Receipt)</p>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Govt Licensed Freight Agent | NTN: 9842107-4</span>
          </div>
          <div className={styles.biltyMetaBox}>
            <div className={styles.biltyNoLabel}>BILTY NO / بلٹی نمبر</div>
            <div className={styles.biltyNoValue}>{bilty.biltyNumber}</div>
            <div className={styles.biltyDate}>Date: {bilty.date}</div>
          </div>
        </div>

        {/* SENDER & RECEIVER GRID */}
        <div className={styles.partyGrid}>
          {/* CONSIGNOR (SHIPPPER / SENDER) */}
          <div className={styles.partyBox}>
            <h4 className={styles.partyTitle}>📤 CONSIGNOR (بھیجنے والا / شپر)</h4>
            <p><strong>Name / Co:</strong> {bilty.consignorName}</p>
            <p><strong>Phone:</strong> {bilty.consignorPhone}</p>
            <p><strong>NTN / CNIC:</strong> {bilty.consignorCnic}</p>
            <p><strong>Pickup Warehouse:</strong> {bilty.pickupAddress}</p>
          </div>

          {/* CONSIGNEE (RECEIVER) */}
          <div className={styles.partyBox}>
            <h4 className={styles.partyTitle}>📥 CONSIGNEE (وصول کرنے والا / مال مالک)</h4>
            <p><strong>Name / Co:</strong> {bilty.consigneeName}</p>
            <p><strong>Phone:</strong> {bilty.consigneePhone}</p>
            <p><strong>CNIC:</strong> {bilty.consigneeCnic}</p>
            <p><strong>Delivery Warehouse:</strong> {bilty.dropoffAddress}</p>
          </div>
        </div>

        {/* CARRIER & DRIVER DETAILS */}
        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}>🚛 CARRIER & DRIVER DETAILS (گاڑی و ڈرائیور معلومات)</h4>
          <div className={styles.fourColGrid}>
            <div>
              <span>Truck Reg # / گاڑی نمبر:</span>
              <strong>{bilty.truckNumber}</strong>
            </div>
            <div>
              <span>Vehicle Type:</span>
              <strong>{bilty.truckType}</strong>
            </div>
            <div>
              <span>Driver Name / ڈرائیور:</span>
              <strong>{bilty.driverName}</strong>
            </div>
            <div>
              <span>Driver CNIC:</span>
              <strong>{bilty.driverCnic}</strong>
            </div>
          </div>
        </div>

        {/* GOODS & CARGO DESCRIPTION TABLE */}
        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}>📦 GOODS & CARGO SPECIFICATIONS (سامان کی تفصیل)</h4>
          <table className={styles.biltyTable}>
            <thead>
              <tr>
                <th>Package Count (تعداد)</th>
                <th>Cargo Description (سامان کی قسم)</th>
                <th>Weight (وزن ٹن)</th>
                <th>Declared Value (مالیت PKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{bilty.packageCount}</strong></td>
                <td>{bilty.cargoDescription}</td>
                <td>{bilty.weightTons} Tons</td>
                <td>Rs. {bilty.declaredValuePkr.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FREIGHT CHARGES & PAYMENT TERMS */}
        <div className={styles.sectionCard}>
          <h4 className={styles.sectionTitle}>💰 FREIGHT PAYMENT & EXPENSE TERMS (کرایہ و بقایا)</h4>
          <div className={styles.freightGrid}>
            <div>
              <span>Total Agreed Freight Rate:</span>
              <strong className={styles.highlightGreen}>Rs. {bilty.totalFreightPkr.toLocaleString()}</strong>
            </div>
            <div>
              <span>Payment Terms:</span>
              <strong className={styles.highlightAmber}>{bilty.paymentTerm}</strong>
            </div>
            <div>
              <span>Inclusions Checklist:</span>
              <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginTop: '2px' }}>
                {bilty.tollsIncluded ? '✅ Toll Taxes Included' : '❌ Tolls Excluded'} | {bilty.challanProtected ? '✅ Challan Protection' : '❌ Challan Excluded'}
              </div>
            </div>
          </div>
        </div>

        {/* LEGAL STAMP & DIGITAL SIGNATURES */}
        <div className={styles.signaturesRow}>
          <div className={styles.sigBox}>
            <div className={styles.sigLine}></div>
            <p>Consignor Signature / شپر کے دستخط</p>
          </div>
          <div className={styles.stampBox}>
            <div className={styles.verifiedStamp}>
              VERIFIED ESCROW BILTY
              <span>SAFARLOAD PAKISTAN</span>
            </div>
          </div>
          <div className={styles.sigBox}>
            <div className={styles.sigLine}></div>
            <p>Driver / Transport Receipt Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
