import React from "react";
import { Navigate } from "react-router-dom";
import { usePerms } from "./usePerms";

export default function RequireCap({ cap, children }) {
  const { can } = usePerms();
  if (!can(cap)) return <Navigate to="/dashboard" replace />;
  return children;
}
