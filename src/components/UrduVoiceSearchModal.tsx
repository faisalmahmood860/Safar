'use client';

import React, { useState, useEffect } from 'react';
import styles from './UrduVoiceSearchModal.module.css';

interface UrduVoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSearchQuery: (query: string) => void;
}

export default function UrduVoiceSearchModal({ isOpen, onClose, onSelectSearchQuery }: UrduVoiceSearchModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('اردو میں شہر کا نام بولیں (Press Record to Speak)');

  useEffect(() => {
    if (isOpen) {
      setIsListening(false);
      setRecognizedText('');
      setVoiceStatus('اردو میں شہر کا نام بولیں (Press Record to Speak)');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setIsListening(true);
    setVoiceStatus('🎙️ 🎤 سن رہا ہوں... بولیں! (Listening...)');
    setRecognizedText('');

    // Simulate voice speech recognition response
    setTimeout(() => {
      setIsListening(false);
      const sampleQueries = ['Lahore', 'Multan to Karachi', 'Flatbed Trailer 25 Ton', 'Peshawar', 'Faisalabad Textile'];
      const chosen = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      setRecognizedText(chosen);
      setVoiceStatus(`✅ Voice Command Captured: "${chosen}"`);
    }, 2800);
  };

  const handleApplyVoiceQuery = (queryText: string) => {
    onSelectSearchQuery(queryText);
    onClose();
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={`${styles.modalCard} glass-card animate-scaleIn`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.icon}>🎙️</span>
            <div>
              <h3>Urdu & English Voice Assistant (وائس لوکیشن تلاش)</h3>
              <p>Speak city names, cargo types, or trailer specifications in Urdu or English</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Audio Visualizer Waves */}
          <div className={styles.visualizerArea}>
            <button
              onClick={handleStartRecording}
              className={`${styles.micCircle} ${isListening ? styles.listeningMic : ''}`}
            >
              🎙️
            </button>
            <div className={styles.statusText}>{voiceStatus}</div>

            {isListening && (
              <div className={styles.waveContainer}>
                <div className={styles.waveBar}></div>
                <div className={styles.waveBar}></div>
                <div className={styles.waveBar}></div>
                <div className={styles.waveBar}></div>
                <div className={styles.waveBar}></div>
              </div>
            )}
          </div>

          {recognizedText && (
            <div className={styles.recognizedResultBox}>
              <div className={styles.resultLabel}>Recognized Voice Result:</div>
              <div className={styles.resultText}>"{recognizedText}"</div>
              <button
                onClick={() => handleApplyVoiceQuery(recognizedText)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.75rem' }}
              >
                🔍 Search Load Board for "{recognizedText}"
              </button>
            </div>
          )}

          {/* Quick Voice Command Chips */}
          <div className={styles.chipsSection}>
            <h4>Suggested Voice Commands (تجویز کردہ کمانڈز)</h4>
            <div className={styles.chipGrid}>
              <button onClick={() => handleApplyVoiceQuery('Lahore')} className={styles.chipBtn}>
                📍 Lahore (لاہور)
              </button>
              <button onClick={() => handleApplyVoiceQuery('Karachi')} className={styles.chipBtn}>
                📍 Karachi (کراچی)
              </button>
              <button onClick={() => handleApplyVoiceQuery('Multan')} className={styles.chipBtn}>
                📍 Multan (ملتان)
              </button>
              <button onClick={() => handleApplyVoiceQuery('Peshawar')} className={styles.chipBtn}>
                📍 Peshawar (پشاور)
              </button>
              <button onClick={() => handleApplyVoiceQuery('Flatbed Trailer')} className={styles.chipBtn}>
                🚛 Flatbed Trailer
              </button>
              <button onClick={() => handleApplyVoiceQuery('Container')} className={styles.chipBtn}>
                📦 40ft Container
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className="btn btn-glass">Close</button>
        </div>
      </div>
    </div>
  );
}
