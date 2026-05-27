import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "motion/react";
import { ArrowUpRight, Mail, ChevronUp, Download, ShieldCheck, Activity } from "lucide-react";

// Custom inline SVG icons to prevent lucide-react brand removal issues
function GithubIcon({ size = 18, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({ size = 18, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// Draggable and Auto-rotating 3D Wireframe Sphere
function WireframeSphere({ cursorHover }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const autoRotateSpeed = useRef(0.0003); // Rotation per millisecond
  const rafRef = useRef();

  // Slow down on hover
  useEffect(() => {
    if (cursorHover) {
      autoRotateSpeed.current = 0.00008;
    } else {
      autoRotateSpeed.current = 0.0003;
    }
  }, [cursorHover]);

  useEffect(() => {
    let last = 0;
    const tick = (t) => {
      if (!last) last = t;
      const dt = t - last;
      last = t;

      if (!isDragging.current) {
        setRotation((r) => ({
          x: r.x + dt * autoRotateSpeed.current * 0.4,
          y: r.y + dt * autoRotateSpeed.current,
        }));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - prevMousePos.current.x;
    const dy = e.clientY - prevMousePos.current.y;
    prevMousePos.current = { x: e.clientX, y: e.clientY };

    setRotation((r) => ({
      x: r.x - dy * 0.005,
      y: r.y + dx * 0.005,
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const R = 150;
  const cx = 200, cy = 200;
  const latLines = 8, lonLines = 12;
  const paths = [];

  const sinX = Math.sin(rotation.x), cosX = Math.cos(rotation.x);
  const sinY = Math.sin(rotation.y), cosY = Math.cos(rotation.y);

  const projectPoint = (x, y, z) => {
    // Rotate Y
    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;

    // Rotate X
    let y2 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    // Perspective Projection
    const distanceFactor = 1.4;
    const scale = 1 + z2 / (R * distanceFactor);
    return {
      px: cx + x1 * scale,
      py: cy + y2 * scale,
      pz: z2,
    };
  };

  // Generate Latitude Rings
  for (let i = 1; i < latLines; i++) {
    const phi = (Math.PI * i) / latLines;
    const r2d = R * Math.sin(phi);
    const y3d = R * Math.cos(phi);
    let d = "";
    let visiblePoints = 0;

    for (let j = 0; j <= 60; j++) {
      const theta = (2 * Math.PI * j) / 60;
      const x3d = r2d * Math.cos(theta);
      const z3d = r2d * Math.sin(theta);

      const { px, py, pz } = projectPoint(x3d, y3d, z3d);

      if (pz > 0) visiblePoints++;
      if (j === 0) d += `M${px.toFixed(1)},${py.toFixed(1)}`;
      else d += `L${px.toFixed(1)},${py.toFixed(1)}`;
    }
    const op = visiblePoints > 30 ? 0.35 : 0.12;
    paths.push({ d, op });
  }

  // Generate Longitude Arcs
  for (let i = 0; i < lonLines; i++) {
    const theta = (2 * Math.PI * i) / lonLines;
    let d = "";
    let visiblePoints = 0;

    for (let j = 0; j <= 40; j++) {
      const phi = (Math.PI * j) / 40;
      const x3d = R * Math.sin(phi) * Math.cos(theta);
      const y3d = R * Math.cos(phi);
      const z3d = R * Math.sin(phi) * Math.sin(theta);

      const { px, py, pz } = projectPoint(x3d, y3d, z3d);

      if (pz > 0) visiblePoints++;
      if (j === 0) d += `M${px.toFixed(1)},${py.toFixed(1)}`;
      else d += `L${px.toFixed(1)},${py.toFixed(1)}`;
    }
    const op = visiblePoints > 20 ? 0.35 : 0.12;
    paths.push({ d, op });
  }

  return (
    <div
      className="sphere-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ filter: "drop-shadow(0 0 50px rgba(0,245,196,0.12))" }}
    >
      <svg width="400" height="400" viewBox="0 0 400 400" style={{ userSelect: "none", pointerEvents: "none" }}>
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            stroke="#00F5C4"
            strokeWidth="0.8"
            fill="none"
            opacity={p.op}
          />
        ))}
        {/* Decorative Outer Aura Ring */}
        <circle cx={cx} cy={cy} r={R} stroke="#00F5C4" strokeWidth="0.4" fill="none" opacity="0.08" />
      </svg>
    </div>
  );
}

// Custom Smooth Dynamic Filling Skill Row
function SkillBar({ name, pct }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div className="skill-row" ref={ref}>
      <div className="skill-meta">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{pct}%</span>
      </div>
      <div className="skill-track">
        <div
          className="skill-fill"
          style={{ width: inView ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}

// Fade Scroll-Reveal Wrapper with standard Framer settings
function FadeUp({ children, delay = 0, x = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

const LANGUAGES = [
  { name: "Python", pct: 88 },
  { name: "C++", pct: 85 },
  { name: "JavaScript", pct: 82 },
  { name: "Dart", pct: 70 },
];

const FRAMEWORKS_AI = [
  { name: "React.js / Frontend", pct: 80 },
  { name: "Node.js / Backend", pct: 80 },
  { name: "PyTorch / YOLO Models", pct: 85 },
  { name: "SQL & SQLite", pct: 82 },
  { name: "MongoDB & Document DBs", pct: 75 },
];

const PROJECTS = [
  {
    featured: "Featured ML & Systems Project",
    year: "2024",
    name: "Safety-Critical Autonomous Drone Landing System",
    desc: "Risk-aware landing decision engine combining deep learning detection, Bayesian uncertainty estimation (MC Dropout & Deep Ensembles), and multi-factor safety logic. Specifically models 'when the drone should NOT trust itself' under adverse fog, night, and occlusion conditions.",
    tags: ["Python", "PyTorch", "YOLO11n", "Monte-Carlo Dropout", "Deep Ensembles"],
    github: "https://github.com/harshrarora/safe-drone-landing",
    demo: null,
  },
  {
    featured: "DBMS & Full Stack Project",
    year: "2026",
    name: "FinFlow — Personal Finance Manager",
    desc: "A personal finance management web application featuring expense tracking, budgeting grids, and real-time visual analytics. Designed with a Node.js API and built with hybrid relational (SQL) and document (MongoDB) storage for transactional efficiency.",
    tags: ["JavaScript", "MongoDB", "SQL", "Node.js", "Express"],
    github: "https://github.com/Tanmay-Agarwal2312",
    demo: null,
  },
  {
    featured: "Multiplayer Browser Game",
    year: "2023",
    name: "Virtual Roulette — Hotseat Party Game",
    desc: "Browser-based multiplayer party game with configurable chambers and real-time turn tracking. Features animated cylinder spinning and a statistically correct chamber simulation reset system that preserves true probability.",
    tags: ["JavaScript", "HTML", "CSS"],
    github: "https://github.com/Tanmay-Agarwal2312/RussianRolleteGame",
    demo: null,
  },
  {
    featured: "Mobile Application",
    year: "2023",
    name: "Cross-Platform Authentication System",
    desc: "Flutter-based secure mobile application with registration, login, and concurrent session support. Integrates input parameterization to completely prevent SQL injection vulnerabilities.",
    tags: ["Flutter", "Dart", "SQLite"],
    github: "https://github.com/Tanmay-Agarwal2312",
    demo: null,
  },
];

const TIMELINE = [
  {
    period: "2024–Present",
    title: "Lead ML & System Researcher (Drone Systems)",
    company: "TEKNOFEST Research & HackTU 7.0",
    desc: "Developed a Bayesian uncertainty decision engine for safety-critical drone landings. Achieved mAP@0.5 of 0.918 under weather augmented conditions with YOLO11n. Implemented 30 stochastic MC Dropout passes and 3-model deep ensembles for explainable safe/abort commands.",
    active: true,
  },
  {
    period: "2026",
    title: "Full Stack Database Engineer (FinFlow Project)",
    company: "Thapar Institute of Eng. & Tech. (UCS310)",
    desc: "Collaboratively designed and implemented a secure dual-storage system (MongoDB & SQL) for a finance manager. Standardized query builders and developed real-time dashboard analytics charts handling both relational records and nested goals data.",
    active: false,
  },
  {
    period: "2023",
    title: "Game & Security Developer",
    company: "Independent Projects",
    desc: "Shipped fully static web products and secure mobile client templates. Focused on client-side state machine mechanics (Roulette engine) and secure local database integrations (parameterized SQLite in Dart/Flutter).",
    active: false,
  },
];

export default function App() {
  const containerRef = useRef(null);
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Custom Cursor state
  const [cursorHover, setCursorHover] = useState(false);
  const [cursorHidden, setCursorHidden] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const ringPos = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseEnter = () => setCursorHidden(false);
    const handleMouseLeave = () => setCursorHidden(true);

    const animateRing = () => {
      // Lag calculation
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.16;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }
      requestAnimationFrame(animateRing);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    const rafId = requestAnimationFrame(animateRing);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Set Hover Events to scale cursor ring
  useEffect(() => {
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, [data-hover="true"], .project-card, .social-link, .back-top, .nav-link');
      if (target) {
        setCursorHover(true);
      } else {
        setCursorHover(false);
      }
    };

    window.addEventListener("mouseover", handleMouseOver);
    return () => window.removeEventListener("mouseover", handleMouseOver);
  }, []);

  // Parallax Scroll Layers
  const heroTextY = useTransform(scrollY, [0, 800], [0, -100]);
  const sphereY = useTransform(scrollY, [0, 800], [0, -60]);
  const dotGridY = useTransform(scrollY, [0, 800], [0, -140]);

  const contactRef = useRef(null);
  const { scrollYProgress: contactProgress } = useScroll({
    target: contactRef,
    offset: ["start end", "end start"],
  });
  const watermarkY = useTransform(contactProgress, [0, 1], [80, -80]);

  // Navigation Scrolled backdrop & Active Tracking
  const [scrolled, setScrolled] = useState(false);
  const [activeSec, setActiveSec] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);

      const sections = ["hero", "about", "skills", "projects", "experience", "contact"];
      let currentSec = "hero";
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el && window.scrollY >= el.offsetTop - 150) {
          currentSec = sec;
        }
      }
      setActiveSec(currentSec);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Mouse Parallax Dot Grid movement on mousemove
  const [heroOffset, setHeroOffset] = useState({ x: 0, y: 0 });
  const handleHeroMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    setHeroOffset({ x: x * 4, y: y * 4 });
  }, []);

  const handleHeroMouseLeave = () => {
    setHeroOffset({ x: 0, y: 0 });
  };

  // Page Intro Overlay
  const [pageLoaded, setPageLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPageLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} style={{ cursor: "none" }}>
      {/* Monograph Top Loading Overlay */}
      <motion.div
        className="page-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: pageLoaded ? 0 : 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Lag-Interpolated Interactive Cursor */}
      <div
        ref={dotRef}
        className={`cursor-dot ${cursorHover ? "cursor-hover" : ""} ${cursorHidden ? "cursor-hidden" : ""}`}
      />
      <div
        ref={ringRef}
        className={`cursor-ring ${cursorHover ? "cursor-hover" : ""} ${cursorHidden ? "cursor-hidden" : ""}`}
      />

      {/* Thin Monolith Scroll Line */}
      <motion.div className="scroll-progress" style={{ scaleX }} />

      {/* 00 - Nav Header */}
      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          TA
        </div>
        <div className="nav-links">
          {["about", "skills", "projects", "experience", "contact"].map((s) => (
            <span
              key={s}
              className={`nav-link ${activeSec === s ? "active" : ""}`}
              onClick={() => scrollTo(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          ))}
          <button className="hire-btn" onClick={() => scrollTo("contact")}>
            <span>Hire Me</span>
          </button>
        </div>
      </nav>

      {/* 01 - Hero */}
      <section
        id="hero"
        className="hero"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <motion.div
          className="dot-grid"
          style={{
            x: heroOffset.x,
            y: useTransform(dotGridY, (v) => v + heroOffset.y),
          }}
        />

        <motion.div className="hero-left" style={{ y: heroTextY }}>
          <div className="hero-eyebrow">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Software Engineer & ML Researcher
            </motion.span>
          </div>

          <h1 className="hero-heading">
            {"Building systems".split("").map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.02, ease: "easeOut" }}
                style={{ display: c === " " ? "inline" : "inline-block" }}
              >
                {c === " " ? "\u00A0" : c}
              </motion.span>
            ))}
            <br />
            {"that ".split("").map((c, i) => (
              <motion.span
                key={i + 20}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.02, ease: "easeOut" }}
                style={{ display: "inline-block" }}
              >
                {c === " " ? "\u00A0" : c}
              </motion.span>
            ))}
            {"scale.".split("").map((c, i) => (
              <motion.span
                key={i + 30}
                className="hero-accent"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.95 + i * 0.03, ease: "easeOut" }}
                style={{ display: c === " " ? "inline" : "inline-block" }}
              >
                {c === " " ? "\u00A0" : c}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="hero-body"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            Computer Science B.E. student at Thapar Institute. I design risk-aware machine learning models, secure user authentication schemas, and high-performance full-stack web applications.
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <button className="cta-primary" onClick={() => scrollTo("projects")}>
              View Work <ArrowUpRight size={15} />
            </button>
            <button className="cta-secondary" onClick={() => scrollTo("contact")}>
              Get In Touch
            </button>
          </motion.div>
        </motion.div>

        <motion.div className="hero-right" style={{ y: sphereY }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          >
            <WireframeSphere cursorHover={cursorHover} />
          </motion.div>
        </motion.div>

        {/* Dynamic scroll travels dot */}
        <div className="scroll-indicator">
          <div className="scroll-line">
            <div className="scroll-dot-travel" />
          </div>
        </div>
      </section>

      {/* 02 - About */}
      <section id="about" style={{ minHeight: "80vh", position: "relative" }}>
        <div className="about-grid">
          <div className="about-num-col">
            <FadeUp>
              <div className="section-num">02</div>
              <div className="section-label">About</div>
            </FadeUp>
          </div>
          <div className="about-body">
            <FadeUp delay={0.1}>
              <h2 className="section-heading">
                Clarity of thought,<br />
                <span className="serif-italic" style={{ color: "var(--primary)" }}>precision</span> of code.
              </h2>
              <p>
                I'm a Computer Science Engineering undergraduate student at Thapar Institute of Engineering and Technology (CGPA: 8.78). I spend my time exploring the boundaries between computer systems, web applications, and statistical machine learning.
              </p>
              <p>
                I focus on writing secure, maintainable, and correct code. Whether that's designing a safety-critical autonomous drone decision network under Bayesian uncertainty, or establishing a hybrid relational/document storage database architecture, I strive for absolute robustness.
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={0.25} x={15}>
            <div className="status-card">
              <div className="status-card-row">
                <div className="status-label">Status</div>
                <div className="status-value">
                  <span className="status-dot" /> Available for SW & ML roles
                </div>
              </div>
              <div className="status-card-row">
                <div className="status-label">Location</div>
                <div className="status-value">India / Remote / Worldwide</div>
              </div>
              <div className="status-card-row">
                <div className="status-label">Education</div>
                <div className="status-value">B.E. Computer Science</div>
              </div>
              <div className="status-card-row">
                <div className="status-label">TIET CGPA</div>
                <div className="status-value mono">8.78 / 10.00</div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* 03 - Skills */}
      <section id="skills" className="skills-section">
        <FadeUp>
          <div className="skills-header">
            <div className="section-num" style={{ fontSize: 64, lineHeight: 1, opacity: 0.05, marginRight: 12 }}>03</div>
            <div>
              <div className="section-label">Skills</div>
              <h2 className="section-heading" style={{ marginBottom: 0 }}>
                Tools of the<br /><span className="serif-italic" style={{ color: "var(--primary)" }}>craft.</span>
              </h2>
            </div>
          </div>
        </FadeUp>

        <div className="skills-grid">
          <div>
            <div className="skills-col-title">Languages</div>
            {LANGUAGES.map((s) => (
              <SkillBar key={s.name} {...s} />
            ))}
          </div>
          <div>
            <div className="skills-col-title">Frameworks, Databases & ML</div>
            {FRAMEWORKS_AI.map((s) => (
              <SkillBar key={s.name} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* 04 - Projects */}
      <section id="projects" className="projects-section">
        <FadeUp>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 72 }}>
            <div className="section-num" style={{ fontSize: 64, lineHeight: 1, opacity: 0.05 }}>04</div>
            <div>
              <div className="section-label">Projects</div>
              <h2 className="section-heading" style={{ marginBottom: 0 }}>
                Selected<br /><span className="serif-italic" style={{ color: "var(--primary)" }}>work.</span>
              </h2>
            </div>
          </div>
        </FadeUp>

        {PROJECTS.map((p, i) => (
          <FadeUp key={p.name} delay={i * 0.15}>
            <div className="project-card">
              <div className="project-header">
                <span className="project-featured mono">{p.featured}</span>
                <span className="project-year mono">{p.year}</span>
              </div>
              <div className="project-name serif">{p.name}</div>
              <div className="project-rule" />
              <p className="project-desc">{p.desc}</p>
              <div className="project-tags">
                {p.tags.map((t) => (
                  <span key={t} className="project-tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="project-links">
                {p.github && (
                  <a className="project-link" href={p.github} target="_blank" rel="noopener noreferrer">
                    <GithubIcon size={12} /> GitHub <ArrowUpRight size={10} />
                  </a>
                )}
              </div>
            </div>
          </FadeUp>
        ))}
      </section>

      {/* 05 - Experience / Timeline */}
      <section id="experience" className="timeline-section">
        <FadeUp>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 72 }}>
            <div className="section-num" style={{ fontSize: 64, lineHeight: 1, opacity: 0.05 }}>05</div>
            <div>
              <div className="section-label">Timeline</div>
              <h2 className="section-heading" style={{ marginBottom: 0 }}>
                Research &<br /><span className="serif-italic" style={{ color: "var(--primary)" }}>engineering.</span>
              </h2>
            </div>
          </div>
        </FadeUp>

        <div className="timeline-inner">
          <div className="timeline-line" />
          {TIMELINE.map((e, i) => (
            <FadeUp key={e.company} delay={i * 0.15} x={-15}>
              <div className="timeline-entry">
                <div className={`timeline-dot ${e.active ? "active" : ""}`} />
                <div className="timeline-period mono">{e.period}</div>
                <div className="timeline-title serif">{e.title}</div>
                <div className="timeline-company">{e.company}</div>
                <div className="timeline-desc">{e.desc}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* 06 - Contact */}
      <section id="contact" className="contact-section" ref={contactRef}>
        <motion.div className="contact-watermark" style={{ y: watermarkY }}>
          Contact
        </motion.div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <FadeUp>
            <h2 className="contact-heading">
              Let's build<br />
              something <span className="serif-italic" style={{ color: "var(--primary)" }}>good.</span>
            </h2>
            <p className="contact-body">
              Looking for software engineering or machine learning roles, interesting collaborations, and technical discussions. Let's connect.
            </p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <a className="contact-email" href="mailto:t.agarwal2312@gmail.com">
                <Mail size={16} style={{ color: "var(--primary)" }} />
                t.agarwal2312@gmail.com
                <ArrowUpRight size={14} />
              </a>

              <div className="contact-socials">
                <a
                  className="social-link"
                  href="https://github.com/Tanmay-Agarwal2312"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                >
                  <GithubIcon size={18} />
                </a>
                 <a
                  className="social-link"
                  href="https://www.linkedin.com/in/tanmay-agarwal-072136274/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                >
                  <LinkedinIcon size={18} />
                </a>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <span className="footer-text mono">
          © 2026 Tanmay Agarwal. Built with React & Vite.
        </span>
        <div className="back-top mono" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <ChevronUp size={14} /> Back to top
        </div>
      </footer>
    </div>
  );
}
