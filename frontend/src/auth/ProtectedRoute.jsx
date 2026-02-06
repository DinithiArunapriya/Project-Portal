import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 16 }}>Loading...</div>;
  }

  if (isAuthenticated && user?.role === "HR") {
    const path = location?.pathname || "";
    if (!path.startsWith("/reports")) {
      return <Navigate to="/reports" replace />;
    }
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
