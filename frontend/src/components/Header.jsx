import React from "react";
import { useAuth } from "../auth/AuthProvider";
import { useNotify } from "../notifications/NotificationProvider";

export default function Header({ onMenu }) {
  const { user, logout } = useAuth();
  const notify = useNotify();

  const onLogout = async () => {
    try {
      await logout();
      notify({ title: "Logged out", message: "You have been signed out.", type: "info" });
    } catch (e) {
      notify({ title: "Logout failed", message: e?.message || "Could not logout.", type: "error" });
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        {/* Mobile menu button */}
   <button className="mobileMenuBtn" style={styles.menuBtn} onClick={onMenu} aria-label="Open menu">
  ☰
</button>

        <div style={styles.brand}>Project Portal</div>
      </div>

      <div style={styles.right}>
        <div style={styles.user}>
          <div style={{ fontWeight: 900 }}>{user?.name || "User"}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{user?.role || ""}</div>
        </div>

        <button style={styles.btn} onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    height: 56,
    background: "white",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
  },
  left: { display: "flex", alignItems: "center", gap: 12 },
  brand: { fontWeight: 950 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  user: { textAlign: "right" },
  btn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
  },

  // Mobile menu button visible only on small screens (CSS will hide on desktop)
  menuBtn: {
    padding: "6px 10px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: "16px",
  },
};
