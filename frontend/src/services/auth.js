import api from "./api"

const TOKEN_KEY = "roadguardian_token"
const REFRESH_TOKEN_KEY = "roadguardian_refresh_token"
const USER_KEY = "roadguardian_user"

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password })
  const { accessToken, refreshToken, user } = response.data.data

  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))

  return user
}

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData)
  const { accessToken, refreshToken, user } = response.data.data

  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))

  return user
}

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  // Optionally call backend logout
  api.post("/auth/logout").catch(() => {})
}

export const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const refreshToken = async () => {
  const rToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!rToken) throw new Error("No refresh token available")

  const response = await api.post(`/auth/refresh-token?refreshToken=${rToken}`)
  const { accessToken, refreshToken: newRefreshToken } = response.data.data

  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)

  return accessToken
}

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email })
  return response.data
}
