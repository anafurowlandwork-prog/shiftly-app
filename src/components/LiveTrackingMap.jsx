import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Phone, MessageSquare, Star, Play, Pause, ShieldCheck, Navigation } from 'lucide-react';
import DriverChatModal from './DriverChatModal';
import DriverCallModal from './DriverCallModal';
import MoverProfileModal from './MoverProfileModal';
import MoveCompletionModal from './MoveCompletionModal';

const ROUTE_POINTS = [
  [42.352, -71.058], // Pickup: Downtown Boston
  [42.353, -71.065],
  [42.351, -71.075],
  [42.348, -71.085],
  [42.346, -71.095],
  [42.345, -71.105],
  [42.343, -71.115], // Dropoff: Brookline Beacon St
];

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

  
  const [pointIndex, setPointIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStageIdx, setCurrentStageIdx] = useState(3);
  
  // Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const activeBooking = booking || {
    id: 'SHFT-849201',
    pickup: '742 Evergreen Terrace, Boston, MA',
    dropoff: '1200 Beacon Street, Brookline, MA',
    moveSize: '1-2 Bedroom Apt',
    vehicle: { name: 'Shiftly Flex', image: '/assets/truck.png' },
    helpers: 2,
    driver: {
      name: 'Marcus Vance',
      rating: '4.95 ★',
      trips: '480 moves',
      phone: '+1 (555) 382-9102',
      vehiclePlate: 'MA 7XF-992',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
    },
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([42.348, -71.085], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    // Route Polyline with Electric Blue Accent
    const polyline = L.polyline(ROUTE_POINTS, {
      color: '#0052ff',
      weight: 5,
      opacity: 0.95,
      lineCap: 'round',
    }).addTo(map);

    map.fitBounds(polyline.getBounds(), { padding: [35, 35] });

    // Pickup Icon
    const pickupIcon = L.divIcon({
      className: 'custom-pin',
      html: `<div style="background: #09090b; color: #ffffff; font-weight: 800; font-size: 10px; padding: 5px 9px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); letter-spacing: 0.02em;">PICKUP</div>`,
      iconSize: [60, 24],
    });
    L.marker(ROUTE_POINTS[0], { icon: pickupIcon }).addTo(map);

    // Dropoff Icon
    const dropoffIcon = L.divIcon({
      className: 'custom-pin',
      html: `<div style="background: #0052ff; color: #ffffff; font-weight: 800; font-size: 10px; padding: 5px 9px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,82,255,0.3); letter-spacing: 0.02em;">DESTINATION</div>`,
      iconSize: [85, 24],
    });
    L.marker(ROUTE_POINTS[ROUTE_POINTS.length - 1], { icon: dropoffIcon }).addTo(map);

    // Moving Truck Marker with Electric Blue Beacon Pulse
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

    const truckMarker = L.marker(ROUTE_POINTS[0], { icon: truckIcon }).addTo(map);
    truckMarkerRef.current = truckMarker;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPointIndex((prev) => {
        const nextIdx = (prev + 1) % ROUTE_POINTS.length;
        if (truckMarkerRef.current) {
          truckMarkerRef.current.setLatLng(ROUTE_POINTS[nextIdx]);
        }
        return nextIdx;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isPlaying]);

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
    </div>
  );
}
