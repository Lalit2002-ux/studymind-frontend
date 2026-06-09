export default function Logo({ size = 38, showText = true, sub = null, className = "" }) {
  return (
    <div className={`noteiq-logo ${className}`}>
      <div className="noteiq-logo-icon" style={{ width: size, height: size, minWidth: size }}>
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="noteiqGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1d6ff5" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="11" fill="url(#noteiqGrad)" />
          {/* Note document shape */}
          <rect x="11" y="10" width="16" height="20" rx="2.5" fill="white" opacity="0.12" />
          <rect x="11" y="10" width="16" height="20" rx="2.5" stroke="white" strokeWidth="1.4" opacity="0.5" />
          {/* Note lines */}
          <path d="M14.5 16.5h11" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <path d="M14.5 20h11" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          <path d="M14.5 23.5h7" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
          {/* Sparkle — top right corner */}
          <path d="M29 7l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z" fill="white" opacity="0.95" />
        </svg>
      </div>
      {showText && (
        <div>
          <div className="noteiq-logo-name">NoteIQ</div>
          {sub && <div className="noteiq-logo-sub">{sub}</div>}
        </div>
      )}
    </div>
  );
}
