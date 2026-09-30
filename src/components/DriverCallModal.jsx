import React, { useState, useEffect } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Video, VideoOff } from 'lucide-react';

export default function DriverCallModal({ driver, onClose }) {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000, background: 'rgba(0, 0, 0, 0.92)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 24px 60px 24px', alignItems: 'center' }}>
        
        {/* Top Call Info */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '0.85rem', color: '#86868b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>
            Shiftly Voice Call
          </p>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#ffffff', fontWeight: 800 }}>
            {driver.name}
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#34c759', fontWeight: 600, marginTop: '4px' }}>
            {formatTime(callDuration)}
          </p>
        </div>

        {/* Driver Avatar */}
        <div style={{ position: 'relative' }}>
          <img
            src={driver.photo}
            alt={driver.name}
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #ffffff',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            }}
          />
          {isVideoOn && (
            <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#34c759', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', color: '#fff', fontWeight: 700 }}>
              HD Video On
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '40px' }}>
            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isMuted ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                color: isMuted ? '#000000' : '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* Video Button */}
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isVideoOn ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                color: isVideoOn ? '#000000' : '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isSpeaker ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                color: isSpeaker ? '#000000' : '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isSpeaker ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
          </div>

          {/* End Call Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: '#ff3b30',
              color: '#ffffff',
              padding: '18px',
              borderRadius: '30px',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(255, 59, 48, 0.4)',
            }}
          >
            <PhoneOff size={22} /> End Call
          </button>
        </div>

      </div>
    </div>
  );
}
