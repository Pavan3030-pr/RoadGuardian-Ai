import { useState, useEffect } from "react"
import {
  Users,
  AlertTriangle,
  BarChart3,
  Settings,
  FileText,
  Activity,
  Download,
  Search,
  Filter,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import Card from "../components/Card"
import Badge from "../components/Badge"
import LoadingSpinner from "../components/LoadingSpinner"
import { fetchActiveAccidents, fetchAnalytics } from "../services/api"

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [accidents, setAccidents] = useState([])
  const [activeTab, setActiveTab] = useState("overview") // overview, users, accidents, logs

  const loadData = async () => {
    setLoading(true)
    try {
      const [analyticsData, accidentList] = await Promise.all([
        fetchAnalytics(),
        fetchActiveAccidents()
      ])
      setStats(analyticsData)
      setAccidents(accidentList)
    } catch (err) {
      console.error("Failed to load admin data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [])

  // Mock data for charts
  const trendData = [
    { name: 'Mon', count: 4 },
    { name: 'Tue', count: 7 },
    { name: 'Wed', count: 5 },
    { name: 'Thu', count: 12 },
    { name: 'Fri', count: 9 },
    { name: 'Sat', count: 15 },
    { name: 'Sun', count: 11 },
  ]

  const pieData = [
    { name: 'Critical', value: 35, color: '#ef4444' },
    { name: 'High', value: 25, color: '#f97316' },
    { name: 'Moderate', value: 25, color: '#f59e0b' },
    { name: 'Low', value: 15, color: '#3b82f6' },
  ]

  if (loading) return <LoadingSpinner fullScreen message="Loading Administrative Console..." />

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950/50 hidden md:block">
        <div className="p-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Management</p>
          <nav className="space-y-2">
            {[
              { id: "overview", label: "Analytics", icon: <BarChart3 size={18} /> },
              { id: "accidents", label: "Incidents", icon: <AlertTriangle size={18} /> },
              { id: "users", label: "User Control", icon: <Users size={18} /> },
              { id: "logs", label: "System Logs", icon: <FileText size={18} /> },
              { id: "settings", label: "Configuration", icon: <Settings size={18} /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id
                    ? "bg-red-500/10 text-red-500 border border-red-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <header className="flex justify-between items-end mb-8">
          <div>
             <h1 className="text-3xl font-black text-white capitalize">{activeTab} Interface</h1>
             <p className="text-slate-500 mt-1">System-wide monitoring and administrative controls.</p>
          </div>
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700">
             <Download size={14} /> Export Dataset
          </button>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[
                 { label: "Total Cases", value: stats?.totalAccidents || 0, icon: <Activity />, color: "text-blue-400" },
                 { label: "Active Users", value: stats?.totalUsers || 0, icon: <Users />, color: "text-emerald-400" },
                 { label: "Critical Priority", value: stats?.criticalCases || 0, icon: <AlertTriangle />, color: "text-red-400" },
                 { label: "Avg Response", value: "4.2m", icon: <Activity />, color: "text-amber-400" },
               ].map((stat, i) => (
                 <Card key={i} className="!p-5">
                   <div className="flex items-center gap-4">
                     <div className={`${stat.color} bg-slate-950 p-3 rounded-xl`}>{stat.icon}</div>
                     <div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</p>
                       <p className="text-xl font-black text-white">{stat.value}</p>
                     </div>
                   </div>
                 </Card>
               ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card title="Incident Volume Trend" subtitle="Daily Reported Accidents">
                <div className="h-80 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#ef4444' }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Severity Distribution" subtitle="Classification Breakdown">
                 <div className="h-80 w-full mt-4 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                       {pieData.map(item => (
                         <div key={item.name} className="flex items-center gap-2 text-xs font-bold text-slate-400">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                           {item.name}: {item.value}%
                         </div>
                       ))}
                    </div>
                 </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "accidents" && (
          <Card>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
               <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input
                  type="text"
                  placeholder="Filter by location, reporter, or unit..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-red-500"
                 />
               </div>
               <button className="flex items-center gap-2 bg-slate-900 px-4 py-3 rounded-xl text-sm font-bold text-slate-300 border border-slate-800">
                 <Filter size={16} /> Filters
               </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="px-4 py-4">Incident ID</th>
                    <th className="px-4 py-4">Location</th>
                    <th className="px-4 py-4">Severity</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Reported At</th>
                    <th className="px-4 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {accidents.map((accident) => (
                    <tr key={accident.id} className="hover:bg-slate-900/30 transition-colors group">
                      <td className="px-4 py-4 text-sm font-bold text-white">#{accident.id}</td>
                      <td className="px-4 py-4 text-sm text-slate-400">{accident.locationName}</td>
                      <td className="px-4 py-4">
                        <Badge variant={accident.severity === 'CRITICAL' ? 'danger' : 'warning'}>{accident.severity}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md">{accident.status}</span>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(accident.createdAt))}
                      </td>
                      <td className="px-4 py-4">
                        <button className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "users" && (
           <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "John Medic", role: "AMBULANCE", email: "medic1@agency.gov", status: "Active" },
                { name: "Officer Sarah", role: "POLICE", email: "sarah.p@city.gov", status: "Active" },
                { name: "Dr. Arvin", role: "HOSPITAL", email: "arvin@trauma.center", status: "Active" },
                { name: "Mike Reporter", role: "USER", email: "mike88@gmail.com", status: "Active" },
              ].map((user, i) => (
                <Card key={i} className="group hover:border-slate-700 transition-all">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-red-400 transition-colors">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{user.role}</p>
                      </div>
                   </div>
                   <div className="space-y-1 mb-6">
                      <p className="text-xs text-slate-500 flex items-center gap-2"><Activity size={10} /> {user.email}</p>
                      <p className="text-xs text-emerald-500 flex items-center gap-2"><UserCheck size={10} /> Verification: Verified</p>
                   </div>
                   <div className="flex gap-2">
                      <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-[10px] font-bold border border-slate-800 transition-all">EDIT PROFILE</button>
                      <button className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><UserX size={14} /></button>
                   </div>
                </Card>
              ))}
           </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
