import React from "react";
import { Navigate } from "react-router-dom";

import DefaultLayout from "./layouts/DefaultLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import RequireRole from "./auth/RequireRole";
import RequireCap from "./auth/RequireCap";
import { CAP } from "./auth/permissions";

import Login from "./pages/Login";
import AuthLogin from "./pages/AuthLogin"; 
import Dashboard from "./pages/Dashboard";

import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";

import Users from "./pages/Users";

import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";

import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import AdminRoles from "./pages/AdminRoles";
import AdminDashboard from "./pages/AdminDashboard";
import EmailMappings from "./pages/EmailMappings";
import AuthDemo from "./pages/AuthDemo";

import NotFound from "./pages/NotFound";

export const routes = [
  // ─────────────────────────────
  // Public routes
  // ─────────────────────────────
  {
    element: <DefaultLayout />,
    children: [
      { path: "/login", element: <Login /> },          // existing demo login
      { path: "/auth-login", element: <AuthLogin /> }, // ✅ NEW simple right-pane login
    ],
  },

  // ─────────────────────────────
  // Protected routes
  // ─────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <Dashboard /> },

          // Projects
          { path: "/projects", element: <Projects /> },
          { path: "/projects/:id", element: <ProjectDetails /> },

          // Users
          {
            path: "/users",
            element: (
              <RequireCap cap={CAP.VIEW_USERS}>
                <Users />
              </RequireCap>
            ),
          },

          // Tasks
          { path: "/tasks", element: <Tasks /> },
          { path: "/tasks/:id", element: <TaskDetails /> },

          // Reports & Settings
          { path: "/reports", element: <Reports /> },
          { path: "/settings", element: <Settings /> },

          // Admin dashboard
          {
            path: "/admin",
            element: (
              <RequireCap cap={CAP.VIEW_ADMIN}>
                <RequireRole allow={["SUPER_ADMIN", "MANAGER"]}>
                  <AdminDashboard />
                </RequireRole>
              </RequireCap>
            ),
          },

          // Admin sub-routes
          {
            path: "/admin/roles",
            element: (
              <RequireRole allow={["SUPER_ADMIN"]}>
                <AdminRoles />
              </RequireRole>
            ),
          },
          {
            path: "/admin/email-mappings",
            element: (
              <RequireRole allow={["SUPER_ADMIN"]}>
                <EmailMappings />
              </RequireRole>
            ),
          },
          {
            path: "/admin/auth-demo",
            element: (
              <RequireRole allow={["SUPER_ADMIN", "MANAGER"]}>
                <AuthDemo />
              </RequireRole>
            ),
          },
        ],
      },
    ],
  },

  // ─────────────────────────────
  // 404
  // ─────────────────────────────
  {
    path: "*",
    element: <NotFound />,
  },
];
