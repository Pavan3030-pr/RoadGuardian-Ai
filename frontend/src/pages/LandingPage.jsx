import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Shield, Zap, Activity, Globe, ArrowRight, ChevronRight, Play } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const LandingPage = () => {
  const { user } = useAuth()
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-52 flex flex-col items-center">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-red-400 mb-8 tracking-wider uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Next-Gen Emergency Response
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[1.1] mb-8"
          >
            Securing Roads with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
              Autonomous Intelligence
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            RoadGuardian AI identifies accidents in milliseconds, coordinating emergency units
            and hospital trauma centers through a unified real-time intelligence network.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-500/20"
            >
              {user ? "Launch Dashboard" : "Get Started"} <ChevronRight size={20} />
            </Link>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-slate-800">
              <Play size={18} fill="currentColor" /> Watch System Demo
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "AI Accuracy", value: "98.4%", icon: <Zap className="text-amber-400" /> },
              { label: "Avg. Response Time", value: "2.4s", icon: <Activity className="text-red-400" /> },
              { label: "Global Monitoring", value: "24/7", icon: <Globe className="text-blue-400" /> },
            ].map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={stat.label}
                className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm group hover:border-red-500/30 transition-colors"
              >
                <div className="bg-slate-950 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-slate-500 font-medium uppercase tracking-wider text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-8"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                Empowering First Responders with <br />
                <span className="text-red-500">Actionable Insights</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Our proprietary AI models analyze live traffic feeds, satellite data, and IoT sensors to
                predict risk and confirm incidents with unprecedented speed.
              </p>

              <ul className="space-y-6">
                {[
                  "Real-time accident pattern recognition",
                  "Automated emergency resource allocation",
                  "Secure WebSocket communication protocol",
                  "Direct integration with trauma center systems"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-4 text-white font-medium">
                    <div className="bg-emerald-500/20 p-1 rounded-full">
                      <Shield className="text-emerald-500" size={16} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link to="/dashboard" className="text-red-500 font-bold flex items-center gap-2 hover:gap-4 transition-all group">
                  Explore full capabilities <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 relative"
            >
              <div className="relative z-10 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 p-2">
                 <div className="bg-slate-950 rounded-2xl h-96 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 rounded-full scale-150 animate-pulse" />
                      <Shield className="text-red-500 relative" size={120} />
                    </div>
                 </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-red-600 to-red-800 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-red-900/40"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to deploy?</h2>
              <p className="text-red-100 text-lg md:text-xl max-w-2xl mx-auto mb-12">
                Join the network of cities leveraging RoadGuardian AI to save lives and
                optimize emergency infrastructure.
              </p>
              <Link
                to="/dashboard"
                className="bg-white text-red-600 hover:bg-slate-100 px-10 py-5 rounded-2xl font-bold transition-all shadow-xl inline-flex items-center gap-3"
              >
                Get Started Now <ArrowRight size={20} />
              </Link>
            </div>

            {/* Background elements */}
            <Shield className="absolute top-1/2 left-10 -translate-y-1/2 text-white/5" size={300} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="text-red-500" size={24} />
            <span className="font-bold text-white text-lg">RoadGuardian AI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 RoadGuardian Intelligence. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
