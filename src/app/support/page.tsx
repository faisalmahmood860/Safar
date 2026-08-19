'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockKYCSubmissions, KYCSubmission } from '@/lib/mockData';

export default function SupportDeskPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [kycList, setKycList] = useState<KYCSubmission[]>(mockKYCSubmissions);
  const [selectedKyc, setSelectedKyc] = useState<KYCSubmission | null>(mockKYCSubmissions[0]);
  const [reviewNotes, setReviewNotes] = useState('');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const handleApprove = (id: string) => {
    setKycList((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              status: 'approved',
              assignedSupportAgent: 'Ayesha Khan (Support Staff)',
              reviewNotes: reviewNotes || 'CNIC and vehicle ownership verified successfully.',
            }
          : k
      )
    );
    if (selectedKyc?.id === id) {
      setSelectedKyc((prev) => (prev ? { ...prev, status: 'approved' } : null));
    }
    alert(`KYC Submission ${id} APPROVED! User account activated.`);
  };

  const handleReject = (id: string) => {
    const reason = prompt('Please enter rejection reason:', 'Owner CNIC photo unclear or mismatched address');
    if (!reason) return;

    setKycList((prev) =>
      prev.map((k) =>
        k.id === id
          ? {
              ...k,
              status: 'rejected',
              assignedSupportAgent: 'Ayesha Khan (Support Staff)',
              reviewNotes: reason,
            }
          : k
      )
    );
    if (selectedKyc?.id === id) {
      setSelectedKyc((prev) => (prev ? { ...prev, status: 'rejected' } : null));
    }
  };

  return (
    <div className={styles.container} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* Support Header */}
      <header className={styles.header}>
        <div>
          <div className={styles.supportBadge}>🎧 Support Agent Portal | کے وائی سی تصدیق سسٹمز</div>
          <h1>SafarLoad KYC Onboarding & Document Verification Desk</h1>
          <p>Verify Driver CNICs, Truck Owner Papers, and Shipper NTN Certificates before onboarding.</p>
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

      {/* Support Queue Split Layout */}
      <div className={styles.supportGrid}>
        {/* Left Side: Pending KYC Submissions List */}
        <div className={`${styles.queuePanel} glass-card`}>
          <div className={styles.queueHeader}>
            <h3>📋 Onboarding Queue ({kycList.filter((k) => k.status === 'pending').length} Pending)</h3>
          </div>

          <div className={styles.queueList}>
            {kycList.map((k) => (
              <div
                key={k.id}
                onClick={() => setSelectedKyc(k)}
                className={`${styles.queueCard} ${selectedKyc?.id === k.id ? styles.selectedCard : ''}`}
              >
                <div className={styles.queueTitleRow}>
                  <strong>{k.applicantName}</strong>
                  {k.status === 'pending' && <span className="badge badge-warning">Pending Review</span>}
                  {k.status === 'approved' && <span className="badge badge-success">Approved ✅</span>}
                  {k.status === 'rejected' && <span className="badge badge-danger">Rejected ❌</span>}
                </div>
                <div className={styles.queueMeta}>
                  <span>{k.userType === 'driver' ? '🚛 Driver Onboarding' : '🏢 Shipper Registration'}</span>
                  <span>📍 {k.city}</span>
                </div>
                <small className={styles.timeText}>Submitted: {k.submittedDate}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Document Deep Verification Inspection */}
        {selectedKyc && (
          <div className={`${styles.inspectPanel} glass-card animate-fadeIn`}>
            <div className={styles.inspectHeader}>
              <div>
                <h2>{selectedKyc.applicantName} ({selectedKyc.applicantNameUr})</h2>
                <span className={styles.kycIdTag}>ID: {selectedKyc.id}</span>
              </div>
              <div>
                {selectedKyc.status === 'pending' && (
                  <div className={styles.actionRow}>
                    <button onClick={() => handleApprove(selectedKyc.id)} className="btn btn-primary btn-sm">
                      ✅ Approve KYC & Onboard
                    </button>
                    <button onClick={() => handleReject(selectedKyc.id)} className="btn btn-accent btn-sm">
                      ❌ Reject KYC
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Applicant General Information */}
            <div className={styles.infoSection}>
              <h4>👤 Applicant Information</h4>
              <div className={styles.infoGrid}>
                <div><span>Phone:</span> <strong>{selectedKyc.phone}</strong></div>
                <div><span>City:</span> <strong>{selectedKyc.city}</strong></div>
                <div><span>Permanent Address:</span> <strong>{selectedKyc.permanentAddress}</strong></div>
              </div>
            </div>

            {/* Driver Truck & Vehicle Documents Verification */}
            {selectedKyc.userType === 'driver' && (
              <div className={styles.infoSection}>
                <h4>🚛 Vehicle & Ownership Registration Details</h4>
                <div className={styles.infoGrid}>
                  <div><span>Truck Plate No:</span> <strong>{selectedKyc.truckNumber}</strong></div>
                  <div><span>Truck Type:</span> <strong>{selectedKyc.truckType}</strong></div>
                  <div>
                    <span>Truck Registered Owner:</span>{' '}
                    <strong className={selectedKyc.isTruckOwnerDifferent ? styles.warningText : ''}>
                      {selectedKyc.isTruckOwnerDifferent ? '⚠️ Different Owner (Requires Owner CNIC)' : '✅ Same as Driver'}
                    </strong>
                  </div>
                </div>

                {/* Third-Party Truck Owner Details */}
                {selectedKyc.isTruckOwnerDifferent && (
                  <div className={styles.ownerBox}>
                    <h5 className={styles.warningTitle}>⚠️ Third-Party Truck Owner Information</h5>
                    <p>Driver is operating a truck owned by a third party. Verified owner details:</p>
                    <ul>
                      <li>Owner Name: <strong>{selectedKyc.truckOwnerName}</strong></li>
                      <li>Owner Address: <strong>{selectedKyc.truckOwnerAddress}</strong></li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Uploaded Documents Inspection Panel */}
            <div className={styles.docsSection}>
              <h4>📄 Uploaded Verification Documents</h4>
              <div className={styles.docsGrid}>
                <div className={styles.docCard}>
                  <span>🪪 Driver/Applicant CNIC Front</span>
                  <div className={styles.docPreview}>{selectedKyc.cnicFrontUrl}</div>
                </div>

                <div className={styles.docCard}>
                  <span>🪪 Driver/Applicant CNIC Back</span>
                  <div className={styles.docPreview}>{selectedKyc.cnicBackUrl}</div>
                </div>

                {selectedKyc.isTruckOwnerDifferent && (
                  <>
                    <div className={styles.docCardWarning}>
                      <span>🪪 Owner CNIC Front</span>
                      <div className={styles.docPreview}>{selectedKyc.truckOwnerCnicFrontUrl}</div>
                    </div>
                    <div className={styles.docCardWarning}>
                      <span>🪪 Owner CNIC Back</span>
                      <div className={styles.docPreview}>{selectedKyc.truckOwnerCnicBackUrl}</div>
                    </div>
                  </>
                )}

                {selectedKyc.companyRegistrationUrl && (
                  <div className={styles.docCard}>
                    <span>🏢 SECP / NTN Certificate</span>
                    <div className={styles.docPreview}>{selectedKyc.companyRegistrationUrl}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Support Agent Review Notes */}
            <div className={styles.notesSection}>
              <label>📝 Support Agent Verification Notes:</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Enter notes about CNIC match, address verification, or rejection reasons..."
                className="input"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
