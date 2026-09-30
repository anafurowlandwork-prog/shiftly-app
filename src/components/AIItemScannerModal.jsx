import React, { useState } from 'react';
import { Camera, Sparkles, Check, X, Box, ArrowRight, Upload, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

export default function AIItemScannerModal({ onSelectInventory, onClose }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedResult, setDetectedResult] = useState(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState(null);

  const sampleRooms = [
    {
      id: 'living',
      name: 'Living Room',
      icon: '🛋️',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
      estCuFt: 340,
      estWeight: '1,250 lbs',
      recommendedTier: 'Shiftly Flex',
      boundingBoxes: [
        { label: '3-Seater Couch', conf: '99%', top: '45%', left: '20%', width: '45%', height: '35%' },
        { label: 'OLED TV (65")', conf: '97%', top: '15%', left: '68%', width: '25%', height: '30%' },
        { label: 'Coffee Table', conf: '94%', top: '65%', left: '35%', width: '28%', height: '22%' },
      ],
      items: ['3-Seater Sofa / Couch', 'Large Flat Screen TV (55"+)', 'Dining Table & Chairs', '12 Moving Boxes'],
      itemCounts: { sofa: 1, tv: 1, diningSet: 1, queenBed: 0, movingBoxes: 12 }
    },
    {
      id: 'bedroom',
      name: 'Master Bedroom',
      icon: '🛏️',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80',
      estCuFt: 280,
      estWeight: '980 lbs',
      recommendedTier: 'Shiftly Flex',
      boundingBoxes: [
        { label: 'Queen Bed & Frame', conf: '98%', top: '35%', left: '25%', width: '50%', height: '45%' },
        { label: 'Dresser / Nightstand', conf: '95%', top: '50%', left: '5%', width: '20%', height: '35%' },
      ],
      items: ['Queen / King Mattress & Frame', 'Dresser & Mirror', '2 Nightstands', '8 Moving Boxes'],
      itemCounts: { sofa: 0, tv: 1, diningSet: 0, queenBed: 1, movingBoxes: 8 }
    },
    {
      id: 'office',
      name: 'Home Office & Studio',
      icon: '🖥️',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
      estCuFt: 160,
      estWeight: '550 lbs',
      recommendedTier: 'Shiftly Mini',
      boundingBoxes: [
        { label: 'Ergonomic Desk', conf: '98%', top: '40%', left: '30%', width: '40%', height: '35%' },
        { label: 'Monitors & PC', conf: '96%', top: '25%', left: '42%', width: '22%', height: '20%' },
      ],
      items: ['Standing Desk', 'Ergonomic Chair', 'Bookcase', '6 Moving Boxes'],
      itemCounts: { sofa: 0, tv: 1, diningSet: 0, queenBed: 0, movingBoxes: 6 }
    },
  ];

  const handleScanRoom = (room) => {
    setSelectedRoom(room);
    setIsScanning(true);
    setDetectedResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setDetectedResult(room);
    }, 1300);
  };

  const handleUploadSim = () => {
    // Pick the first sample room with simulated uploaded photo
    const room = sampleRooms[0];
    setSelectedRoom(room);
    setCustomPhotoUrl(room.image);
    setIsScanning(true);
    setDetectedResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setDetectedResult(room);
    }, 1400);
  };

  const handleApplyDetected = () => {
    if (detectedResult) {
      onSelectInventory(detectedResult);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <Sparkles size={18} color="#0052ff" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                Shiftly Vision AI™
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Neural Room Scanner & Volume Estimator
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ background: '#f4f4f5' }}>
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
          Take a photo or choose a room. Vision AI automatically detects furniture, calculates exact cubic feet, and picks the right truck.
        </p>

        {/* Camera / Upload Action Bar */}
        {!detectedResult && !isScanning && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              border: '2px dashed #0052ff',
              background: '#eff6ff',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              marginBottom: '16px'
            }} onClick={handleUploadSim}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#0052ff',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px auto'
              }}>
                <Camera size={22} />
              </div>
              <strong style={{ fontSize: '0.9rem', color: '#09090b', display: 'block' }}>
                Take Room Photo or Upload
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#0052ff', fontWeight: 700 }}>
                Instant AI Recognition (99.4% Accuracy)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Or Select Sample Room Photo
              </span>
              <div style={{ flex: 1, height: '1px', background: '#e4e4e7' }}></div>
            </div>

            {/* Sample Rooms Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sampleRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => handleScanRoom(room)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '14px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={room.image}
                      alt={room.name}
                      style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#09090b', display: 'block' }}>
                        {room.icon} {room.name}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ~{room.estCuFt} cu.ft • {room.items.length} items detected
                      </span>
                    </div>
                  </div>

                  <button
                    style={{
                      background: '#09090b',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    AI Scan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyzing / Scanning State */}
        {isScanning && (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              boxShadow: '0 0 0 10px rgba(0, 82, 255, 0.15)'
            }}>
              <Sparkles size={32} color="#0052ff" className="spin-anim" />
            </div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: '#09090b', margin: '0 0 6px 0' }}>
              Vision AI Analyzing Room...
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Segmenting furniture, calculating cubic volume & matching truck fleet
            </p>
          </div>
        )}

        {/* Detected Results View with Bounding Box Overlay */}
        {detectedResult && !isScanning && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Visual Photo with AI Bounding Boxes */}
            <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #09090b' }}>
              <img
                src={detectedResult.image}
                alt={detectedResult.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Bounding Boxes */}
              {detectedResult.boundingBoxes.map((box, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: box.top,
                    left: box.left,
                    width: box.width,
                    height: box.height,
                    border: '2px solid #0052ff',
                    background: 'rgba(0, 82, 255, 0.2)',
                    borderRadius: '6px',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}
                >
                  <span style={{
                    background: '#0052ff',
                    color: '#ffffff',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    margin: '2px',
                    whiteSpace: 'nowrap'
                  }}>
                    {box.label} {box.conf}
                  </span>
                </div>
              ))}

              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(9,9,11,0.85)',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}>
                ✓ 3D Spatial Scan Verified
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  ESTIMATED VOLUME
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#09090b', fontFamily: 'var(--font-heading)' }}>
                  {detectedResult.estCuFt} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>cu.ft</span>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  ESTIMATED WEIGHT
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0052ff', fontFamily: 'var(--font-heading)' }}>
                  {detectedResult.estWeight}
                </div>
              </div>
            </div>

            {/* Detected Items Tag List */}
            <div style={{ background: '#f4f4f5', borderRadius: '14px', padding: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#09090b', display: 'block', marginBottom: '8px' }}>
                DETECTED INVENTORY ITEMS:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {detectedResult.items.map((it, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e4e4e7',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: '#09090b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={12} color="#0052ff" /> {it}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '10px 12px', fontSize: '0.78rem', color: '#1e3a8a', lineHeight: 1.4 }}>
              💡 <strong>Recommended Tier:</strong> {detectedResult.recommendedTier} has 100% adequate cargo capacity with zero overhang.
            </div>

            <button className="btn-blue" onClick={handleApplyDetected}>
              Apply AI Scan to Inventory ({detectedResult.estCuFt} cu.ft) →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
