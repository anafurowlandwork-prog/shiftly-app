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
        <ShiftlyLogo size={54} variant="badge" />
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

        {/* User Account / Profile Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              triggerHaptic('light');
              if (setActiveTab) setActiveTab('account');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '20px',
              background: '#f4f4f5',
              border: '1px solid #e4e4e7',
              cursor: 'pointer',
              color: '#09090b'
            }}
            title="View Account & Logout"
          >
            <User size={14} color="#0052ff" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayUser.split(' ')[0]}
            </span>
          </button>
        </div>

        <div className="status-badge-blue">
          <span className="pulse-dot-blue"></span>
          <span>LIVE</span>
        </div>
      </div>
    </header>
  );
}

