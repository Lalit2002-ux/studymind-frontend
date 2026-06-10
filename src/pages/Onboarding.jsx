import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const STEPS = [
  {
    icon: "📄",
    label: "Upload",
    title: "Drop any PDF",
    desc: "Upload textbooks, research papers, or notes — NoteIQ processes them instantly into a searchable knowledge base.",
  },
  {
    icon: "🤖",
    label: "Ask AI",
    title: "Ask anything",
    desc: "Ask questions in plain English. Get accurate, context-aware answers directly from your documents.",
  },
  {
    icon: "📍",
    label: "Sources",
    title: "See the source",
    desc: "Every answer includes exact page references so you can verify and explore deeper at any time.",
  },
  {
    icon: "⚡",
    label: "Tools",
    title: "Instant AI tools",
    desc: "Generate summaries, study notes, quizzes, and key concepts from any document in seconds.",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [active, setActive] = useState(0);

  const handleStart = () => {
    localStorage.setItem("noteiq_onboarded", "1");
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="ob2-page">
      {/* Cloud background */}
      <div className="ob2-bg" />
      <div className="ob2-overlay" />

      {/* Floating sparkles */}
      <span className="ob2-spark ob2-spark-1">✦</span>
      <span className="ob2-spark ob2-spark-2">✦</span>
      <span className="ob2-spark ob2-spark-3">+</span>
      <span className="ob2-spark ob2-spark-4">✦</span>

      <div className="ob2-wrap">

        {/* Top nav bar */}
        <nav className="ob2-nav">
          <Logo size={36} showText={true} />
          <button className="ob2-skip" onClick={handleStart}>
            Skip →
          </button>
        </nav>

        {/* Hero */}
        <div className="ob2-hero">
          <div className="ob2-badge">✦ AI-Powered Study Assistant</div>

          <h1 className="ob2-title">
            Study Smarter.<br />
            <span className="ob2-title-blue">Learn With Ease.</span>
          </h1>

          <p className="ob2-subtitle">
            Turn any PDF into an interactive AI tutor. Upload, ask, and get
            <strong> instant answers</strong> with source citations.
          </p>

          <button className="ob2-cta" onClick={handleStart}>
            <span className="ob2-cta-icon">🚀</span>
            Let's get started
          </button>
        </div>

        {/* Feature tabs */}
        <div className="ob2-tabs-wrap">
          <div className="ob2-tabs">
            {STEPS.map((s, i) => (
              <button
                key={i}
                className={`ob2-tab ${active === i ? "active" : ""}`}
                onClick={() => setActive(i)}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* Active step detail card */}
          <div className="ob2-step-card" key={active}>
            <div className="ob2-step-icon">{STEPS[active].icon}</div>
            <div>
              <div className="ob2-step-title">{STEPS[active].title}</div>
              <div className="ob2-step-desc">{STEPS[active].desc}</div>
            </div>
          </div>
        </div>

        {/* Welcome message */}
        {user?.name && (
          <div className="ob2-welcome">
            Welcome, <strong>{user.name.split(" ")[0]}</strong> — ready to study smarter?
          </div>
        )}
      </div>
    </div>
  );
}
