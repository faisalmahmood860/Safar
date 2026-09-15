'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
        color: '#F8FAFC',
        fontFamily: 'sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.9)',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '2.5rem',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}
      >
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🚛</span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#38BDF8' }}>
          SafarLoad Recovery Hub
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#94A3B8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          We encountered a transient layout initialization issue. Click below to automatically refresh your session workspace.
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
            🔄 Reload Workspace
          </button>
          <Link
            href="/login"
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
            🔑 Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
