import { useNavigate, useLocation } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'

const NAV_ITEMS_EN = [
  { id: 'overview', label: 'Overview', icon: '📊', path: '/admin' },
  { id: 'sections', label: 'Sections & CMS', icon: '🎨', path: '/admin/sections' },
  { id: 'skills', label: 'Skills & Tech', icon: '⚡', path: '/admin/skills' },
  { id: 'services', label: 'Services', icon: '🛠️', path: '/admin/services' },
  { id: 'experience', label: 'Experience & Journey', icon: '💼', path: '/admin/experience' },
  { id: 'projects', label: 'Projects', icon: '🚀', path: '/admin/projects' },
  { id: 'messages', label: 'Messages', icon: '📬', path: '/admin/messages' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' },
]

const NAV_ITEMS_AR = [
  { id: 'overview', label: 'نظرة عامة', icon: '📊', path: '/admin' },
  { id: 'sections', label: 'إدارة الأقسام والمحتوى', icon: '🎨', path: '/admin/sections' },
  { id: 'skills', label: 'المهارات التقنية', icon: '⚡', path: '/admin/skills' },
  { id: 'services', label: 'الخدمات المقدمة', icon: '🛠️', path: '/admin/services' },
  { id: 'experience', label: 'الخبرات والمسيرة', icon: '💼', path: '/admin/experience' },
  { id: 'projects', label: 'المشاريع البرمجية', icon: '🚀', path: '/admin/projects' },
  { id: 'messages', label: 'الرسائل الواردة', icon: '📬', path: '/admin/messages' },
  { id: 'settings', label: 'إعدادات الحساب', icon: '⚙️', path: '/admin/settings' },
]

export default function AdminSidebar({ open, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const navItems = isAr ? NAV_ITEMS_AR : NAV_ITEMS_EN

  const isActive = (itemPath) => {
    if (itemPath === '/admin') return location.pathname === '/admin'

    const searchTab = new URLSearchParams(location.search).get('tab')

    if (itemPath === '/admin/skills') {
      return location.pathname === '/admin/skills' ||
        ((location.pathname === '/admin/sections' || location.pathname === '/admin/cms') && searchTab === 'skills')
    }

    if (itemPath === '/admin/services') {
      return location.pathname === '/admin/services' ||
        ((location.pathname === '/admin/sections' || location.pathname === '/admin/cms') && searchTab === 'services')
    }

    if (itemPath === '/admin/experience') {
      return location.pathname === '/admin/experience' ||
        ((location.pathname === '/admin/sections' || location.pathname === '/admin/cms') && searchTab === 'experience')
    }

    if (itemPath === '/admin/sections') {
      return (location.pathname === '/admin/sections' || location.pathname === '/admin/cms') && (!searchTab || searchTab === 'visibility')
    }

    return location.pathname.startsWith(itemPath)
  }

  const goto = (path) => {
    navigate(path)
    onClose?.()
  }

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={onClose}
          className="sidebar-overlay"
        />
      )}

      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        {/* Logo & Close Button */}
        <div className="admin-sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src="/logo.png"
              alt="Hamza Eshtiba Logo"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(30, 110, 255, 0.5)',
                boxShadow: '0 0 15px rgba(30, 110, 255, 0.35)',
                background: 'radial-gradient(circle at 50% 50%, rgba(27, 42, 74, 0.3), transparent)',
                padding: '1px',
                flexShrink: 0
              }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--color-white)', lineHeight: 1.2 }}>
                Hamza Eshtiba
              </div>
              <div className="admin-logo-sub" style={{ fontSize: '0.72rem', color: 'var(--color-blue-light)' }}>
                {isAr ? 'لوحة تحكم المسؤول' : 'Admin Panel'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="admin-sidebar-close-btn"
            aria-label="Close sidebar"
            title={isAr ? 'إغلاق القائمة' : 'Close menu'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          <div className="admin-nav-title">{isAr ? 'القائمة الرئيسية' : 'Navigation'}</div>
          {navItems.map(item => (
            <button
              key={item.id}
              id={`admin-nav-${item.id}`}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => goto(item.path)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <a
            href="/"
            className="admin-nav-item"
            style={{ display: 'flex', textDecoration: 'none' }}
          >
            <span className="admin-nav-icon">🌐</span>
            {isAr ? 'معاينة الموقع' : 'View Portfolio'}
          </a>
          <button
            className="admin-nav-item"
            onClick={logout}
            style={{ color: 'var(--color-error)' }}
          >
            <span className="admin-nav-icon">🚪</span>
            {isAr ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>
      </aside>
    </>
  )
}
