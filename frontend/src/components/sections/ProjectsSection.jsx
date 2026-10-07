import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { projectsAPI } from '../../lib/api.js'
import { useInView } from '../hooks/useInView.js'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getImageUrl(url) {
  if (!url) return null
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return `${API_URL.replace('/api', '')}${url.startsWith('/') ? '' : '/'}${url}`
}

function normalizeUrl(url) {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

/* ==========================================================================
   ProjectPreviewModal: Full details and multi-image gallery popup
   ========================================================================== */
function ProjectPreviewModal({ project, isAr, onClose }) {
  if (!project) return null

  const images = (Array.isArray(project.images) && project.images.length > 0)
    ? project.images
    : (project.image_url ? [project.image_url] : [])

  const [activeImg, setActiveImg] = useState(0)

  // Arrow navigation:
  // In Arabic: Left advances to NEXT image, Right returns to PREVIOUS image.
  const handleLeftClick = (e) => {
    e?.stopPropagation()
    if (isAr) {
      setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    } else {
      setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }
  }

  const handleRightClick = (e) => {
    e?.stopPropagation()
    if (isAr) {
      setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    } else {
      setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') handleLeftClick()
      if (e.key === 'ArrowRight') handleRightClick()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [images.length, isAr])

  const currentSrc = images[activeImg] ? getImageUrl(images[activeImg]) : null

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5, 7, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="modal"
        style={{
          background: 'var(--color-bg-secondary, #121826)',
          border: '1px solid var(--color-border, rgba(255,255,255,0.12))',
          borderRadius: '1.25rem',
          maxWidth: '780px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.5rem',
          borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #fff)' }}>
              {project.title}
            </h3>
            {project.featured && (
              <span style={{
                background: 'rgba(234, 179, 8, 0.15)',
                color: '#eab308',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}>
                ⭐ {isAr ? 'مميز' : 'Featured'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--color-text-muted, #aaa)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              transition: 'all 0.2s',
            }}
            title={isAr ? 'إغلاق' : 'Close'}
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Main Image Display with Carousel */}
          <div style={{
            position: 'relative',
            borderRadius: '1rem',
            overflow: 'hidden',
            background: '#090d16',
            minHeight: '260px',
            maxHeight: '440px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {currentSrc ? (
              <img
                src={currentSrc}
                alt={`${project.title} - ${activeImg + 1}`}
                style={{
                  width: '100%',
                  maxHeight: '440px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{ fontSize: '3rem', padding: '3rem' }}>💻</div>
            )}

            {/* Counter Badge */}
            {images.length > 1 && (
              <div
                dir="ltr"
                style={{
                  position: 'absolute',
                  top: '14px',
                  left: isAr ? '14px' : 'auto',
                  right: isAr ? 'auto' : '14px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  backdropFilter: 'blur(6px)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  zIndex: 3,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                📷 {isAr ? `${activeImg + 1} من ${images.length}` : `${activeImg + 1} / ${images.length}`}
              </div>
            )}

            {/* Carousel Arrows */}
            {images.length > 1 && (
              <>
                {/* Left Button */}
                <button
                  type="button"
                  onClick={handleLeftClick}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '12px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 4,
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.2s ease',
                  }}
                  title={isAr ? 'الصورة التالية' : 'Previous image'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>

                {/* Right Button */}
                <button
                  type="button"
                  onClick={handleRightClick}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '12px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.25)',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 4,
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.2s ease',
                  }}
                  title={isAr ? 'الصورة السابقة' : 'Next image'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Thumbnails row if multiple images */}
          {images.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '0.6rem',
              marginTop: '0.8rem',
              overflowX: 'auto',
              paddingBottom: '0.4rem',
              justifyContent: 'center',
            }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImg(idx)}
                  style={{
                    border: activeImg === idx ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
                    padding: '2px',
                    borderRadius: '8px',
                    background: 'transparent',
                    cursor: 'pointer',
                    opacity: activeImg === idx ? 1 : 0.65,
                    transform: activeImg === idx ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={getImageUrl(img)}
                    alt=""
                    style={{
                      width: '64px',
                      height: '44px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      display: 'block',
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Project Info */}
          <div style={{ marginTop: '1.4rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary, #fff)' }}>
              {isAr ? 'عن المشروع' : 'About the Project'}
            </h4>
            <p style={{
              color: 'var(--color-text-secondary, #cbd5e1)',
              lineHeight: 1.7,
              fontSize: '0.95rem',
              whiteSpace: 'pre-line',
              margin: 0,
            }}>
              {project.long_description || project.description}
            </p>
          </div>

          {/* Technologies */}
          {Array.isArray(project.technologies) && project.technologies.length > 0 && (
            <div style={{ marginTop: '1.4rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--color-text-primary, #fff)' }}>
                {isAr ? 'التقنيات المستخدمة' : 'Technologies Used'}
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {project.technologies.map(tech => (
                  <span
                    key={tech}
                    style={{
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#60a5fa',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div style={{
          padding: '1.2rem 1.5rem',
          borderTop: '1px solid var(--color-border, rgba(255,255,255,0.1))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'rgba(0,0,0,0.15)',
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {project.live_url && (
              <a
                href={normalizeUrl(project.live_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <span>{isAr ? 'زيارة الموقع مباشرة ↗' : 'Visit Live Demo ↗'}</span>
              </a>
            )}
            {project.github_url && (
              <a
                href={normalizeUrl(project.github_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
          >
            {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ==========================================================================
   ProjectCard: Grid item with multi-image gallery & preview trigger
   ========================================================================== */
function ProjectCard({ project, index, isAr, onPreview }) {
  const images = (Array.isArray(project.images) && project.images.length > 0)
    ? project.images
    : (project.image_url ? [project.image_url] : [])

  const [activeImg, setActiveImg] = useState(0)

  // Arrow navigation:
  // In Arabic (RTL): Left arrow advances to NEXT image, Right arrow returns to PREVIOUS image.
  // In English (LTR): Right arrow advances to NEXT image, Left arrow returns to PREVIOUS image.
  const handleLeftClick = (e) => {
    e.stopPropagation()
    if (isAr) {
      setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    } else {
      setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }
  }

  const handleRightClick = (e) => {
    e.stopPropagation()
    if (isAr) {
      setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    } else {
      setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }
  }

  const currentSrc = images[activeImg] ? getImageUrl(images[activeImg]) : null

  return (
    <motion.div
      layout
      className="card project-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {/* Image Container with Slider */}
      <div
        className="project-image"
        style={{ position: 'relative', cursor: 'pointer' }}
        onClick={() => onPreview(project)}
      >
        {currentSrc ? (
          <img src={currentSrc} alt={`${project.title} - ${activeImg + 1}`} loading="lazy" />
        ) : (
          <div className="project-image-placeholder">💻</div>
        )}

        {/* Featured Badge */}
        {project.featured && (
          <div className="project-featured-badge">⭐ {isAr ? 'مميز' : 'Featured'}</div>
        )}

        {/* Image Counter Badge if multiple images */}
        {images.length > 1 && (
          <div
            dir="ltr"
            style={{
              position: 'absolute',
              top: '12px',
              right: isAr ? 'auto' : '12px',
              left: isAr ? '12px' : 'auto',
              background: 'rgba(0, 0, 0, 0.75)',
              color: '#fff',
              backdropFilter: 'blur(6px)',
              padding: '0.22rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.72rem',
              fontWeight: 700,
              zIndex: 3,
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            📷 {isAr ? `${activeImg + 1} من ${images.length}` : `${activeImg + 1} / ${images.length}`}
          </div>
        )}

        {/* Previous / Next Navigation Arrows if multiple images */}
        {images.length > 1 && (
          <>
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={handleLeftClick}
              style={{
                position: 'absolute',
                top: '50%',
                left: '8px',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 4,
                backdropFilter: 'blur(4px)',
                transition: 'all 0.2s ease',
              }}
              title={isAr ? 'الصورة التالية' : 'Previous image'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={handleRightClick}
              style={{
                position: 'absolute',
                top: '50%',
                right: '8px',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 4,
                backdropFilter: 'blur(4px)',
                transition: 'all 0.2s ease',
              }}
              title={isAr ? 'الصورة السابقة' : 'Next image'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Indicator Dots at bottom */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              zIndex: 3
            }}>
              {images.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveImg(dotIdx); }}
                  style={{
                    width: activeImg === dotIdx ? '16px' : '6px',
                    height: '6px',
                    borderRadius: '9999px',
                    background: activeImg === dotIdx ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title={`Image ${dotIdx + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="project-overlay">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPreview(project); }}
            className="btn btn-primary btn-sm"
          >
            👁️ {isAr ? 'معاينة المشروع' : 'Preview Project'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="project-body">
        <h3 className="project-title" onClick={() => onPreview(project)} style={{ cursor: 'pointer' }}>
          {project.title}
        </h3>
        <p className="project-desc">{project.description}</p>

        <div className="project-tags">
          {(project.technologies || []).map(tech => (
            <span key={tech} className="tag tag-sm">{tech}</span>
          ))}
        </div>

        {/* Action buttons: "معاينة المشروع" is ALWAYS available */}
        <div className="project-links" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => onPreview(project)}
            className="btn btn-primary btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
            }}
          >
            <span>{isAr ? 'معاينة المشروع' : 'Preview Project'}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          {project.live_url && (
            <a
              href={normalizeUrl(project.live_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              title={isAr ? 'زيارة الموقع مباشرة' : 'Live site link'}
            >
              <span>{isAr ? 'الموقع ↗' : 'Live ↗'}</span>
            </a>
          )}

          {project.github_url && (
            <a
              href={normalizeUrl(project.github_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ==========================================================================
   Main ProjectsSection Component
   ========================================================================== */
export default function ProjectsSection() {
  const [filter, setFilter] = useState('all')
  const [previewProject, setPreviewProject] = useState(null)
  const [ref, inView] = useInView({ threshold: 0.05 })
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll().then(r => r.data.projects),
  })

  const projects = data || []

  // Build filter tabs from technologies
  const allTechs = [...new Set(projects.flatMap(p => p.technologies || []))]
  const tabs = ['all', 'featured', ...allTechs.slice(0, 5)]

  const filtered = projects.filter(p => {
    if (filter === 'all') return true
    if (filter === 'featured') return p.featured
    return p.technologies?.includes(filter)
  })

  return (
    <section id="projects" className="section">
      <div className="container" ref={ref}>
        <div className="section-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="section-badge"><span>03</span> {isAr ? 'المشاريع البرمجية' : 'Projects'}</div>
            <h2 className="section-title">{isAr ? 'معرض أعمالي ومشاريعي' : 'My Work'}</h2>
            <p className="section-subtitle">
              {isAr
                ? 'مجموعة مختارة من المشاريع والتطبيقات التي طورتها، تمثل حلولاً عملية وتجارب رقمية متميزة'
                : "A selection of projects I've built — each one a story of problem-solving and creativity"}
            </p>
          </motion.div>
        </div>

        {/* Filter */}
        {!isLoading && projects.length > 0 && (
          <motion.div
            className="projects-filter"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {tabs.map(tab => (
              <button
                key={tab}
                className={`filter-btn ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab === 'all'
                  ? (isAr ? 'الكل' : 'All')
                  : tab === 'featured'
                  ? (isAr ? 'المميزة ⭐' : 'Featured ⭐')
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </motion.div>
        )}

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div className="loading-spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <h3 className="empty-title">{isAr ? 'لا توجد مشاريع مضافة بعد' : 'No projects yet'}</h3>
            <p className="empty-desc">{isAr ? 'ستظهر المشاريع هنا فور إضافتها من لوحة التحكم' : 'Projects will appear here once added from the Admin Dashboard'}</p>
          </div>
        ) : (
          <div className="projects-grid">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  isAr={isAr}
                  onPreview={(p) => setPreviewProject(p)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Project Preview Modal */}
      <AnimatePresence>
        {previewProject && (
          <ProjectPreviewModal
            project={previewProject}
            isAr={isAr}
            onClose={() => setPreviewProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

