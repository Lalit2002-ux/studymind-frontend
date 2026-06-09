import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: "#1d6ff5",
    glow: "rgba(29,111,245,0.2)",
    title: "Upload PDFs",
    desc: "Drop any PDF — textbooks, research papers, notes — and NoteIQ processes it instantly.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: "#a855f7",
    glow: "rgba(168,85,247,0.2)",
    title: "Ask Anything",
    desc: "Ask questions in plain English and get accurate, context-aware answers from your documents.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.2)",
    title: "Source Citations",
    desc: "Every answer includes exact page references so you can verify and explore deeper.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.2)",
    title: "Instant AI Tools",
    desc: "Generate summaries, study notes, quizzes, and key concepts from any document in seconds.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    localStorage.setItem("noteiq_onboarded", "1");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="ob-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="auth-grid" />
      </div>

      <div className="ob-content">
        {/* Logo */}
        <div className="ob-logo">
          <Logo size={52} showText={true} />
        </div>

        {/* Heading */}
        <div className="ob-hero">
          <div className="ob-badge">✦ AI-Powered Study Assistant</div>
          <h1 className="ob-title">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!<br />
            <span className="ob-title-gradient">Study smarter, not harder.</span>
          </h1>
          <p className="ob-subtitle">
            NoteIQ turns your PDFs into an interactive knowledge base.<br />
            Ask questions, get answers, and learn faster with AI.
          </p>
        </div>

        {/* Feature cards */}
        <div className="ob-features">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="ob-card"
              style={{ animationDelay: `${0.1 + i * 0.1}s`, "--card-glow": f.glow, "--card-color": f.color }}
            >
              <div className="ob-card-icon" style={{ background: f.glow, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="ob-card-title">{f.title}</h3>
              <p className="ob-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="ob-cta">
          <button className="ob-start-btn" onClick={handleStart}>
            Let's Get Started
            <span className="ob-btn-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          <p className="ob-cta-sub">Upload your first PDF and start asking questions</p>
        </div>
      </div>
    </div>
  );
}
