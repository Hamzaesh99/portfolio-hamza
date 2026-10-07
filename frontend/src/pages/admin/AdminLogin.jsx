import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Globe, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const { lang, toggleLang, theme, toggleTheme } = useThemeLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success(isAr ? 'مرحباً بعودتك! 👋' : 'Welcome back! 👋')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.error || (isAr ? 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.' : 'Login failed. Check your credentials.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Background */}
      <div className="grid-bg" />
      <div className="glow-orb glow-orb-1" style={{ opacity: 0.08 }} />
      <div className="glow-orb glow-orb-2" style={{ opacity: 0.06 }} />

      {/* Top Controls */}
      <div style={{ position: 'fixed', top: '1.5rem', right: isAr ? 'auto' : '1.5rem', left: isAr ? '1.5rem' : 'auto', zIndex: 10, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <button
          onClick={toggleLang}
          className="btn btn-outline btn-sm"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            borderRadius: '9999px',
            padding: '0.4rem 0.9rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            background: 'var(--color-bg-secondary)',
            borderColor: 'var(--color-blue-border)',
            color: 'var(--color-blue-light)'
          }}
          title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Globe size={14} />
          <span>{isAr ? 'English' : 'العربية'}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-sm"
          style={{
            width: '36px',
            height: '36px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)'
          }}
          title={theme === 'dark' ? (isAr ? 'الوضع الفاتح' : 'Light Mode') : (isAr ? 'الوضع الداكن' : 'Dark Mode')}
        >
          {theme === 'dark' ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} style={{ color: '#38bdf8' }} />}
        </button>
      </div>

      <motion.div
        className="glass-card login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="login-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src="/logo.png"
            alt="Hamza Eshtiba Logo"
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(30, 110, 255, 0.6)',
              boxShadow: '0 0 30px rgba(30, 110, 255, 0.45)',
              marginBottom: '0.75rem',
              background: 'radial-gradient(circle at 50% 50%, rgba(27, 42, 74, 0.3), transparent)',
              padding: '2px'
            }}
          />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
            {isAr ? 'لوحة تحكم المسؤول' : 'Admin Dashboard'}
          </p>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.5rem', marginTop: '0.5rem' }}>
          {isAr ? 'تسجيل الدخول' : 'Sign In'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {isAr ? 'أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم' : 'Enter your credentials to access the dashboard'}
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
            <input
              id="admin-email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="form-input"
              placeholder="admin@example.com"
              required
              autoComplete="email"
              dir="ltr"
              style={{ textAlign: isAr ? 'right' : 'left' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isAr ? 'كلمة المرور' : 'Password'}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="form-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  paddingRight: isAr ? '1rem' : '2.75rem',
                  paddingLeft: isAr ? '2.75rem' : '1rem',
                  textAlign: isAr ? 'right' : 'left'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: isAr ? 'auto' : '0.75rem',
                  left: isAr ? '0.75rem' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  fontSize: '1rem'
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.875rem' }}
          >
            {loading ? (isAr ? 'جاري تسجيل الدخول...' : 'Signing in...') : (isAr ? 'تسجيل الدخول' : 'Sign In →')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          <a href="/" style={{ color: 'var(--color-blue-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            {isAr ? '← العودة إلى الموقع الرئيسي' : '← Back to Portfolio'}
          </a>
        </p>
      </motion.div>
    </div>
  )
}
