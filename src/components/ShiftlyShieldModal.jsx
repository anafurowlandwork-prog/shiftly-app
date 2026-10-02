import React from 'react';
import { 
  ShieldCheck, CheckCircle2, X, Lock, Award, 
  HelpCircle, FileText, Zap, ChevronRight, Check 
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';
import { formatCurrencyPrice, SHIELD_TIERS } from '../utils/currencyUtils';

export { SHIELD_TIERS };


export default function ShiftlyShieldModal({ 
  selectedTier = 'COMPREHENSIVE', 
  onSelectTier, 
  onClose,
  countryCode = '+44' 
}) {
  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        className="shield-sheet"
        style={{
          width: '100%',
          maxWidth: '430px',
          maxHeight: '92vh',
          background: '#ffffff',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '20px 20px 32px 20px',
          boxSizing: 'border-box',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div style={{ width: '40px', height: '4px', background: '#e4e4e7', borderRadius: '2px', margin: '0 auto 14px auto' }}></div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0052ff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
                Shiftly Shield™
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 800 }}>
                ✓ Guaranteed Cargo Protection & Zero Deductibles
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

        {/* Guarantee Banner */}
        <div style={{ background: 'linear-gradient(135deg, #09090b 0%, #1e293b 100%)', color: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '18px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.1 }}>
            <ShieldCheck size={110} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <Zap size={15} color="#60a5fa" />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PEACE OF MIND ON EVERY MOVE
            </span>
          </div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px 0', lineHeight: 1.3 }}>
            Your belongings are fully insured from pickup to doorstep placement.
          </h4>
          <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: 0 }}>
            Underwritten by certified logistics insurance partners. Fast photo-based claim filing.
          </p>
        </div>

        {/* Protection Tiers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {Object.values(SHIELD_TIERS).map((tier) => {
            const isSelected = selectedTier === tier.id;
            const formattedPrice = tier.feeUsd === 0 ? 'FREE' : formatCurrencyPrice(tier.feeUsd, countryCode);
            const formattedLimit = formatCurrencyPrice(tier.coverageLimitUsd, countryCode, false);

            return (
              <div
                key={tier.id}
                onClick={() => {
                  if (onSelectTier) onSelectTier(tier.id);
                }}
                style={{
                  borderRadius: '16px',
                  border: isSelected ? '2px solid #0052ff' : '1.5px solid #e2e8f0',
                  background: isSelected ? 'rgba(0, 82, 255, 0.03)' : '#ffffff',
                  padding: '14px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                {tier.recommended && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '14px',
                    background: '#0052ff',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '2px 8px',
                    borderRadius: '100px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    ★ RECOMMENDED
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #0052ff' : '2px solid #cbd5e1',
                      background: '#ffffff',
                      flexShrink: 0
                    }}></div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b', margin: '0 0 2px 0' }}>
                        {tier.name}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                        Coverage up to {formattedLimit} • {tier.deductibleUsd === 0 ? '$0 Deductible' : '$250 Deductible'}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#09090b' }}>
                      {formattedPrice}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '6px' }}>
                  {tier.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Check size={12} color="#16a34a" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.75rem', color: '#334155', fontWeight: 500 }}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Claim Process Information */}
        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
          <h5 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#09090b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ⚡ How Claims Work in Shiftly
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
            <div>1. Snap photo of damaged item in the app right after delivery.</div>
            <div>2. Mover POD inspection photos automatically cross-referenced.</div>
            <div>3. Direct reimbursement or item repair deposited to your bank account within 24-48 hours.</div>
          </div>
        </div>

        {/* Select & Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '16px',
            border: 'none',
            background: '#09090b',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>Confirm Protection Tier</span> <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
