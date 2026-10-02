import React, { useState, useEffect, useRef } from 'react';
import { 
  User, ShieldCheck, Phone, Mail, CreditCard, 
  LogOut, ChevronRight, Sparkles, HelpCircle, FileText, 
  Lock, Globe, CheckCircle2, RotateCcw, Award, Bell,
  Camera, Upload, Trash2, X, Check, Loader2
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';
import TermsOfServiceModal from './TermsOfServiceModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { triggerHaptic } from '../utils/nativeBridge';

export default function AccountScreen({ authUser, onLogout, onNavigateToTab, onUpdateUser }) {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [uploadToast, setUploadToast] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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

    setUploadToast(photoUrl ? 'Profile photo updated! ✓' : 'Profile photo removed');
    setTimeout(() => setUploadToast(null), 3000);
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    triggerHaptic('light');

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target.result;
      if (!rawDataUrl) {
        setIsUploading(false);
        return;
      }

      // Pre-compress using HTML5 Canvas down to high-res 400x400 (under 40KB)
      // to avoid exceeding mobile browser localStorage quotas
      const img = new window.Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          const targetSize = Math.min(size, 400);
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          
          // Center crop square
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize);
          
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          applyPhotoChange(compressed);
        } catch (err) {
          // Fallback to raw if canvas fails
          applyPhotoChange(rawDataUrl);
        } finally {
          setIsUploading(false);
        }
      };
      img.onerror = () => {
        setIsUploading(false);
        applyPhotoChange(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerUpload = () => {
    triggerHaptic('light');
    fileInputRef.current?.click();
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

      {/* Profile Card with Person Silhouette Mockup & Direct Photo Upload */}
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
        {/* Hidden File Input for Native Photo Picker */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />

        {/* Direct Clickable Avatar Circle with Silhouette Mockup */}
        <div 
          onClick={triggerUpload}
          style={{ 
            position: 'relative', 
            flexShrink: 0, 
            width: '72px', 
            height: '72px',
            cursor: 'pointer'
          }}
          title="Tap to change profile picture"
        >
          {currentPhoto ? (
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2.5px solid #0052ff',
              boxShadow: '0 4px 14px rgba(0, 82, 255, 0.25)',
              position: 'relative',
              background: '#e2e8f0'
            }}>
              <img 
                src={currentPhoto} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            /* Person Silhouette Mockup */
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #e2e8f0 0%, #cbd5e1 100%)',
              border: '2px solid #94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
              position: 'relative'
            }}>
              <svg 
                viewBox="0 0 100 100" 
                fill="#64748b" 
                style={{ width: '64px', height: '64px', marginTop: '14px' }}
              >
                {/* Silhouette Head */}
                <circle cx="50" cy="34" r="18" />
                {/* Silhouette Shoulders/Body */}
                <path d="M 18 86 C 18 64, 32 56, 50 56 C 68 56, 82 64, 82 86 Z" />
              </svg>
            </div>
          )}

          {/* Camera Edit Badge or Loader */}
          <div style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: isUploading ? '#09090b' : '#0052ff',
            color: '#ffffff',
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            pointerEvents: 'none'
          }}>
            {isUploading ? (
              <Loader2 size={13} className="spin" />
            ) : (
              <Camera size={13} />
            )}
          </div>
        </div>

        {/* User Info & Direct Upload Actions */}
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
            {/* Direct Upload Button */}
            <button
              type="button"
              onClick={triggerUpload}
              disabled={isUploading}
              style={{
                background: '#0052ff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '7px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 3px 8px rgba(0, 82, 255, 0.28)',
                cursor: 'pointer',
                opacity: isUploading ? 0.7 : 1
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={13} className="spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload size={13} />
                  <span>{currentPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                </>
              )}
            </button>

            {/* Remove Photo Action if custom photo is uploaded */}
            {currentPhoto && !isUploading && (
              <button
                type="button"
                onClick={() => applyPhotoChange(null)}
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            )}
          </div>
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
