import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion"
import {
  Shield, Zap, Activity, Globe, ArrowRight, Eye, Phone,
  Radio, AlertTriangle, CheckCircle, Play, ChevronRight,
  Cpu, Network, BarChart3, Clock, Heart, Target, Layers
} from "lucide-react"
import { useAuth } from "../context/AuthContext"

/* ─────────────────────────────────────────
   PARTICLE CANVAS
───────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let W, H, particles = [], animId

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * W
        this.y = Math.random() * H
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.life = Math.random()
        this.r = Math.random() * 1.5 + 0.5
        this.blue = Math.random() > 0.65
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life -= 0.0015
        if (this.life <= 0 || this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = this.blue
          ? `rgba(0,212,255,${this.life * 0.7})`
          : `rgba(255,26,46,${this.life * 0.5})`
        ctx.fill()
      }
    }

    for (let i = 0; i < 130; i++) particles.push(new Particle())

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d / 100) * 0.06})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    const loop = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => { p.update(); p.draw() })
      drawLines()
      animId = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

/* ─────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────── */
function Counter({ target, suffix = "", duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { setDisplay(Math.floor(v).toLocaleString()) }
    })
    return controls.stop
  }, [inView, target, duration])

  return <span ref={ref}>{display}{suffix}</span>
}

/* ─────────────────────────────────────────
   RADAR ANIMATION
───────────────────────────────────────── */
function RadarPulse() {
  return (
    <div className="relative w-40 h-40 mx-auto mt-12">
      {[160, 110, 62].map((size, i) => (
        <div
          key={i}
          className="absolute rounded-full border top-1/2 left-1/2"
          style={{
            width: size, height: size,
            marginLeft: -size / 2, marginTop: -size / 2,
            borderColor: `rgba(0,212,255,${0.15 + i * 0.1})`
          }}
        />
      ))}
      <motion.div
        className="absolute top-1/2 left-1/2 h-0.5 rounded"
        style={{
          width: 80, originX: 0, originY: "50%",
          background: "linear-gradient(90deg, #00d4ff, transparent)",
          marginTop: -1
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      />
      {[{ top: "30%", left: "62%" }, { top: "64%", left: "33%" }].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-red-500"
          style={{ width: i === 0 ? 6 : 4, height: i === 0 ? 6 : 4, ...pos, boxShadow: "0 0 10px #ff1a2e" }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.8 }}
        />
      ))}
      <div
        className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ background: "#00d4ff", boxShadow: "0 0 15px #00d4ff" }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────
   FLOATING ALERT CARD
───────────────────────────────────────── */
function AlertCard({ label, value, color = "#ff1a2e", style, delay = 0 }) {
  return (
    <motion.div
      className="absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl text-xs backdrop-blur-xl"
      style={{
        background: "rgba(7,13,26,0.85)",
        border: `1px solid ${color}40`,
        boxShadow: `0 0 20px ${color}20, 0 8px 32px rgba(0,0,0,0.5)`,
        ...style
      }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <motion.span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <div>
        <div className="font-bold tracking-widest uppercase" style={{ color, fontSize: "0.65rem" }}>{label}</div>
        <div className="text-slate-100 font-semibold text-xs">{value}</div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   GLASS CARD
───────────────────────────────────────── */
function GlassCard({ children, className = "", hoverGlow = "blue", delay = 0 }) {
  const glowColor = hoverGlow === "red" ? "rgba(255,26,46,0.15)" : "rgba(0,212,255,0.15)"
  const borderHover = hoverGlow === "red" ? "rgba(255,26,46,0.4)" : "rgba(0,212,255,0.4)"
  return (
    <motion.div
      className={`rounded-2xl p-6 transition-all duration-300 ${className}`}
      style={{ background: "rgba(10,17,40,0.6)", border: "1px solid rgba(0,212,255,0.12)", backdropFilter: "blur(20px)" }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -6,
        borderColor: borderHover,
        boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${glowColor}`
      }}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────── */
function SectionHeader({ tag, title, sub, accentColor = "blue" }) {
  const accent = accentColor === "red" ? "#ff1a2e" : "#00d4ff"
  const gradFrom = accentColor === "red" ? "#ff1a2e" : "#00d4ff"
  const gradTo = accentColor === "red" ? "#00d4ff" : "#ff1a2e"
  return (
    <div className="mb-12">
      <motion.div
        className="text-xs font-bold tracking-widest uppercase mb-3"
        style={{ color: accent }}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
      >
        {tag}
      </motion.div>
      <motion.h2
        className="font-black leading-tight mb-4"
        style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <motion.div
        className="h-0.5 w-20 rounded mb-5"
        style={{ background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})` }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        style={{ transformOrigin: "left", background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`, height: 2, width: 80, borderRadius: 2, marginBottom: "1.25rem" }}
      />
      {sub && (
        <motion.p
          className="text-slate-400 text-lg leading-relaxed max-w-2xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
        >
          {sub}
        </motion.p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function LandingPage() {
  const { user } = useAuth()

  const features = [
    {
      icon: <Eye size={22} />, color: "red", title: "Real-Time Vision AI",
      desc: "YOLOv10-RG model ensemble processes 120fps feeds from 50,000+ cameras with 98.4% precision under adverse conditions including night, rain, and fog."
    },
    {
      icon: <Zap size={22} />, color: "blue", title: "Instant Alert Dispatch",
      desc: "WebSocket-powered emergency broadcast reaches fire, EMS, and police dispatch simultaneously within 1.2 seconds of incident confirmation."
    },
    {
      icon: <Phone size={22} />, color: "red", title: "Trauma Center Integration",
      desc: "Direct HL7 FHIR API pre-notifies hospital trauma teams with injury severity prediction before the ambulance arrives."
    },
    {
      icon: <Globe size={22} />, color: "blue", title: "Global Edge Coverage",
      desc: "Federated edge-compute infrastructure across 47 cities. Sub-2s latency guaranteed through on-device processing regardless of connectivity."
    },
    {
      icon: <Shield size={22} />, color: "red", title: "Predictive Risk Scoring",
      desc: "Transformer models analyze road conditions, weather, and traffic density to flag high-risk zones before accidents occur."
    },
    {
      icon: <BarChart3 size={22} />, color: "blue", title: "Command Dashboard",
      desc: "Palantir-grade operational interface giving emergency managers a unified real-time view of incidents, units, and resource allocation."
    }
  ]

  const timelineSteps = [
    {
      step: "01", title: "Feed Ingestion",
      desc: "Edge nodes ingest multi-source video at 120fps. Encrypted RTSP streams from cameras feed into the distributed cluster with zero-copy memory transfer."
    },
    {
      step: "02", title: "Vision AI Analysis",
      desc: "Proprietary YOLOv10-RG model ensemble runs frame-level classification, trajectory prediction, and impact force estimation simultaneously in 8ms."
    },
    {
      step: "03", title: "Incident Confirmation",
      desc: "Multi-sensor fusion cross-validates with IoT road sensors, audio anomaly detection, and satellite telemetry to eliminate false positives."
    },
    {
      step: "04", title: "Emergency Dispatch",
      desc: "Verified incidents trigger simultaneous push to CAD systems, hospital trauma APIs, and first responder devices. Full incident packet in 1.2 seconds."
    }
  ]

  const testimonials = [
    {
      text: "The system had units rolling before our dispatch even picked up the phone. We arrived 4 minutes faster than our average. That 4 minutes was the difference for the driver in cardiac arrest.",
      name: "Chief Marcus Rivera", role: "Los Angeles Fire Department, Station 27", initials: "CM", color: "#ff1a2e"
    },
    {
      text: "RoadGuardian eliminated the verification step entirely. We used to waste 90 seconds confirming reports. Now we trust the AI's confidence score and deploy immediately. Zero regrets.",
      name: "Superintendent S. Kaur", role: "Mumbai Traffic Emergency Control", initials: "SK", color: "#00d4ff"
    },
    {
      text: "The trauma pre-notification alone saves 7 to 12 minutes of preparation. Our surgical team is gloved and ready when the ambulance backs in. This is the future of emergency medicine.",
      name: "Dr. Dana Whitfield", role: "Trauma Director, St. Luke's Medical Center", initials: "DW", color: "#22c55e"
    }
  ]

  const aiMetrics = [
    { val: "847M", label: "Training Frames" },
    { val: "8ms", label: "Inference Latency" },
    { val: "98.4%", label: "mAP@0.5" },
    { val: "23", label: "Countries Trained" },
    { val: "0.3%", label: "False Positive Rate" },
    { val: "24/7", label: "Uptime SLA" }
  ]

  const footerLinks = [
    { title: "Platform", links: ["AI Vision Engine", "Dispatch Integration", "Command Dashboard", "API Reference"] },
    { title: "Company", links: ["About Us", "Case Studies", "Press", "Careers"] },
    { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "Compliance"] }
  ]

  return (
    <div className="relative overflow-x-hidden" style={{ background: "#030510", color: "#e8f4ff", fontFamily: "'Inter', sans-serif" }}>

      {/* Scan line effect */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, #00d4ff, transparent)", opacity: 0.12, zIndex: 200 }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <ParticleCanvas />

      {/* ── NAV ── */}
      <motion.nav
        className="fixed top-0 w-full z-50 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(3,5,16,0.75)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-2" style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, letterSpacing: ".05em" }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <polygon points="16,2 30,28 2,28" stroke="#ff1a2e" strokeWidth="2" fill="none" />
            <circle cx="16" cy="18" r="5" stroke="#00d4ff" strokeWidth="1.5" fill="none" />
          </svg>
          RoadGuardian
        </div>

        <div className="hidden md:flex gap-8">
          {["Features", "How It Works", "AI Engine", "Responders"].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              className="text-xs font-semibold tracking-widest uppercase transition-colors duration-200"
              style={{ color: "#5a7a99" }}
              onMouseEnter={e => e.target.style.color = "#00d4ff"}
              onMouseLeave={e => e.target.style.color = "#5a7a99"}
            >
              {link}
            </a>
          ))}
        </div>

        <Link
          to={user ? "/dashboard" : "/login"}
          className="text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-lg transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, #ff1a2e, #ff4d5e)",
            color: "#fff",
            boxShadow: "0 0 20px rgba(255,26,46,0.4)"
          }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 0 35px rgba(255,26,46,0.5)" }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 0 20px rgba(255,26,46,0.4)" }}
        >
          {user ? "Dashboard" : "Deploy Now"}
        </Link>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center text-center px-4 pt-24 pb-16" style={{ zIndex: 1 }}>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />

        {/* Floating alerts */}
        <AlertCard label="Accident Detected" value="Highway 101 · Severity 4" color="#ff1a2e" style={{ top: "32%", left: "2%" }} delay={0} />
        <AlertCard label="Units Dispatched" value="ETA 1m 43s" color="#00d4ff" style={{ top: "48%", right: "2%" }} delay={1.5} />
        <AlertCard label="AI Confidence" value="98.7% Match" color="#22c55e" style={{ top: "18%", right: "5%" }} delay={3} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 860 }}>
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
            style={{ border: "1px solid #ff1a2e", background: "rgba(255,26,46,0.08)", color: "#ff1a2e" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 8px #ff1a2e", "none", "0 0 8px #ff1a2e"] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            Emergency Response Intelligence · Active
          </motion.div>

          <motion.h1
            className="font-black leading-tight mb-6"
            style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)", letterSpacing: "-.02em" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{ display: "block", color: "#e8f4ff" }}>AI That Saves Lives</span>
            <span style={{ background: "linear-gradient(135deg, #ff1a2e 0%, #ff6b35 45%, #00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Before Humans React
            </span>
          </motion.h1>

          <motion.p
            className="text-lg leading-relaxed mb-10 mx-auto"
            style={{ color: "#5a7a99", maxWidth: 660 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            RoadGuardian AI detects accidents in real time, alerts emergency responders instantly,
            and reduces critical response delays by up to 68%.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            <Link
              to={user ? "/dashboard" : "/login"}
              className="inline-flex items-center justify-center gap-2 font-bold rounded-lg px-8 py-4 text-white transition-all duration-300"
              style={{
                background: "#ff1a2e",
                boxShadow: "0 0 30px rgba(255,26,46,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                letterSpacing: ".03em"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 0 50px rgba(255,26,46,0.55)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,26,46,0.4)" }}
            >
              <Zap size={18} /> {user ? "Launch Dashboard" : "Deploy RoadGuardian"}
            </Link>
            <button
              className="inline-flex items-center justify-center gap-2 font-bold rounded-lg px-8 py-4 transition-all duration-300"
              style={{
                border: "1px solid #00d4ff", color: "#00d4ff", background: "transparent",
                boxShadow: "0 0 15px rgba(0,212,255,0.25)", letterSpacing: ".03em"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.background = "rgba(0,212,255,0.08)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "transparent" }}
            >
              <Play size={16} fill="currentColor" /> Watch System Demo
            </button>
          </motion.div>

          <RadarPulse />
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ borderTop: "1px solid rgba(0,212,255,0.1)", borderBottom: "1px solid rgba(0,212,255,0.1)", background: "rgba(7,13,26,0.5)", backdropFilter: "blur(10px)", position: "relative", zIndex: 1 }}>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            { target: 142847, suffix: "", label: "Accidents Detected", sub: "This month globally" },
            { target: 94, suffix: "s", label: "Avg. Response Time", sub: "Vs. 6.5min national avg" },
            { target: 8312, suffix: "", label: "Lives Saved", sub: "Verified by responders" },
            { target: 98, suffix: "%", label: "Detection Accuracy", sub: "On independent benchmarks" }
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="px-6 py-10 text-center relative group cursor-default"
              style={{ borderRight: i < 3 ? "1px solid rgba(0,212,255,0.08)" : "none" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ background: "rgba(0,212,255,0.04)" }}
            >
              <motion.div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg, transparent, #ff1a2e, transparent)", scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
              />
              <div
                className="font-black text-4xl md:text-5xl mb-2"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background: "linear-gradient(135deg, #e8f4ff, #00d4ff)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}
              >
                <Counter target={s.target} suffix={s.suffix} duration={2 + i * 0.2} />
              </div>
              <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "#5a7a99" }}>{s.label}</div>
              <div className="text-xs" style={{ color: "#3a5a79" }}>{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-4 py-24" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            tag="Core Capabilities"
            title='Built for the <span style="color:#ff1a2e">Critical</span> Moment'
            sub="Every millisecond matters in emergency response. Our AI platform is engineered from the ground up for zero-latency detection and autonomous coordination."
            accentColor="red"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <GlassCard key={f.title} hoverGlow={f.color} delay={i * 0.08}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: f.color === "red" ? "rgba(255,26,46,0.1)" : "rgba(0,212,255,0.1)",
                    border: `1px solid ${f.color === "red" ? "rgba(255,26,46,0.25)" : "rgba(0,212,255,0.25)"}`,
                    color: f.color === "red" ? "#ff1a2e" : "#00d4ff"
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold mb-3 text-sm tracking-wide" style={{ fontFamily: "'Orbitron', sans-serif", color: "#e8f4ff" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#5a7a99" }}>{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS TIMELINE ── */}
      <section id="how-it-works" className="px-4 py-24" style={{ background: "rgba(7,13,26,0.5)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            tag="System Architecture"
            title='How It <span style="color:#00d4ff">Works</span>'
            sub="From raw camera feed to ambulance dispatch in under two seconds. The precise sequence that saves lives."
            accentColor="blue"
          />
          <div className="relative">
            {/* Center line */}
            <div
              className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px"
              style={{ background: "linear-gradient(180deg, transparent, #00d4ff66, transparent)", transform: "translateX(-50%)" }}
            />
            <div className="space-y-8">
              {timelineSteps.map((step, i) => (
                <div key={step.step} className={`flex gap-6 items-start ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
                  <GlassCard className={`flex-1 ${i % 2 !== 0 ? "md:ml-auto" : ""}`} style={{ maxWidth: 480 }} delay={i * 0.1}>
                    <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#ff1a2e" }}>Step {step.step}</div>
                    <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#5a7a99" }}>{step.desc}</p>
                  </GlassCard>
                  <div className="hidden md:flex flex-1 items-center justify-center">
                    <motion.div
                      className="w-3 h-3 rounded-full"
                      style={{ background: "#00d4ff", boxShadow: "0 0 15px #00d4ff" }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── AI ENGINE ── */}
      <section id="ai-engine" className="px-4 py-24" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            tag="Powered By"
            title='AI <span style="color:#ff1a2e">Vision</span> Engine'
            accentColor="red"
          />
          <motion.div
            className="rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.04), rgba(255,26,46,0.04))",
              border: "1px solid rgba(0,212,255,0.2)"
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Radial glow top */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08), transparent 70%)" }} />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Cpu size={36} style={{ color: "#00d4ff" }} />
                <div className="text-left">
                  <div className="font-black text-xl" style={{ fontFamily: "'Orbitron', sans-serif", color: "#00d4ff" }}>RG-VisionCore v4.2</div>
                  <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "#5a7a99" }}>Proprietary Emergency Detection Model</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mx-auto mb-8" style={{ color: "#5a7a99", maxWidth: 560 }}>
                Trained on 847 million accident frames across 23 countries. Fine-tuned for night vision, rain, fog, and high-speed impact scenarios.
                Continuously updated via federated learning from deployed nodes.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {aiMetrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    className="rounded-xl p-4"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,212,255,0.1)" }}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ borderColor: "rgba(0,212,255,0.35)", background: "rgba(0,212,255,0.06)" }}
                  >
                    <div className="font-black text-xl mb-1" style={{ fontFamily: "'Orbitron', sans-serif", color: "#00d4ff" }}>{m.val}</div>
                    <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#5a7a99" }}>{m.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="responders" className="px-4 py-24" style={{ background: "rgba(7,13,26,0.6)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            tag="Field Reports"
            title='From <span style="color:#ff1a2e">First</span> Responders'
            sub="The people who matter most have spoken. Here's what emergency professionals say after deploying RoadGuardian AI."
            accentColor="red"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <GlassCard key={t.name} delay={i * 0.1} hoverGlow="red">
                <div className="text-5xl font-serif mb-3 leading-none" style={{ color: "#ff1a2e", opacity: 0.3 }}>"</div>
                <p className="text-sm leading-relaxed italic mb-5" style={{ color: "#c8dff0" }}>{t.text}</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: `${t.color}18`, border: `1px solid ${t.color}40`, color: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: "#e8f4ff" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "#5a7a99" }}>{t.role}</div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-24" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            className="rounded-3xl p-16 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(255,26,46,0.07), rgba(0,212,255,0.04))",
              border: "1px solid rgba(255,26,46,0.3)"
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(255,26,46,0.1), transparent 70%)" }} />
            <div className="relative z-10">
              <h2 className="font-black mb-4" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(1.8rem, 4vw, 3rem)" }}>
                Ready to <span style={{ color: "#ff1a2e" }}>Deploy?</span>
              </h2>
              <p className="text-base leading-relaxed mx-auto mb-10" style={{ color: "#5a7a99", maxWidth: 520 }}>
                Join 47 cities already running RoadGuardian AI. Implementation takes under 72 hours.
                Your roads go live, response times drop, and lives are saved.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to={user ? "/dashboard" : "/login"}
                  className="inline-flex items-center justify-center gap-2 font-bold rounded-xl px-10 py-4 text-white transition-all duration-300"
                  style={{
                    background: "#ff1a2e",
                    boxShadow: "0 0 30px rgba(255,26,46,0.4)",
                    fontSize: "1rem", letterSpacing: ".03em"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(255,26,46,0.55)" }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 30px rgba(255,26,46,0.4)" }}
                >
                  <Zap size={18} /> Request a Demo
                </Link>
                <button
                  className="inline-flex items-center justify-center gap-2 font-bold rounded-xl px-10 py-4 transition-all duration-300"
                  style={{
                    border: "1px solid #00d4ff", color: "#00d4ff", background: "transparent",
                    boxShadow: "0 0 15px rgba(0,212,255,0.2)", fontSize: "1rem"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.background = "rgba(0,212,255,0.08)" }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "transparent" }}
                >
                  <ArrowRight size={18} /> Read the Whitepaper
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(0,212,255,0.08)", background: "rgba(3,5,16,0.8)", backdropFilter: "blur(10px)", position: "relative", zIndex: 1, padding: "3rem 1rem" }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div>
            <div className="flex items-center gap-2 mb-3 font-black text-base" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <polygon points="16,2 30,28 2,28" stroke="#ff1a2e" strokeWidth="2" fill="none" />
                <circle cx="16" cy="18" r="5" stroke="#00d4ff" strokeWidth="1.5" fill="none" />
              </svg>
              RoadGuardian AI
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#5a7a99", maxWidth: 200 }}>
              Next-generation emergency response intelligence. Protecting lives on every road, every second.
            </p>
          </div>
          {footerLinks.map(col => (
            <div key={col.title}>
              <div className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#00d4ff" }}>{col.title}</div>
              {col.links.map(l => (
                <a
                  key={l}
                  href="#"
                  className="block text-xs mb-2.5 transition-colors duration-200"
                  style={{ color: "#5a7a99" }}
                  onMouseEnter={e => e.target.style.color = "#e8f4ff"}
                  onMouseLeave={e => e.target.style.color = "#5a7a99"}
                >
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mt-10 pt-6"
          style={{ maxWidth: 1100, margin: "2rem auto 0", borderTop: "1px solid rgba(0,212,255,0.07)" }}
        >
          <p className="text-xs" style={{ color: "#3a5a79" }}>© 2026 RoadGuardian Intelligence Corp. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#22c55e" }}>
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-green-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            All systems operational · 99.97% uptime
          </div>
        </div>
      </footer>
    </div>
  )
}