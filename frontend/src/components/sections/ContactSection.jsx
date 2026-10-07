import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { contactAPI } from '../../lib/api.js'
import { useInView } from '../hooks/useInView.js'

export default function ContactSection() {
  const [ref, inView] = useInView({ threshold: 0.1 })
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      await contactAPI.submit(form)
      toast.success('Message sent! I\'ll get back to you soon. 🚀')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const INFO = [
    { icon: '📧', label: 'Email', value: 'hamza@eshtiba.com', href: 'mailto:hamza@eshtiba.com' },
    { icon: '📍', label: 'Location', value: 'Libya 🇱🇾', href: null },
    { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/hamzaeshtiba', href: 'https://linkedin.com/in/hamzaeshtiba' },
    { icon: '🐙', label: 'GitHub', value: 'github.com/hamzaeshtiba', href: 'https://github.com/hamzaeshtiba' },
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
            <div className="section-badge"><span>06</span> Contact</div>
            <h2 className="section-title">Get In Touch</h2>
            <p className="section-subtitle">
              Have a project in mind? Let's talk! I'm always open to new opportunities.
            </p>
          </motion.div>
        </div>

        <div className="contact-content">
          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Let's Work Together</h3>
            <p style={{ marginBottom: '2rem', lineHeight: 1.8 }}>
              I'm currently available for freelance work and full-time positions.
              If you have a project that needs crafting or a team looking for a dedicated developer, reach out!
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

          {/* Form */}
          <motion.div
            className="card contact-form"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h3 style={{ marginBottom: '1.5rem' }}>Send a Message</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="contact-form-grid">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Project inquiry, collaboration..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Tell me about your project..."
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
                    <>Sending...</>
                  ) : (
                    <>
                      Send Message
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
