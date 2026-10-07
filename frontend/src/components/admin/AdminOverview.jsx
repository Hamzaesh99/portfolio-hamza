import { useQuery } from '@tanstack/react-query'
import { projectsAPI, contactAPI } from '../../lib/api.js'
import { useNavigate } from 'react-router-dom'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'

export default function AdminOverview() {
  const navigate = useNavigate()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const { data: projectsData } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => projectsAPI.getAllAdmin().then(r => r.data.projects),
  })

  const { data: messagesData } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => contactAPI.getAll().then(r => r.data.contacts),
  })

  const projects = projectsData || []
  const messages = messagesData || []
  const unreadMessages = messages.filter(m => !m.read).length
  const featuredProjects = projects.filter(p => p.featured).length

  const STATS = [
    {
      label: isAr ? 'إجمالي المشاريع' : 'Total Projects',
      value: projects.length,
      icon: '🚀',
      color: 'stat-icon-blue',
      path: '/admin/projects',
    },
    {
      label: isAr ? 'المشاريع المميزة' : 'Featured Projects',
      value: featuredProjects,
      icon: '⭐',
      color: 'stat-icon-yellow',
      path: '/admin/projects',
    },
    {
      label: isAr ? 'إجمالي الرسائل' : 'Total Messages',
      value: messages.length,
      icon: '📬',
      color: 'stat-icon-green',
      path: '/admin/messages',
    },
    {
      label: isAr ? 'رسائل جديدة وغير مقروءة' : 'Unread Messages',
      value: unreadMessages,
      icon: '🔔',
      color: 'stat-icon-purple',
      path: '/admin/messages',
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>
        {isAr ? 'مرحباً بعودتك! 👋' : 'Welcome back! 👋'}
      </h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        {isAr ? 'إليك نظرة شاملة على أداء وإحصائيات موقعك.' : "Here's an overview of your portfolio."}
      </p>

      {/* Stats */}
      <div className="stats-grid">
        {STATS.map(stat => (
          <div
            key={stat.label}
            className="card stat-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(stat.path)}
          >
            <div className={`stat-icon-box ${stat.color}`}>{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div className="card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>
              {isAr ? 'أحدث المشاريع' : 'Recent Projects'}
            </h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/projects')}>
              {isAr ? 'عرض الكل' : 'View All'}
            </button>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{isAr ? 'المشروع' : 'Project'}</th>
                  <th>{isAr ? 'التقنيات' : 'Technologies'}</th>
                  <th>{isAr ? 'مميز' : 'Featured'}</th>
                  <th>{isAr ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map(project => (
                  <tr key={project.id}>
                    <td style={{ fontWeight: 600 }}>{project.title}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {(project.technologies || []).slice(0, 3).map(t => (
                          <span key={t} className="tag tag-sm">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td>{project.featured ? (isAr ? '⭐ نعم' : '⭐ Yes') : '—'}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: project.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: project.status === 'published' ? 'var(--color-success)' : 'var(--color-warning)',
                        border: `1px solid ${project.status === 'published' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      }}>
                        {project.status === 'published' ? (isAr ? 'منشور' : 'published') : (isAr ? 'مسودة' : project.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          {isAr ? 'إجراءات سريعة' : 'Quick Actions'}
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/admin/projects')}>
            {isAr ? '➕ إضافة مشروع جديد' : '➕ Add Project'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/admin/sections')}>
            {isAr ? '🎨 التحكم في الأقسام والمحتوى' : '🎨 Sections & CMS'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/admin/messages')}>
            {isAr ? '📬 عرض الرسائل' : '📬 View Messages'}
          </button>
          <a href="/" target="_blank" rel="noreferrer" className="btn btn-ghost">
            {isAr ? '🌐 معاينة الموقع' : '🌐 View Portfolio'}
          </a>
        </div>
      </div>
    </div>
  )
}
