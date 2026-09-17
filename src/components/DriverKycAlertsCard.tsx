'use client';

import React, { useState, useEffect } from 'react';
import { getDriverVehicleDocs, saveDriverVehicleDocs, DriverVehicleDocs } from '@/lib/vehicleDocs';

interface DriverKycAlertsCardProps {
  onUpdate?: () => void;
}

export default function DriverKycAlertsCard({ onUpdate }: DriverKycAlertsCardProps) {
  const [docs, setDocs] = useState<DriverVehicleDocs>(getDriverVehicleDocs());
  const [showTokenTaxModal, setShowTokenTaxModal] = useState(false);
  const [showFitnessModal, setShowFitnessModal] = useState(false);

  // Form inputs
  const [tokenTaxExpiry, setTokenTaxExpiry] = useState('2027-06-30');
  const [tokenTaxFileName, setTokenTaxFileName] = useState('Latest_TokenTax_Paid_Receipt_2026.pdf');
  
  const [fitnessExpiry, setFitnessExpiry] = useState('2027-06-30');
  const [fitnessFileName, setFitnessFileName] = useState('Latest_Vehicle_Fitness_Certificate_2026.pdf');

  useEffect(() => {
    const loadDocs = () => {
      const current = getDriverVehicleDocs();
      setDocs(current);
    };

    loadDocs();

    if (typeof window !== 'undefined') {
      window.addEventListener('safarload_vehicledocs_change', loadDocs);
      return () => window.removeEventListener('safarload_vehicledocs_change', loadDocs);
    }
  }, []);

  const handleUploadTokenTax = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DriverVehicleDocs = {
      ...docs,
      tokenTaxStatus: 'paid',
      tokenTaxExpiryDate: tokenTaxExpiry,
      tokenTaxReceiptUrl: tokenTaxFileName,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    saveDriverVehicleDocs(updated);
    setDocs(updated);
    setShowTokenTaxModal(false);
    if (onUpdate) onUpdate();
    alert(`✅ Token Tax Payment Receipt uploaded successfully! Status updated to PAID (Valid till ${tokenTaxExpiry}). NHMP Inspection records updated.`);
  };

  const handleUploadFitnessCert = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DriverVehicleDocs = {
      ...docs,
      fitnessCertStatus: 'passed',
      fitnessCertExpiryDate: fitnessExpiry,
      fitnessCertUrl: fitnessFileName,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    saveDriverVehicleDocs(updated);
    setDocs(updated);
    setShowFitnessModal(false);
    if (onUpdate) onUpdate();
    alert(`✅ Latest Fitness Certificate uploaded successfully! Status updated to PASSED & VALID (Valid till ${fitnessExpiry}). NHMP Inspection records updated.`);
  };

  const hasTokenTaxAlert = docs.tokenTaxStatus === 'due' || docs.tokenTaxStatus === 'expired';
  const hasFitnessAlert = docs.fitnessCertStatus === 'due_renewal' || docs.fitnessCertStatus === 'expired';

  if (!hasTokenTaxAlert && !hasFitnessAlert) {
    return (
      <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10B981', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#10B981', fontSize: '0.95rem' }}>
            ✅ Vehicle Compliance Status: 100% Valid & Verified
          </div>
          <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginTop: '2px' }}>
            Truck <strong>{docs.truckNumber}</strong> | CNIC: <strong>{docs.cnicNumber}</strong> | Token Tax: <strong>PAID ({docs.tokenTaxExpiryDate})</strong> | Fitness: <strong>PASSED ({docs.fitnessCertExpiryDate})</strong>
          </div>
        </div>
        <span className="badge badge-success">NHMP Verified 🇵🇰</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
      {/* TOKEN TAX ALERT */}
      {hasTokenTaxAlert && (
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', borderRadius: '14px', padding: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ fontWeight: 700, color: '#F59E0B', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>⚠️</span> <span>Vehicle Token Tax Due Alert (ٹکن ٹیکس ادا کریں)</span>
            </div>
            <div style={{ fontSize: '0.83rem', color: '#F1F5F9', marginTop: '3px', lineHeight: 1.4 }}>
              Token Tax for Truck <strong>{docs.truckNumber}</strong> is due / expiring on <strong>{docs.tokenTaxExpiryDate}</strong>. Please upload your latest payment receipt to maintain full dispatch rights.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowTokenTaxModal(true)}
            className="btn btn-warning btn-sm"
            style={{ fontWeight: 700 }}
          >
            💳 Upload Latest Token Tax Receipt
          </button>
        </div>
      )}

      {/* VEHICLE FITNESS CERTIFICATE ALERT */}
      {hasFitnessAlert && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '14px', padding: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ fontWeight: 700, color: '#EF4444', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🚨</span> <span>Vehicle Fitness Certificate Expiry Notice (روٹ و فِٹنس سرٹیفکیٹ)</span>
            </div>
            <div style={{ fontSize: '0.83rem', color: '#F1F5F9', marginTop: '3px', lineHeight: 1.4 }}>
              Fitness Certificate for Truck <strong>{docs.truckNumber}</strong> expires on <strong>{docs.fitnessCertExpiryDate}</strong>. Please submit your latest Motor Vehicle Fitness Certificate.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFitnessModal(true)}
            className="btn btn-accent btn-sm"
            style={{ fontWeight: 700, background: '#EF4444', borderColor: '#EF4444', color: '#FFF' }}
          >
            📋 Upload Latest Fitness Certificate
          </button>
        </div>
      )}

      {/* UPLOAD TOKEN TAX RECEIPT MODAL */}
      {showTokenTaxModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-scaleIn" style={{ width: '100%', maxWidth: '520px', padding: '1.5rem', borderRadius: '16px', border: '2px solid #F59E0B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#F59E0B' }}>💳 Upload Token Tax Payment Receipt</h3>
              <button onClick={() => setShowTokenTaxModal(false)} className="btn btn-glass btn-sm">✕</button>
            </div>

            <form onSubmit={handleUploadTokenTax} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#1E293B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div>Vehicle Plate: <strong>{docs.truckNumber}</strong></div>
                <div>Current Status: <strong style={{ color: '#F59E0B' }}>{docs.tokenTaxStatus.toUpperCase()} (Expires: {docs.tokenTaxExpiryDate})</strong></div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>
                  📅 New Token Tax Expiry Date (تاریخِ اختتام):
                </label>
                <input
                  type="date"
                  value={tokenTaxExpiry}
                  onChange={(e) => setTokenTaxExpiry(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>
                  📄 Upload Paid Bank / Excise Receipt Photo or PDF:
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTokenTaxFileName(e.target.files[0].name);
                    }
                  }}
                  className="input"
                />
                <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px' }}>
                  Selected File: <strong>{tokenTaxFileName}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowTokenTaxModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#F59E0B', borderColor: '#F59E0B', color: '#000', fontWeight: 800 }}>
                  ✅ Save Receipt & Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD FITNESS CERTIFICATE MODAL */}
      {showFitnessModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card animate-scaleIn" style={{ width: '100%', maxWidth: '520px', padding: '1.5rem', borderRadius: '16px', border: '2px solid #EF4444' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#EF4444' }}>📋 Upload Vehicle Fitness Certificate</h3>
              <button onClick={() => setShowFitnessModal(false)} className="btn btn-glass btn-sm">✕</button>
            </div>

            <form onSubmit={handleUploadFitnessCert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#1E293B', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div>Vehicle Plate: <strong>{docs.truckNumber}</strong></div>
                <div>Current Status: <strong style={{ color: '#EF4444' }}>{docs.fitnessCertStatus.toUpperCase()} (Expires: {docs.fitnessCertExpiryDate})</strong></div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>
                  📅 Fitness Certificate Validity / Expiry Date (تاریخِ اختتام):
                </label>
                <input
                  type="date"
                  value={fitnessExpiry}
                  onChange={(e) => setFitnessExpiry(e.target.value)}
                  className="input"
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: '4px' }}>
                  📄 Upload Transport Authority Fitness Certificate (Photo/PDF):
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFitnessFileName(e.target.files[0].name);
                    }
                  }}
                  className="input"
                />
                <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px' }}>
                  Selected File: <strong>{fitnessFileName}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowFitnessModal(false)} className="btn btn-glass">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#EF4444', borderColor: '#EF4444', color: '#FFF', fontWeight: 800 }}>
                  ✅ Submit Fitness Cert & Update NHMP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
