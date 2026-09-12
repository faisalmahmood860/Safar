'use client';

import React, { useState, useEffect } from 'react';
import styles from './VoIPCallModal.module.css';
import {
  CallSession,
  getCurrentCallSession,
  acceptVoIPCall,
  declineVoIPCall,
  endVoIPCall,
  toggleCallMute,
  toggleCallSpeaker,
  formatCallTimer,
} from '@/lib/voipCallSystem';

export default function VoIPCallModal() {
  const [session, setSession] = useState<CallSession | null>(null);

  useEffect(() => {
    // Initial fetch
    setSession(getCurrentCallSession());

    // Event listener for global VoIP state events
    const handleCallStateChange = (e: CustomEvent<CallSession | null>) => {
      setSession(e.detail ? { ...e.detail } : null);
    };

    window.addEventListener('safarload_voip_call_change', handleCallStateChange as EventListener);
    return () => {
      window.removeEventListener('safarload_voip_call_change', handleCallStateChange as EventListener);
    };
  }, []);

  if (!session || session.status === 'idle') {
    return null;
  }

  const isIncoming = session.direction === 'incoming' && session.status === 'ringing';
  const isConnected = session.status === 'connected';

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.appBadge}>
            📞 SafarLoad HD Voice VoIP
          </div>
          <div className={styles.securityBadge}>
            🔒 End-to-End Encrypted
          </div>
        </div>

        {/* Driver Avatar & Pulse Effect */}
        <div className={styles.avatarWrapper}>
          {(session.status === 'dialing' || session.status === 'ringing') && (
            <div className={styles.pulseRing}></div>
          )}
          <div className={styles.avatarRing}>
            👨‍✈️
          </div>
        </div>

        {/* Peer Meta */}
        <h2 className={styles.peerName}>{session.peer.name}</h2>
        <div className={styles.peerMeta}>
          {session.peer.truck && <span>🚛 {session.peer.truck}</span>}
          <span>•</span>
          <span>📱 {session.peer.phone}</span>
        </div>

        {/* Status Badge */}
        {session.status === 'dialing' && (
          <span className={`${styles.statusTag} ${styles.statusDialing}`}>
            Dialing Driver (کال ملائی جا رہی ہے)...
          </span>
        )}
        {session.status === 'ringing' && (
          <span className={`${styles.statusTag} ${styles.statusRinging}`}>
            {session.direction === 'outgoing' ? 'Ringing (گھنٹی جا رہی ہے)...' : 'Incoming Driver Voice Call!'}
          </span>
        )}
        {session.status === 'connected' && (
          <span className={`${styles.statusTag} ${styles.statusConnected}`}>
            ● HD Voice Connected (بات چیت جاری ہے)
          </span>
        )}
        {session.status === 'ended' && (
          <span className={`${styles.statusTag} ${styles.statusEnded}`}>
            Call Disconnected (کال ختم ہو گئی)
          </span>
        )}
        {session.status === 'declined' && (
          <span className={`${styles.statusTag} ${styles.statusEnded}`}>
            Call Declined (کال نہیں اٹھائی گئی)
          </span>
        )}

        {/* Connected Call Timer & Audio Waveform */}
        {isConnected && (
          <>
            <div className={styles.timer}>
              {formatCallTimer(session.durationSeconds)}
            </div>

            <div className={styles.waveformContainer}>
              <div className={styles.waveBar}></div>
              <div className={styles.waveBar}></div>
              <div className={styles.waveBar}></div>
              <div className={styles.waveBar}></div>
              <div className={styles.waveBar}></div>
              <div className={styles.waveBar}></div>
            </div>
          </>
        )}

        {/* Call Controls */}
        <div className={styles.actionsRow}>
          {isIncoming ? (
            <>
              {/* Incoming Call: Accept or Decline */}
              <div className={styles.controlGroup}>
                <button
                  onClick={() => declineVoIPCall()}
                  className={styles.hangupBtn}
                  title="Decline Call"
                >
                  📞
                </button>
                <span className={styles.btnLabel}>Decline</span>
              </div>

              <div className={styles.controlGroup}>
                <button
                  onClick={() => acceptVoIPCall()}
                  className={styles.acceptBtn}
                  title="Accept Call"
                >
                  📞
                </button>
                <span className={styles.btnLabel}>Answer Call</span>
              </div>
            </>
          ) : (
            <>
              {/* Outgoing or Connected Call Controls */}
              {isConnected && (
                <>
                  <div className={styles.controlGroup}>
                    <button
                      onClick={() => toggleCallMute()}
                      className={`${styles.controlBtn} ${session.isMuted ? styles.controlBtnActive : ''}`}
                      title={session.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    >
                      {session.isMuted ? '🔇' : '🎙️'}
                    </button>
                    <span className={styles.btnLabel}>{session.isMuted ? 'Unmute' : 'Mute'}</span>
                  </div>

                  <div className={styles.controlGroup}>
                    <button
                      onClick={() => toggleCallSpeaker()}
                      className={`${styles.controlBtn} ${session.isSpeaker ? styles.controlBtnActive : ''}`}
                      title={session.isSpeaker ? 'Switch to Earpiece' : 'Switch to Speaker'}
                    >
                      {session.isSpeaker ? '🔊' : '🎧'}
                    </button>
                    <span className={styles.btnLabel}>{session.isSpeaker ? 'Speaker' : 'Earpiece'}</span>
                  </div>
                </>
              )}

              {/* End Call / Hang Up */}
              <div className={styles.controlGroup}>
                <button
                  onClick={() => endVoIPCall()}
                  className={styles.hangupBtn}
                  title="Hang Up"
                >
                  📞
                </button>
                <span className={styles.btnLabel}>End Call</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
