import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("auth_state_v1");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed?.user || null);
        setToken(parsed?.token || null);
      } catch {
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    const payload = {
      user: authData?.user || null,
      token: authData?.token || null,
    };
    localStorage.setItem("auth_state_v1", JSON.stringify(payload));
    setUser(payload.user);
    setToken(payload.token);
  };

  const setUserAndPersist = (nextUser) => {
    const payload = { user: nextUser, token };
    localStorage.setItem("auth_state_v1", JSON.stringify(payload));
    setUser(nextUser);
  };

  const setTokenAndPersist = (nextToken) => {
    const payload = { user, token: nextToken };
    localStorage.setItem("auth_state_v1", JSON.stringify(payload));
    setToken(nextToken);
  };

  const logout = () => {
    localStorage.removeItem("auth_state_v1");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        setUser: setUserAndPersist,
        setToken: setTokenAndPersist,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider />");
  }
  return ctx;
}
