import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { usePerms } from "../auth/usePerms";
import { CAP } from "../auth/permissions";

export default function Sidebar({ variant = "desktop", onNavigate }) {
  const { user, logout } = useAuth();
  const { can } = usePerms();

  const Item = ({ to, label, end }) => (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      style={({ isActive }) => ({
        ...styles.item,
        ...(isActive ? styles.itemActive : {}),
      })}
    >
      {label}
    </NavLink>
  );

  return (
    <aside style={styles.wrap}>
      <div style={styles.top}>
        <div style={{ fontWeight: 950 }}>Project Portal</div>
        <div style={{ fontSize: 8, color: "#6b7280" }}>{user?.role}</div>
      </div>

      <nav style={styles.nav}>
        <Item to="/dashboard" label="Dashboard" end />
        <Item to="/projects" label="Projects" />
        <Item to="/tasks" label="Tasks" />

        {can(CAP.VIEW_USERS) ? <Item to="/users" label="Users" /> : null}
        {can(CAP.VIEW_REPORTS) ? <Item to="/reports" label="Reports" /> : null}
        {can(CAP.VIEW_SETTINGS) ? <Item to="/settings" label="Settings" /> : null}

        {can(CAP.VIEW_ADMIN) ? (
          <>
            <div style={styles.sectionLabel}>Admin</div>
            <Item to="/admin" label="Admin Dashboard" />
          </>
        ) : null}
      </nav>

      <div style={styles.footer}>
        <div style={{ fontSize: 12, color: "#6b7280" }}>Signed in as</div>
        <div style={{ fontWeight: 900 }}>{user?.name || "User"}</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>{user?.email || ""}</div>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

const styles = {
  wrap: { height: "100%", display: "flex", flexDirection: "column", padding: 12 },
  top: { padding: "10px 10px 12px", borderBottom: "1px solid #f3f4f6" },
  nav: { display: "flex", flexDirection: "column", gap: 6, padding: 10 },
  item: {
    padding: "10px 12px",
    borderRadius: 12,
    textDecoration: "none",
    color: "#111827",
    fontWeight: 900,
    border: "1px solid transparent",
  },
  // Use full border shorthand so we don't mix `border` and `borderColor` which causes
  // React to warn during rerenders.
  itemActive: { background: "#111827", color: "white", border: "1px solid #111827" },
  sectionLabel: {
    marginTop: 10,
    marginBottom: 6,
    padding: "0 12px",
    fontSize: 12,
    fontWeight: 900,
    color: "#6b7280",
  },
  footer: { marginTop: "auto", borderTop: "1px solid #f3f4f6", padding: 10 },
  logoutBtn: {
    marginTop: 12,
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },
};
