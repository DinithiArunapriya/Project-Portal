import { Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import AddProject from "./pages/AddProject"; // ✅ new page
import ProjectDetails from "./pages/ProjectDetails"; // ✅ new page

const App = () => (
  <Routes>
    <Route path="/" element={<RoleSelection />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/add-project" element={<AddProject />} /> {/* new route */}
    <Route path="/project-details" element={<ProjectDetails />} /> {/* view redirect */}
  </Routes>
);

export default App;
