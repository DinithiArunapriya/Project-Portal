import React from "react";

export default function Table({ children }) {
  return <table style={styles.table}>{children}</table>;
}

export function Th({ children, style }) {
  return <th style={{ ...styles.th, ...style }}>{children}</th>;
}

export function Td({ children, style, colSpan }) {
  return (
    <td style={{ ...styles.td, ...style }} colSpan={colSpan}>
      {children}
    </td>
  );
}

const styles = {
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 900,
    padding: "10px 8px",
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "12px 8px",
    borderBottom: "1px solid #f3f4f6",
    verticalAlign: "top",
  },
};
