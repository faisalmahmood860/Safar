/**
 * SafarLoad High-Efficiency Database API Client
 * Connects frontend views directly to the SQLite Next.js backend API
 */

export interface LoadFilterParams {
  pickup_city?: string;
  dropoff_city?: string;
  truck_type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const apiClient = {
  // === LOADS API ===
  async getLoads(params?: LoadFilterParams) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') query.append(key, String(val));
      });
    }
    const res = await fetch(`/api/loads?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch loads: ${res.statusText}`);
    return res.json();
  },

  async getLoadById(id: string) {
    const res = await fetch(`/api/loads/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch load ${id}`);
    return res.json();
  },

  async createLoad(loadData: any) {
    const res = await fetch('/api/loads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loadData),
    });
    if (!res.ok) throw new Error(`Failed to create load: ${res.statusText}`);
    return res.json();
  },

  async updateLoadStatus(id: string, status: string) {
    const res = await fetch(`/api/loads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error(`Failed to update load: ${res.statusText}`);
    return res.json();
  },

  async deleteLoad(id: string) {
    const res = await fetch(`/api/loads/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete load: ${res.statusText}`);
    return res.json();
  },

  // === BIDS API ===
  async getBids(params?: { load_id?: string; driver_phone?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') query.append(key, String(val));
      });
    }
    const res = await fetch(`/api/bids?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch bids: ${res.statusText}`);
    return res.json();
  },

  async createBid(bidData: any) {
    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bidData),
    });
    if (!res.ok) throw new Error(`Failed to submit bid: ${res.statusText}`);
    return res.json();
  },

  async updateBid(id: string, updateData: { status?: string; shipperCounterPrice?: number; shipperCounterNote?: string }) {
    const res = await fetch(`/api/bids/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(`Failed to update bid: ${res.statusText}`);
    return res.json();
  },

  // === FLEET API ===
  async getFleetTrucks(params?: { status?: string; city?: string }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') query.append(key, String(val));
      });
    }
    const res = await fetch(`/api/fleet?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch fleet: ${res.statusText}`);
    return res.json();
  },

  // === RADAR API ===
  async getDriverRadar(params?: { city?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') query.append(key, String(val));
      });
    }
    const res = await fetch(`/api/radar?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch driver radar: ${res.statusText}`);
    return res.json();
  },

  // === FINANCE API ===
  async getFinanceSummary(status?: string) {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    const res = await fetch(`/api/finance?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch finance summary: ${res.statusText}`);
    return res.json();
  },

  // === DB HEALTH & BENCHMARKS ===
  async getDbHealth() {
    const res = await fetch('/api/db/health', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch DB health: ${res.statusText}`);
    return res.json();
  },
};
