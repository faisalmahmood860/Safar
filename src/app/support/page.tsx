'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockKYCSubmissions, KYCSubmission } from '@/lib/mockData';

import { WhatsAppSession, WhatsAppMessage } from '@/components/WhatsAppAgentModal';

export default function SupportDeskPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [supportTab, setSupportTab] = useState<'kyc' | 'whatsapp' | 'docs'>('docs');
  const [kycList, setKycList] = useState<KYCSubmission[]>(mockKYCSubmissions);
  const [selectedKyc, setSelectedKyc] = useState<KYCSubmission | null>(mockKYCSubmissions[0] || null);
  const [reviewNotes, setReviewNotes] = useState('');

  // Strict Login Authentication Protection
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('safarload_logged_user');
      if (!stored) {
        window.location.href = '/login?role=support';
        return;
      }
    }
  }, []);

  // WhatsApp Live Chat State
  const [waSession, setWaSession] = useState<WhatsAppSession>({
    sessionId: 'WA-SESS-9842',
    userName: 'Tariq Mehmood (Driver)',
    userPhone: '+92 301 2345678',
    userRole: 'driver',
    status: 'human_agent_connected',
    lastActivity: 'Just now',
    messages: [
      {
        id: '1',
        sender: 'user',
        senderName: 'Tariq Mehmood (Driver)',
        text: 'Assalam-o-Alaikum! Mujhay Karachi say Multan ki bilty confirmation nahi mili, agent say baat karwa dein.',
        timestamp: '05:15 PM',
      },
      {
        id: '2',
        sender: 'human_agent',
        senderName: 'Ayesha Khan (Support) 🎧',
        text: 'Walaikum Assalam Aslam Bhai! SafarLoad Support team live hy. Aapki Bilty #BLT-2026-901 verify ho chuki hy.',
        timestamp: '05:16 PM',
      },
    ],
  });
  const [agentReplyText, setAgentReplyText] = useState('');

  // Sync WhatsApp Session from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('safarload_whatsapp_chats');
      if (stored) {
        setWaSession(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSendAgentReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentReplyText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newAgentMsg: WhatsAppMessage = {
      id: Date.now().toString(),
      sender: 'human_agent',
      senderName: 'Ayesha Khan (Support) 🎧',
      text: agentReplyText,
      timestamp: timeStr,
    };

    const updatedSession: WhatsAppSession = {
      ...waSession,
      status: 'human_agent_connected',
      lastActivity: 'Just now',
      messages: [...waSession.messages, newAgentMsg],
    };

    setWaSession(updatedSession);
    try {
      localStorage.setItem('safarload_whatsapp_chats', JSON.stringify(updatedSession));
    } catch (e) {
      console.error(e);
    }

    setAgentReplyText('');
    alert(`📤 WhatsApp Reply sent to ${waSession.userName} (${waSession.userPhone})!`);
  };

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
          <button
            onClick={() => setSupportTab('docs')}
            className={`btn ${supportTab === 'docs' ? 'btn-primary' : 'btn-glass'} btn-sm`}
          >
            📜 Document Expiration Tracker (Motive)
          </button>
          <button
            onClick={() => setSupportTab('whatsapp')}
            className={`btn ${supportTab === 'whatsapp' ? 'btn-primary' : 'btn-glass'} btn-sm`}
          >
            💬 WhatsApp Live Queue (1 Active)
          </button>
          <button
            onClick={() => setSupportTab('kyc')}
            className={`btn ${supportTab === 'kyc' ? 'btn-primary' : 'btn-glass'} btn-sm`}
          >
            📋 KYC Verification ({kycList.filter((k) => k.status === 'pending').length} Pending)
          </button>
          <button onClick={toggleLanguage} className="btn btn-glass btn-sm">
            🌐 {lang === 'en' ? 'اردو' : 'English'}
          </button>
        </div>
      </header>

      {supportTab === 'docs' ? (
        /* MOTIVE-STYLE AUTOMATED DOCUMENT EXPIRATION TRACKER */
        <div className="glass-card animate-fadeIn" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3>📜 Automated Document Expiration & Renewal Tracker</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94A3B8' }}>Motive-Style compliance monitoring for CNIC, HTV Licenses, Route Permits & Token Tax</p>
            </div>
            <span className="badge badge-warning">2 Action Required</span>
          </div>

          <div className="tableContainer">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Driver / Entity</th>
                  <th>Document Type</th>
                  <th>Document #</th>
                  <th>Expiration Date</th>
                  <th>Compliance Status</th>
                  <th>Automated Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>👨‍✈️ Tariq Mehmood (+92 301 2345678)</strong></td>
                  <td>🪪 Commercial Driving License (HTV)</td>
                  <td>HTV-LHR-98421</td>
                  <td>2026-10-15 (In 30 Days)</td>
                  <td><span className="badge badge-success">🟢 Active & Valid</span></td>
                  <td><button onClick={() => alert('✉️ Renewal SMS & WhatsApp Notice sent to Driver Tariq Mehmood!')} className="btn btn-glass btn-sm">📩 Send Renewal Alert</button></td>
                </tr>
                <tr>
                  <td><strong>👨‍✈️ Abdul Rasheed (+92 333 9876543)</strong></td>
                  <td>🪪 Driver CNIC Verification</td>
                  <td>35201-9876543-1</td>
                  <td>2026-09-29 (In 14 Days)</td>
                  <td><span className="badge badge-warning">⚠️ Expires in 14 Days</span></td>
                  <td><button onClick={() => alert('🚨 Urgent CNIC Expiry SMS Broadcasted!')} className="btn btn-warning btn-sm">⚠️ Urgent Notice</button></td>
                </tr>
                <tr>
                  <td><strong>🚛 Truck LHR-5678 (Flatbed Trailer)</strong></td>
                  <td>📋 Vehicle Route Fitness Certificate</td>
                  <td>FIT-2026-7781</td>
                  <td>2026-09-22 (In 7 Days)</td>
                  <td><span className="badge badge-warning">⚠️ Expires in 7 Days</span></td>
                  <td><button onClick={() => alert('📋 Vehicle Fitness Renewal Booking initiated with Punjab Transport Authority!')} className="btn btn-primary btn-sm">📋 Schedule Fitness Check</button></td>
                </tr>
                <tr>
                  <td><strong>🚛 Truck KHI-1234 (22ft Container)</strong></td>
                  <td>💳 Vehicle Token Tax Paid Status</td>
                  <td>TOK-2026-9012</td>
                  <td>2027-06-30 (Valid)</td>
                  <td><span className="badge badge-success">🟢 Active & Valid</span></td>
                  <td><span style={{ fontSize: '0.8rem', color: '#10B981' }}>✅ Fully Compliant</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : supportTab === 'whatsapp' ? (
        /* LIVE WHATSAPP SUPPORT DASHBOARD CONSOLE */
        <div className="animate-fadeIn" style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          {/* LEFT: LIVE WHATSAPP SESSIONS LIST */}
          <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>💬 Active WhatsApp Requests</h3>
            <div
              style={{
                padding: '1rem',
                background: 'rgba(37, 211, 102, 0.12)',
                border: '1px solid #25D366',
                borderRadius: '12px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#25D366' }}>{waSession.userName}</strong>
                <span className="badge badge-success">Live Handoff</span>
              </div>
              <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                📱 {waSession.userPhone} | {waSession.userRole.toUpperCase()}
              </p>
              <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                "{waSession.messages[waSession.messages.length - 1]?.text.slice(0, 55)}..."
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE CHAT & REPLY CONSOLE */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>💬 Live Conversation — {waSession.userName}</h3>
                <span style={{ fontSize: '0.8rem', color: '#25D366' }}>
                  📱 WhatsApp: {waSession.userPhone} | Handoff Status: {waSession.status.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => {
                  const updated = { ...waSession, status: 'bot_active' as const };
                  setWaSession(updated);
                  localStorage.setItem('safarload_whatsapp_chats', JSON.stringify(updated));
                  alert(`✅ Ticket resolved! Session handed back to AI Bot.`);
                }}
                className="btn btn-outline btn-sm"
              >
                ✅ Resolve & Re-enable Bot
              </button>
            </div>

            {/* MESSAGES CONSOLE */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '12px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {waSession.messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-start' : 'flex-end',
                    maxWidth: '75%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    background: m.sender === 'user' ? '#1E293B' : m.sender === 'human_agent' ? '#075E54' : '#334155',
                    border: m.sender === 'human_agent' ? '1px solid #25D366' : '1px solid var(--border-color)',
                    color: '#F1F5F9',
                  }}
                >
                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#38BDF8', fontWeight: 700, marginBottom: '2px' }}>
                    {m.senderName}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-line' }}>{m.text}</p>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', textAlign: 'right', marginTop: '4px' }}>
                    {m.timestamp}
                  </span>
                </div>
              ))}
            </div>

            {/* REPLY FORM */}
            <form onSubmit={handleSendAgentReply} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={agentReplyText}
                onChange={(e) => setAgentReplyText(e.target.value)}
                placeholder={`Type human support reply to ${waSession.userName}...`}
                className="input"
                required
              />
              <button type="submit" className="btn btn-primary">
                📤 Send WhatsApp Reply
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Support Queue Split Layout */
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
                <button
                  type="button"
                  onClick={() => alert(`🚨 EMERGENCY CPLC POLICE FIR COMPLAINT PACKAGE GENERATED!\n\nApplicant: ${selectedKyc.applicantName}\nApplication ID: ${selectedKyc.id}\nPhone: ${selectedKyc.phone}\nAddress: ${selectedKyc.permanentAddress}\nGuarantor: Verified On File\nLast Known GPS: Captured on Live Map\n\n📄 Document Package exported for Police/CPLC Incident Desk!`)}
                  className="btn btn-glass btn-sm"
                  style={{ marginTop: '0.5rem', color: '#EF4444', borderColor: '#EF4444' }}
                >
                  🚨 Dispatch Police CPLC FIR Package
                </button>
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
              <h4>📄 Uploaded Verification Documents (4 Required KYC Papers)</h4>
              <div className={styles.docsGrid}>
                <div className={styles.docCard}>
                  <span>🪪 Driver/Applicant CNIC Front</span>
                  <div className={styles.docPreview}>{selectedKyc.cnicFrontUrl || 'Driver_CNIC_Front.jpg'}</div>
                </div>

                <div className={styles.docCard}>
                  <span>🪪 Driver/Applicant CNIC Back</span>
                  <div className={styles.docPreview}>{selectedKyc.cnicBackUrl || 'Driver_CNIC_Back.jpg'}</div>
                </div>

                {selectedKyc.userType === 'driver' && (
                  <>
                    <div className={styles.docCard}>
                      <span>🚛 Truck Registration Smart Card / Copy</span>
                      <div className={styles.docPreview}>{selectedKyc.truckCardCopyUrl || `Truck_SmartCard_${selectedKyc.truckNumber || 'LHR5678'}.pdf`}</div>
                    </div>

                    <div className={styles.docCard}>
                      <span>📋 Vehicle Fitness Certificate (Expires: {selectedKyc.truckFitnessExpiryDate || '2026-12-31'})</span>
                      <div className={styles.docPreview}>{selectedKyc.truckFitnessCertUrl || `Fitness_Cert_${selectedKyc.truckNumber || 'LHR5678'}.pdf`}</div>
                    </div>

                    <div className={styles.docCard}>
                      <span>💳 Token Tax Paid Receipt (Expires: {selectedKyc.truckTokenTaxExpiryDate || '2027-06-30'})</span>
                      <div className={styles.docPreview}>{selectedKyc.truckTokenTaxReceiptUrl || `TokenTax_Receipt_${selectedKyc.truckNumber || 'LHR5678'}.pdf`}</div>
                    </div>
                  </>
                )}

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
      )}
    </div>
  );
}
