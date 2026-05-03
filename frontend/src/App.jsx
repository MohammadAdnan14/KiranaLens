import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

// ── Google Fonts injection ────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&display=swap";
document.head.appendChild(fontLink);

// ── Sample data for demo mode ─────────────────────────────────────────────────
const DEMO_DATA = {
  daily_sales_range: [7200, 10800],
  monthly_revenue_range: [187200, 280800],
  monthly_income_range: [22464, 50544],
  confidence_score: 0.78,
  risk_flags: ["inventory_footfall_mismatch"],
  recommendation: "needs_verification",
  vision_breakdown: {
    shelf_density_index: 82,
    sku_diversity_score: 8,
    refill_signal: "genuine_demand",
    store_size: "medium",
  },
};

const REC = {
  approve:            { label: "APPROVE",            color: "#00FFA3", glow: "rgba(0,255,163,0.3)",  icon: "✦" },
  needs_verification: { label: "NEEDS VERIFICATION", color: "#FFD600", glow: "rgba(255,214,0,0.3)",   icon: "◈" },
  reject:             { label: "REJECT",             color: "#FF4D6D", glow: "rgba(255,77,109,0.3)",  icon: "✕" },
};

const LOADING_MSGS = [
  "Scanning shelf inventory…",
  "Analyzing location signals…",
  "Calculating cash flow estimate…",
  "Running fraud detection…",
  "Generating risk assessment…",
];

const fmt  = (n) => "₹" + Number(n).toLocaleString("en-IN");
const fmtR = (lo, hi) => `${fmt(lo)} – ${fmt(hi)}`;

// ── Global styles ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060910; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,180,216,0.3); border-radius: 99px; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes spinRev { to { transform: rotate(-360deg); } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
  @keyframes blink { 0%,49%,100% { opacity:1; } 50%,99% { opacity:0; } }
  @keyframes borderGlow { 0%,100% { box-shadow:0 0 0 rgba(0,180,216,0); } 50% { box-shadow:0 0 24px rgba(0,180,216,0.2); } }

  .fade-up   { animation: fadeUp 0.5s ease both; }
  .fade-up-1 { animation: fadeUp 0.5s 0.08s ease both; }
  .fade-up-2 { animation: fadeUp 0.5s 0.16s ease both; }
  .fade-up-3 { animation: fadeUp 0.5s 0.24s ease both; }
  .fade-up-4 { animation: fadeUp 0.5s 0.32s ease both; }

  .card-hover { transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
  .card-hover:hover { transform: translateY(-2px); border-color: rgba(0,180,216,0.35) !important; box-shadow: 0 8px 32px rgba(0,180,216,0.08); }

  .btn-primary {
    background: linear-gradient(135deg, #00B4D8, #0096C7);
    border: none; border-radius: 10px; color: #060910;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem;
    letter-spacing: 0.04em; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    position: relative; overflow: hidden;
  }
  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%);
    background-size: 200% 100%; animation: shimmer 2.5s infinite;
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,180,216,0.4); }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

  .btn-ghost {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(0,180,216,0.2);
    border-radius: 8px; color: #00B4D8;
    font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
    cursor: pointer; transition: background 0.15s, border-color 0.15s; letter-spacing: 0.05em;
  }
  .btn-ghost:hover { background: rgba(0,180,216,0.08); border-color: rgba(0,180,216,0.4); }

  .input-field {
    width: 100%; background: rgba(255,255,255,0.03);
    border: 1px solid rgba(0,180,216,0.15); border-radius: 8px;
    color: #E6EDF3; padding: 0.65rem 0.9rem;
    font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .input-field:focus { border-color: rgba(0,180,216,0.5); box-shadow: 0 0 0 3px rgba(0,180,216,0.08); }
  .input-field::placeholder { color: #2d3340; }
`;

// ── Background ────────────────────────────────────────────────────────────────
function Background() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,180,216,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.03) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,180,216,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,0.07) 1px, transparent 1px)`,
        backgroundSize: "240px 240px",
      }} />
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,180,216,0.09) 0%, transparent 65%)", top: -200, right: -200 }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,163,0.06) 0%, transparent 65%)", bottom: -150, left: -100 }} />
      <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,0,0.04) 0%, transparent 65%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 35%, rgba(6,9,16,0.75) 100%)" }} />
      {/* Scanline */}
      <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(transparent, rgba(0,180,216,0.05), transparent)", animation: "scanline 9s linear infinite" }} />
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ screen }) {
  return (
    <header style={{ marginBottom: "2.5rem" }} className="fade-up">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            fontWeight: 800, letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #00B4D8 0%, #00FFA3 55%, #00B4D8 100%)",
            backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}>KiranaLens</h1>
          <span style={{ display: "inline-block", width: 3, height: "1.5rem", background: "#00B4D8", animation: "blink 1s step-end infinite" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#00B4D8", border: "1px solid rgba(0,180,216,0.3)",
            padding: "2px 8px", borderRadius: 4, background: "rgba(0,180,216,0.06)",
          }}>TenzorX 2026</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.12em", color: "#2d3340", padding: "0 2px" }}>
            Poonawalla Fincorp
          </span>
        </div>
      </div>

      <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#2d3340", fontSize: "0.75rem", letterSpacing: "0.04em", marginBottom: "1.5rem" }}>
        AI-powered remote cash flow underwriting for kirana stores
      </p>

      {screen !== "loading" && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {["Upload", "Analyze", "Results"].map((s, i) => {
            const active = (i === 0 && screen === "upload") || (i === 2 && screen === "results");
            const done   = i === 0 && screen === "results";
            return (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.45rem",
                  padding: "0.28rem 0.7rem",
                  background: active ? "rgba(0,180,216,0.1)" : "transparent",
                  border: active ? "1px solid rgba(0,180,216,0.3)" : "1px solid transparent",
                  borderRadius: 99, transition: "all 0.3s",
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", fontWeight: 700,
                    background: active ? "#00B4D8" : done ? "rgba(0,180,216,0.15)" : "rgba(255,255,255,0.04)",
                    color: active ? "#060910" : done ? "#00B4D8" : "#2d3340",
                  }}>{done ? "✓" : i + 1}</div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: active ? "#E6EDF3" : "#2d3340", letterSpacing: "0.06em" }}>{s}</span>
                </div>
                {i < 2 && <div style={{ width: 28, height: 1, background: "rgba(0,180,216,0.1)", margin: "0 2px" }} />}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, style = {}, className = "" }) {
  return (
    <div className={`card-hover ${className}`} style={{
      background: "rgba(12,16,26,0.85)", border: "1px solid rgba(0,180,216,0.11)",
      borderRadius: 14, padding: "1.5rem", backdropFilter: "blur(16px)", ...style,
    }}>{children}</div>
  );
}

function SectionLabel({ n, children, color = "#00B4D8" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.2rem" }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color,
        background: "rgba(0,180,216,0.07)", border: "1px solid rgba(0,180,216,0.18)",
        borderRadius: 4, padding: "1px 6px", letterSpacing: "0.08em",
      }}>{String(n).padStart(2, "0")}</span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#2d3340" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(0,180,216,0.07)" }} />
    </div>
  );
}

// ── SCREEN 1: Upload ──────────────────────────────────────────────────────────
function UploadScreen({ onSubmit, onDemo }) {
  const [images, setImages] = useState([]);
  const [lat, setLat]       = useState("");
  const [lng, setLng]       = useState("");
  const [locErr, setLocErr] = useState("");
  const [drag, setDrag]     = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const fileRef = useRef();

  const addFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith("image/"));
    setImages(prev => [...prev, ...valid].slice(0, 5));
  };
  const handleDrop = (e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); };

  const useLocation = () => {
    setLocLoading(true); setLocErr("");
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); setLocLoading(false); },
      ()  => { setLocErr("Location denied — enter manually."); setLocLoading(false); }
    );
  };

  const canSubmit = images.length >= 1 && lat && lng;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

      {/* Demo banner */}
      <div className="fade-up-1" style={{
        background: "linear-gradient(135deg, rgba(255,214,0,0.05), rgba(0,180,216,0.05))",
        border: "1px solid rgba(255,214,0,0.18)", borderRadius: 10,
        padding: "0.9rem 1.25rem",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap",
      }}>
        <div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "#FFD600", marginBottom: "0.2rem" }}>
            ◈ Demo Mode Available
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#4a5568" }}>
            Test results instantly with sample kirana store data
          </p>
        </div>
        <button className="btn-ghost" style={{ padding: "0.5rem 1.1rem", whiteSpace: "nowrap", color: "#FFD600", borderColor: "rgba(255,214,0,0.25)" }} onClick={onDemo}>
          Run Demo →
        </button>
      </div>

      {/* Image upload */}
      <Card className="fade-up-2">
        <SectionLabel n={1}>Store Images</SectionLabel>
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${drag ? "#00B4D8" : "rgba(0,180,216,0.16)"}`,
            borderRadius: 10, padding: "2.5rem 1rem", textAlign: "center", cursor: "pointer",
            background: drag ? "rgba(0,180,216,0.04)" : "transparent",
            transition: "all 0.2s", marginBottom: images.length ? "1.25rem" : 0,
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.6rem", opacity: drag ? 1 : 0.45 }}>{drag ? "📥" : "⬆"}</div>
          <p style={{ fontFamily: "'Syne', sans-serif", color: "#4a5568", fontSize: "0.88rem", marginBottom: "0.3rem" }}>
            Drag & drop images, or{" "}
            <span style={{ color: "#00B4D8", textDecoration: "underline" }}>browse files</span>
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#2d3340", fontSize: "0.68rem" }}>
            {images.length}/5 selected · JPG PNG WEBP
          </p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => addFiles(e.target.files)} />

        {images.length > 0 && (
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: "relative", width: 86, height: 86, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,180,216,0.22)" }}>
                <img src={URL.createObjectURL(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button onClick={e => { e.stopPropagation(); setImages(prev => prev.filter((_, idx) => idx !== i)); }} style={{
                  position: "absolute", top: 3, right: 3,
                  background: "rgba(6,9,16,0.85)", border: "none", borderRadius: "50%",
                  width: 18, height: 18, color: "#FF4D6D", cursor: "pointer", fontSize: "0.6rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  padding: "3px 4px 2px",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "0.52rem", color: "rgba(230,237,243,0.75)",
                }}>{(img.size / 1024).toFixed(0)}KB</div>
              </div>
            ))}
            {images.length < 5 && (
              <div onClick={() => fileRef.current.click()} style={{
                width: 86, height: 86, borderRadius: 10,
                border: "2px dashed rgba(0,180,216,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#2d3340", cursor: "pointer", fontSize: "1.5rem",
              }}>+</div>
            )}
          </div>
        )}
      </Card>

      {/* GPS */}
      <Card className="fade-up-3">
        <SectionLabel n={2}>GPS Coordinates</SectionLabel>
        <div style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
          {[["Latitude", "21.145800", lat, setLat], ["Longitude", "79.088200", lng, setLng]].map(([label, ph, val, set]) => (
            <div key={label} style={{ flex: "1 1 140px" }}>
              <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#00B4D8", display: "block", marginBottom: "0.4rem" }}>{label}</label>
              <input className="input-field" type="number" placeholder={ph} value={val} onChange={e => set(e.target.value)} />
            </div>
          ))}
        </div>
        <button className="btn-ghost" style={{ padding: "0.5rem 1rem" }} onClick={useLocation} disabled={locLoading}>
          {locLoading ? "◎ Detecting…" : "◎ Use My Location"}
        </button>
        {locErr && <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#FF4D6D", fontSize: "0.7rem", marginTop: "0.5rem" }}>{locErr}</p>}
      </Card>

      {/* Submit */}
      <div className="fade-up-4">
        <button className="btn-primary" disabled={!canSubmit}
          style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
          onClick={() => onSubmit(images, parseFloat(lat), parseFloat(lng))}>
          Analyze Store →
        </button>
        {!canSubmit && (
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: "#2d3340", fontSize: "0.68rem", textAlign: "center", marginTop: "0.5rem" }}>
            {images.length === 0 ? "↑ Add at least 1 store image" : "↑ Enter GPS coordinates to continue"}
          </p>
        )}
      </div>
    </div>
  );
}

// ── SCREEN 2: Loading ─────────────────────────────────────────────────────────
function LoadingScreen() {
  const [msgIdx, setMsgIdx]     = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots]         = useState(".");

  useEffect(() => {
    const t1 = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MSGS.length), 2200);
    const t2 = setInterval(() => setProgress(p => Math.min(p + Math.random() * 6, 92)), 350);
    const t3 = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 420);
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4.5rem 1rem", gap: "2rem" }}>
      {/* Triple rings */}
      <div style={{ position: "relative", width: 120, height: 120 }}>
        {[
          { size: 120, color: "#00B4D8", dur: "1.4s", rev: false, w: 2 },
          { size: 86,  color: "#00FFA3", dur: "1.0s", rev: true,  w: 2 },
          { size: 54,  color: "#FFD600", dur: "0.7s", rev: false, w: 1.5 },
        ].map(({ size, color, dur, rev, w }, i) => (
          <div key={i} style={{
            position: "absolute",
            width: size, height: size,
            top: (120 - size) / 2, left: (120 - size) / 2,
            borderRadius: "50%",
            border: `${w}px solid transparent`,
            borderTopColor: color, borderRightColor: `${color}33`,
            animation: `${rev ? "spinRev" : "spin"} ${dur} linear infinite`,
            boxShadow: `0 0 14px ${color}44`,
          }} />
        ))}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>🔬</div>
      </div>

      {/* Progress */}
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#2d3340" }}>Processing{dots}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#00B4D8" }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: "linear-gradient(90deg, #00B4D8, #00FFA3)",
            borderRadius: 99, transition: "width 0.35s ease",
            boxShadow: "0 0 10px rgba(0,180,216,0.6)",
          }} />
        </div>
      </div>

      {/* Steps list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", width: "100%", maxWidth: 340 }}>
        {LOADING_MSGS.map((msg, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.65rem", opacity: i <= msgIdx ? 1 : 0.22, transition: "opacity 0.4s" }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
              background: i < msgIdx ? "#00FFA3" : i === msgIdx ? "#00B4D8" : "#2d3340",
              animation: i === msgIdx ? "pulse 1s ease-in-out infinite" : "none",
              boxShadow: i === msgIdx ? "0 0 8px rgba(0,180,216,0.6)" : "none",
            }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: i <= msgIdx ? "#7D8590" : "#2d3340" }}>{msg}</span>
            {i < msgIdx && <span style={{ marginLeft: "auto", color: "#00FFA3", fontSize: "0.65rem" }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SCREEN 3: Results ─────────────────────────────────────────────────────────
function ResultsScreen({ data, onReset, isDemo }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const rec = REC[data.recommendation] || REC.needs_verification;
  const confPct = Math.round((data.confidence_score || 0) * 100);
  const [barW, setBarW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBarW(confPct), 400); return () => clearTimeout(t); }, [confPct]);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "kirana-report.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ label, value, sub, delay = "0s" }) => (
    <div className="card-hover" style={{
      background: "rgba(12,16,26,0.85)", border: "1px solid rgba(0,180,216,0.11)",
      borderRadius: 14, padding: "1.25rem 1.4rem", flex: "1 1 190px",
      animation: `fadeUp 0.5s ${delay} ease both`,
    }}>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#2d3340", marginBottom: "0.6rem" }}>{label}</p>
      <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(0.95rem, 2.2vw, 1.2rem)", fontWeight: 700, color: "#E6EDF3", lineHeight: 1.2, marginBottom: sub ? "0.4rem" : 0 }}>{value}</p>
      {sub && <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", color: "#2d3340" }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      {isDemo && (
        <div className="fade-up" style={{
          background: "rgba(255,214,0,0.05)", border: "1px solid rgba(255,214,0,0.18)",
          borderRadius: 8, padding: "0.6rem 1rem",
          fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#FFD600",
        }}>◈ Demo Mode — sample data. Connect backend to analyze real stores.</div>
      )}

      {/* Top bar */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#E6EDF3" }}>Analysis Complete</p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "#2d3340", marginTop: "0.2rem" }}>
            Vision × Geo fusion · {new Date().toLocaleTimeString()}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          <button className="btn-ghost" style={{ padding: "0.5rem 1rem" }} onClick={downloadJSON}>↓ JSON</button>
          <button className="btn-ghost" style={{ padding: "0.5rem 1rem", color: "#4a5568", borderColor: "rgba(74,85,104,0.2)" }} onClick={onReset}>← Reset</button>
        </div>
      </div>

      {/* Recommendation hero */}
      <div className="fade-up-1 card-hover" style={{
        background: `linear-gradient(135deg, rgba(12,16,26,0.95), ${rec.glow.replace("0.3", "0.07")})`,
        border: `1px solid ${rec.color}38`, borderRadius: 14, padding: "1.5rem",
        display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap",
        boxShadow: `0 0 40px ${rec.glow.replace("0.3", "0.1")}`,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: `${rec.color}15`, border: `1px solid ${rec.color}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.4rem", color: rec.color,
        }}>{rec.icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#2d3340", marginBottom: "0.3rem" }}>Credit Recommendation</p>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: rec.color, letterSpacing: "-0.02em" }}>{rec.label}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#2d3340", marginBottom: "0.4rem" }}>Confidence</p>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.2rem", fontWeight: 800, color: rec.color, lineHeight: 1 }}>{confPct}%</p>
          <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99, marginTop: "0.4rem", overflow: "hidden", width: 80, marginLeft: "auto" }}>
            <div style={{ height: "100%", width: `${barW}%`, background: `linear-gradient(90deg, ${rec.color}88, ${rec.color})`, borderRadius: 99, transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="fade-up-2" style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap" }}>
        <StatCard label="Daily Sales Range"  value={fmtR(data.daily_sales_range[0], data.daily_sales_range[1])}         sub="Estimated gross daily"   delay="0.1s" />
        <StatCard label="Monthly Revenue"    value={fmtR(data.monthly_revenue_range[0], data.monthly_revenue_range[1])} sub="~26 business days/mo"    delay="0.2s" />
        <StatCard label="Monthly Income"     value={fmtR(data.monthly_income_range[0], data.monthly_income_range[1])}   sub="12–18% net margin est."  delay="0.3s" />
      </div>

      {/* Risk flags */}
      {data.risk_flags?.length > 0 && (
        <Card className="fade-up-3" style={{ borderColor: "rgba(255,77,109,0.18)", background: "rgba(255,77,109,0.03)" }}>
          <SectionLabel n="⚠" color="#FF4D6D">Risk Flags Detected</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {data.risk_flags.map((flag, i) => (
              <span key={i} style={{
                background: "rgba(255,77,109,0.07)", border: "1px solid rgba(255,77,109,0.22)",
                color: "#FF4D6D", borderRadius: 6, padding: "0.3rem 0.75rem",
                fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.04em",
              }}>{flag.replace(/_/g, " ")}</span>
            ))}
          </div>
        </Card>
      )}

      {/* Vision breakdown */}
      <Card className="fade-up-4">
        <button onClick={() => setShowBreakdown(v => !v)} style={{
          background: "none", border: "none", cursor: "pointer", width: "100%",
          display: "flex", alignItems: "center", padding: 0,
        }}>
          <div style={{ flex: 1 }}>
            <SectionLabel n={3}>Vision Breakdown</SectionLabel>
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#00B4D8", fontSize: "0.7rem", marginLeft: "1rem", flexShrink: 0, marginBottom: "1.2rem" }}>
            {showBreakdown ? "▲ collapse" : "▼ expand"}
          </span>
        </button>

        {showBreakdown && data.vision_breakdown && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "0.85rem" }}>
            {[
              { k: "Shelf Density",  v: `${data.vision_breakdown.shelf_density_index}/100`, bar: data.vision_breakdown.shelf_density_index },
              { k: "SKU Diversity",  v: `${data.vision_breakdown.sku_diversity_score}/10`,  bar: data.vision_breakdown.sku_diversity_score * 10 },
              { k: "Store Size",     v: data.vision_breakdown.store_size,                   bar: null },
              { k: "Refill Signal",  v: data.vision_breakdown.refill_signal?.replace(/_/g, " "), bar: null },
            ].map(({ k, v, bar }) => (
              <div key={k} style={{ background: "rgba(0,180,216,0.03)", border: "1px solid rgba(0,180,216,0.07)", borderRadius: 10, padding: "0.85rem" }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#2d3340", marginBottom: "0.45rem" }}>{k}</p>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#E6EDF3", marginBottom: bar !== null ? "0.5rem" : 0 }}>{v}</p>
                {bar !== null && (
                  <div style={{ height: 2, background: "rgba(255,255,255,0.04)", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${bar}%`, background: "linear-gradient(90deg, #00B4D8, #00FFA3)", borderRadius: 99 }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]     = useState("upload");
  const [result, setResult]     = useState(null);
  const [apiError, setApiError] = useState("");
  const [isDemo, setIsDemo]     = useState(false);

  const handleSubmit = async (images, lat, lng) => {
    setApiError(""); setIsDemo(false); setScreen("loading");
    try {
      const formData = new FormData();
      images.forEach(img => formData.append("images", img));
      formData.append("lat", lat);
      formData.append("lng", lng);
      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" }, timeout: 120000,
      });
      if (res.data.error) throw new Error(res.data.error);
      setResult(res.data); setScreen("results");
    } catch (err) {
      setApiError(err.message || "Backend unreachable. Is it running on port 8000?");
      setScreen("upload");
    }
  };

  const handleDemo = () => {
    setIsDemo(true); setApiError(""); setScreen("loading");
    setTimeout(() => { setResult(DEMO_DATA); setScreen("results"); }, 4500);
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Background />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.25rem 5rem" }}>
        <Header screen={screen} />

        {apiError && (
          <div style={{
            background: "rgba(255,77,109,0.06)", border: "1px solid rgba(255,77,109,0.22)",
            borderRadius: 10, padding: "0.85rem 1.1rem",
            fontFamily: "'JetBrains Mono', monospace", fontSize: "0.76rem", color: "#FF4D6D",
            marginBottom: "1.25rem", display: "flex", gap: "0.75rem",
          }}>
            <span>✕</span><span>{apiError}</span>
          </div>
        )}

        {screen === "upload"  && <UploadScreen onSubmit={handleSubmit} onDemo={handleDemo} />}
        {screen === "loading" && <LoadingScreen />}
        {screen === "results" && result && (
          <ResultsScreen data={result} isDemo={isDemo} onReset={() => { setResult(null); setIsDemo(false); setScreen("upload"); }} />
        )}
      </div>
    </>
  );
}
