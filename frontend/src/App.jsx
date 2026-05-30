import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import PrivateRoute from "./components/PrivateRoute"
import { AuthProvider } from "./context/AuthContext"
import LoadingSpinner from "./components/LoadingSpinner"

const LandingPage = lazy(() => import("./pages/LandingPage"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const AccidentDetails = lazy(() => import("./pages/AccidentDetails"))
const AIVision = lazy(() => import("./pages/AIVision"))
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const Reports = lazy(() => import("./pages/Reports"))

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-red-500/30">
          <Navbar />
          <main className="pt-16">
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/accident" element={<AccidentDetails />} />
                <Route path="/vision" element={<PrivateRoute><AIVision /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
