import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "../toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login({ access_token: data.access_token, refresh_token: data.refresh_token }, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="auth-grid" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-wrap">
          <Logo size={48} showText={true} />
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to continue to NoteIQ</p>

        <form onSubmit={submit} className="auth-form">
          <div className="auth-field">
            <label>Email address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
                required
                autoFocus
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </span>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handle}
                required
                className="auth-input"
              />
            </div>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="auth-btn-loading"><span className="spinner-sm" /> Signing in...</span>
            ) : (
              <>Sign in <span className="auth-btn-arrow">→</span></>
            )}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
