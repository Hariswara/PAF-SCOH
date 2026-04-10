import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePasskeyRegistration } from '@/hooks/usePasskey';

interface PasskeyPromptProps {
  onComplete: () => void;
}

const PasskeyPrompt: React.FC<PasskeyPromptProps> = ({ onComplete }) => {
  const { register } = usePasskeyRegistration();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSetUpPasskey = async () => {
    setError(null);
    setLoading(true);
    try {
      // Use a sensible default display name based on the user's device
      const deviceHint = navigator.platform || 'Device';
      await register(`${deviceHint} Passkey`);
      onComplete();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('cancel') || message.includes('abort')) {
        // User dismissed the browser prompt — treat as skip
        onComplete();
      } else {
        setError('Could not set up passkey. You can try again from your profile.');
        // Allow proceeding even on error
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border shadow-2xl rounded-none max-w-md w-full p-10 relative overflow-hidden">
        {/* Accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>

        <div className="text-center mb-8">
          {/* Passkey icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/10 border border-secondary/20 mb-5">
            <svg className="w-7 h-7 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="3" />
              <path d="M15 8h-1a4 4 0 0 0-4 4v1H8v3h2v3h3v-3h2l1-3h-3v-1a1 1 0 0 1 1-1h1z" />
            </svg>
          </div>

          <h2 className="text-2xl font-serif text-primary mb-3">Set up faster sign-in</h2>
          <p className="text-muted-foreground text-sm font-light leading-relaxed">
            Use your device's biometrics (Touch ID, Face ID, or Windows Hello) to sign in
            instantly next time — no Google required.
          </p>
        </div>

        {error && (
          <p className="text-xs text-destructive text-center mb-4 bg-destructive/5 border border-destructive/20 p-2 rounded-sm">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleSetUpPasskey}
            disabled={loading}
            className="w-full h-12 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm"
          >
            {loading ? 'Setting up…' : 'Set up Passkey'}
          </Button>

          <Button
            onClick={onComplete}
            disabled={loading}
            variant="ghost"
            className="w-full h-10 text-xs text-muted-foreground hover:text-foreground rounded-sm"
          >
            Skip for now — I'll do this later in my profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasskeyPrompt;
