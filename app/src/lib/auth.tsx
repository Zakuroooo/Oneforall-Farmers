/**
 * Who is signed in. Three states, one source of truth.
 *
 * ★ We never decode the JWT on the device.
 *
 *   The obvious implementation reads the `role` claim out of the token with a
 *   base64 decode and branches on it. It works, and it quietly teaches everyone
 *   who reads it that routing is an authorization boundary. It is not. A tampered
 *   token gets 404s from the server, because every read is scoped by the actor the
 *   server derives from the signature (I4) — not by anything the client believes.
 *
 *   So the role comes from the server: `AuthRes.user` at sign-in, `GET /auth/me`
 *   on a cold start. One network call at boot, and no unverified claim anywhere in
 *   the app. If someone forges a role, they get a navigator full of 404s, which is
 *   the correct outcome and is also demonstrable on stage.
 *
 * ★ Ownership note: `07_FRONTEND_ARCHITECTURE.md` §1 lists `src/context/AuthContext`
 *   under Shreya, but the same section gives me `RootNavigator`, which cannot compile
 *   without it. Auth state is also inseparable from `lib/api.ts` — the token helpers
 *   and `getMe` both live there and both are mine. So it lands here. Blocker filed;
 *   if Shreya builds `context/AuthContext.tsx`, delete this and change one import.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ApiError, clearToken, getMe, getToken, setToken } from './api';
import { getLocale } from './locale';
import type { AuthRes, User } from '../types/api';

/**
 * `loading` is a real state, not a detail. It is the window between app launch and
 * the `/auth/me` round trip, and if the root renders `AuthStack` during it, a
 * returning farmer sees the language picker flash before his home screen. On a
 * ₹6,000 phone that flash is a quarter of a second and it looks broken.
 */
type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'signed-out'; user: null }
  | { status: 'signed-in'; user: User };

interface AuthContextValue {
  status: AuthState['status'];
  user: User | null;
  /**
   * Resolved in the same boot effect as the token, so it is available the instant
   * `AuthStack` first renders — no second flash while S1 decides whether to show
   * itself. `false` means S1 has never run on this device.
   */
  hasLocale: boolean;
  /** Call with the whole `AuthRes` from `verifyOtp` / `register`. */
  signIn: (res: AuthRes) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * The phone and the verified-or-not OTP code, in transit from S2 to S3.
 *
 * ★ I14. This is deliberately a module-level variable, not React state and not
 *   AsyncStorage. It never re-renders anything, it is never serialized, it does
 *   not survive a JS reload, and nothing outside S2/S3 ever touches it. Putting a
 *   phone number and a live OTP in navigation params or persisted storage is
 *   exactly the disclosure I14 exists to prevent — see the TODO this replaces in
 *   `AuthStack.tsx`.
 */
let pendingAuth: { phone: string; code: string } | null = null;

export function setPendingAuth(phone: string, code: string): void {
  pendingAuth = { phone, code };
}

export function getPendingAuth(): { phone: string; code: string } | null {
  return pendingAuth;
}

export function clearPendingAuth(): void {
  pendingAuth = null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });
  const [hasLocale, setHasLocale] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [token, locale] = await Promise.all([getToken(), getLocale()]);
      if (!cancelled) setHasLocale(locale !== null);

      if (!token) {
        if (!cancelled) setState({ status: 'signed-out', user: null });
        return;
      }

      try {
        const { user } = await getMe();
        if (!cancelled) setState({ status: 'signed-in', user });
      } catch (err) {
        // A 401 means the 72-hour token expired — normal, not an error worth
        // showing. Anything else (the API is down, we are on the plane) also lands
        // here, and signing the farmer out is the wrong answer for that case.
        // TODO(pranay): P8 adds the offline cache; then a network failure keeps the
        //   last known user and renders the stale banner instead of the login screen.
        if (err instanceof ApiError && err.status === 401) {
          await clearToken();
        }
        if (!cancelled) setState({ status: 'signed-out', user: null });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (res: AuthRes) => {
    await setToken(res.token);
    setState({ status: 'signed-in', user: res.user });
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setState({ status: 'signed-out', user: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status: state.status, user: state.user, hasLocale, signIn, signOut }),
    [state, hasLocale, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Throwing beats returning a null-ish default. A missing provider is a wiring
    // mistake that should fail at the first render, loudly, on your machine —
    // not silently render a logged-out app to a judge.
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
