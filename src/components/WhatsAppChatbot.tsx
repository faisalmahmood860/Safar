'use client';

import React, { useState } from 'react';
import styles from './WhatsAppChatbot.module.css';

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([
    {
      sender: 'bot',
      text: 'السلام علیکم! SafarLoad WhatsApp Assistant میں خوش آمدید۔ آپ کی کیا مدد کر سکتے ہیں؟',
    },
  ]);
  const [userInput, setUserInput] = useState('');

  const whatsappNumber = '923000000000'; // Replace with official SafarLoad WhatsApp Business Number

  const quickQuestions = [
    { label: '🚛 Find Load / لوڈ تلاش کریں', text: 'I want to find a load for my truck' },
    { label: '📦 Post Cargo / کارگو پوسٹ کریں', text: 'I want to post cargo for shipment' },
    { label: '💰 Escrow Payment / ایسکرو ادائیگی', text: 'How does escrow payment work?' },
    { label: '📞 Talk to Live Agent on WhatsApp', text: 'Connect me with live support on WhatsApp' },
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setUserInput('');

    // Simulate Bot Response or Direct to WhatsApp
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'ہمارے نمائندے سے واٹس ایپ پر براہ راست چیٹ کے لیے نیچے دیے گئے بٹن پر کلک کریں۔',
        },
      ]);
    }, 800);
  };

  const openWhatsAppDirect = () => {
    const encoded = encodeURIComponent('Hello SafarLoad! I need assistance with truck dispatching.');
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className={styles.chatbotWrapper}>
      {/* Floating Chat Button */}
      <button onClick={() => setIsOpen(!isOpen)} className={styles.floatingBtn} title="WhatsApp Support">
        <span className={styles.waIcon}>💬</span>
        <span className={styles.badgePulse}>WhatsApp Chatbot</span>
      </button>

      {/* Chat Popup Box */}
      {isOpen && (
        <div className={`${styles.chatWindow} glass-card animate-scaleIn`}>
          <div className={styles.chatHeader}>
            <div className={styles.headerTitle}>
              <span className={styles.headerIcon}>💬</span>
              <div>
                <strong>SafarLoad WhatsApp Bot</strong>
                <div className={styles.statusOnline}>● Online 24/7 (Urdu & English)</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>✕</button>
          </div>

          {/* Chat History */}
          <div className={styles.chatBody}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`${styles.messageBubble} ${m.sender === 'user' ? styles.userMsg : styles.botMsg}`}
              >
                {m.text}
              </div>
            ))}

            {/* Quick Prompts */}
            <div className={styles.quickPrompts}>
              {quickQuestions.map((q, idx) => (
                <button key={idx} onClick={() => handleSend(q.text)} className={styles.promptChip}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Action Footer */}
          <div className={styles.chatFooter}>
            <button onClick={openWhatsAppDirect} className={styles.whatsappActionBtn}>
              📱 Continue Chat on WhatsApp (واٹس ایپ پر کھولیں)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
