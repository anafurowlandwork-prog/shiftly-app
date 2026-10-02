import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, Box, ShieldCheck, ArrowRight, Check, CreditCard, Sparkles, Plus, Minus, Home, Briefcase, Warehouse, Tag, Layers, Camera, Search, Navigation, Scale, Trash2 } from 'lucide-react';
import VehicleSelector, { VEHICLE_TIERS } from './VehicleSelector';
import AIItemScannerModal from './AIItemScannerModal';
import CustomHeavyItemModal from './CustomHeavyItemModal';
import CheckoutModal from './CheckoutModal';
import ShiftlyShieldModal, { SHIELD_TIERS } from './ShiftlyShieldModal';
import { createMoveBooking, sendBookingNotification } from '../services/backendService';
import { searchAddressSuggestions, geocodeAddress, calculateDistanceMiles } from '../utils/geoUtils';
import { formatCurrencyPrice, getCurrencyForCountryCode } from '../utils/currencyUtils';

export default function BookingWizard({ onBookingConfirmed }) {
  const [step, setStep] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Form State - Starts empty with intuitive placeholders
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [viaStopAddress, setViaStopAddress] = useState('');
  const [hasViaStop, setHasViaStop] = useState(false);

  // Real Geocoded GPS Coordinates
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);

  // Live Autocomplete Suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);

  // Dynamic Country Code & Currency
  const userCountryCode = typeof window !== 'undefined' ? (localStorage.getItem('shiftly_user_country_code') || '+44') : '+44';

  // Schedule Window (Today, Tomorrow, or Custom Exact Date)
  const [dateType, setDateType] = useState('today'); // 'today' | 'tomorrow' | 'custom'
  const [customExactDate, setCustomExactDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('ASAP (Mover arrives in ~30 mins)');
  
  const [moveSize, setMoveSize] = useState('1-2 Bedroom Apt');
  const [accessType, setAccessType] = useState('Elevator Building');
  const [paymentMethod, setPaymentMethod] = useState('Apple Pay');
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoAppliedMsg, setPromoAppliedMsg] = useState('');

  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);
  const [isShieldModalOpen, setIsShieldModalOpen] = useState(false);
  const [selectedShieldTier, setSelectedShieldTier] = useState('COMPREHENSIVE'); // 'BASIC' | 'COMPREHENSIVE' | 'ULTRA'

  // Standard Items
  const [items, setItems] = useState({
    sofa: 1,
    tv: 1,
    queenBed: 1,
    diningSet: 1,
    movingBoxes: 12,
  });

  // Custom & Specialty Heavy Items (Pianos, Safes, Treadmills, etc.)
  const [customHeavyItems, setCustomHeavyItems] = useState([]);
  const [scannedVisionData, setScannedVisionData] = useState(null);

  const [addOns, setAddOns] = useState({
    packing: true,
    disassembly: false,
    fragileInsurance: true,
  });

  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_TIERS[1]);
  const [helpersCount, setHelpersCount] = useState(2);

  // Debounced Address Search for Pickup
  useEffect(() => {
    if (!pickupAddress || pickupAddress.length < 3) {
      setPickupSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      const results = await searchAddressSuggestions(pickupAddress);
      setPickupSuggestions(results);
      setIsSearchingPickup(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [pickupAddress]);

  // Debounced Address Search for Dropoff
  useEffect(() => {
    if (!dropoffAddress || dropoffAddress.length < 3) {
      setDropoffSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingDropoff(true);
      const results = await searchAddressSuggestions(dropoffAddress);
      setDropoffSuggestions(results);
      setIsSearchingDropoff(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [dropoffAddress]);

  // Real Calculated Haversine Distance
  const calculatedDistance = (pickupCoords && dropoffCoords) 
    ? calculateDistanceMiles(pickupCoords, dropoffCoords) + (hasViaStop ? 4.5 : 0)
    : (hasViaStop ? 16.5 : 12.0);

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

  const shieldConfig = SHIELD_TIERS[selectedShieldTier] || SHIELD_TIERS.COMPREHENSIVE;
  const shieldFee = shieldConfig.feeUsd;
  const customItemsTotalFee = customHeavyItems.reduce((acc, it) => acc + (it.fee * (it.qty || 1)), 0);
  const baseFare = selectedVehicle.basePrice;
  const mileageFare = selectedVehicle.perMile * calculatedDistance;
  const extraMoverFee = helpersCount > 1 ? (helpersCount - 1) * 35 : 0;
  const viaStopFee = hasViaStop ? 25 : 0;
  const stairsFee = accessType === 'Stairs (3rd Floor+)' ? 30 : accessType === 'Stairs (2nd Floor)' ? 15 : 0;
  const addOnsTotal = (addOns.packing ? 25 : 0) + (addOns.disassembly ? 40 : 0) + customItemsTotalFee;
  const rawTotal = baseFare + mileageFare + extraMoverFee + viaStopFee + stairsFee + addOnsTotal + shieldFee;
  const grandTotal = Math.max(0, rawTotal - discountAmount).toFixed(2);

  const getEffectiveMoveDate = () => {
    if (dateType === 'today') return 'Today (Immediate Dispatch)';
    if (dateType === 'tomorrow') return 'Tomorrow';
    return customExactDate ? new Date(customExactDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Scheduled Date';
  };

  const handleConfirm = () => {
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (paidDetails) => {
    setIsCheckoutOpen(false);

    let authUserData = null;
    try {
      const rawUser = localStorage.getItem('shiftly_auth_user');
      if (rawUser) authUserData = JSON.parse(rawUser);
    } catch (e) {}

    const customerPhone = authUserData?.phone || (authUserData?.method === 'phone' ? authUserData?.recipient : '+44 7911 123456');
    const customerEmail = authUserData?.email || (authUserData?.method === 'email' ? authUserData?.recipient : 'sarah.jenkins@example.com');
    const customerName = authUserData?.recipient || (authUserData?.isGuest ? 'Guest User' : 'Sarah Jenkins');

    // Instant coordinates without waiting on network geocoding during checkout
    const finalPickupCoords = pickupCoords || [51.5074, -0.1278];
    const finalDropoffCoords = dropoffCoords || [51.5155, -0.1419];

    const newBooking = {
      id: 'SHFT-' + Math.floor(100000 + Math.random() * 900000),
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail,
      pickup: pickupAddress || '10 Oxford St, London',
      dropoff: dropoffAddress || '25 King’s Rd, London',
      pickupCoordinates: finalPickupCoords,
      dropoffCoordinates: finalDropoffCoords,
      distanceMiles: calculatedDistance || 4.2,
      viaStop: hasViaStop ? viaStopAddress : null,
      date: getEffectiveMoveDate(),
      time: timeSlot,
      vehicle: selectedVehicle,
      helpers: helpersCount,
      moveSize: moveSize,
      items: items,
      customHeavyItems: customHeavyItems,
      countryCode: userCountryCode,
      currencyCode: getCurrencyForCountryCode(userCountryCode).currencyCode,
      currencySymbol: getCurrencyForCountryCode(userCountryCode).symbol,
      shieldTier: selectedShieldTier,
      shieldDetails: shieldConfig,
      shieldCertificate: `SHIELD-${shieldConfig.coverageLimitUsd / 1000}K-${Math.floor(1000 + Math.random() * 9000)}`,
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
        phone: '+44 7378 142815',
        vehiclePlate: 'LX24 XFR',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      },
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 1. Immediately transition to live tracking map (Zero Lag)
    onBookingConfirmed(newBooking);

    // 2. Persist booking & dispatch real SMS/Email confirmation in background
    (async () => {
      try {
        await createMoveBooking(newBooking);
        await sendBookingNotification({
          booking: newBooking,
          phone: customerPhone,
          email: customerEmail
        });
      } catch (e) {
        console.warn('Background booking sync note:', e.message);
      }
    })();
  };

  const handleAIScanResult = (scanData) => {
    setScannedVisionData(scanData);
    setMoveSize(scanData.name || 'AI Scanned Inventory');
    if (scanData.itemCounts) {
      setItems((prev) => ({
        ...prev,
        ...scanData.itemCounts,
      }));
    }
    if (scanData.recommendedTier) {
      const match = VEHICLE_TIERS.find(t => t.name === scanData.recommendedTier);
      if (match) setSelectedVehicle(match);
    }
    if (scanData.recommendedHelpers) {
      setHelpersCount(scanData.recommendedHelpers);
    }
    setAddOns((prev) => ({ ...prev, packing: true }));
  };

  const handleAddCustomHeavyItem = (newItem) => {
    setCustomHeavyItems((prev) => [...prev, newItem]);
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
        <div className={`step-dot ${step === 4 ? 'active' : step > 4 ? 'completed' : ''}`}>4</div>
      </div>

      {/* Step 1: Pickup, Multi-Stop & Destination */}
      {step === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.55rem', color: '#09090b', fontWeight: 800, letterSpacing: '-0.03em' }}>
                Where are you moving?
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Enter pickup, destination & optional intermediate stops
              </p>
            </div>

            <button
              onClick={() => setIsAIScannerOpen(true)}
              style={{
                background: '#09090b',
                color: '#ffffff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Snap Room Photo with AI Scanner"
            >
              <Camera size={14} color="#0052ff" /> AI Scan
            </button>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            
            {/* PICKUP INPUT WITH LIVE AUTOCOMPLETE */}
            <div style={{ marginBottom: '14px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label" style={{ color: 'var(--accent-blue)', margin: 0 }}>PICKUP LOCATION</label>
                {isSearchingPickup && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Searching maps...</span>}
              </div>
              <div className="phone-input-wrapper" style={{ margin: 0, position: 'relative' }}>
                <MapPin size={18} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  className="phone-input"
                  style={{ fontSize: '0.925rem' }}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="e.g. 10 Oxford Street, London or Postcode"
                />
              </div>

              {/* Pickup Suggestions Dropdown */}
              {pickupSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid #e2e8f0',
                  zIndex: 1000,
                  marginTop: '4px',
                  overflow: 'hidden'
                }}>
                  {pickupSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setPickupAddress(sug.displayName);
                        setPickupCoords([sug.lat, sug.lng]);
                        setPickupSuggestions([]);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderBottom: i < pickupSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        color: '#09090b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <MapPin size={14} color="#0052ff" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sug.displayName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasViaStop && (
              <div style={{ marginBottom: '14px' }}>
                <label className="input-label" style={{ color: '#09090b' }}>INTERMEDIATE STOP (+ {formatCurrencyPrice(25, userCountryCode, false)})</label>
                <div className="phone-input-wrapper" style={{ margin: 0 }}>
                  <Layers size={18} color="#09090b" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    className="phone-input"
                    style={{ fontSize: '0.925rem' }}
                    value={viaStopAddress}
                    onChange={(e) => setViaStopAddress(e.target.value)}
                    placeholder="Storage locker or intermediate pickup"
                  />
                </div>
              </div>
            )}

            {/* DESTINATION INPUT WITH LIVE AUTOCOMPLETE */}
            <div style={{ marginBottom: '6px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label" style={{ color: '#09090b', margin: 0 }}>DESTINATION LOCATION</label>
                {isSearchingDropoff && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Searching maps...</span>}
              </div>
              <div className="phone-input-wrapper" style={{ margin: 0, position: 'relative' }}>
                <MapPin size={18} color="#09090b" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  className="phone-input"
                  style={{ fontSize: '0.925rem' }}
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  placeholder="e.g. 25 King's Road, London or Postcode"
                />
              </div>

              {/* Dropoff Suggestions Dropdown */}
              {dropoffSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  border: '1px solid #e2e8f0',
                  zIndex: 1000,
                  marginTop: '4px',
                  overflow: 'hidden'
                }}>
                  {dropoffSuggestions.map((sug, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setDropoffAddress(sug.displayName);
                        setDropoffCoords([sug.lat, sug.lng]);
                        setDropoffSuggestions([]);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderBottom: i < dropoffSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        color: '#09090b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <MapPin size={14} color="#09090b" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sug.displayName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Popular Locations & Action Chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={async () => {
                  setPickupAddress('Oxford Street, London, W1D 1BS, UK');
                  setPickupCoords([51.5154, -0.1419]);
                  setDropoffAddress('King’s Road, Chelsea, London, SW3 4ND, UK');
                  setDropoffCoords([51.4875, -0.1687]);
                }}
                style={{ background: 'var(--bg-input)', border: '1px solid #e2e8f0', color: '#09090b', padding: '6px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                🇬🇧 London Route
              </button>

              <button
                type="button"
                onClick={async () => {
                  setPickupAddress('Manchester City Centre, M1 1AE, UK');
                  setPickupCoords([53.4808, -2.2426]);
                  setDropoffAddress('MediaCityUK, Salford, M50 2EQ, UK');
                  setDropoffCoords([53.4722, -2.2985]);
                }}
                style={{ background: 'var(--bg-input)', border: '1px solid #e2e8f0', color: '#09090b', padding: '6px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                🇬🇧 Manchester Route
              </button>

              <button
                type="button"
                onClick={async () => {
                  setPickupAddress('742 Evergreen Terrace, Boston, MA');
                  setPickupCoords([42.352, -71.058]);
                  setDropoffAddress('1200 Beacon Street, Brookline, MA');
                  setDropoffCoords([42.343, -71.115]);
                }}
                style={{ background: 'var(--bg-input)', border: '1px solid #e2e8f0', color: '#09090b', padding: '6px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                🇺🇸 Boston Route
              </button>

              <button
                type="button"
                onClick={() => {
                  setHasViaStop(!hasViaStop);
                  if (!viaStopAddress) setViaStopAddress('Self Storage Center');
                }}
                style={{ background: hasViaStop ? 'var(--accent-blue-subtle)' : 'var(--bg-input)', border: hasViaStop ? '1px solid var(--accent-blue-border)' : '1px solid #e2e8f0', color: hasViaStop ? 'var(--accent-blue)' : '#09090b', padding: '6px 10px', borderRadius: '10px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={12} /> {hasViaStop ? 'Intermediate Stop' : '+ Stop'}
              </button>
            </div>
          </div>

          {/* Schedule Move Window with Custom Exact Date */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: '#09090b', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--accent-blue)" /> Schedule Move Window
            </h4>

            {/* Date Type Selector Pills */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
              {[
                { id: 'today', label: 'Today (Immediate)' },
                { id: 'tomorrow', label: 'Tomorrow' },
                { id: 'custom', label: 'Pick Date 📅' }
              ].map((dt) => (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => setDateType(dt.id)}
                  style={{
                    background: dateType === dt.id ? '#09090b' : 'var(--bg-input)',
                    color: dateType === dt.id ? '#ffffff' : '#09090b',
                    border: 'none',
                    padding: '10px 8px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {dt.label}
                </button>
              ))}
            </div>

            {/* Exact Date Picker if custom selected */}
            {dateType === 'custom' && (
              <div style={{ marginBottom: '12px', background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid #0052ff' }}>
                <label className="input-label" style={{ color: '#0052ff', margin: '0 0 4px 0' }}>SELECT EXACT MOVE DATE</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={customExactDate}
                  onChange={(e) => setCustomExactDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem', fontWeight: 700, background: '#ffffff', color: '#09090b', boxSizing: 'border-box' }}
                />
              </div>
            )}

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

      {/* Step 2: Inventory Size, AI Photo Scanner & Custom Specialty Items */}
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
              marginBottom: scannedVisionData ? '12px' : '16px',
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
                  {scannedVisionData ? 'Scanned & Verified • Tap to Re-Scan' : 'Snap room photo to auto-detect items & weight'}
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
              <span>{scannedVisionData ? 'RE-SCAN' : 'SCAN'}</span>
              <ArrowRight size={12} />
            </div>
          </div>

          {/* Scanned Vision Verification Banner */}
          {scannedVisionData && (
            <div style={{
              background: '#eff6ff',
              border: '1.5px solid #0052ff',
              borderRadius: '16px',
              padding: '12px 14px',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(0, 82, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0052ff' }}>
                    ✓ AI VISION VERIFIED INVENTORY
                  </span>
                </div>
                <span style={{ fontSize: '0.68rem', background: '#0052ff', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  ACTIVE
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>SCANNED WEIGHT</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0052ff' }}>
                    {scannedVisionData.estWeight || (scannedVisionData.estTotalWeightLbs + ' lbs')}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>CARGO VOLUME</span>
                  <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#09090b' }}>
                    {scannedVisionData.estCuFt} cu.ft
                  </div>
                </div>
              </div>

              <span style={{ fontSize: '0.72rem', color: '#1e3a8a', fontWeight: 600 }}>
                Matched Vehicle: <strong>{selectedVehicle.name}</strong> • <strong>{helpersCount} Movers</strong> allocated.
              </span>
            </div>
          )}

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

          {/* Custom & Specialty Heavy Items */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h4 style={{ color: '#09090b', fontSize: '0.9rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={16} color="#0052ff" /> Specialty & Custom Cargo
                </h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Pianos, safes, gym equipment, pool tables, artwork
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomItemModalOpen(true)}
                style={{
                  background: 'rgba(0, 82, 255, 0.1)',
                  color: '#0052ff',
                  border: '1px solid rgba(0, 82, 255, 0.25)',
                  padding: '6px 10px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} /> Add Item
              </button>
            </div>

            {customHeavyItems.length === 0 ? (
              <div 
                onClick={() => setIsCustomItemModalOpen(true)}
                style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '12px', padding: '14px', textAlign: 'center', cursor: 'pointer' }}
              >
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  Have a piano, safe, treadmill, or specialty cargo?
                </p>
                <span style={{ fontSize: '0.75rem', color: '#0052ff', fontWeight: 800 }}>
                  + Tap to add specialty item
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customHeavyItems.map((cItem) => (
                  <div 
                    key={cItem.id} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 12px', borderRadius: '12px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{cItem.icon || '📦'}</span>
                      <div>
                        <strong style={{ fontSize: '0.85rem', color: '#09090b', display: 'block' }}>
                          {cItem.name} {cItem.qty > 1 ? `(x${cItem.qty})` : ''}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {cItem.weight} • {cItem.isFragile ? '🛡️ Fragile Care' : 'Standard'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0052ff' }}>
                        +{formatCurrencyPrice(cItem.fee * (cItem.qty || 1), userCountryCode, false)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomHeavyItems(customHeavyItems.filter(x => x.id !== cItem.id))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add-on Services */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ color: '#09090b', fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>
              Add-On Services
            </h4>

            {[
              { key: 'packing', label: 'Full Packing & Bubble Wrap Service', fee: 25 },
              { key: 'disassembly', label: 'Furniture Disassembly & Reassembly', fee: 40 },
              { key: 'fragileInsurance', label: 'Zero-Deductible Fragile Protection', fee: 20 },
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
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-blue)' }}>+{formatCurrencyPrice(addon.fee, userCountryCode, false)}</span>
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
              Tailored specifically for {moveSize} {customHeavyItems.length > 0 ? `+ ${customHeavyItems.length} specialty items` : ''}
            </p>
          </div>

          <VehicleSelector
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            helpersCount={helpersCount}
            setHelpersCount={setHelpersCount}
            countryCode={userCountryCode}
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
              <option value="Stairs (2nd Floor)">Stairs (2nd Floor) (+{formatCurrencyPrice(15, userCountryCode, false)})</option>
              <option value="Stairs (3rd Floor+)">Stairs (3rd Floor+) (+{formatCurrencyPrice(30, userCountryCode, false)})</option>
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
                <span>{getEffectiveMoveDate()} ({timeSlot})</span>
              </div>
              {customHeavyItems.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', color: '#0052ff' }}>
                  <Scale size={14} />
                  <span><strong>Specialty Items:</strong> {customHeavyItems.map(x => x.name).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Shiftly Shield™ Protection Tier Card */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1.5px solid #0052ff', padding: '16px', marginBottom: '14px', boxShadow: '0 4px 16px rgba(0, 82, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 82, 255, 0.1)', color: '#0052ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 style={{ color: '#09090b', fontWeight: 800, fontSize: '0.95rem', margin: 0 }}>
                    Shiftly Shield™
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>
                    {shieldConfig.name}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsShieldModalOpen(true)}
                style={{
                  background: 'rgba(0, 82, 255, 0.08)',
                  color: '#0052ff',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Change Tier →
              </button>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px', fontSize: '0.75rem', color: '#334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Coverage Limit:</span>
                <strong style={{ color: '#09090b' }}>{formatCurrencyPrice(shieldConfig.coverageLimitUsd, userCountryCode, false)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Deductible:</span>
                <strong style={{ color: '#16a34a' }}>{shieldConfig.deductibleUsd === 0 ? '$0 Zero Deductible' : '$250 Deductible'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Claim Resolution:</span>
                <strong style={{ color: '#0052ff' }}>{shieldConfig.resolutionTime}</strong>
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

          {/* Fare Itemized Breakdown */}
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid var(--border-subtle)', padding: '16px', marginBottom: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ color: '#09090b', fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px' }}>
              Itemized Fare Breakdown
            </h4>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Base Rate ({selectedVehicle.name})</span>
              <span style={{ color: '#09090b', fontWeight: 600 }}>{formatCurrencyPrice(baseFare, userCountryCode)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Distance ({calculatedDistance} mi)</span>
              <span style={{ color: '#09090b', fontWeight: 600 }}>{formatCurrencyPrice(mileageFare, userCountryCode)}</span>
            </div>

            {hasViaStop && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>Intermediate Stop Fee</span>
                <span style={{ color: '#09090b', fontWeight: 600 }}>+{formatCurrencyPrice(25, userCountryCode)}</span>
              </div>
            )}

            {stairsFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>Stair Handling ({accessType})</span>
                <span style={{ color: '#09090b', fontWeight: 600 }}>+{formatCurrencyPrice(stairsFee, userCountryCode)}</span>
              </div>
            )}

            {extraMoverFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>Movers Crew ({helpersCount} movers)</span>
                <span style={{ color: '#09090b', fontWeight: 600 }}>{formatCurrencyPrice(extraMoverFee, userCountryCode)}</span>
              </div>
            )}

            {customItemsTotalFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#0052ff', fontWeight: 700, marginBottom: '8px' }}>
                <span>Specialty Cargo Handling ({customHeavyItems.length} items)</span>
                <span>+{formatCurrencyPrice(customItemsTotalFee, userCountryCode)}</span>
              </div>
            )}

            {/* Shiftly Shield Protection Plan Breakdown Item */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#0052ff', fontWeight: 700, marginBottom: '8px' }}>
              <span>Shiftly Shield™ ({shieldConfig.name.split(' ')[2] || 'Protection'})</span>
              <span>{shieldFee === 0 ? 'FREE (Included)' : `+${formatCurrencyPrice(shieldFee, userCountryCode)}`}</span>
            </div>

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--accent-blue)', fontWeight: 800, marginBottom: '8px' }}>
                <span>Promo Discount (SHIFTLY50)</span>
                <span>-{formatCurrencyPrice(discountAmount, userCountryCode)}</span>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1rem', color: '#09090b', fontFamily: 'var(--font-heading)' }}>Grand Total</strong>
                <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>All Taxes & Shiftly Shield Included</p>
              </div>
              <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em' }}>
                {formatCurrencyPrice(grandTotal, userCountryCode)}
              </span>
            </div>
          </div>

          <button className="btn-blue" onClick={handleConfirm}>
            Proceed to Payment ({formatCurrencyPrice(grandTotal, userCountryCode)}) →
          </button>
        </div>
      )}

      {isAIScannerOpen && (
        <AIItemScannerModal
          onSelectInventory={handleAIScanResult}
          onClose={() => setIsAIScannerOpen(false)}
        />
      )}

      {isCustomItemModalOpen && (
        <CustomHeavyItemModal
          countryCode={userCountryCode}
          onAddItem={handleAddCustomHeavyItem}
          onClose={() => setIsCustomItemModalOpen(false)}
        />
      )}

      {isShieldModalOpen && (
        <ShiftlyShieldModal
          selectedTier={selectedShieldTier}
          onSelectTier={(tierId) => setSelectedShieldTier(tierId)}
          onClose={() => setIsShieldModalOpen(false)}
          countryCode={userCountryCode}
        />
      )}

      {isCheckoutOpen && (
        <CheckoutModal
          bookingSummary={{
            pickup: pickupAddress,
            dropoff: dropoffAddress,
            vehicleTier: selectedVehicle,
            totalPrice: grandTotal,
            date: getEffectiveMoveDate(),
            countryCode: userCountryCode,
            shieldTier: selectedShieldTier,
            shieldDetails: shieldConfig
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </div>
  );
}


