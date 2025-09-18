import { useState, useEffect } from "react";
import { verifyToken, logout, isAuthenticated } from "../services/api";

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    if (isAuthenticated()) {
      try {
        const isValid = await verifyToken();
        setIsAdmin(isValid);
      } catch (err) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
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
