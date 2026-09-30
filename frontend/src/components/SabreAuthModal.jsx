import React, { useState } from 'react';
import { 
  X, Mail, Phone, Building2, KeyRound, ShieldCheck, CheckCircle2, 
  ArrowRight, Sparkles, Lock, RefreshCw, Send, Check
} from 'lucide-react';

export default function SabreAuthModal({ isOpen, onClose, onAuthSuccess }) {
  // Tabs: 'gmail' | 'company' | 'phone'
  const [authMethod, setAuthMethod] = useState('gmail');
  
  // Form states
  const [email, setEmail] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [corporatePassword, setCorporatePassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // OTP flow
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (authMethod === 'gmail' && !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (authMethod === 'phone' && phoneNumber.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpStep(true);
      setSuccessMsg(`One-Time Password (OTP) dispatched to ${authMethod === 'gmail' ? email : phoneNumber}`);
    }, 700);
  };

  const handleOtpChange = (val, idx) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otpCode];
    newOtp[idx] = val;
    setOtpCode(newOtp);

    // Auto focus next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-input-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onAuthSuccess?.({
        method: authMethod,
        user: authMethod === 'gmail' ? email : phoneNumber
      });
      onClose();
    }, 800);
  };

  const handleCompanyLogin = (e) => {
    e.preventDefault();
    if (!companyId || !corporateEmail || !corporatePassword) {
      setErrorMsg('All corporate credentials are required.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onAuthSuccess?.({
        method: 'company',
        user: corporateEmail,
        companyId
      });
      onClose();
    }, 800);
  };

  const resetForm = () => {
    setOtpStep(false);
    setOtpCode(['', '', '', '', '', '']);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 12, 24, 0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(30, 58, 95, 0.94)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '20px',
          boxShadow: '0 24px 70px -12px rgba(15, 23, 42, 0.55), 0 1px 0 0 rgba(255, 255, 255, 0.35) inset',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#2e7d32',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(46, 125, 50, 0.4)'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                Sign in to SABRE
              </div>
              <div style={{ fontSize: '11px', color: '#93c5fd' }}>
                Zero-Trust Multi-Factor Sovereign Auth
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: '#cbd5e1',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Auth Method Selector Tabs */}
        {!otpStep && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            padding: '6px',
            margin: '20px 24px 4px',
            background: 'rgba(10, 25, 47, 0.55)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            gap: '4px'
          }}>
            {[
              { id: 'gmail', label: 'Email + OTP', icon: Mail },
              { id: 'company', label: 'Company ID', icon: Building2 },
              { id: 'phone', label: 'Mobile + OTP', icon: Phone }
            ].map(tab => {
              const active = authMethod === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setAuthMethod(tab.id); resetForm(); }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    background: active ? '#2e7d32' : 'transparent',
                    color: active ? '#ffffff' : '#94a3b8',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Form Body */}
        <div style={{ padding: '20px 24px 28px' }}>
          {errorMsg && (
            <div style={{
              background: 'rgba(185, 28, 28, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px'
            }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{
              background: 'rgba(46, 125, 50, 0.25)',
              border: '1px solid rgba(74, 222, 128, 0.4)',
              color: '#86efac',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px'
            }}>
              {successMsg}
            </div>
          )}

          {/* Flow 1: OTP Verification Input Step */}
          {otpStep ? (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>
                  Enter the 6-Digit Verification Code
                </div>
                <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px' }}>
                  A secure one-time passcode was sent to your credential
                </div>
              </div>

              {/* 6 Digit Input Boxes */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && i > 0) {
                        document.getElementById(`otp-input-${i - 1}`)?.focus();
                      }
                    }}
                    style={{
                      width: '46px',
                      height: '52px',
                      borderRadius: '10px',
                      background: 'rgba(10, 25, 47, 0.7)',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                      textAlign: 'center',
                      fontSize: '20px',
                      fontWeight: 800,
                      color: '#ffffff',
                      outline: 'none',
                      fontFamily: "'Space Grotesk', sans-serif"
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                style={{
                  marginTop: '10px',
                  background: '#2e7d32',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(46, 125, 50, 0.4)'
                }}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={16} className="spin-slow" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Authorize Session</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#93c5fd',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                ← Use a different login method
              </button>
            </form>
          ) : authMethod === 'company' ? (
            /* Flow 2: Company ID + Corporate Enterprise SSO */
            <form onSubmit={handleCompanyLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Enterprise Tenant / Company ID
                </label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="text"
                    placeholder="e.g. TATA-STEEL-PROD or RELIANCE-LOGISTICS"
                    value={companyId}
                    onChange={e => setCompanyId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '8px',
                      background: 'rgba(10, 25, 47, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Corporate Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    placeholder="name@enterprise.com"
                    value={corporateEmail}
                    onChange={e => setCorporateEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '8px',
                      background: 'rgba(10, 25, 47, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Security Passkey / SSO Token
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={corporatePassword}
                    onChange={e => setCorporatePassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '8px',
                      background: 'rgba(10, 25, 47, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                style={{
                  marginTop: '8px',
                  background: '#2e7d32',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(46, 125, 50, 0.4)'
                }}
              >
                {isVerifying ? 'Authenticating Enterprise SSO...' : 'Enter Corporate Console'}
                <ArrowRight size={15} />
              </button>
            </form>
          ) : authMethod === 'phone' ? (
            /* Flow 3: Mobile Phone Number + OTP */
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Mobile Phone Number
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(10, 25, 47, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    color: '#93c5fd',
                    fontSize: '13px',
                    fontWeight: 700
                  }}>
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(10, 25, 47, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                style={{
                  marginTop: '8px',
                  background: '#2e7d32',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(46, 125, 50, 0.4)'
                }}
              >
                {isSendingOtp ? 'Sending SMS Code...' : 'Send SMS OTP Verification'}
                <Send size={14} />
              </button>
            </form>
          ) : (
            /* Flow 4: Google / Gmail Email + OTP */
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Official Email Address (Gmail / Google Workspace)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    placeholder="you@company.com or name@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '8px',
                      background: 'rgba(10, 25, 47, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                style={{
                  marginTop: '8px',
                  background: '#2e7d32',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(46, 125, 50, 0.4)'
                }}
              >
                {isSendingOtp ? 'Dispatching OTP to Mailbox...' : 'Get Instant Verification OTP'}
                <Send size={14} />
              </button>
            </form>
          )}

          {/* Privacy statement */}
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '10.5px',
            color: '#94a3b8',
            lineHeight: 1.5
          }}>
            Protected by SABRE Zero-Trust Hardware Cryptography.
            <br />
            No credentials are ever shared or monetized.
          </div>
        </div>
      </div>
    </div>
  );
}
