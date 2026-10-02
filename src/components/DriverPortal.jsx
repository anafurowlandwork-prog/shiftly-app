import React, { useState, useEffect } from 'react';
import { 
  Truck, Navigation, DollarSign, Star, ShieldCheck, CheckCircle2, 
  MapPin, Phone, MessageSquare, ArrowRight, AlertCircle, Play, 
  Pause, RefreshCw, ChevronRight, Package, Clock, User, FileText 
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';
import DriverProfileModal from './DriverProfileModal';
import DriverChatSheet from './DriverChatSheet';
import DriverEarningsModal from './DriverEarningsModal';
import ProofOfDeliveryModal from './ProofOfDeliveryModal';
import ProofOfDeliveryViewer from './ProofOfDeliveryViewer';

export default function DriverPortal({ 
  currentBooking,
  onSyncStatusWithCustomer, 
  onSwitchToCustomer,
  sharedMessages = [],
  onSendDriverMessage
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEarningsOpen, setIsEarningsOpen] = useState(false);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [isViewPodOpen, setIsViewPodOpen] = useState(false);
  const [podCertificate, setPodCertificate] = useState(() => {
    try {
      const stored = localStorage.getItem('shiftly_last_pod_certificate');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeJob, setActiveJob] = useState(null);
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [offerCountdown, setOfferCountdown] = useState(15);
  const [todayEarnings, setTodayEarnings] = useState(248.50);
  const [completedCount, setCompletedCount] = useState(3);
  const [jobStep, setJobStep] = useState(0); // 0: Heading, 1: Arrived, 2: Loaded, 3: In Transit, 4: Delivered

  // Real or Incoming Job Offer
  const sampleOffer = currentBooking ? {
    id: currentBooking.id || 'SHFT-8942',
    customerName: 'Customer',
    customerPhone: '+44 7378 142815',
    payout: Number(currentBooking.total || 165),
    distance: `${currentBooking.distanceMiles || 3.8} mi`,
    duration: '35 mins',
    pickup: currentBooking.pickup || 'Oxford Street, London',
    dropoff: currentBooking.dropoff || 'King’s Road, Chelsea, London',
    vehicleTier: currentBooking.vehicle?.name || 'Shiftly Flex',
    items: [
      { name: 'Living Room Furniture', qty: 1, weight: '140 lbs' },
      { name: 'Queen Bed & Mattress', qty: 1, weight: '120 lbs' },
      { name: 'Moving Boxes', qty: 8, weight: '160 lbs' }
    ],
    totalWeight: '420 lbs',
    helpersNeeded: currentBooking.helpers || 2
  } : {
    id: 'SH-8942',
    customerName: 'Verified Customer',
    customerPhone: '+44 7378 142815',
    payout: 165.00,
    distance: '3.8 mi',
    duration: '35 mins',
    pickup: 'Oxford Street, London, W1D 1BS',
    dropoff: 'King’s Road, Chelsea, London, SW3 4ND',
    vehicleTier: 'Shiftly Flex (Box Truck)',
    items: [
      { name: '3-Seater Velvet Sofa', qty: 1, weight: '140 lbs' },
      { name: 'Queen Mattress & Frame', qty: 1, weight: '120 lbs' },
      { name: 'Moving Boxes (Medium)', qty: 6, weight: '180 lbs' },
      { name: '65" OLED 4K Television', qty: 1, weight: '55 lbs' }
    ],
    totalWeight: '495 lbs',
    helpersNeeded: 2
  };

  // Simulate incoming job offer when online and no active job
  useEffect(() => {
    let timer;
    if (isOnline && !activeJob && !incomingOffer) {
      timer = setTimeout(() => {
        setIncomingOffer(sampleOffer);
        setOfferCountdown(15);
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [isOnline, activeJob, incomingOffer]);

  // Offer countdown
  useEffect(() => {
    let interval;
    if (incomingOffer && offerCountdown > 0) {
      interval = setInterval(() => {
        setOfferCountdown((prev) => prev - 1);
      }, 1000);
    } else if (incomingOffer && offerCountdown === 0) {
      setIncomingOffer(null);
    }
    return () => clearInterval(interval);
  }, [incomingOffer, offerCountdown]);

  const handleAcceptOffer = () => {
    setActiveJob(incomingOffer);
    setIncomingOffer(null);
    setJobStep(0);
    if (onSyncStatusWithCustomer) {
      onSyncStatusWithCustomer('driver_en_route');
    }
  };

  const handleDeclineOffer = () => {
    setIncomingOffer(null);
  };

  const handleAdvanceStep = () => {
    if (jobStep === 0) {
      setJobStep(1); // Arrived
      if (onSyncStatusWithCustomer) onSyncStatusWithCustomer('arrived_pickup');
    } else if (jobStep === 1) {
      setJobStep(2); // Loaded
      if (onSyncStatusWithCustomer) onSyncStatusWithCustomer('cargo_loaded');
    } else if (jobStep === 2) {
      setJobStep(3); // In Transit
      if (onSyncStatusWithCustomer) onSyncStatusWithCustomer('in_transit');
    } else if (jobStep === 3) {
      // Trigger Proof of Delivery inspection modal with digital signature
      setIsPodModalOpen(true);
    }
  };

  const handlePodCompleted = (certificate) => {
    setIsPodModalOpen(false);
    setPodCertificate(certificate);
    try {
      localStorage.setItem('shiftly_last_pod_certificate', JSON.stringify(certificate));
    } catch (e) {}

    setJobStep(4); // Delivered
    setTodayEarnings((prev) => prev + (activeJob ? activeJob.payout : 165));
    setCompletedCount((prev) => prev + 1);

    if (onSyncStatusWithCustomer) {
      onSyncStatusWithCustomer('completed', certificate);
    }
  };

  const handleResetJob = () => {
    setActiveJob(null);
    setJobStep(0);
  };

  const stepLabels = [
    { title: 'Heading to Pickup', action: 'Tap: Arrived at Pickup', desc: 'Navigate to pickup address' },
    { title: 'Arrived at Pickup', action: 'Tap: Cargo Verified & Loaded', desc: 'Load items into truck' },
    { title: 'Cargo Secured', action: 'Tap: Start Trip to Destination', desc: 'Secure load & depart' },
    { title: 'In Transit', action: 'Tap: Proof of Delivery & Sign-off', desc: 'Arrived at destination' },
    { title: 'Delivered', action: 'Collect Payout & Back to Radar', desc: 'Job successfully completed' }
  ];

  return (
    <div className="driver-portal" style={{ background: '#ffffff', minHeight: '100%', padding: '16px 16px 80px 16px', boxSizing: 'border-box' }}>
      
      {/* Driver Header & Online Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f4f4f5' }}>
        <div 
          onClick={() => setIsProfileOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          title="Click to view & edit driver profile"
        >
          <div style={{ position: 'relative', width: '38px', height: '38px' }}>
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80" 
              alt="Marcus Vance"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0052ff' }}
            />
            <div style={{ position: 'absolute', bottom: -2, right: -2, width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid #ffffff' }}></div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#09090b' }}>Marcus Vance</span>
              <ShieldCheck size={14} color="#0052ff" />
            </div>
            <span style={{ fontSize: '0.725rem', color: '#0052ff', fontWeight: 700 }}>View Profile & Vehicle Specs →</span>
          </div>
        </div>


        {/* Online / Offline Switch */}
        <button
          onClick={() => {
            setIsOnline(!isOnline);
            if (isOnline) setIncomingOffer(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            border: 'none',
            background: isOnline ? '#0052ff' : '#f4f4f5',
            color: isOnline ? '#ffffff' : '#71717a',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isOnline ? '#ffffff' : '#a1a1aa'
          }}></span>
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </button>
      </div>

      {/* Driver Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        <div 
          onClick={() => setIsEarningsOpen(true)}
          style={{ background: '#f8fafc', padding: '12px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.1s ease' }}
          title="Click to open Stripe Connect Wallet"
        >
          <span style={{ fontSize: '0.7rem', color: '#0052ff', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Today's Pay ⚡</span>
          <span style={{ fontSize: '1.15rem', color: '#09090b', fontWeight: 900 }}>${todayEarnings.toFixed(2)}</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Shifts Done</span>
          <span style={{ fontSize: '1.15rem', color: '#09090b', fontWeight: 900 }}>{completedCount}</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '12px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Rating</span>
          <span style={{ fontSize: '1.15rem', color: '#0052ff', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <Star size={13} fill="#0052ff" /> 4.98
          </span>
        </div>
      </div>

      {/* State 1: Active Job Workflow */}
      {activeJob && (
        <div style={{ background: '#09090b', color: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: '#0052ff', textTransform: 'uppercase' }}>
              ACTIVE SHIFT #{activeJob.id}
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
              +${activeJob.payout.toFixed(2)}
            </span>
          </div>

          {/* Stepper Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
            {[0, 1, 2, 3, 4].map((stepIdx) => (
              <div 
                key={stepIdx} 
                style={{ 
                  flex: 1, 
                  height: '4px', 
                  borderRadius: '2px', 
                  background: stepIdx <= jobStep ? '#0052ff' : '#27272a' 
                }} 
              />
            ))}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', color: '#ffffff' }}>
              {stepLabels[jobStep].title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0 }}>
              {stepLabels[jobStep].desc}
            </p>
          </div>

          {/* Customer & Route Details */}
          <div style={{ background: '#18181b', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', display: 'block' }}>{activeJob.customerName}</span>
                <span style={{ fontSize: '0.75rem', color: '#71717a' }}>{activeJob.items.length} cargo items • {activeJob.totalWeight}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={`tel:${activeJob.customerPhone}`} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', textDecoration: 'none' }}>
                  <Phone size={14} />
                </a>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0052ff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', cursor: 'pointer' }}
                  title="Open Chat with Customer"
                >
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>


            <div style={{ borderTop: '1px solid #27272a', paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                <MapPin size={14} color="#0052ff" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: '#d4d4d8' }}>{activeJob.pickup}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Navigation size={14} color="#ffffff" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: '#d4d4d8' }}>{activeJob.dropoff}</span>
              </div>
            </div>
          </div>

          {/* Action Step Button */}
          {jobStep < 4 ? (
            <button
              onClick={handleAdvanceStep}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: '#0052ff',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 82, 255, 0.4)'
              }}
            >
              {stepLabels[jobStep].action} <ArrowRight size={18} />
            </button>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', marginBottom: '8px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#ffffff' }}>Payout Deposited!</h4>
              <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: '#a1a1aa' }}>+${activeJob.payout.toFixed(2)} added to your daily balance</p>
              
              {/* View POD Certificate Button */}
              {podCertificate && (
                <button
                  type="button"
                  onClick={() => setIsViewPodOpen(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #0052ff',
                    background: 'rgba(0, 82, 255, 0.15)',
                    color: '#60a5fa',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '10px'
                  }}
                >
                  <ShieldCheck size={16} /> View Signed POD Certificate ({podCertificate.podId})
                </button>
              )}

              <button
                onClick={handleResetJob}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #27272a',
                  background: '#18181b',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Back to Finding Shifts
              </button>
            </div>
          )}
        </div>
      )}

      {/* State 2: Incoming Job Offer Card (Radar Triggered) */}
      {!activeJob && incomingOffer && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #0052ff',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 12px 30px rgba(0, 82, 255, 0.15)',
          animation: 'pulse 1.5s infinite alternate'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0052ff', display: 'inline-block' }}></span>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0052ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                NEW SHIFT MATCH ({offerCountdown}s)
              </span>
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#09090b' }}>
              ${incomingOffer.payout.toFixed(2)}
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', marginBottom: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>CARGO & VEHICLE</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#09090b' }}>{incomingOffer.vehicleTier} • {incomingOffer.distance} ({incomingOffer.duration})</div>
            <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '2px' }}>{incomingOffer.items.length} items ({incomingOffer.totalWeight})</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
              <MapPin size={14} color="#0052ff" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#09090b', fontWeight: 600 }}>{incomingOffer.pickup}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Navigation size={14} color="#09090b" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: '#09090b', fontWeight: 600 }}>{incomingOffer.dropoff}</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
            <button
              onClick={handleDeclineOffer}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                background: '#ffffff',
                color: '#71717a',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Decline
            </button>
            <button
              onClick={handleAcceptOffer}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: '#0052ff',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0, 82, 255, 0.3)'
              }}
            >
              Accept Job <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* State 3: Radar Scanning Animation when waiting */}
      {!activeJob && !incomingOffer && isOnline && (
        <div style={{ textAlign: 'center', padding: '30px 16px', background: '#fafafa', borderRadius: '16px', border: '1px dashed #e4e4e7', marginBottom: '16px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(0, 82, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            color: '#0052ff'
          }}>
            <Truck size={28} />
          </div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>Scanning Active Shift Radar...</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#71717a' }}>Matching you with nearby high-payout moving cargo</p>
        </div>
      )}

      {/* State 4: Offline State */}
      {!isOnline && (
        <div style={{ textAlign: 'center', padding: '30px 16px', background: '#fafafa', borderRadius: '16px', border: '1px solid #f4f4f5', marginBottom: '16px' }}>
          <Pause size={32} color="#a1a1aa" style={{ margin: '0 auto 10px auto', display: 'block' }} />
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#09090b' }}>You are currently Offline</h4>
          <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: '#71717a' }}>Go online to start receiving lucrative moving shifts</p>
          <button
            onClick={() => setIsOnline(true)}
            style={{
              padding: '10px 20px',
              borderRadius: '20px',
              border: 'none',
              background: '#0052ff',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Go Online Now
          </button>
        </div>
      )}

      {/* Quick Switch to Customer Mode */}
      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #f4f4f5' }}>
        <button
          onClick={onSwitchToCustomer}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #e4e4e7',
            background: '#ffffff',
            color: '#09090b',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Package size={16} color="#0052ff" /> Switch to Customer Booking
        </button>
      </div>

      {/* Driver Profile Modal */}
      {isProfileOpen && (
        <DriverProfileModal onClose={() => setIsProfileOpen(false)} />
      )}

      {/* Driver Earnings & Stripe Instant Payouts Modal */}
      {isEarningsOpen && (
        <DriverEarningsModal onClose={() => setIsEarningsOpen(false)} />
      )}

      {/* Driver Chat Sheet with Customer */}
      {isChatOpen && (
        <DriverChatSheet
          customerName={activeJob?.customerName || 'Sarah Jenkins'}
          messages={sharedMessages}
          onSendMessage={(newMsg) => {
            if (onSendDriverMessage) onSendDriverMessage(newMsg);
          }}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Proof of Delivery (POD) & Digital Signature Capture Modal */}
      {isPodModalOpen && (
        <ProofOfDeliveryModal
          activeJob={activeJob}
          onCompleteDelivery={handlePodCompleted}
          onClose={() => setIsPodModalOpen(false)}
        />
      )}

      {/* Proof of Delivery Certificate Viewer Modal */}
      {isViewPodOpen && (
        <ProofOfDeliveryViewer
          podData={podCertificate}
          onClose={() => setIsViewPodOpen(false)}
        />
      )}
    </div>
  );
}



