import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Phone, MessageSquare, Star, Play, Pause, ShieldCheck, Navigation, MapPin, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import DriverChatModal from './DriverChatModal';
import DriverCallModal from './DriverCallModal';
import MoverProfileModal from './MoverProfileModal';
import MoveCompletionModal from './MoveCompletionModal';
import ProofOfDeliveryViewer from './ProofOfDeliveryViewer';
import { generateInterpolatedRoute, geocodeAddress, calculateDistanceMiles } from '../utils/geoUtils';

export const MOVE_STAGES = [
  { key: 'ASSIGNED', title: 'Mover Assigned', sub: 'Marcus is preparing vehicle & equipment', progress: 15 },
  { key: 'EN_ROUTE_PICKUP', title: 'Approaching Pickup', sub: 'Driver 8 mins away in Shiftly Flex', progress: 35 },
  { key: 'LOADING', title: 'Loading Cargo', sub: 'Crew carefully padding & loading items', progress: 55 },
  { key: 'IN_TRANSIT', title: 'In Transit to Destination', sub: 'Live GPS navigation tracking active', progress: 80 },
  { key: 'UNLOADING', title: 'Arrived & Unloading', sub: 'Items safely being brought inside', progress: 95 },
  { key: 'COMPLETED', title: 'Move Completed', sub: 'All items delivered and verified', progress: 100 },
];

export default function LiveTrackingMap({ 
  booking, 
  syncedDriverStatus,
  sharedMessages = [],
  onSendCustomerMessage
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const truckMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  
  const [pointIndex, setPointIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStageIdx, setCurrentStageIdx] = useState(3);
  const [isPodViewerOpen, setIsPodViewerOpen] = useState(false);
  const [dynamicRoute, setDynamicRoute] = useState([
    [51.5154, -0.1419],
    [51.5110, -0.1480],
    [51.5050, -0.1550],
    [51.4980, -0.1620],
    [51.4875, -0.1687]
  ]);
  
  // Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const activeBooking = booking || {
    id: 'SHFT-849201',
    pickup: 'Oxford Street, London, W1D 1BS',
    dropoff: 'King’s Road, Chelsea, London, SW3 4ND',
    pickupCoordinates: [51.5154, -0.1419],
    dropoffCoordinates: [51.4875, -0.1687],
    distanceMiles: 3.2,
    moveSize: '1-2 Bedroom Apt',
    vehicle: { name: 'Shiftly Flex', image: '/assets/truck.png' },
    helpers: 2,
    driver: {
      name: 'Marcus Vance',
      rating: '4.98 ★',
      trips: '480 moves',
      phone: '+44 7378 142815',
      vehiclePlate: 'LX24 XFR',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
    },
  };

  // Resolve Real Geocoded Coordinates for the Booking
  useEffect(() => {
    let isMounted = true;
    async function resolveCoordinates() {
      let start = activeBooking.pickupCoordinates;
      let end = activeBooking.dropoffCoordinates;

      if (!start && activeBooking.pickup) {
        start = await geocodeAddress(activeBooking.pickup);
      }
      if (!end && activeBooking.dropoff) {
        end = await geocodeAddress(activeBooking.dropoff);
      }

      start = start || [51.5154, -0.1419];
      end = end || [51.4875, -0.1687];

      const points = generateInterpolatedRoute(start, end, 10);
      if (isMounted) {
        setDynamicRoute(points);
        setPointIndex(0);
      }
    }

    resolveCoordinates();
    return () => { isMounted = false; };
  }, [activeBooking.pickup, activeBooking.dropoff]);

  // Leaflet Map Initialization & Dynamic Route Updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(dynamicRoute[0], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing layers
    if (polylineRef.current) map.removeLayer(polylineRef.current);
    if (pickupMarkerRef.current) map.removeLayer(pickupMarkerRef.current);
    if (dropoffMarkerRef.current) map.removeLayer(dropoffMarkerRef.current);
    if (truckMarkerRef.current) map.removeLayer(truckMarkerRef.current);

    // Dynamic Electric Blue Polyline
    polylineRef.current = L.polyline(dynamicRoute, {
      color: '#0052ff',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(map);

    try {
      map.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    } catch (e) {}

    // Pickup Marker
    const pickupIcon = L.divIcon({
      className: 'custom-pin',
      html: `<div style="background: #09090b; color: #ffffff; font-weight: 800; font-size: 10px; padding: 5px 9px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); letter-spacing: 0.02em; white-space: nowrap;">PICKUP</div>`,
      iconSize: [60, 24],
    });
    pickupMarkerRef.current = L.marker(dynamicRoute[0], { icon: pickupIcon }).addTo(map);

    // Dropoff Marker
    const dropoffIcon = L.divIcon({
      className: 'custom-pin',
      html: `<div style="background: #0052ff; color: #ffffff; font-weight: 800; font-size: 10px; padding: 5px 9px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,82,255,0.3); letter-spacing: 0.02em; white-space: nowrap;">DESTINATION</div>`,
      iconSize: [85, 24],
    });
    dropoffMarkerRef.current = L.marker(dynamicRoute[dynamicRoute.length - 1], { icon: dropoffIcon }).addTo(map);

    // Moving Truck Marker
    const truckIcon = L.divIcon({
      className: 'truck-marker-wrapper',
      html: `
        <div style="background: #0052ff; width: 38px; height: 38px; border-radius: 50%; border: 3.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0, 82, 255, 0.45);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    truckMarkerRef.current = L.marker(dynamicRoute[0], { icon: truckIcon }).addTo(map);

    return () => {
      // Keep map instance across renders
    };
  }, [dynamicRoute]);

  // Truck Animation Loop along Dynamic Route Points
  useEffect(() => {
    if (!isPlaying || !dynamicRoute || dynamicRoute.length === 0) return;

    const interval = setInterval(() => {
      setPointIndex((prev) => {
        const nextIdx = (prev + 1) % dynamicRoute.length;
        if (truckMarkerRef.current && dynamicRoute[nextIdx]) {
          truckMarkerRef.current.setLatLng(dynamicRoute[nextIdx]);
        }
        return nextIdx;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isPlaying, dynamicRoute]);

  const currentStage = MOVE_STAGES[currentStageIdx];

  return (
    <div style={{ padding: '16px 16px 90px 16px', background: '#ffffff', minHeight: '100%' }}>
      {/* Top Bar with Stage Selector & Live Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ● LIVE GPS TELEMETRY
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', marginTop: '2px' }}>
            Tracking Mover
          </h2>
        </div>

        {/* Demo Stage Controls */}
        <select
          value={currentStageIdx}
          onChange={(e) => setCurrentStageIdx(Number(e.target.value))}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '6px 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#09090b',
            outline: 'none',
          }}
        >
          {MOVE_STAGES.map((stg, i) => (
            <option key={stg.key} value={i}>
              Step {i + 1}: {stg.title}
            </option>
          ))}
        </select>
      </div>

      {/* Map Container */}
      <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating ETA Badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(9, 9, 11, 0.9)', backdropFilter: 'blur(10px)', color: '#ffffff', padding: '8px 14px', borderRadius: '16px', zIndex: 1000, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 700, letterSpacing: '0.05em' }}>ESTIMATED ARRIVAL</span>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', marginTop: '1px' }}>
            8 mins <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>• 1.8 miles</span>
          </div>
        </div>

        {/* Pause/Play Live Simulation */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? <Pause size={16} color="#09090b" /> : <Play size={16} color="#09090b" />}
        </button>
      </div>

      {/* Driver & Trip Status Sheet */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '16px', marginTop: '14px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {currentStage.title}
            </span>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{currentStage.sub}</p>
          </div>

          {currentStageIdx === 5 ? (
            <button
              onClick={() => setIsRatingOpen(true)}
              style={{ background: 'var(--accent-blue)', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,82,255,0.3)' }}
            >
              Rate & Tip Mover
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', background: 'var(--bg-input)', color: '#09090b', padding: '4px 10px', borderRadius: '10px', fontWeight: 700 }}>
              #{activeBooking.id}
            </span>
          )}
        </div>

        {/* Real Route Breakdown Card */}
        <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '12px 14px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0052ff', marginTop: '5px', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>PICKUP</span>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09090b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeBooking.pickup}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#09090b', marginTop: '5px', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>DESTINATION</span>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09090b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeBooking.dropoff}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Line */}
        <div style={{ width: '100%', height: '4px', background: 'var(--bg-input)', borderRadius: '4px', margin: '8px 0 12px 0', overflow: 'hidden' }}>
          <div
            style={{
              width: `${currentStage.progress}%`,
              height: '100%',
              background: 'var(--accent-blue)',
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          ></div>
        </div>

        {/* Driver Profile Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <div
            onClick={() => setIsProfileOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={activeBooking.driver.photo}
                alt={activeBooking.driver.name}
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--accent-blue)', borderRadius: '50%', padding: '2px' }}>
                <ShieldCheck size={11} color="#fff" />
              </div>
            </div>
            <div>
              <h4 style={{ color: '#09090b', fontWeight: 800, fontSize: '0.925rem' }}>{activeBooking.driver.name}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ★ {activeBooking.driver.rating} • {activeBooking.vehicle.name}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsCallOpen(true)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--bg-input)',
                border: 'none',
                color: '#09090b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <Phone size={16} />
            </button>

            <button
              onClick={() => setIsChatOpen(true)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#09090b',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <MessageSquare size={16} />
            </button>
          </div>
        </div>

        {/* Completed POD Certificate Pill */}
        {currentStage.key === 'COMPLETED' && (
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setIsPodViewerOpen(true)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #0052ff',
                background: 'rgba(0, 82, 255, 0.06)',
                color: '#0052ff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={16} /> View Certified Proof of Delivery (POD)
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isChatOpen && (
        <DriverChatModal
          driver={activeBooking.driver}
          messages={sharedMessages}
          onSendMessage={(newMsg) => {
            if (onSendCustomerMessage) onSendCustomerMessage(newMsg);
          }}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {isCallOpen && (
        <DriverCallModal
          driver={activeBooking.driver}
          onClose={() => setIsCallOpen(false)}
        />
      )}

      {isProfileOpen && (
        <MoverProfileModal
          driver={activeBooking.driver}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {isRatingOpen && (
        <MoveCompletionModal
          booking={activeBooking}
          onClose={() => setIsRatingOpen(false)}
        />
      )}

      {isPodViewerOpen && (
        <ProofOfDeliveryViewer
          podData={activeBooking.podCertificate || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('shiftly_last_pod_certificate') || 'null') : null)}
          onClose={() => setIsPodViewerOpen(false)}
        />
      )}
    </div>
  );
}

