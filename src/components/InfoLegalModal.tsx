'use client';

import React, { useState, useEffect } from 'react';
import styles from './InfoLegalModal.module.css';

export type InfoLegalTab = 'about' | 'help' | 'escrow' | 'privacy' | 'terms' | 'socials';

interface InfoLegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: InfoLegalTab;
}

export default function InfoLegalModal({ isOpen, onClose, initialTab = 'about' }: InfoLegalModalProps) {
  const [activeTab, setActiveTab] = useState<InfoLegalTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.modalCard} glass-card animate-scaleIn`} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.icon}>
              {activeTab === 'about' && '🏢'}
              {activeTab === 'help' && '🎧'}
              {activeTab === 'escrow' && '🛡️'}
              {activeTab === 'privacy' && '📜'}
              {activeTab === 'terms' && '⚖️'}
              {activeTab === 'socials' && '🌐'}
            </span>
            <div>
              <h2 className={styles.title}>
                {activeTab === 'about' && 'About SafarLoad Technologies (سفر لوڈ)'}
                {activeTab === 'help' && '24/7 Help Center & Support Desk (ہیلپ ڈیسک)'}
                {activeTab === 'escrow' && 'SafarLoad Escrow Payment Security (ایسکرو سیکیورٹی)'}
                {activeTab === 'privacy' && 'Privacy Policy & Data Security (پرائیویسی پالیسی)'}
                {activeTab === 'terms' && 'Terms of Service & Carrier Guidelines (شرائط و ضوابط)'}
                {activeTab === 'socials' && 'Official SafarLoad Media Channels (سوشل میڈیا)'}
              </h2>
              <p className={styles.subtitle}>SafarLoad Digital Freight & Dispatching Network Pakistan</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">✕</button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'about' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('about')}
          >
            🏢 About Us
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'help' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('help')}
          >
            🎧 Help Center
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'escrow' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('escrow')}
          >
            🛡️ Escrow Guarantee
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'privacy' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            📜 Privacy Policy
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'terms' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            ⚖️ Terms of Service
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'socials' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('socials')}
          >
            🌐 Social Channels
          </button>
        </div>

        {/* Modal Body Content */}
        <div className={styles.body}>
          {activeTab === 'about' && (
            <div className={styles.tabContent}>
              <div className={styles.infoBanner}>
                <h3>🚛 Pakistan's #1 Digital Freight & Truck Dispatch Platform</h3>
                <p>
                  SafarLoad connects over <strong>15,000+ verified truck drivers</strong>, <strong>2,400+ fleet owners</strong>, and <strong>5,000+ enterprise shippers</strong> across Pakistan. Our technology replaces traditional Adda broker markups with transparent, direct digital logistics.
                </p>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <div className={styles.statVal}>15,000+</div>
                  <div className={styles.statLbl}>Verified Drivers</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statVal}>98.4%</div>
                  <div className={styles.statLbl}>On-Time Deliveries</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statVal}>Rs. 2.4 Billion+</div>
                  <div className={styles.statLbl}>Freight Value Moved</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statVal}>140+ Cities</div>
                  <div className={styles.statLbl}>Coverage Across Pakistan</div>
                </div>
              </div>

              <h4 className={styles.sectionHeader}>Our Core Pillars</h4>
              <ul className={styles.featureList}>
                <li><strong>✅ Zero Hidden Broker Fees:</strong> Direct shipper-to-driver bidding with standard 3-5% platform fee.</li>
                <li><strong>✅ Live Satellite GPS Tracking:</strong> Real-time location visibility for every container & trailer.</li>
                <li><strong>✅ Urdu Voice Command Interface:</strong> Accessible voice commands tailored for Pakistani truck drivers.</li>
                <li><strong>✅ Guaranteed Instant Payouts:</strong> Same-day payout via Meezan IBFT, JazzCash, or Easypaisa upon Bilty upload.</li>
              </ul>
            </div>
          )}

          {activeTab === 'help' && (
            <div className={styles.tabContent}>
              <div className={styles.contactGrid}>
                <div className={styles.contactCard}>
                  <div className={styles.cardIcon}>📞</div>
                  <h4>24/7 Dispatch Helpline</h4>
                  <p><strong>+92 42 111 SAFAR (72327)</strong></p>
                  <p>Immediate phone assistance for route dispatch & breakdown support.</p>
                  <a href="tel:+924211172327" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>Call Toll Free</a>
                </div>

                <div className={styles.contactCard}>
                  <div className={styles.cardIcon}>💬</div>
                  <h4>Instant WhatsApp Desk</h4>
                  <p><strong>+92 300 1234567</strong></p>
                  <p>Direct chat for Bilty verification, payment slips, and trip status updates.</p>
                  <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="btn btn-success btn-sm" style={{ marginTop: '0.5rem' }}>Open WhatsApp Chat</a>
                </div>

                <div className={styles.contactCard}>
                  <div className={styles.cardIcon}>✉️</div>
                  <h4>Email Support</h4>
                  <p><strong>support@safarload.pk</strong></p>
                  <p>Corporate logistics inquiries, partnership programs, and claims desk.</p>
                  <a href="mailto:support@safarload.pk" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>Send Email</a>
                </div>
              </div>

              <h4 className={styles.sectionHeader}>Frequently Asked Questions (FAQs)</h4>
              <div className={styles.faqItem}>
                <strong>Q: How do drivers receive trip payments?</strong>
                <p>A: Drivers receive a 30% instant advance upon loading and Bilty verification, and the remaining 70% upon digital POD delivery confirmation via JazzCash, Easypaisa, or Meezan Bank.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>Q: What should I do in case of a highway emergency?</strong>
                <p>A: Press the red Emergency SOS button in the app to immediately dispatch your location to National Highways & Motorway Police (NHMP 130) and our 24/7 rescue desk.</p>
              </div>
            </div>
          )}

          {activeTab === 'escrow' && (
            <div className={styles.tabContent}>
              <div className={styles.infoBanner}>
                <h3>🛡️ 100% Escrow Protection Guaranteed by SafarLoad</h3>
                <p>
                  Every freight load posted on SafarLoad is backed by our Financial Escrow Guarantee. Shipper funds are pre-deposited into a locked escrow account before truck dispatch.
                </p>
              </div>

              <div className={styles.escrowSteps}>
                <div className={styles.stepBox}>
                  <div className={styles.stepNum}>1</div>
                  <div>
                    <strong>Shipper Pre-Funds Load</strong>
                    <p>Shipper locks freight funds into SafarLoad Escrow upon accepting a bid.</p>
                  </div>
                </div>
                <div className={styles.stepBox}>
                  <div className={styles.stepNum}>2</div>
                  <div>
                    <strong>30% Fuel Advance Released</strong>
                    <p>Upon factory loading and Digital Bilty verification, 30% is immediately released to the driver's wallet.</p>
                  </div>
                </div>
                <div className={styles.stepBox}>
                  <div className={styles.stepNum}>3</div>
                  <div>
                    <strong>70% Final Settlement Release</strong>
                    <p>Upon destination unloading and receiving digital POD confirmation, remaining 70% is instantly paid out.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className={styles.tabContent}>
              <div className={styles.textSection}>
                <h4>1. Data Collection & Usage</h4>
                <p>SafarLoad Technologies Pvt Ltd collects user details including driver CNIC verification, vehicle registration papers (Book/Token), and real-time GPS coordinates to ensure secure cargo transit.</p>

                <h4>2. GPS Location Privacy</h4>
                <p>Location tracking is strictly active only during booked trip transit windows (from Pickup Factory to Destination Unloading). Off-duty location tracking is disabled.</p>

                <h4>3. Identity & Payment Security</h4>
                <p>All financial transaction details and banking credentials are encrypted using AES-256 bank-level encryption. We never share user personal data with third-party advertising brokers.</p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className={styles.tabContent}>
              <div className={styles.textSection}>
                <h4>1. Carrier & Fleet Responsibilities</h4>
                <p>Drivers and fleet operators must maintain valid driving licenses, commercial vehicle fitness certificates, and up-to-date tarpaulin/belt cargo protection equipment.</p>

                <h4>2. Shipper Loading & Demurrage Terms</h4>
                <p>Shippers are granted 6 hours of free loading time upon vehicle arrival at pickup location. Demurrage charges of Rs. 2,000 per extra hour apply thereafter.</p>

                <h4>3. Cargo Insurance & Loss Protection</h4>
                <p>All loads booked through SafarLoad platform carry optional basic transit insurance covering fire, overturn, and theft up to declared cargo value.</p>
              </div>
            </div>
          )}

          {activeTab === 'socials' && (
            <div className={styles.tabContent}>
              <div className={styles.socialGrid}>
                <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className={styles.socialCard} style={{ borderColor: '#25D366' }}>
                  <span style={{ fontSize: '2rem' }}>💬</span>
                  <div>
                    <strong>Official WhatsApp Community</strong>
                    <p>Get daily load alerts & route broadcasts for driver network.</p>
                  </div>
                </a>

                <a href="https://facebook.com" target="_blank" rel="noreferrer" className={styles.socialCard} style={{ borderColor: '#1877F2' }}>
                  <span style={{ fontSize: '2rem' }}>📘</span>
                  <div>
                    <strong>SafarLoad Facebook Page</strong>
                    <p>Community updates, fleet operator stories, and platform news.</p>
                  </div>
                </a>

                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialCard} style={{ borderColor: '#0A66C2' }}>
                  <span style={{ fontSize: '2rem' }}>💼</span>
                  <div>
                    <strong>LinkedIn Corporate Hub</strong>
                    <p>Enterprise logistics solutions & corporate partnership announcements.</p>
                  </div>
                </a>

                <a href="https://youtube.com" target="_blank" rel="noreferrer" className={styles.socialCard} style={{ borderColor: '#FF0000' }}>
                  <span style={{ fontSize: '2rem' }}>📺</span>
                  <div>
                    <strong>SafarLoad YouTube Channel</strong>
                    <p>App video tutorials, driver training guides, and platform walkthroughs.</p>
                  </div>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={styles.footer}>
          <button onClick={onClose} className="btn btn-primary">
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
