import { useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertCircle, X, Info } from "lucide-react"

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle className="text-emerald-400" size={20} />,
    error: <AlertCircle className="text-red-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  }

  const bgColors = {
    success: "bg-slate-900 border-emerald-500/50",
    error: "bg-slate-900 border-red-500/50",
    info: "bg-slate-900 border-blue-500/50",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${bgColors[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium text-slate-200">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-slate-300"
      >
        <X size={16} />
      </button>
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-0.5 ${
          type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
        } rounded-full`}
      />
    </motion.div>
  )
}

export default Toast
