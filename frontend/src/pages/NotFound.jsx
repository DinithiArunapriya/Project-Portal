import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h1>404 - Not Found</h1>
      <Link to="/dashboard">Go Dashboard</Link>
    </div>
  );
}
