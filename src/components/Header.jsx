import React from 'react';
import ShiftlyLogo from './ShiftlyLogo';
import { Truck, User, LogIn, LogOut, CheckCircle2 } from 'lucide-react';

export default function Header({ 
  setActiveTab, 
  toggleMode, 
  onToggleMode,
  currentUser,
  onOpenAuthModal,
  onLogout
}) {
  const isDriver = toggleMode === 'Driver';

  return (
    <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <div 
        className="brand-container" 
        onClick={() => setActiveTab('welcome')} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        title="Go to Welcome screen"
      >
        <ShiftlyLogo size={32} variant="inline" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Customer / Driver Mode Switcher */}
        {onToggleMode && (
          <button
            onClick={onToggleMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '20px',
              border: isDriver ? '1px solid #0052ff' : '1px solid #e4e4e7',
              background: isDriver ? 'rgba(0, 82, 255, 0.08)' : '#ffffff',
              color: isDriver ? '#0052ff' : '#09090b',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={isDriver ? 'Switch to Customer Mode' : 'Switch to Driver Portal'}
          >
            {isDriver ? <User size={13} /> : <Truck size={13} color="#0052ff" />}
            <span>{isDriver ? 'Driver Mode' : 'Driver Portal'}</span>
          </button>
        )}

        {/* User Account / Auth Button */}
        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div 
              onClick={onOpenAuthModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '20px',
                background: '#09090b',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title={`Logged in as ${currentUser.email}`}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#0052FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem'
              }}>
                {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ maxWidth: '75px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.displayName || 'Account'}
              </span>
            </div>
            
            <button
              onClick={onLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#71717a',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: '#0052FF',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,82,255,0.3)'
            }}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
