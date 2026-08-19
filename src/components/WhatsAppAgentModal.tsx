'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './WhatsAppAgentModal.module.css';

export interface WhatsAppMessage {
  id: string;
  sender: 'user' | 'bot' | 'human_agent';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface WhatsAppSession {
  sessionId: string;
  userName: string;
  userPhone: string;
  userRole: 'driver' | 'shipper' | 'fleet';
  messages: WhatsAppMessage[];
  status: 'bot_active' | 'human_agent_connected';
  lastActivity: string;
}

export default function WhatsAppAgentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<WhatsAppSession>({
    sessionId: 'WA-SESS-9842',
    userName: 'Muhammad Aslam (Driver)',
    userPhone: '+92 301 2345678',
    userRole: 'driver',
    status: 'bot_active',
    lastActivity: 'Just now',
    messages: [
      {
        id: '1',
        sender: 'bot',
        senderName: 'SafarLoad AI Bot 🤖',
        text: 'Assalam-o-Alaikum! Welcome to SafarLoad WhatsApp Assistant (سفر لوڈ واٹس ایپ اسسٹنٹ).\n\nHow can I help you today?\n1️⃣ Type "load" to find cargo loads (لوڈ تلاش کریں)\n2️⃣ Type "return" to broadcast return truck (خالی گاڑی)\n3️⃣ Type "bilty" to view goods receipt (بلٹی)\n4️⃣ Type "agent" to connect with Human Support (ایجنٹ سے بات کریں)',
        timestamp: '12:00 PM',
      },
    ],
  });

  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync session with localStorage for Support Portal live updates
  useEffect(() => {
    try {
      const stored = localStorage.getItem('safarload_whatsapp_chats');
      if (stored) {
        setSession(JSON.parse(stored));
      } else {
        localStorage.setItem('safarload_whatsapp_chats', JSON.stringify(session));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.messages, isOpen]);

  const saveSession = (updated: WhatsAppSession) => {
    setSession(updated);
    try {
      localStorage.setItem('safarload_whatsapp_chats', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const generateBotReply = (userMsg: string): { replyText: string; triggerHandoff?: boolean } => {
    const msg = userMsg.toLowerCase().trim();

    if (msg.includes('agent') || msg.includes('human') || msg.includes('support') || msg.includes('ایجنٹ') || msg.includes('مدد')) {
      return {
        replyText: '🎧 Connecting you to Live SafarLoad Human Agent (Ayesha Khan)... Your message history has been pushed to the Support Dashboard queue. An agent will respond shortly.',
        triggerHandoff: true,
      };
    }

    if (msg.includes('load') || msg.includes('لوڈ')) {
      return {
        replyText: '🚚 *Live Available Freight Loads (فعال لوڈز)*:\n• Multan → Karachi (25 Tons Cotton) - Rs. 185,000\n• Lahore → Peshawar (18 Tons Steel) - Rs. 120,000\n• DG Khan → Lahore (20 Tons Cement) - Rs. 95,000\n\nReply with load route to book instantly!',
      };
    }

    if (msg.includes('return') || msg.includes('خالی')) {
      return {
        replyText: '🟢 *Broadcast Return Availability (خالی گاڑی)*:\nYour vehicle Trailer LHR-5678 is now broadcasted as Available in Karachi Port Gate 2! 10,000+ shippers can now send counter bids.',
      };
    }

    if (msg.includes('bilty') || msg.includes('بلٹی')) {
      return {
        replyText: '📜 *Digital Bilty Verification (بلٹی رسید)*:\nLatest Bilty #BLT-2026-901 for Multan → Karachi (Noor Textile Mills) is VERIFIED & ESCROW LOCKED ✅. Click "View Bilty" in your driver trips portal to print.',
      };
    }

    return {
      replyText: `🤖 Thank you for your message: "${userMsg}".\n\nType "agent" to connect with a Live Support Staff member, or type "load", "return", or "bilty" for automated services.`,
    };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMsg: WhatsAppMessage = {
      id: Date.now().toString(),
      sender: 'user',
      senderName: session.userName,
      text: inputText,
      timestamp: timeStr,
    };

    const updatedMessages = [...session.messages, newUserMsg];
    const botRes = generateBotReply(inputText);

    const isHandoff = botRes.triggerHandoff || session.status === 'human_agent_connected';

    const botReplyMsg: WhatsAppMessage = {
      id: (Date.now() + 1).toString(),
      sender: isHandoff ? 'human_agent' : 'bot',
      senderName: isHandoff ? 'Support Agent Ayesha 🎧' : 'SafarLoad AI Bot 🤖',
      text: botRes.replyText,
      timestamp: timeStr,
    };

    const updatedSession: WhatsAppSession = {
      ...session,
      status: isHandoff ? 'human_agent_connected' : session.status,
      lastActivity: 'Just now',
      messages: [...updatedMessages, botReplyMsg],
    };

    setInputText('');
    saveSession(updatedSession);
  };

  return (
    <>
      {/* FLOATING WHATSAPP TRIGGER BUTTON */}
      <button onClick={() => setIsOpen(!isOpen)} className={styles.floatingTrigger}>
        <span className={styles.waIcon}>💬</span>
        <span className={styles.waBadge}>AI</span>
      </button>

      {/* WHATSAPP CHAT MODAL */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* HEADER */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div className={styles.avatar}>🤖</div>
              <div>
                <strong>SafarLoad WhatsApp AI Agent</strong>
                <span className={styles.statusOnline}>
                  {session.status === 'human_agent_connected' ? '🎧 Live Support Connected' : '🟢 Automated Bot Online'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>✕</button>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div className={styles.chatBody}>
            {session.messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.msgBubble} ${
                  m.sender === 'user' ? styles.userBubble : m.sender === 'human_agent' ? styles.agentBubble : styles.botBubble
                }`}
              >
                <span className={styles.senderLabel}>{m.senderName}</span>
                <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{m.text}</p>
                <span className={styles.msgTime}>{m.timestamp}</span>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* CHAT INPUT FORM */}
          <form onSubmit={handleSendMessage} className={styles.chatFooter}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={session.status === 'human_agent_connected' ? 'Type message to Live Support Agent...' : 'Type "agent", "load", "return"...'}
              className={styles.waInput}
            />
            <button type="submit" className={styles.sendBtn}>
              📤
            </button>
          </form>

          <div className={styles.quickBar}>
            <button type="button" onClick={() => setInputText('agent')} className={styles.chip}>
              👨‍💼 Connect to Agent
            </button>
            <button type="button" onClick={() => setInputText('load')} className={styles.chip}>
              🚚 Find Loads
            </button>
            <button type="button" onClick={() => setInputText('bilty')} className={styles.chip}>
              📜 Check Bilty
            </button>
          </div>
        </div>
      )}
    </>
  );
}
