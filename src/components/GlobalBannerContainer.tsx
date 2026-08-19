'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export interface PlatformBanner {
  id: string;
  title: string;
  message: string;
  bannerType: 'feature_update' | 'payment_warning' | 'system_alert';
  targetAudience: 'all' | 'driver' | 'shipper' | 'fleet' | 'specific_user';
  targetUserEmail?: string;
  actionText?: string;
  actionUrl?: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export const initialPlatformBanners: PlatformBanner[] = [
  {
    id: 'BAN-101',
    title: '🚀 NEW FEATURE: Pakistani Digital Bilty (گڈز رسید) System Live!',
    message: 'Shippers & Drivers can now generate, inspect, and print official Pakistani Transport Bilty receipts with QR verification.',
    bannerType: 'feature_update',
    targetAudience: 'all',
    actionText: '📜 Try Digital Bilty',
    actionUrl: '/dashboard/trips',
    status: 'active',
    createdAt: '2026-08-19',
  },
  {
    id: 'BAN-102',
    title: '⚠️ OVERDUE PAYMENT NOTICE: Escrow Clearance Required',
    message: 'Your account has an overdue platform fee of Rs. 14,500 for Multan → Karachi shipments. Please clear dues to avoid account lock.',
    bannerType: 'payment_warning',
    targetAudience: 'specific_user',
    targetUserEmail: 'Noor Textile Mills',
    actionText: '💳 Clear Overdue Dues',
    actionUrl: '/dashboard/wallet',
    status: 'active',
    createdAt: '2026-08-19',
  },
];

export default function GlobalBannerContainer() {
  const [banners, setBanners] = useState<PlatformBanner[]>(initialPlatformBanners);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('safarload_global_banners');
      if (stored) {
        setBanners(JSON.parse(stored));
      } else {
        localStorage.setItem('safarload_global_banners', JSON.stringify(initialPlatformBanners));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const activeBanners = banners.filter((b) => b.status === 'active' && !dismissedIds.includes(b.id));

  if (activeBanners.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
      {activeBanners.map((b) => {
        const isWarning = b.bannerType === 'payment_warning';
        const isAlert = b.bannerType === 'system_alert';

        const bg = isAlert
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.25) 100%)'
          : isWarning
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.25) 100%)'
          : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.25) 100%)';

        const border = isAlert ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';
        const badgeText = isAlert ? '🚨 CRITICAL SYSTEM ALERT' : isWarning ? '⚠️ OVERDUE PAYMENT WARNING' : '📢 NEW FEATURE RELEASE';

        return (
          <div
            key={b.id}
            className="animate-fadeIn"
            style={{
              background: bg,
              border: `1.5px solid ${border}`,
              borderRadius: '14px',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: `0 4px 20px ${border}25`,
            }}
          >
            <div style={{ flex: 1, minWidth: '280px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: border,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '2px',
                }}
              >
                {badgeText} {b.targetAudience !== 'all' && `[Target: ${b.targetAudience.toUpperCase()}]`}
              </span>
              <h4 style={{ margin: 0, fontSize: '1rem', color: '#F1F5F9', fontWeight: 800 }}>{b.title}</h4>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#CBD5E1' }}>{b.message}</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {b.actionUrl && (
                <Link href={b.actionUrl} className="btn btn-primary btn-sm" style={{ background: border, borderColor: border }}>
                  {b.actionText || 'Take Action'}
                </Link>
              )}
              <button
                onClick={() => setDismissedIds((prev) => [...prev, b.id])}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                }}
                title="Dismiss Banner"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
