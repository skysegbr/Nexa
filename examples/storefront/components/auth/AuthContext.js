import { createContext, useCallback, useMemo, useState } from "/dist/nexa.js";

export const AuthContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

// Domain state hook — a deliberately fake sign-in (name only, no real
// backend) so the example stays focused on the cross-domain wiring instead
// of a real auth flow. See docs/AI_SPEC.md §11 "Domain-owned context".
export function useAuthState() {
  const [user, setUser] = useState(null);

  const login = useCallback((name) => setUser({ name }), []);
  const logout = useCallback(() => setUser(null), []);

  return useMemo(() => ({ user, login, logout }), [user, login, logout]);
}
