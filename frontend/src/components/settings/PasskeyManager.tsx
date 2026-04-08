import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePasskeyRegistration } from '@/hooks/usePasskey';
import api from '@/lib/api';
import { toast } from 'sonner';

interface PasskeyCredential {
  id: string;
  displayName: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  transports: string | null;
}

const PasskeyManager: React.FC = () => {
  const { register } = usePasskeyRegistration();
  const [credentials, setCredentials] = useState<PasskeyCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCredentials = useCallback(async () => {
    try {
      const { data } = await api.get<PasskeyCredential[]>('/auth/passkey/credentials');
      setCredentials(data);
    } catch {
      toast.error('Failed to load passkeys.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const name = newDisplayName.trim() || `My Passkey`;
      await register(name);
      toast.success('Passkey registered successfully.');
      setNewDisplayName('');
      setShowAddForm(false);
      await fetchCredentials();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (!message.includes('cancel') && !message.includes('abort')) {
        toast.error('Failed to register passkey. Please try again.');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string | null) => {
    if (!window.confirm(`Remove passkey "${name ?? 'this passkey'}"? You won't be able to use it to sign in.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/auth/passkey/credentials/${id}`);
      toast.success('Passkey removed.');
      setCredentials(prev => prev.filter(c => c.id !== id));
    } catch {
      toast.error('Failed to remove passkey.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const parseTransports = (raw: string | null): string[] => {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  };

  const transportLabel = (t: string) => {
    const map: Record<string, string> = {
      internal: 'Built-in (Touch ID / Face ID / Windows Hello)',
      hybrid: 'Hybrid (Phone passkey)',
      usb: 'USB Security Key',
      nfc: 'NFC',
      ble: 'Bluetooth',
    };
    return map[t] ?? t;
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Passkeys</h3>
          <p className="text-xs text-muted-foreground font-light mt-0.5">
            Sign in with biometrics instead of Google — faster and more secure.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(v => !v)}
          className="text-xs rounded-sm h-8 px-4 border-border/60"
        >
          {showAddForm ? 'Cancel' : '+ Add Passkey'}
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="flex gap-2 items-end border border-border/50 p-4 bg-accent/20">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Passkey name (optional)</label>
            <Input
              value={newDisplayName}
              onChange={e => setNewDisplayName(e.target.value)}
              placeholder="e.g. MacBook Touch ID"
              className="h-9 rounded-sm text-sm"
              disabled={adding}
            />
          </div>
          <Button
            type="submit"
            disabled={adding}
            size="sm"
            className="h-9 rounded-sm text-xs px-5 bg-primary text-primary-foreground"
          >
            {adding ? 'Setting up…' : 'Set up'}
          </Button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground animate-pulse">Loading passkeys…</p>
      ) : credentials.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border/40 text-muted-foreground">
          <p className="text-sm">No passkeys registered yet.</p>
          <p className="text-xs mt-1 font-light">Add one above for instant biometric sign-in.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {credentials.map(cred => {
            const transports = parseTransports(cred.transports);
            return (
              <li
                key={cred.id}
                className="flex items-start justify-between gap-4 p-4 border border-border/40 bg-card hover:border-border/70 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary truncate">{cred.displayName ?? 'Passkey'}</p>
                  {transports.length > 0 && (
                    <p className="text-xs text-muted-foreground font-light mt-0.5">
                      {transportLabel(transports[0])}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Added {formatDate(cred.createdAt)}
                    {cred.lastUsedAt ? ` · Last used ${formatDate(cred.lastUsedAt)}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(cred.id, cred.displayName)}
                  disabled={deletingId === cred.id}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5 disabled:opacity-40"
                  aria-label="Remove passkey"
                >
                  {deletingId === cred.id ? 'Removing…' : 'Remove'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PasskeyManager;
