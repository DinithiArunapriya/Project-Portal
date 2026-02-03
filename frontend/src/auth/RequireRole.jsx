import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireRole({ allow, children }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
