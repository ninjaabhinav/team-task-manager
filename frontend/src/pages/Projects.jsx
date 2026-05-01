import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const fetchAll = async () => {
    try {
      const [pRes] = await Promise.all([API.get("/projects")]);
      setProjects(pRes.data);
      if (isAdmin) {
        const uRes = await API.get("/admin/users");
        setUsers(uRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditProject(null);
    setForm({ name: "", description: "", members: [] });
    setError("");
    setShowModal(true);
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      name: project.name,
      description: project.description || "",
      members: project.members?.map((m) => m._id) || []
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError("Project name is required");
    try {
      if (editProject) {
        await API.put(`/projects/${editProject._id}`, form);
      } else {
        await API.post("/projects", form);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving project");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    await API.delete(`/projects/${id}`);
    fetchAll();
  };

  const toggleMember = (uid) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(uid)
        ? f.members.filter((id) => id !== uid)
        : [...f.members, uid]
    }));
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Projects</div>
          <div className="page-subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""}</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>+ New Project</button>
        )}
      </div>

      {loading ? (
        <div className="empty">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">📁</div>
            No projects yet.{isAdmin ? " Create one!" : " Ask an admin to create one."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {projects.map((project) => (
            <div key={project._id} className="card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div>
                  <div className="card-title">📁 {project.name}</div>
                  <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>
                    By {project.createdBy?.name || "Unknown"}
                  </div>
                </div>
                {isAdmin && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(project)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project._id)}>Delete</button>
                  </div>
                )}
              </div>
              {project.description && (
                <p style={{ color: "var(--gray-600)", fontSize: 13, marginBottom: 12 }}>
                  {project.description}
                </p>
              )}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-400)", marginBottom: 6 }}>
                  MEMBERS ({project.members?.length || 0})
                </div>
                {project.members?.length === 0 ? (
                  <span style={{ fontSize: 12, color: "var(--gray-400)" }}>No members</span>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {project.members?.map((m) => (
                      <span key={m._id} style={{
                        background: "var(--primary-light)",
                        color: "var(--primary)",
                        padding: "2px 10px",
                        borderRadius: 99,
                        fontSize: 12
                      }}>
                        {m.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 12 }}>
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editProject ? "Edit Project" : "New Project"}</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What is this project about?"
                />
              </div>
              {users.length > 0 && (
                <div className="form-group">
                  <label>Members</label>
                  <div style={{ border: "1px solid var(--gray-200)", borderRadius: 8, padding: 10, maxHeight: 160, overflowY: "auto" }}>
                    {users.map((u) => (
                      <label key={u._id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={form.members.includes(u._id)}
                          onChange={() => toggleMember(u._id)}
                          style={{ width: "auto" }}
                        />
                        <span>{u.name}</span>
                        <span style={{ color: "var(--gray-400)", fontSize: 12 }}>{u.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editProject ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
