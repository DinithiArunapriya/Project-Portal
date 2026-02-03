import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 260, borderRight: "1px solid #e5e7eb" }}>
        <Sidebar />
      </aside>

      <main style={{ flex: 1, padding: 20, overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}