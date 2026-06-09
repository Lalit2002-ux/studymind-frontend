import { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api.get("/auth/me")
        .then(({ data }) => setUser(data))
        .catch((err) => {
          // Only clear tokens on auth failure, not network errors
          if (err.response?.status === 401) {
            localStorage.clear();
          } else {
            // Network error or backend down — keep tokens, try to use them
            // Decode the token to at least get the user id so UI doesn't break
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              if (payload.exp * 1000 > Date.now()) {
                // Token not yet expired — restore minimal user state from localStorage
                const saved = localStorage.getItem("user");
                if (saved) setUser(JSON.parse(saved));
              } else {
                localStorage.clear();
              }
            } catch {
              localStorage.clear();
            }
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (tokens, userData) => {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
