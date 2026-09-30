import React, { useState } from 'react';
import { MapPin, Navigation, Clock, CheckCircle2, ChevronRight, X, Receipt, ShieldCheck, Truck, ArrowRight, RotateCcw } from 'lucide-react';

export default function BookingsList({ bookings, onTrackBooking, onNewBooking }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const sampleBookings = [
    {
      id: 'SHFT-849201',
      pickup: '742 Evergreen Terrace, Boston, MA',
      dropoff: '1200 Beacon Street, Brookline, MA',
      viaStop: '14 Public Storage Way, Cambridge, MA',
      date: 'Today (Immediate Dispatch)',
      time: 'ASAP (~30 mins)',
      moveSize: '1-2 Bedroom Apt',
      vehicle: { name: 'Shiftly Flex', image: '/assets/truck.png' },
      helpers: 2,
      total: '183.80',
      status: 'IN_TRANSIT',
      paymentMethod: 'Apple Pay',
      items: '1 Sofa, 1 King Bed, 1 TV, 12 Boxes',
      driver: {
        name: 'Marcus Vance',
        rating: '4.95 ★',
        trips: '480+ moves',
        phone: '+1 (555) 382-9102',
        vehiclePlate: 'MA 7XF-992',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80',
      },
      createdAt: '10:12 AM'
    },
    {
      id: 'SHFT-109432',
      pickup: '45 Harvard Ave, Cambridge, MA',
      dropoff: '88 Commonwealth Ave, Boston, MA',
      viaStop: null,
      date: 'Sep 12, 2026',
      time: '10:00 AM',
      moveSize: 'Studio Apt',
      vehicle: { name: 'Shiftly Mini', image: '/assets/van.png' },
      helpers: 1,
      total: '89.50',
      status: 'COMPLETED',
      paymentMethod: 'Visa •••• 4921',
      items: '1 Desk, 1 Queen Bed, 8 Boxes',
      driver: {
        name: 'David Rossi',
        rating: '4.98 ★',
        trips: '610+ moves',
        phone: '+1 (555) 912-3847',
        vehiclePlate: 'MA 3B-781',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      },
      createdAt: 'Sep 12, 2026'
    },
  ];

  const allBookings = bookings && bookings.length > 0 ? bookings : sampleBookings;

  const filteredBookings = allBookings.filter((b) => {
    if (filter === 'ACTIVE') return b.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div style={{ padding: '18px 18px 90px 18px', width: '100%', background: '#ffffff' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.55rem', color: '#09090b', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            My Moves
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            {allBookings.length} total orders & verified receipts
          </p>
        </div>

        <button
          onClick={onNewBooking}
          style={{
            background: '#09090b',
            color: '#ffffff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>+ Book Move</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#f4f4f5', padding: '3px', borderRadius: '12px' }}>
        {[
          { key: 'ALL', label: 'All Moves' },
          { key: 'ACTIVE', label: 'Active (Live)' },
          { key: 'COMPLETED', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: '9px',
              border: 'none',
              background: filter === tab.key ? '#ffffff' : 'transparent',
              color: filter === tab.key ? '#09090b' : '#71717a',
              fontWeight: filter === tab.key ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: filter === tab.key ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredBookings.map((trip) => {
          const isActive = trip.status !== 'COMPLETED';

          return (
            <div
              key={trip.id}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '18px',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#09090b', fontFamily: 'monospace' }}>
                  #{trip.id}
                </span>

                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: '999px',
                    background: isActive ? 'var(--accent-blue-subtle)' : 'var(--bg-input)',
                    border: isActive ? '1px solid var(--accent-blue-border)' : '1px solid var(--border-subtle)',
                    color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    letterSpacing: '0.02em'
                  }}
                >
                  {isActive ? '● IN TRANSIT' : '✓ COMPLETED'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                <img
                  src={trip.vehicle?.image || '/assets/truck.png'}
                  alt={trip.vehicle?.name || 'Shiftly Vehicle'}
                  style={{ width: '68px', height: '52px', borderRadius: '10px', objectFit: 'cover', background: '#f4f4f5' }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#09090b', fontWeight: 800, fontSize: '0.92rem', margin: '0 0 2px 0' }}>
                    {trip.vehicle?.name || 'Shiftly Flex'}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 2px 0' }}>
                    {trip.helpers || 2} Movers • {trip.moveSize || '1-2 Bedroom'}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: '#71717a', margin: 0 }}>
                    {trip.date} ({trip.time})
                  </p>
                </div>
              </div>

              {/* Route Summary */}
              <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '12px', fontSize: '0.76rem', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="var(--accent-blue)" />
                  <span style={{ color: '#09090b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {trip.pickup}
                  </span>
                </div>
                {trip.viaStop && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.65rem', background: '#09090b', color: '#fff', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>STOP</span>
                    <span style={{ color: '#52525b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {trip.viaStop}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={13} color="#09090b" />
                  <span style={{ color: '#09090b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {trip.dropoff}
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Total Paid</span>
                  <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: '#09090b', fontWeight: 900, margin: 0 }}>
                    ${trip.total}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setSelectedReceipt(trip)}
                    style={{
                      background: 'var(--bg-input)',
                      color: '#09090b',
                      border: '1px solid var(--border-subtle)',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Receipt
                  </button>

                  {isActive ? (
                    <button
                      className="btn-blue"
                      onClick={() => onTrackBooking(trip)}
                      style={{ width: 'auto', padding: '8px 14px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Navigation size={13} />
                      <span>Live Track</span>
                    </button>
                  ) : (
                    <button
                      onClick={onNewBooking}
                      style={{
                        background: '#09090b',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>Book Again</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Itemized Receipt Modal */}
      {selectedReceipt && (
        <div className="modal-backdrop">
          <div className="modal-sheet" style={{ maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <Receipt size={18} color="#0052ff" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Move Receipt #{selectedReceipt.id}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Paid via {selectedReceipt.paymentMethod || 'Apple Pay'}
                  </p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedReceipt(null)} style={{ background: '#f4f4f5' }}>
                <X size={18} />
              </button>
            </div>

            {/* Receipt Summary Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Vehicle Tier</span>
                <span style={{ fontWeight: 700, color: '#09090b' }}>{selectedReceipt.vehicle?.name || 'Shiftly Flex'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Moving Helpers</span>
                <span style={{ fontWeight: 700, color: '#09090b' }}>{selectedReceipt.helpers || 2} Pro Movers</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Shiftly $50k Guarantee</span>
                <span style={{ fontWeight: 800, color: '#0052ff' }}>Active (Zero Deductible)</span>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#09090b' }}>Total Paid</span>
                <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#09090b' }}>${selectedReceipt.total}</span>
              </div>
            </div>

            {/* Lead Mover Verification Card */}
            <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '14px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img
                src={selectedReceipt.driver?.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80'}
                alt="driver"
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#09090b' }}>{selectedReceipt.driver?.name || 'Marcus Vance'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lead Mover • ★ {selectedReceipt.driver?.rating || '4.95'}</div>
              </div>
              <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#0052ff', padding: '4px 8px', borderRadius: '6px', fontWeight: 800 }}>
                VERIFIED
              </span>
            </div>

            <button className="btn-black" onClick={() => setSelectedReceipt(null)}>
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
