import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePasskeyAuthentication } from '@/hooks/usePasskey';

const LoginPage: React.FC = () => {
  const { checkAuth } = useAuth();
  const { authenticate } = usePasskeyAuthentication();
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  const handlePasskeyLogin = async () => {
    setPasskeyError(null);
    setPasskeyLoading(true);
    try {
      await authenticate();
      await checkAuth();
      // GuestGuard will handle redirect based on user status
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('cancel') || message.includes('abort')) {
        setPasskeyError('Sign-in cancelled.');
      } else {
        setPasskeyError('No passkey found for this device. Sign in with Google first.');
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        <div className="absolute w-[800px] h-[800px] bg-secondary/10 rounded-full blur-3xl -top-40 -left-40 mix-blend-multiply opacity-50"></div>
        <div className="absolute w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl bottom-0 right-0 mix-blend-multiply opacity-50"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Card */}
        <div className="bg-card border border-border shadow-2xl shadow-primary/5 rounded-none p-10 sm:p-14 flex flex-col items-center text-center relative overflow-hidden">

          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>

          <div className="mb-10">
            <h2 className="text-secondary font-bold tracking-widest uppercase text-xs mb-4">University Portal</h2>
            <h1 className="text-4xl sm:text-5xl font-serif text-primary leading-tight mb-4">
              Smart Campus <br />
              <span className="italic font-light text-muted-foreground/80">Operations Hub</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto font-light leading-relaxed">
              Access administrative tools, manage domain resources, and coordinate campus activities securely.
            </p>
          </div>

          <div className="w-full space-y-3">
            {/* Google Sign-In */}
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-14 text-base font-medium flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 rounded-sm group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.27 3.28-8.11 3.28-11.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.75c.87-2.6 3.3-4.53 12-4.53z" />
              </svg>
              <span className="relative z-10">Sign in with University Google</span>
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground/50 font-light">or</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* Passkey Sign-In */}
            <Button
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading}
              variant="outline"
              className="w-full h-12 text-sm font-medium flex items-center justify-center gap-2 border-border/60 hover:border-border hover:bg-accent/40 transition-all duration-200 rounded-sm"
            >
              <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 10v4M8 14h8M6 20h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
                <circle cx="12" cy="8" r="2" />
              </svg>
              {passkeyLoading ? 'Authenticating…' : 'Sign in with Passkey'}
            </Button>

            {passkeyError && (
              <p className="text-xs text-destructive text-center pt-1">{passkeyError}</p>
            )}

            <div className="pt-4 border-t border-border flex items-center justify-center">
               <p className="text-xs text-muted-foreground font-light">
                 Requires authorized institutional credentials.
               </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-muted-foreground/60 font-light">
          <p>© {new Date().getFullYear()} University Operations. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
