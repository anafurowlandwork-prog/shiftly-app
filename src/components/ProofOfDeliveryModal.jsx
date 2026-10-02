import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, CheckCircle2, ShieldCheck, X, RotateCcw, 
  MapPin, Clock, User, FileText, Image as ImageIcon, AlertCircle, ArrowRight, Sparkles 
} from 'lucide-react';
import { triggerHaptic } from '../utils/nativeBridge';

export default function ProofOfDeliveryModal({ activeJob, onCompleteDelivery, onClose }) {
  const [cargoPhotos, setCargoPhotos] = useState([
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      label: 'Delivered Living Room Setup',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
      label: 'Bedroom Furniture Intact',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [conditionStatus, setConditionStatus] = useState('PRISTINE'); // 'PRISTINE', 'MINOR_PREEXISTING', 'SPECIAL_HANDLING'
  const [driverNotes, setDriverNotes] = useState('All items placed securely in destination rooms. Zero transit damage.');
  const [signerName, setSignerName] = useState(activeJob?.customerName || 'Sarah Jenkins');
  const [hasSigned, setHasSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [podSuccess, setPodSuccess] = useState(false);

  // Digital Signature Canvas Refs
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);

  // Canvas drawing setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
    setHasSigned(true);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const handleClearSignature = () => {
    triggerHaptic('light');
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setSignatureDataUrl(null);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic('light');
      const reader = new FileReader();
      reader.onload = () => {
        setCargoPhotos((prev) => [
          ...prev,
          {
            id: Date.now(),
            url: reader.result,
            label: `Photo #${prev.length + 1} (On-Site)`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPod = () => {
    triggerHaptic('medium');
    setIsSubmitting(true);

    const podCertificate = {
      podId: `POD-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      driverName: 'Marcus Vance',
      driverPhone: '+44 7378 142815',
      driverBadge: 'Shiftly Certified Master Mover',
      signerName: signerName || 'Sarah Jenkins',
      signatureUrl: signatureDataUrl || canvasRef.current?.toDataURL('image/png') || null,
      conditionStatus: conditionStatus,
      driverNotes: driverNotes,
      photos: cargoPhotos,
      dropoffAddress: activeJob?.dropoff || 'King’s Road, Chelsea, London',
      totalItemsDelivered: activeJob?.items?.length || 4,
      payoutAmount: activeJob?.payout || 165.00
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setPodSuccess(true);
      triggerHaptic('success');

      setTimeout(() => {
        if (onCompleteDelivery) {
          onCompleteDelivery(podCertificate);
        }
      }, 1200);
    }, 1400);
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
        className="pod-modal-sheet"
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
        {/* Drag Handle */}
        <div style={{ width: '40px', height: '4px', background: '#e4e4e7', borderRadius: '2px', margin: '0 auto 14px auto' }}></div>

        {podSuccess ? (
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
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#09090b', margin: '0 0 6px 0' }}>
              Proof of Delivery Verified!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#71717a', margin: '0 0 16px 0' }}>
              Digital certificate generated and synced to customer receipt.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 800, color: '#0052ff' }}>
              <ShieldCheck size={16} /> Certified Shiftly POD Signed
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0052ff', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
                    Proof of Delivery (POD)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#71717a', fontWeight: 600 }}>
                    Job #{activeJob?.id || 'SHFT-8942'} • Handover & Sign-off
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

            {/* Destination & Summary Pill */}
            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '12px 14px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={15} color="#0052ff" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                    Delivered To
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b' }}>
                    {activeJob?.dropoff || 'King’s Road, Chelsea, London, SW3 4ND'}
                  </span>
                </div>
              </div>
            </div>

            {/* 1. Condition Photos Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={15} color="#0052ff" /> Delivery Condition Photos ({cargoPhotos.length})
                </label>
                <label 
                  style={{ 
                    fontSize: '0.75rem', 
                    color: '#0052ff', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>+ Take Photo</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>

              {/* Photo Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {cargoPhotos.map((photo) => (
                  <div 
                    key={photo.id}
                    style={{ 
                      position: 'relative', 
                      height: '80px', 
                      borderRadius: '10px', 
                      overflow: 'hidden', 
                      border: '1.5px solid #e2e8f0' 
                    }}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.label} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div 
                      style={{ 
                        position: 'absolute', 
                        bottom: 0, 
                        insetInline: 0, 
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', 
                        color: '#ffffff', 
                        padding: '2px 4px', 
                        fontSize: '0.62rem', 
                        fontWeight: 700, 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden' 
                      }}
                    >
                      {photo.label}
                    </div>
                  </div>
                ))}
                <label 
                  style={{
                    height: '80px',
                    borderRadius: '10px',
                    border: '1.5px dashed #cbd5e1',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  <Camera size={18} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Add More</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* 2. Condition Status Tags */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Inspection Sign-off Status
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'PRISTINE', label: '✓ 100% Pristine', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
                  { id: 'MINOR_PREEXISTING', label: 'Pre-existing Wear', bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setConditionStatus(st.id)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '10px',
                      border: conditionStatus === st.id ? `2px solid ${st.color}` : '1px solid #e2e8f0',
                      background: conditionStatus === st.id ? st.bg : '#ffffff',
                      color: conditionStatus === st.id ? st.color : '#64748b',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Driver Handover Notes */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Driver Handover Notes
              </label>
              <input
                type="text"
                value={driverNotes}
                onChange={(e) => setDriverNotes(e.target.value)}
                placeholder="e.g. All boxes placed in bedroom, customer satisfied"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#09090b',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 4. Digital Signature Pad on Screen */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} color="#0052ff" /> Recipient Customer Signature
                </label>
                {hasSigned && (
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <RotateCcw size={12} /> Clear
                  </button>
                )}
              </div>

              {/* Recipient Name Field */}
              <div style={{ marginBottom: '8px' }}>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Signer Full Name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#09090b',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Touch Canvas Pad */}
              <div 
                style={{ 
                  position: 'relative', 
                  borderRadius: '12px', 
                  border: hasSigned ? '2px solid #0052ff' : '1.5px dashed #94a3b8', 
                  background: '#f8fafc', 
                  overflow: 'hidden',
                  touchAction: 'none'
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={390}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ display: 'block', width: '100%', height: '130px', cursor: 'crosshair' }}
                />
                {!hasSigned && (
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      pointerEvents: 'none',
                      color: '#94a3b8',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    ✍️ Sign on glass here
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.68rem', color: '#71717a', marginTop: '4px', display: 'block' }}>
                By signing, recipient acknowledges satisfactory delivery of all listed cargo.
              </span>
            </div>

            {/* Confirm & Complete Button */}
            <button
              onClick={handleSubmitPod}
              disabled={isSubmitting || !hasSigned}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                background: hasSigned ? '#0052ff' : '#cbd5e1',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: hasSigned ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: hasSigned ? '0 8px 24px rgba(0,82,255,0.4)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {isSubmitting ? (
                <span>Generating POD Certificate...</span>
              ) : (
                <>Complete Delivery & Sign-Off <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
