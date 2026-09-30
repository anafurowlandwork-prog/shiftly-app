import React from 'react';
import { ShieldCheck, X, Lock, CheckCircle2, Globe, Eye } from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';

export default function PrivacyPolicyModal({ onClose }) {
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
              Privacy Policy
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
            <strong>Last Updated: September 2026</strong>
          </p>
          <p style={{ marginBottom: '12px' }}>
            At <strong>Shiftly</strong> ("we", "our", or "us"), we are committed to protecting your personal information and your right to privacy in compliance with Apple App Store, Google Play, GDPR, and CCPA standards.
          </p>

          <h4 style={{ color: '#09090b', fontWeight: 800, margin: '14px 0 6px 0', fontSize: '0.95rem' }}>
            1. Information We Collect
          </h4>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li><strong>Location Data:</strong> Real-time precise GPS coordinates to calculate route distances, match nearby movers, and provide live cargo tracking.</li>
            <li><strong>Account Information:</strong> Phone number, email address, and name for authentication and dispatch communications.</li>
            <li><strong>Payment Information:</strong> Tokenized payment credentials securely processed via Stripe (Apple Pay, Google Pay, Credit Cards). Shiftly never stores raw card details.</li>
            <li><strong>Camera / Photos:</strong> Optional access when using the Shiftly Vision AI™ inventory scanner or damage inspection.</li>
          </ul>

          <h4 style={{ color: '#09090b', fontWeight: 800, margin: '14px 0 6px 0', fontSize: '0.95rem' }}>
            2. How We Use Your Data
          </h4>
          <p style={{ marginBottom: '12px' }}>
            Your data is strictly used to fulfill moving and logistics services, enable live 2-way mover chat, facilitate secure payment payouts, and improve route accuracy. We never sell your personal data to third-party brokers.
          </p>

          <h4 style={{ color: '#09090b', fontWeight: 800, margin: '14px 0 6px 0', fontSize: '0.95rem' }}>
            3. Data Security & Retention
          </h4>
          <p style={{ marginBottom: '16px' }}>
            All communications are encrypted in transit via TLS 1.3 and at rest with AES-256 encryption. Users may request complete data deletion at any time by contacting privacy@shiftly.com.
          </p>

          <button
            onClick={onClose}
            className="btn-black"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
