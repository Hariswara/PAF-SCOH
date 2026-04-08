import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import api from '@/lib/api';

export function usePasskeyRegistration() {
  const register = async (displayName?: string): Promise<void> => {
    // 1. Fetch options from backend
    const { data: optionsJson } = await api.post<string>(
      '/auth/passkey/register/start',
      { displayName },
      { headers: { Accept: 'application/json' } }
    );

    const parsed = typeof optionsJson === 'string' ? JSON.parse(optionsJson) : optionsJson;
    // Yubico's toCredentialsCreateJson() wraps in { publicKey: {...} };
    // SimpleWebAuthn v8+ expects just the inner PublicKeyCredentialCreationOptionsJSON
    const options = parsed.publicKey ?? parsed;

    // 2. Trigger browser ceremony (Touch ID / Face ID / Windows Hello)
    const credential = await startRegistration({ optionsJSON: options });

    // 3. Send attestation response to backend
    const params = displayName ? `?displayName=${encodeURIComponent(displayName)}` : '';
    await api.post(`/auth/passkey/register/finish${params}`, {
      credentialJson: JSON.stringify(credential),
    });
  };

  return { register };
}

export function usePasskeyAuthentication() {
  const authenticate = async (): Promise<void> => {
    // 1. Fetch assertion options from backend
    const { data: optionsJson } = await api.post<string>(
      '/auth/passkey/login/start',
      {},
      { headers: { Accept: 'application/json' } }
    );

    const parsed = typeof optionsJson === 'string' ? JSON.parse(optionsJson) : optionsJson;
    // Same unwrapping as registration — Yubico wraps in { publicKey: {...} }
    const options = parsed.publicKey ?? parsed;

    // 2. Trigger browser authentication ceremony
    const credential = await startAuthentication({ optionsJSON: options });

    // 3. Send assertion response to backend — session cookie is set server-side
    await api.post('/auth/passkey/login/finish', {
      credentialJson: JSON.stringify(credential),
    });
  };

  return { authenticate };
}
