import { createContext, useContext, useEffect, useState } from 'react';
import { getAccessToken, logout as doLogout, isLoggedIn } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (isLoggedIn()) {
          const t = await getAccessToken();
          setToken(t);
        }
      } catch (e) {
        console.warn('Auth init failed:', e.message);
        doLogout();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function logout() {
    doLogout();
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{
      token,
      setToken,
      loading,
      logout,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
