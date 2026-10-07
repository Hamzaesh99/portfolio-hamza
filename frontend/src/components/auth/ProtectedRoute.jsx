import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
