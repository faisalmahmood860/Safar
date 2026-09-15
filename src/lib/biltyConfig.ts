'use client';

import { useState, useEffect } from 'react';

const BILTY_ENABLED_STORAGE_KEY = 'safarload_bilty_enabled';

/**
 * Returns true if Bilty feature is enabled by Admin.
 * Default is FALSE (Disabled for all regular users until enabled by Admin).
 */
export function isBiltyEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const value = localStorage.getItem(BILTY_ENABLED_STORAGE_KEY);
    // Default is false (disabled) as requested by user
    if (value === null) return false;
    return value === 'true';
  } catch (err) {
    console.error('Error reading bilty config:', err);
    return false;
  }
}

/**
 * Sets Bilty feature enabled/disabled state (Admin control).
 * Dispatches custom event so UI updates instantly across all components.
 */
export function setBiltyEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BILTY_ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('safarload_bilty_toggle_event'));
  } catch (err) {
    console.error('Error setting bilty config:', err);
  }
}

/**
 * React Hook to subscribe to Bilty feature toggle state.
 */
export function useBiltyEnabled(): boolean {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    setEnabled(isBiltyEnabled());

    const handleToggle = () => {
      setEnabled(isBiltyEnabled());
    };

    window.addEventListener('safarload_bilty_toggle_event', handleToggle);
    window.addEventListener('storage', handleToggle);
    return () => {
      window.removeEventListener('safarload_bilty_toggle_event', handleToggle);
      window.removeEventListener('storage', handleToggle);
    };
  }, []);

  return enabled;
}
