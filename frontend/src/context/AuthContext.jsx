import { createContext, useContext, useState, useEffect } from "react";
import { auth as authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authApi.me().then((res) => setUser(res.user)).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(phone, password) {
    const res = await authApi.login({ phone, password });
    localStorage.setItem("token", res.token);
    setUser(res.user);
    return res;
  }

  async function register(data) {
    const res = await authApi.register(data);
    localStorage.setItem("token", res.token);
    setUser(res.user);
    return res;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
