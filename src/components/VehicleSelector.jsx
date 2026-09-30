import React from 'react';
import { CheckCircle2, Users, ArrowRight } from 'lucide-react';

export const VEHICLE_TIERS = [
  {
    id: 'van',
    name: 'Shiftly Mini',
    subtitle: 'Cargo Van',
    image: '/assets/van.png',
    basePrice: 45,
    perMile: 1.80,
    tag: 'FAST DISPATCH',
    capacityLbs: '1,800 lbs',
    volumeCuFt: '280 cu.ft',
    idealFor: 'Studio apartment, single room, mattress, or furniture pickup.',
    dimensions: '9ft x 5.5ft x 5.2ft',
    includedHelpers: 1,
  },
  {
    id: 'truck',
    name: 'Shiftly Flex',
    subtitle: 'Medium Box Truck',
    image: '/assets/truck.png',
    basePrice: 75,
    perMile: 2.40,
    tag: 'POPULAR CHOICE',
    capacityLbs: '4,500 lbs',
    volumeCuFt: '750 cu.ft',
    idealFor: '1-2 Bedroom apartment, full living room & bedroom sets.',
    dimensions: '16ft x 7.5ft x 7.0ft',
    includedHelpers: 2,
  },
  {
    id: 'heavy',
    name: 'Shiftly Heavy',
    subtitle: '26ft Commercial Truck',
    image: '/assets/heavy.png',
    basePrice: 120,
    perMile: 3.10,
    tag: 'HEAVY HAUL',
    capacityLbs: '9,000 lbs',
    volumeCuFt: '1,400 cu.ft',
    idealFor: '3-4 Bedroom house, office relocation, heavy pianos & appliances.',
    dimensions: '26ft x 8.0ft x 8.2ft',
    includedHelpers: 3,
  },
];

export default function VehicleSelector({ selectedVehicle, setSelectedVehicle, helpersCount, setHelpersCount, calculatedDistance = 14 }) {
  return (
    <div style={{ marginTop: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: '#09090b', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Choose Moving Vehicle
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Transparent pricing based on estimated distance
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', background: 'var(--accent-blue-subtle)', border: '1px solid var(--accent-blue-border)', padding: '5px 12px', borderRadius: '12px', fontWeight: 700 }}>
          ~{calculatedDistance} miles
        </span>
      </div>

      {VEHICLE_TIERS.map((v) => {
        const isSelected = selectedVehicle.id === v.id;
        const estimatedTotal = (v.basePrice + (v.perMile * calculatedDistance) + (helpersCount > 1 ? (helpersCount - 1) * 35 : 0)).toFixed(2);

        return (
          <div
            key={v.id}
            className={`vehicle-card ${isSelected ? 'selected' : ''}`}
            onClick={() => setSelectedVehicle(v)}
          >
            <span className="vehicle-tag-blue">{v.tag}</span>

            <div className="vehicle-img-wrapper">
              <img src={v.image} alt={v.name} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: '#09090b', fontWeight: 800 }}>
                    {v.name}
                  </h4>
                  {isSelected && <CheckCircle2 size={18} color="var(--accent-blue)" />}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {v.subtitle}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em' }}>
                  ${estimatedTotal}
                </span>
                <p style={{ fontSize: '0.675rem', color: 'var(--text-secondary)' }}>
                  Estimated Total
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
              {v.idealFor}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '12px', fontSize: '0.725rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Payload</span>
                <strong style={{ color: '#09090b', fontSize: '0.8rem' }}>{v.capacityLbs}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Volume</span>
                <strong style={{ color: '#09090b', fontSize: '0.8rem' }}>{v.volumeCuFt}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Base Rate</span>
                <strong style={{ color: '#09090b', fontSize: '0.8rem' }}>${v.basePrice}</strong>
              </div>
            </div>
          </div>
        );
      })}

      {/* Helper Mover Count Selector */}
      <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid var(--border-subtle)', padding: '16px', marginTop: '14px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', color: '#09090b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} color="var(--accent-blue)" /> Mover Crew Size
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Professional uniformed movers included
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '12px' }}>
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setHelpersCount(num)}
                style={{
                  background: helpersCount === num ? '#09090b' : 'transparent',
                  color: helpersCount === num ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {num} {num === 1 ? 'Mover' : 'Movers'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
