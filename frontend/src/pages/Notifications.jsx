import React from "react";
import { listNotifications, markRead, markAllRead } from "../notifications/notificationsApi";

export default function Notifications() {
  const [items, setItems] = React.useState([]);

  const load = async () => {
    const data = await listNotifications();
    setItems(data);
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h1>Notifications</h1>
        <button onClick={() => { markAllRead(); load(); }}>Mark all read</button>
      </div>

      {items.map((n) => (
        <div
          key={n.id}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            marginBottom: 10,
            background: n.read ? "#f8fafc" : "white",
          }}
          onClick={() => { markRead(n.id); load(); }}
        >
          <div style={{ fontWeight: 900 }}>{n.title}</div>
          <div style={{ color: "#6b7280" }}>{n.message}</div>
        </div>
      ))}

      {items.length === 0 && <div>No notifications.</div>}
    </div>
  );
}
