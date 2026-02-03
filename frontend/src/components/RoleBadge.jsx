import React from "react";

export default function RoleBadge({ role }) {
  const map = {
    SUPER_ADMIN: { bg: "#fee2e2", fg: "#991b1b" },
    MANAGER: { bg: "#e0e7ff", fg: "#3730a3" },
    BUSINESS_ANALYST: { bg: "#e0f2fe", fg: "#075985" },
    DEVELOPER: { bg: "#dcfce7", fg: "#166534" },
    DESIGNER: { bg: "#fce7f3", fg: "#9d174d" },
    HR: { bg: "#fef3c7", fg: "#92400e" },
    VIEWER: { bg: "#f3f4f6", fg: "#374151" },
  };

  const c = map[role] || { bg: "#f3f4f6", fg: "#374151" };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {role || "—"}
    </span>
  );
}
