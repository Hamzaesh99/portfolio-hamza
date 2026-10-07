import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeLanguageProvider } from './context/ThemeLanguageContext.jsx'
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

function App() {
  return (
    <ThemeLanguageProvider>
      <SiteSettingsProvider>
        <AuthProvider>
          <Routes>
            {/* Public Portfolio */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </SiteSettingsProvider>
    </ThemeLanguageProvider>
  )
}

export default App
