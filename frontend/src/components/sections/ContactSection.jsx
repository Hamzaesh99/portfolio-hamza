import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { contactAPI } from '../../lib/api.js'
import { useInView } from '../hooks/useInView.js'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'
import { useSiteSettings } from '../../context/SiteSettingsContext.jsx'

export default function ContactSection() {
  const [ref, inView] = useInView({ threshold: 0.1 })
  const { lang } = useThemeLanguage()
  const { contact: contactSettings } = useSiteSettings()
  const isAr = lang === 'ar'

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error(isAr ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      await contactAPI.submit(form)
      toast.success(isAr ? 'تم إرسال رسالتك بنجاح! سأتواصل معك قريباً. 🚀' : 'Message sent! I\'ll get back to you soon. 🚀')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || (isAr ? 'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.' : 'Failed to send message. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const emailVal = contactSettings?.email || 'hamza@eshtiba.com'
  const locationVal = contactSettings?.location || (isAr ? 'طرابلس، ليبيا 🇱🇾' : 'Tripoli, Libya 🇱🇾')
  const linkedinVal = contactSettings?.linkedin_url || 'https://linkedin.com/in/hamzaeshtiba'
  const githubVal = contactSettings?.github_url || 'https://github.com/hamzaeshtiba'

  const INFO = [
    { icon: '📧', label: isAr ? 'البريد الإلكتروني' : 'Email', value: emailVal, href: `mailto:${emailVal}` },
    { icon: '📍', label: isAr ? 'الموقع' : 'Location', value: locationVal, href: null },
    { icon: '💼', label: isAr ? 'لينكد إن' : 'LinkedIn', value: linkedinVal.replace('https://', ''), href: linkedinVal },
    { icon: '🐙', label: isAr ? 'جيت هب' : 'GitHub', value: githubVal.replace('https://', ''), href: githubVal },
  ]

  return (
    <section id="contact" className="section" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="container" ref={ref}>
        <div className="section-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="section-badge"><span>06</span> {isAr ? 'تواصل معي' : 'Contact'}</div>
            <h2 className="section-title">{isAr ? 'ابقَ على تواصل' : 'Get In Touch'}</h2>
            <p className="section-subtitle">
              {isAr
                ? 'هل لديك مشروع في بالك أو فرصة عمل؟ يسعدني التواصل معك ومناقشة تفاصيل العمل معاً.'
                : "Have a project in mind? Let's talk! I'm always open to new opportunities."}
            </p>
          </motion.div>
        </div>

        <div className="contact-content">
          {/* Info Column */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 30 : -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>
              {isAr ? 'لنعمل معاً على إنجاز أفكارك' : "Let's Work Together"}
            </h3>
            <p style={{ marginBottom: '2rem', lineHeight: 1.8 }}>
              {isAr
                ? 'أنا متاح حالياً للمشاريع المستقلة (Freelance) وفرص العمل الدائمة أو التعاقدية. إذا كنت تبحث عن مطور برمجيات متفانٍ يبني لك حلولاً موثوقة وعالية الأداء، يسعدني استقبال رسالتك.'
                : "I'm currently available for freelance work and full-time engineering positions. If you have a project that needs crafting or a team looking for a dedicated developer, reach out!"}
            </p>

            <div className="contact-info">
              {INFO.map(({ icon, label, value, href }) => (
                <div key={label} className="card contact-info-card">
                  <div className="contact-icon">{icon}</div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>{label}</div>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--color-blue-light)', fontWeight: 500 }}>
                        {value}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form Column */}
          <motion.div
            className="card contact-form"
            initial={{ opacity: 0, x: isAr ? -30 : 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>
              {isAr ? 'أرسل رسالة مباشرة' : 'Send a Message'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label className="form-label">{isAr ? 'الاسم *' : 'Name *'}</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder={isAr ? 'اسمك الكريم' : 'Your name'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{isAr ? 'البريد الإلكتروني *' : 'Email *'}</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="your@email.com"
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{isAr ? 'الموضوع' : 'Subject'}</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="form-input"
                    placeholder={isAr ? 'استفسار عن مشروع، فرصة عمل، تعاون...' : 'Project inquiry, collaboration...'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{isAr ? 'الرسالة *' : 'Message *'}</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder={isAr ? 'أخبرني عن فكرة مشروعك أو تفاصيل ما تحتاجه...' : 'Tell me about your project...'}
                    rows={5}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>{isAr ? 'جاري الإرسال...' : 'Sending...'}</>
                  ) : (
                    <>
                      {isAr ? 'إرسال الرسالة' : 'Send Message'}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={isAr ? { transform: 'scaleX(-1)' } : {}}>
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
