import React, { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, Phone, Mail, CreditCard, 
  LogOut, ChevronRight, Sparkles, HelpCircle, FileText, 
  Lock, Globe, CheckCircle2, RotateCcw, Award, Bell,
  Camera, Upload, Trash2, Image, X, Check, Edit2, Link2, Plus, CheckCircle
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';
import TermsOfServiceModal from './TermsOfServiceModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { triggerHaptic, captureLivePhoto } from '../utils/nativeBridge';

const AVATAR_PRESETS = [
  { id: 'p1', name: 'Sarah', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80' },
  { id: 'p2', name: 'David', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80' },
  { id: 'p3', name: 'Maya', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80' },
  { id: 'p4', name: 'Alex', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80' },
  { id: 'p5', name: 'Chloe', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80' },
  { id: 'p6', name: 'Marcus', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=240&auto=format&fit=crop&q=80' }
];

export default function AccountScreen({ authUser, onLogout, onNavigateToTab, onUpdateUser }) {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [uploadToast, setUploadToast] = useState(null);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);

  // Synchronous, reactive state for profile picture
  const [currentPhoto, setCurrentPhoto] = useState(() => {
    try {
      return authUser?.photoUrl || localStorage.getItem('shiftly_user_profile_photo') || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (authUser?.photoUrl) {
      setCurrentPhoto(authUser.photoUrl);
    }
  }, [authUser?.photoUrl]);

  const displayUser = authUser?.recipient || (authUser?.isGuest ? 'Guest User' : 'Sarah Jenkins');
  const userPhone = authUser?.phone || '+44 7911 123456';
  const userEmail = authUser?.email || 'sarah.jenkins@example.com';
  const userCountry = authUser?.countryName || 'United Kingdom';
  const userCountryCode = authUser?.countryCode || '+44';

  const handleConfirmLogout = () => {
    triggerHaptic('medium');
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  const applyPhotoChange = (photoUrl) => {
    triggerHaptic('success');
    setCurrentPhoto(photoUrl);

    try {
      if (photoUrl) {
        localStorage.setItem('shiftly_user_profile_photo', photoUrl);
      } else {
        localStorage.removeItem('shiftly_user_profile_photo');
      }
    } catch (e) {
      console.warn('Storage write error:', e);
    }

    const updatedUser = {
      ...(authUser || { recipient: displayUser, phone: userPhone, email: userEmail, countryName: userCountry, countryCode: userCountryCode }),
      photoUrl: photoUrl
    };

    try {
      localStorage.setItem('shiftly_auth_user', JSON.stringify(updatedUser));
    } catch (e) {}

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    setIsPhotoModalOpen(false);
    setIsUrlMode(false);
    setCustomUrlInput('');
    setUploadToast(photoUrl ? 'Profile photo updated! ✓' : 'Profile photo removed');
    setTimeout(() => setUploadToast(null), 3500);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      if (rawDataUrl) {
        // Immediate UI update
        applyPhotoChange(rawDataUrl);

        // Async canvas compression
        try {
          const img = new window.Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const size = Math.min(img.width, img.height);
              const targetSize = Math.min(size, 360);
              canvas.width = targetSize;
              canvas.height = targetSize;
              const ctx = canvas.getContext('2d');
              const sx = (img.width - size) / 2;
              const sy = (img.height - size) / 2;
              ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize);
              const compressed = canvas.toDataURL('image/jpeg', 0.85);
              if (compressed && compressed.length < rawDataUrl.length) {
                try {
                  localStorage.setItem('shiftly_user_profile_photo', compressed);
                  const updated = { ...authUser, photoUrl: compressed };
                  localStorage.setItem('shiftly_auth_user', JSON.stringify(updated));
                } catch (err) {}
              }
            } catch (err) {}
          };
          img.src = rawDataUrl;
        } catch (err) {}
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleNativeCamera = async () => {
    try {
      const photoPath = await captureLivePhoto();
      if (photoPath) {
        applyPhotoChange(photoPath);
      }
    } catch (e) {
      console.warn('Native camera capture error:', e);
    }
  };

  const handleApplyUrl = (e) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    applyPhotoChange(customUrlInput.trim());
  };

  return (
    <div className="account-screen" style={{ padding: '20px 18px 90px 18px', background: '#ffffff', minHeight: '100%', boxSizing: 'border-box' }}>
      
      {/* Toast Notification */}
      {uploadToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999999,
          background: '#09090b',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '24px',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
          animation: 'fadeIn 0.2s ease',
          whiteSpace: 'nowrap'
        }}>
          <CheckCircle2 size={18} color="#22c55e" />
          <span>{uploadToast}</span>
        </div>
      )}

      {/* Account Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: '#09090b', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            Account
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#71717a', margin: '2px 0 0 0' }}>
            Profile, security & session preferences
          </p>
        </div>
      </div>

      {/* Profile Card with Direct Interactive Overlay */}
      <div style={{ 
        background: '#f8fafc', 
        borderRadius: '22px', 
        border: '1px solid #e2e8f0', 
        padding: '18px', 
        marginBottom: '18px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        position: 'relative'
      }}>
        {/* Direct Clickable Avatar Box */}
        <div style={{ position: 'relative', flexShrink: 0, width: '70px', height: '70px' }}>
          {currentPhoto ? (
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2.5px solid #0052ff',
              boxShadow: '0 4px 14px rgba(0, 82, 255, 0.25)',
              position: 'relative',
              background: '#e2e8f0'
            }}>
              <img 
                src={currentPhoto} 
                alt={displayUser} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0052ff 0%, #0037b3 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 900,
              boxShadow: '0 4px 14px rgba(0, 82, 255, 0.25)'
            }}>
              {displayUser.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Camera Edit Badge */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: '#0052ff',
            color: '#ffffff',
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            pointerEvents: 'none'
          }}>
            <Camera size={13} />
          </div>

          {/* Direct File Input Overlay */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            title="Upload profile picture"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              zIndex: 10
            }}
          />
        </div>

        {/* User Info & Photo Action Buttons */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09090b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayUser}
            </h3>
            <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#0052ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
              VERIFIED
            </span>
          </div>

          <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
            {userCountry} ({userCountryCode})
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            {/* Direct Upload Button with Native Overlay */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                type="button"
                style={{
                  background: '#0052ff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(0, 82, 255, 0.25)',
                  cursor: 'pointer',
                  pointerEvents: 'none'
                }}
              >
                <Upload size={13} />
                <span>{currentPhoto ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                title="Select photo from device"
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              />
            </div>

            {/* Open Preset Avatars & More Modal */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsPhotoModalOpen(true);
              }}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={13} color="#0052ff" />
              <span>Avatars & Links</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Avatar Row */}
      <div style={{ background: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ⚡ Instant Avatar Presets
          </span>
          <span style={{ fontSize: '0.7rem', color: '#0052ff', fontWeight: 700 }}>Tap to Select</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = currentPhoto === preset.url;
            return (
              <div 
                key={preset.id}
                onClick={() => applyPhotoChange(preset.url)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: isSelected ? '2.5px solid #0052ff' : '1.5px solid #cbd5e1',
                  boxShadow: isSelected ? '0 0 0 2px rgba(0,82,255,0.3)' : 'none',
                  position: 'relative'
                }}>
                  <img 
                    src={preset.url} 
                    alt={preset.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0, 82, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={16} color="#ffffff" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0052ff' : '#64748b' }}>
                  {preset.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Info Details */}
      <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '18px' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={16} color="#0052ff" />
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Registered Phone</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b' }}>{userPhone}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>✓ Verified</span>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={16} color="#0052ff" />
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Email Address</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b' }}>{userEmail}</span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>✓ Synced</span>
        </div>

        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={16} color="#0052ff" />
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Preferred Region</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#09090b' }}>{userCountry} ({userCountryCode})</span>
            </div>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>Auto-Detect</span>
        </div>
      </div>

      {/* Shiftly Protection & Perks */}
      <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#0052ff" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>
              Shiftly Shield™ Protection
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', background: 'rgba(0, 82, 255, 0.1)', color: '#0052ff', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
            Active
          </span>
        </div>
        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
          All your scheduled moves include full replacement value protection and rapid claim resolution.
        </p>
      </div>

      {/* Legal & App Info */}
      <div style={{ background: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '22px' }}>
        <button
          type="button"
          onClick={() => setIsTermsOpen(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={16} color="#64748b" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09090b' }}>Terms of Service</span>
          </div>
          <ChevronRight size={16} color="#94a3b8" />
        </button>

        <button
          type="button"
          onClick={() => setIsPrivacyOpen(true)}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={16} color="#64748b" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#09090b' }}>Privacy Policy</span>
          </div>
          <ChevronRight size={16} color="#94a3b8" />
        </button>
      </div>

      {/* Big Prominent Logout Button */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('medium');
          setShowLogoutConfirm(true);
        }}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          border: '1.5px solid #ef4444',
          background: '#fef2f2',
          color: '#ef4444',
          fontSize: '0.95rem',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
          transition: 'all 0.15s ease'
        }}
      >
        <LogOut size={18} />
        <span>Log Out / Switch Account</span>
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#a1a1aa', marginTop: '14px' }}>
        Shiftly App v2.4.0 • Build 2026.10
      </p>

      {/* Profile Photo Customizer Modal */}
      {isPhotoModalOpen && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 0
          }}
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '430px',
              background: '#ffffff',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              padding: '24px 20px 34px 20px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxSizing: 'border-box',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', margin: 0 }}>
                  Profile Picture
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#71717a', margin: '3px 0 0 0' }}>
                  Upload from device, take photo, or choose an avatar
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f4f4f5',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} color="#71717a" />
              </button>
            </div>

            {/* Current Preview */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                {currentPhoto ? (
                  <img 
                    src={currentPhoto} 
                    alt="Current Avatar" 
                    style={{
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #0052ff',
                      boxShadow: '0 6px 20px rgba(0, 82, 255, 0.25)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0052ff 0%, #0037b3 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 900,
                    boxShadow: '0 6px 20px rgba(0, 82, 255, 0.25)'
                  }}>
                    {displayUser.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Action Grid: Upload / Camera / URL / Remove */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {/* Device Upload Direct Overlay */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '14px 10px',
                    borderRadius: '16px',
                    background: '#0052ff',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(0, 82, 255, 0.3)',
                    cursor: 'pointer',
                    pointerEvents: 'none'
                  }}
                >
                  <Upload size={16} />
                  <span>Upload Photo</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  title="Select photo from device"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                />
              </div>

              {/* Camera Capture Direct Overlay */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={handleNativeCamera}
                  style={{
                    width: '100%',
                    padding: '14px 10px',
                    borderRadius: '16px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={16} color="#0052ff" />
                  <span>Take Photo</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileInput}
                  title="Take photo"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                />
              </div>
            </div>

            {/* Secondary Row: Paste Image URL & Remove */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setIsUrlMode(!isUrlMode)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: isUrlMode ? '#eff6ff' : '#f8fafc',
                  border: isUrlMode ? '1.5px solid #0052ff' : '1px solid #e2e8f0',
                  color: isUrlMode ? '#0052ff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Link2 size={14} />
                <span>{isUrlMode ? 'Hide Image Link' : 'Paste Image Link'}</span>
              </button>

              {currentPhoto && (
                <button
                  type="button"
                  onClick={() => applyPhotoChange(null)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#ef4444',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Optional URL Input Form */}
            {isUrlMode && (
              <form onSubmit={handleApplyUrl} style={{ marginBottom: '18px', display: 'flex', gap: '8px' }}>
                <input 
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!customUrlInput.trim()}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    background: customUrlInput.trim() ? '#0052ff' : '#cbd5e1',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: customUrlInput.trim() ? 'pointer' : 'default'
                  }}
                >
                  Apply
                </button>
              </form>
            )}

            {/* Avatar Style Presets Gallery */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
                Or Select an Avatar Style
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = currentPhoto === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPhotoChange(preset.url)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '16px',
                        background: isSelected ? '#eff6ff' : '#f8fafc',
                        border: isSelected ? '2px solid #0052ff' : '1px solid #e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: isSelected ? '#0052ff' : '#334155', textAlign: 'center' }}>
                        {preset.name}
                      </span>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#0052ff',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Check size={12} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal Dialog */}
      {showLogoutConfirm && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '340px',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '22px 20px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              animation: 'fadeIn 0.2s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <LogOut size={22} />
            </div>

            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#09090b', margin: '0 0 6px 0' }}>
              Log Out of Shiftly?
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#71717a', margin: '0 0 18px 0' }}>
              You will return to the sign-in screen. You can log in anytime with your phone or email.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e4e4e7',
                  background: '#ffffff',
                  color: '#71717a',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {isTermsOpen && (
        <TermsOfServiceModal onClose={() => setIsTermsOpen(false)} />
      )}

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
        <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} />
      )}
    </div>
  );
}
