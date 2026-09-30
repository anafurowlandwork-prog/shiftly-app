import React from 'react';
import { FileText, X, CheckCircle2, ShieldCheck, Scale } from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';

export default function TermsOfServiceModal({ onClose }) {
  return (
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '85vh',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShiftlyLogo size={24} variant="icon-only" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#09090b' }}>
              Terms of Service
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f4f4f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} color="#71717a" />
          </button>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#52525b', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>Effective Date: September 2026</strong>
          </p>
          <p style={{ marginBottom: '12px' }}>
            Welcome to <strong>Shiftly</strong>. By accessing or using the Shiftly mobile application, platform, and services, you agree to be bound by these terms.
          </p>

          <h4 style={{ color: '#09090b', fontWeight: 800, margin: '14px 0 6px 0', fontSize: '0.95rem' }}>
            1. Services Provided
          </h4>
          <p style={{ marginBottom: '12px' }}>
            Shiftly is an on-demand logistics platform connecting individuals and businesses with certified mover driver partners and commercial fleets for intra-city and interstate relocations.
          </p>

          <h4 style={{ color: '#09090b', fontWeight: 800, margin: '14px 0 6px 0', fontSize: '0.95rem' }}>
            2. Transparent Pricing & Payments
          </h4>
          <p style={{ marginBottom: '12px' }}>
            All fares are calculated upfront based on vehicle category, estimated mileage, labor helpers, and access stairs. Payments are processed securely via Stripe. 100% of voluntary tips are distributed directly to the mover crew.
          </p>

          <h4 style={{ color: '#09090b', fontWeight: 800, margin: '14px 0 6px 0', fontSize: '0.95rem' }}>
            3. Cargo Protection & Insurance
          </h4>
          <p style={{ marginBottom: '12px' }}>
            Standard liability coverage is included on all booked moves. Additional Zero-Deductible Fragile Cargo Protection is available at checkout for delicate art, electronics, and specialty furniture.
          </p>

          <h4 style={{ color: '#09090b', fontWeight: 800, margin: '14px 0 6px 0', fontSize: '0.95rem' }}>
            4. Cancellation Policy
          </h4>
          <p style={{ marginBottom: '16px' }}>
            Moves may be cancelled free of charge up to 60 minutes prior to the scheduled dispatch window. Cancellations after a driver is en route may incur a standard dispatch cancellation fee.
          </p>

          <button
            onClick={onClose}
            className="btn-black"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
          >
            Accept Terms & Close
          </button>
        </div>
      </div>
    </div>
  );
}
