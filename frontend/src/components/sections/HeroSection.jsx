import { motion } from 'framer-motion'
import { ArrowRight, Code2, Layers, Sparkles, CheckCircle2 } from 'lucide-react'
import defaultHeroPhoto from '../../assets/hero.jpg'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'
import { useSiteSettings } from '../../context/SiteSettingsContext.jsx'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

function formatPhotoSrc(url) {
  if (!url || !url.trim()) return defaultHeroPhoto
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }
  return `${API_BASE}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
}

export default function HeroSection() {
  const { lang } = useThemeLanguage()
  const { hero } = useSiteSettings()
  const isAr = lang === 'ar'

  const photoSrc = formatPhotoSrc(hero?.photo_url)

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="hero-ref">
      {/* Background glow effects */}
      <div className="hero-ref-bg-glow hero-ref-bg-glow-right" />
      <div className="hero-ref-bg-glow hero-ref-bg-glow-left" />
      <div className="hero-ref-ambient-stars" />

      <div className="container hero-ref-container">
        <div className="hero-ref-grid">
          {/* LEFT COLUMN: Personal Brand & Software Engineering Services */}
          <div className="hero-ref-content">
            {/* Availability Style Badge */}
            <motion.div
              className="hero-ref-badge"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="hero-ref-badge-dot" />
              <span className="hero-ref-badge-text">
                {isAr
                  ? (hero?.badge_ar || 'متاح للعمل والمشاريع • مهندس برمجيات')
                  : (hero?.badge_en || 'AVAILABLE FOR WORK • FULL STACK ENGINEER')}
              </span>
            </motion.div>

            {/* Giant Editorial Brand Typography */}
            <motion.h1
              className="hero-ref-brand"
              initial={{ opacity: 0, x: isAr ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="brand-line">{hero?.brand_first || 'HAMZA'}</span>
              <span className="brand-line brand-line-accent">{hero?.brand_last || 'ESHTIBA'}</span>
            </motion.h1>

            {/* Headline about Skills & Services */}
            <motion.div
              className="hero-ref-tagline"
              initial={{ opacity: 0, x: isAr ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Code2 size={18} className="tagline-icon" />
              <span>
                {isAr
                  ? (hero?.tagline_ar || 'هندسة وتطوير تطبيقات الويب الحديثة وحلول الـ FULL STACK')
                  : (hero?.tagline_en || 'FULL STACK SOFTWARE ENGINEER & WEB ARCHITECT')}
              </span>
            </motion.div>

            {/* Supporting Description about Skills & Services */}
            <motion.p
              className="hero-ref-description"
              initial={{ opacity: 0, x: isAr ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {isAr
                ? (hero?.description_ar || 'أصمم وأطور تطبيقات ويب متكاملة وسريعة تجمع بين دقة الواجهات التفاعلية الحديثة (React.js)، وبناء خوادم وواجهات برمجية آمنة (Node.js & REST APIs)، وقواعد بيانات مصممة للأداء العالي وقابلية التوسع.')
                : (hero?.description_en || 'I architect and develop modern, scalable web applications that combine pixel-perfect frontend experiences (React.js) with resilient backend APIs (Node.js) and high-performance database architectures.')}
            </motion.p>

            {/* Action Buttons (CTA) */}
            <motion.div
              className="hero-ref-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Primary Pill Button */}
              <button
                className="hero-ref-btn-primary"
                onClick={() => scrollTo(hero?.cta_primary_link || 'projects')}
                aria-label={isAr ? (hero?.cta_primary_text_ar || 'استكشف المشاريع') : (hero?.cta_primary_text_en || 'View Projects')}
              >
                <span>
                  {isAr
                    ? (hero?.cta_primary_text_ar || 'استكشف المشاريع')
                    : (hero?.cta_primary_text_en || 'View Projects')}
                </span>
                <span className="pill-dot-indicator">
                  <ArrowRight size={15} style={isAr ? { transform: 'scaleX(-1)' } : {}} />
                </span>
              </button>

              {/* Secondary Ghost Button */}
              <button
                className="hero-ref-btn-secondary"
                onClick={() => scrollTo(hero?.cta_secondary_link || 'services')}
                aria-label={isAr ? (hero?.cta_secondary_text_ar || 'خدماتي البرمجية') : (hero?.cta_secondary_text_en || 'EXPLORE SERVICES')}
              >
                <span className="pill-play-circle">
                  <Layers size={13} />
                </span>
                <span>
                  {isAr
                    ? (hero?.cta_secondary_text_ar || 'خدماتي البرمجية')
                    : (hero?.cta_secondary_text_en || 'EXPLORE SERVICES')}
                </span>
              </button>
            </motion.div>

            {/* Stats Row about Real Experience & Delivery */}
            <motion.div
              className="hero-ref-stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              <div className="hero-ref-stat-item">
                <div className="ref-stat-icon-box">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="ref-stat-value">{hero?.stat1_value || '+3'}</div>
                  <div className="ref-stat-label">
                    {isAr ? (hero?.stat1_label_ar || 'سنوات خبرة') : (hero?.stat1_label_en || 'YEARS EXP')}
                  </div>
                </div>
              </div>

              <div className="hero-ref-stat-separator" />

              <div className="hero-ref-stat-item">
                <div className="ref-stat-icon-box">
                  <Layers size={18} />
                </div>
                <div>
                  <div className="ref-stat-value">{hero?.stat2_value || '+20'}</div>
                  <div className="ref-stat-label">
                    {isAr ? (hero?.stat2_label_ar || 'مشروعاً منجزاً') : (hero?.stat2_label_en || 'PROJECTS BUILT')}
                  </div>
                </div>
              </div>

              <div className="hero-ref-stat-separator" />

              <div className="hero-ref-stat-item">
                <div className="ref-stat-icon-box">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div className="ref-stat-value">{hero?.stat3_value || '100%'}</div>
                  <div className="ref-stat-label">
                    {isAr ? (hero?.stat3_label_ar || 'جودة وتفاني') : (hero?.stat3_label_en || 'SATISFACTION')}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Core Tech Stack Row */}
            <motion.div
              className="hero-ref-trust"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="trust-title">
                {isAr
                  ? 'التقنيات الأساسية التي أعتمد عليها في بناء الحلول'
                  : 'CORE TECHNOLOGIES & SPECIALIZATIONS'}
              </div>
              <div className="trust-icons-row">
                <div className="trust-badge" title="React.js & Frontend">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(30 12 12)" />
                    <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(90 12 12)" />
                    <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(150 12 12)" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                  <span>REACT.JS</span>
                </div>

                <div className="trust-badge" title="Node.js & Backend">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <polygon points="12 2 21 7.5 21 17.5 12 23 3 17.5 3 7.5 12 2" />
                  </svg>
                  <span>NODE.JS</span>
                </div>

                <div className="trust-badge" title="TypeScript">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M7 15V9h4M17 15l-3-6 3-6" />
                  </svg>
                  <span>TYPESCRIPT</span>
                </div>

                <div className="trust-badge" title="RESTful APIs">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="18" cy="18" r="3" />
                    <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
                  </svg>
                  <span>REST APIs</span>
                </div>

                <div className="trust-badge" title="SQL & Databases">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                  <span>SQL / POSTGRES</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Personal Photo & Services Highlights */}
          <div className="hero-ref-visual-wrapper">
            <motion.div
              className="hero-ref-visual"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              {/* Celestial Eclipse Ring */}
              <div className="celestial-eclipse-glow" />
              <div className="celestial-eclipse-ring" />

              {/* The Cinematic Photo Frame */}
              <div className="hero-ref-photo-frame">
                <img
                  src={photoSrc}
                  alt={`${hero?.brand_first || 'Hamza'} ${hero?.brand_last || 'Eshtiba'}`}
                  className="hero-ref-photo"
                  onError={(e) => {
                    e.currentTarget.src = defaultHeroPhoto
                  }}
                />
                <div className="hero-ref-photo-gradient-left" />
                <div className="hero-ref-photo-gradient-bottom" />
              </div>

              {/* Floating Services & Skills Highlights Card */}
              <motion.div
                className="hero-ai-hud-card"
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="hud-card-header">
                  <span className="hud-card-dot" />
                  <span className="hud-card-title">
                    {isAr
                      ? (hero?.hud_title_ar || 'الخدمات البرمجية المتخصصة')
                      : (hero?.hud_title_en || 'SPECIALIZED SERVICES')}
                  </span>
                  <span className="hud-card-badge">
                    {isAr
                      ? (hero?.hud_badge_ar || 'متاح للمشاريع')
                      : (hero?.hud_badge_en || 'OPEN FOR HIRE')}
                  </span>
                </div>
                <div className="hud-card-prompt">
                  {isAr
                    ? (hero?.hud_text_ar || '«بناء واجهات ويب تفاعلية حديثة، تطوير APIs قوية وسريعة، تصميم قواعد بيانات آمنة، وضمان أعلى معايير الجودة والأداء.»')
                    : (hero?.hud_text_en || '"Crafting interactive web applications, engineering robust APIs, designing secure database architectures, and delivering clean, maintainable code."')}
                </div>
                <div className="hud-card-meta">
                  <span className="hud-card-time">
                    {isAr
                      ? (hero?.hud_meta_ar || '⚡ كود نظيف وتصميم متجاوب')
                      : (hero?.hud_meta_en || '⚡ Clean Code & Scalable Architecture')}
                  </span>
                  <span className="hud-card-quality">{hero?.hud_tags || 'React • Node • SQL'}</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Vertical Editorial Rail Text on the far right */}
            <div className="hero-ref-vertical-rail">
              <span className="rail-text-main">
                {isAr ? 'إبداع برمجي متكامل' : 'SOFTWARE CRAFTSMANSHIP'}
              </span>
              <span className="rail-dot" />
              <span className="rail-text-sub">
                {isAr ? 'هندسة حلول رقمية مؤثرة' : 'BUILDING IMPACTFUL SOLUTIONS'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
