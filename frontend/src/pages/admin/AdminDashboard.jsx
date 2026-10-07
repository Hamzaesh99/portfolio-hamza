import { useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Globe, Sun, Moon, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import AdminOverview from '../../components/admin/AdminOverview.jsx'
import AdminProjects from '../../components/admin/AdminProjects.jsx'
import AdminMessages from '../../components/admin/AdminMessages.jsx'
import AdminSettings from '../../components/admin/AdminSettings.jsx'
import AdminCMS from '../../components/admin/AdminCMS.jsx'

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { admin, logout } = useAuth()
  const { lang, toggleLang, theme, toggleTheme } = useThemeLanguage()
  const isAr = lang === 'ar'
  const location = useLocation()

  const getPageTitle = () => {
    if (location.pathname === '/admin/skills') return isAr ? 'إدارة المهارات التقنية' : 'Skills & Tech'
    if (location.pathname === '/admin/services') return isAr ? 'إدارة الخدمات المقدمة' : 'Services Management'
    if (location.pathname === '/admin/experience') return isAr ? 'إدارة الخبرات والمسيرة' : 'Experience & Journey'

    if (location.pathname.includes('/admin/sections') || location.pathname.includes('/admin/cms')) {
      const tab = new URLSearchParams(location.search).get('tab')
      if (tab === 'skills') return isAr ? 'إدارة المهارات التقنية' : 'Skills & Tech'
      if (tab === 'services') return isAr ? 'إدارة الخدمات المقدمة' : 'Services Management'
      if (tab === 'experience') return isAr ? 'إدارة الخبرات والمسيرة' : 'Experience & Journey'
      if (tab === 'hero') return isAr ? 'قسم البداية والصورة' : 'Hero & Portrait'
      if (tab === 'about') return isAr ? 'قسم نبذة عني' : 'About Section'
      if (tab === 'contact') return isAr ? 'قسم التواصل والشبكات' : 'Contact & Socials'
      return isAr ? 'إدارة الأقسام والمحتوى' : 'Sections & CMS'
    }
    if (location.pathname.includes('/admin/projects')) return isAr ? 'المشاريع البرمجية' : 'Projects'
    if (location.pathname.includes('/admin/messages')) return isAr ? 'الرسائل الواردة' : 'Messages'
    if (location.pathname.includes('/admin/settings')) return isAr ? 'إعدادات الحساب والأمان' : 'Account Settings'
    return isAr ? 'لوحة التحكم - نظرة عامة' : 'Dashboard Overview'
  }

  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="admin-menu-btn"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="admin-page-title">{getPageTitle()}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Language Toggle Button */}
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
                color: 'var(--color-blue-light)',
                borderColor: 'var(--color-blue-border)'
              }}
              title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Globe size={14} />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* Theme Toggle Button */}
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
                borderRadius: '50%'
              }}
              title={theme === 'dark' ? (isAr ? 'الوضع الفاتح' : 'Light Mode') : (isAr ? 'الوضع الداكن' : 'Dark Mode')}
            >
              {theme === 'dark' ? <Sun size={17} style={{ color: '#fbbf24' }} /> : <Moon size={17} style={{ color: '#38bdf8' }} />}
            </button>

            {/* Admin Info */}
            <div style={{ textAlign: isAr ? 'left' : 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{admin?.email}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>
                {isAr ? 'مسؤول النظام' : 'Administrator'}
              </div>
            </div>

            {/* Logout */}
            <button
              id="admin-logout-btn"
              className="btn btn-ghost btn-sm"
              onClick={logout}
              style={{ color: 'var(--color-error)' }}
            >
              {isAr ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="admin-content">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="sections" element={<AdminCMS defaultTab="visibility" />} />
            <Route path="cms" element={<AdminCMS defaultTab="visibility" />} />
            <Route path="skills" element={<AdminCMS defaultTab="skills" />} />
            <Route path="services" element={<AdminCMS defaultTab="services" />} />
            <Route path="experience" element={<AdminCMS defaultTab="experience" />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin/sections" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
