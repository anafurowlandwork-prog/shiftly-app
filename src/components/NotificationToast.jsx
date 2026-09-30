import React, { useEffect } from 'react';
import { MessageSquare, Truck, ShieldCheck, X } from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';

export default function NotificationToast({ notification, onClose, onClick }) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div 
      className="notification-toast"
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '400px',
        background: '#09090b',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '12px 14px',
        boxSizing: 'border-box',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1px solid #27272a'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#0052ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          flexShrink: 0
        }}>
          {notification.icon === 'chat' ? <MessageSquare size={18} /> : <Truck size={18} />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>{notification.title}</span>
            <span style={{ fontSize: '0.65rem', color: '#71717a' }}>just now</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
            {notification.message}
          </p>
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
