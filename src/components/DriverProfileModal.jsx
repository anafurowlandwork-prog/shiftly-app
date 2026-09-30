import React, { useState } from 'react';
import { 
  ShieldCheck, Star, Truck, Award, CheckCircle2, Phone, Mail, 
  MapPin, Camera, Edit2, X, DollarSign, Lock, AlertCircle, 
  ChevronRight, ExternalLink, RefreshCw 
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';

export default function DriverProfileModal({ onClose }) {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [driverBio, setDriverBio] = useState(
    'Professional logistics specialist with 6+ years experience in residential and commercial relocations. Expert in fragile antique handling, piano transport, and white-glove assembly.'
  );
  const [isCashingOut, setIsCashingOut] = useState(false);
  const [cashoutSuccess, setCashoutSuccess] = useState(false);

  const handleCashout = () => {
    setIsCashingOut(true);
    setTimeout(() => {
      setIsCashingOut(false);
      setCashoutSuccess(true);
      setTimeout(() => setCashoutSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="driver-profile-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px 20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          animation: 'fadeIn 0.2s ease',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#f4f4f5',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={16} color="#71717a" />
        </button>

        {/* Profile Avatar & Primary Badges */}
        <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
          <div style={{ position: 'relative', width: '92px', height: '92px', margin: '0 auto 12px auto' }}>
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80" 
              alt="Marcus Vance"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #0052ff',
                boxShadow: '0 8px 20px rgba(0, 82, 255, 0.25)'
              }}
            />
            <div 
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#09090b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff',
                cursor: 'pointer'
              }}
              title="Change Profile Photo"
            >
              <Camera size={13} />
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 900, color: '#09090b', margin: '0 0 4px 0' }}>
            Marcus Vance
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '20px',
              background: 'rgba(0, 82, 255, 0.1)',
              color: '#0052ff',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              <ShieldCheck size={13} /> Verified Pro
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Star size={14} fill="#0052ff" color="#0052ff" /> 4.98 <span style={{ color: '#71717a', fontWeight: 500 }}>(482 moves)</span>
            </span>
          </div>

          {/* Bio Box */}
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'left', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Driver Bio</span>
              <button 
                onClick={() => setIsEditingBio(!isEditingBio)}
                style={{ background: 'transparent', border: 'none', color: '#0052ff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                <Edit2 size={11} /> {isEditingBio ? 'Save' : 'Edit'}
              </button>
            </div>
            {isEditingBio ? (
              <textarea 
                value={driverBio} 
                onChange={(e) => setDriverBio(e.target.value)}
                style={{ width: '100%', borderRadius: '8px', border: '1px solid #0052ff', padding: '8px', fontSize: '0.8rem', fontFamily: 'inherit' }}
                rows={3}
              />
            ) : (
              <p style={{ fontSize: '0.8rem', color: '#334155', margin: 0, lineHeight: 1.4 }}>
                "{driverBio}"
              </p>
            )}
          </div>
        </div>

        {/* Section 1: Vehicle & Equipment Specs */}
        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Truck size={14} color="#0052ff" /> Assigned Vehicle & Equipment
          </h4>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#09090b', display: 'block' }}>2024 Freightliner M2 Box Truck</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>License Plate: <strong style={{ color: '#09090b' }}>MA 7XF-992</strong></span>
              </div>
              <span style={{ padding: '4px 8px', borderRadius: '8px', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: '#09090b' }}>
                26 Foot
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                ⚡ Hydraulic Liftgate: <strong style={{ color: '#22c55e' }}>YES</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                📦 Payload: <strong>10,000 lbs</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                🛡️ Cargo Insurance: <strong style={{ color: '#22c55e' }}>$100k Active</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                🧰 Dollies & Straps: <strong>16 Units</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal & Contact Information */}
        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Personal Information
          </h4>
          <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Phone Number</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b' }}>+1 (555) 392-8190</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Email</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b' }}>marcus.vance@shiftly.io</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Home Hub</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b' }}>Boston Metro & New England</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Background Check</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#22c55e', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <CheckCircle2 size={12} /> CLEARED (Sep 2026)
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Performance Badges */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} color="#0052ff" /> Driver Badges & Compliments
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <div style={{ padding: '8px 10px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#09090b', display: 'block' }}>Speed Master</strong>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>99.4% On Time</span>
              </div>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>💎</span>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#09090b', display: 'block' }}>Fragile Care</strong>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>0 Damage Claims</span>
              </div>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🤝</span>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#09090b', display: 'block' }}>Top Friendly</strong>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>210+ 5-Star Reviews</span>
              </div>
            </div>

            <div style={{ padding: '8px 10px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🏋️</span>
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#09090b', display: 'block' }}>Heavy Hauler</strong>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Piano & Safe Expert</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Instant Payout Account */}
        <div style={{ background: '#09090b', color: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instant Payout Vault</span>
            <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 800 }}>Chase •••• 8910</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#71717a', display: 'block' }}>Available Balance</span>
              <strong style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>$248.50</strong>
            </div>

            <button
              onClick={handleCashout}
              disabled={isCashingOut}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                border: 'none',
                background: cashoutSuccess ? '#22c55e' : '#0052ff',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {isCashingOut ? 'Transferring...' : cashoutSuccess ? '✓ Transferred!' : 'Instant Cash Out'}
            </button>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#71717a', display: 'block' }}>
            Deposits directly into your linked debit card in ~30 seconds via Stripe Direct.
          </span>
        </div>

      </div>
    </div>
  );
}
