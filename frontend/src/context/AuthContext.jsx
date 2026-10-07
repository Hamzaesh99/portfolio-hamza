import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const savedAdmin = localStorage.getItem('admin_user')
    if (token && savedAdmin) {
      setAdmin(JSON.parse(savedAdmin))
      // Verify token is still valid
      authAPI.me()
        .then(({ data }) => setAdmin(data.admin))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin_user', JSON.stringify(data.admin))
    setAdmin(data.admin)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
