'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockCommissionInvoices, CommissionInvoice } from '@/lib/mockData';

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

export const initialLedgerEntries: LedgerEntry[] = [
  { id: 'TRX-901', timestamp: '2026-08-19 14:20', entityName: 'Noor Textile Mills Ltd', entityRole: 'shipper', loadId: 'LD-2026-001', transactionType: 'ESCROW_DEPOSIT', amount: 153000, paymentMethod: 'Meezan Bank IBFT', referenceId: 'IBFT-776612', status: 'cleared', runningBalance: 153000 },
  { id: 'TRX-902', timestamp: '2026-08-19 14:35', entityName: 'Muhammad Aslam (Driver)', entityRole: 'driver', loadId: 'LD-2026-001', transactionType: 'ADVANCE_RELEASE', amount: 43650, paymentMethod: 'JazzCash Wallet', referenceId: 'JZ-998821', status: 'cleared', runningBalance: 43650 },
  { id: 'TRX-903', timestamp: '2026-08-19 17:50', entityName: 'Muhammad Aslam (Driver)', entityRole: 'driver', loadId: 'LD-2026-001', transactionType: 'FINAL_SETTLEMENT', amount: 101850, paymentMethod: 'Raast IBFT', referenceId: 'RST-554433', status: 'cleared', runningBalance: 145500 },
  { id: 'TRX-904', timestamp: '2026-08-19 18:10', entityName: 'DG Khan Cement Industry', entityRole: 'shipper', loadId: 'LD-2026-002', transactionType: 'ESCROW_DEPOSIT', amount: 408000, paymentMethod: 'HBL Corporate 1Bill', referenceId: '1BILL-990011', status: 'cleared', runningBalance: 408000 },
  { id: 'TRX-905', timestamp: '2026-08-19 18:25', entityName: 'Abdul Rasheed (Driver)', entityRole: 'driver', loadId: 'LD-2026-002', transactionType: 'ADVANCE_RELEASE', amount: 116400, paymentMethod: 'Easypaisa Merchant', referenceId: 'EP-334411', status: 'cleared', runningBalance: 116400 },
];

export default function FinancialManagerPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [mainTab, setMainTab] = useState<'invoices' | 'ledgers' | 'clearing'>('invoices');
  const [invoices, setInvoices] = useState<CommissionInvoice[]>(mockCommissionInvoices);
  const [ledgers, setLedgers] = useState<LedgerEntry[]>(initialLedgerEntries);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<CommissionInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Manual Clearing Form Inputs
  const [clearingType, setClearingType] = useState<'ESCROW_DEPOSIT' | 'ADVANCE_RELEASE' | 'FINAL_SETTLEMENT' | 'REFUND'>('ESCROW_DEPOSIT');
  const [cEntityName, setCEntityName] = useState('');
  const [cLoadId, setCLoadId] = useState('LD-2026-001');
  const [cAmount, setCAmount] = useState('');
  const [cMethod, setCMethod] = useState('Meezan Bank IBFT');
  const [cRefId, setCRefId] = useState('');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const totalGrossFreight = invoices.reduce((acc, inv) => acc + inv.grossFreightAmount, 0);
  const totalCommissionEarned = invoices.reduce((acc, inv) => acc + inv.commissionAmount, 0);
  const totalPaidCommission = invoices
    .filter((inv) => inv.paymentStatus === 'paid')
    .reduce((acc, inv) => acc + inv.commissionAmount, 0);
  const totalPendingCommission = invoices
    .filter((inv) => inv.paymentStatus !== 'paid')
    .reduce((acc, inv) => acc + inv.commissionAmount, 0);

  const filteredInvoices = invoices.filter((inv) => (filterStatus === 'all' ? true : inv.paymentStatus === filterStatus));

  const handleMarkAsPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              paymentStatus: 'paid',
              paidDate: new Date().toISOString().split('T')[0],
              paymentMethod: 'Manual Clearing / Bank Deposit',
            }
          : inv
      )
    );
  };

  const handlePreviewInvoice = (inv: CommissionInvoice) => {
    setSelectedInvoice(inv);
    setShowInvoiceModal(true);
  };

  // Submit Manual Financial Transaction & Update Wallet Ledgers
  const handleProcessTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cEntityName || !cAmount) {
      alert('Please fill out Entity Name and Transaction Amount!');
      return;
    }

    const amtNum = Number(cAmount);
    const newTxId = `TRX-${Math.floor(100 + Math.random() * 900)}`;
    const timeStr = new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    const newLedger: LedgerEntry = {
      id: newTxId,
      timestamp: timeStr,
      entityName: cEntityName,
      entityRole: clearingType === 'ESCROW_DEPOSIT' || clearingType === 'REFUND' ? 'shipper' : 'driver',
      loadId: cLoadId,
      transactionType: clearingType,
      amount: amtNum,
      paymentMethod: cMethod,
      referenceId: cRefId || `REF-${Date.now().toString().slice(-6)}`,
      status: 'cleared',
      runningBalance: amtNum,
    };

    setLedgers([newLedger, ...ledgers]);

    // Save to Local Storage for cross-tab sync
    try {
      const storedStr = localStorage.getItem('safarload_system_ledgers');
      const currentList = storedStr ? JSON.parse(storedStr) : initialLedgerEntries;
      localStorage.setItem('safarload_system_ledgers', JSON.stringify([newLedger, ...currentList]));
    } catch (err) {
      console.error(err);
    }

    alert(`✅ Financial Transaction Processed & Wallet Ledger Updated!\n\nTransaction ID: ${newTxId}\nEntity: ${cEntityName}\nType: ${clearingType}\nAmount: Rs. ${amtNum.toLocaleString()}\nMethod: ${cMethod}\n\nShipper & Driver Wallets and System Revenue updated live!`);

    // Reset Form
    setCEntityName('');
    setCAmount('');
    setCRefId('');
  };

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Financial Manager Header */}
      <header className={styles.header}>
        <div>
          <div className={styles.financeBadge}>💵 SafarLoad Financial Manager System | مالیاتی ڈیش بورڈ</div>
          <h1>SafarLoad Revenue, Wallet Ledgers & Escrow Clearing Center</h1>
          <p>Real-time Shipper & Driver Wallet Ledgers, Manual & Automated Escrow Deposits, Fuel Advance Release, & Tax Invoicing.</p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <Link href="/dashboard/admin" className="btn btn-outline btn-sm">
            👑 Super Admin
          </Link>
          <Link href="/dashboard/broker" className="btn btn-primary btn-sm">
            🛡️ Escrow Clearing
          </Link>
        </div>
      </header>

      {/* Revenue KPI Summary Cards */}
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">Rs. {totalCommissionEarned.toLocaleString()}</div>
          <div className="stat-card-label">Total Model 3 Revenue</div>
          <div className="stat-card-change positive">↑ 5.0% Dual Margin (2% Shipper + 3% Driver)</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">🏢</div>
          <div className="stat-card-value">Rs. 561,000</div>
          <div className="stat-card-label">Shipper Escrow Funds Locked</div>
          <div className="stat-card-change positive">HBL & Meezan Escrow Vault</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">⛽</div>
          <div className="stat-card-value">Rs. 160,050</div>
          <div className="stat-card-label">Driver Fuel Advances Disbursed</div>
          <div className="stat-card-change positive">JazzCash / Easypaisa Wallets</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">🚚</div>
          <div className="stat-card-value">Rs. {totalGrossFreight.toLocaleString()}</div>
          <div className="stat-card-label">Gross Freight Managed</div>
          <div className="stat-card-change positive">↑ 100% Escrow Secured</div>
        </div>
      </div>

      {/* NAVIGATION TABS FOR FINANCE MANAGER */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setMainTab('invoices')}
          className={`btn ${mainTab === 'invoices' ? 'btn-primary' : 'btn-glass'}`}
        >
          📄 Commission Invoices & Tax Audit ({invoices.length})
        </button>
        <button
          onClick={() => setMainTab('ledgers')}
          className={`btn ${mainTab === 'ledgers' ? 'btn-primary' : 'btn-glass'}`}
        >
          📒 Shipper & Driver Wallet Ledgers ({ledgers.length})
        </button>
        <button
          onClick={() => setMainTab('clearing')}
          className={`btn ${mainTab === 'clearing' ? 'btn-primary' : 'btn-glass'}`}
        >
          💳 Manual Escrow & Tranche Release Console
        </button>
      </div>

      {/* TAB 1: COMMISSION INVOICES */}
      {mainTab === 'invoices' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>📄 Commission Collection & Tax Invoice Audit</h3>
              <p>Filter by payment status to see which shippers and transport companies have paid platform commission.</p>
            </div>

            <div className={styles.filterTabs}>
              <button
                onClick={() => setFilterStatus('all')}
                className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.activeFilter : ''}`}
              >
                All ({invoices.length})
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`${styles.filterBtn} ${filterStatus === 'paid' ? styles.activeFilter : ''}`}
              >
                Paid ✅ ({invoices.filter((i) => i.paymentStatus === 'paid').length})
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`${styles.filterBtn} ${filterStatus === 'pending' ? styles.activeFilter : ''}`}
              >
                Pending ⏳ ({invoices.filter((i) => i.paymentStatus === 'pending').length})
              </button>
              <button
                onClick={() => setFilterStatus('overdue')}
                className={`${styles.filterBtn} ${filterStatus === 'overdue' ? styles.activeFilter : ''}`}
              >
                Overdue 🚨 ({invoices.filter((i) => i.paymentStatus === 'overdue').length})
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Entity / Company Name</th>
                  <th>Load & Route</th>
                  <th>Gross Amount</th>
                  <th>Commission ({'%'})</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className={inv.paymentStatus === 'overdue' ? styles.overdueRow : ''}>
                    <td>
                      <strong>{inv.invoiceNumber}</strong>
                      <br />
                      <small>{inv.id}</small>
                    </td>
                    <td>
                      <strong>{inv.entityName}</strong>
                      <br />
                      <small>Type: {inv.entityType}</small>
                    </td>
                    <td>
                      <strong>{inv.loadId}</strong>
                      <br />
                      <small>{inv.route}</small>
                    </td>
                    <td>Rs. {inv.grossFreightAmount.toLocaleString()}</td>
                    <td>
                      <strong className={styles.commissionText}>
                        Rs. {inv.commissionAmount.toLocaleString()} ({inv.commissionRatePercent}%)
                      </strong>
                    </td>
                    <td>
                      {inv.paymentStatus === 'paid' && <span className="badge badge-success">Paid ✅</span>}
                      {inv.paymentStatus === 'pending' && <span className="badge badge-warning">Pending ⏳</span>}
                      {inv.paymentStatus === 'overdue' && <span className="badge badge-danger">Overdue 🚨</span>}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button onClick={() => handlePreviewInvoice(inv)} className="btn btn-primary btn-sm">
                          📄 View Invoice
                        </button>
                        {inv.paymentStatus !== 'paid' && (
                          <button onClick={() => handleMarkAsPaid(inv.id)} className="btn btn-outline btn-sm">
                            💵 Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SHIPPER & DRIVER WALLET LEDGERS */}
      {mainTab === 'ledgers' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <div className={styles.panelHeader}>
            <div>
              <h3>📒 Live Shipper & Driver Wallet Transaction Ledgers</h3>
              <p>Real-time audit trail of all Escrow Deposits, 30% Fuel Advances, 70% Bilty Final Settlements, and Refunds.</p>
            </div>
            <button onClick={() => alert('📄 Financial Ledger Statement exported as PDF / Excel CSV!')} className="btn btn-glass btn-sm">
              📥 Export Ledger CSV
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>TRX ID / Timestamp</th>
                  <th>Account Entity Name</th>
                  <th>Role / Load ID</th>
                  <th>Transaction Type</th>
                  <th>Amount (PKR)</th>
                  <th>Payment Gateway / Ref TRX #</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ledgers.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.id}</strong>
                      <br />
                      <small>{l.timestamp}</small>
                    </td>
                    <td>
                      <strong>{l.entityName}</strong>
                    </td>
                    <td>
                      <span className={`badge ${l.entityRole === 'shipper' ? 'badge-info' : 'badge-primary'}`}>
                        {l.entityRole.toUpperCase()}
                      </span>
                      <br />
                      <small>{l.loadId}</small>
                    </td>
                    <td>
                      {l.transactionType === 'ESCROW_DEPOSIT' && <span className="badge badge-success">🏢 ESCROW DEPOSIT</span>}
                      {l.transactionType === 'ADVANCE_RELEASE' && <span className="badge badge-warning">⛽ 30% FUEL ADVANCE</span>}
                      {l.transactionType === 'FINAL_SETTLEMENT' && <span className="badge badge-primary">🧾 70% BILTY SETTLEMENT</span>}
                      {l.transactionType === 'REFUND' && <span className="badge badge-danger">🔄 SHIPPER REFUND</span>}
                    </td>
                    <td>
                      <strong style={{ fontSize: '1.05rem', color: l.transactionType === 'REFUND' ? '#EF4444' : '#10B981' }}>
                        Rs. {l.amount.toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      {l.paymentMethod}
                      <br />
                      <small style={{ color: 'var(--color-primary)' }}>Ref: {l.referenceId}</small>
                    </td>
                    <td>
                      <span className="badge badge-success">Cleared ✅</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANUAL ESCROW & TRANCHE RELEASE CONSOLE */}
      {mainTab === 'clearing' && (
        <div className={`${styles.panel} glass-card animate-fadeIn`}>
          <h3>💳 Manual & Automated Financial Transaction Management Console</h3>
          <p className={styles.panelSubtitle}>
            Process manual bank deposit verifications, release 30% Fuel Advances to Drivers via JazzCash, or clear 70% Bilty Final Payouts.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1.25rem', background: 'var(--color-bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--color-primary)', marginTop: 0 }}>⚙️ Execute Manual Financial Action</h4>
              
              <form onSubmit={handleProcessTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Select Financial Transaction Type:</label>
                  <select
                    value={clearingType}
                    onChange={(e) => setClearingType(e.target.value as any)}
                    className="input"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="ESCROW_DEPOSIT">🏢 Shipper Escrow Deposit (Credit Shipper Ledger)</option>
                    <option value="ADVANCE_RELEASE">⛽ 30% Fuel Advance Disbursement (Credit Driver Wallet)</option>
                    <option value="FINAL_SETTLEMENT">🧾 70% Bilty POD Final Settlement (Credit Driver & Platform Profit)</option>
                    <option value="REFUND">🔄 Shipper Escrow Refund (Debit Escrow / Credit Shipper)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Account Holder / Entity Name:</label>
                  <input
                    type="text"
                    value={cEntityName}
                    onChange={(e) => setCEntityName(e.target.value)}
                    placeholder="e.g. Noor Textile Mills OR Muhammad Aslam (Driver)"
                    className="input"
                    style={{ width: '100%', marginTop: '4px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Load ID:</label>
                    <input
                      type="text"
                      value={cLoadId}
                      onChange={(e) => setCLoadId(e.target.value)}
                      className="input"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Amount (PKR):</label>
                    <input
                      type="number"
                      value={cAmount}
                      onChange={(e) => setCAmount(e.target.value)}
                      placeholder="e.g. 153000"
                      className="input"
                      style={{ width: '100%', marginTop: '4px' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Payment Gateway / Clearing Channel:</label>
                  <select
                    value={cMethod}
                    onChange={(e) => setCMethod(e.target.value)}
                    className="input"
                    style={{ width: '100%', marginTop: '4px' }}
                  >
                    <option value="Meezan Bank IBFT">🏦 Meezan Bank Corporate IBFT</option>
                    <option value="HBL Corporate 1Bill">🏦 HBL 1Link 1Bill Gateway</option>
                    <option value="JazzCash Wallet">📲 JazzCash Merchant Wallet API</option>
                    <option value="Easypaisa Merchant">📱 Easypaisa Direct Wallet</option>
                    <option value="Raast Instant IBFT">🏦 Raast Instant Payment Gateway</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Bank Reference TRX ID # (Optional):</label>
                  <input
                    type="text"
                    value={cRefId}
                    onChange={(e) => setCRefId(e.target.value)}
                    placeholder="e.g. IBFT-998811 or JZ-443322"
                    className="input"
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '0.5rem' }}>
                  🚀 Process Transaction & Update Ledgers →
                </button>
              </form>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--color-bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--color-primary)', marginTop: 0 }}>ℹ️ Finance Manager Manual Clearing Rules</h4>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                <li><strong>1. Shipper Escrow Verification:</strong> Verify bank deposits and credit the Escrow Ledger.</li>
                <li><strong>2. 30% Fuel Advance Release:</strong> Once the driver arrives at gate, release fuel funds via wallet.</li>
                <li><strong>3. 70% Final Settlement:</strong> Upon unloading and POD inspection, settle driver balance.</li>
                <li><strong>4. Refunds & Reversals:</strong> Execute partial or full refunds if a shipment is cancelled.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL INVOICE GENERATOR MODAL */}
      {showInvoiceModal && selectedInvoice && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modalCard} glass-card animate-scaleIn`}>
            <div className={styles.modalHeader}>
              <div>
                <h2>🧾 SAFARLOAD OFFICIAL TAX INVOICE</h2>
                <span className={styles.invNumber}>{selectedInvoice.invoiceNumber}</span>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className={styles.closeBtn}>✕</button>
            </div>

            <div className={styles.invoiceBody}>
              <div className={styles.invoiceMetaGrid}>
                <div>
                  <span>Billed To:</span>
                  <strong>{selectedInvoice.entityName}</strong>
                  <small>Entity Category: {selectedInvoice.entityType}</small>
                </div>
                <div>
                  <span>Invoice Date:</span>
                  <strong>2026-08-19</strong>
                  <small>Due Date: {selectedInvoice.dueDate}</small>
                </div>
              </div>

              <table className={styles.invoiceTable}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Freight Value</th>
                    <th>Rate</th>
                    <th>Total Commission</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      Platform Matchmaking & Escrow Services
                      <br />
                      <small>Load ID: {selectedInvoice.loadId} ({selectedInvoice.route})</small>
                    </td>
                    <td>Rs. {selectedInvoice.grossFreightAmount.toLocaleString()}</td>
                    <td>{selectedInvoice.commissionRatePercent}%</td>
                    <td><strong>Rs. {selectedInvoice.commissionAmount.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>

              <div className={styles.invoiceTotalRow}>
                <div>
                  <span>Payment Status:</span>
                  <strong className={selectedInvoice.paymentStatus === 'paid' ? styles.greenText : styles.redText}>
                    {selectedInvoice.paymentStatus.toUpperCase()}
                  </strong>
                </div>
                <div className={styles.grandTotal}>
                  <span>Grand Total Dues:</span>
                  <h3>Rs. {selectedInvoice.commissionAmount.toLocaleString()} PKR</h3>
                </div>
              </div>

              <div className={styles.invoiceFooterNotes}>
                <p>💡 Payment methods supported: JazzCash Corporate Merchant, Easypaisa Gateway, or HBL Bank Transfer.</p>
                <p>Official Sales Tax Reg: 35202-9876543-1 | NTN: 8901234-7</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => window.print()} className="btn btn-glass">
                🖨️ Print / Download PDF
              </button>
              <button onClick={() => setShowInvoiceModal(false)} className="btn btn-primary">
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
