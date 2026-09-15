'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Route Error:', error);
  }, [error]);

  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        maxWidth: '600px',
        margin: '2rem auto',
        textAlign: 'center',
        background: 'rgba(30, 41, 59, 0.95)',
        border: '1px solid #334155',
        borderRadius: '16px',
        color: '#F8FAFC',
      }}
    >
      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38BDF8', marginBottom: '0.5rem' }}>
        Dashboard Portal Transient Error
      </h2>
      <p style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
        A temporary error occurred while rendering this portal view. Resetting your session parameters will restore the view.
      </p>

      {error?.message && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '0.8rem',
            color: '#FCA5A5',
            fontFamily: 'monospace',
            marginBottom: '1.5rem',
            wordBreak: 'break-word',
          }}
        >
          {error.message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          style={{
            background: '#0284C7',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          🔄 Try Again
        </button>
        <Link
          href="/dashboard"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: '#F8FAFC',
            border: '1px solid #475569',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          🏠 Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
