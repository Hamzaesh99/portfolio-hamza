import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '../hooks/useInView.js'
import { useSiteSettings } from '../../context/SiteSettingsContext.jsx'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'
import { Download, Eye, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { projectsAPI } from '../../lib/api.js'
import { downloadCvPdf } from '../../lib/cvPdfGenerator.js'
import CVDocument from '../cv/CVDocument.jsx'
import CVModal from '../cv/CVModal.jsx'

export default function AboutSection() {
  const [ref, inView] = useInView({ threshold: 0.2 })
  const { hero, about, contact, skills, services, experience } = useSiteSettings()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const [showCVModal, setShowCVModal] = useState(false)
  const [downloadingCV, setDownloadingCV] = useState(false)
  const hiddenCvRef = useRef(null)

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll().then(r => r.data.projects).catch(() => []),
  })
  const projects = projectsData || []

  const handleDirectDownload = async () => {
    if (!hiddenCvRef.current) return
    setDownloadingCV(true)
    const toastId = toast.loading(isAr ? 'جاري تجهيز وتنزيل السيرة الذاتية (PDF)...' : 'Generating & downloading PDF CV...')

    try {
      const filename = isAr ? 'Hamza_Eshtiba_CV_AR.pdf' : 'Hamza_Eshtiba_CV_EN.pdf'
      await downloadCvPdf(hiddenCvRef.current, filename)
      toast.success(isAr ? 'تم تنزيل السيرة الذاتية بنجاح!' : 'CV downloaded successfully!', { id: toastId })
    } catch (err) {
      console.error('Failed to download CV PDF:', err)
      toast.error(isAr ? 'حدث خطأ أثناء تنزيل الـ PDF' : 'Failed to generate PDF', { id: toastId })
    } finally {
      setDownloadingCV(false)
    }
  }

  const infoItems = isAr
    ? [
        { label: 'الاسم', value: about?.name || 'Hamza Eshtiba' },
        { label: 'الموقع', value: about?.location || 'Libya 🇱🇾' },
        { label: 'البريد الإلكتروني', value: about?.email || 'hamza@eshtiba.com' },
        { label: 'الحالة', value: about?.status || '✅ متاح للمشاريع' },
        { label: 'الخبرة', value: about?.experience || '+3 سنوات' },
        { label: 'اللغات', value: about?.languages || 'العربية، الإنجليزية' },
      ]
    : [
        { label: 'Name', value: about?.name || 'Hamza Eshtiba' },
        { label: 'Location', value: about?.location || 'Libya 🇱🇾' },
        { label: 'Email', value: about?.email || 'hamza@eshtiba.com' },
        { label: 'Status', value: about?.status || '✅ Available' },
        { label: 'Experience', value: about?.experience || '3+ Years' },
        { label: 'Languages', value: about?.languages || 'Arabic, English' },
      ]

  return (
    <section id="about" className="section">
      <div className="container" ref={ref}>
        <div className="about-content">
          {/* Code Visual */}
          <motion.div
            className="about-image"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="about-image-card card">
              <div className="about-code-block">
                <div className="code-line"><span className="code-keyword">const</span><span className="code-var"> developer</span><span className="code-punct"> = {'{'}</span></div>
                <div className="code-line" style={{ paddingLeft: '1.5rem' }}><span className="code-var">name</span><span className="code-punct">: </span><span className="code-string">"{about?.name || 'Hamza Eshtiba'}"</span><span className="code-punct">,</span></div>
                <div className="code-line" style={{ paddingLeft: '1.5rem' }}><span className="code-var">role</span><span className="code-punct">: </span><span className="code-string">"Software Engineer"</span><span className="code-punct">,</span></div>
                <div className="code-line" style={{ paddingLeft: '1.5rem' }}><span className="code-var">location</span><span className="code-punct">: </span><span className="code-string">"{about?.location || 'Libya 🇱🇾'}"</span><span className="code-punct">,</span></div>
                <div className="code-line" style={{ paddingLeft: '1.5rem' }}><span className="code-var">experience</span><span className="code-punct">: </span><span className="code-number">3</span><span className="code-punct">,</span></div>
                <div className="code-line" style={{ paddingLeft: '1.5rem' }}>
                  <span className="code-var">stack</span><span className="code-punct">: [</span>
                </div>
                {['React', 'Node.js', 'TypeScript', 'SQL'].map((tech, i) => (
                  <div key={i} className="code-line" style={{ paddingLeft: '3rem' }}>
                    <span className="code-string">"{tech}"</span>
                    {i < 3 && <span className="code-punct">,</span>}
                  </div>
                ))}
                <div className="code-line" style={{ paddingLeft: '1.5rem' }}><span className="code-punct">],</span></div>
                <div className="code-line" style={{ paddingLeft: '1.5rem' }}><span className="code-var">available</span><span className="code-punct">: </span><span className="code-keyword">true</span></div>
                <div className="code-line"><span className="code-punct">{'}'}</span></div>
                <div className="code-line" style={{ marginTop: '0.5rem' }}>
                  <span className="code-comment">// Always learning, always building</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            className="about-text"
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="section-badge">
              <span>01</span> {isAr ? (about?.badge_text_ar || 'نبذة عني') : (about?.badge_text_en || 'About Me')}
            </div>
            <h2 className="section-title">
              {isAr ? (about?.title_line1_ar || 'مطور شغوف،') : (about?.title_line1_en || 'Passionate Developer,')}<br />
              <span style={{ color: 'var(--color-blue-light)' }}>
                {isAr ? (about?.title_line2_ar || 'مبتكر للحلول البرمجية') : (about?.title_line2_en || 'Problem Solver')}
              </span>
            </h2>

            <p>
              {isAr
                ? (about?.p1_ar || 'أنا حمزة اشطيبه، مهندس برمجيات بخبرة تزيد عن 3 سنوات في بناء تطبيقات الويب الحديثة. متخصص في تطوير Full-Stack مع شغف بالكود النظيف والبنية البرمجية الأنيقة.')
                : (about?.p1_en || "I'm Hamza Eshtiba, a Software Engineer with over 3 years of experience building modern web applications. I specialize in full-stack development with a passion for clean code and elegant architecture.")}
            </p>
            <p>
              {isAr
                ? (about?.p2_ar || 'من تصميم واجهات بصرية دقيقة إلى بناء واجهات برمجة تطبيقات (APIs) قوية، أحول الأفكار إلى واقع بدقة وإبداع. أؤمن بأن البرمجيات العظيمة تُبنى عند التقاء التميز التقني بتجربة المستخدم الاستثنائية.')
                : (about?.p2_en || 'From crafting pixel-perfect UIs to designing robust backend APIs, I bring ideas to life with precision and creativity. I believe great software is built at the intersection of technical excellence and great user experience.')}
            </p>

            <div className="about-info-grid">
              {infoItems.map(({ label, value }) => (
                <div key={label} className="about-info-item">
                  <span className="about-info-label">{label}</span>
                  <span className="about-info-value">{value}</span>
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS: Download CV, Preview CV, Hire Me */}
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleDirectDownload}
                disabled={downloadingCV}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.4rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 18px rgba(37, 99, 235, 0.45)',
                  cursor: 'pointer',
                }}
              >
                {downloadingCV ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
                <span>{downloadingCV ? (isAr ? 'جاري التحميل...' : 'Downloading...') : (isAr ? 'تحميل السيرة الذاتية' : 'Download CV')}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCVModal(true)}
                className="btn btn-outline"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.65rem 1.15rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title={isAr ? 'معاينة السيرة الذاتية واختيار اللغة والطباعة' : 'Preview CV, select language, and print'}
              >
                <Eye size={16} />
                <span>{isAr ? 'معاينة السيرة الذاتية' : 'Preview CV'}</span>
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '0.65rem 1.1rem',
                  cursor: 'pointer',
                }}
              >
                {isAr ? 'تواصل معي' : 'Hire Me'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hidden off-screen document for instant PDF export */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '820px',
          opacity: 1,
          pointerEvents: 'none',
          zIndex: -1000,
        }}
      >
        <div ref={hiddenCvRef}>
          <CVDocument
            key={`cv-hidden-${lang}`}
            lang={lang}
            hero={hero}
            about={about}
            contact={contact}
            skills={skills}
            services={services}
            experience={experience}
            projects={projects}
          />
        </div>
      </div>

      {/* Interactive CV Modal for visual preview, language toggle, and printing */}
      <CVModal
        key={`cv-modal-${lang}`}
        isOpen={showCVModal}
        onClose={() => setShowCVModal(false)}
        initialLang={lang}
        hero={hero}
        about={about}
        contact={contact}
        skills={skills}
        services={services}
        experience={experience}
        projects={projects}
      />
    </section>
  )
}
