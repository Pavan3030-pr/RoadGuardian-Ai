import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, Upload, Zap, Shield, RefreshCcw, CheckCircle, Square, Info, Activity } from "lucide-react"
import api from "../services/api"
import Card from "../components/Card"
import Badge from "../components/Badge"
import Toast from "../components/Toast"
import LoadingSpinner from "../components/LoadingSpinner"

const ANALYSIS_LABELS = {
  ambulanceNeeded: "Ambulance",
  hospitalRequired: "Hospital",
  policeAlertLevel: "Police",
  roadblockRequired: "Roadblock",
}

const AIVision = () => {
  const [mode, setMode] = useState("upload")
  const [preview, setPreview] = useState(null)
  const [fileRef, setFileRef] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [toast, setToast] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const pushToast = (message, type = "success") => setToast({ message, type })

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      videoRef.current.srcObject = stream
      streamRef.current = stream
      setStreaming(true)
    } catch { pushToast("Camera access denied", "error") }
  }

  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }

  useEffect(() => () => stopWebcam(), [])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileRef(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
    setResult(null)
  }

  const analyze = async (captureDataUrl = null) => {
    setAnalyzing(true)
    setResult(null)
    try {
      const formData = new FormData()
      if (captureDataUrl) {
        const blob = await (await fetch(captureDataUrl)).blob()
        formData.append("file", blob, "capture.jpg")
      } else if (fileRef) {
        formData.append("file", fileRef)
      } else return

      const { data } = await api.post("/ai/analyze-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      const r = data.data
      setResult(r)
      setHistory(prev => [r, ...prev].slice(0, 5))
      pushToast("Analysis complete")
    } catch { pushToast("AI analysis failed", "error") }
    finally { setAnalyzing(false) }
  }

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext("2d")
    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    ctx.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvasRef.current.toDataURL("image/jpeg")
    setPreview(dataUrl)
    analyze(dataUrl)
  }

  const switchMode = (m) => {
    if (m === mode) return
    if (m === "upload") stopWebcam()
    else startWebcam()
    setMode(m)
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 mb-3 uppercase tracking-widest">
            <Zap size={10} /> AI Vision Engine
          </span>
          <h1 className="text-3xl font-black text-white">Neural <span className="text-red-500">Accident Detection</span></h1>
          <p className="text-slate-400 mt-2 max-w-xl text-sm">Upload images or connect live feeds for real-time collision detection and risk classification.</p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
          {[["upload", "File Upload"], ["webcam", "Live Camera"]].map(([m, label]) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${mode === m ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-slate-400 hover:text-white"}`}>
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="!p-0 overflow-hidden">
            <div className="bg-slate-950 min-h-[400px] flex items-center justify-center relative border-b border-slate-800">
              {mode === "upload" ? (
                preview ? (
                  <img src={preview} alt="Preview" className="max-h-[500px] w-full object-contain" />
                ) : (
                  <label className="flex flex-col items-center gap-4 cursor-pointer text-slate-600 group">
                    <Upload size={56} className="opacity-20 group-hover:opacity-30 transition-opacity" />
                    <p className="font-bold uppercase tracking-widest text-sm">Drop Image Here</p>
                    <span className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-6 py-2.5 rounded-xl text-sm font-semibold border border-slate-800 transition-all">
                      Browse Files
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                  </label>
                )
              ) : (
                <div className="w-full h-full relative bg-black flex items-center justify-center min-h-[400px]">
                  <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${streaming ? "opacity-100" : "opacity-0"}`} />
                  {!streaming && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-600">
                      <Camera size={56} className="animate-pulse" />
                      <button onClick={startWebcam} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Enable Camera</button>
                    </div>
                  )}
                  {streaming && (
                    <div className="absolute top-4 left-4">
                      <Badge variant="danger">● LIVE</Badge>
                    </div>
                  )}
                </div>
              )}
              <AnimatePresence>
                {analyzing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-10">
                    <LoadingSpinner message="Scanning Neural Patterns..." />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="p-5 bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {mode === "upload" && preview && (
                  <button onClick={() => { setPreview(null); setFileRef(null); setResult(null) }}
                    className="p-2.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all">
                    <RefreshCcw size={16} />
                  </button>
                )}
                {mode === "webcam" && streaming && (
                  <button onClick={stopWebcam} className="p-2.5 bg-slate-900 text-red-400 hover:bg-red-500/10 rounded-xl border border-slate-800 transition-all">
                    <Square size={16} />
                  </button>
                )}
              </div>
              <div>
                {mode === "webcam" && streaming && (
                  <button onClick={captureFrame} className="bg-white text-black px-7 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                    <Camera size={16} /> Capture & Analyze
                  </button>
                )}
                {mode === "upload" && preview && (
                  <button onClick={() => analyze()} disabled={analyzing}
                    className="bg-red-500 hover:bg-red-600 text-white px-7 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50">
                    <Zap size={16} /> Run Analysis
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          <Card title="AI Diagnostics" icon={<Shield size={18} />}>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Confidence Score</p>
                      <p className="text-3xl font-black text-white">{result.confidenceScore}<span className="text-lg text-slate-500">%</span></p>
                    </div>
                    <div className="ml-auto">
                      <Badge variant={result.severity === "CRITICAL" ? "danger" : result.severity === "HIGH" ? "danger" : "warning"}>
                        {result.severity || "MODERATE"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info">{result.weatherCondition}</Badge>
                    <Badge variant="warning">{result.trafficDensity} TRAFFIC</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol</p>
                    {Object.entries(ANALYSIS_LABELS).map(([key, label]) => result[key] && (
                      <div key={key} className="flex items-center gap-2.5 p-2.5 bg-slate-950/50 rounded-xl text-sm border border-slate-800/50">
                        <CheckCircle className="text-emerald-500 shrink-0" size={14} />
                        <span className="text-slate-300 text-xs">{label}: {result[key].replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/accident" className="block w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm transition-all border border-slate-700 text-center">
                    Open Incident Report
                  </Link>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-16 text-center space-y-3">
                  <div className="bg-slate-950 w-14 h-14 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                    <Zap className="text-slate-800" size={28} />
                  </div>
                  <p className="text-slate-500 text-sm">Upload an image or capture a frame to start analysis.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <Card title="Capabilities" icon={<Info size={16} />}>
            <div className="space-y-3">
              {[
                "Multi-vehicle & single-vehicle collision detection",
                "Environmental & weather condition analysis",
                "Real-time resource recommendation engine",
              ].map((item) => (
                <div key={item} className="flex gap-2.5 text-xs text-slate-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </Card>

          {history.length > 0 && (
            <Card title="Recent Analyses" icon={<Activity size={16} />}>
              <div className="space-y-2">
                {history.map((item, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{item.weatherCondition} · {item.severity || "N/A"}</p>
                      <p className="text-xs text-white font-medium">{item.ambulanceNeeded?.replace(/_/g, " ")}</p>
                    </div>
                    <Badge variant="info">{item.confidenceScore}%</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default AIVision
