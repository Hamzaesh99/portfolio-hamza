import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView.js'
import { useSiteSettings, DEFAULT_SERVICES_SETTINGS } from '../../context/SiteSettingsContext.jsx'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'

export default function ServicesSection() {
  const [ref, inView] = useInView({ threshold: 0.1 })
  const { services: servicesSettings } = useSiteSettings()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const data = servicesSettings || DEFAULT_SERVICES_SETTINGS
  const servicesList = Array.isArray(data.services) ? data.services : DEFAULT_SERVICES_SETTINGS.services

  const badge = isAr ? (data.badge_ar || 'الخدمات البرمجية') : (data.badge_en || 'Services')
  const title = isAr ? (data.title_ar || 'الخدمات التي أقدمها') : (data.title_en || 'What I Offer')
  const subtitle = isAr
    ? (data.subtitle_ar || 'حلول وخدمات برمجية متكاملة لتحويل أفكارك إلى منتجات رقمية ناجحة ومتميزة')
    : (data.subtitle_en || 'Professional services to help you build and grow your digital presence')

  return (
    <section id="services" className="section" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="container" ref={ref}>
        <div className="section-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="section-badge"><span>04</span> {badge}</div>
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </motion.div>
        </div>

        <div className="services-grid">
          {servicesList.map((service, i) => {
            const sTitle = isAr ? (service.title_ar || service.title_en || service.title) : (service.title_en || service.title_ar || service.title)
            const sDesc = isAr ? (service.description_ar || service.description_en || service.description) : (service.description_en || service.description_ar || service.description)

            return (
              <motion.div
                key={service.id || service.title || i}
                className="card service-card"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="service-icon-wrapper">{service.icon || '🚀'}</div>
                <h3 className="service-title">{sTitle}</h3>
                <p className="service-description">{sDesc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

