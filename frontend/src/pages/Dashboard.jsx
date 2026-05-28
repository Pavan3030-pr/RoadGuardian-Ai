import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity, MapPin, Clock, AlertTriangle, Shield, Truck,
  HeartPulse, Plus, RefreshCcw, Zap, Users,
} from "lucide-react"
import {
  fetchActiveAccidents, fetchAccidentById, createPublicAccident,
  dispatchAmbulance, notifyPolice, notifyHospital,
} from "../services/api"
import Card from "../components/Card"
import Badge from "../components/Badge"
import Toast from "../components/Toast"
import LoadingSpinner from "../components/LoadingSpinner"
import LiveMap from "../components/LiveMap"

const fmt = (v) => v ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v)) : "--"

const SEVERITY_VARIANT = { CRITICAL: "danger", HIGH: "danger", MODERATE: "warning", LOW: "info" }

const Dashboard = () => {
  const [accidents, setAccidents] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [dispatching, setDispatching] = useState({})
  const [wsStatus, setWsStatus] = useState("OFFLINE")

  const pushToast = (message, type = "success") => setToast({ message, type })

  const loadAccidents = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await fetchActiveAccidents()
      const list = Array.isArray(data) ? data : []
      setAccidents(list)
      if (list.length > 0) setSelected(prev => prev ? list.find(a => a.id === prev.id) || list[0] : list[0])
    } catch { pushToast("Unable to load incidents", "error") }
    finally { if (!silent) setLoading(false) }
  }

  useEffect(() => { loadAccidents() }, [])

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL
    if (!wsUrl) return
    const ws = new WebSocket(wsUrl)
    ws.onopen = () => setWsStatus("LIVE")
    ws.onmessage = (e) => {
      setWsStatus("LIVE")
      if (typeof e.data === "string" && e.data.startsWith("NEW_ACCIDENT")) {
        const [,, loc] = e.data.split("|")
        window.dispatchEvent(new CustomEvent("new-incident", { detail: { message: `New accident at ${loc}` } }))
      }
      loadAccidents(true)
    }
    ws.onclose = ws.onerror = () => setWsStatus("OFFLINE")
    return () => ws.close()
  }, [])

  const handleDispatch = async (key, apiCall, msg) => {
    if (!selected?.id) return
    setDispatching(p => ({ ...p, [key]: true }))
    try {
      await apiCall(selected.id)
      const updated = await fetchAccidentById(selected.id)
      setSelected(updated)
      setAccidents(prev => prev.map(a => a.id === updated.id ? updated : a))
      pushToast(msg)
    } catch { pushToast("Action failed", "error") }
    finally { setDispatching(p => ({ ...p, [key]: false })) }
  }

  const createDemo = async () => {
    setGenerating(true)
    try {
      const loc = prompt("Enter accident location (City / Area)")
      if (!loc?.trim()) return pushToast("Location required", "error")
      const geo = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}`)
      const geoData = await geo.json()
      if (!geoData?.length) return pushToast("Location not found", "error")
      const { lat, lon } = geoData[0]
      const severities = ["LOW", "MODERATE", "HIGH", "CRITICAL"]
      const demo = await createPublicAccident({
        title: `Accident at ${loc}`, description: "AI-detected collision. Emergency assistance recommended.",
        latitude: parseFloat(lat), longitude: parseFloat(lon), locationName: loc,
        severity: severities[Math.floor(Math.random() * severities.length)],
        casualties: Math.floor(Math.random() * 5) + 1,
        weatherCondition: "NORMAL", trafficDensity: "HIGH", roadType: "HIGHWAY",
      })
      setSelected(demo)
      setAccidents(prev => [demo, ...prev.filter(a => a.id !== demo.id)])
      pushToast(`Incident created at ${loc}`)
    } catch { pushToast("Demo creation failed", "error") }
    finally { setGenerating(false) }
  }

  if (loading) return <LoadingSpinner fullScreen message="Initializing Command Center..." />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />System Online
            </span>
            <Badge variant={wsStatus === "LIVE" ? "info" : "danger"}>
              {wsStatus === "LIVE" ? "Real-time" : "Sync Offline"}
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Command <span className="text-red-500">Center</span>
          </h1>
          <p className="text-sm text-slate-400">Monitor incidents, coordinate emergency responses, analyze risk.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => loadAccidents()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border border-slate-700 active:scale-95">
            <RefreshCcw size={16} /> Refresh
          </button>
          <button onClick={createDemo} disabled={generating} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 active:scale-95">
            {generating ? <RefreshCcw className="animate-spin" size={16} /> : <Plus size={16} />}
            Add Demo
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Active Incidents", value: accidents.length, icon: <AlertTriangle size={18} />, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Resolved Today", value: "12", icon: <Shield size={18} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Dispatched Units", value: "08", icon: <Truck size={18} />, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Avg Response", value: "4.2m", icon: <Clock size={18} />, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}>{s.icon}</div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-5">
        {/* Left - Map + Details */}
        <div className="lg:col-span-8 space-y-5">
          {/* Live Map */}
          <Card title="Live Incident Map" subtitle="Real-time Geospatial Tracking" icon={<MapPin size={18} />}>
            <div className="rounded-2xl border border-slate-800 -mx-1" style={{ height: "320px" }}>
              <LiveMap accidents={accidents} selectedAccident={selected} onSelectAccident={setSelected} />
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-wrap">
              {[["CRITICAL","bg-red-500"],["HIGH","bg-orange-500"],["MODERATE","bg-amber-500"],["LOW","bg-blue-500"]].map(([sev, bg]) => (
                <span key={sev} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${bg}`} />{sev}
                </span>
              ))}
              <span className="flex items-center gap-1.5 ml-auto">
                <span className="h-2 w-2 rounded-full bg-blue-400" />Your Location
              </span>
            </div>
          </Card>

          {/* Incident Details + Timeline */}
          <div className="grid md:grid-cols-2 gap-5">
            <Card title={selected?.locationName || "No Incident Selected"} subtitle="Incident Overview" icon={<Activity size={18} />}>
              {selected ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Severity</p>
                      <Badge variant={SEVERITY_VARIANT[selected.severity] || "default"}>{selected.severity}</Badge>
                    </div>
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Casualties</p>
                      <div className="flex items-center gap-1.5 text-white font-bold">
                        <Users size={14} className="text-slate-400" /> {selected.casualties || 0}
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                    <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-4">
                      "{selected.description || "No AI analysis available for this sector."}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={12} />{fmt(selected.createdAt)}</span>
                    <button onClick={() => pushToast("Re-running AI diagnostics...", "info")}
                      className="text-red-500 hover:text-red-400 font-bold flex items-center gap-1 transition-colors">
                      <Zap size={12} /> Re-analyze
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-slate-500">
                  <Shield className="mx-auto mb-3 text-slate-800" size={40} />
                  <p className="text-sm">Select an incident from the map or feed</p>
                </div>
              )}
            </Card>

            <Card title="Response Timeline" subtitle="Lifecycle Events" icon={<Clock size={18} />}>
              <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-red-500/30" />
                  <p className="text-sm font-semibold text-white">Incident Detected</p>
                  <p className="text-xs text-slate-500">{fmt(selected?.createdAt)}</p>
                </div>
                <AnimatePresence>
                  {selected?.ambulanceAssigned && (
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="relative pl-6">
                      <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full bg-red-400" />
                      <p className="text-sm font-semibold text-white">Medical Unit Dispatched</p>
                      <p className="text-xs text-slate-500">En-route to scene</p>
                    </motion.div>
                  )}
                  {selected?.policeAssigned && (
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="relative pl-6">
                      <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full bg-slate-400" />
                      <p className="text-sm font-semibold text-white">Police Notified</p>
                      <p className="text-xs text-slate-500">Dispatch confirmed</p>
                    </motion.div>
                  )}
                  {selected?.hospitalAssigned && (
                    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="relative pl-6">
                      <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full bg-emerald-500" />
                      <p className="text-sm font-semibold text-white">Hospital Alerted</p>
                      <p className="text-xs text-slate-500">Trauma center on standby</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!selected?.ambulanceAssigned && !selected?.policeAssigned && (
                  <div className="pl-6 py-1">
                    <p className="text-xs text-slate-600 animate-pulse">Awaiting operator actions...</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right - Controls + Feed */}
        <div className="lg:col-span-4 space-y-5">
          <Card title="Dispatch Controls" subtitle="Response Protocol" icon={<Shield size={18} />}>
            <div className="space-y-2.5">
              {[
                { key: "ambulance", fn: dispatchAmbulance, msg: "Ambulance dispatched", icon: <HeartPulse size={18} />, label: "Dispatch Ambulance", cls: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20" },
                { key: "police", fn: notifyPolice, msg: "Police notified", icon: <Shield size={18} />, label: "Notify Police", cls: "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" },
                { key: "hospital", fn: notifyHospital, msg: "Hospital alerted", icon: <Truck size={18} />, label: "Alert Hospital", cls: "bg-emerald-500 hover:bg-emerald-600 text-black" },
              ].map(({ key, fn, msg, icon, label, cls }) => (
                <button key={key} onClick={() => handleDispatch(key, fn, msg)}
                  disabled={dispatching[key] || !selected}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40 ${cls}`}>
                  <span className="flex items-center gap-2.5">{icon}{label}</span>
                  {dispatching[key] && <RefreshCcw className="animate-spin" size={14} />}
                </button>
              ))}
            </div>
          </Card>

          <Card title="Incident Feed" subtitle="Active Monitoring" icon={<Activity size={18} />}>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
              {accidents.length > 0 ? accidents.map((acc, i) => (
                <motion.button
                  key={acc.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelected(acc)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all relative overflow-hidden ${
                    selected?.id === acc.id
                      ? "bg-red-500/10 border-red-500/40 shadow-sm shadow-red-500/10"
                      : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                  }`}>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">#{acc.id} · {acc.severity}</span>
                    <Badge variant={SEVERITY_VARIANT[acc.severity] || "default"}>{acc.status}</Badge>
                  </div>
                  <p className="font-semibold text-white text-sm truncate">{acc.locationName}</p>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={9} /> {fmt(acc.createdAt)}
                  </p>
                  {selected?.id === acc.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500" />
                  )}
                </motion.button>
              )) : (
                <div className="py-10 text-center">
                  <Shield className="mx-auto text-slate-800 mb-3" size={40} />
                  <p className="text-slate-500 text-sm">No active incidents</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  )
}

export default Dashboard
