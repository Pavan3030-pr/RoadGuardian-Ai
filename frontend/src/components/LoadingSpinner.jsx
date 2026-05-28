import { motion } from "framer-motion"

const LoadingSpinner = ({ fullScreen = false, message = "Loading..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative h-16 w-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-slate-800"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent"
        />
      </div>
      {message && <p className="text-slate-400 font-medium animate-pulse">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center">
        {content}
      </div>
    )
  }

  return <div className="py-12 flex justify-center w-full">{content}</div>
}

export default LoadingSpinner
