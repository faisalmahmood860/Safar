'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './NotificationBell.module.css';
import {
  AppNotification,
  getStoredNotifications,
  saveStoredNotifications,
} from '@/lib/notificationSystem';

interface Props {
  userRole?: string;
  lang?: 'en' | 'ur';
}

export default function NotificationBell({ userRole = 'all', lang = 'en' }: Props) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  const loadNotifs = () => {
    const all = getStoredNotifications();
    setNotifications(all);
  };

  useEffect(() => {
    loadNotifs();

    // Listen for notification changes across windows/tabs
    const handleNotifChange = () => {
      loadNotifs();
    };

    // Listen for new toast events
    const handleToastEvent = (e: CustomEvent<AppNotification>) => {
      loadNotifs();
      setActiveToast(e.detail);
      // Auto hide toast after 5 seconds
      setTimeout(() => {
        setActiveToast(null);
      }, 5000);
    };

    window.addEventListener('safarload_notification_change', handleNotifChange as EventListener);
    window.addEventListener('safarload_toast_event', handleToastEvent as EventListener);

    return () => {
      window.removeEventListener('safarload_notification_change', handleNotifChange as EventListener);
      window.removeEventListener('safarload_toast_event', handleToastEvent as EventListener);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    saveStoredNotifications([]);
  };

  const markSingleRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    saveStoredNotifications(updated);
    setIsOpen(false);
  };

  return (
    <>
      <div className={styles.bellWrapper}>
        <button
          className={styles.bellBtn}
          onClick={() => setIsOpen(!isOpen)}
          title="Notifications & Alerts"
        >
          🔔
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <h4>{lang === 'en' ? 'Live Notifications' : 'نوٹیفیکیشنز'}</h4>
              <div className={styles.actionLinks}>
                <button className={styles.actionBtn} onClick={markAllRead}>
                  {lang === 'en' ? 'Mark Read' : 'پڑھا ہوا'}
                </button>
                <button className={styles.actionBtn} onClick={clearAll}>
                  {lang === 'en' ? 'Clear' : 'صاف کریں'}
                </button>
              </div>
            </div>

            <div className={styles.list}>
              {notifications.length === 0 ? (
                <div className={styles.emptyState}>
                  {lang === 'en' ? 'No new notifications' : 'کوئی نیا نوٹیفکیشن نہیں'}
                </div>
              ) : (
                notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.actionUrl || '#'}
                    className={`${styles.item} ${!n.read ? styles.unreadItem : ''}`}
                    onClick={() => markSingleRead(n.id)}
                  >
                    <div className={styles.itemTitle}>
                      <span>{lang === 'en' ? n.titleEn : n.titleUr}</span>
                      <span className={styles.itemTime}>{n.timestamp}</span>
                    </div>
                    <div className={styles.itemMsg}>
                      {lang === 'en' ? n.messageEn : n.messageUr}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Toast Popup Banner */}
      {activeToast && (
        <div className={styles.toastBanner}>
          <span style={{ fontSize: '1.4rem' }}>🔔</span>
          <div className={styles.toastContent}>
            <div className={styles.toastTitle}>
              {lang === 'en' ? activeToast.titleEn : activeToast.titleUr}
            </div>
            <div className={styles.toastMsg}>
              {lang === 'en' ? activeToast.messageEn : activeToast.messageUr}
            </div>
          </div>
          <button className={styles.toastClose} onClick={() => setActiveToast(null)}>
            ✕
          </button>
        </div>
      )}
    </>
  );
}
