import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { projectsAPI, uploadsAPI } from '../../lib/api.js'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'
import { autoTranslateArabic, getLocalizedProject } from '../../lib/projectTranslations.js'

const EMPTY_FORM = {
  title: '', title_en: '', description: '', description_en: '', long_description: '', long_description_en: '', technologies: '',
  github_url: '', live_url: '', featured: false, status: 'published',
  image_url: '', images: []
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

function imgUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function AdminProjects() {
  const qc = useQueryClient()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imagesList, setImagesList] = useState([]) // array of { id, url, file, preview }
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const fileInputRef = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => projectsAPI.getAllAdmin().then(r => r.data.projects),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-projects'] })
    qc.invalidateQueries({ queryKey: ['projects'] })
  }

  const createMutation = useMutation({
    mutationFn: (data) => projectsAPI.create(data),
    onSuccess: () => {
      toast.success(isAr ? 'تمت إضافة المشروع بنجاح! 🚀' : 'Project created! 🚀')
      closeModal()
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.error || (isAr ? 'فشل إنشاء المشروع' : 'Failed to create project')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectsAPI.update(id, data),
    onSuccess: () => {
      toast.success(isAr ? 'تم تحديث المشروع بنجاح!' : 'Project updated!')
      closeModal()
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.error || (isAr ? 'فشل تحديث المشروع' : 'Failed to update project')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => projectsAPI.delete(id),
    onSuccess: () => {
      toast.success(isAr ? 'تم حذف المشروع بنجاح.' : 'Project deleted.')
      setDeleteConfirm(null)
      invalidate()
    },
    onError: (err) => toast.error(err.response?.data?.error || (isAr ? 'فشل حذف المشروع' : 'Failed to delete')),
  })

  const toggleFeatured = useMutation({
    mutationFn: (id) => projectsAPI.toggleFeatured(id),
    onSuccess: () => { invalidate() },
  })

  const openAdd = () => {
    setSelected(null)
    setForm(EMPTY_FORM)
    setImagesList([])
    setUrlInput('')
    setModal('add')
  }

  const openEdit = (project) => {
    setSelected(project)
    const locEn = getLocalizedProject(project, 'en')
    setForm({
      title: project.title || '',
      title_en: project.title_en || locEn.title || '',
      description: project.description || '',
      description_en: project.description_en || locEn.description || '',
      long_description: project.long_description || '',
      long_description_en: project.long_description_en || locEn.long_description || '',
      technologies: Array.isArray(project.technologies) ? project.technologies.join(', ') : '',
      github_url: project.github_url || '',
      live_url: project.live_url || '',
      featured: project.featured || false,
      status: project.status || 'published',
      image_url: project.image_url || '',
      images: Array.isArray(project.images) ? project.images : [],
    })

    const existingImages = Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : (project.image_url ? [project.image_url] : [])

    setImagesList(existingImages.slice(0, 5).map((url, idx) => ({
      id: `existing-${idx}-${Date.now()}`,
      url: url,
      file: null,
      preview: imgUrl(url)
    })))

    setUrlInput('')
    setModal('edit')
  }

  const closeModal = () => {
    setModal(null)
    setSelected(null)
    setImagesList([])
    setUrlInput('')
  }

  // Handle adding files (up to 5 total)
  const addFilesToList = (files) => {
    if (!files || files.length === 0) return
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (valid.length === 0) {
      toast.error(isAr ? 'يرجى اختيار ملفات صور صالحة (PNG, JPG, WebP).' : 'Please choose valid image files.')
      return
    }

    setImagesList(prev => {
      const remaining = 5 - prev.length
      if (remaining <= 0) {
        toast.error(isAr ? 'الحد الأقصى هو 5 صور لكل مشروع.' : 'Maximum 5 images per project.')
        return prev
      }

      const toAdd = valid.slice(0, remaining).map((file, idx) => ({
        id: `new-${Date.now()}-${idx}`,
        url: null,
        file: file,
        preview: URL.createObjectURL(file)
      }))

      if (valid.length > remaining) {
        toast(isAr ? `تمت إضافة ${remaining} صور فقط لاكتمال الحد الأقصى (5 صور).` : `Added ${remaining} images (max 5 reached).`, { icon: 'ℹ️' })
      } else {
        toast.success(isAr ? `تمت إضافة ${toAdd.length} صورة إلى الألبوم.` : `Added ${toAdd.length} image(s).`)
      }

      return [...prev, ...toAdd]
    })
  }

  const handleImageChange = (e) => {
    addFilesToList(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      addFilesToList(e.dataTransfer.files)
    }
  }

  // Add direct image URL
  const handleAddUrl = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) return
    if (imagesList.length >= 5) {
      toast.error(isAr ? 'الحد الأقصى هو 5 صور لكل مشروع.' : 'Maximum 5 images per project.')
      return
    }
    setImagesList(prev => [
      ...prev,
      {
        id: `url-${Date.now()}`,
        url: trimmed,
        file: null,
        preview: imgUrl(trimmed)
      }
    ])
    setUrlInput('')
    toast.success(isAr ? 'تمت إضافة الرابط إلى ألبوم المشروع.' : 'Image URL added to album.')
  }

  // Remove single image
  const handleRemoveImage = (index) => {
    setImagesList(prev => prev.filter((_, idx) => idx !== index))
  }

  // Set image as primary cover (move to position 0)
  const handleSetCover = (index) => {
    if (index === 0) return
    setImagesList(prev => {
      const next = [...prev]
      const [chosen] = next.splice(index, 1)
      next.unshift(chosen)
      return next
    })
    toast.success(isAr ? 'تم تعيين الصورة كغلاف رئيسي للمشروع ⭐' : 'Set as primary project cover ⭐')
  }

  // Upload all pending image files
  const uploadAllImages = async () => {
    if (imagesList.length === 0) return []
    setUploading(true)
    setUploadProgress(0)

    const finalUrls = []
    try {
      for (let i = 0; i < imagesList.length; i++) {
        const item = imagesList[i]
        if (item.file) {
          const fd = new FormData()
          fd.append('image', item.file)
          const res = await uploadsAPI.uploadImage(fd)
          if (res.data?.url) {
            finalUrls.push(res.data.url)
          }
        } else if (item.url) {
          finalUrls.push(item.url)
        }
        setUploadProgress(Math.round(((i + 1) * 100) / imagesList.length))
      }
      return finalUrls
    } catch (err) {
      toast.error(isAr ? 'فشل رفع بعض صور المشروع.' : 'Failed to upload some project images.')
      throw err
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleAutoTranslate = (e) => {
    e?.preventDefault()
    if (!form.title && !form.description) {
      toast.error(isAr ? 'يرجى كتابة عنوان ووصف المشروع بالعربية أولاً.' : 'Please enter Arabic title and description first.')
      return
    }
    const tTitle = autoTranslateArabic(form.title)
    const tDesc = autoTranslateArabic(form.description)
    const tLong = form.long_description ? autoTranslateArabic(form.long_description) : ''
    setForm(f => ({
      ...f,
      title_en: tTitle,
      description_en: tDesc,
      long_description_en: tLong || tDesc,
    }))
    toast.success(isAr ? 'تم توليد الترجمة الإنجليزية تلقائياً بنجاح! 🌐' : 'English translations generated! 🌐')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.technologies) {
      toast.error(isAr ? 'يرجى تعبئة الحقول المطلوبة (العنوان، الوصف، والتقنيات).' : 'Please fill in required fields.')
      return
    }

    try {
      const finalUrls = await uploadAllImages()
      const finalTitleEn = form.title_en?.trim() || autoTranslateArabic(form.title)
      const finalDescEn = form.description_en?.trim() || autoTranslateArabic(form.description)
      const finalLongEn = form.long_description_en?.trim() || (form.long_description ? autoTranslateArabic(form.long_description) : '')
      const payload = {
        ...form,
        title_en: finalTitleEn,
        description_en: finalDescEn,
        long_description_en: finalLongEn,
        images: finalUrls,
        image_url: finalUrls[0] || '',
        technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean),
      }

      if (modal === 'add') {
        createMutation.mutate(payload)
      } else {
        updateMutation.mutate({ id: selected.id, data: payload })
      }
    } catch {}
  }

  const projects = data || []
  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>{isAr ? 'المشاريع البرمجية' : 'Projects'}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {isAr
              ? `إجمالي المشاريع: ${projects.length}`
              : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button id="add-project-btn" className="btn btn-primary" onClick={openAdd}>
          {isAr ? '➕ إضافة مشروع جديد' : '➕ Add Project'}
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h3 className="empty-title">{isAr ? 'لا توجد مشاريع مضافة حتى الآن' : 'No projects yet'}</h3>
          <p className="empty-desc" style={{ color: 'var(--color-text-muted)' }}>
            {isAr ? 'أضف أول مشروع لك للبدء في عرضه وإدارته على الموقع' : 'Add your first project to get started'}
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={openAdd}>
            {isAr ? 'إضافة أول مشروع' : 'Add First Project'}
          </button>
        </div>
      ) : (
        <div className="admin-table-wrapper card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{isAr ? 'الصور' : 'Images'}</th>
                <th>{isAr ? 'عنوان المشروع' : 'Title'}</th>
                <th>{isAr ? 'التقنيات' : 'Technologies'}</th>
                <th>{isAr ? 'الروابط' : 'Links'}</th>
                <th>{isAr ? 'مميز' : 'Featured'}</th>
                <th>{isAr ? 'الحالة' : 'Status'}</th>
                <th>{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => {
                const totalImages = (project.images && project.images.length > 0)
                  ? project.images.length
                  : (project.image_url ? 1 : 0)
                const cover = project.image_url || (project.images && project.images[0])

                return (
                  <tr key={project.id}>
                    <td>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        {cover ? (
                          <img
                            src={imgUrl(cover)}
                            alt={project.title}
                            className="project-thumbnail"
                          />
                        ) : (
                          <div className="project-thumbnail" style={{
                            background: 'var(--color-bg-tertiary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.25rem'
                          }}>
                            💻
                          </div>
                        )}
                        {totalImages > 1 && (
                          <span style={{
                            position: 'absolute',
                            bottom: '-4px',
                            right: isAr ? 'auto' : '-4px',
                            left: isAr ? '-4px' : 'auto',
                            background: 'rgba(30, 110, 255, 0.9)',
                            color: '#fff',
                            borderRadius: '9999px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.4rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                          }} title={isAr ? `${totalImages} صور للمشروع` : `${totalImages} project images`}>
                            🖼️ {totalImages}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{project.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.description}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '180px' }}>
                        {(project.technologies || []).slice(0, 3).map(t => (
                          <span key={t} className="tag tag-sm">{t}</span>
                        ))}
                        {(project.technologies || []).length > 3 && (
                          <span className="tag tag-sm">+{project.technologies.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--color-blue-light)', fontSize: '0.8rem' }}>
                            {isAr ? 'جيت هاب' : 'GitHub'}
                          </a>
                        )}
                        {project.live_url && (
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                            style={{ color: 'var(--color-blue-light)', fontSize: '0.8rem' }}>
                            {isAr ? 'معاينة' : 'Live'}
                          </a>
                        )}
                        {!project.github_url && !project.live_url && <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <button
                        className="toggle"
                        onClick={() => toggleFeatured.mutate(project.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        title={isAr ? 'تبديل التمييز' : 'Toggle featured'}
                      >
                        <div className={`toggle-track ${project.featured ? 'active' : ''}`}>
                          <div className="toggle-thumb" />
                        </div>
                      </button>
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                        background: project.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        color: project.status === 'published' ? 'var(--color-success)' : 'var(--color-warning)',
                        border: `1px solid ${project.status === 'published' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      }}>
                        {project.status === 'published' ? (isAr ? 'منشور' : 'published') : (isAr ? 'مسودة' : 'draft')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEdit(project)}
                          title={isAr ? 'تعديل المشروع' : 'Edit'}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteConfirm(project)}
                          title={isAr ? 'حذف المشروع' : 'Delete'}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{ maxWidth: '650px', width: '92%' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modal === 'add' ? (isAr ? '➕ إضافة مشروع جديد' : '➕ Add New Project') : (isAr ? '✏️ تعديل المشروع' : '✏️ Edit Project')}
              </h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  {/* 5-Images Project Album */}
                  <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
                        {isAr ? 'ألبوم صور المشروع (حتى 5 صور)' : 'Project Images (up to 5)'}
                      </label>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: imagesList.length >= 5 ? 'var(--color-warning)' : 'var(--color-blue-light)',
                        background: 'rgba(30, 110, 255, 0.08)',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        border: '1px solid rgba(30, 110, 255, 0.2)'
                      }}>
                        {isAr ? `${imagesList.length} من 5 صور مضافة` : `${imagesList.length} / 5 images`}
                      </span>
                    </div>

                    {/* 5-Slots Visual Grid */}
                    <div className="project-slots-grid">
                      {[0, 1, 2, 3, 4].map((slotIdx) => {
                        const item = imagesList[slotIdx]
                        if (item) {
                          return (
                            <div
                              key={item.id || slotIdx}
                              style={{
                                position: 'relative',
                                aspectRatio: '1',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: slotIdx === 0 ? '2px solid #3b82f6' : '1px solid var(--color-border)',
                                background: 'var(--color-bg-tertiary)',
                                boxShadow: slotIdx === 0 ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none',
                              }}
                            >
                              <img
                                src={item.preview}
                                alt={`Slot ${slotIdx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />

                              {/* Slot label */}
                              <div style={{
                                position: 'absolute',
                                top: '3px',
                                left: isAr ? 'auto' : '3px',
                                right: isAr ? '3px' : 'auto',
                                background: slotIdx === 0 ? 'rgba(37, 99, 235, 0.95)' : 'rgba(0,0,0,0.7)',
                                color: '#fff',
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                padding: '0.1rem 0.35rem',
                                borderRadius: '4px',
                                zIndex: 2
                              }}>
                                {slotIdx === 0 ? (isAr ? 'الغلاف ⭐' : 'Cover ⭐') : `#${slotIdx + 1}`}
                              </div>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(slotIdx)}
                                title={isAr ? 'إزالة الصورة' : 'Remove'}
                                style={{
                                  position: 'absolute',
                                  top: '3px',
                                  right: isAr ? 'auto' : '3px',
                                  left: isAr ? '3px' : 'auto',
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: 'rgba(239, 68, 68, 0.9)',
                                  color: '#fff',
                                  border: 'none',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  zIndex: 3
                                }}
                              >
                                ×
                              </button>

                              {/* Set as cover button (if not already cover) */}
                              {slotIdx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCover(slotIdx)}
                                  title={isAr ? 'تعيين كصورة غلاف أولى' : 'Set as primary cover'}
                                  style={{
                                    position: 'absolute',
                                    bottom: '3px',
                                    right: '3px',
                                    left: '3px',
                                    background: 'rgba(0,0,0,0.75)',
                                    color: '#fef08a',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '0.65rem',
                                    padding: '0.15rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    zIndex: 2
                                  }}
                                >
                                  {isAr ? '⭐ كغلاف' : '⭐ Cover'}
                                </button>
                              )}
                            </div>
                          )
                        } else {
                          // Empty slot
                          return (
                            <div
                              key={`empty-${slotIdx}`}
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                aspectRatio: '1',
                                borderRadius: '8px',
                                border: '1px dashed var(--color-blue-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                background: 'rgba(30, 110, 255, 0.02)',
                                transition: 'all 0.2s ease',
                                textAlign: 'center',
                                color: 'var(--color-text-muted)'
                              }}
                              title={isAr ? `خانة صورة ${slotIdx + 1} - اضغط للإضافة` : `Slot ${slotIdx + 1} - Click to add`}
                            >
                              <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>➕</span>
                              <span style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>#{slotIdx + 1}</span>
                            </div>
                          )
                        }
                      })}
                    </div>

                    {/* Upload Drop Zone */}
                    {imagesList.length < 5 && (
                      <div
                        className="upload-area"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        style={{
                          padding: '1.1rem',
                          marginBottom: '0.75rem',
                          cursor: 'pointer',
                          borderRadius: '10px',
                          border: '2px dashed var(--color-blue-border)',
                          background: 'rgba(30, 110, 255, 0.03)'
                        }}
                      >
                        <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>🖼️</div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)', marginBottom: '0.15rem', fontWeight: 600 }}>
                          {isAr ? 'انقر لاختيار عدة صور دفعة واحدة أو اسحبها وأفلتها هنا' : 'Click to select up to 5 images or drag and drop'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                          {isAr ? `يدعم PNG, JPG, WebP — متبقي لك إضافة ${5 - imagesList.length} صور` : `Supports PNG, JPG, WebP — ${5 - imagesList.length} slots remaining`}
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />

                    {/* Direct Image URL input */}
                    {imagesList.length < 5 && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="url"
                          className="form-input"
                          style={{ flex: 1, padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
                          value={urlInput}
                          onChange={e => setUrlInput(e.target.value)}
                          placeholder={isAr ? 'أو ألصق رابط صورة مباشر واضغط إضافة...' : 'Or enter direct image URL...'}
                          dir="ltr"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddUrl();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={handleAddUrl}
                          style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                          ➕ {isAr ? 'إضافة الرابط' : 'Add URL'}
                        </button>
                      </div>
                    )}

                    {uploading && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <div className="skill-bar">
                          <div className="skill-bar-fill" style={{ width: `${uploadProgress || 100}%` }} />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-blue-light)', marginTop: '0.25rem', textAlign: 'center' }}>
                          {isAr ? `جاري رفع صور المشروع... ${uploadProgress}%` : `Uploading project images... ${uploadProgress}%`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="form-group">
                    <label className="form-label">{isAr ? 'عنوان المشروع (بالعربية) *' : 'Title (Arabic) *'}</label>
                    <input
                      type="text" className="form-input"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder={isAr ? 'مثال: منصة توليد الصور بالذكاء الاصطناعي' : 'My Awesome Project'}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label className="form-label">{isAr ? 'الوصف المختصر (بالعربية) *' : 'Short Description (Arabic) *'}</label>
                    <textarea
                      className="form-textarea" rows={3}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder={isAr ? 'نبذة موجزة توضح فكرة وأهمية المشروع...' : 'Brief description of the project...'}
                      required
                    />
                  </div>

                  {/* Automated English Translation Box */}
                  <div style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#93c5fd' }}>
                        🌐 {isAr ? 'الترجمة الإنجليزية (تظهر تلقائياً لزوار الموقع بالإنجليزي)' : 'English Translation'}
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoTranslate}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        ⚡ {isAr ? 'توليد الترجمة تلقائياً' : 'Auto-translate'}
                      </button>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>
                        {isAr ? 'عنوان المشروع بالإنجليزية' : 'English Project Title'}
                      </label>
                      <input
                        type="text" className="form-input"
                        value={form.title_en}
                        onChange={e => setForm(f => ({ ...f, title_en: e.target.value }))}
                        placeholder="e.g. Smart Real Estate Platform"
                        dir="ltr"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>
                        {isAr ? 'الوصف بالإنجليزية' : 'English Short Description'}
                      </label>
                      <textarea
                        className="form-textarea" rows={2}
                        value={form.description_en}
                        onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))}
                        placeholder="e.g. An innovative system built to manage..."
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="form-group">
                    <label className="form-label">
                      {isAr ? 'التقنيات المستخدمة * ' : 'Technologies * '}
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        ({isAr ? 'مفصولة بفاصلة' : 'comma separated'})
                      </span>
                    </label>
                    <input
                      type="text" className="form-input"
                      value={form.technologies}
                      onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))}
                      placeholder={isAr ? 'React, Node.js, Python, Tailwind' : 'React, Node.js, SQLite'}
                      required
                    />
                  </div>

                  {/* Links */}
                  <div className="cms-grid-2col">
                    <div className="form-group">
                      <label className="form-label">{isAr ? 'رابط GitHub' : 'GitHub URL'}</label>
                      <input
                        type="url" className="form-input"
                        value={form.github_url}
                        onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))}
                        placeholder="https://github.com/..."
                        dir="ltr"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{isAr ? 'رابط المعاينة الحية' : 'Live Demo URL'}</label>
                      <input
                        type="url" className="form-input"
                        value={form.live_url}
                        onChange={e => setForm(f => ({ ...f, live_url: e.target.value }))}
                        placeholder="https://example.com"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Status + Featured */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">{isAr ? 'حالة النشر' : 'Status'}</label>
                      <select
                        className="form-select"
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      >
                        <option value="published">{isAr ? 'منشور (ظاهر في الموقع)' : 'Published'}</option>
                        <option value="draft">{isAr ? 'مسودة (مخفي حالياً)' : 'Draft'}</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{isAr ? 'مشروع مميز' : 'Featured'}</label>
                      <label className="toggle" style={{ marginTop: '0.75rem', cursor: 'pointer' }}>
                        <div className={`toggle-track ${form.featured ? 'active' : ''}`}
                          onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}>
                          <div className="toggle-thumb" />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginRight: isAr ? '0.5rem' : 0, marginLeft: isAr ? 0 : '0.5rem' }}>
                          {form.featured ? (isAr ? 'مميز ⭐' : 'Featured ⭐') : (isAr ? 'غير مميز' : 'Not featured')}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPending || uploading}
                  id={modal === 'add' ? 'create-project-submit' : 'update-project-submit'}
                >
                  {isPending || uploading
                    ? (isAr ? 'جاري الحفظ والرفع...' : 'Saving & Uploading...')
                    : (modal === 'add' ? (isAr ? 'حفظ وإضافة المشروع' : 'Create Project') : (isAr ? 'حفظ التغييرات' : 'Save Changes'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{isAr ? '🗑️ تأكيد حذف المشروع' : '🗑️ Delete Project'}</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                {isAr ? (
                  <>هل أنت متأكد من رغبتك في حذف <strong>"{deleteConfirm.title}"</strong>؟ لا يمكن التراجع عن هذا الإجراء نهائياً.</>
                ) : (
                  <>Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? This action cannot be undone.</>
                )}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                id="confirm-delete-btn"
                className="btn btn-danger"
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (isAr ? 'جاري الحذف...' : 'Deleting...') : (isAr ? 'حذف المشروع' : 'Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
