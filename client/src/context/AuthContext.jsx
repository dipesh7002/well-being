import { createContext, useEffect, useMemo, useState } from "react";
import { clearStoredAuth, getStoredAuth, http, persistAuth, setAuthToken } from "../api/http";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredAuth()?.token || null);
  const [user, setUser] = useState(() => getStoredAuth()?.user || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!user?.themePreference) {
      document.documentElement.dataset.theme = "sunrise";
      return;
    }

    document.documentElement.dataset.theme = user.themePreference;
  }, [user?.themePreference]);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await http.get("/auth/me");
        const nextUser = response.data.user;
        setUser(nextUser);
        persistAuth({ token, user: nextUser });
      } catch (error) {
        setToken(null);
        setUser(null);
        clearStoredAuth();
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      async login(payload) {
        const response = await http.post("/auth/login", payload);
        setAuthToken(response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        persistAuth(response.data);
        return response.data.user;
      },
      async register(payload) {
        const response = await http.post("/auth/register", payload);
        setAuthToken(response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        persistAuth(response.data);
        return response.data.user;
      },
      async logout() {
        try {
          if (token) {
            await http.post("/auth/logout");
          }
        } finally {
          setToken(null);
          setUser(null);
          clearStoredAuth();
          setAuthToken(null);
        }
      },
      updateUser(nextUser) {
        setUser(nextUser);
        persistAuth({ token, user: nextUser });
      }
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
