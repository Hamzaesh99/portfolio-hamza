import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Printer, X, Globe, Sparkles, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import CVDocument from './CVDocument.jsx'
import { downloadCvPdf } from '../../lib/cvPdfGenerator.js'

export default function CVModal({
  isOpen,
  onClose,
  initialLang = 'ar',
  hero = {},
  about = {},
  contact = {},
  skills = {},
  services = {},
  experience = {},
  projects = [],
}) {
  const [selectedLang, setSelectedLang] = useState(initialLang || 'ar')
  const [downloading, setDownloading] = useState(false)
  const cvDocRef = useRef(null)

  // Synchronize language with active portfolio language whenever changed or opened
  useEffect(() => {
    if (initialLang) {
      setSelectedLang(initialLang)
    }
  }, [initialLang, isOpen])

  const isAr = selectedLang === 'ar'

  const handleDownload = async () => {
    if (!cvDocRef.current) return
    setDownloading(true)
    const toastId = toast.loading(isAr ? 'جاري تجهيز وتنزيل السيرة الذاتية بصيغة PDF...' : 'Generating & downloading PDF CV...')

    try {
      const filename = isAr ? 'Hamza_Eshtiba_CV_AR.pdf' : 'Hamza_Eshtiba_CV_EN.pdf'
      await downloadCvPdf(cvDocRef.current, filename)
      toast.success(isAr ? 'تم تنزيل السيرة الذاتية بنجاح!' : 'CV downloaded successfully!', { id: toastId })
    } catch (err) {
      console.error('Failed to download CV PDF:', err)
      toast.error(isAr ? 'حدث خطأ أثناء تنزيل الـ PDF' : 'Failed to generate PDF', { id: toastId })
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="cv-modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(5, 10, 24, 0.82)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          style={{
            width: '100%',
            maxWidth: '920px',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg-secondary, #0f172a)',
            border: '1px solid var(--color-border, rgba(59, 130, 246, 0.25))',
            borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* TOP CONTROLS TOOLBAR */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderBottom: '1px solid var(--color-border, rgba(255, 255, 255, 0.1))',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📄</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                  {isAr ? 'السيرة الذاتية المهنية (CV)' : 'Professional Curriculum Vitae'}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {isAr ? 'مولدة تلقائياً بأحدث بيانات وهويتك البصرية' : 'Dynamically generated with brand identity'}
                </span>
              </div>
            </div>

            {/* Language switch & Download actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {/* Language toggle */}
              <div
                style={{
                  display: 'inline-flex',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '9999px',
                  padding: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedLang('ar')}
                  style={{
                    background: selectedLang === 'ar' ? 'var(--color-primary, #2563eb)' : 'transparent',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  🇸🇦 العربية
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLang('en')}
                  style={{
                    background: selectedLang === 'en' ? 'var(--color-primary, #2563eb)' : 'transparent',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  🇬🇧 English
                </button>
              </div>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-ghost btn-sm"
                style={{
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.82rem',
                }}
                title={isAr ? 'طباعة' : 'Print'}
              >
                <Printer size={15} />
                <span>{isAr ? 'طباعة' : 'Print'}</span>
              </button>

              {/* Download PDF Button */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 1.1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                }}
              >
                {downloading ? <Loader2 size={15} className="spin" /> : <Download size={15} />}
                <span>{downloading ? (isAr ? 'جاري التنزيل...' : 'Generating...') : (isAr ? 'تحميل بصيغة PDF' : 'Download PDF')}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm"
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  color: '#94a3b8',
                }}
                title={isAr ? 'إغلاق' : 'Close'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* SCROLLABLE PREVIEW AREA */}
          <div
            style={{
              padding: '1.5rem',
              overflowY: 'auto',
              backgroundColor: '#0b1120',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div ref={cvDocRef} style={{ width: '100%', maxWidth: '820px' }}>
              <CVDocument
                lang={selectedLang}
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
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
