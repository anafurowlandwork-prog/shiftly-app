import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Box, ShieldCheck, ArrowRight, Check, CreditCard, Sparkles, Plus, Minus, Home, Briefcase, Warehouse, Tag, Layers, Camera } from 'lucide-react';
import VehicleSelector, { VEHICLE_TIERS } from './VehicleSelector';
import AIItemScannerModal from './AIItemScannerModal';
import CheckoutModal from './CheckoutModal';

export default function BookingWizard({ onBookingConfirmed }) {
  const [step, setStep] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);


  // Form State
  const [pickupAddress, setPickupAddress] = useState('742 Evergreen Terrace, Boston, MA');
  const [dropoffAddress, setDropoffAddress] = useState('1200 Beacon Street, Brookline, MA');
  const [viaStopAddress, setViaStopAddress] = useState('');
  const [hasViaStop, setHasViaStop] = useState(false);

  const [moveDate, setMoveDate] = useState('Today (Immediate Dispatch)');
  const [timeSlot, setTimeSlot] = useState('ASAP (Mover arrives in ~30 mins)');
  
  const [moveSize, setMoveSize] = useState('1-2 Bedroom Apt');
  const [accessType, setAccessType] = useState('Elevator Building');
  const [paymentMethod, setPaymentMethod] = useState('Apple Pay');
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoAppliedMsg, setPromoAppliedMsg] = useState('');

  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);

  const [items, setItems] = useState({
    sofa: 1,
    tv: 1,
    queenBed: 1,
    diningSet: 1,
    movingBoxes: 12,
  });

  const [addOns, setAddOns] = useState({
    packing: true,
    disassembly: false,
    fragileInsurance: true,
  });

  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_TIERS[1]);
  const [helpersCount, setHelpersCount] = useState(2);

  const calculatedDistance = hasViaStop ? 18.5 : 14.2;

  const updateItemQty = (itemKey, delta) => {
    setItems((prev) => ({
      ...prev,
      [itemKey]: Math.max(0, prev[itemKey] + delta),
    }));
  };

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SHIFTLY50') {
      setDiscountAmount(50);
      setPromoAppliedMsg('PROMO APPLIED: $50 OFF!');
    } else {
      setDiscountAmount(0);
      setPromoAppliedMsg('Invalid code. Try "SHIFTLY50"');
    }
  };

  const baseFare = selectedVehicle.basePrice;
  const mileageFare = selectedVehicle.perMile * calculatedDistance;
  const extraMoverFee = helpersCount > 1 ? (helpersCount - 1) * 35 : 0;
  const viaStopFee = hasViaStop ? 25 : 0;
  const stairsFee = accessType === 'Stairs (3rd Floor+)' ? 30 : accessType === 'Stairs (2nd Floor)' ? 15 : 0;
  const addOnsTotal = (addOns.packing ? 25 : 0) + (addOns.disassembly ? 40 : 0) + (addOns.fragileInsurance ? 20 : 0);
  const rawTotal = baseFare + mileageFare + extraMoverFee + viaStopFee + stairsFee + addOnsTotal;
  const grandTotal = Math.max(0, rawTotal - discountAmount).toFixed(2);

  const handleConfirm = () => {
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (paidDetails) => {
    setIsCheckoutOpen(false);
    const newBooking = {
      id: 'SHFT-' + Math.floor(100000 + Math.random() * 900000),
      pickup: pickupAddress,
      dropoff: dropoffAddress,
      viaStop: hasViaStop ? viaStopAddress : null,
      date: moveDate,
      time: timeSlot,
      vehicle: selectedVehicle,
      helpers: helpersCount,
      moveSize: moveSize,
      paymentMethod: paidDetails?.paymentMethod || paymentMethod,
      discount: discountAmount,
      total: paidDetails?.totalPrice || grandTotal,
      tip: paidDetails?.tip || 0,
      paymentStatus: 'PAID',
      status: 'DRIVER_EN_ROUTE',
      driver: {
        name: 'Marcus Vance',
        rating: '4.98 ★',
        trips: '480+ moves',
        phone: '+1 (555) 392-8190',
        vehiclePlate: 'MA 7XF-992',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      },
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onBookingConfirmed(newBooking);
  };


  const handleAIScanResult = (room) => {
    setMoveSize(room.name);
    if (room.itemCounts) {
      setItems((prev) => ({
        ...prev,
        ...room.itemCounts,
      }));
    }
    if (room.recommendedTier) {
      const match = VEHICLE_TIERS.find(t => t.name === room.recommendedTier);
      if (match) setSelectedVehicle(match);
    }
    setAddOns((prev) => ({ ...prev, packing: true }));
  };

  return (
    <div style={{ padding: '18px 18px 90px 18px', width: '100%', background: '#ffffff' }}>
      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>1</div>
        <div className={`step-line ${step > 1 ? 'active' : ''}`}></div>
        <div className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>2</div>
        <div className={`step-line ${step > 2 ? 'active' : ''}`}></div>
        <div className={`step-dot ${step === 3 ? 'active' : step > 3 ? 'completed' : ''}`}>3</div>
        <div className={`step-line ${step > 3 ? 'active' : ''}`}></div>
        <div className={`step-dot ${step === 4 ? 'active' : ''}`}>4</div>
      </div>

      {/* Step 1: Pickup, Multi-Stop & Destination */}
      {step === 1 && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.55rem', color: '#09090b', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Where are you moving?
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Enter pickup, destination & optional intermediate stops
            </p>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ marginBottom: '12px' }}>
              <label className="input-label" style={{ color: 'var(--accent-blue)' }}>PICKUP LOCATION</label>
              <div className="phone-input-wrapper" style={{ margin: 0 }}>
                <MapPin size={18} color="var(--accent-blue)" />
                <input
                  type="text"
                  className="phone-input"
                  style={{ fontSize: '0.925rem' }}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Street address, city, zip"
                />
              </div>
            </div>

            {hasViaStop && (
              <div style={{ marginBottom: '12px' }}>
                <label className="input-label" style={{ color: '#09090b' }}>STOP 1 (+ $25)</label>
                <div className="phone-input-wrapper" style={{ margin: 0 }}>
                  <Layers size={18} color="#09090b" />
                  <input
                    type="text"
                    className="phone-input"
                    style={{ fontSize: '0.925rem' }}
                    value={viaStopAddress}
                    onChange={(e) => setViaStopAddress(e.target.value)}
                    placeholder="Storage locker or secondary pickup"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="input-label">DESTINATION LOCATION</label>
              <div className="phone-input-wrapper" style={{ margin: 0 }}>
                <MapPin size={18} color="#09090b" />
                <input
                  type="text"
                  className="phone-input"
                  style={{ fontSize: '0.925rem' }}
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  placeholder="Destination address, city, zip"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDropoffAddress('88 Commonwealth Ave, Boston, MA')}
                style={{ background: 'var(--bg-input)', border: 'none', color: '#09090b', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Home size={12} /> New Apt
              </button>

              <button
                onClick={() => setDropoffAddress('500 Financial Center, Boston, MA')}
                style={{ background: 'var(--bg-input)', border: 'none', color: '#09090b', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Briefcase size={12} /> Office HQ
              </button>

              <button
                onClick={() => {
                  setHasViaStop(!hasViaStop);
                  if (!viaStopAddress) setViaStopAddress('14 Public Storage Way, Cambridge, MA');
                }}
                style={{ background: hasViaStop ? 'var(--accent-blue-subtle)' : 'var(--bg-input)', border: hasViaStop ? '1px solid var(--accent-blue-border)' : 'none', color: hasViaStop ? 'var(--accent-blue)' : '#09090b', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={12} /> {hasViaStop ? 'Storage Stop Added' : '+ Add Storage Stop'}
              </button>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: '#09090b', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--accent-blue)" /> Schedule Window
            </h4>

            <div style={{ marginBottom: '10px' }}>
              <label className="input-label">DATE</label>
              <select
                className="phone-input"
                style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '14px', width: '100%', fontSize: '0.9rem' }}
                value={moveDate}
                onChange={(e) => setMoveDate(e.target.value)}
              >
                <option value="Today (Immediate Dispatch)">Today (Immediate On-Demand Dispatch)</option>
                <option value="Tomorrow">Tomorrow</option>
                <option value="This Weekend">This Weekend (Saturday)</option>
                <option value="Next Week">Next Week</option>
              </select>
            </div>

            <div>
              <label className="input-label">TIME WINDOW</label>
              <select
                className="phone-input"
                style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '14px', width: '100%', fontSize: '0.9rem' }}
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option value="ASAP (Mover arrives in ~30 mins)">ASAP (Mover arrives in ~30 mins)</option>
                <option value="Morning (8:00 AM - 11:00 AM)">Morning (8:00 AM - 11:00 AM)</option>
                <option value="Afternoon (12:00 PM - 3:00 PM)">Afternoon (12:00 PM - 3:00 PM)</option>
                <option value="Evening (4:00 PM - 7:00 PM)">Evening (4:00 PM - 7:00 PM)</option>
              </select>
            </div>
          </div>

          <button className="btn-black" onClick={() => setStep(2)}>
            Continue to Inventory <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Step 2: Inventory Size & AI Photo Scanner */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.55rem', color: '#09090b', fontWeight: 800, letterSpacing: '-0.03em' }}>
                Inventory & Cargo
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Customize list or use AI Camera scanner
              </p>
            </div>

            <button
              onClick={() => setIsAIScannerOpen(true)}
              style={{
                background: '#09090b',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '14px',
                fontSize: '0.785rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <Camera size={14} color="var(--accent-blue)" /> AI Scan
            </button>
          </div>

          {/* AI Scanner Hero Card */}
          <div
            onClick={() => setIsAIScannerOpen(true)}
            style={{
              background: '#09090b',
              color: '#ffffff',
              borderRadius: '18px',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              border: '1px solid #27272a',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#0052ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <Sparkles size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', display: 'block', letterSpacing: '-0.2px' }}>
                  Shiftly Vision AI™ Scanner
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#a1a1aa' }}>
                  Snap room photo to auto-detect items & volume
                </span>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.12)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>SCAN</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Move Size Cards */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <label className="input-label">HOME / ROOM SIZE</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {['Single Item / Few Boxes', 'Studio Apt', '1-2 Bedroom Apt', '3+ Bedroom Home', 'Office Move'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setMoveSize(sz)}
                  style={{
                    background: moveSize === sz ? '#09090b' : 'var(--bg-input)',
                    color: moveSize === sz ? '#ffffff' : '#09090b',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '12px 10px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Specific Item Counters */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ color: '#09090b', fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>
              Heavy & Bulk Items
            </h4>

            {[
              { key: 'sofa', label: '3-Seater Sofa / Couch' },
              { key: 'queenBed', label: 'Queen / King Mattress & Frame' },
              { key: 'diningSet', label: 'Dining Table & Chairs' },
              { key: 'tv', label: 'Large Flat Screen TV (55"+)' },
              { key: 'movingBoxes', label: 'Standard Moving Boxes' },
            ].map((itm) => (
              <div key={itm.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.85rem', color: '#09090b', fontWeight: 600 }}>{itm.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => updateItemQty(itm.key, -1)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-input)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#09090b' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, minWidth: '20px', textAlign: 'center', color: '#09090b' }}>
                    {items[itm.key]}
                  </span>
                  <button
                    onClick={() => updateItemQty(itm.key, 1)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#09090b', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add-on Services */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ color: '#09090b', fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>
              Add-On Services
            </h4>

            {[
              { key: 'packing', label: 'Full Packing & Bubble Wrap Service', price: '+$25' },
              { key: 'disassembly', label: 'Furniture Disassembly & Reassembly', price: '+$40' },
              { key: 'fragileInsurance', label: 'Zero-Deductible Fragile Protection', price: '+$20' },
            ].map((addon) => (
              <div
                key={addon.key}
                onClick={() => setAddOns({ ...addOns, [addon.key]: !addOns[addon.key] })}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: addOns[addon.key] ? 'var(--accent-blue)' : 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {addOns[addon.key] && <Check size={14} color="#ffffff" />}
                  </div>
                  <span style={{ fontSize: '0.825rem', color: '#09090b', fontWeight: 600 }}>{addon.label}</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{addon.price}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-black" style={{ flex: 1, background: 'var(--bg-input)', color: '#09090b' }} onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn-black" style={{ flex: 2 }} onClick={() => setStep(3)}>
              Choose Fleet Vehicle <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Vehicle Tier Selection */}
      {step === 3 && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.55rem', color: '#09090b', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Select Vehicle & Crew
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Tailored specifically for {moveSize}
            </p>
          </div>

          <VehicleSelector
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            helpersCount={helpersCount}
            setHelpersCount={setHelpersCount}
          />

          {/* Stairs & Building Access */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginTop: '16px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <label className="input-label">BUILDING ACCESS / STAIRS</label>
            <select
              className="phone-input"
              style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: '14px', width: '100%', fontSize: '0.9rem' }}
              value={accessType}
              onChange={(e) => setAccessType(e.target.value)}
            >
              <option value="Elevator Building">Elevator Building / Ground Floor (No Extra Fee)</option>
              <option value="Stairs (2nd Floor)">Stairs (2nd Floor) (+$15)</option>
              <option value="Stairs (3rd Floor+)">Stairs (3rd Floor+) (+$30)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-black" style={{ flex: 1, background: 'var(--bg-input)', color: '#09090b' }} onClick={() => setStep(2)}>
              Back
            </button>
            <button className="btn-black" style={{ flex: 2 }} onClick={() => setStep(4)}>
              Review & Payment <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review, Promo Code & Instant Booking */}
      {step === 4 && (
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.55rem', color: '#09090b', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Review & Book Mover
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Real-time driver dispatch guaranteed
            </p>
          </div>

          {/* Move Summary Card */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--accent-blue)', fontWeight: 800, textTransform: 'uppercase' }}>VEHICLE & CREW</span>
                <h4 style={{ color: '#09090b', fontWeight: 800, fontSize: '1.05rem' }}>{selectedVehicle.name}</h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{helpersCount} Pro Movers • {moveSize}</p>
              </div>
              <img src={selectedVehicle.image} alt={selectedVehicle.name} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '12px' }} />
            </div>

            <div style={{ fontSize: '0.8rem', color: '#09090b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="var(--accent-blue)" />
                <span><strong>From:</strong> {pickupAddress}</span>
              </div>
              {hasViaStop && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={14} color="#09090b" />
                  <span><strong>Stop 1:</strong> {viaStopAddress}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#09090b" />
                <span><strong>To:</strong> {dropoffAddress}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                <Clock size={14} />
                <span>{moveDate} ({timeSlot})</span>
              </div>
            </div>
          </div>

          {/* Promo Code Input */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={12} color="var(--accent-blue)" /> PROMO CODE
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="phone-input"
                placeholder="Try SHIFTLY50"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem' }}
              />
              <button
                onClick={applyPromo}
                style={{ background: '#09090b', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Apply
              </button>
            </div>
            {promoAppliedMsg && (
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: discountAmount > 0 ? 'var(--accent-blue)' : '#ef4444', marginTop: '6px' }}>
                {promoAppliedMsg}
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ color: '#09090b', fontSize: '0.9rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={16} color="var(--accent-blue)" /> Payment Method
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Apple Pay', 'Google Pay', 'Visa •••• 4921'].map((pm) => (
                <button
                  key={pm}
                  onClick={() => setPaymentMethod(pm)}
                  style={{
                    flex: 1,
                    background: paymentMethod === pm ? '#09090b' : 'var(--bg-input)',
                    color: paymentMethod === pm ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '10px 6px',
                    borderRadius: '12px',
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Fare Itemized Breakdown */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ color: '#09090b', fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>
              Itemized Fare Breakdown
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Base Rate ({selectedVehicle.name})</span>
              <span style={{ color: '#09090b', fontWeight: 600 }}>${baseFare.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Distance ({calculatedDistance} mi @ ${selectedVehicle.perMile}/mi)</span>
              <span style={{ color: '#09090b', fontWeight: 600 }}>${mileageFare.toFixed(2)}</span>
            </div>

            {hasViaStop && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>Intermediate Stop Fee</span>
                <span style={{ color: '#09090b', fontWeight: 600 }}>+$25.00</span>
              </div>
            )}

            {stairsFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>Stair Handling ({accessType})</span>
                <span style={{ color: '#09090b', fontWeight: 600 }}>+${stairsFee.toFixed(2)}</span>
              </div>
            )}

            {extraMoverFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>Movers Crew ({helpersCount} movers)</span>
                <span style={{ color: '#09090b', fontWeight: 600 }}>${extraMoverFee.toFixed(2)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--accent-blue)', fontWeight: 800, marginBottom: '8px' }}>
                <span>Promo Discount (SHIFTLY50)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: '#09090b', fontFamily: 'var(--font-heading)' }}>Grand Total</strong>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Via {paymentMethod}</p>
              </div>
              <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em' }}>
                ${grandTotal}
              </span>
            </div>
          </div>

          <button className="btn-blue" onClick={handleConfirm}>
            Confirm & Dispatch Mover
          </button>
        </div>
      )}

      {isAIScannerOpen && (
        <AIItemScannerModal
          onSelectInventory={handleAIScanResult}
          onClose={() => setIsAIScannerOpen(false)}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          bookingSummary={{
            pickup: pickupAddress,
            dropoff: dropoffAddress,
            vehicleTier: selectedVehicle,
            totalPrice: grandTotal
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
}

