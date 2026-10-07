import { useState } from 'react'
import toast from 'react-hot-toast'
import { authAPI } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'

export default function AdminSettings() {
  const { admin } = useAuth()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      toast.error(isAr ? 'كلمتا المرور غير متطابقتين.' : 'New passwords do not match.')
      return
    }
    if (form.newPassword.length < 8) {
      toast.error(isAr ? 'يجب ألا تقل كلمة المرور عن 8 أحرف.' : 'Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      toast.success(isAr ? 'تم تغيير كلمة المرور بنجاح!' : 'Password changed successfully!')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || (isAr ? 'فشل تغيير كلمة المرور.' : 'Failed to change password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>{isAr ? 'إعدادات الحساب والأمان' : 'Settings'}</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {isAr ? 'إدارة بيانات حساب المسؤول وتغيير كلمة المرور' : 'Manage your admin account'}
        </p>
      </div>

      {/* Account Info */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          {isAr ? 'معلومات الحساب' : 'Account Information'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
            <input
              type="email"
              className="form-input"
              value={admin?.email || ''}
              readOnly
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{isAr ? 'الرتبة والصلاحية' : 'Role'}</label>
            <input
              type="text"
              className="form-input"
              value={isAr ? 'مسؤول النظام الكامل' : 'Administrator'}
              readOnly
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
        </h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '420px' }}>
          <div className="form-group">
            <label className="form-label">{isAr ? 'كلمة المرور الحالية' : 'Current Password'}</label>
            <input
              type="password"
              className="form-input"
              value={form.currentPassword}
              onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
            <input
              type="password"
              className="form-input"
              value={form.newPassword}
              onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder={isAr ? '8 أحرف على الأقل' : 'Min 8 characters'}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</label>
            <input
              type="password"
              className="form-input"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder={isAr ? 'أعد إدخال كلمة المرور' : 'Repeat new password'}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (isAr ? 'جاري التغيير...' : 'Changing...') : (isAr ? 'تغيير كلمة المرور' : 'Change Password')}
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
          {isAr ? 'روابط الوصول السريع' : 'Portfolio Links'}
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            {isAr ? '🌐 معاينة الموقع' : '🌐 View Portfolio'}
          </a>
          <a href="/admin/projects" className="btn btn-ghost btn-sm">
            {isAr ? '🚀 إدارة المشاريع' : '🚀 Manage Projects'}
          </a>
          <a href="/admin/sections" className="btn btn-ghost btn-sm">
            {isAr ? '🎨 إدارة الأقسام والمحتوى' : '🎨 Sections & CMS'}
          </a>
        </div>
      </div>
    </div>
  )
}
