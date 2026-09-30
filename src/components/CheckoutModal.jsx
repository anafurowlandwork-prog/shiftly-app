import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, CheckCircle2, Lock, Smartphone, 
  X, ChevronRight, Sparkles, ArrowRight, DollarSign 
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';

export default function CheckoutModal({ 
  bookingSummary, 
  onPaymentSuccess, 
  onClose 
}) {
  const [selectedMethod, setSelectedMethod] = useState('applepay'); // 'applepay', 'card', 'googlepay'
  const [tipAmount, setTipAmount] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showFaceID, setShowFaceID] = useState(false);

  const baseFare = bookingSummary?.totalPrice || 145;
  const finalTotal = (Number(baseFare) + Number(tipAmount)).toFixed(2);

  const handlePay = () => {
    setIsProcessing(true);
    if (selectedMethod === 'applepay') {
      setShowFaceID(true);
    }

    setTimeout(() => {
      setShowFaceID(false);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess({
            ...bookingSummary,
            totalPrice: finalTotal,
            tip: tipAmount,
            paymentMethod: selectedMethod === 'applepay' ? 'Apple Pay' : selectedMethod === 'googlepay' ? 'Google Pay' : 'Visa •••• 4242',
            paymentStatus: 'PAID'
          });
        }
      }, 1200);
    }, 1800);
  };

  return (
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div 
        className="checkout-sheet"
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#ffffff',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px',
          padding: '24px 20px 32px 20px',
          boxSizing: 'border-box',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div style={{ width: '40px', height: '4px', background: '#e4e4e7', borderRadius: '2px', margin: '0 auto 16px auto' }}></div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShiftlyLogo size={24} variant="icon-only" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
              Shiftly Pay
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f4f4f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={16} color="#71717a" />
          </button>
        </div>

        {/* Biometric Face ID Simulator View */}
        {showFaceID ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              border: '2px solid #0052ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              animation: 'pulse 1s infinite alternate'
            }}>
              <Smartphone size={40} color="#0052ff" />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09090b', margin: '0 0 6px 0' }}>
              Confirming with Face ID...
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#71717a', margin: 0 }}>
              Hold side button or glance at your screen
            </p>
          </div>
        ) : isSuccess ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={44} />
            </div>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#09090b', margin: '0 0 6px 0' }}>
              Payment Authorized!
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#71717a', margin: 0 }}>
              Dispatching nearest Shiftly truck now...
            </p>
          </div>
        ) : (
          <div>
            {/* Amount Summary */}
            <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '16px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Move Fare ({bookingSummary?.vehicleTier?.name || 'Standard Truck'})</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#09090b' }}>${Number(baseFare).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Driver Crew Tip</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0052ff' }}>+${Number(tipAmount).toFixed(2)}</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Total Authorized</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', letterSpacing: '-0.02em' }}>
                  ${finalTotal}
                </span>
              </div>
            </div>

            {/* Tip Selection */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Add Driver Crew Tip
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[10, 20, 30, 0].map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => setTipAmount(tip)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '12px',
                      border: tipAmount === tip ? '2px solid #0052ff' : '1px solid #e2e8f0',
                      background: tipAmount === tip ? 'rgba(0, 82, 255, 0.08)' : '#ffffff',
                      color: tipAmount === tip ? '#0052ff' : '#09090b',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {tip === 0 ? 'None' : `$${tip}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Payment Method
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Apple Pay */}
                <div 
                  onClick={() => setSelectedMethod('applepay')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: selectedMethod === 'applepay' ? '2px solid #0052ff' : '1px solid #e2e8f0',
                    background: selectedMethod === 'applepay' ? 'rgba(0, 82, 255, 0.04)' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '24px', background: '#000000', color: '#ffffff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                      Pay
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09090b', display: 'block' }}>Apple Pay</span>
                      <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Default Card (•••• 4242)</span>
                    </div>
                  </div>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selectedMethod === 'applepay' ? '5px solid #0052ff' : '2px solid #d4d4d8' }}></div>
                </div>

                {/* Credit Card */}
                <div 
                  onClick={() => setSelectedMethod('card')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: selectedMethod === 'card' ? '2px solid #0052ff' : '1px solid #e2e8f0',
                    background: selectedMethod === 'card' ? 'rgba(0, 82, 255, 0.04)' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '24px', background: '#1e293b', color: '#ffffff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CreditCard size={14} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#09090b', display: 'block' }}>Visa Sapphire</span>
                      <span style={{ fontSize: '0.75rem', color: '#71717a' }}>•••• 8819 • Exp 08/29</span>
                    </div>
                  </div>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selectedMethod === 'card' ? '5px solid #0052ff' : '2px solid #d4d4d8' }}></div>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                background: selectedMethod === 'applepay' ? '#000000' : '#0052ff',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: selectedMethod === 'applepay' ? '0 8px 20px rgba(0,0,0,0.2)' : '0 8px 24px rgba(0,82,255,0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              {isProcessing ? (
                <span>Authorizing...</span>
              ) : selectedMethod === 'applepay' ? (
                <> Pay ${finalTotal}</>
              ) : (
                <>Pay ${finalTotal} <ArrowRight size={18} /></>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
              <Lock size={12} color="#64748b" />
              <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>256-bit Encrypted Shiftly Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
