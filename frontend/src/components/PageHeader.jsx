import React from "react";

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={styles.wrap}>
      <div>
        <h1 style={styles.h1}>{title}</h1>
        {subtitle ? <p style={styles.sub}>{subtitle}</p> : null}
      </div>

      {actions ? <div style={styles.actions}>{actions}</div> : null}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  h1: { margin: 0, fontSize: 22, fontWeight: 950 },
  sub: { margin: "6px 0 0", color: "#6b7280" },
  actions: { display: "flex", gap: 10, alignItems: "center" },
};
