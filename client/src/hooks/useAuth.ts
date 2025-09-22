import { useState, useEffect } from "react";
import { verifyToken, logout } from "../services/api";

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const isValid = await verifyToken();
      setIsAdmin(isValid);
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAdmin(false);
      // Clear any invalid token
      logout();
    }
    setLoading(false);
  };


  useEffect(() => {
    // Always start as not admin on page load/refresh
    setIsAdmin(false);
    setLoading(false);
    // Clear any existing token on page load
    logout();
  }, []);

  const handleLogout = () => {
    logout();
    setIsAdmin(false);
  };

  const handleLogin = async (pwd: string) => {
    try {
      // Import login function dynamically to avoid circular imports
      const { login } = await import("../services/api");
      await login(pwd);
      // Refresh auth state after successful login
      await checkAuth();
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  return {
    isAdmin,
    loading,
    handleLogout,
    handleLogin,
    checkAuth,
  };
};
