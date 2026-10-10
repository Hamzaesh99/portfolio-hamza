import React from 'react'
import { getLocalizedProject } from '../../lib/projectTranslations.js'

export default function CVDocument({
  lang = 'ar',
  hero = {},
  about = {},
  contact = {},
  skills = {},
  services = {},
  experience = {},
  projects = [],
}) {
  const isAr = lang === 'ar'
  const dir = isAr ? 'rtl' : 'ltr'

  // Extract localized fields with safe fallbacks
  const name = isAr
    ? (about.name || 'حمزة اشطيبه')
    : `${hero.brand_first || 'HAMZA'} ${hero.brand_last || 'ESHTIBA'}`

  const title = isAr
    ? (hero.tagline_ar || 'مهندس برمجيات ومطور Full Stack متكامل')
    : (hero.tagline_en || 'Full Stack Software Engineer & Web Architect')

  const summary = isAr
    ? (about.p1_ar || hero.description_ar || 'أنا حمزة اشطيبه، مهندس برمجيات بخبرة تزيد عن 3 سنوات في بناء تطبيقات الويب الحديثة. متخصص في تطوير Full-Stack مع شغف بالكود النظيف والبنية البرمجية الأنيقة.')
    : (about.p1_en || hero.description_en || "I'm Hamza Eshtiba, a Software Engineer with over 3 years of experience building modern web applications. I specialize in full-stack development with a passion for clean code and elegant architecture.")

  const summary2 = isAr ? about.p2_ar : about.p2_en

  const email = contact.email || about.email || 'hamza@eshtiba.com'
  const location = isAr ? 'طرابلس، ليبيا 🇱🇾' : 'Tripoli, Libya 🇱🇾'
  const expYears = isAr ? '+3 سنوات خبرة' : '3+ Years Experience'
  const languages = isAr ? 'العربية (اللغة الأم)، الإنجليزية (مستوى مهني)' : 'English (Professional), Arabic (Native)'
  const status = isAr ? 'متاح للعمل والمشاريع' : 'Available for Projects & Hire'

  const github = contact.github_url ? contact.github_url.replace('https://', '') : 'github.com/hamzaeshtiba'
  const linkedin = contact.linkedin_url ? contact.linkedin_url.replace('https://', '') : 'linkedin.com/in/hamzaeshtiba'

  const categories = Array.isArray(skills.categories) ? skills.categories : []
  const tags = Array.isArray(skills.tags) ? skills.tags : []
  const experiences = Array.isArray(experience.experiences) ? experience.experiences : []
  const servicesList = Array.isArray(services.services) ? services.services : []
  const featuredProjects = Array.isArray(projects) ? projects.slice(0, 3) : []

  return (
    <div
      id="cv-printable-document"
      dir={dir}
      style={{
        width: '100%',
        maxWidth: '820px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        color: '#1e293b',
        fontFamily: isAr
          ? "'Tajawal', 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          : "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        lineHeight: 1.5,
        fontSize: '13px',
        boxSizing: 'border-box',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {/* HEADER SECTION */}
      <header
        style={{
          background: 'linear-gradient(135deg, #091224 0%, #0f1f3d 50%, #172c54 100%)',
          color: '#ffffff',
          padding: '2rem 2.25rem 1.75rem',
          borderBottom: '4px solid #2563eb',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Brand Identity Logo */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2px solid rgba(59, 130, 246, 0.65)',
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.45)',
                background: 'radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.5), rgba(15, 23, 42, 0.95))',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              <img
                src="/logo.png"
                alt="Hamza Eshtiba Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                }}
                crossOrigin="anonymous"
              />
            </div>

            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(37, 99, 235, 0.25)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  color: '#60a5fa',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  marginBottom: '0.45rem',
                  textTransform: 'uppercase',
                }}
              >
                {isAr ? '⚡ السيرة الذاتية المهنية' : '⚡ Professional Resume'}
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: '26px',
                  fontWeight: 900,
                  letterSpacing: isAr ? 'normal' : '0.04em',
                  color: '#ffffff',
                  lineHeight: 1.15,
                }}
              >
                {name}
              </h1>

              <div
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: '#93c5fd',
                  marginTop: '4px',
                }}
              >
                {title}
              </div>
            </div>
          </div>

          <div
            style={{
              textAlign: isAr ? 'left' : 'right',
              fontSize: '11.5px',
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
              <span>✉️</span>
              <strong style={{ color: '#ffffff' }}>{email}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
              <span>📍</span>
              <span>{location}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
              <span>🐙</span>
              <span>{github}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: isAr ? 'flex-start' : 'flex-end' }}>
              <span>💼</span>
              <span>{linkedin}</span>
            </div>
          </div>
        </div>
      </header>

      {/* BODY - DUAL COLUMN LAYOUT */}
      <div style={{ display: 'flex', flexDirection: isAr ? 'row-reverse' : 'row', minHeight: '800px' }}>
        
        {/* SIDEBAR COLUMN (34% width) */}
        <aside
          style={{
            width: '34%',
            backgroundColor: '#f8fafc',
            borderRight: isAr ? 'none' : '1px solid #e2e8f0',
            borderLeft: isAr ? '1px solid #e2e8f0' : 'none',
            padding: '1.75rem 1.4rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Quick Info Block */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#1e3a8a',
                borderBottom: '2px solid #bfdbfe',
                paddingBottom: '4px',
                marginBottom: '10px',
                letterSpacing: '0.04em',
              }}
            >
              {isAr ? 'البيانات الشخصية' : 'Personal Info'}
            </h3>

            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{isAr ? 'الخبرة العملية:' : 'Experience:'}</span>
                <strong style={{ color: '#0f172a' }}>{expYears}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{isAr ? 'حالة التوفر:' : 'Availability:'}</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>{status}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{isAr ? 'اللغات:' : 'Languages:'}</span>
                <span style={{ color: '#334155' }}>{languages}</span>
              </div>
            </div>
          </div>

          {/* Technical Skills by Category */}
          {categories.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h3
                style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#1e3a8a',
                  borderBottom: '2px solid #bfdbfe',
                  paddingBottom: '4px',
                  marginBottom: '12px',
                  letterSpacing: '0.04em',
                }}
              >
                {isAr ? 'المهارات التقنية' : 'Core Skills'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categories.map((cat, cIdx) => {
                  const catTitle = isAr ? (cat.title_ar || cat.title_en) : (cat.title_en || cat.title_ar)
                  return (
                    <div key={cIdx} style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e40af', marginBottom: '6px' }}>
                        {cat.icon || '⚡'} {catTitle}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {(cat.skills || []).map((sk, sIdx) => (
                          <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <span style={{ color: '#334155' }}>{sk.name}</span>
                            <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '10px' }}>{sk.level}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tech Badges Cloud */}
          {tags.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h3
                style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#1e3a8a',
                  borderBottom: '2px solid #bfdbfe',
                  paddingBottom: '4px',
                  marginBottom: '10px',
                  letterSpacing: '0.04em',
                }}
              >
                {isAr ? 'وسوم التقنيات' : 'Tech Cloud'}
              </h3>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {tags.map((tg, tIdx) => (
                  <span
                    key={tIdx}
                    style={{
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {tg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Services Offered */}
          {servicesList.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: '12.5px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#1e3a8a',
                  borderBottom: '2px solid #bfdbfe',
                  paddingBottom: '4px',
                  marginBottom: '10px',
                  letterSpacing: '0.04em',
                }}
              >
                {isAr ? 'الخدمات المتخصصة' : 'Specializations'}
              </h3>

              <ul style={{ margin: 0, paddingLeft: isAr ? 0 : '16px', paddingRight: isAr ? '16px' : 0, fontSize: '11.5px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {servicesList.slice(0, 5).map((srv, idx) => {
                  const sTitle = isAr ? (srv.title_ar || srv.title_en) : (srv.title_en || srv.title_ar)
                  return (
                    <li key={idx} style={{ marginBottom: '2px' }}>
                      <strong>{sTitle}</strong>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT COLUMN (66% width) */}
        <main
          style={{
            width: '66%',
            padding: '1.75rem 2rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Executive Summary */}
          <section style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '14px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#1e3a8a',
                borderBottom: '2px solid #2563eb',
                paddingBottom: '5px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>👤</span> {isAr ? 'الملخص المهني' : 'Executive Profile'}
            </h2>

            <p style={{ margin: 0, color: '#334155', fontSize: '12.5px', lineHeight: 1.6 }}>
              {summary}
            </p>
            {summary2 && (
              <p style={{ marginTop: '8px', color: '#475569', fontSize: '12px', lineHeight: 1.6 }}>
                {summary2}
              </p>
            )}
          </section>

          {/* Professional Experience Timeline */}
          {experiences.length > 0 && (
            <section style={{ marginBottom: '2rem' }}>
              <h2
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#1e3a8a',
                  borderBottom: '2px solid #2563eb',
                  paddingBottom: '5px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>💼</span> {isAr ? 'الخبرات المهنية ومحطات العمل' : 'Professional Experience'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {experiences.map((exp, eIdx) => {
                  const expTitle = isAr ? (exp.title_ar || exp.title_en) : (exp.title_en || exp.title_ar)
                  const expCompany = isAr ? (exp.company_ar || exp.company_en) : (exp.company_en || exp.company_ar)
                  const expLoc = isAr ? (exp.location_ar || exp.location_en) : (exp.location_en || exp.location_ar)
                  const expDesc = isAr ? (exp.description_ar || exp.description_en) : (exp.description_en || exp.description_ar)
                  const techs = Array.isArray(exp.technologies) ? exp.technologies : []

                  const dateStr = exp.is_current
                    ? `${exp.start_date || '2022'} - ${isAr ? 'حتى الآن' : 'Present'}`
                    : `${exp.start_date || ''} - ${exp.end_date || ''}`

                  return (
                    <div
                      key={eIdx}
                      style={{
                        position: 'relative',
                        paddingLeft: isAr ? 0 : '12px',
                        paddingRight: isAr ? '12px' : 0,
                        borderLeft: isAr ? 'none' : '3px solid #3b82f6',
                        borderRight: isAr ? '3px solid #3b82f6' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                        <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>
                          {expTitle}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#2563eb',
                            background: '#eff6ff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {dateStr}
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, marginTop: '2px', marginBottom: '6px' }}>
                        🏢 {expCompany} {expLoc ? `• 📍 ${expLoc}` : ''}
                      </div>

                      {expDesc && (
                        <p style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '12px', lineHeight: 1.55 }}>
                          {expDesc}
                        </p>
                      )}

                      {techs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                          {techs.map((t, ti) => (
                            <span
                              key={ti}
                              style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: '3px',
                                fontWeight: 500,
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Key Featured Projects */}
          {featuredProjects.length > 0 && (
            <section style={{ marginBottom: '1.5rem' }}>
              <h2
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#1e3a8a',
                  borderBottom: '2px solid #2563eb',
                  paddingBottom: '5px',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🚀</span> {isAr ? 'أبرز المشاريع البرمجية' : 'Key Projects'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {featuredProjects.map((p, pIdx) => {
                  const locP = getLocalizedProject(p, isAr ? 'ar' : 'en')
                  const pTechs = Array.isArray(p.technologies) ? p.technologies : []
                  return (
                    <div
                      key={pIdx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a' }}>
                          {locP.title}
                        </span>
                        {p.featured && (
                          <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            ⭐ {isAr ? 'مميز' : 'Featured'}
                          </span>
                        )}
                      </div>

                      {locP.description && (
                        <p style={{ margin: '4px 0 6px', color: '#475569', fontSize: '11.5px', lineHeight: 1.45 }}>
                          {locP.description}
                        </p>
                      )}

                      {pTechs.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {pTechs.slice(0, 5).map((t, ti) => (
                            <span key={ti} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', fontSize: '9.5px', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* FOOTER VERIFICATION */}
          <footer
            style={{
              borderTop: '1px dashed #cbd5e1',
              paddingTop: '8px',
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10px',
              color: '#94a3b8',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img src="/logo.png" alt="Logo" style={{ width: '15px', height: '15px', borderRadius: '50%' }} />
              <span>Hamza Eshtiba • Software Engineer Portfolio</span>
            </div>
            <span>{isAr ? 'الهوية الرسمية المعتمدة • تم التوليد رقمياً' : 'Official Verified Brand • Digitally Generated'}</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
