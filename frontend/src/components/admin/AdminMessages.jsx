import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { contactAPI } from '../../lib/api.js'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'

export default function AdminMessages() {
  const qc = useQueryClient()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const { data, isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => contactAPI.getAll().then(r => r.data.contacts),
  })

  const markRead = useMutation({
    mutationFn: (id) => contactAPI.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-messages'] }),
  })

  const deleteMsg = useMutation({
    mutationFn: (id) => contactAPI.delete(id),
    onSuccess: () => {
      toast.success(isAr ? 'تم حذف الرسالة بنجاح.' : 'Message deleted.')
      qc.invalidateQueries({ queryKey: ['admin-messages'] })
    },
  })

  const messages = data || []
  const unread = messages.filter(m => !m.read).length

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2>{isAr ? 'الرسائل الواردة' : 'Messages'}</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          {isAr
            ? `إجمالي الرسائل: ${messages.length} — غير مقروءة: ${unread}`
            : `${messages.length} message${messages.length !== 1 ? 's' : ''} — ${unread} unread`}
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : messages.length === 0 ? (
        <div className="empty-state card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
          <h3 className="empty-title">{isAr ? 'لا توجد رسائل بعد' : 'No messages yet'}</h3>
          <p className="empty-desc" style={{ color: 'var(--color-text-muted)' }}>
            {isAr
              ? 'الرسائل المرسلة من نموذج التواصل في موقعك ستظهر هنا فور إرسالها.'
              : 'Messages from your contact form will appear here'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              className="card"
              style={{
                padding: '1.5rem',
                borderColor: !msg.read ? 'var(--color-blue-border)' : 'var(--color-border)',
                background: !msg.read ? 'rgba(30, 110, 255, 0.03)' : undefined,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{msg.name}</span>
                    {!msg.read && (
                      <span style={{
                        background: 'var(--color-blue-glow)', color: 'var(--color-blue-light)',
                        border: '1px solid var(--color-blue-border)',
                        borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700,
                        padding: '0.15rem 0.5rem'
                      }}>
                        {isAr ? 'جديد' : 'NEW'}
                      </span>
                    )}
                  </div>
                  <a href={`mailto:${msg.email}`} style={{ color: 'var(--color-blue-light)', fontSize: '0.9rem' }}>
                    {msg.email}
                  </a>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {new Date(msg.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                  </span>
                  {!msg.read && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => markRead.mutate(msg.id)}
                    >
                      {isAr ? '✓ تحديد كمقروء' : '✓ Mark Read'}
                    </button>
                  )}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteMsg.mutate(msg.id)}
                    title={isAr ? 'حذف الرسالة' : 'Delete message'}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {msg.subject && (
                <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                  📌 {msg.subject}
                </div>
              )}

              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {msg.message}
              </p>

              <div style={{ marginTop: '1rem' }}>
                <a
                  href={`mailto:${msg.email}?subject=Re: ${msg.subject || 'Your message'}`}
                  className="btn btn-outline btn-sm"
                >
                  {isAr ? '← الرد عبر البريد الإلكتروني' : 'Reply via Email →'}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
