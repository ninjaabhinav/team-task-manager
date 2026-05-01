import { NavLink, useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">📋 TaskManager</div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <span>📊</span> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <span>📁</span> Projects
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <span>✅</span> Tasks
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span>⚙️</span> Admin
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{initials}</div>
            <div>
              <div className="user-name">{user.name || "User"}</div>
              <div className="user-role">{user.role || "member"}</div>
            </div>
          </div>
          <button className="logout-btn btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
