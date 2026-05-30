import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Search, RefreshCcw, AlertTriangle,
  Clock, CheckCircle, Calendar, Filter, X,
  MapPin, Activity, Shield, Hash, Users
} from "lucide-react"
import api from "../services/api"
import Card from "../components/Card"
import Badge from "../components/Badge"
import LoadingSpinner from "../components/LoadingSpinner"
import Toast from "../components/Toast"

const SEVERITY_VARIANT = { CRITICAL: "danger", HIGH: "danger", MODERATE: "warning", LOW: "info" }
const STATUS_VARIANT = {
  RESOLVED: "success", CANCELLED: "default",
  REPORTED: "danger", ACKNOWLEDGED: "warning",
  IN_PROGRESS: "warning", DISPATCHED: "info", ESCALATED: "danger",
  ACCIDENT_DETECTED: "danger", AI_VERIFIED: "info",
  AMBULANCE_ASSIGNED: "warning", POLICE_ASSIGNED: "warning",
  HOSPITAL_ALERTED: "info", AMBULANCE_ARRIVED: "success",
  PATIENT_PICKED: "success", REACHED_HOSPITAL: "success",
  CASE_CLOSED: "success"
}

const fmt = (v) =>
  v ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v)) : "--"

const DATE_FILTERS = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7days" },
  { label: "30 Days", value: "30days" },
]

const STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Critical", value: "critical" },
  { label: "Resolved", value: "resolved" },
]

const PAGE_SIZE = 20

const Reports = () => {
  const [incidents, setIncidents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchReports = useCallback(async (pageNum = 0) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get("/accidents", {
        params: { pageNumber: pageNum, pageSize: PAGE_SIZE, sortBy: "createdAt", sortDirection: "DESC" }
      })
      const payload = res.data.data
      const content = payload.content || []
      setIncidents(content)
      setTotalPages(payload.totalPages || 0)
      setTotalElements(payload.totalElements || 0)
      setPage(pageNum)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports(0)
  }, [fetchReports])

  useEffect(() => {
    let result = [...incidents]

    if (dateFilter !== "all") {
      const now = new Date()
      const cutoff = new Date()
      if (dateFilter === "today") cutoff.setHours(0, 0, 0, 0)
      else if (dateFilter === "7days") cutoff.setDate(now.getDate() - 7)
      else if (dateFilter === "30days") cutoff.setDate(now.getDate() - 30)
      result = result.filter(i => new Date(i.createdAt) >= cutoff)
    }

    if (statusFilter !== "all") {
      if (statusFilter === "critical") {
        result = result.filter(i => i.severity === "CRITICAL" || i.severity === "HIGH")
      } else if (statusFilter === "resolved") {
        result = result.filter(i => i.status === "RESOLVED" || i.status === "CASE_CLOSED")
      } else if (statusFilter === "pending") {
        result = result.filter(i => !["RESOLVED", "CASE_CLOSED", "CANCELLED"].includes(i.status))
      }
    }

    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(i =>
        String(i.id).includes(q) ||
        (i.locationName || "").toLowerCase().includes(q) ||
        (i.title || "").toLowerCase().includes(q)
      )
    }

    setFiltered(result)
  }, [incidents, dateFilter, statusFilter, search])

  const clearFilters = () => {
    setSearch("")
    setDateFilter("all")
    setStatusFilter("all")
  }

  const hasActiveFilters = search || dateFilter !== "all" || statusFilter !== "all"

  const stats = {
    total: totalElements,
    critical: incidents.filter(i => i.severity === "CRITICAL").length,
    resolved: incidents.filter(i => i.status === "RESOLVED" || i.status === "CASE_CLOSED").length,
    pending: incidents.filter(i => !["RESOLVED", "CASE_CLOSED", "CANCELLED"].includes(i.status)).length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-red-500/10 p-2 rounded-xl">
              <FileText className="text-red-500" size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Incident Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Reports <span className="text-red-500">Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Browse, filter and analyze all reported incidents.</p>
        </div>
        <button
          onClick={() => fetchReports(page)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border border-slate-700 active:scale-95 shrink-0"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Reports", value: stats.total, icon: <FileText size={18} />, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Critical Cases", value: stats.critical, icon: <AlertTriangle size={18} />, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Resolved", value: stats.resolved, icon: <CheckCircle size={18} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Pending Action", value: stats.pending, icon: <Clock size={18} />, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}>{s.icon}</div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Report ID or Location..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-red-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2 flex-wrap">
            {DATE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setDateFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  dateFilter === f.value
                    ? "bg-red-500/10 border-red-500/40 text-red-400"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <Calendar size={12} />
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  statusFilter === f.value
                    ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <Filter size={12} />
                {f.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-all bg-slate-900 shrink-0"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
            <Activity size={12} />
            Showing {filtered.length} of {incidents.length} loaded records
          </div>
        )}
      </Card>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner message="Loading incident reports..." />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-3xl p-12 text-center"
          >
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
            <p className="text-red-400 font-bold mb-2">Failed to Load Reports</p>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <button
              onClick={() => fetchReports(0)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
            >
              Retry
            </button>
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              {filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <Shield className="mx-auto text-slate-800 mb-4" size={48} />
                  <p className="text-slate-400 font-bold mb-1">No Reports Found</p>
                  <p className="text-slate-600 text-sm">
                    {hasActiveFilters ? "Try adjusting your filters." : "No incidents have been reported yet."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          <th className="px-4 py-4">
                            <span className="flex items-center gap-1.5"><Hash size={10} /> ID</span>
                          </th>
                          <th className="px-4 py-4">Location</th>
                          <th className="px-4 py-4">Title</th>
                          <th className="px-4 py-4">Severity</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-4 py-4">Casualties</th>
                          <th className="px-4 py-4">Reported At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {filtered.map((incident, i) => (
                          <motion.tr
                            key={incident.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.02, 0.3) }}
                            className="hover:bg-slate-900/40 transition-colors group"
                          >
                            <td className="px-4 py-4">
                              <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                                #{incident.id}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-slate-300">
                                <MapPin size={12} className="text-slate-500 shrink-0" />
                                <span className="truncate max-w-[160px]">{incident.locationName || "—"}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm text-white font-medium truncate max-w-[200px] group-hover:text-red-400 transition-colors">
                                {incident.title || "—"}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <Badge variant={SEVERITY_VARIANT[incident.severity] || "default"}>
                                {incident.severity}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <Badge variant={STATUS_VARIANT[incident.status] || "default"}>
                                {incident.status?.replace(/_/g, " ")}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`text-sm font-bold ${incident.casualties > 0 ? "text-red-400" : "text-slate-500"}`}>
                                {incident.casualties ?? 0}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                              {fmt(incident.createdAt)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-5 border-t border-slate-800 mt-2">
                      <p className="text-xs text-slate-500 font-medium">
                        Page {page + 1} of {totalPages} · {totalElements} total reports
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchReports(page - 1)}
                          disabled={page === 0}
                          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => fetchReports(page + 1)}
                          disabled={page >= totalPages - 1}
                          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default Reports
