import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, AlertCircle, Camera, Upload, Send, Info, CheckCircle } from "lucide-react"
import { createPublicAccident } from "../services/api"
import Card from "../components/Card"
import Toast from "../components/Toast"
import LoadingSpinner from "../components/LoadingSpinner"

const AccidentDetails = () => {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    locationName: "",
    severity: "MODERATE",
    description: "",
    casualties: 0,
    latitude: 0,
    longitude: 0
  })

  const pushToast = (message, type = "success") => {
    setToast({ message, type })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const fetchCoordinates = async () => {
    if (!formData.locationName.trim()) {
      pushToast("Please enter a location first", "error")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.locationName)}`
      )
      const data = await response.json()
      if (data?.length) {
        const { lat, lon } = data[0]
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }))
        pushToast("Coordinates verified successfully")
      } else {
        pushToast("Location not found. Please be more specific.", "error")
      }
    } catch {
      pushToast("Error verifying location", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.latitude || !formData.longitude) {
      pushToast("Please verify the location coordinates first", "error")
      return
    }

    setLoading(true)
    try {
      await createPublicAccident({
        ...formData,
        title: `Public Report: ${formData.locationName}`,
        weatherCondition: "UNKNOWN",
        trafficDensity: "UNKNOWN",
        roadType: "UNKNOWN",
        imageUrl: "",
        videoUrl: ""
      })
      setSubmitted(true)
      pushToast("Emergency report submitted successfully")
    } catch {
      pushToast("Failed to submit report. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl"
        >
          <div className="bg-emerald-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="text-emerald-500" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Report Received</h1>
          <p className="text-slate-400 text-lg mb-8">
            Your emergency report has been logged and transmitted to the nearest first responders.
            AI analysis is currently prioritizing the dispatch.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold transition-all"
          >
            Submit Another Report
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 mb-4 uppercase tracking-widest">
          Emergency Reporting
        </div>
        <h1 className="text-4xl font-black text-white mb-4">Report an Incident</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Immediate reporting saves lives. Provide as much detail as possible to help our AI
          coordinate the fastest possible emergency response.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Exact Location</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      name="locationName"
                      value={formData.locationName}
                      onChange={handleInputChange}
                      required
                      placeholder="Street name, landmark, or city..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchCoordinates}
                    className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-2xl font-bold transition-all border border-slate-700"
                  >
                    Verify
                  </button>
                </div>
                {formData.latitude !== 0 && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                    <CheckCircle size={12} /> Location verified: {formData.latitude}, {formData.longitude}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Severity</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white outline-none focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Estimated Casualties</label>
                  <input
                    type="number"
                    name="casualties"
                    value={formData.casualties}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Situation Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us what happened. Be as descriptive as possible..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-4 text-white outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-5 rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-red-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  {loading ? <LoadingSpinner message="" /> : <><Send size={24} /> Submit Emergency Report</>}
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Quick Guidelines" icon={<Info size={18} />}>
            <ul className="space-y-4">
              {[
                "Stay calm and provide clear info",
                "Mention number of vehicles involved",
                "Highlight if fire or gas leak is present",
                "Do not put yourself in danger"
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-400">
                  <div className="mt-1 min-w-[4px] h-1 w-1 rounded-full bg-red-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Media Attachments" icon={<Camera size={18} />}>
            <div className="border-2 border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-slate-700 transition-colors cursor-pointer">
              <Upload className="text-slate-600" size={32} />
              <p className="text-xs text-slate-500 text-center font-medium uppercase tracking-wider">
                Click to upload <br /> photo or video
              </p>
            </div>
          </Card>

          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
            <div className="flex gap-4">
              <AlertCircle className="text-amber-500 shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-amber-500 uppercase mb-1">False Reports</p>
                <p className="text-xs text-amber-500/80 leading-relaxed">
                  Submitting false emergency reports is a punishable offense. IP addresses are logged.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AccidentDetails
