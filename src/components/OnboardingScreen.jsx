import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, 
  ChevronDown, Search, X, Globe, Check, Mail, Smartphone,
  RefreshCw, Inbox, Sparkles
} from 'lucide-react';
import ShiftlyLogo from './ShiftlyLogo';
import LemfiShiftlyLogo from './LemfiShiftlyLogo';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsOfServiceModal from './TermsOfServiceModal';
import { triggerHaptic } from '../utils/nativeBridge';
import { sendRealOtp, verifyRealOtp } from '../services/backendService';

const COUNTRIES = [
  { name: 'United States', code: '+1', flag: '🇺🇸', placeholder: '(555) 000-0000' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', placeholder: '(555) 000-0000' },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', placeholder: '801 234 5678' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭', placeholder: '24 123 4567' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪', placeholder: '712 345678' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦', placeholder: '82 123 4567' },
  { name: 'Australia', code: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { name: 'Germany', code: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { name: 'France', code: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { name: 'India', code: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { name: 'Ireland', code: '+353', flag: '🇮🇪', placeholder: '85 123 4567' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷', placeholder: '11 91234-5678' }
];

export default function OnboardingScreen({ onCompleteAuth }) {
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[1]); // Default to UK (+44) or US
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailNotificationToast, setEmailNotificationToast] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [generatedOtpCode, setGeneratedOtpCode] = useState('');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const showSimulatedNotification = (code, recipient, method) => {
    setEmailNotificationToast({
      title: method === 'phone' ? 'Shiftly SMS Security Code' : 'Shiftly Email Security Code',
      body: `Your verification code is ${code} (sent to ${recipient})`,
      code: code,
      method: method
    });
    setTimeout(() => {
      setEmailNotificationToast(null);
    }, 10000);
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (selectedCountry.code === '+1') {
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleCountrySelect = (country) => {
    triggerHaptic('light');
    setSelectedCountry(country);
    setIsCountryPickerOpen(false);
    setCountrySearch('');
  };

  const getCleanRecipient = () => {
    return authMethod === 'phone' 
      ? `${selectedCountry.code} ${phoneNumber}`.trim() 
      : emailAddress.trim();
  };

  const handleContinue = async () => {
    if (authMethod === 'phone' && phoneNumber.replace(/\D/g, '').length < 6) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    if (authMethod === 'email' && (!emailAddress || !emailAddress.includes('@') || !emailAddress.includes('.'))) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    triggerHaptic('light');
    setErrorMessage('');
    setOtpDigits(['', '', '', '', '', '']); // Clear all boxes for fresh user input
    const recipient = getCleanRecipient();

    try {
      const response = await sendRealOtp({ recipient, method: authMethod });
      const activeCode = response?.generatedCode || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtpCode(activeCode);
      setOnboardingStep(2);
      setResendCooldown(30);
      showSimulatedNotification(activeCode, recipient, authMethod);
    } catch (err) {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtpCode(fallbackCode);
      setOnboardingStep(2);
      setResendCooldown(30);
      showSimulatedNotification(fallbackCode, recipient, authMethod);
    }
  };

  const handleOtpChange = (idx, value) => {
    setErrorMessage('');
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpDigits];
    newOtp[idx] = digit;
    setOtpDigits(newOtp);

    // Auto-advance to next input if digit entered
    if (digit && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
      setActiveOtpIndex(idx + 1);
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      setActiveOtpIndex(idx - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtpDigits(newDigits);
      const nextIdx = Math.min(5, pastedData.length);
      inputRefs.current[nextIdx]?.focus();
      setActiveOtpIndex(nextIdx);
    }
  };

  const fillGeneratedCode = (targetCode) => {
    triggerHaptic('medium');
    const codeToUse = targetCode || generatedOtpCode || '123456';
    const digits = codeToUse.slice(0, 6).split('');
    setOtpDigits(digits);
    setErrorMessage('');
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      triggerHaptic('success');
      onCompleteAuth();
    }, 400);
  };

  const handleVerify = async () => {
    const fullCode = otpDigits.join('');
    if (fullCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of the code.');
      return;
    }
    triggerHaptic('medium');
    setIsVerifying(true);
    setErrorMessage('');
    const recipient = getCleanRecipient();

    try {
      await verifyRealOtp({ recipient, code: fullCode });
      setIsVerifying(false);
      triggerHaptic('success');
      onCompleteAuth();
    } catch (err) {
      setIsVerifying(false);
      setErrorMessage(err.message || 'Invalid verification code. Please check and try again.');
    }
  };

  const handleSwitchToEmailDelivery = async () => {
    triggerHaptic('light');
    setAuthMethod('email');
    setResendCooldown(30);
    setOtpDigits(['', '', '', '', '', '']);
    const email = emailAddress || 'user@shiftly.com';
    try {
      const response = await sendRealOtp({ recipient: email, method: 'email' });
      const code = response?.generatedCode || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtpCode(code);
      showSimulatedNotification(code, email, 'email');
    } catch (e) {}
  };

  const handleSwitchToSmsDelivery = async () => {
    triggerHaptic('light');
    setAuthMethod('phone');
    setResendCooldown(30);
    setOtpDigits(['', '', '', '', '', '']);
    const phone = getCleanRecipient();
    try {
      const response = await sendRealOtp({ recipient: phone, method: 'phone' });
      const code = response?.generatedCode || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtpCode(code);
      showSimulatedNotification(code, phone, 'phone');
    } catch (e) {}
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    triggerHaptic('light');
    setResendCooldown(30);
    setOtpDigits(['', '', '', '', '', '']);
    const recipient = getCleanRecipient();
    try {
      const response = await sendRealOtp({ recipient, method: authMethod });
      const code = response?.generatedCode || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtpCode(code);
      showSimulatedNotification(code, recipient, authMethod);
    } catch (e) {}
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.code.includes(countrySearch)
  );

  return (
    <div className="onboarding-screen" style={{ width: '100%', height: '100%', boxSizing: 'border-box', overflowY: 'auto', position: 'relative' }}>
      
      {/* Dynamic Push Notification Banner */}
      {emailNotificationToast && (
        <div 
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '380px',
            background: '#09090b',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(255,255,255,0.15)',
            animation: 'slideDown 0.3s ease-out',
            cursor: 'pointer'
          }}
          onClick={() => {
            fillGeneratedCode(emailNotificationToast.code);
            setEmailNotificationToast(null);
          }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0052ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {emailNotificationToast.method === 'phone' ? <Smartphone size={20} color="#ffffff" /> : <Mail size={20} color="#ffffff" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {emailNotificationToast.title}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>now</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              Code: <span style={{ color: '#60a5fa', fontWeight: 900, letterSpacing: '1px' }}>{emailNotificationToast.code}</span>
              <span style={{ fontSize: '0.72rem', color: '#a1a1aa', marginLeft: '6px' }}>(Tap to fill)</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Welcome & Auth Input */}
      {onboardingStep === 1 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100%' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', marginTop: '8px' }}>
              <LemfiShiftlyLogo size={160} showBackground={true} />
            </div>

            <h2 className="hero-title" style={{ textAlign: 'center', marginTop: '4px' }}>
              Move anything,<br />anywhere.
            </h2>

            <p className="hero-subtitle" style={{ textAlign: 'center' }}>
              Book verified movers in minutes. Track cargo live in real time.
            </p>
          </div>

          <div className="auth-card" style={{ marginTop: 'auto', paddingTop: '16px' }}>
            
            {/* Method Tabs: Phone vs Email */}
            <div 
              style={{ 
                display: 'flex', 
                background: '#f1f5f9', 
                borderRadius: '12px', 
                padding: '4px', 
                marginBottom: '14px',
                gap: '4px'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setAuthMethod('phone');
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: authMethod === 'phone' ? '#ffffff' : 'transparent',
                  color: authMethod === 'phone' ? '#09090b' : '#64748b',
                  boxShadow: authMethod === 'phone' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Smartphone size={15} color={authMethod === 'phone' ? '#0052ff' : '#64748b'} />
                Phone Number
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setAuthMethod('email');
                  setErrorMessage('');
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: authMethod === 'email' ? '#ffffff' : 'transparent',
                  color: authMethod === 'email' ? '#09090b' : '#64748b',
                  boxShadow: authMethod === 'email' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Mail size={15} color={authMethod === 'email' ? '#0052ff' : '#64748b'} />
                Email Address
              </button>
            </div>

            {authMethod === 'phone' ? (
              <>
                <label className="input-label">Phone number</label>
                <div className="phone-input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Interactive Country Code Selector */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setIsCountryPickerOpen(true);
                    }}
                    style={{
                      background: '#e2e8f0',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      color: '#09090b',
                      cursor: 'pointer',
                      marginRight: '8px',
                      flexShrink: 0
                    }}
                    title="Select Country"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.code}</span>
                    <ChevronDown size={14} color="#64748b" />
                  </button>

                  <input
                    type="tel"
                    className="phone-input"
                    style={{ flex: 1, padding: '0', background: 'transparent' }}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={selectedCountry.placeholder}
                    autoFocus
                  />
                </div>
              </>
            ) : (
              <>
                <label className="input-label">Email address</label>
                <div 
                  className="phone-input-wrapper" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#f8fafc',
                    marginBottom: '10px'
                  }}
                >
                  <Mail size={18} color="#0052ff" style={{ marginRight: '10px', flexShrink: 0 }} />
                  <input
                    type="email"
                    style={{ 
                      flex: 1, 
                      border: 'none', 
                      background: 'transparent', 
                      outline: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: '#09090b'
                    }}
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="name@example.com"
                    autoFocus
                  />
                </div>

                {/* Email Quick Domain Pills */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  {['@gmail.com', '@icloud.com', '@outlook.com'].map((dom) => (
                    <button
                      key={dom}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        const prefix = emailAddress.split('@')[0] || 'alex.morgan';
                        setEmailAddress(`${prefix}${dom}`);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              </>
            )}

            {errorMessage && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, marginTop: '4px', marginBottom: '8px' }}>
                {errorMessage}
              </p>
            )}

            <button 
              className="btn-black" 
              onClick={handleContinue}
              style={{ marginTop: '6px' }}
            >
              Continue with {authMethod === 'phone' ? 'Phone' : 'Email'} <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onCompleteAuth();
              }}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#0052ff',
                fontSize: '0.85rem',
                fontWeight: 700,
                padding: '10px',
                cursor: 'pointer',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              Skip & Explore App ➔
            </button>

            <p className="legal-text" style={{ textAlign: 'center', marginTop: '8px' }}>
              By continuing you agree to our{' '}
              <button
                type="button"
                onClick={() => setIsTermsOpen(true)}
                style={{ background: 'none', border: 'none', color: '#0052ff', textDecoration: 'underline', fontWeight: 700, fontSize: 'inherit', cursor: 'pointer', padding: 0 }}
              >
                Terms of Service
              </button>{' '}
              &{' '}
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                style={{ background: 'none', border: 'none', color: '#0052ff', textDecoration: 'underline', fontWeight: 700, fontSize: 'inherit', cursor: 'pointer', padding: 0 }}
              >
                Privacy Policy
              </button>.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: OTP Code Verification */}
      {onboardingStep === 2 && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100%', boxSizing: 'border-box' }}>
          <div>
            <button
              onClick={() => {
                triggerHaptic('light');
                setOnboardingStep(1);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '16px',
                padding: 0,
                color: '#09090b',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: authMethod === 'email' ? '#eff6ff' : '#f0fdf4', borderRadius: '100px', marginBottom: '10px' }}>
              {authMethod === 'email' ? <Mail size={13} color="#0052ff" /> : <Smartphone size={13} color="#16a34a" />}
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: authMethod === 'email' ? '#0052ff' : '#16a34a' }}>
                {authMethod === 'email' ? 'EMAIL VERIFICATION' : 'SMS VERIFICATION'}
              </span>
            </div>

            <h2 className="hero-title" style={{ fontSize: '1.75rem', marginBottom: '8px' }}>
              Enter 6-digit code
            </h2>

            <p className="hero-subtitle" style={{ marginBottom: '20px' }}>
              Code sent to {authMethod === 'email' ? (
                <strong style={{ color: '#09090b' }}>{emailAddress}</strong>
              ) : (
                <strong style={{ color: '#09090b' }}>{selectedCountry.code} {phoneNumber}</strong>
              )}
            </p>

            {/* Responsive 6-Digit OTP Grid */}
            <div 
              className="otp-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '6px',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                marginBottom: '16px'
              }}
            >
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    height: '48px',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    borderRadius: '12px',
                    border: activeOtpIndex === idx ? '2px solid #0052ff' : digit ? '1.5px solid #09090b' : '1.5px solid #e2e8f0',
                    background: digit ? 'rgba(0, 82, 255, 0.04)' : '#f8fafc',
                    color: '#09090b',
                    outline: 'none',
                    boxSizing: 'border-box',
                    padding: 0
                  }}
                  onFocus={() => setActiveOtpIndex(idx)}
                />
              ))}
            </div>

            {errorMessage && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', marginBottom: '12px' }}>
                {errorMessage}
              </p>
            )}

            {/* One-Tap Autofill Real Generated Code */}
            {generatedOtpCode && (
              <button
                type="button"
                onClick={() => fillGeneratedCode(generatedOtpCode)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(0, 82, 255, 0.08)',
                  border: '1.5px solid rgba(0, 82, 255, 0.25)',
                  color: '#0052ff',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '14px'
                }}
              >
                <Sparkles size={16} color="#0052ff" />
                Auto-Fill Code: <span style={{ letterSpacing: '2px', fontWeight: 900 }}>{generatedOtpCode}</span>
              </button>
            )}

            {/* Switch Delivery Channel Button */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              {authMethod === 'phone' ? (
                <button
                  type="button"
                  onClick={handleSwitchToEmailDelivery}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0052ff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Mail size={14} /> Send code to email ({emailAddress}) instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSwitchToSmsDelivery}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0052ff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Smartphone size={14} /> Send code via SMS ({selectedCountry.code} {phoneNumber}) instead
                </button>
              )}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <button 
              className="btn-black" 
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify & Continue'} <ArrowRight size={18} />
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#71717a', marginTop: '12px' }}>
              Didn't get the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? '#94a3b8' : '#0052ff',
                  fontWeight: 700,
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                  padding: 0
                }}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : `Resend via ${authMethod === 'email' ? 'Email' : 'SMS'}`}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Country Code Picker Bottom Modal Sheet */}
      {isCountryPickerOpen && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
          onClick={() => setIsCountryPickerOpen(false)}
        >
          <div 
            className="country-picker-sheet"
            style={{
              width: '100%',
              maxWidth: '430px',
              height: '75vh',
              background: '#ffffff',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              overflow: 'hidden',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div style={{ width: '40px', height: '4px', background: '#e4e4e7', borderRadius: '2px', margin: '12px auto 8px auto' }}></div>

            {/* Header */}
            <div style={{ padding: '8px 20px 14px 20px', borderBottom: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="#0052ff" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-heading)' }}>
                  Select Country
                </h3>
              </div>
              <button
                onClick={() => setIsCountryPickerOpen(false)}
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f4f4f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={16} color="#71717a" />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f4f4f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '10px 14px', borderRadius: '12px' }}>
                <Search size={16} color="#64748b" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country or code..."
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem' }}
                  autoFocus
                />
                {countrySearch && (
                  <button onClick={() => setCountrySearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <X size={14} color="#94a3b8" />
                  </button>
                )}
              </div>
            </div>

            {/* Country List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry.name === c.name;
                return (
                  <div
                    key={c.name}
                    onClick={() => handleCountrySelect(c)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(0, 82, 255, 0.06)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease',
                      marginBottom: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>{c.flag}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isSelected ? '#0052ff' : '#09090b' }}>
                        {c.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#0052ff' : '#64748b' }}>
                        {c.code}
                      </span>
                      {isSelected && <Check size={16} color="#0052ff" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
        <PrivacyPolicyModal onClose={() => setIsPrivacyOpen(false)} />
      )}

      {/* Terms of Service Modal */}
      {isTermsOpen && (
        <TermsOfServiceModal onClose={() => setIsTermsOpen(false)} />
      )}
    </div>
  );
}

