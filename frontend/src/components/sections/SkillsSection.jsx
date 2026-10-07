import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView.js'
import { useSiteSettings, DEFAULT_SKILLS_SETTINGS } from '../../context/SiteSettingsContext.jsx'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'

export default function SkillsSection() {
  const [ref, inView] = useInView({ threshold: 0.1 })
  const { skills: skillsSettings } = useSiteSettings()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const data = skillsSettings || DEFAULT_SKILLS_SETTINGS
  const categories = Array.isArray(data.categories) ? data.categories : DEFAULT_SKILLS_SETTINGS.categories
  const tags = Array.isArray(data.tags) ? data.tags : DEFAULT_SKILLS_SETTINGS.tags

  const badge = isAr ? (data.badge_ar || 'المهارات التقنية') : (data.badge_en || 'Skills')
  const title = isAr ? (data.title_ar || 'الخبرات والمهارات البرمجية') : (data.title_en || 'Technical Expertise')
  const subtitle = isAr
    ? (data.subtitle_ar || 'التقنيات والأدوات التي أعتمد عليها في بناء تطبيقات ويب عصرية وقابلة للتوسع')
    : (data.subtitle_en || 'Technologies and tools I use to build modern, scalable applications')

  return (
    <section id="skills" className="section" style={{ background: 'var(--color-bg-secondary)' }}>
      <div className="container" ref={ref}>
        <div className="section-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="section-badge"><span>02</span> {badge}</div>
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </motion.div>
        </div>

        <div className="skills-grid">
          {categories.map((category, catIdx) => {
            const catTitle = isAr ? (category.title_ar || category.title_en || category.title) : (category.title_en || category.title_ar || category.title)
            const catSkills = Array.isArray(category.skills) ? category.skills : []

            return (
              <motion.div
                key={category.id || category.title || catIdx}
                className="card skills-category-card"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: catIdx * 0.1 }}
              >
                <div className="skills-category-icon">{category.icon || '⚡'}</div>
                <h3 className="skills-category-title">{catTitle}</h3>

                {catSkills.map((skill, i) => (
                  <div key={skill.name || i} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-level" dir="ltr">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <motion.div
                        className="skill-bar-fill"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: catIdx * 0.1 + i * 0.1 + 0.3 }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )
          })}
        </div>

        {/* Tech Tags Cloud */}
        {data.show_tags !== false && tags && tags.length > 0 && (
          <motion.div
            style={{ marginTop: '3rem', textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
              {tags.map((tech, i) => (
                <span key={tech || i} className="tag">{tech}</span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

