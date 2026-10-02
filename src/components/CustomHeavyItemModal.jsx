import React, { useState } from 'react';
import { X, Plus, ShieldAlert, Sparkles, Check, Scale } from 'lucide-react';
import { formatCurrencyPrice } from '../utils/currencyUtils';

const SPECIALTY_PRESETS = [
  {
    id: 'piano',
    name: 'Upright / Grand Piano',
    icon: '🎹',
    estWeight: '500 lbs',
    estCuFt: 120,
    fee: 65,
    note: 'Requires 3 movers & heavy-duty straps'
  },
  {
    id: 'treadmill',
    name: 'Home Gym Treadmill / Peloton',
    icon: '🏋️',
    estWeight: '220 lbs',
    estCuFt: 45,
    fee: 30,
    note: 'Fragile console & motor protection'
  },
  {
    id: 'safe',
    name: 'Security / Fireproof Safe',
    icon: '🔒',
    estWeight: '380 lbs',
    estCuFt: 30,
    fee: 45,
    note: 'Reinforced ground floor ramp loading'
  },
  {
    id: 'pool_table',
    name: 'Pool / Billiard Table',
    icon: '🎱',
    estWeight: '750 lbs',
    estCuFt: 90,
    fee: 80,
    note: 'Slate bed disassembly & blanket wrapping'
  },
  {
    id: 'motorcycle',
    name: 'Motorcycle / Electric Scooter',
    icon: '🏍️',
    estWeight: '320 lbs',
    estCuFt: 60,
    fee: 40,
    note: 'Chock and tie-down securement'
  },
  {
    id: 'artwork',
    name: 'Large Mirror / Framed Fine Art',
    icon: '🎨',
    estWeight: '60 lbs',
    estCuFt: 25,
    fee: 25,
    note: 'Custom wooden crate & bubble protection'
  }
];

export default function CustomHeavyItemModal({ onAddItem, onClose, countryCode = '+44' }) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customWeight, setCustomWeight] = useState('Heavy (150–300 lbs)');
  const [customQty, setCustomQty] = useState(1);
  const [isFragile, setIsFragile] = useState(true);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCustomName(preset.name);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalName = customName.trim() || selectedPreset?.name || 'Custom Heavy Cargo Item';
    const finalFee = selectedPreset?.fee || 35;
    
    onAddItem({
      id: 'item_' + Date.now(),
      name: finalName,
      icon: selectedPreset?.icon || '📦',
      weight: selectedPreset?.estWeight || customWeight,
      qty: customQty,
      fee: finalFee,
      isFragile: isFragile
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Scale size={18} color="#0052ff" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Add Heavy & Specialty Item
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Pianos, safes, gym equipment, or custom cargo
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ background: '#f4f4f5' }}>
            <X size={18} />
          </button>
        </div>

        {/* Popular Specialty Item Presets */}
        <div style={{ marginBottom: '16px' }}>
          <label className="input-label" style={{ marginBottom: '8px', display: 'block' }}>
            POPULAR SPECIALTY PRESETS
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {SPECIALTY_PRESETS.map((preset) => {
              const isChosen = selectedPreset?.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: isChosen ? '2px solid #0052ff' : '1px solid #e4e4e7',
                    background: isChosen ? 'rgba(0, 82, 255, 0.05)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{preset.icon}</span>
                    <strong style={{ fontSize: '0.8rem', color: '#09090b', lineHeight: 1.2 }}>{preset.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.7rem' }}>
                    <span style={{ color: '#64748b' }}>{preset.estWeight}</span>
                    <span style={{ color: '#0052ff', fontWeight: 800 }}>+{formatCurrencyPrice(preset.fee, countryCode, false)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '12px' }}>
            <label className="input-label">ITEM NAME / DESCRIPTION</label>
            <input
              type="text"
              className="phone-input"
              style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '12px', width: '100%', fontSize: '0.9rem' }}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Yamaha Grand Piano or Antique Armoire"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label className="input-label">ESTIMATED WEIGHT</label>
              <select
                className="phone-input"
                style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', width: '100%', fontSize: '0.85rem' }}
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
              >
                <option value="Medium (100–200 lbs)">Medium (100–200 lbs)</option>
                <option value="Heavy (200–400 lbs)">Heavy (200–400 lbs)</option>
                <option value="Very Heavy (400–800 lbs)">Very Heavy (400–800 lbs)</option>
                <option value="Ultra Heavy (800+ lbs)">Ultra Heavy (800+ lbs)</option>
              </select>
            </div>

            <div>
              <label className="input-label">QUANTITY</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '42px' }}>
                <button
                  type="button"
                  onClick={() => setCustomQty(Math.max(1, customQty - 1))}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ffffff', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 800 }}
                >
                  -
                </button>
                <span style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '0.9rem' }}>{customQty}</span>
                <button
                  type="button"
                  onClick={() => setCustomQty(customQty + 1)}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#09090b', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Fragile Checkbox */}
          <div 
            onClick={() => setIsFragile(!isFragile)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0, 82, 255, 0.05)', border: '1px solid rgba(0, 82, 255, 0.2)', padding: '10px 12px', borderRadius: '12px', marginBottom: '16px', cursor: 'pointer' }}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: isFragile ? '#0052ff' : '#ffffff', border: '1px solid #0052ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isFragile && <Check size={14} color="#ffffff" />}
            </div>
            <div>
              <strong style={{ fontSize: '0.82rem', color: '#09090b', display: 'block' }}>Requires Fragile Blanket & Strap Care</strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Notifies driver team to bring padding and dollies</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#f1f5f9', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-blue"
              style={{ flex: 2, margin: 0 }}
            >
              Add Item to Move ➔
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
