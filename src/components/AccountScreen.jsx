import React, { useState } from 'react';
import { 
  User, ShieldCheck, Phone, Mail, CreditCard, 
  LogOut, ChevronRight, Sparkles, HelpCircle, FileText, 
  Lock, Globe, CheckCircle2, RotateCcw, Award, Bell 
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';
import TermsOfServiceModal from './TermsOfServiceModal';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { triggerHaptic } from '../utils/nativeBridge';

export default function AccountScreen({ authUser, onLogout, onNavigateToTab }) {
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  return (
    <div className="account-screen" style={{ padding: '20px 18px 90px 18px', background: '#ffffff', minHeight: '100%', boxSizing: 'border-box' }}>
      
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

      {/* Profile Card */}
      <div style={{ background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0052ff 0%, #0037b3 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: 900
          }}>
            {displayUser.charAt(0).toUpperCase()}
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e', border: '2px solid #ffffff' }}></div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09090b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayUser}
            </h3>
            <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#0052ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
              VERIFIED
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
            {userCountry} ({userCountryCode})
          </span>
          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'block', marginTop: '2px' }}>
            ✓ Active Session Saved
          </span>
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
