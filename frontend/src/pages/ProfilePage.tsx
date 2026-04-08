import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import PasskeyManager from '@/components/settings/PasskeyManager';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const infoItems = [
    { label: 'Full Name', value: user?.fullName },
    { label: 'Email', value: user?.email },
    { label: 'Role', value: user?.role?.replace(/_/g, ' ') ?? '—' },
    { label: 'Status', value: user?.status ?? '—' },
    { label: 'Domain', value: user?.domainId ?? '—' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Nav */}
      <nav className="border-b border-border bg-card px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-serif font-bold text-lg">
            {user?.fullName?.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-2xl text-primary leading-none">Smart Campus Hub</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">University Operations</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Button variant="outline" size="sm" onClick={logout} className="h-8 rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all text-[10px] uppercase font-bold tracking-widest">
            Sign Out
          </Button>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 sm:p-10 space-y-8">
        {/* Page header */}
        <header className="border-b border-border pb-6">
          <h2 className="text-secondary font-bold tracking-widest uppercase text-xs mb-2">My Account</h2>
          <h1 className="text-3xl font-serif text-primary">Profile & Security</h1>
        </header>

        {/* Account info */}
        <section className="bg-card border border-border p-8 space-y-6">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-3">
            Account Information
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {infoItems.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{label}</dt>
                <dd className="text-sm text-primary font-medium capitalize">{value ?? '—'}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Passkey management */}
        <section className="bg-card border border-border p-8">
          <PasskeyManager />
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
