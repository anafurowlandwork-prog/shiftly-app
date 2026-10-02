import React from 'react';
import { 
  ShieldCheck, CheckCircle2, X, Download, Share2, 
  MapPin, Clock, Calendar, User, Camera, FileText, Check 
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';
import { triggerHaptic } from '../utils/nativeBridge';

export default function ProofOfDeliveryViewer({ podData, onClose }) {
  const data = podData || {
    podId: 'POD-2026-89421',
    formattedDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    driverName: 'Marcus Vance',
    driverPhone: '+44 7378 142815',
    driverBadge: 'Shiftly Master Mover (4.98 ★)',
    signerName: 'Sarah Jenkins',
    signatureUrl: null,
    conditionStatus: 'PRISTINE',
    driverNotes: 'All cargo placed safely in designated rooms. Zero transit damage observed.',
    dropoffAddress: 'King’s Road, Chelsea, London, SW3 4ND',
    totalItemsDelivered: 4,
    photos: [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
        label: 'Delivered Living Room Setup'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
        label: 'Bedroom Furniture Intact'
      }
    ]
  };

  const handleDownloadPdfCertificate = () => {
    triggerHaptic('medium');
    window.print();
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="pod-viewer-card"
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px 20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          position: 'relative',
          animation: 'fadeIn 0.2s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShiftlyLogo size={24} variant="icon-only" />
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 900, color: '#09090b', margin: 0 }}>
                Proof of Delivery
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 800 }}>
                ✓ OFFICIAL CERTIFIED RECORD
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f4f4f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} color="#71717a" />
          </button>
        </div>

        {/* Official Certificate Badge */}
        <div style={{ background: 'linear-gradient(135deg, #09090b 0%, #1e293b 100%)', color: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
            <ShieldCheck size={120} color="#ffffff" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                CERTIFICATE ID
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.5px' }}>
                {data.podId}
              </div>
            </div>
            <div style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', color: '#4ade80', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
              VERIFIED
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Delivered Date</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{data.formattedDate} ({data.formattedTime})</span>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block' }}>Condition</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4ade80' }}>
                {data.conditionStatus === 'PRISTINE' ? '✓ 100% Pristine' : data.conditionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Driver Info */}
        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
            <MapPin size={16} color="#0052ff" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Drop-off Address</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b', display: 'block' }}>{data.dropoffAddress}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Certified Lead Mover</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b', display: 'block' }}>{data.driverName}</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#0052ff', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
              Shiftly Crew
            </span>
          </div>
        </div>

        {/* Inspection Condition Photos */}
        {data.photos && data.photos.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
              Condition Photos ({data.photos.length})
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {data.photos.map((p, idx) => (
                <div key={idx} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', height: '110px', position: 'relative' }}>
                  <img src={p.url} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, insetInline: 0, background: 'rgba(0,0,0,0.7)', color: '#ffffff', padding: '3px 6px', fontSize: '0.65rem', fontWeight: 700 }}>
                    {p.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {data.driverNotes && (
          <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
              Handover Inspection Notes
            </span>
            <p style={{ fontSize: '0.8rem', color: '#09090b', margin: 0, fontStyle: 'italic' }}>
              "{data.driverNotes}"
            </p>
          </div>
        )}

        {/* Customer Signature Stamp */}
        <div style={{ border: '1.5px solid #0052ff', background: 'rgba(0, 82, 255, 0.02)', borderRadius: '14px', padding: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0052ff', textTransform: 'uppercase' }}>
              Signed on Glass by Recipient
            </span>
            <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800 }}>
              ✓ Legal Sign-off Verified
            </span>
          </div>

          <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '6px' }}>
            {data.signatureUrl ? (
              <img src={data.signatureUrl} alt="Customer Signature" style={{ maxHeight: '60px', maxWidth: '100%' }} />
            ) : (
              <span style={{ fontFamily: 'cursive', fontSize: '1.4rem', color: '#09090b' }}>
                {data.signerName}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Signer: <strong>{data.signerName}</strong></span>
            <span>{data.formattedTime}</span>
          </div>
        </div>

        {/* Print / Save Action */}
        <button
          onClick={handleDownloadPdfCertificate}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '14px',
            border: 'none',
            background: '#09090b',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Download size={16} /> Print / Save POD Certificate
        </button>
      </div>
    </div>
  );
}
