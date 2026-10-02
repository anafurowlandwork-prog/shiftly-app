import React, { useState } from 'react';
import { 
  CreditCard, ShieldCheck, CheckCircle2, Lock, Smartphone, 
  X, ChevronRight, Sparkles, ArrowRight, DollarSign, Calendar, Download, ExternalLink
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';
import { 
  formatCurrencyPrice, 
  getCurrencyForCountryCode, 
  generateGoogleCalendarUrl, 
  generateIcsCalendarFile 
} from '../utils/currencyUtils';

export default function CheckoutModal({ 
  bookingSummary, 
  onPaymentSuccess, 
  onClose 
}) {
  const userCountryCode = bookingSummary?.countryCode || (typeof window !== 'undefined' ? localStorage.getItem('shiftly_user_country_code') : null) || '+44';
  const currencyConfig = getCurrencyForCountryCode(userCountryCode);

  const [selectedMethod, setSelectedMethod] = useState('applepay'); // 'applepay', 'googlepay', 'card', 'momo'
  const [selectedCardType, setSelectedCardType] = useState('visa'); // 'visa', 'mastercard', 'amex', 'discover'
  const [tipAmount, setTipAmount] = useState(15);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showFaceID, setShowFaceID] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const baseFareUsd = bookingSummary?.totalPrice || 145;
  const finalTotalUsd = Number(baseFareUsd) + Number(tipAmount);

  const formattedBaseFare = formatCurrencyPrice(baseFareUsd, userCountryCode);
  const formattedTip = formatCurrencyPrice(tipAmount, userCountryCode);
  const formattedTotal = formatCurrencyPrice(finalTotalUsd, userCountryCode);

  const handleDownloadIcs = () => {
    const icsContent = generateIcsCalendarFile({
      title: `Shiftly Move - ${bookingSummary?.vehicleTier?.name || 'Standard Truck'}`,
      description: `Shiftly on-demand mover booking. Pickup: ${bookingSummary?.pickupAddress || 'Origin'} -> Destination: ${bookingSummary?.dropoffAddress || 'Destination'}. Helpers: ${bookingSummary?.helpersCount || 2}`,
      location: bookingSummary?.pickupAddress || 'Origin Address',
      dateStr: bookingSummary?.moveDate || new Date().toISOString(),
      bookingId: bookingSummary?.bookingId || `SHFT-${Date.now().toString().slice(-4)}`
    });

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `shiftly-move-${Date.now().toString().slice(-4)}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setAddedToCalendar(true);
  };

  const handleOpenGoogleCalendar = () => {
    const moveDateObj = bookingSummary?.moveDate ? new Date(bookingSummary.moveDate) : new Date(Date.now() + 86400000);
    const endDateObj = new Date(moveDateObj.getTime() + 3 * 3600 * 1000); // +3 hours move window

    const url = generateGoogleCalendarUrl({
      title: `Shiftly Move - ${bookingSummary?.vehicleTier?.name || 'Standard Truck'}`,
      description: `Shiftly on-demand mover booking. Pickup: ${bookingSummary?.pickupAddress || 'Origin'} -> Destination: ${bookingSummary?.dropoffAddress || 'Destination'}. Helpers: ${bookingSummary?.helpersCount || 2}`,
      location: bookingSummary?.pickupAddress || 'Origin Address',
      startDate: moveDateObj.toISOString(),
      endDate: endDateObj.toISOString()
    });

    window.open(url, '_blank');
    setAddedToCalendar(true);
  };

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
            totalPrice: finalTotalUsd,
            formattedTotal: formattedTotal,
            countryCode: userCountryCode,
            tip: tipAmount,
            paymentMethod: selectedMethod === 'applepay' ? 'Apple Pay' : 
                           selectedMethod === 'googlepay' ? 'Google Pay' : 
                           selectedMethod === 'momo' ? 'Mobile Money (MoMo)' : 
                           `${selectedCardType.toUpperCase()} •••• 4242`,
            paymentStatus: 'PAID'
          });
        }
      }, 350);
    }, 450);
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
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto'
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
            <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#0052ff', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              {currencyConfig.currencyCode}
            </span>
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
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}>
              <CheckCircle2 size={40} />
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#09090b', margin: '0 0 6px 0' }}>
              Payment Authorized!
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#71717a', margin: '0 0 16px 0' }}>
              Dispatching nearest Shiftly crew now...
            </p>

            {/* Instant Calendar Sync Box */}
            <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '14px', marginBottom: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Calendar size={18} color="#0052ff" />
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>
                  Sync to your Calendar
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleOpenGoogleCalendar}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#09090b',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ExternalLink size={13} color="#ea4335" /> Google Cal
                </button>
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#09090b',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={13} color="#0052ff" /> Apple .ics
                </button>
              </div>
              {addedToCalendar && (
                <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, textAlign: 'center' }}>
                  ✓ Added to calendar reminder!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Amount Summary */}
            <div style={{ background: '#f8fafc', borderRadius: '18px', padding: '16px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Move Fare ({bookingSummary?.vehicleTier?.name || 'Standard Truck'})</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#09090b' }}>{formattedBaseFare}</span>
              </div>
              
              {/* Shiftly Shield line item */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: '#0052ff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> {bookingSummary?.shieldDetails?.name || 'Shiftly Shield™ Comprehensive'}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a' }}>
                  {bookingSummary?.shieldDetails?.feeUsd === 0 ? 'FREE (Included)' : 'Covered (Zero Deductible)'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Driver Crew Tip</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0052ff' }}>+{formattedTip}</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Total Authorized</span>
                <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#09090b', letterSpacing: '-0.02em' }}>
                  {formattedTotal}
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
                    {tip === 0 ? 'None' : formatCurrencyPrice(tip, userCountryCode, false)}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginBottom: '18px' }}>
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
                    padding: '10px 14px',
                    borderRadius: '14px',
                    border: selectedMethod === 'applepay' ? '2px solid #0052ff' : '1px solid #e2e8f0',
                    background: selectedMethod === 'applepay' ? 'rgba(0, 82, 255, 0.04)' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '26px', background: '#000000', color: '#ffffff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                      Pay
                    </div>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#09090b', display: 'block' }}>Apple Pay</span>
                      <span style={{ fontSize: '0.72rem', color: '#71717a' }}>Default Wallet (•••• 4242)</span>
                    </div>
                  </div>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selectedMethod === 'applepay' ? '5px solid #0052ff' : '2px solid #d4d4d8' }}></div>
                </div>

                {/* Google Pay */}
                <div 
                  onClick={() => setSelectedMethod('googlepay')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    border: selectedMethod === 'googlepay' ? '2px solid #0052ff' : '1px solid #e2e8f0',
                    background: selectedMethod === 'googlepay' ? 'rgba(0, 82, 255, 0.04)' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '26px', background: '#ffffff', border: '1px solid #e2e8f0', color: '#4285f4', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                      GPay
                    </div>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#09090b', display: 'block' }}>Google Pay</span>
                      <span style={{ fontSize: '0.72rem', color: '#71717a' }}>Instant Checkout</span>
                    </div>
                  </div>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selectedMethod === 'googlepay' ? '5px solid #0052ff' : '2px solid #d4d4d8' }}></div>
                </div>

                {/* Credit / Debit Card with Badges */}
                <div 
                  onClick={() => setSelectedMethod('card')}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    border: selectedMethod === 'card' ? '2px solid #0052ff' : '1px solid #e2e8f0',
                    background: selectedMethod === 'card' ? 'rgba(0, 82, 255, 0.04)' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '26px', background: '#1e293b', color: '#ffffff', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={15} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#09090b', display: 'block' }}>Credit / Debit Card</span>
                        <span style={{ fontSize: '0.72rem', color: '#71717a' }}>•••• 8819 • Exp 08/29</span>
                      </div>
                    </div>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selectedMethod === 'card' ? '5px solid #0052ff' : '2px solid #d4d4d8' }}></div>
                  </div>

                  {/* Card Badges */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                    {[
                      { id: 'visa', name: 'VISA', bg: '#1a1f71', color: '#ffffff' },
                      { id: 'mastercard', name: 'MC', bg: '#eb001b', color: '#ffffff' },
                      { id: 'amex', name: 'AMEX', bg: '#006fcf', color: '#ffffff' },
                      { id: 'discover', name: 'DISC', bg: '#ff6000', color: '#ffffff' }
                    ].map((badge) => (
                      <span
                        key={badge.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMethod('card');
                          setSelectedCardType(badge.id);
                        }}
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: badge.bg,
                          color: badge.color,
                          letterSpacing: '0.04em',
                          opacity: selectedCardType === badge.id ? 1 : 0.65,
                          border: selectedCardType === badge.id ? '1px solid #000' : 'none'
                        }}
                      >
                        {badge.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Mobile Money for African regions or alternative payment */}
                {['+233', '+234', '+254', '+27'].includes(userCountryCode) && (
                  <div 
                    onClick={() => setSelectedMethod('momo')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '14px',
                      border: selectedMethod === 'momo' ? '2px solid #0052ff' : '1px solid #e2e8f0',
                      background: selectedMethod === 'momo' ? 'rgba(0, 82, 255, 0.04)' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '26px', background: '#ffcc00', color: '#000000', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                        MoMo
                      </div>
                      <div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#09090b', display: 'block' }}>Mobile Money</span>
                        <span style={{ fontSize: '0.72rem', color: '#71717a' }}>MTN / Telecel / M-Pesa</span>
                      </div>
                    </div>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: selectedMethod === 'momo' ? '5px solid #0052ff' : '2px solid #d4d4d8' }}></div>
                  </div>
                )}
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
                <> Pay {formattedTotal}</>
              ) : selectedMethod === 'googlepay' ? (
                <>Pay {formattedTotal} with GPay</>
              ) : selectedMethod === 'momo' ? (
                <>Authorize MoMo {formattedTotal} <ArrowRight size={18} /></>
              ) : (
                <>Pay {formattedTotal} <ArrowRight size={18} /></>
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

