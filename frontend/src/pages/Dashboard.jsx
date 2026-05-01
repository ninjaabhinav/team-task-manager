import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/Layout";

const statusBadge = (status) => {
  if (status === "done") return <span className="badge badge-done">Done</span>;
  if (status === "in-progress") return <span className="badge badge-inprogress">In Progress</span>;
  return <span className="badge badge-todo">Todo</span>;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get("/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: "center", color: "var(--gray-400)" }}>
          Loading...
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Welcome back, {user.name} </div>
        </div>
      </div>

      {data && (
        <>
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{data.total}</div>
            </div>
            <div className="stat-card green">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{data.completed}</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-label">In Progress</div>
              <div className="stat-value">{data.inProgress}</div>
            </div>
            <div className="stat-card red">
              <div className="stat-label">Overdue</div>
              <div className="stat-value">{data.overdue}</div>
            </div>
            {data.adminStats && (
              <>
                <div className="stat-card blue">
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{data.adminStats.totalUsers}</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-label">Projects</div>
                  <div className="stat-value">{data.adminStats.totalProjects}</div>
                </div>
              </>
            )}
          </div>

          {data.overdueTasks?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">⚠️ Overdue Tasks</div>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overdueTasks.map((t) => (
                    <tr key={t._id}>
                      <td>{t.title}</td>
                      <td style={{ color: "var(--danger)" }}>
                        {new Date(t.dueDate).toLocaleDateString()}
                      </td>
                      <td>{statusBadge(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Tasks</div>
            </div>
            {data.recentTasks?.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"></div>
                No tasks yet
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assigned To</th>
                    <th>Project</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTasks?.map((t) => (
                    <tr key={t._id}>
                      <td>{t.title}</td>
                      <td>{t.assignedTo?.name || "—"}</td>
                      <td>{t.project?.name || "—"}</td>
                      <td>{statusBadge(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
