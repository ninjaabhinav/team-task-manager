import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchAll = async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/stats")
      ]);
      setUsers(uRes.data);
      setStats(sRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await API.put(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch (err) {
      alert(err.response?.data?.message || "Error updating role");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting user");
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Admin Panel</div>
          <div className="page-subtitle">Manage users and system settings</div>
        </div>
      </div>

      {stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card blue">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Total Projects</div>
            <div className="stat-value">{stats.totalProjects}</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-value">{stats.totalTasks}</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Completed</div>
            <div className="stat-value">{stats.completedTasks}</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Overdue</div>
            <div className="stat-value">{stats.overdueTasks}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">👥 User Management</div>
          <div style={{ fontSize: 13, color: "var(--gray-400)" }}>
            {users.length} user{users.length !== 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading...</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30,
                        borderRadius: "50%",
                        background: u.role === "admin" ? "var(--primary)" : "var(--gray-200)",
                        color: u.role === "admin" ? "white" : "var(--gray-600)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 600, fontSize: 12, flexShrink: 0
                      }}>
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                      {u._id === currentUser.id && (
                        <span style={{ fontSize: 11, color: "var(--gray-400)" }}>(you)</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: "var(--gray-600)" }}>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role === "admin" ? "admin" : "member"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: "var(--gray-400)", fontSize: 13 }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {u._id !== currentUser.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          style={{ width: "auto", fontSize: 12, padding: "4px 8px" }}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(u._id)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--gray-400)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
