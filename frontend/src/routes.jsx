import React from "react";
import { Navigate } from "react-router-dom";

import DefaultLayout from "./layouts/DefaultLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import RequireRole from "./auth/RequireRole";

import Login from "./pages/Login";
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
import RequireCap from "./auth/RequireCap";
import { CAP } from "./auth/permissions";

export const routes = [
  // Public
  {
    element: <DefaultLayout />,
    children: [{ path: "/login", element: <Login /> }],
  },

  // Protected
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <Dashboard /> },

          { path: "/projects", element: <Projects /> },
          { path: "/projects/:id", element: <ProjectDetails /> },

          { path: "/users", element: <Users /> },

          { path: "/tasks", element: <Tasks /> },
          { path: "/tasks/:id", element: <TaskDetails /> },

          { path: "/reports", element: <Reports /> },
          { path: "/settings", element: <Settings /> },
          {
  path: "/users",
  element: (
    <RequireCap cap={CAP.VIEW_USERS}>
      <Users />
    </RequireCap>
  ),
},
{
  path: "/admin",
  element: (
    <RequireCap cap={CAP.VIEW_ADMIN}>
      <AdminDashboard />
    </RequireCap>
  ),
},

          // Admin
          {
            path: "/admin",
            element: (
              <RequireRole allow={["SUPER_ADMIN", "MANAGER"]}>
                <AdminDashboard />
              </RequireRole>
            ),
          },
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

  // 404
  { path: "*", element: <NotFound /> },
];

