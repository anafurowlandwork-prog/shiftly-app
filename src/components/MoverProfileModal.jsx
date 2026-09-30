import React from 'react';
import { X, Star, ShieldCheck, Award, Truck, CheckCircle2, MessageSquare, Phone } from 'lucide-react';

export default function MoverProfileModal({ driver, onClose, onOpenChat, onOpenCall }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShieldCheck size={18} color="#0052ff" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                Verified Mover Profile
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Shiftly Certified Pro Driver & Crew
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ background: '#f4f4f5' }}>
            <X size={18} />
          </button>
        </div>

        {/* Driver Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <img
              src={driver.photo}
              alt={driver.name}
              style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #09090b' }}
            />
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#0052ff', color: '#ffffff', padding: '4px', borderRadius: '50%', display: 'flex' }}>
              <ShieldCheck size={14} />
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#09090b', margin: '0 0 4px 0' }}>
            {driver.name}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#0052ff" color="#0052ff" /> {driver.rating}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>• {driver.trips}</span>
            <span style={{ color: '#71717a', fontSize: '0.8rem' }}>• {driver.vehiclePlate || 'MA 7XF-992'}</span>
          </div>
        </div>

        {/* Verification Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 6px', borderRadius: '12px', textAlign: 'center' }}>
            <ShieldCheck size={18} color="#0052ff" style={{ margin: '0 auto 4px auto' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#09090b', display: 'block' }}>Background Verified</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 6px', borderRadius: '12px', textAlign: 'center' }}>
            <Award size={18} color="#0052ff" style={{ margin: '0 auto 4px auto' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#09090b', display: 'block' }}>Top Rated Crew</span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 6px', borderRadius: '12px', textAlign: 'center' }}>
            <Truck size={18} color="#0052ff" style={{ margin: '0 auto 4px auto' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#09090b', display: 'block' }}>100% Inspected Fleet</span>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, color: '#09090b', marginBottom: '10px' }}>
            Verified Customer Reviews
          </h4>

          {[
            { name: 'Sarah L.', rating: '5.0 ★', date: '2 days ago', text: 'Marcus and his crew arrived right on time! Handled our glass dining table and couch with zero scratches.' },
            { name: 'Michael K.', rating: '5.0 ★', date: 'Last week', text: 'Super professional, friendly, and fast. The live GPS tracking made coordination effortless.' },
            { name: 'Elena R.', rating: '5.0 ★', date: '2 weeks ago', text: 'Shiftly is amazing! Marcus wrapped all fragile items in heavy duty protective blankets.' },
          ].map((rev, idx) => (
            <div key={idx} style={{ background: '#fafafa', border: '1px solid #f4f4f5', padding: '10px 12px', borderRadius: '12px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                <strong style={{ fontSize: '0.82rem', color: '#09090b' }}>{rev.name}</strong>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0052ff' }}>{rev.rating}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#52525b', lineHeight: 1.4, margin: 0 }}>{rev.text}</p>
            </div>
          ))}
        </div>

        <button className="btn-black" onClick={onClose}>
          Close Profile
        </button>

      </div>
    </div>
  );
}
