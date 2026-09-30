import React, { useState } from 'react';
import { 
  DollarSign, ArrowUpRight, CheckCircle2, ShieldCheck, 
  CreditCard, Sparkles, X, Clock, Landmark, AlertCircle 
} from 'lucide-react';
import { executeDriverInstantPayout } from '../services/stripeService';
import { triggerHaptic } from '../utils/nativeBridge';

export default function DriverEarningsModal({ onClose }) {
  const [balance, setBalance] = useState(384.50);
  const [tipsEarned, setTipsEarned] = useState(65.00);
  const [completedTrips, setCompletedTrips] = useState(4);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [payoutSuccessDetails, setPayoutSuccessDetails] = useState(null);

  const handleInstantPayout = async () => {
    if (balance <= 0) return;
    triggerHaptic('medium');
    setIsProcessingPayout(true);

    try {
      const result = await executeDriverInstantPayout({
        amount: balance
      });
      setIsProcessingPayout(false);
      setPayoutSuccessDetails(result);
      setBalance(0);
      triggerHaptic('success');
    } catch (err) {
      setIsProcessingPayout(false);
    }
  };

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
        className="earnings-sheet"
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#09090b',
          color: '#ffffff',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '24px 20px 36px 20px',
          boxSizing: 'border-box',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid #27272a',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle */}
        <div style={{ width: '40px', height: '4px', background: '#27272a', borderRadius: '2px', margin: '0 auto 16px auto' }}></div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#0052ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                Driver Wallet & Payouts
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Powered by Stripe Connect Express</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#18181b', border: '1px solid #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a1a1aa' }}
          >
            <X size={16} />
          </button>
        </div>

        {payoutSuccessDetails ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <CheckCircle2 size={36} color="#22c55e" />
            </div>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              ${payoutSuccessDetails.amount.toFixed(2)} Deposited!
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: '0 0 20px 0' }}>
              Sent instantly to {payoutSuccessDetails.destinationAccount}. Funds available in 1–2 minutes.
            </p>
            <button
              onClick={() => setPayoutSuccessDetails(null)}
              style={{
                width: '100%',
                background: '#18181b',
                color: '#ffffff',
                border: '1px solid #27272a',
                padding: '12px',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Back to Wallet
            </button>
          </div>
        ) : (
          <div>
            {/* Balance Card */}
            <div style={{
              background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
              borderRadius: '20px',
              padding: '20px',
              border: '1px solid #27272a',
              marginBottom: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0052ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AVAILABLE PAYOUT BALANCE
              </span>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#ffffff', margin: '4px 0 12px 0' }}>
                ${balance.toFixed(2)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#09090b', padding: '10px 14px', borderRadius: '12px', border: '1px solid #1e1e24' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#71717a' }}>Tips (100% Yours)</span>
                  <strong style={{ fontSize: '0.9rem', color: '#22c55e', display: 'block' }}>+${tipsEarned.toFixed(2)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#71717a' }}>Moves Completed</span>
                  <strong style={{ fontSize: '0.9rem', color: '#ffffff', display: 'block' }}>{completedTrips} moves today</strong>
                </div>
              </div>
            </div>

            {/* Destination Account */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#18181b',
              padding: '12px 16px',
              borderRadius: '16px',
              border: '1px solid #27272a',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Landmark size={18} color="#0052ff" />
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block' }}>Chase Debit •••• 4192</span>
                  <span style={{ fontSize: '0.72rem', color: '#71717a' }}>Instant Payout Enabled (1.5% fee waived)</span>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>VERIFIED</span>
            </div>

            {/* Instant Payout Button */}
            <button
              onClick={handleInstantPayout}
              disabled={isProcessingPayout || balance <= 0}
              style={{
                width: '100%',
                background: balance > 0 ? '#0052ff' : '#27272a',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: balance > 0 ? 'pointer' : 'default',
                boxShadow: balance > 0 ? '0 8px 24px rgba(0, 82, 255, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isProcessingPayout ? (
                <span>Depositing Funds via Stripe...</span>
              ) : (
                <>
                  <span>Instant Transfer ${balance.toFixed(2)}</span>
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
