'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface ChatMessage {
  id: string;
  sender: 'driver' | 'shipper';
  text: string;
  time: string;
  isLocationPin?: boolean;
  gpsCoordinates?: { lat: number; lng: number; address: string };
}

export default function LiveTrackingPage() {
  const [userRole, setUserRole] = useState<'shipper' | 'driver'>('shipper');
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [currentEta, setCurrentEta] = useState('5h 30m');
  const [destinationAddress, setDestinationAddress] = useState('Gate 3, Port Qasim, Bin Qasim Town, Karachi');
  const [routeProgress, setRouteProgress] = useState(65);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'driver', text: 'Assalam-o-Alaikum! Freight loaded from Multan factory. On the way to Karachi.', time: '02:15 PM' },
    { id: '2', sender: 'shipper', text: 'Walaikum Assalam Muhammad Aslam sahib! Please make sure tarpaulin is secured properly.', time: '02:18 PM' },
    { id: '3', sender: 'driver', text: 'Ji bilkul! Double belts applied. Reached Nooriabad now, ETA Karachi 5:30 PM.', time: '03:45 PM' },
    {
      id: '4',
      sender: 'shipper',
      text: '📍 Shared Warehouse GPS Location: Port Qasim Industrial Area Gate 3, Karachi',
      time: '03:48 PM',
      isLocationPin: true,
      gpsCoordinates: { lat: 24.7732, lng: 67.3481, address: 'Port Qasim Gate 3 Warehouse, Karachi' },
    },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Assigned Shipment Data (Strict Privacy - Only 1-to-1 Pairing Shown)
  const activeShipment = {
    id: 'LD-2026-001',
    route: 'Multan → Karachi',
    cargo: '25 Tons Cotton Bales',
    truckNumber: 'LHR-5678',
    truckType: 'Trailer (25 Tons)',
    speed: '85 km/h',
    eta: currentEta,
    progress: routeProgress,
    lastLocation: 'Nooriabad M-9 Highway',

    // Driver Details (Shown to Shipper)
    driverName: 'Muhammad Aslam',
    driverNameUr: 'محمد اسلم',
    driverPhone: '+92 301 2345678',
    driverCnic: '35201-1234567-1 (Verified ✅)',
    driverRating: 4.8,

    // Shipper Details (Shown to Driver)
    shipperName: 'Noor Textile Mills Ltd',
    shipperContact: 'Tariq Hussain (Manager)',
    shipperPhone: '+92 42 35789000',
    dropoffWarehouse: destinationAddress,
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: userRole,
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setNewMessage('');
  };

  const handleShareLocationPin = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const locationMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'shipper',
      text: '📍 Shared Live GPS Warehouse Pin: Gate 3, Port Qasim Industrial Zone, Karachi',
      time: timeStr,
      isLocationPin: true,
      gpsCoordinates: { lat: 24.7732, lng: 67.3481, address: 'Gate 3, Port Qasim Industrial Zone, Karachi' },
    };

    setChatMessages((prev) => [...prev, locationMsg]);
    alert('📍 Exact Warehouse GPS Coordinates Shared with Driver!');
  };

  const handleSetDestinationFromChat = (pinAddress: string) => {
    setDestinationAddress(pinAddress);
    setCurrentEta('3h 45m (Expected 07:15 PM)');
    setRouteProgress(78);

    alert(
      `🗺️ Navigation Route Updated on SafarLoad App!\nNew Destination: ${pinAddress}\n\nETA Arrival Time recalculated: 3h 45m (Expected Arrival: 07:15 PM Today). Shipper and Driver dashboards synced!`
    );
  };

  return (
    <div className={styles.container} dir="ltr">
      {/* Header */}
      <header className={styles.header}>
        <div>
          <div className={styles.trackingBadge}>📍 Live GPS Radar & Dedicated Communications Desk</div>
          <h1>Track Shipment — {activeShipment.id}</h1>
          <p>Real-time satellite GPS tracking with strict 1-to-1 Privacy Chat between assigned Driver and Shipper.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setUserRole(userRole === 'shipper' ? 'driver' : 'shipper')}
            className="btn btn-glass btn-sm"
          >
            👤 Viewing As: {userRole === 'shipper' ? '🏢 Shipper' : '🚛 Driver'} (Click to Toggle)
          </button>
          <button onClick={() => setShowChatDrawer(true)} className="btn btn-primary btn-sm">
            💬 Open Direct Chat ({chatMessages.length})
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className={styles.trackingGrid}>
        {/* Map Visualization Box */}
        <div className={`${styles.mapBox} glass-card`}>
          <div className={styles.mapHeader}>
            <div>
              <h3>🗺️ M-9 Motorway Live GPS Track</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>🟢 Signal Active | Speed: {activeShipment.speed}</span>
            </div>
            <div className={styles.etaPill}>ETA: {activeShipment.eta}</div>
          </div>

          <div className={styles.simulatedMap}>
            <div className={styles.roadLine}></div>
            <div className={styles.pulseRadar} style={{ left: '65%' }}>
              🚛
              <div className={styles.markerLabel}>{activeShipment.truckNumber} ({activeShipment.driverName})</div>
            </div>
            <div className={styles.locationPin} style={{ left: '10%' }}>📍 Multan</div>
            <div className={styles.locationPin} style={{ right: '10%' }}>🏁 Karachi</div>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressRow}>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${activeShipment.progress}%` }}></div>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{activeShipment.progress}% Completed</span>
          </div>
        </div>

        {/* STRICT PRIVACY PARTY DETAILS CARD */}
        <div className={`${styles.privacyCard} glass-card`}>
          {userRole === 'shipper' ? (
            /* SHIPPER VIEWS ONLY ASSIGNED DRIVER DETAILS */
            <div className={styles.partyBox}>
              <div className={styles.partyHeader}>
                <h3>👨‍✈️ Your Assigned Driver</h3>
                <span className="badge badge-success">Verified ✅</span>
              </div>

              <div className={styles.partyMeta}>
                <p><strong>Name:</strong> {activeShipment.driverName} ({activeShipment.driverNameUr})</p>
                <p><strong>Phone:</strong> {activeShipment.driverPhone}</p>
                <p><strong>CNIC Verified:</strong> {activeShipment.driverCnic}</p>
                <p><strong>Vehicle Reg:</strong> {activeShipment.truckNumber} ({activeShipment.truckType})</p>
                <p><strong>Rating:</strong> ⭐ {activeShipment.driverRating} / 5.0</p>
              </div>

              <div className={styles.privacyNotice}>
                🔒 <em>Driver details strictly restricted to assigned shipper for load LD-2026-001.</em>
              </div>

              <div className={styles.partyActions}>
                <button
                  onClick={() => alert(`📞 Dialing Assigned Driver ${activeShipment.driverName} (${activeShipment.driverPhone})...`)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  📞 Call Driver Now
                </button>
                <button
                  onClick={() => setShowChatDrawer(true)}
                  className="btn btn-glass btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  💬 Send Direct Message
                </button>
              </div>
            </div>
          ) : (
            /* DRIVER VIEWS ONLY ASSIGNED SHIPPER DETAILS */
            <div className={styles.partyBox}>
              <div className={styles.partyHeader}>
                <h3>🏢 Your Assigned Shipper</h3>
                <span className="badge badge-success">Verified Enterprise ✅</span>
              </div>

              <div className={styles.partyMeta}>
                <p><strong>Company:</strong> {activeShipment.shipperName}</p>
                <p><strong>Contact Person:</strong> {activeShipment.shipperContact}</p>
                <p><strong>Phone:</strong> {activeShipment.shipperPhone}</p>
                <p><strong>Dropoff Address:</strong> {activeShipment.dropoffWarehouse}</p>
              </div>

              <div className={styles.privacyNotice}>
                🔒 <em>Shipper warehouse details strictly restricted to assigned driver for load LD-2026-001.</em>
              </div>

              <div className={styles.partyActions}>
                <button
                  onClick={() => alert(`📞 Dialing Assigned Shipper ${activeShipment.shipperName} (${activeShipment.shipperPhone})...`)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  📞 Call Shipper Now
                </button>
                <button
                  onClick={() => setShowChatDrawer(true)}
                  className="btn btn-glass btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  💬 Send Direct Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DIRECT CHAT DRAWER MODAL */}
      {showChatDrawer && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.chatCard} glass-card animate-scaleIn`}>
            <div className={styles.chatHeader}>
              <div>
                <h3>
                  💬 Direct Chat: {userRole === 'shipper' ? activeShipment.driverName : activeShipment.shipperName}
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Load ID: {activeShipment.id} | Encrypted 1-to-1</span>
              </div>
              <button onClick={() => setShowChatDrawer(false)} className={styles.closeBtn}>✕</button>
            </div>

            {/* Messages Body */}
            <div className={styles.chatBody}>
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.chatBubble} ${msg.sender === userRole ? styles.sentBubble : styles.receivedBubble}`}
                >
                  <div className={styles.bubbleText}>{msg.text}</div>

                  {/* SPECIAL LOCATION PIN CARD WITH DESTINATION RECALCULATION */}
                  {msg.isLocationPin && msg.gpsCoordinates && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981' }}>
                        📍 Verified Warehouse Pin ({msg.gpsCoordinates.lat}, {msg.gpsCoordinates.lng})
                      </div>
                      <button
                        onClick={() => handleSetDestinationFromChat(msg.gpsCoordinates!.address)}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.75rem' }}
                      >
                        🗺️ Set as Destination / Recalculate ETA (روٹ اور وقت اپڈیٹ کریں)
                      </button>
                    </div>
                  )}

                  <span className={styles.bubbleTime}>{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Form & Location Pin Button */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {userRole === 'shipper' && (
                <button onClick={handleShareLocationPin} type="button" className="btn btn-glass btn-sm" style={{ width: '100%', fontSize: '0.8rem' }}>
                  📍 Share Warehouse GPS Location Pin (شپر مقام بھیجیں)
                </button>
              )}
            </div>

            <form onSubmit={handleSendMessage} className={styles.chatInputRow}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={userRole === 'shipper' ? 'Type message to driver...' : 'Type message to shipper...'}
                className="input"
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                📤 Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
