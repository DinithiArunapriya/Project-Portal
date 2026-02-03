import React from "react";
import { Outlet } from "react-router-dom";

export default function DefaultLayout() {
  return (
    <div style={{ padding: 24 }}>
      <Outlet />
    </div>
  );
}
