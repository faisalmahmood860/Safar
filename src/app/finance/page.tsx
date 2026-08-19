'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockCommissionInvoices, CommissionInvoice } from '@/lib/mockData';

export default function FinancialManagerPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [invoices, setInvoices] = useState<CommissionInvoice[]>(mockCommissionInvoices);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<CommissionInvoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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
              paidDate: '2026-08-19',
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

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Financial Manager Header */}
      <header className={styles.header}>
        <div>
          <div className={styles.financeBadge}>💵 SafarLoad Financial Manager System | مالیاتی ڈیش بورڈ</div>
          <h1>SafarLoad Platform Revenue & Tax Invoicing Center</h1>
          <p>Real-time revenue tracking, commission collection audit, escrow clearing, & official invoice generation.</p>
        </div>

        <div className={styles.headerActions}>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
          <Link href="/admin" className="btn btn-outline btn-sm">
            👑 Super Admin
          </Link>
          <Link href="/dashboard" className="btn btn-primary btn-sm">
            📊 Operations Dashboard
          </Link>
        </div>
      </header>

      {/* Revenue KPI Summary Cards */}
      <div className={styles.statsGrid}>
        <div className="stat-card">
          <div className="stat-card-icon">💰</div>
          <div className="stat-card-value">Rs. {totalCommissionEarned.toLocaleString()}</div>
          <div className="stat-card-label">Total Commission Earned</div>
          <div className="stat-card-change positive">↑ 4.0% Platform Margin</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-value">Rs. {totalPaidCommission.toLocaleString()}</div>
          <div className="stat-card-label">Collected Commissions</div>
          <div className="stat-card-change positive">Cleared in Account</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">⏳</div>
          <div className="stat-card-value">Rs. {totalPendingCommission.toLocaleString()}</div>
          <div className="stat-card-label">Outstanding / Unpaid Dues</div>
          <div className="stat-card-change negative">
            ⚠️ {invoices.filter((i) => i.paymentStatus === 'overdue').length} Overdue
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon">🚚</div>
          <div className="stat-card-value">Rs. {totalGrossFreight.toLocaleString()}</div>
          <div className="stat-card-label">Gross Freight Managed</div>
          <div className="stat-card-change positive">↑ 100% Escrow Secured</div>
        </div>
      </div>

      {/* Main Revenue Table & Controls */}
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
