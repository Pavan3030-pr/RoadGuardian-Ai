import { Link, useLocation } from "react-router-dom"
import { Shield, LayoutDashboard, AlertCircle, Home, LogOut, LogIn, Eye, ShieldCheck, FileText } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import NotificationCenter from "./NotificationCenter"

const Navbar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const navItems = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
    { name: "Vision", path: "/vision", icon: <Eye size={18} /> },
    { name: "Admin", path: "/admin", icon: <ShieldCheck size={18} />, private: true, roles: ["ADMIN"] },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} />, private: true },
    { name: "Reports", path: "/reports", icon: <FileText size={18} />, private: true },
    { name: "Incidents", path: "/accident", icon: <AlertCircle size={18} /> },
  ]

  const visibleNavItems = navItems.filter(item => {
    if (item.private && !user) return false
    if (item.roles && !item.roles.includes(user?.role)) return false
    return true
  })

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-red-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300">
              <Shield className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              RoadGuardian AI
            </span>
          </Link>

          <div className="hidden md:block">
            <div className="flex items-center gap-1">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-red-500/10 text-red-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && <NotificationCenter />}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-sm font-bold text-white leading-none">{user.firstName}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
            <a href="tel:112" className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20 active:scale-95">
              Emergency Call
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
