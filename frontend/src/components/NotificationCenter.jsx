import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, BellOff, X, AlertCircle, Info, CheckCircle, Trash2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // Simulate receiving a WebSocket notification
  useEffect(() => {
    if (!user) return

    // In a real app, this would be a listener for your WebSocket client
    const handleNewAccident = (e) => {
       const newNotif = {
         id: Date.now(),
         title: "Emergency Alert",
         message: e.detail.message || "A new accident has been reported.",
         type: "danger",
         time: new Date(),
         read: false
       }
       setNotifications(prev => [newNotif, ...prev])

       // Play alert sound for critical incidents
       const audio = new Audio("/alert.mp3")
       audio.play().catch(() => console.log("Audio play blocked"))
    }

    window.addEventListener("new-incident", handleNewAccident)
    return () => window.removeEventListener("new-incident", handleNewAccident)
  }, [user])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type) => {
    switch (type) {
      case "danger": return <AlertCircle className="text-red-500" size={18} />
      case "success": return <CheckCircle className="text-emerald-500" size={18} />
      default: return <Info className="text-blue-500" size={18} />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 md:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Bell size={16} className="text-red-500" />
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 border-b border-slate-800/50 flex gap-4 transition-colors ${notif.read ? "opacity-60" : "bg-red-500/5"}`}
                    >
                      <div className="mt-1">{getIcon(notif.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white mb-1">{notif.title}</p>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(notif.time)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-slate-600 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <BellOff className="mx-auto text-slate-800 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">No new notifications</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-slate-950/50 text-center">
                  <button
                    onClick={() => setNotifications([])}
                    className="text-[10px] font-bold text-red-500/70 hover:text-red-500 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                  >
                    <Trash2 size={12} /> Clear all history
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationCenter
