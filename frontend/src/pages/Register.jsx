import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    if (!form.name || !form.email || !form.password)
      return setError("Please fill in all fields");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
        <div className="auth-title">Create account</div>
        <div className="auth-sub">Join your team today</div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleRegister}
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <div className="auth-link">
          Already have an account?{" "}
          <Link to="/">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
