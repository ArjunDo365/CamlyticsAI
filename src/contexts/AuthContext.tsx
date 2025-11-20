import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState } from "../types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,

    // Add registration & license states
    isRegistered: false,
    isLicensed: false,
    data_id: 0
  });

  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // 🔵 INITIAL LOAD (registration → activation → login)
  // ----------------------------------------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        const registration = await window.electronAPI.isRegistered();
        const license = await window.electronAPI.isLicensed();
        const storedToken = localStorage.getItem("token");

        // 1️⃣ Not Registered → stop here
        if (!registration.registered) {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isRegistered: false,
            isLicensed: false,
            data_id: 0
          });
          setLoading(false);
          return;
        }

        // 2️⃣ Registered but not Licensed → activation needed
        if (registration.registered && !license.licensed) {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isRegistered: true,
            isLicensed: false,
            data_id: registration.data_id
          });
          setLoading(false);
          return;
        }

        // 3️⃣ Registered & Licensed but no token → login needed
        if (!storedToken) {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isRegistered: true,
            isLicensed: true,
            data_id: registration.data_id
          });
          setLoading(false);
          return;
        }

        // 4️⃣ Full check → verify token
        const verify = await window.electronAPI.verifyToken(storedToken);

        if (verify.success) {
          setAuthState({
            user: verify.user,
            token: storedToken,
            isAuthenticated: true,
            isRegistered: true,
            isLicensed: true,
            data_id: registration.data_id
          });
        } else {
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Auth Init Error:", error);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ----------------------------------------------------
  // 🔵 LOGIN
  // ----------------------------------------------------
  const login = async (email: string, password: string): Promise<boolean> => {
    
    try {
      const result = await window.electronAPI.login({ email, password });

      if (result.success) {
        localStorage.setItem("token", result.token);

        setAuthState((prev) => ({
          ...prev,
          user: result.user,
          token: result.token,
          isAuthenticated: true
        }));

        return true;
      }
      return false;
    } catch (err) {
      console.error("Login Error:", err);
      return false;
    }
  };

  // ----------------------------------------------------
  // 🔵 LOGOUT
  // ----------------------------------------------------
  const logout = () => {
    localStorage.removeItem("token");
    setAuthState((prev) => ({
      ...prev,
      user: null,
      token: null,
      isAuthenticated: false
    }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
