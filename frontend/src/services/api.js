import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("roadguardian_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("roadguardian_refresh_token")
        if (!refreshToken) throw new Error("No refresh token")

        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token?refreshToken=${refreshToken}`)
        const { accessToken, refreshToken: newRefreshToken } = response.data.data

        localStorage.setItem("roadguardian_token", accessToken)
        localStorage.setItem("roadguardian_refresh_token", newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Redirect to login or clear state
        localStorage.removeItem("roadguardian_token")
        localStorage.removeItem("roadguardian_refresh_token")
        localStorage.removeItem("roadguardian_user")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api

// Accident services
export const fetchActiveAccidents = async () => {
  const response = await api.get("/accidents/active")
  return response.data.data
}

export const fetchAccidentById = async (id) => {
  const response = await api.get(`/accidents/${id}`)
  return response.data.data
}

export const createPublicAccident = async (accidentData) => {
  const response = await api.post("/accidents/public", accidentData)
  return response.data.data
}

export const dispatchAmbulance = async (id) => {
  const response = await api.post(`/accidents/${id}/ambulance`)
  return response.data.data
}

export const notifyPolice = async (id) => {
  const response = await api.post(`/accidents/${id}/police`)
  return response.data.data
}

export const notifyHospital = async (id) => {
  const response = await api.post(`/accidents/${id}/hospital`)
  return response.data.data
}

export const fetchAnalytics = async () => {
  const response = await api.get("/analytics/dashboard")
  return response.data.data
}
