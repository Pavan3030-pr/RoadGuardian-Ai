import { motion } from "framer-motion"

const Card = ({ children, title, subtitle, icon, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm ${className}`}
    >
      {(title || icon) && (
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
          <div className="flex items-center gap-3">
            {icon && <div className="text-red-500 bg-red-500/10 p-2 rounded-xl">{icon}</div>}
            <div>
              {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 uppercase tracking-wider">{subtitle}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  )
}

export default Card
