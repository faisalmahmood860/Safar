'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { mockKYCSubmissions, KYCSubmission } from '@/lib/mockData';

import { WhatsAppSession, WhatsAppMessage } from '@/components/WhatsAppAgentModal';

export default function SupportDeskPage() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [supportTab, setSupportTab] = useState<'kyc' | 'whatsapp'>('whatsapp');
  const [kycList, setKycList] = useState<KYCSubmission[]>(mockKYCSubmissions);
  const [selectedKyc, setSelectedKyc] = useState<KYCSubmission | null>(mockKYCSubmissions[0]);
  const [reviewNotes, setReviewNotes] = useState('');

  // WhatsApp Live Chat State
  const [waSession, setWaSession] = useState<WhatsAppSession>({
    sessionId: 'WA-SESS-9842',
    userName: 'Muhammad Aslam (Driver)',
    userPhone: '+92 301 2345678',
    userRole: 'driver',
    status: 'human_agent_connected',
    lastActivity: 'Just now',
    messages: [
      {
        id: '1',
        sender: 'user',
        senderName: 'Muhammad Aslam (Driver)',
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

      {supportTab === 'whatsapp' ? (
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
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700, marginBottom: '2px' }}>
                    {m.senderName}
                  </span>
                  <p style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'pre-line' }}>{m.text}</p>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#CBD5E1', textAlign: 'right', marginTop: '4px' }}>
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
      )}
    </div>
  );
}
