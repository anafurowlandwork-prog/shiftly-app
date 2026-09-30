import React from 'react';
import ShiftlyLogo from './ShiftlyLogo';
import { Truck, User } from 'lucide-react';

export default function Header({ setActiveTab, toggleMode, onToggleMode }) {
  const isDriver = toggleMode === 'Driver';

  return (
    <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div 
        className="brand-container" 
        onClick={() => setActiveTab('welcome')} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        title="Go to Welcome screen"
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
            <span>{isDriver ? 'Driver' : 'Driver'}</span>
          </button>
        )}

        <div className="status-badge-blue">
          <span className="pulse-dot-blue"></span>
          <span>ON-DEMAND</span>
        </div>
      </div>
    </header>
  );
}
