import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const STEPS = [
  {
    icon: "📄",
    emoji: "📄",
    label: "Upload",
    title: "Drop any PDF",
    desc: "Upload textbooks, research papers, or notes — NoteIQ processes them instantly into a searchable knowledge base.",
  },
  {
    icon: "🤖",
    emoji: "🤖",
    label: "Ask AI",
    title: "Ask anything",
    desc: "Ask questions in plain English. Get accurate, context-aware answers directly from your documents.",
  },
  {
    icon: "📍",
    emoji: "📍",
    label: "Sources",
    title: "See the source",
    desc: "Every answer includes exact page references so you can verify and explore deeper at any time.",
  },
  {
    icon: "⚡",
    emoji: "⚡",
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
    <div className="ob3-page">

      {/* Subtle bg blobs */}
      <div className="ob3-blob ob3-blob-1" />
      <div className="ob3-blob ob3-blob-2" />
      <div className="ob3-blob ob3-blob-3" />

      {/* Sparkles */}
      <span className="ob3-spark ob3-s1">✦</span>
      <span className="ob3-spark ob3-s2">✦</span>
      <span className="ob3-spark ob3-s3">+</span>
      <span className="ob3-spark ob3-s4">✦</span>
      <span className="ob3-spark ob3-s5">+</span>

      {/* ── Navbar ── */}
      <nav className="ob3-nav">
        <Logo size={38} showText={true} />
      </nav>

      {/* ── Main layout ── */}
      <div className="ob3-layout">

        {/* Left floating decorations */}
        <div className="ob3-deco-left">
          <div className="ob3-float-card ob3-fc-pdf">
            <div className="ob3-fc-pdf-icon">📕</div>
            <div className="ob3-fc-pdf-label">
              <div className="ob3-fc-name">Document.pdf</div>
              <div className="ob3-fc-sub">2.4 MB</div>
            </div>
          </div>
          <div className="ob3-float-card ob3-fc-book">
            <div style={{ fontSize: 38 }}>📘</div>
            <div className="ob3-fc-sub" style={{ marginTop: 6, textAlign: "center" }}>Study Notes</div>
          </div>
        </div>

        {/* Center content */}
        <div className="ob3-center">
          {/* Badge */}
          <div className="ob3-badge">✦ AI-Powered Study Assistant</div>

          {/* Hero */}
          <h1 className="ob3-title">
            Study Smarter.<br />
            <span className="ob3-title-grad">Learn With Ease.</span>
          </h1>

          <p className="ob3-subtitle">
            Turn any PDF into an interactive AI tutor.<br />
            Upload, ask, and get <strong>instant answers</strong> with source citations.
          </p>

          {/* CTA */}
          <button className="ob3-cta" onClick={handleStart}>
             Let's get started
          </button>

          {/* Feature tabs */}
          <div className="ob3-tabs">
            {STEPS.map((s, i) => (
              <button
                key={i}
                className={`ob3-tab ${active === i ? "active" : ""}`}
                onClick={() => setActive(i)}
              >
                <span>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>

          {/* Step card */}
          <div className="ob3-step-card" key={active}>
            <div className="ob3-step-icon">{STEPS[active].emoji}</div>
            <div>
              <div className="ob3-step-title">{STEPS[active].title}</div>
              <div className="ob3-step-desc">{STEPS[active].desc}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="ob3-stats">
            {STATS.map((s, i) => (
              <div key={i} className="ob3-stat">
                <span className="ob3-stat-icon">{s.icon}</span>
                <div className="ob3-stat-value">{s.value}</div>
                <div className="ob3-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Welcome */}
          {user?.name && (
            <div className="ob3-welcome">
              Welcome, <strong>{user.name.split(" ")[0]}</strong> — ready to study smarter?
            </div>
          )}
        </div>

        {/* Right floating decorations */}
        <div className="ob3-deco-right">
          <div className="ob3-float-card ob3-fc-chat">
            <div className="ob3-fc-chat-bubble ob3-fc-q">Ask anything about your PDF...</div>
            <div className="ob3-fc-chat-bubble ob3-fc-a">
              <span style={{ color: "#1d6ff5" }}>✓</span> Here's your answer with sources
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
