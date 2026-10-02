import React, { useState } from 'react';
import { MapPin, Navigation, Clock, CheckCircle2, ChevronRight, X, Receipt, ShieldCheck, Truck, ArrowRight, RotateCcw, FileText } from 'lucide-react';
import ProofOfDeliveryViewer from './ProofOfDeliveryViewer';

export default function BookingsList({ bookings, onTrackBooking, onNewBooking }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedPod, setSelectedPod] = useState(null);

  const allBookings = bookings || [];

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
      {filteredBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: '20px', border: '1px dashed #cbd5e1', marginTop: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto' }}>
            <Truck size={24} color="#64748b" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 800, color: '#09090b', marginBottom: '6px' }}>
            No Moves Yet
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: '280px', margin: '0 auto 16px auto' }}>
            Enter your pickup and destination to schedule your on-demand move with live GPS tracking.
          </p>
          <button className="btn-black" onClick={onNewBooking} style={{ maxWidth: '200px', margin: '0 auto', fontSize: '0.85rem' }}>
            + Book A Move <ArrowRight size={16} />
          </button>
        </div>
      ) : (
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
                      padding: '8px 10px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Receipt
                  </button>

                  {!isActive && (
                    <button
                      onClick={() => setSelectedPod(trip.podCertificate || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('shiftly_last_pod_certificate') || 'null') : null))}
                      style={{
                        background: 'rgba(0, 82, 255, 0.08)',
                        color: '#0052ff',
                        border: '1px solid rgba(0, 82, 255, 0.25)',
                        padding: '8px 10px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="View Proof of Delivery Certificate"
                    >
                      <ShieldCheck size={13} />
                      <span>POD</span>
                    </button>
                  )}

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
      )}

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

            {/* Proof of Delivery Quick Action */}
            <button
              type="button"
              onClick={() => {
                const targetPod = selectedReceipt.podCertificate || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('shiftly_last_pod_certificate') || 'null') : null);
                setSelectedReceipt(null);
                setSelectedPod(targetPod);
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #0052ff',
                background: 'rgba(0, 82, 255, 0.08)',
                color: '#0052ff',
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
              <ShieldCheck size={16} /> View Proof of Delivery (POD) Certificate
            </button>

            <button className="btn-black" onClick={() => setSelectedReceipt(null)}>
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Proof of Delivery Viewer Modal */}
      {selectedPod && (
        <ProofOfDeliveryViewer
          podData={selectedPod}
          onClose={() => setSelectedPod(null)}
        />
      )}
    </div>
  );
}

