import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Shield } from "lucide-react"
import Card from "../components/Card"
import Toast from "../components/Toast"
import LoadingSpinner from "../components/LoadingSpinner"
import { forgotPassword } from "../services/auth"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email.trim())
      setToast({ message: "If an account exists, reset instructions have been sent", type: "success" })
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Password reset request failed", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="!p-8">
          <div className="text-center mb-8">
            <div className="bg-red-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/20">
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400">Enter your account email to start recovery.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner message="" /> : "Send Reset Instructions"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <Link to="/login" className="text-white font-bold hover:text-red-400 transition-colors inline-flex items-center gap-2">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        </Card>
      </motion.div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default ForgotPassword
