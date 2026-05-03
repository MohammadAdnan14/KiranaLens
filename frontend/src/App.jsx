import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

// ── Fonts ─────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&display=swap";
document.head.appendChild(fontLink);

// ── Constants ─────────────────────────────────────────────────────────────────
const REC = {
  approve:                { label: "APPROVE",                 color: "#00FFA3", glow: "rgba(0,255,163,0.25)",  icon: "✦", desc: "Strong candidate. Proceed with standard terms." },
  approve_with_conditions:{ label: "APPROVE WITH CONDITIONS", color: "#00E5B4", glow: "rgba(0,229,180,0.25)",  icon: "◆", desc: "Eligible with minor verification recommended." },
  needs_verification:     { label: "NEEDS VERIFICATION",      color: "#FFD600", glow: "rgba(255,214,0,0.25)",  icon: "◈", desc: "Signals present but require field verification." },
  needs_manual_review:    { label: "NEEDS MANUAL REVIEW",     color: "#FF9A3C", glow: "rgba(255,154,60,0.25)", icon: "◉", desc: "Mixed signals. Escalate to credit officer." },
  reject:                 { label: "REJECT",                  color: "#FF4D6D", glow: "rgba(255,77,109,0.25)", icon: "✕", desc: "Insufficient or suspicious signals detected." },
};

const FLAG_INFO = {
  inventory_footfall_mismatch:     { label: "Inventory–Footfall Mismatch",     sev: "high",   desc: "High inventory value in low-footfall area" },
  low_sku_diversity_high_inventory:{ label: "Low SKU, High Inventory",          sev: "medium", desc: "Concentrated stock may indicate slow-movers" },
  high_competition_low_demand:     { label: "High Competition, Low Demand",     sev: "medium", desc: "Competitive saturation reduces revenue potential" },
  underutilized_space:             { label: "Underutilized Space",              sev: "low",    desc: "Shelf density below 40% — store may be inactive" },
  limited_product_range:           { label: "Limited Product Range",            sev: "low",    desc: "Fewer than 3 distinct SKU categories" },
  poor_image_quality:              { label: "Poor Image Quality",               sev: "low",    desc: "Insufficient visual data for accurate analysis" },
  possible_staged_inventory:       { label: "Possible Staged Inventory",        sev: "high",   desc: "Overstocking pattern inconsistent with natural demand" },
  staged_inspection_likely:        { label: "Staged Inspection Likely",         sev: "critical",desc: "Strong multi-signal fraud pattern detected" },
  inventory_store_size_mismatch:   { label: "Inventory–Store Size Mismatch",    sev: "high",   desc: "Inventory value disproportionate to store size" },
  suspiciously_perfect_scores:     { label: "Suspiciously Perfect Scores",      sev: "high",   desc: "Unrealistically high scores across all metrics" },
  high_competition_area_risk:      { label: "High Competition Area Risk",       sev: "medium", desc: "Saturated market may constrain growth" },
  sdi_store_size_mismatch:         { label: "SDI–Store Size Mismatch",          sev: "medium", desc: "Shelf density inconsistent with reported store size" },
};

const SEV_COLOR = { critical: "#FF4D6D", high: "#FF9A3C", medium: "#FFD600", low: "#7D8590" };

const LOADING_MSGS = [
  "Scanning shelf inventory…",
  "Analyzing location signals…",
  "Calculating cash flow estimate…",
  "Running fraud detection…",
  "Generating risk assessment…",
];

const fmt  = (n) => "₹" + Number(n).toLocaleString("en-IN");
const fmtR = (lo, hi) => `${fmt(lo)} – ${fmt(hi)}`;

// ── Global CSS ────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #060910; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,180,216,0.3); border-radius: 99px; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes spinRev { to { transform: rotate(-360deg); } }
  @keyframes pulse   { 0%,100%{opacity:1}50%{opacity:0.35} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0}to{opacity:1} }
  @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }
  @keyframes scanline{ 0%{transform:translateY(-100%)}100%{transform:translateY(100vh)} }
  @keyframes blink   { 0%,49%,100%{opacity:1}50%,99%{opacity:0} }
  @keyframes float   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }
  @keyframes fillBar { from{width:0}to{width:var(--w)} }

  .fade-up   { animation: fadeUp 0.55s ease both; }
  .fade-up-1 { animation: fadeUp 0.55s 0.08s ease both; }
  .fade-up-2 { animation: fadeUp 0.55s 0.16s ease both; }
  .fade-up-3 { animation: fadeUp 0.55s 0.24s ease both; }
  .fade-up-4 { animation: fadeUp 0.55s 0.32s ease both; }
  .fade-up-5 { animation: fadeUp 0.55s 0.40s ease both; }

  .card-hover { transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
  .card-hover:hover { transform: translateY(-2px); border-color: rgba(0,180,216,0.35) !important; box-shadow: 0 8px 32px rgba(0,180,216,0.08); }

  .btn-primary {
    background: linear-gradient(135deg, #00B4D8, #0096C7);
    border: none; border-radius: 10px; color: #060910;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1rem;
    letter-spacing: 0.04em; cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s;
    position: relative; overflow: hidden;
  }
  .btn-primary::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%);
    background-size:200% 100%; animation:shimmer 2.5s infinite;
  }
  .btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,180,216,0.4); }
  .btn-primary:active:not(:disabled) { transform:translateY(0); }
  .btn-primary:disabled { opacity:0.35; cursor:not-allowed; }

  .btn-ghost {
    background:rgba(255,255,255,0.03); border:1px solid rgba(0,180,216,0.2);
    border-radius:8px; color:#00B4D8;
    font-family:'JetBrains Mono',monospace; font-size:0.75rem;
    cursor:pointer; transition:background 0.15s, border-color 0.15s; letter-spacing:0.05em;
  }
  .btn-ghost:hover { background:rgba(0,180,216,0.08); border-color:rgba(0,180,216,0.4); }

  .input-field {
    width:100%; background:rgba(255,255,255,0.03);
    border:1px solid rgba(0,180,216,0.15); border-radius:8px;
    color:#E6EDF3; padding:0.65rem 0.9rem;
    font-family:'JetBrains Mono',monospace; font-size:0.85rem; outline:none;
    transition:border-color 0.2s, box-shadow 0.2s;
  }
  .input-field:focus { border-color:rgba(0,180,216,0.5); box-shadow:0 0 0 3px rgba(0,180,216,0.08); }
  .input-field::placeholder { color:#2d3340; }

  .hero-btn {
    display:inline-flex; align-items:center; gap:0.6rem;
    background:linear-gradient(135deg,#00B4D8,#0096C7);
    border:none; border-radius:12px; color:#060910;
    font-family:'Syne',sans-serif; font-weight:700; font-size:1.05rem;
    padding:0.9rem 2rem; cursor:pointer;
    transition:transform 0.2s, box-shadow 0.2s;
    position:relative; overflow:hidden;
  }
  .hero-btn::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent 30%,rgba(255,255,255,0.2) 50%,transparent 70%);
    background-size:200% 100%; animation:shimmer 2.5s infinite;
  }
  .hero-btn:hover { transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,180,216,0.45); }

  .feature-card {
    background:rgba(12,16,26,0.85); border:1px solid rgba(0,180,216,0.1);
    border-radius:14px; padding:1.5rem; backdrop-filter:blur(12px);
    transition:transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .feature-card:hover { transform:translateY(-3px); border-color:rgba(0,180,216,0.3); box-shadow:0 12px 40px rgba(0,180,216,0.08); }
`;

// ── Background ────────────────────────────────────────────────────────────────
function Background() {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(0,180,216,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,216,0.025) 1px,transparent 1px)`, backgroundSize:"48px 48px" }} />
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(0,180,216,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,180,216,0.06) 1px,transparent 1px)`, backgroundSize:"240px 240px" }} />
      <div style={{ position:"absolute", width:800, height:800, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,180,216,0.08) 0%,transparent 65%)", top:-250, right:-200 }} />
      <div style={{ position:"absolute", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,255,163,0.05) 0%,transparent 65%)", bottom:-200, left:-150 }} />
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(255,214,0,0.03) 0%,transparent 65%)", top:"45%", left:"45%" }} />
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center,transparent 30%,rgba(6,9,16,0.8) 100%)" }} />
      <div style={{ position:"absolute", left:0, right:0, height:2, background:"linear-gradient(transparent,rgba(0,180,216,0.04),transparent)", animation:"scanline 10s linear infinite" }} />
    </div>
  );
}

// ── Logo Mark ─────────────────────────────────────────────────────────────────
function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="url(#lg)" />
      <circle cx="20" cy="17" r="7" stroke="white" strokeWidth="2.2" fill="none" />
      <circle cx="20" cy="17" r="3" fill="white" opacity="0.9" />
      <line x1="25" y1="22" x2="31" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="30" x2="32" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="8" y1="33.5" x2="24" y2="33.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#00B4D8" />
          <stop offset="100%" stopColor="#0077A8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ onGetStarted }) {
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:"rgba(6,9,16,0.85)", backdropFilter:"blur(20px)",
      borderBottom:"1px solid rgba(0,180,216,0.08)",
      padding:"0 1.5rem",
    }}>
      <div style={{ maxWidth:1100, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
          <LogoMark size={30} />
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.2rem", letterSpacing:"-0.03em", background:"linear-gradient(135deg,#00B4D8,#00FFA3)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            KiranaLens
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.65rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#00B4D8", border:"1px solid rgba(0,180,216,0.3)", padding:"3px 10px", borderRadius:4, background:"rgba(0,180,216,0.06)" }}>TenzorX 2026</span>
          <button className="btn-ghost" style={{ padding:"0.4rem 1rem", fontSize:"0.78rem" }} onClick={onGetStarted}>
            Analyze Store →
          </button>
        </div>
      </div>
    </nav>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────
function LandingPage({ onStart }) {
  const features = [
    { icon:"🔍", title:"Vision Analysis", desc:"Gemini 2.5 Flash scans shelf density, SKU diversity, inventory value, and refill signals from store photos." },
    { icon:"📍", title:"Geo Intelligence", desc:"Google Maps Places API scores footfall potential and competition density within 500–800m radius." },
    { icon:"⚡", title:"Instant Underwriting", desc:"Fusion model combines vision + geo signals into a credit-ready cash flow estimate in under 30 seconds." },
    { icon:"🛡️", title:"Fraud Detection", desc:"11-point cross-signal fraud engine flags staged inventory, mismatched signals, and suspicious patterns." },
  ];

  return (
    <div style={{ minHeight:"100vh", paddingTop:60 }}>
      {/* Hero */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"6rem 1.5rem 4rem", textAlign:"center" }}>
        <div className="fade-up" style={{ display:"inline-flex", alignItems:"center", gap:"0.5rem", background:"rgba(0,180,216,0.08)", border:"1px solid rgba(0,180,216,0.2)", borderRadius:99, padding:"0.35rem 1rem", marginBottom:"2rem" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#00FFA3", animation:"pulse 1.5s ease-in-out infinite", display:"inline-block" }} />
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem", letterSpacing:"0.15em", color:"#00B4D8", textTransform:"uppercase" }}>
            National AI Hackathon · Poonawalla Fincorp
          </span>
        </div>

        <h1 className="fade-up-1" style={{
          fontFamily:"'Syne',sans-serif", fontWeight:800,
          fontSize:"clamp(2.5rem,7vw,5rem)", letterSpacing:"-0.04em",
          lineHeight:1.05, marginBottom:"1.5rem", color:"#E6EDF3",
        }}>
          Remote Cash Flow{" "}
          <span style={{ background:"linear-gradient(135deg,#00B4D8,#00FFA3)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Underwriting
          </span>
          <br />for Kirana Stores
        </h1>

        <p className="fade-up-2" style={{
          fontFamily:"'JetBrains Mono',monospace", fontSize:"clamp(0.85rem,2vw,1rem)",
          color:"#4a5568", lineHeight:1.8, maxWidth:580, margin:"0 auto 2.5rem", letterSpacing:"0.02em",
        }}>
          Upload 3–5 store photos + GPS coordinates. Get estimated daily sales, monthly revenue,
          fraud risk score, and a credit recommendation — powered by AI vision and geospatial analysis.
        </p>

        <div className="fade-up-3" style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap", marginBottom:"4rem" }}>
          <button className="hero-btn" onClick={onStart}>
            <span>Analyze a Store</span>
            <span style={{ fontSize:"1.1rem" }}>→</span>
          </button>
          <a href="#features" style={{ textDecoration:"none" }}>
            <button className="btn-ghost" style={{ padding:"0.9rem 1.75rem", fontSize:"0.85rem", borderRadius:12 }}>
              See How It Works ↓
            </button>
          </a>
        </div>

        {/* Stats bar */}
        <div className="fade-up-4" style={{ display:"flex", gap:"2px", justifyContent:"center", flexWrap:"wrap", borderRadius:14, overflow:"hidden", maxWidth:600, margin:"0 auto" }}>
          {[
            { v:"< 30s", l:"Analysis Time" },
            { v:"11", l:"Fraud Signals" },
            { v:"5", l:"Credit Tiers" },
            { v:"2", l:"AI Models" },
          ].map(({ v, l }) => (
            <div key={l} style={{ flex:"1 1 120px", background:"rgba(12,16,26,0.9)", border:"1px solid rgba(0,180,216,0.1)", padding:"1.1rem 1rem", textAlign:"center" }}>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.6rem", color:"#00B4D8", marginBottom:"0.2rem" }}>{v}</p>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem", letterSpacing:"0.12em", textTransform:"uppercase", color:"#2d3340" }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth:1100, margin:"0 auto", padding:"4rem 1.5rem" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.65rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"#00B4D8", marginBottom:"0.75rem" }}>How It Works</p>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(1.6rem,4vw,2.4rem)", letterSpacing:"-0.03em", color:"#E6EDF3" }}>
            Dual AI Engine
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="feature-card">
              <div style={{ fontSize:"2rem", marginBottom:"1rem", animation:"float 3s ease-in-out infinite" }}>{icon}</div>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1rem", color:"#E6EDF3", marginBottom:"0.5rem" }}>{title}</h3>
              <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem", color:"#4a5568", lineHeight:1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth:700, margin:"0 auto", padding:"4rem 1.5rem 6rem", textAlign:"center" }}>
        <div style={{ background:"rgba(12,16,26,0.9)", border:"1px solid rgba(0,180,216,0.15)", borderRadius:20, padding:"3rem 2rem", backdropFilter:"blur(12px)" }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"clamp(1.4rem,4vw,2rem)", letterSpacing:"-0.03em", color:"#E6EDF3", marginBottom:"1rem" }}>
            Ready to Underwrite?
          </h2>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.78rem", color:"#4a5568", marginBottom:"2rem", lineHeight:1.7 }}>
            No signup. No database. Pure AI inference on every request.
          </p>
          <button className="hero-btn" onClick={onStart}>
            Start Analysis →
          </button>
        </div>
      </section>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop:"1px solid rgba(0,180,216,0.08)",
      background:"rgba(6,9,16,0.95)",
      padding:"2rem 1.5rem",
    }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.6rem" }}>
          <LogoMark size={24} />
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"0.9rem", color:"#E6EDF3" }}>KiranaLens</span>
        </div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.68rem", color:"#2d3340", textAlign:"center" }}>
          Built for CRP TenzorX 2026 · Poonawalla Fincorp National AI Hackathon
        </div>
        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.68rem", color:"#2d3340" }}>
          Mohammad Adnan Dalal &amp; Aymaan Khan · RCOEM Nagpur
        </div>
      </div>
    </footer>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ screen, onBack }) {
  const steps = ["Upload", "Analyze", "Results"];
  const idx   = screen === "upload" ? 0 : screen === "loading" ? 1 : 2;
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"2rem" }} className="fade-up">
      <div style={{ display:"flex", alignItems:"center" }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display:"flex", alignItems:"center" }}>
            <div style={{
              display:"flex", alignItems:"center", gap:"0.45rem",
              padding:"0.28rem 0.7rem",
              background: i === idx ? "rgba(0,180,216,0.1)" : "transparent",
              border: i === idx ? "1px solid rgba(0,180,216,0.3)" : "1px solid transparent",
              borderRadius:99, transition:"all 0.3s",
            }}>
              <div style={{
                width:18, height:18, borderRadius:"50%",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem", fontWeight:700,
                background: i === idx ? "#00B4D8" : i < idx ? "rgba(0,180,216,0.15)" : "rgba(255,255,255,0.04)",
                color: i === idx ? "#060910" : i < idx ? "#00B4D8" : "#2d3340",
              }}>{i < idx ? "✓" : i + 1}</div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem", color: i === idx ? "#E6EDF3" : "#2d3340" }}>{s}</span>
            </div>
            {i < 2 && <div style={{ width:24, height:1, background:"rgba(0,180,216,0.1)", margin:"0 2px" }} />}
          </div>
        ))}
      </div>
      {screen !== "loading" && (
        <button className="btn-ghost" style={{ padding:"0.35rem 0.9rem", fontSize:"0.72rem", color:"#4a5568", borderColor:"rgba(74,85,104,0.2)" }} onClick={onBack}>
          ← Back
        </button>
      )}
    </div>
  );
}

// ── Card / SectionLabel ───────────────────────────────────────────────────────
function Card({ children, style={}, className="" }) {
  return (
    <div className={`card-hover ${className}`} style={{ background:"rgba(12,16,26,0.88)", border:"1px solid rgba(0,180,216,0.11)", borderRadius:14, padding:"1.5rem", backdropFilter:"blur(14px)", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ n, children, color="#00B4D8" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"1.2rem" }}>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem", color, background:"rgba(0,180,216,0.07)", border:"1px solid rgba(0,180,216,0.18)", borderRadius:4, padding:"1px 6px", letterSpacing:"0.08em" }}>
        {String(n).padStart && isNaN(n) ? n : String(n).padStart(2,"0")}
      </span>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#2d3340" }}>{children}</span>
      <div style={{ flex:1, height:1, background:"rgba(0,180,216,0.07)" }} />
    </div>
  );
}

// ── SCREEN: Upload ────────────────────────────────────────────────────────────
function UploadScreen({ onSubmit }) {
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
    <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>

      {/* Tip */}
      <div className="fade-up-1" style={{ background:"rgba(0,180,216,0.05)", border:"1px solid rgba(0,180,216,0.12)", borderRadius:10, padding:"0.85rem 1.25rem" }}>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem", color:"#4a5568", lineHeight:1.7 }}>
          📸 Upload <strong style={{ color:"#00B4D8" }}>3–5 clear photos</strong> of the store — shelves, counter, entrance. Add GPS for geo analysis. Best results with well-lit, unobstructed shots.
        </p>
      </div>

      {/* Images */}
      <Card className="fade-up-2">
        <SectionLabel n={1}>Store Images</SectionLabel>
        <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={handleDrop} onClick={()=>fileRef.current.click()} style={{ border:`2px dashed ${drag?"#00B4D8":"rgba(0,180,216,0.16)"}`, borderRadius:10, padding:"2.25rem 1rem", textAlign:"center", cursor:"pointer", background:drag?"rgba(0,180,216,0.04)":"transparent", transition:"all 0.2s", marginBottom:images.length?"1.25rem":0 }}>
          <div style={{ fontSize:"2rem", marginBottom:"0.6rem", opacity:drag?1:0.45 }}>{drag?"📥":"⬆"}</div>
          <p style={{ fontFamily:"'Syne',sans-serif", color:"#4a5568", fontSize:"0.88rem", marginBottom:"0.3rem" }}>
            Drag & drop, or <span style={{ color:"#00B4D8", textDecoration:"underline" }}>browse files</span>
          </p>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", color:"#2d3340", fontSize:"0.68rem" }}>{images.length}/5 selected · JPG PNG WEBP</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e=>addFiles(e.target.files)} />
        {images.length > 0 && (
          <div style={{ display:"flex", gap:"0.65rem", flexWrap:"wrap" }}>
            {images.map((img, i) => (
              <div key={i} style={{ position:"relative", width:86, height:86, borderRadius:10, overflow:"hidden", border:"1px solid rgba(0,180,216,0.22)" }}>
                <img src={URL.createObjectURL(img)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                <button onClick={e=>{e.stopPropagation();setImages(prev=>prev.filter((_,idx)=>idx!==i))}} style={{ position:"absolute", top:3, right:3, background:"rgba(6,9,16,0.85)", border:"none", borderRadius:"50%", width:18, height:18, color:"#FF4D6D", cursor:"pointer", fontSize:"0.6rem", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent,rgba(0,0,0,0.7))", padding:"3px 4px 2px", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.52rem", color:"rgba(230,237,243,0.75)" }}>{(img.size/1024).toFixed(0)}KB</div>
              </div>
            ))}
            {images.length < 5 && (
              <div onClick={()=>fileRef.current.click()} style={{ width:86, height:86, borderRadius:10, border:"2px dashed rgba(0,180,216,0.12)", display:"flex", alignItems:"center", justifyContent:"center", color:"#2d3340", cursor:"pointer", fontSize:"1.5rem" }}>+</div>
            )}
          </div>
        )}
      </Card>

      {/* GPS */}
      <Card className="fade-up-3">
        <SectionLabel n={2}>GPS Coordinates</SectionLabel>
        <div style={{ display:"flex", gap:"0.85rem", flexWrap:"wrap", marginBottom:"0.85rem" }}>
          {[["Latitude","21.145800",lat,setLat],["Longitude","79.088200",lng,setLng]].map(([label,ph,val,set])=>(
            <div key={label} style={{ flex:"1 1 140px" }}>
              <label style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.62rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#00B4D8", display:"block", marginBottom:"0.4rem" }}>{label}</label>
              <input className="input-field" type="number" placeholder={ph} value={val} onChange={e=>set(e.target.value)} />
            </div>
          ))}
        </div>
        <button className="btn-ghost" style={{ padding:"0.5rem 1rem" }} onClick={useLocation} disabled={locLoading}>
          {locLoading ? "◎ Detecting…" : "◎ Use My Location"}
        </button>
        {locErr && <p style={{ fontFamily:"'JetBrains Mono',monospace", color:"#FF4D6D", fontSize:"0.7rem", marginTop:"0.5rem" }}>{locErr}</p>}
      </Card>

      {/* Submit */}
      <div className="fade-up-4">
        <button className="btn-primary" disabled={!canSubmit} style={{ width:"100%", padding:"1rem", fontSize:"1rem" }} onClick={()=>onSubmit(images,parseFloat(lat),parseFloat(lng))}>
          Analyze Store →
        </button>
        {!canSubmit && (
          <p style={{ fontFamily:"'JetBrains Mono',monospace", color:"#2d3340", fontSize:"0.68rem", textAlign:"center", marginTop:"0.5rem" }}>
            {images.length===0 ? "↑ Add at least 1 store image" : "↑ Enter GPS coordinates to continue"}
          </p>
        )}
      </div>
    </div>
  );
}

// ── SCREEN: Loading ───────────────────────────────────────────────────────────
function LoadingScreen() {
  const [msgIdx, setMsgIdx]     = useState(0);
  const [progress, setProgress] = useState(0);
  const [dots, setDots]         = useState(".");

  useEffect(() => {
    const t1 = setInterval(()=>setMsgIdx(i=>(i+1)%LOADING_MSGS.length), 2200);
    const t2 = setInterval(()=>setProgress(p=>Math.min(p+Math.random()*6,92)), 350);
    const t3 = setInterval(()=>setDots(d=>d.length>=3?".":d+"."), 420);
    return ()=>{ clearInterval(t1); clearInterval(t2); clearInterval(t3); };
  }, []);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"5rem 1rem", gap:"2rem" }}>
      <div style={{ position:"relative", width:120, height:120 }}>
        {[{size:120,color:"#00B4D8",dur:"1.4s",rev:false,w:2},{size:86,color:"#00FFA3",dur:"1.0s",rev:true,w:2},{size:54,color:"#FFD600",dur:"0.7s",rev:false,w:1.5}].map(({size,color,dur,rev,w},i)=>(
          <div key={i} style={{ position:"absolute", width:size, height:size, top:(120-size)/2, left:(120-size)/2, borderRadius:"50%", border:`${w}px solid transparent`, borderTopColor:color, borderRightColor:`${color}33`, animation:`${rev?"spinRev":"spin"} ${dur} linear infinite`, boxShadow:`0 0 14px ${color}44` }} />
        ))}
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem" }}>🔬</div>
      </div>

      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.5rem" }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem", color:"#2d3340" }}>Processing{dots}</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem", color:"#00B4D8" }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height:3, background:"rgba(255,255,255,0.04)", borderRadius:99, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#00B4D8,#00FFA3)", borderRadius:99, transition:"width 0.35s ease", boxShadow:"0 0 10px rgba(0,180,216,0.6)" }} />
        </div>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"0.55rem", width:"100%", maxWidth:340 }}>
        {LOADING_MSGS.map((msg,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", gap:"0.65rem", opacity:i<=msgIdx?1:0.22, transition:"opacity 0.4s" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, background:i<msgIdx?"#00FFA3":i===msgIdx?"#00B4D8":"#2d3340", animation:i===msgIdx?"pulse 1s ease-in-out infinite":"none", boxShadow:i===msgIdx?"0 0 8px rgba(0,180,216,0.6)":"none" }} />
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem", color:i<=msgIdx?"#7D8590":"#2d3340" }}>{msg}</span>
            {i<msgIdx && <span style={{ marginLeft:"auto", color:"#00FFA3", fontSize:"0.65rem" }}>✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SCREEN: Results ───────────────────────────────────────────────────────────
function ResultsScreen({ data, onReset }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const rec = REC[data.recommendation] || REC.needs_verification;
  const confPct = Math.round((data.confidence_score||0)*100);
  const fraudPct = data.fraud_score || 0;
  const [barW, setBarW]     = useState(0);
  const [fraudW, setFraudW] = useState(0);

  useEffect(()=>{ const t=setTimeout(()=>{ setBarW(confPct); setFraudW(fraudPct); },400); return ()=>clearTimeout(t); },[confPct,fraudPct]);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a");
    a.href=url; a.download="kirana-report.json"; a.click(); URL.revokeObjectURL(url);
  };

  const fraudColor = fraudPct >= 50 ? "#FF4D6D" : fraudPct >= 25 ? "#FF9A3C" : "#00FFA3";

  const StatCard = ({ label, value, sub, delay="0s", accent=false }) => (
    <div className="card-hover" style={{ background:"rgba(12,16,26,0.88)", border:`1px solid ${accent?"rgba(0,180,216,0.25)":"rgba(0,180,216,0.11)"}`, borderRadius:14, padding:"1.25rem 1.4rem", flex:"1 1 190px", animation:`fadeUp 0.55s ${delay} ease both` }}>
      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#2d3340", marginBottom:"0.6rem" }}>{label}</p>
      <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"clamp(0.95rem,2.2vw,1.2rem)", fontWeight:700, color:accent?"#00B4D8":"#E6EDF3", lineHeight:1.2, marginBottom:sub?"0.4rem":0 }}>{value}</p>
      {sub&&<p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.66rem", color:"#2d3340" }}>{sub}</p>}
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem" }}>

      {/* Top bar */}
      <div className="fade-up" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"0.75rem" }}>
        <div>
          <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1.1rem", color:"#E6EDF3" }}>Analysis Complete</p>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.68rem", color:"#2d3340", marginTop:"0.2rem" }}>Vision × Geo fusion · {new Date().toLocaleTimeString()}</p>
        </div>
        <div style={{ display:"flex", gap:"0.6rem" }}>
          <button className="btn-ghost" style={{ padding:"0.5rem 1rem" }} onClick={downloadJSON}>↓ Download JSON</button>
          <button className="btn-ghost" style={{ padding:"0.5rem 1rem", color:"#4a5568", borderColor:"rgba(74,85,104,0.2)" }} onClick={onReset}>← New Analysis</button>
        </div>
      </div>

      {/* Recommendation hero */}
      <div className="fade-up-1 card-hover" style={{ background:`linear-gradient(135deg,rgba(12,16,26,0.97),${rec.glow.replace("0.25","0.07")})`, border:`1px solid ${rec.color}38`, borderRadius:14, padding:"1.5rem", display:"flex", alignItems:"center", gap:"1.25rem", flexWrap:"wrap", boxShadow:`0 0 40px ${rec.glow.replace("0.25","0.1")}` }}>
        <div style={{ width:54, height:54, borderRadius:14, flexShrink:0, background:`${rec.color}15`, border:`1px solid ${rec.color}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", color:rec.color }}>{rec.icon}</div>
        <div style={{ flex:1 }}>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#2d3340", marginBottom:"0.3rem" }}>Credit Recommendation</p>
          <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"1.35rem", fontWeight:800, color:rec.color, letterSpacing:"-0.02em", marginBottom:"0.3rem" }}>{rec.label}</p>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem", color:"#4a5568" }}>{rec.desc}</p>
          {data.confidence_reason && (
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.68rem", color:"#2d3340", marginTop:"0.3rem" }}>
              ↳ {data.confidence_reason}
            </p>
          )}
        </div>
        <div style={{ textAlign:"right", minWidth:90 }}>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#2d3340", marginBottom:"0.4rem" }}>Confidence</p>
          <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"2.2rem", fontWeight:800, color:rec.color, lineHeight:1 }}>{confPct}%</p>
          <div style={{ height:3, background:"rgba(255,255,255,0.05)", borderRadius:99, marginTop:"0.4rem", overflow:"hidden", width:80, marginLeft:"auto" }}>
            <div style={{ height:"100%", width:`${barW}%`, background:`linear-gradient(90deg,${rec.color}88,${rec.color})`, borderRadius:99, transition:"width 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="fade-up-2" style={{ display:"flex", gap:"0.85rem", flexWrap:"wrap" }}>
        <StatCard label="Daily Sales Range"  value={fmtR(data.daily_sales_range[0],data.daily_sales_range[1])}         sub="Estimated gross daily"  delay="0.1s" />
        <StatCard label="Monthly Revenue"    value={fmtR(data.monthly_revenue_range[0],data.monthly_revenue_range[1])} sub="~26 business days/mo"   delay="0.2s" />
        <StatCard label="Monthly Income"     value={fmtR(data.monthly_income_range[0],data.monthly_income_range[1])}   sub="Net margin 12–18%"      delay="0.3s" />
      </div>

      {/* Fraud Score */}
      <Card className="fade-up-3" style={{ borderColor:fraudPct>=50?"rgba(255,77,109,0.2)":fraudPct>=25?"rgba(255,154,60,0.2)":"rgba(0,255,163,0.15)" }}>
        <SectionLabel n="⚡" color={fraudColor}>Fraud Risk Score</SectionLabel>
        <div style={{ display:"flex", alignItems:"center", gap:"1.5rem", flexWrap:"wrap" }}>
          <div style={{ position:"relative", width:80, height:80, flexShrink:0 }}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={fraudColor} strokeWidth="8"
                strokeDasharray={`${2*Math.PI*32}`}
                strokeDashoffset={`${2*Math.PI*32*(1-fraudW/100)}`}
                strokeLinecap="round" transform="rotate(-90 40 40)"
                style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
              />
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.2rem", color:fraudColor, lineHeight:1 }}>{fraudPct}</span>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.5rem", color:"#2d3340" }}>/100</span>
            </div>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"1rem", color:fraudColor, marginBottom:"0.3rem" }}>
              {fraudPct >= 60 ? "HIGH RISK" : fraudPct >= 30 ? "MODERATE RISK" : "LOW RISK"}
            </p>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem", color:"#4a5568", lineHeight:1.6 }}>
              {fraudPct >= 60
                ? "Multiple strong fraud signals detected. Manual field verification strongly advised."
                : fraudPct >= 30
                ? "Some inconsistencies found. Cross-check flagged signals before proceeding."
                : "No major fraud signals. Data appears consistent across vision and geo inputs."}
            </p>
          </div>
        </div>
      </Card>

      {/* Risk Flags */}
      {data.risk_flags?.length > 0 && (
        <Card className="fade-up-4" style={{ borderColor:"rgba(255,77,109,0.18)", background:"rgba(255,77,109,0.03)" }}>
          <SectionLabel n="⚠" color="#FF4D6D">Risk Flags Detected</SectionLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
            {data.risk_flags.map((flag, i) => {
              const info = FLAG_INFO[flag] || { label: flag.replace(/_/g," "), sev:"low", desc:"Anomalous signal detected" };
              const sevColor = SEV_COLOR[info.sev] || "#7D8590";
              return (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"0.85rem", background:"rgba(255,77,109,0.04)", border:"1px solid rgba(255,77,109,0.12)", borderRadius:10, padding:"0.8rem 1rem" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.3rem", flexShrink:0, marginTop:2 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:sevColor, boxShadow:`0 0 6px ${sevColor}80` }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.25rem", flexWrap:"wrap" }}>
                      <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, fontSize:"0.82rem", color:"#E6EDF3" }}>{info.label}</span>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.1em", textTransform:"uppercase", color:sevColor, background:`${sevColor}18`, border:`1px solid ${sevColor}40`, borderRadius:4, padding:"1px 6px" }}>{info.sev}</span>
                    </div>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem", color:"#4a5568", lineHeight:1.5 }}>{info.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Vision Breakdown */}
      <Card className="fade-up-5">
        <button onClick={()=>setShowBreakdown(v=>!v)} style={{ background:"none", border:"none", cursor:"pointer", width:"100%", display:"flex", alignItems:"center", padding:0, marginBottom:showBreakdown?0:0 }}>
          <div style={{ flex:1 }}><SectionLabel n={4}>Vision Breakdown</SectionLabel></div>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", color:"#00B4D8", fontSize:"0.7rem", marginLeft:"1rem", flexShrink:0, paddingBottom:"1.2rem" }}>
            {showBreakdown?"▲ collapse":"▼ expand"}
          </span>
        </button>
        {showBreakdown && data.vision_breakdown && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:"0.85rem", marginBottom:"1rem" }}>
              {[
                { k:"Shelf Density",  v:`${data.vision_breakdown.shelf_density_index}/100`, bar:data.vision_breakdown.shelf_density_index },
                { k:"SKU Diversity",  v:`${data.vision_breakdown.sku_diversity_score}/10`,  bar:data.vision_breakdown.sku_diversity_score*10 },
                { k:"Store Size",     v:data.vision_breakdown.store_size, bar:null },
                { k:"Refill Signal",  v:data.vision_breakdown.refill_signal?.replace(/_/g," "), bar:null },
              ].map(({k,v,bar})=>(
                <div key={k} style={{ background:"rgba(0,180,216,0.03)", border:"1px solid rgba(0,180,216,0.07)", borderRadius:10, padding:"0.85rem" }}>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.58rem", letterSpacing:"0.15em", textTransform:"uppercase", color:"#2d3340", marginBottom:"0.45rem" }}>{k}</p>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"1rem", fontWeight:700, color:"#E6EDF3", marginBottom:bar!==null?"0.5rem":0 }}>{v}</p>
                  {bar!==null&&<div style={{ height:2, background:"rgba(255,255,255,0.04)", borderRadius:99, overflow:"hidden" }}><div style={{ height:"100%", width:`${bar}%`, background:"linear-gradient(90deg,#00B4D8,#00FFA3)", borderRadius:99 }} /></div>}
                </div>
              ))}
            </div>
            {/* Category mix */}
            {data.vision_breakdown.category_mix?.length > 0 && (
              <div>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.6rem", letterSpacing:"0.2em", textTransform:"uppercase", color:"#2d3340", marginBottom:"0.6rem" }}>Category Mix</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"0.4rem" }}>
                  {data.vision_breakdown.category_mix.map((cat,i)=>(
                    <span key={i} style={{ background:"rgba(0,180,216,0.06)", border:"1px solid rgba(0,180,216,0.15)", color:"#00B4D8", borderRadius:6, padding:"0.25rem 0.65rem", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.7rem" }}>{cat}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]     = useState("landing");
  const [result, setResult]     = useState(null);
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (images, lat, lng) => {
    setApiError(""); setScreen("loading");
    try {
      const formData = new FormData();
      images.forEach(img=>formData.append("images",img));
      formData.append("lat",lat);
      formData.append("lng",lng);
      const res = await axios.post(`${API_URL}/analyze`, formData, { headers:{"Content-Type":"multipart/form-data"}, timeout:120000 });
      if (res.data.error) throw new Error(res.data.error);
      setResult(res.data); setScreen("results");
    } catch(err) {
      setApiError(err.message || "Backend unreachable. Is it running on port 8000?");
      setScreen("upload");
    }
  };

  const goBack = () => {
    if (screen === "upload")  setScreen("landing");
    if (screen === "results") { setResult(null); setScreen("upload"); }
  };

  const showNav   = screen !== "landing";
  const showSteps = screen === "upload" || screen === "loading" || screen === "results";

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Background />

      {/* Navbar always visible */}
      <Navbar onGetStarted={()=>setScreen("upload")} />

      {/* Landing page is full-width */}
      {screen === "landing" && (
        <>
          <LandingPage onStart={()=>setScreen("upload")} />
          <Footer />
        </>
      )}

      {/* App screens */}
      {screen !== "landing" && (
        <div style={{ position:"relative", zIndex:1, maxWidth:860, margin:"0 auto", padding:"5.5rem 1.25rem 2rem" }}>
          {showSteps && <StepBar screen={screen} onBack={goBack} />}

          {apiError && (
            <div style={{ background:"rgba(255,77,109,0.06)", border:"1px solid rgba(255,77,109,0.22)", borderRadius:10, padding:"0.85rem 1.1rem", fontFamily:"'JetBrains Mono',monospace", fontSize:"0.76rem", color:"#FF4D6D", marginBottom:"1.25rem", display:"flex", gap:"0.75rem" }}>
              <span>✕</span><span>{apiError}</span>
            </div>
          )}

          {screen === "upload"  && <UploadScreen onSubmit={handleSubmit} />}
          {screen === "loading" && <LoadingScreen />}
          {screen === "results" && result && <ResultsScreen data={result} onReset={()=>{ setResult(null); setScreen("upload"); }} />}
        </div>
      )}

      {/* Footer on app screens too */}
      {screen !== "landing" && <Footer />}
    </>
  );
}
