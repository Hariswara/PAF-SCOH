import React, { useCallback, useEffect, useState } from 'react';
import { usePasskeyRegistration } from '@/hooks/usePasskey';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Plus, X, Fingerprint, Trash2, KeyRound } from 'lucide-react';

interface PasskeyCredential {
  id: string;
  displayName: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  transports: string | null;
}

const TRANSPORT_LABELS: Record<string, string> = {
  internal: 'Platform (Touch ID / Face ID / Hello)',
  hybrid:   'Hybrid (Phone)',
  usb:      'USB Security Key',
  nfc:      'NFC',
  ble:      'Bluetooth',
};

function formatDate(iso: string | null): string {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function parseTransports(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

const PasskeyManager: React.FC = () => {
  const { register } = usePasskeyRegistration();
  const [credentials, setCredentials] = useState<PasskeyCredential[]>([]);
  const [loading, setLoading]         = useState(true);
  const [adding, setAdding]           = useState(false);
  const [newName, setNewName]         = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);

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

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await register(newName.trim() || 'My Passkey');
      toast.success('Passkey registered.');
      setNewName('');
      setShowForm(false);
      await fetchCredentials();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('cancel') && !msg.includes('abort')) {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string | null) => {
    if (!window.confirm(`Remove "${name ?? 'this passkey'}"? You won't be able to sign in with it.`)) return;
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

  return (
    <div className="space-y-5">

      {/* Description + add toggle */}
      <div className="flex items-start justify-between gap-4">
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
        >
          Sign in with biometrics instead of Google&nbsp;&mdash; faster and phishing-resistant.
        </p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-colors"
          style={{
            background: showForm ? 'rgba(217,68,68,0.08)' : 'rgba(45,122,58,0.08)',
            color: showForm ? '#D94444' : '#2D7A3A',
          }}
          aria-label={showForm ? 'Cancel' : 'Add passkey'}
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>

      {/* Inline add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="flex items-end gap-3 p-4 rounded-md"
          style={{ background: '#F2F5F0', border: '1px solid #E2E8DF' }}
        >
          <div className="flex-1">
            <label
              className="block text-[10px] font-semibold uppercase tracking-[0.15em] mb-2"
              style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
            >
              Name (optional)
            </label>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. MacBook Touch ID"
              disabled={adding}
              className="w-full h-9 px-3 rounded-md text-[13px] outline-none transition-colors placeholder:opacity-30"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8DF',
                color: '#1A2E1A',
                fontFamily: 'Albert Sans, sans-serif',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(45,122,58,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E2E8DF')}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="h-9 px-5 rounded-md text-[12px] font-semibold uppercase tracking-wider shrink-0 transition-opacity disabled:opacity-50"
            style={{
              background: '#2D7A3A',
              color: '#FFFFFF',
              fontFamily: 'Albert Sans, sans-serif',
            }}
          >
            {adding ? 'Setting up\u2026' : 'Register'}
          </button>
        </form>
      )}

      {/* Credential list */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div
            className="w-5 h-5 rounded-full border-2 animate-spin"
            style={{ borderColor: '#2D7A3A', borderTopColor: 'transparent' }}
          />
        </div>
      ) : credentials.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-10 rounded-md"
          style={{ border: '1px dashed #E2E8DF' }}
        >
          <KeyRound size={24} style={{ color: '#E2E8DF', marginBottom: 10 }} />
          <p
            className="text-[13px] mb-1"
            style={{ color: '#6B7B6B', fontFamily: 'Albert Sans, sans-serif' }}
          >
            No passkeys registered
          </p>
          <p
            className="text-[11px]"
            style={{ color: '#6B7B6B', opacity: 0.5, fontFamily: 'Albert Sans, sans-serif' }}
          >
            Tap the + button to add one.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {credentials.map(cred => {
            const transports = parseTransports(cred.transports);
            const isDeleting = deletingId === cred.id;

            return (
              <li
                key={cred.id}
                className="flex items-center gap-4 p-4 rounded-md transition-colors"
                style={{ background: '#F2F5F0', border: '1px solid #E2E8DF' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#D0DAC9')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8DF')}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(45,122,58,0.08)' }}
                >
                  <Fingerprint size={15} style={{ color: '#2D7A3A' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-medium truncate"
                    style={{ color: '#1A2E1A', fontFamily: 'Albert Sans, sans-serif' }}
                  >
                    {cred.displayName ?? 'Passkey'}
                  </p>
                  <div
                    className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1"
                    style={{ fontFamily: 'Albert Sans, sans-serif' }}
                  >
                    {transports.length > 0 && (
                      <span className="text-[11px]" style={{ color: '#6B7B6B' }}>
                        {TRANSPORT_LABELS[transports[0]] ?? transports[0]}
                      </span>
                    )}
                    <span className="text-[11px]" style={{ color: '#6B7B6B', opacity: 0.5 }}>
                      Added {formatDate(cred.createdAt)}
                    </span>
                    {cred.lastUsedAt && (
                      <span className="text-[11px]" style={{ color: '#6B7B6B', opacity: 0.5 }}>
                        Last used {formatDate(cred.lastUsedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(cred.id, cred.displayName)}
                  disabled={isDeleting}
                  className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{ color: '#6B7B6B' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(217,68,68,0.08)';
                    e.currentTarget.style.color = '#D94444';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6B7B6B';
                  }}
                  aria-label="Remove passkey"
                >
                  <Trash2 size={13} />
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
