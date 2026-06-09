import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

let _addToast = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _addToast = (msg, type) => {
      const id = Date.now();
      setToasts((t) => [...t, { id, msg, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
    };
    return () => { _addToast = null; };
  }, []);

  if (!toasts.length) return null;

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(({ id, msg, type }) => (
        <div key={id} style={{
          background: type === "error" ? "#3b1010" : "#0f2b1a",
          border: `1px solid ${type === "error" ? "#ef4444" : "#22c55e"}`,
          color: type === "error" ? "#fca5a5" : "#86efac",
          padding: "12px 18px",
          borderRadius: 10,
          fontSize: 14,
          fontFamily: "system-ui",
          maxWidth: 340,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          animation: "slideIn 0.2s ease",
        }}>
          {type === "error" ? "✕  " : "✓  "}{msg}
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}

export const toast = {
  success: (msg) => _addToast?.(msg, "success"),
  error: (msg) => _addToast?.(msg, "error"),
};
