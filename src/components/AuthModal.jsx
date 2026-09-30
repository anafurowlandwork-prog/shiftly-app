import React, { useState } from 'react';
import { X, Mail, Lock, User, Truck, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { loginUser, signupUser, loginAsGuest } from '../services/firebase';
import { triggerHaptic } from '../utils/nativeBridge';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialRole = 'customer' }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    triggerHaptic();

    try {
      let user;
      if (isSignUp) {
        if (!email || !password) throw new Error("Please fill in email and password.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        user = await signupUser(email, password, displayName, role);
      } else {
        if (!email || !password) throw new Error("Please enter your email and password.");
        user = await loginUser(email, password);
      }
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGuest = async (selectedRole) => {
    setLoading(true);
    triggerHaptic();
    try {
      const user = await loginAsGuest(selectedRole);
      onAuthSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(9, 9, 11, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#121216',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '440px',
        padding: '28px',
        color: '#fff',
        boxShadow: '0 25px 50px -12px rgba(0, 82, 255, 0.25)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#a1a1aa',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0052FF 0%, #0037b3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(0,82,255,0.4)'
          }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>
            {isSignUp ? 'Create Shiftly Account' : 'Welcome to Shiftly'}
          </h2>
          <p style={{ color: '#a1a1aa', fontSize: '0.88rem', margin: 0 }}>
            {isSignUp ? 'Join the next-gen logistics network' : 'Log in to manage your moves & fleet'}
          </p>
        </div>

        {/* Account Role Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(255,255,255,0.04)',
          padding: '4px',
          borderRadius: '14px',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            onClick={() => setRole('customer')}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              background: role === 'customer' ? '#0052FF' : 'transparent',
              color: role === 'customer' ? '#fff' : '#a1a1aa',
              transition: 'all 0.2s'
            }}
          >
            <User size={15} /> Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            style={{
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              background: role === 'driver' ? '#0052FF' : 'transparent',
              color: role === 'driver' ? '#fff' : '#a1a1aa',
              transition: 'all 0.2s'
            }}
          >
            <Truck size={15} /> Driver Partner
          </button>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#a1a1aa', marginBottom: '6px' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#71717a" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 42px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#a1a1aa', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#71717a" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#a1a1aa', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#71717a" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: '#0052FF',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(0, 82, 255, 0.4)',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => handleQuickGuest(role)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#60a5fa',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Sparkles size={14} /> Quick Demo Access as {role === 'driver' ? 'Driver Partner' : 'Customer'}
          </button>
        </div>

        {/* Toggle Mode */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#a1a1aa'
        }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0052FF',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Sign In' : 'Create One'}
          </button>
        </div>
      </div>
    </div>
  );
}
