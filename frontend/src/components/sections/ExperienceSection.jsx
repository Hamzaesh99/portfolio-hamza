import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView.js'
import { useSiteSettings, DEFAULT_EXPERIENCE_SETTINGS } from '../../context/SiteSettingsContext.jsx'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'

export default function ExperienceSection() {
  const [ref, inView] = useInView({ threshold: 0.1 })
  const { experience: expSettings } = useSiteSettings()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const data = expSettings || DEFAULT_EXPERIENCE_SETTINGS
  const experiences = Array.isArray(data.experiences) ? data.experiences : DEFAULT_EXPERIENCE_SETTINGS.experiences

  const badge = isAr ? (data.badge_ar || 'الخبرات والمسيرة') : (data.badge_en || 'Experience')
  const title = isAr ? (data.title_ar || 'مسيرتي المهنية وخبراتي') : (data.title_en || 'My Journey')
  const subtitle = isAr
    ? (data.subtitle_ar || 'محطات وخبرات واقعية ميزت مسيرتي في هندسة وتطوير البرمجيات')
    : (data.subtitle_en || 'Professional experience and milestones in my software engineering career')

  return (
    <section id="experience" className="section">
      <div className="container" ref={ref}>
        <div className="section-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="section-badge"><span>05</span> {badge}</div>
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </motion.div>
        </div>

        <div className="experience-timeline">
          {experiences.map((exp, i) => {
            const expTitle = isAr ? (exp.title_ar || exp.title_en || exp.title) : (exp.title_en || exp.title_ar || exp.title)
            const expCompany = isAr ? (exp.company_ar || exp.company_en || exp.company) : (exp.company_en || exp.company_ar || exp.company)
            const expLoc = isAr ? (exp.location_ar || exp.location_en || exp.location) : (exp.location_en || exp.location_ar || exp.location)
            const expDesc = isAr ? (exp.description_ar || exp.description_en || exp.description) : (exp.description_en || exp.description_ar || exp.description)
            const expTechs = Array.isArray(exp.technologies) ? exp.technologies : []

            const periodEnd = exp.is_current
              ? (isAr ? 'حتى الآن' : 'Present')
              : (exp.end_date || '')

            return (
              <motion.div
                key={exp.id || i}
                className="card experience-item"
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="exp-period">
                  <span>📅 {exp.start_date} — {periodEnd}</span>
                  {exp.is_current && <span className="exp-current-badge">{isAr ? 'الوظيفة الحالية' : 'Current'}</span>}
                </div>
                <h3 className="exp-title">{expTitle}</h3>
                <div className="exp-company">{expCompany}</div>
                {expLoc && <div className="exp-location">📍 {expLoc}</div>}
                <p className="exp-description">{expDesc}</p>
                {expTechs.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    {expTechs.map((tech, tIdx) => (
                      <span key={tech || tIdx} className="tag tag-sm">{tech}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

