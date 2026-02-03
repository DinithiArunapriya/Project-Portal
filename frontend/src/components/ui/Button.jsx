import React from "react";

export default function Button({ children, variant = "default", style, ...props }) {
  const v =
    variant === "primary"
      ? styles.primary
      : variant === "danger"
        ? styles.danger
        : styles.default;

  return (
    <button style={{ ...styles.base, ...v, ...style }} {...props}>
      {children}
    </button>
  );
}

const styles = {
  base: {
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    border: "1px solid #e5e7eb",
    background: "white",
    height: 42,
  },
  default: {},
  primary: {
    border: "1px solid #111827",
    background: "#111827",
    color: "white",
  },
  danger: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#991b1b",
  },
};
