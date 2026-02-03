import React from "react";
import { addNotification } from "./notificationsApi";

const NotificationContext = React.createContext(null);

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const notify = React.useCallback(async ({ title, message, type }) => {
    const n = await addNotification({ title, message, type });

    setToasts((prev) => [...prev, n]);

    // auto-hide after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== n.id));
    }, 3000);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <ToastContainer toasts={toasts} />
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) throw new Error("useNotify must be used within <NotificationProvider />");
  return ctx.notify;
}

function ToastContainer({ toasts }) {
  return (
    <div style={styles.wrap}>
      {toasts.map((t) => (
        <div key={t.id} style={{ ...styles.toast, ...styles[t.type || "info"] }}>
          <div style={{ fontWeight: 900 }}>{t.title || "Notification"}</div>
          <div style={{ fontSize: 13 }}>{t.message || ""}</div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrap: {
    position: "fixed",
    top: 16,
    right: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 9999,
  },
  toast: {
    background: "white",
    borderRadius: 12,
    padding: 12,
    border: "1px solid #e5e7eb",
    minWidth: 260,
    boxShadow: "0 10px 20px rgba(0,0,0,.1)",
  },
  success: { borderLeft: "4px solid #22c55e" },
  error: { borderLeft: "4px solid #ef4444" },
  info: { borderLeft: "4px solid #3b82f6" },
};
