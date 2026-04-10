import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export const PendingActivationPage: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(rgba(45,122,58,0.08) 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      </div>
      
      <div className="max-w-lg w-full p-12 bg-card border border-border shadow-xl text-center relative z-10">
        <div className="w-16 h-16 mx-auto bg-secondary/10 flex items-center justify-center rounded-full mb-6">
          <div className="w-8 h-8 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Status: In Review</h2>
        <h1 className="text-3xl font-serif text-primary mb-6">Pending Activation</h1>
        <p className="text-muted-foreground font-light mb-10 leading-relaxed">
          Your profile has been successfully submitted to the university registry. 
          A system administrator is currently reviewing your application and will assign appropriate access privileges shortly.
        </p>
        <Button variant="outline" onClick={logout} className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-widest text-xs px-8">
          Return to Login
        </Button>
      </div>
    </div>
  );
};

export const SuspendedPage: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute w-full h-1/2 top-0 bg-gradient-to-b from-destructive/10 to-transparent"></div>
      </div>

      <div className="max-w-lg w-full p-12 bg-card border border-destructive/20 shadow-2xl text-center relative z-10">
        <div className="w-16 h-16 mx-auto bg-destructive/10 text-destructive flex items-center justify-center rounded-full mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-destructive mb-2">Security Intervention</h2>
        <h1 className="text-3xl font-serif text-primary mb-6">Access Revoked</h1>
        <p className="text-muted-foreground font-light mb-10 leading-relaxed">
          Your account credentials have been suspended in accordance with university security protocols. 
          Please contact the IT Helpdesk for clarification and reinstatement procedures.
        </p>
        <Button variant="outline" onClick={logout} className="rounded-none border-destructive text-destructive hover:bg-destructive hover:text-white uppercase tracking-widest text-xs px-8">
          Acknowledge & Logout
        </Button>
      </div>
    </div>
  );
};

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-lg w-full p-12 bg-card border border-border shadow-xl text-center">
        <div className="w-16 h-16 mx-auto border border-primary text-primary flex items-center justify-center rounded-full mb-6">
          <span className="font-serif text-2xl font-bold">403</span>
        </div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Clearance Required</h2>
        <h1 className="text-3xl font-serif text-primary mb-6">Restricted Area</h1>
        <p className="text-muted-foreground font-light mb-10 leading-relaxed">
          Your current designation does not grant access to this administrative console. 
          Please return to your designated workspace.
        </p>
        <Button onClick={() => window.location.href = '/dashboard'} className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs px-8">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
