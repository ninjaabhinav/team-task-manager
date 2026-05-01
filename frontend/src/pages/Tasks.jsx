import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

const STATUS_OPTIONS = ["todo", "in-progress", "done"];

const statusBadge = (status) => {
  if (status === "done") return <span className="badge badge-done">Done</span>;
  if (status === "in-progress") return <span className="badge badge-inprogress">In Progress</span>;
  return <span className="badge badge-todo">Todo</span>;
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", project: "", assignedTo: "" });
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const fetchAll = async () => {
    try {
      const [tRes, pRes] = await Promise.all([API.get("/tasks"), API.get("/projects")]);
      setTasks(tRes.data);
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
    setEditTask(null);
    setForm({ title: "", description: "", dueDate: "", project: "", assignedTo: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      project: task.project?._id || "",
      assignedTo: task.assignedTo?._id || ""
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return setError("Title is required");
    try {
      if (editTask) {
        await API.put(`/tasks/${editTask._id}`, form);
      } else {
        await API.post("/tasks", form);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving task");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    await API.delete(`/tasks/${id}`);
    fetchAll();
  };

  const handleStatusChange = async (id, status) => {
    await API.put(`/tasks/${id}`, { status });
    fetchAll();
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Tasks</div>
          <div className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? "s" : ""}</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Task</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✅</div>
            No tasks yet. Create one!
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const isOverdue =
                  task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== "done";
                return (
                  <tr key={task._id}>
                    <td>
                      <strong>{task.title}</strong>
                      {task.description && (
                        <div style={{ fontSize: 12, color: "var(--gray-400)" }}>
                          {task.description.slice(0, 50)}
                        </div>
                      )}
                    </td>
                    <td>{task.project?.name || <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
                    <td>{task.assignedTo?.name || <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
                    <td>
                      {task.dueDate ? (
                        <span style={isOverdue ? { color: "var(--danger)", fontWeight: 600 } : {}}>
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue && " ⚠️"}
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        style={{ width: "auto", fontSize: 12 }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(task)}>
                          Edit
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(task._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editTask ? "Edit Task" : "New Task"}</div>
            {error && <div className="alert alert-error">{error}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="form-group">
                <label>Project</label>
                <select
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {isAdmin && (
                <div className="form-group">
                  <label>Assign To</label>
                  <select
                    value={form.assignedTo}
                    onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                  >
                    <option value="">Assign to me</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editTask ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
