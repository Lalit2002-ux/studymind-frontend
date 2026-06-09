import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "../toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";

// ── Markdown renderer ──────────────────────────────────────────────────────────
function MD({ text }) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^#### (.+)$/gm, "<h4 style='margin:8px 0 4px;font-size:13px'>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3 style='margin:10px 0 5px;font-size:14px'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h3 style='margin:10px 0 6px;font-size:15px'>$1</h3>")
    .replace(/^[•\-\*] (.+)$/gm, "<li>$1</li>")
    .replace(/\n(<li>)/g, "$1")
    .replace(/(<\/li>)\n(?!<li>)/g, "$1</ul><br/>")
    .replace(/(?<!<\/li>)\n(<li>)/g, "<ul>$1")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  return (
    <div
      className="md-content"
      dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
    />
  );
}

// ── PDF page image (fetches with auth header) ──────────────────────────────────
function PageImage({ documentId, pageNum, onImageReady }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const effectivePage = pageNum || 1;
    if (!documentId) { setLoading(false); return; }
    let blobUrl = null;
    setLoading(true);
    setUrl(null);
    api
      .get(`/rag/documents/${documentId}/page/${effectivePage}/image`, { responseType: "blob" })
      .then((res) => {
        blobUrl = URL.createObjectURL(res.data);
        setUrl(blobUrl);
        onImageReady?.(blobUrl);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
  }, [documentId, pageNum]);

  if (loading)
    return (
      <div className="rp-page-placeholder">
        <div className="spinner-sm" />
      </div>
    );
  if (!url) return (
    <div className="rp-page-placeholder" style={{ flexDirection: "column", gap: 8, padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 28 }}>📂</div>
      <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>PDF file missing</div>
      <div style={{ fontSize: 12, color: "#a0b8d0", lineHeight: 1.5 }}>The original file was deleted.<br/>Re-upload the PDF to restore preview.</div>
    </div>
  );
  return (
    <div style={{ position: "relative", cursor: "zoom-in" }} title="Click to zoom">
      <img src={url} alt={`Page ${pageNum}`} className="rp-page-img" />
      <div style={{
        position: "absolute", bottom: 8, right: 8,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        color: "#fff", fontSize: 11, padding: "3px 8px",
        borderRadius: 5, pointerEvents: "none",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        🔍 Click to zoom
      </div>
    </div>
  );
}

// ── Image lightbox ────────────────────────────────────────────────────────────
function ImageLightbox({ src, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  const zoomIn  = () => setZoom((z) => Math.min(z + 0.25, 4));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const reset   = () => { setZoom(1); setPos({ x: 0, y: 0 }); };

  const onKeyDown = useCallback((e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "+" || e.key === "=") zoomIn();
    if (e.key === "-") zoomOut();
    if (e.key === "0") reset();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onKeyDown]);

  const onWheel = (e) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.001, 0.5), 4));
  };

  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const onMouseUp = () => setDragging(false);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.92)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)",
          padding: "8px 16px", borderRadius: 40,
          border: "1px solid rgba(255,255,255,0.15)",
          zIndex: 10000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={zoomOut} style={btnStyle} title="Zoom out (-)">－</button>
        <span style={{ fontSize: 13, color: "#fff", minWidth: 44, textAlign: "center", fontWeight: 600 }}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={zoomIn}  style={btnStyle} title="Zoom in (+)">＋</button>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
        <button onClick={reset}   style={btnStyle} title="Reset (0)">⊙</button>
        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
        <button onClick={onClose} style={{ ...btnStyle, color: "#f87171" }} title="Close (Esc)">✕</button>
      </div>

      {/* Image */}
      <div
        style={{ overflow: "hidden", cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-out", maxWidth: "90vw", maxHeight: "85vh" }}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={(e) => { e.stopPropagation(); if (zoom <= 1) onClose(); }}
      >
        <img
          src={src}
          alt="Page preview"
          draggable={false}
          style={{
            maxWidth: "88vw", maxHeight: "82vh",
            transform: `scale(${zoom}) translate(${pos.x / zoom}px, ${pos.y / zoom}px)`,
            transformOrigin: "center center",
            transition: dragging ? "none" : "transform 0.15s ease",
            borderRadius: 8,
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            display: "block",
            userSelect: "none",
          }}
        />
      </div>

      {/* Hint */}
      <div style={{ position: "fixed", bottom: 20, fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: .4 }}>
        Scroll to zoom · Drag to pan · Esc to close
      </div>
    </div>
  );
}

const btnStyle = {
  width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
  border: "none", color: "#fff", fontSize: 16, cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "background .15s",
};

// ── Quick-action presets ──────────────────────────────────────────────────────
const QUICK = [
  { label: "📋 Summarize PDF",       q: "Please provide a comprehensive summary of this document." },
  { label: "✏️ Create Notes",         q: "Create structured study notes from this document." },
  { label: "💡 Key Concepts",         q: "What are the key concepts in this document?" },
  { label: "❓ Important Questions",  q: "Generate 5 important study questions from this document." },
  { label: "🧪 Generate Quiz",        q: "Create a 5-question multiple-choice quiz based on this document." },
];

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();

  // Data
  const [chats,      setChats]      = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages,   setMessages]   = useState([]);
  const [docs,       setDocs]       = useState([]);
  const [stats,      setStats]      = useState({ documents: 0, chats: 0, messages: 0 });

  // UI
  const [question,   setQuestion]   = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [showDocDD,  setShowDocDD]  = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Right panel
  const [currentSources, setCurrentSources] = useState([]);
  const [preview, setPreview] = useState({ docId: null, page: 1, filename: "", docPageCount: 1 });
  const [currentPageUrl, setCurrentPageUrl] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);

  const fileInput  = useRef(null);
  const msgsEnd    = useRef(null);
  const inputRef   = useRef(null);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const [cr, dr, sr] = await Promise.all([
          api.get("/rag/chats"),
          api.get("/rag/documents"),
          api.get("/rag/stats"),
        ]);
        setDocs(dr.data);
        setStats(sr.data);
        setChats(cr.data);
        if (dr.data.length > 0) setSelectedDoc(dr.data[0]);

        if (cr.data.length > 0) {
          await loadChat(cr.data[0].id);
        } else {
          const { data: nc } = await api.post("/rag/chats");
          setChats([nc]);
          setActiveChatId(nc.id);
        }
      } catch (e) { console.error(e); }
    };
    init();
  }, []);

  useEffect(() => { msgsEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, aiLoading]);

  // Close doc dropdown on outside click
  useEffect(() => {
    const h = () => setShowDocDD(false);
    if (showDocDD) document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [showDocDD]);

  // ── Load chat ───────────────────────────────────────────────────────────────
  const loadChat = async (chatId) => {
    setActiveChatId(chatId);
    setMessages([]);
    setCurrentSources([]);
    setPreview({ docId: null, page: 1, filename: "", docPageCount: 1 });
    try {
      const { data } = await api.get(`/rag/chats/${chatId}/messages`);
      setMessages(data);
      const lastAi = [...data].reverse().find((m) => m.role === "assistant" && m.sources?.length > 0);
      if (lastAi) {
        setCurrentSources(lastAi.sources);
        activateSource(lastAi.sources[0]);
      }
    } catch (e) { console.error(e); }
  };

  const activateSource = (src, allDocs) => {
    if (!src) return;
    const docList = allDocs || docs;
    const doc = docList.find((d) => d.id === src.document_id);
    setCurrentPageUrl(null);
    setShowLightbox(false);
    setPreview({ docId: src.document_id, page: src.page || 1, filename: src.filename, docPageCount: doc?.page_count || 999 });
  };

  // ── New chat ─────────────────────────────────────────────────────────────────
  const handleNewChat = async () => {
    try {
      const { data } = await api.post("/rag/chats");
      setChats((p) => [data, ...p]);
      setActiveChatId(data.id);
      setMessages([]);
      setCurrentSources([]);
      setPreview({ docId: null, page: 1, filename: "", docPageCount: 1 });
      setStats((p) => ({ ...p, chats: p.chats + 1 }));
      inputRef.current?.focus();
    } catch { toast.error("Failed to create chat"); }
  };

  // ── Send question ────────────────────────────────────────────────────────────
  const sendQuestion = async (override) => {
    const q = (override || question).trim();
    if (!q || aiLoading) return;
    setQuestion("");

    setMessages((p) => [...p, { id: Date.now(), role: "user", content: q, sources: [] }]);
    setAiLoading(true);

    try {
      const { data } = await api.post("/rag/query", { question: q, chat_id: activeChatId });
      const aiMsg = { id: Date.now() + 1, role: "assistant", content: data.answer,
                      sources: data.sources || [], created_at: new Date().toISOString() };
      setMessages((p) => [...p, aiMsg]);
      setCurrentSources(data.sources || []);
      if (data.sources?.length > 0) activateSource(data.sources[0]);

      setChats((p) =>
        p.map((c) => c.id === activeChatId && c.title === "New Chat"
          ? { ...c, title: q.slice(0, 55) } : c)
      );
      setStats((p) => ({ ...p, messages: p.messages + 2 }));
    } catch (err) {
      setMessages((p) => [...p, { id: Date.now() + 1, role: "assistant",
        content: "Sorry, something went wrong. Please try again.", sources: [] }]);
      toast.error(err.response?.data?.detail || "Failed to get answer");
    } finally { setAiLoading(false); }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuestion(); } };

  // ── Upload ───────────────────────────────────────────────────────────────────
  const uploadFile = async (file) => {
    if (!file?.name.endsWith(".pdf")) { toast.error("Only PDF files supported"); return; }
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const { data } = await api.post("/rag/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`"${data.filename}" — ${data.chunks_created} chunks created`);
      const { data: dl } = await api.get("/rag/documents");
      setDocs(dl);
      if (!selectedDoc) setSelectedDoc(dl[0]);
      setStats((p) => ({ ...p, documents: p.documents + 1 }));
    } catch (err) { toast.error(err.response?.data?.detail || "Upload failed"); }
    finally { setUploading(false); }
  };

  // ── Delete chat ──────────────────────────────────────────────────────────────
  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/rag/chats/${chatId}`);
      const remaining = chats.filter((c) => c.id !== chatId);
      setChats(remaining);
      setStats((p) => ({ ...p, chats: Math.max(0, p.chats - 1) }));
      if (activeChatId === chatId) {
        if (remaining.length > 0) {
          await loadChat(remaining[0].id);
        } else {
          const { data: nc } = await api.post("/rag/chats");
          setChats([nc]);
          setActiveChatId(nc.id);
          setMessages([]);
          setCurrentSources([]);
          setPreview({ docId: null, page: 1, filename: "", docPageCount: 1 });
          setStats((p) => ({ ...p, chats: 1 }));
        }
      }
      toast.success("Chat deleted");
    } catch { toast.error("Delete failed"); }
  };

  // ── Delete doc ───────────────────────────────────────────────────────────────
  const deleteDoc = async (docId, name, e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/rag/documents/${docId}`);
      setDocs((p) => p.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) setSelectedDoc(docs.find((d) => d.id !== docId) || null);
      setStats((p) => ({ ...p, documents: Math.max(0, p.documents - 1) }));
      toast.success("Document deleted");
    } catch { toast.error("Delete failed"); }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const fmtTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso), now = new Date(), diff = now - d;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="db3">
      {/* Lightbox */}
      {showLightbox && currentPageUrl && (
        <ImageLightbox src={currentPageUrl} onClose={() => setShowLightbox(false)} />
      )}

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="db3-left">
        <div className="db3-logo">
          <div className="db3-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9"/>
              <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div>
            <div className="db3-logo-name">StudyMind</div>
            <div className="db3-logo-sub">AI Study Assistant</div>
          </div>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          ＋ New Chat <span className="sparkle">✦</span>
        </button>

        {/* Chat history */}
        <div className="sb-section">
          <div className="sb-section-title">Chat History</div>
          <div className="chat-history-list">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={`chat-hist-item ${chat.id === activeChatId ? "active" : ""}`}
                onClick={() => loadChat(chat.id)}
              >
                <span className="chat-hist-icon">💬</span>
                <div className="chat-hist-info">
                  <div className="chat-hist-title">{chat.title || "New Chat"}</div>
                  <div className="chat-hist-date">{fmtTime(chat.created_at)}</div>
                </div>
                <span
                  className="chat-hist-del"
                  onClick={(e) => deleteChat(chat.id, e)}
                  title="Delete chat"
                >✕</span>
              </button>
            ))}
            {chats.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--text2)", padding: "6px 8px" }}>No chats yet</div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="sb-section">
          <div className="sb-section-header">
            <div className="sb-section-title" style={{ marginBottom: 0 }}>Documents</div>
            <button className="sb-upload-btn" onClick={() => fileInput.current?.click()} disabled={uploading}>
              {uploading ? "⏳" : "+ Upload"}
            </button>
          </div>
          <input ref={fileInput} type="file" accept=".pdf" style={{ display: "none" }}
            onChange={(e) => uploadFile(e.target.files[0])} />
          <div className="doc-list" style={{ marginTop: 8 }}>
            {docs.map((doc) => (
              <div key={doc.id}
                className={`doc-item ${selectedDoc?.id === doc.id ? "active" : ""}`}
                onClick={() => setSelectedDoc(doc)}
              >
                <div className="doc-item-icon">📕</div>
                <div className="doc-item-info">
                  <div className="doc-item-name">{doc.filename.replace(/\.pdf$/i, "")}</div>
                  <div className="doc-item-pages">{doc.page_count ? `${doc.page_count} pages` : "PDF"}</div>
                </div>
                <button className="doc-item-del" onClick={(e) => deleteDoc(doc.id, doc.filename, e)}>✕</button>
              </div>
            ))}
            {docs.length === 0 && (
              <div style={{ fontSize: 12, color: "var(--text2)", padding: "6px 8px" }}>No documents yet</div>
            )}
          </div>
        </div>

        <div className="sb-spacer" />

        {/* User */}
        <div className="sb-user">
          <div className="sb-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="sb-user-info">
            <div className="sb-user-name">{user?.name}</div>
            <div className="sb-user-email">{user?.email}</div>
          </div>
          <button className="sb-logout" onClick={logout} title="Sign out">⏻</button>
        </div>
      </aside>

      {/* ── CENTER ────────────────────────────────────────────────────────────── */}
      <div className="db3-center">
        {/* Topbar */}
        <div className="db3-topbar">
          <div>
            <div className="db3-page-title">StudyMind AI Assistant</div>
            <div className="db3-page-sub">Ask questions, get answers, and learn from your documents</div>
          </div>
          <div className="db3-topbar-right">
            <div className="doc-selector" onClick={(e) => { e.stopPropagation(); setShowDocDD((v) => !v); }}>
              <span>📄</span>
              <span>{selectedDoc ? selectedDoc.filename : "Select document"}</span>
              <span>▾</span>
              {showDocDD && (
                <div className="doc-dropdown" onClick={(e) => e.stopPropagation()}>
                  {docs.map((d) => (
                    <div key={d.id}
                      className={`doc-dd-item ${selectedDoc?.id === d.id ? "active" : ""}`}
                      onClick={() => { setSelectedDoc(d); setShowDocDD(false); }}
                    >
                      📄 {d.filename}
                    </div>
                  ))}
                  {docs.length === 0 && <div className="doc-dd-item" style={{ color: "var(--text2)" }}>No documents uploaded</div>}
                </div>
              )}
            </div>
            <div className="topbar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          </div>
        </div>


        {/* Messages */}
        <div className="chat-area-v2">
          <div className="chat-msgs-v2">
            {messages.length === 0 && !aiLoading && (
              <div className="chat-empty-v2">
                <div style={{ fontSize: 52, marginBottom: 14 }}>🤖</div>
                <div style={{ fontSize: 22, fontWeight: 400, marginBottom: 8, fontFamily: "'Abril Fatface', serif", color: "#fff" }}>Ready to help you study!</div>
                <div style={{ color: "#a0b8d0", fontSize: 15, fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {docs.length === 0 ? "Upload a PDF to get started" : `You have ${docs.length} document${docs.length > 1 ? "s" : ""} — ask me anything!`}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={msg.id || i} className={`msg-v2 ${msg.role}`}>
                {msg.role === "assistant" && <div className="msg-v2-avatar ai">🤖</div>}
                <div className="msg-v2-body">
                  <div className={`msg-v2-bubble ${msg.role}`}>
                    {msg.role === "assistant" ? <MD text={msg.content} /> : msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="msg-v2-time">{fmtTime(msg.created_at)} ✓✓</div>
                  )}
                  {msg.role === "assistant" && msg.sources?.length > 0 && (
                    <div className="msg-sources-v2">
                      <div className="msg-sources-label">Sources</div>
                      <div className="msg-sources-row">
                        {msg.sources.slice(0, 3).map((src, si) => (
                          <div key={si}
                            className={`source-card ${preview.docId === src.document_id && preview.page === src.page ? "active" : ""}`}
                            onClick={() => { activateSource(src); setCurrentSources(msg.sources); }}
                          >
                            <div className="source-card-top">
                              <span className="source-icon">📄</span>
                              <span className="source-filename">{src.filename}</span>
                            </div>
                            <div className="source-page">Page {src.page || 1}</div>
                            <div className="source-snippet">"{src.snippet}"</div>
                          </div>
                        ))}
                        {msg.sources.length > 3 && (
                          <div className="source-card more-sources"
                            onClick={() => setCurrentSources(msg.sources)}>
                            +{msg.sources.length - 3} more sources
                            <span>View all</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {msg.role === "user" && <div className="msg-v2-avatar user">{user?.name?.[0]?.toUpperCase()}</div>}
              </div>
            ))}

            {aiLoading && (
              <div className="msg-v2 assistant">
                <div className="msg-v2-avatar ai">🤖</div>
                <div className="msg-v2-body">
                  <div className="msg-v2-bubble assistant">
                    <div className="typing-dots"><span /><span /><span /></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={msgsEnd} />
          </div>


          {/* Input */}
          <div className="chat-input-bar">
            <textarea
              ref={inputRef}
              className="chat-input-v2"
              placeholder={docs.length === 0 ? "Upload a PDF first..." : "Ask anything about your documents..."}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={onKey}
              disabled={aiLoading}
              rows={1}
            />
            <div className="chat-input-actions">
              <button className="input-icon-btn" onClick={() => fileInput.current?.click()} title="Attach PDF">📎</button>
              <button className="send-btn-v2" onClick={() => sendQuestion()} disabled={aiLoading || !question.trim()}>➤</button>
            </div>
          </div>
          <div className="chat-disclaimer">StudyMind AI can make mistakes. Please verify important information.</div>
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────────────── */}
      <div className="db3-right">
        <div className="rp-header">
          <span className="rp-title">Document Preview</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="rp-icon-btn">☰</button>
            <button className="rp-icon-btn">⤢</button>
          </div>
        </div>

        {preview.docId ? (
          <div className="rp-body">
            {/* Doc info */}
            <div className="rp-doc-info">
              <div className="rp-doc-icon">📄</div>
              <div>
                <div className="rp-doc-name">{preview.filename}</div>
                <div className="rp-doc-page">Page {preview.page} of {preview.docPageCount}</div>
              </div>
            </div>

            {/* Page image */}
            <div className="rp-page-wrap"
              onClick={() => currentPageUrl && setShowLightbox(true)}
              style={{ cursor: currentPageUrl ? "zoom-in" : "default" }}
            >
              <PageImage
                documentId={preview.docId}
                pageNum={preview.page}
                onImageReady={(url) => { setCurrentPageUrl(url); setShowLightbox(false); }}
              />
            </div>

            {/* Page navigation */}
            <div className="rp-page-nav">
              <button className="rp-nav-btn"
                disabled={preview.page <= 1}
                onClick={() => setPreview((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}>
                ‹ Prev
              </button>
              <span className="rp-page-label">Page {preview.page}</span>
              <button className="rp-nav-btn"
                disabled={preview.page >= preview.docPageCount}
                onClick={() => setPreview((p) => ({ ...p, page: Math.min(p.docPageCount, p.page + 1) }))}>
                Next ›
              </button>
            </div>

            {/* AI Sources list */}
            {currentSources.length > 0 && (
              <div>
                <div className="rp-sources-title">AI Sources</div>
                {currentSources.map((src, i) => (
                  <div key={i}
                    className={`rp-source-item ${preview.docId === src.document_id && preview.page === src.page ? "active" : ""}`}
                    onClick={() => activateSource(src)}
                  >
                    <div className="rp-source-left">
                      <div className="rp-source-doc-icon">📄</div>
                      <div>
                        <div className="rp-source-name">{src.filename}</div>
                        <div className="rp-source-pg">Page {src.page || 1}</div>
                      </div>
                    </div>
                    <div className="rp-source-badge">Used</div>
                  </div>
                ))}
                <button className="view-all-sources-btn">
                  View all sources ({currentSources.length})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rp-empty">
            <div style={{ fontSize: 44, marginBottom: 14 }}>📖</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Document Preview</div>
            <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
              Ask a question to see the relevant PDF pages here automatically
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
