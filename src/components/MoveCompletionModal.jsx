import React, { useState } from 'react';
import { Star, CheckCircle2, Heart, Award, Sparkles, X, ThumbsUp } from 'lucide-react';

export default function MoveCompletionModal({ booking, onClose }) {
  const [rating, setRating] = useState(5);
  const [tipAmount, setTipAmount] = useState(20);
  const [customTip, setCustomTip] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Super Fast', 'Careful Handling', '5-Star Communication']);
  const [submitted, setSubmitted] = useState(false);

  const tags = ['Super Fast', 'Careful Handling', 'Friendly Crew', 'On-Time Arrival', '5-Star Communication', 'Clean Truck'];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const finalTip = customTip ? parseFloat(customTip) || 0 : tipAmount;

  const handleFinish = () => {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-sheet" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {!submitted ? (
          <div>
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
                  <ThumbsUp size={16} color="#0052ff" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                    Rate & Tip Driver
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {booking?.driver?.name || 'Marcus Vance'} • {booking?.id || 'SHFT-849201'}
                  </p>
                </div>
              </div>
              <button className="btn-icon" onClick={onClose} style={{ background: '#f4f4f5' }}>
                <X size={18} />
              </button>
            </div>

            {/* Star Rating Selector */}
            <div style={{ textAlign: 'center', margin: '14px 0 16px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    <Star
                      size={32}
                      fill={star <= rating ? '#0052ff' : 'none'}
                      color={star <= rating ? '#0052ff' : '#cbd5e1'}
                    />
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>
                {rating === 5 ? 'Excellent 5.0 ★' : rating === 4 ? 'Great 4.0 ★' : rating === 3 ? 'Good 3.0 ★' : 'Needs Improvement'}
              </span>
            </div>

            {/* Compliment Tags */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#09090b', marginBottom: '8px' }}>
                What went well?
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tags.map((tg) => {
                  const isSelected = selectedTags.includes(tg);
                  return (
                    <button
                      key={tg}
                      type="button"
                      onClick={() => toggleTag(tg)}
                      style={{
                        background: isSelected ? '#09090b' : '#f4f4f5',
                        color: isSelected ? '#ffffff' : '#09090b',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Driver Tip */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Heart size={14} color="#0052ff" fill="#0052ff" /> Add Mover Tip (100% to crew)
                </span>
                {finalTip > 0 && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0052ff' }}>
                    +${finalTip.toFixed(2)}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {[10, 15, 20, 30].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setTipAmount(amt);
                      setCustomTip('');
                    }}
                    style={{
                      flex: 1,
                      background: tipAmount === amt && !customTip ? '#0052ff' : '#ffffff',
                      color: tipAmount === amt && !customTip ? '#ffffff' : '#09090b',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '8px 0',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Or enter custom tip ($ USD)"
                value={customTip}
                onChange={(e) => {
                  setCustomTip(e.target.value);
                  setTipAmount(0);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '0.8rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button className="btn-black" onClick={handleFinish}>
              Submit Rating & Tip {finalTip > 0 ? `($${finalTip.toFixed(2)})` : ''} →
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle2 size={32} color="#0052ff" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0' }}>
              Thank You!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Your review and {finalTip > 0 ? `$${finalTip.toFixed(2)} tip` : 'rating'} have been sent to Marcus & Crew.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
