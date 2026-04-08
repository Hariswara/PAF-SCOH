import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePasskeyAuthentication } from '@/hooks/usePasskey';
import { Fingerprint, GraduationCap, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { checkAuth } = useAuth();
  const { authenticate } = usePasskeyAuthentication();
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError]     = useState<string | null>(null);

  const handleGoogleLogin = () => { window.location.href = '/oauth2/authorization/google'; };

  const handlePasskeyLogin = async () => {
    setPasskeyError(null);
    setPasskeyLoading(true);
    try {
      await authenticate();
      await checkAuth();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setPasskeyError(
        msg.includes('cancel') || msg.includes('abort')
          ? 'Authentication cancelled.'
          : 'No passkey found on this device. Sign in with Google first.'
      );
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: '#F8FAF7',
        backgroundImage:
          'radial-gradient(circle, rgba(45,122,58,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Left: brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[44%] p-14 relative overflow-hidden"
        style={{ borderRight: '1px solid #E2E8DF' }}
      >
        {/* Glow orb */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,122,58,0.06) 0%, transparent 65%)',
            bottom: '-10%', left: '-15%',
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div
            className="w-8 h-8 rounded-[7px] flex items-center justify-center"
            style={{ background: '#2D7A3A' }}
          >
            <GraduationCap size={14} style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em] leading-none"
              style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
            >
              SmartCampus
            </p>
            <p
              className="text-[9px] uppercase tracking-widest mt-0.5"
              style={{ color: '#6B7B6B' }}
            >
              Operations Hub
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative z-10">
          <p
            className="text-[10px] uppercase tracking-[0.3em] font-semibold mb-6"
            style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
          >
            University Portal
          </p>
          <h1
            className="font-serif leading-[1.1] mb-7"
            style={{ color: '#1A2E1A', fontSize: 52 }}
          >
            Campus<br />
            <em style={{ color: '#2D7A3A', fontStyle: 'italic' }}>Command</em><br />
            Center
          </h1>
          <p
            className="text-[15px] leading-relaxed max-w-xs"
            style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
          >
            Facility bookings, resource management, and operational oversight — unified.
          </p>

          <div className="mt-10 space-y-2.5">
            {[
              'Role-based access control & passkeys',
              'Facility booking & resource catalog',
              'Maintenance ticketing system',
              'Real-time security audit trail',
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: '#2D7A3A' }}
                />
                <p
                  className="text-[13px]"
                  style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
                >
                  {f}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p
          className="relative z-10 text-[11px]"
          style={{ color: '#6B7B6B', opacity: 0.5 }}
        >
          &copy; {new Date().getFullYear()} University Operations
        </p>
      </div>

      {/* Right: auth panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 page-enter">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div
            className="w-8 h-8 rounded-[6px] flex items-center justify-center"
            style={{ background: '#2D7A3A' }}
          >
            <GraduationCap size={14} style={{ color: '#FFFFFF' }} />
          </div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
          >
            SmartCampus
          </p>
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-10">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-3"
              style={{ color: '#2D7A3A', fontFamily: 'Albert Sans, sans-serif' }}
            >
              Secure Access
            </p>
            <h2
              className="font-serif mb-3"
              style={{ color: '#1A2E1A', fontSize: 34, lineHeight: 1.1 }}
            >
              Sign in
            </h2>
            <p
              className="text-[14px] leading-relaxed"
              style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
              Use your institutional credentials to access the portal.
            </p>
          </div>

          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="group w-full h-[52px] flex items-center justify-center gap-3 rounded-[7px] text-[14px] font-semibold transition-all duration-200"
              style={{
                background: '#2D7A3A',
                color: '#FFFFFF',
                fontFamily: 'Albert Sans, sans-serif',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#238A42')}
              onMouseLeave={e => (e.currentTarget.style.background = '#2D7A3A')}
            >
              <svg className="w-[17px] h-[17px] shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.93 3.28-4.77 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with University Google
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1 h-px" style={{ background: '#E2E8DF' }} />
              <span
                className="text-[11px]"
                style={{ color: '#6B7B6B', opacity: 0.6 }}
              >
                or
              </span>
              <div className="flex-1 h-px" style={{ background: '#E2E8DF' }} />
            </div>

            {/* Passkey */}
            <button
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading}
              className="w-full h-12 flex items-center justify-center gap-2.5 rounded-[7px] text-[13px] font-medium transition-all duration-150 disabled:opacity-50"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8DF',
                color: '#6B7B6B',
                fontFamily: 'Albert Sans, sans-serif',
              }}
              onMouseEnter={e => {
                if (!passkeyLoading) {
                  e.currentTarget.style.borderColor = 'rgba(45,122,58,0.3)';
                  e.currentTarget.style.color       = '#1A2E1A';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#E2E8DF';
                e.currentTarget.style.color       = '#6B7B6B';
              }}
            >
              {passkeyLoading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: '#6B7B6B', borderTopColor: 'transparent' }}
                  />
                  Authenticating&hellip;
                </>
              ) : (
                <>
                  <Fingerprint size={16} />
                  Sign in with Passkey
                </>
              )}
            </button>

            {passkeyError && (
              <p
                className="text-center text-[12px] pt-0.5"
                style={{ color: '#D94444', fontFamily: 'Albert Sans, sans-serif' }}
              >
                {passkeyError}
              </p>
            )}
          </div>

          <div
            className="mt-8 p-4 rounded-[7px]"
            style={{ background: '#FFFFFF', border: '1px solid #E2E8DF' }}
          >
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
              Access requires authorized institutional credentials. Contact your domain administrator if you need access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
