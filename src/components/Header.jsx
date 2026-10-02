import React, { useState } from 'react';
import ShiftlyLogo from './ShiftlyLogo';
import { Truck, User, LogOut, ChevronDown } from 'lucide-react';
import { triggerHaptic } from '../utils/nativeBridge';

export default function Header({ setActiveTab, toggleMode, onToggleMode, authUser, onLogout }) {
  const isDriver = toggleMode === 'Driver';
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const displayUser = authUser?.recipient || (authUser?.isGuest ? 'Guest User' : 'Sarah Jenkins');

  return (
    <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
      <div 
        className="brand-container" 
        onClick={() => setActiveTab('book')} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        title="Shiftly Home"
      >
        <ShiftlyLogo size={32} variant="inline" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onToggleMode && (
          <button
            onClick={onToggleMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 10px',
              borderRadius: '20px',
              border: isDriver ? '1px solid #0052ff' : '1px solid #e4e4e7',
              background: isDriver ? 'rgba(0, 82, 255, 0.08)' : '#ffffff',
              color: isDriver ? '#0052ff' : '#09090b',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title={isDriver ? 'Switch to Customer Mode' : 'Switch to Driver Portal'}
          >
            {isDriver ? <User size={13} /> : <Truck size={13} color="#0052ff" />}
            <span>{isDriver ? 'Customer' : 'Driver'}</span>
          </button>
        )}

        {/* User Account / Profile Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowProfileMenu(!showProfileMenu);
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f4f4f5',
              border: '1px solid #e4e4e7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#09090b'
            }}
            title="Account Options"
          >
            <User size={15} color="#09090b" />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                width: '190px',
                background: '#ffffff',
                borderRadius: '14px',
                padding: '10px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                border: '1px solid #e2e8f0',
                zIndex: 99999,
                animation: 'fadeIn 0.15s ease'
              }}
            >
              <div style={{ padding: '4px 6px 8px 6px', borderBottom: '1px solid #f1f5f9', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
                  Signed in as
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#09090b', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {displayUser}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setShowProfileMenu(false);
                  if (onLogout) onLogout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#fef2f2',
                  color: '#ef4444',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={14} /> Log Out / Switch
              </button>
            </div>
          )}
        </div>

        <div className="status-badge-blue">
          <span className="pulse-dot-blue"></span>
          <span>LIVE</span>
        </div>
      </div>
    </header>
  );
}

