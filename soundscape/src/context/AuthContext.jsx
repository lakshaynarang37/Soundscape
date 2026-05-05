import { useEffect, useState } from "react";
import { getAccessToken, logout as doLogout, isLoggedIn } from "../api/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (isLoggedIn()) {
          const t = await getAccessToken();
          setToken(t);
        }
      } catch (e) {
        console.warn("Auth init failed:", e.message);
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
    <AuthContext.Provider
      value={{
        token,
        setToken,
        loading,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
