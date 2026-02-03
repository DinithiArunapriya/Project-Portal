import React from "react";

export default function Card({ children, style }) {
  return (
    <div style={{ ...styles.card, ...style }}>
      {children}
    </div>
  );
}

const styles = {
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
  },
};
