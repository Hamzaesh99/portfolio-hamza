import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Save, Upload, RotateCcw, ExternalLink, Image, Sparkles, Layers, User, Phone, Check, Code2, Wrench, Briefcase, Plus, Trash2, X, Pencil, ArrowUp, ArrowDown } from 'lucide-react'
import { useSiteSettings, DEFAULT_SKILLS_SETTINGS, DEFAULT_SERVICES_SETTINGS, DEFAULT_EXPERIENCE_SETTINGS } from '../../context/SiteSettingsContext.jsx'
import { useThemeLanguage } from '../../context/ThemeLanguageContext.jsx'
import { uploadsAPI } from '../../lib/api.js'
import defaultHeroPhoto from '../../assets/hero.jpg'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

function formatPhotoSrc(url) {
  if (!url || !url.trim()) return defaultHeroPhoto
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed
  }
  return `${API_BASE}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`
}

export default function AdminCMS({ defaultTab }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { settings, updateSettings, refreshSettings } = useSiteSettings()
  const { lang } = useThemeLanguage()
  const isAr = lang === 'ar'

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')

  // Resolve activeTab from defaultTab prop, query param, or pathname
  const resolveTab = () => {
    if (defaultTab) return defaultTab
    if (tabParam) return tabParam
    if (location.pathname.includes('/admin/skills')) return 'skills'
    if (location.pathname.includes('/admin/services')) return 'services'
    if (location.pathname.includes('/admin/experience')) return 'experience'
    return 'visibility'
  }

  const [activeTab, setActiveTab] = useState(resolveTab)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [tempPreview, setTempPreview] = useState(null)
  const fileInputRef = useRef(null)

  // Local draft state
  const [visibility, setVisibility] = useState(settings.sections_visibility || {})
  const [hero, setHero] = useState(settings.hero_settings || {})
  const [about, setAbout] = useState(settings.about_settings || {})
  const [contact, setContact] = useState(settings.contact_settings || {})
  const [skills, setSkills] = useState(settings.skills_settings || DEFAULT_SKILLS_SETTINGS)
  const [services, setServices] = useState(settings.services_settings || DEFAULT_SERVICES_SETTINGS)
  const [experience, setExperience] = useState(settings.experience_settings || DEFAULT_EXPERIENCE_SETTINGS)
  const [newTagInput, setNewTagInput] = useState('')
  const [editingTagIdx, setEditingTagIdx] = useState(null)
  const [editingTagValue, setEditingTagValue] = useState('')
  const [newExpTechInputs, setNewExpTechInputs] = useState({})

  // Sync tab whenever URL or defaultTab changes
  useEffect(() => {
    const nextTab = resolveTab()
    if (nextTab !== activeTab) {
      setActiveTab(nextTab)
    }
  }, [defaultTab, tabParam, location.pathname])

  const handleSelectTab = (tabKey) => {
    setActiveTab(tabKey)
    if (tabKey === 'skills') {
      navigate('/admin/skills')
    } else if (tabKey === 'services') {
      navigate('/admin/services')
    } else if (tabKey === 'experience') {
      navigate('/admin/experience')
    } else if (tabKey === 'visibility') {
      navigate('/admin/sections')
    } else {
      navigate(`/admin/sections?tab=${tabKey}`)
    }
  }

  useEffect(() => {
    if (settings) {
      setVisibility(settings.sections_visibility || {})
      setHero(settings.hero_settings || {})
      setAbout(settings.about_settings || {})
      setContact(settings.contact_settings || {})

      const s = settings.skills_settings || {}
      setSkills({
        ...DEFAULT_SKILLS_SETTINGS,
        ...s,
        categories: Array.isArray(s.categories) && s.categories.length > 0 ? s.categories : DEFAULT_SKILLS_SETTINGS.categories,
        tags: Array.isArray(s.tags) ? s.tags : DEFAULT_SKILLS_SETTINGS.tags,
      })

      const srv = settings.services_settings || {}
      setServices({
        ...DEFAULT_SERVICES_SETTINGS,
        ...srv,
        services: Array.isArray(srv.services) && srv.services.length > 0 ? srv.services : DEFAULT_SERVICES_SETTINGS.services,
      })

      const exp = settings.experience_settings || {}
      setExperience({
        ...DEFAULT_EXPERIENCE_SETTINGS,
        ...exp,
        experiences: Array.isArray(exp.experiences) && exp.experiences.length > 0 ? exp.experiences : DEFAULT_EXPERIENCE_SETTINGS.experiences,
      })
    }
  }, [settings])

  // Save all settings to DB
  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings({
        sections_visibility: visibility,
        hero_settings: hero,
        about_settings: about,
        contact_settings: contact,
        skills_settings: skills,
        services_settings: services,
        experience_settings: experience,
      })
      toast.success(isAr ? 'تم حفظ جميع التعديلات بنجاح!' : 'All changes saved successfully!')
    } catch (err) {
      toast.error((isAr ? 'حدث خطأ أثناء حفظ التعديلات: ' : 'Failed to save changes: ') + (err.response?.data?.error || err.message))
    } finally {
      setSaving(false)
    }
  }

  // Toggle single section
  const handleToggleSection = (key) => {
    setVisibility((prev) => {
      const updated = { ...prev, [key]: prev[key] === false ? true : false }
      toast.success(
        updated[key]
          ? (isAr ? 'تم تفعيل ظهور القسم (اضغط حفظ التعديلات للتثبيت)' : 'Section enabled (click Save Changes to persist)')
          : (isAr ? 'تم إخفاء القسم (اضغط حفظ التعديلات للتثبيت)' : 'Section hidden (click Save Changes to persist)')
      )
      return updated
    })
  }

  // Helper to immediately persist photo change to database
  const savePhotoChange = async (newUrl) => {
    const updatedHero = { ...hero, photo_url: newUrl }
    setHero(updatedHero)
    await updateSettings({
      sections_visibility: visibility,
      hero_settings: updatedHero,
      about_settings: about,
      contact_settings: contact,
      skills_settings: skills,
      services_settings: services,
      experience_settings: experience,
    })
  }

  // Category helpers for Skills
  const handleAddCategory = () => {
    const newCat = {
      id: `cat-${Date.now()}`,
      icon: '⚡',
      title_en: 'New Category',
      title_ar: 'تصنيف جديد',
      skills: [
        { name: isAr ? 'مهارة جديدة' : 'New Skill', level: 85 }
      ],
    }
    setSkills(prev => ({
      ...prev,
      categories: [...(prev.categories || []), newCat]
    }))
    toast.success(isAr ? 'تمت إضافة تصنيف مهارات جديد' : 'New skill category added')
  }

  const handleDeleteCategory = (catIdx) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا التصنيف وكافة مهاراته؟' : 'Are you sure you want to delete this category and all its skills?')) {
      setSkills(prev => ({
        ...prev,
        categories: (prev.categories || []).filter((_, idx) => idx !== catIdx)
      }))
      toast.success(isAr ? 'تم حذف التصنيف' : 'Category deleted')
    }
  }

  const handleUpdateCategory = (catIdx, field, val) => {
    setSkills(prev => {
      const nextCats = [...(prev.categories || [])]
      if (!nextCats[catIdx]) return prev
      nextCats[catIdx] = { ...nextCats[catIdx], [field]: val }
      return { ...prev, categories: nextCats }
    })
  }

  const handleAddSkillToCategory = (catIdx) => {
    setSkills(prev => {
      const nextCats = [...(prev.categories || [])]
      if (!nextCats[catIdx]) return prev
      const curSkills = Array.isArray(nextCats[catIdx].skills) ? nextCats[catIdx].skills : []
      nextCats[catIdx] = {
        ...nextCats[catIdx],
        skills: [...curSkills, { name: isAr ? 'مهارة جديدة' : 'New Skill', level: 80 }]
      }
      return { ...prev, categories: nextCats }
    })
    toast.success(isAr ? 'تمت إضافة مهارة جديدة' : 'New skill added')
  }

  const handleUpdateSkill = (catIdx, skillIdx, field, val) => {
    setSkills(prev => {
      const nextCats = [...(prev.categories || [])]
      if (!nextCats[catIdx]) return prev
      const curSkills = [...(nextCats[catIdx].skills || [])]
      if (!curSkills[skillIdx]) return prev
      curSkills[skillIdx] = { ...curSkills[skillIdx], [field]: val }
      nextCats[catIdx] = { ...nextCats[catIdx], skills: curSkills }
      return { ...prev, categories: nextCats }
    })
  }

  const handleDeleteSkill = (catIdx, skillIdx) => {
    setSkills(prev => {
      const nextCats = [...(prev.categories || [])]
      if (!nextCats[catIdx]) return prev
      nextCats[catIdx] = {
        ...nextCats[catIdx],
        skills: (nextCats[catIdx].skills || []).filter((_, idx) => idx !== skillIdx)
      }
      return { ...prev, categories: nextCats }
    })
    toast.success(isAr ? 'تم حذف المهارة' : 'Skill removed')
  }

  const handleAddTag = () => {
    if (!newTagInput.trim()) return
    const tag = newTagInput.trim()
    setSkills(prev => {
      const curTags = Array.isArray(prev.tags) ? prev.tags : []
      if (curTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
        toast.error(isAr ? 'هذا الوسم موجود مسبقاً' : 'Tag already exists')
        return prev
      }
      return { ...prev, tags: [...curTags, tag] }
    })
    setNewTagInput('')
  }

  const handleRemoveTag = (tagIdx) => {
    setSkills(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, idx) => idx !== tagIdx)
    }))
    if (editingTagIdx === tagIdx) {
      setEditingTagIdx(null)
      setEditingTagValue('')
    }
  }

  const handleStartEditTag = (tagIdx, currentVal) => {
    setEditingTagIdx(tagIdx)
    setEditingTagValue(currentVal)
  }

  const handleSaveEditTag = (tagIdx) => {
    const trimmed = editingTagValue.trim()
    if (!trimmed) {
      toast.error(isAr ? 'لا يمكن أن يكون اسم الوسم فارغاً' : 'Tag name cannot be empty')
      return
    }
    setSkills(prev => {
      const curTags = [...(prev.tags || [])]
      if (curTags.some((t, i) => i !== tagIdx && t.toLowerCase() === trimmed.toLowerCase())) {
        toast.error(isAr ? 'يوجد وسم آخر بنفس هذا الاسم' : 'Another tag with this name already exists')
        return prev
      }
      curTags[tagIdx] = trimmed
      return { ...prev, tags: curTags }
    })
    setEditingTagIdx(null)
    setEditingTagValue('')
    toast.success(isAr ? 'تم تعديل الوسم بنجاح' : 'Tag updated successfully')
  }

  const handleCancelEditTag = () => {
    setEditingTagIdx(null)
    setEditingTagValue('')
  }

  const handleToggleTagsVisibility = () => {
    setSkills(prev => ({
      ...prev,
      show_tags: prev.show_tags === false ? true : false
    }))
  }

  const handleClearAllTags = () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف كافة الوسوم؟' : 'Are you sure you want to clear all tags?')) {
      setSkills(prev => ({ ...prev, tags: [] }))
      setEditingTagIdx(null)
      setEditingTagValue('')
      toast.success(isAr ? 'تم مسح كافة الوسوم' : 'All tags cleared')
    }
  }

  const handleRestoreDefaultTags = () => {
    setSkills(prev => ({ ...prev, tags: [...DEFAULT_SKILLS_SETTINGS.tags] }))
    setEditingTagIdx(null)
    setEditingTagValue('')
    toast.success(isAr ? 'تمت استعادة الوسوم الافتراضية' : 'Default tags restored')
  }

  // Service helpers
  const handleAddService = () => {
    const newService = {
      id: `srv-${Date.now()}`,
      icon: '🚀',
      title_en: 'New Service',
      title_ar: 'خدمة جديدة',
      description_en: 'Description of the service in English...',
      description_ar: 'وصف الخدمة المقدمة باللغة العربية...',
    }
    setServices(prev => ({
      ...prev,
      services: [...(prev.services || []), newService]
    }))
    toast.success(isAr ? 'تمت إضافة خدمة جديدة' : 'New service added')
  }

  const handleUpdateService = (idx, field, val) => {
    setServices(prev => {
      const nextList = [...(prev.services || [])]
      if (!nextList[idx]) return prev
      nextList[idx] = { ...nextList[idx], [field]: val }
      return { ...prev, services: nextList }
    })
  }

  const handleDeleteService = (idx) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?')) {
      setServices(prev => ({
        ...prev,
        services: (prev.services || []).filter((_, i) => i !== idx)
      }))
      toast.success(isAr ? 'تم حذف الخدمة' : 'Service deleted')
    }
  }

  // Experience helpers
  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      title_en: 'Full Stack Engineer',
      title_ar: 'مهندس برمجيات متكامل',
      company_en: 'Company / Freelance',
      company_ar: 'شركة / عمل حر',
      location_en: 'Remote',
      location_ar: 'عن بُعد',
      start_date: '2023',
      end_date: '',
      is_current: true,
      description_en: 'Description of key achievements and responsibilities...',
      description_ar: 'وصف المهام المنجزة والمسؤوليات الرئيسية...',
      technologies: ['React', 'Node.js', 'SQL'],
    }
    setExperience(prev => ({
      ...prev,
      experiences: [newExp, ...(prev.experiences || [])]
    }))
    toast.success(isAr ? 'تمت إضافة خبرة جديدة' : 'New experience added')
  }

  const handleUpdateExperience = (idx, field, val) => {
    setExperience(prev => {
      const nextList = [...(prev.experiences || [])]
      if (!nextList[idx]) return prev
      nextList[idx] = { ...nextList[idx], [field]: val }
      return { ...prev, experiences: nextList }
    })
  }

  const handleDeleteExperience = (idx) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذه الخبرة؟' : 'Are you sure you want to delete this experience?')) {
      setExperience(prev => ({
        ...prev,
        experiences: (prev.experiences || []).filter((_, i) => i !== idx)
      }))
      toast.success(isAr ? 'تم حذف الخبرة' : 'Experience deleted')
    }
  }

  // Move helpers
  const handleMoveCategory = (catIdx, direction) => {
    setSkills(prev => {
      const list = [...(prev.categories || [])]
      const targetIdx = direction === 'up' ? catIdx - 1 : catIdx + 1
      if (targetIdx < 0 || targetIdx >= list.length) return prev
      const temp = list[catIdx]
      list[catIdx] = list[targetIdx]
      list[targetIdx] = temp
      return { ...prev, categories: list }
    })
  }

  const handleMoveSkill = (catIdx, skillIdx, direction) => {
    setSkills(prev => {
      const nextCats = [...(prev.categories || [])]
      if (!nextCats[catIdx]) return prev
      const list = [...(nextCats[catIdx].skills || [])]
      const targetIdx = direction === 'up' ? skillIdx - 1 : skillIdx + 1
      if (targetIdx < 0 || targetIdx >= list.length) return prev
      const temp = list[skillIdx]
      list[skillIdx] = list[targetIdx]
      list[targetIdx] = temp
      nextCats[catIdx] = { ...nextCats[catIdx], skills: list }
      return { ...prev, categories: nextCats }
    })
  }

  const handleMoveService = (idx, direction) => {
    setServices(prev => {
      const list = [...(prev.services || [])]
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= list.length) return prev
      const temp = list[idx]
      list[idx] = list[targetIdx]
      list[targetIdx] = temp
      return { ...prev, services: list }
    })
  }

  const handleMoveExperience = (idx, direction) => {
    setExperience(prev => {
      const list = [...(prev.experiences || [])]
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= list.length) return prev
      const temp = list[idx]
      list[idx] = list[targetIdx]
      list[targetIdx] = temp
      return { ...prev, experiences: list }
    })
  }

  // Technology Tag Helpers for Experience
  const handleAddExpTech = (eIdx) => {
    const raw = (newExpTechInputs[eIdx] || '').trim()
    if (!raw) return
    const additions = raw.split(',').map(s => s.trim()).filter(Boolean)
    setExperience(prev => {
      const list = [...(prev.experiences || [])]
      if (!list[eIdx]) return prev
      const cur = Array.isArray(list[eIdx].technologies) ? list[eIdx].technologies : []
      const merged = [...cur]
      for (const t of additions) {
        if (!merged.includes(t)) merged.push(t)
      }
      list[eIdx] = { ...list[eIdx], technologies: merged }
      return { ...prev, experiences: list }
    })
    setNewExpTechInputs(prev => ({ ...prev, [eIdx]: '' }))
  }

  const handleRemoveExpTech = (eIdx, tIdx) => {
    setExperience(prev => {
      const list = [...(prev.experiences || [])]
      if (!list[eIdx]) return prev
      const cur = Array.isArray(list[eIdx].technologies) ? list[eIdx].technologies : []
      list[eIdx] = {
        ...list[eIdx],
        technologies: cur.filter((_, idx) => idx !== tIdx)
      }
      return { ...prev, experiences: list }
    })
  }

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'skills':
        return {
          icon: '⚡',
          title: isAr ? 'إدارة المهارات التقنية وسحابة الوسوم' : 'Technical Skills & Tech Cloud',
          desc: isAr ? 'تحكم كامل في تصنيفات المهارات البرمجية، نسب الكفاءة، وسحابة وسوم التقنيات.' : 'Manage skill categories, proficiency levels, and tech tags cloud.'
        }
      case 'services':
        return {
          icon: '🛠️',
          title: isAr ? 'إدارة الخدمات المقدمة والحلول البرمجية' : 'Provided Services Management',
          desc: isAr ? 'إضافة وتعديل بطاقات الخدمات التي تقدمها، الأيقونات، والعناوين والشروحات.' : 'Manage service cards, icons, headings, and detailed descriptions.'
        }
      case 'experience':
        return {
          icon: '💼',
          title: isAr ? 'إدارة الخبرات والمسيرة المهنية' : 'Experience & Career Timeline',
          desc: isAr ? 'إدارة المحطات الوظيفية والخبرات، التواريخ، الشركات، والتقنيات المستخدمة.' : 'Manage career timeline items, job titles, dates, companies, and technologies.'
        }
      case 'hero':
        return {
          icon: '✨',
          title: isAr ? 'قسم البداية والصورة الشخصية' : 'Hero Section & Portrait',
          desc: isAr ? 'تعديل نصوص شاشة الترحيب الرئيسية والصورة الشخصية وأزرار التفاعل.' : 'Edit hero headlines, bio callout, and personal profile photo.'
        }
      case 'about':
        return {
          icon: '👤',
          title: isAr ? 'قسم نبذة عني' : 'About Me Section',
          desc: isAr ? 'تعديل الفقرات التعريفية وشبكة البيانات الشخصية وكود المطور.' : 'Manage bio paragraphs, personal info grid, and code card.'
        }
      case 'contact':
        return {
          icon: '📬',
          title: isAr ? 'قسم التواصل والشبكات' : 'Contact & Socials',
          desc: isAr ? 'تعديل روابط شبكات التواصل الاجتماعي وعناوين التواصل المباشر.' : 'Manage social media profiles, email, and location details.'
        }
      default:
        return {
          icon: '🎨',
          title: isAr ? 'التحكم في أقسام ومحتوى الموقع' : 'Sections & Content Management',
          desc: isAr ? 'تحكم كامل في إظهار أو إخفاء أي قسم، وتعديل كافة النصوص، وتغيير الصور مباشرة.' : 'Fully customize section visibility, edit headings, and update photos directly.'
        }
    }
  }

  // Photo upload with auto-save
  const handlePhotoUpload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error(isAr ? 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP).' : 'Please select a valid image file.')
      return
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error(isAr ? 'حجم الصورة يتجاوز 25 ميجابايت.' : 'Image exceeds 25MB limit.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    // Instant local preview for immediate visual feedback
    const objectUrl = URL.createObjectURL(file)
    setTempPreview(objectUrl)

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await uploadsAPI.uploadImage(formData, setUploadProgress)
      if (res.data?.url) {
        await savePhotoChange(res.data.url)
        setTempPreview(null)
        toast.success(isAr ? 'تم رفع وحفظ صورتك الشخصية بنجاح! 🎉' : 'Profile photo uploaded and saved! 🎉')
      }
    } catch (err) {
      setTempPreview(null)
      toast.error((isAr ? 'فشل رفع الصورة: ' : 'Photo upload failed: ') + (err.response?.data?.error || err.message))
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Apply & save direct URL
  const handleSaveDirectUrl = async () => {
    const url = (hero.photo_url || '').trim()
    if (!url) {
      toast.error(isAr ? 'يرجى إدخال رابط صورة صالح أولاً.' : 'Please enter a valid image URL first.')
      return
    }
    setSavingPhoto(true)
    try {
      await savePhotoChange(url)
      setTempPreview(null)
      toast.success(isAr ? 'تم تطبيق وحفظ رابط الصورة بنجاح!' : 'Photo URL saved and applied!')
    } catch (err) {
      toast.error((isAr ? 'حدث خطأ: ' : 'Error: ') + (err.response?.data?.error || err.message))
    } finally {
      setSavingPhoto(false)
    }
  }

  // Reset to default photo with auto-save
  const handleResetToDefaultPhoto = async () => {
    setSavingPhoto(true)
    setTempPreview(null)
    try {
      await savePhotoChange('')
      toast.success(isAr ? 'تمت استعادة الصورة الافتراضية وحفظها بنجاح!' : 'Default photo restored and saved!')
    } catch (err) {
      toast.error((isAr ? 'حدث خطأ: ' : 'Error: ') + (err.response?.data?.error || err.message))
    } finally {
      setSavingPhoto(false)
    }
  }

  const sectionsList = isAr ? [
    { key: 'hero', title: 'قسم البداية الرئيسي', desc: 'الاسم الكبير، الصورة الشخصية، شارة التوفر، وأزرار التحويل' },
    { key: 'about', title: 'قسم نبذة عني', desc: 'النبذة التعريفية، كود المطور، وشبكة المعلومات الشخصية' },
    { key: 'skills', title: 'قسم المهارات التقنية', desc: 'قوائم المهارات البرمجية، نسب الخبرة، وسحابة التقنيات' },
    { key: 'projects', title: 'قسم المشاريع البرمجية', desc: 'معرض الأعمال والمشاريع البرمجية المنجزة' },
    { key: 'services', title: 'قسم الخدمات المقدمة', desc: 'بطاقات الخدمات والحلول البرمجية التي تقدمها' },
    { key: 'experience', title: 'قسم الخبرات والمسار', desc: 'المسار الزمني للخبرات العملية والمسار التعليمي' },
    { key: 'contact', title: 'قسم التواصل والرسائل', desc: 'نموذج إرسال الرسائل وبيانات الاتصال والشبكات' },
  ] : [
    { key: 'hero', title: 'Hero Section', desc: 'Brand name, main photo, availability badge, and action buttons' },
    { key: 'about', title: 'About Section', desc: 'Bio descriptions, developer code card, and personal info grid' },
    { key: 'skills', title: 'Skills Section', desc: 'Technical skill categories, proficiency levels, and tech tags' },
    { key: 'projects', title: 'Projects Section', desc: 'Showcase of portfolio projects and live links' },
    { key: 'services', title: 'Services Section', desc: 'Cards detailing software and development services offered' },
    { key: 'experience', title: 'Experience Section', desc: 'Timeline of professional experience and education' },
    { key: 'contact', title: 'Contact Section', desc: 'Message form, contact details, and social links' },
  ]

  const currentPhotoPreview = tempPreview || formatPhotoSrc(hero.photo_url)

  const headerInfo = getHeaderInfo()

  return (
    <div className="admin-cms-container">
      {/* Top Header */}
      <div className="admin-cms-header card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span>{headerInfo.icon}</span> {headerInfo.title}
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
              {headerInfo.desc}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ExternalLink size={14} />
              {isAr ? 'معاينة الموقع' : 'View Portfolio'}
            </a>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.4rem' }}
            >
              <Save size={16} />
              {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التعديلات' : 'Save Changes')}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="cms-tabs-bar" style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeTab === 'visibility' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSelectTab('visibility')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Eye size={14} />
            {isAr ? 'إظهار وإخفاء الأقسام' : 'Section Visibility'}
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'hero' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSelectTab('hero')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={14} />
            {isAr ? 'قسم البداية والصورة' : 'Hero & Portrait'}
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'about' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSelectTab('about')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <User size={14} />
            {isAr ? 'قسم نبذة عني' : 'About Section'}
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'skills' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSelectTab('skills')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Code2 size={14} />
            {isAr ? 'قسم المهارات التقنية' : 'Skills & Tech'}
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'services' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSelectTab('services')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Wrench size={14} />
            {isAr ? 'قسم الخدمات' : 'Services'}
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'experience' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSelectTab('experience')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Briefcase size={14} />
            {isAr ? 'قسم الخبرات والمسيرة' : 'Experience & Journey'}
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'contact' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => handleSelectTab('contact')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Phone size={14} />
            {isAr ? 'التواصل والشبكات' : 'Contact & Socials'}
          </button>
        </div>
      </div>

      {/* TAB 1: Section Visibility Toggles */}
      {activeTab === 'visibility' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {isAr ? 'التحكم في ظهور الأقسام على الصفحة الرئيسية' : 'Control Section Visibility on Home Page'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              {isAr
                ? 'الأقسام التي تقوم بإلغاء تفعيلها ستختفي تماماً وفوراً من الصفحة الرئيسية ومن شريط التنقل.'
                : 'Disabled sections will be immediately hidden from the home page and navigation bar.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sectionsList.map((sec) => {
              const isVisible = visibility[sec.key] !== false
              return (
                <div
                  key={sec.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.1rem 1.4rem',
                    background: isVisible ? 'rgba(30, 110, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isVisible ? 'rgba(59, 130, 246, 0.3)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>{sec.title}</span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          background: isVisible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isVisible ? 'var(--color-success)' : 'var(--color-error)',
                        }}
                      >
                        {isVisible ? (isAr ? 'ظاهر بالموقع' : 'Visible') : (isAr ? 'مخفي حالياً' : 'Hidden')}
                      </span>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', margin: 0 }}>
                      {sec.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => sec.key === 'projects' ? navigate('/admin/projects') : handleSelectTab(sec.key)}
                      className="btn btn-sm btn-ghost"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)' }}
                      title={isAr ? 'الانتقال إلى تعديل محتوى هذا القسم' : 'Jump to edit this section'}
                    >
                      <Pencil size={13} />
                      {isAr ? 'تعديل المحتوى' : 'Edit Content'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSection(sec.key)}
                      className={`btn btn-sm ${isVisible ? 'btn-primary' : 'btn-outline'}`}
                      style={{ minWidth: '95px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                    >
                      {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                      {isVisible ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '2rem', textAlign: isAr ? 'left' : 'right' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              <Save size={16} /> {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ إعدادات الرؤية' : 'Save Visibility Settings')}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Hero Section & Photo Editor */}
      {activeTab === 'hero' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Photo Management Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Image size={18} /> {isAr ? 'الصورة الشخصية الرئيسية' : 'Hero Portrait Photo'}
              </h3>
              {hero.photo_url ? (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
                  {isAr ? '✔ صورة مخصصة نشطة ومحفوظة' : '✔ Custom photo active & saved'}
                </span>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--color-blue-light)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 600 }}>
                  {isAr ? 'الصورة الافتراضية نشطة' : 'Default photo active'}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', alignItems: 'start' }}>
              {/* Photo Preview Column */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '200px',
                    height: '270px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '2px solid var(--color-blue-primary)',
                    boxShadow: '0 0 25px rgba(30, 110, 255, 0.35)',
                    margin: '0 auto 0.75rem',
                    position: 'relative',
                    background: 'var(--color-bg-tertiary)',
                  }}
                >
                  <img
                    src={currentPhotoPreview}
                    alt="Preview"
                    onError={(e) => {
                      e.currentTarget.src = defaultHeroPhoto
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 12%' }}
                  />
                  {uploading && (
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: '0.5rem', color: '#fff', fontSize: '0.85rem'
                    }}>
                      <div className="loading-spinner" style={{ width: '28px', height: '28px' }} />
                      <span>{uploadProgress > 0 ? `${uploadProgress}%` : (isAr ? 'جاري الرفع...' : 'Uploading...')}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  {hero.photo_url && (
                    <button
                      type="button"
                      onClick={handleResetToDefaultPhoto}
                      disabled={savingPhoto || uploading}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <RotateCcw size={13} />
                      {isAr ? 'استعادة الصورة الأصلية' : 'Restore Default Photo'}
                    </button>
                  )}
                  {hero.photo_url && (
                    <a
                      href={currentPhotoPreview}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.75rem', color: 'var(--color-blue-light)', textDecoration: 'underline' }}
                    >
                      {isAr ? 'فتح الصورة بالكامل' : 'View full size'}
                    </a>
                  )}
                </div>
              </div>

              {/* Upload & Link Controls Column */}
              <div>
                {/* Big Clickable Dropzone with full-coverage native input */}
                <div
                  style={{
                    position: 'relative',
                    border: '2px dashed var(--color-blue-border)',
                    borderRadius: '14px',
                    padding: '1.75rem 1.25rem',
                    textAlign: 'center',
                    background: 'rgba(30, 110, 255, 0.04)',
                    transition: 'all 0.2s ease',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (uploading) return
                    const file = e.dataTransfer.files?.[0]
                    if (file) handlePhotoUpload(file)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {/* Invisible native file input covering 100% of the box */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoUpload(file)
                      e.target.value = ''
                    }}
                    disabled={uploading}
                    title={isAr ? 'انقر لاختيار صورة من جهازك' : 'Click to choose image'}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: uploading ? 'wait' : 'pointer',
                      zIndex: 10,
                    }}
                  />

                  <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem', pointerEvents: 'none' }}>📷</div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)', marginBottom: '0.35rem', pointerEvents: 'none' }}>
                    {isAr ? 'انقر في أي مكان داخل هذا المربع لاختيار صورة أو اسحبها وأفلتها' : 'Click anywhere inside this box or drag and drop photo'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.85rem', pointerEvents: 'none' }}>
                    {isAr ? 'يدعم JPG, PNG, WEBP — حتى 25 ميجابايت (يتم الحفظ والتطبيق فوراً)' : 'Supports JPG, PNG, WEBP — up to 25MB (auto-saved & applied)'}
                  </p>
                  <div style={{ pointerEvents: 'none' }}>
                    <span
                      className="btn btn-outline btn-sm"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        borderColor: 'var(--color-blue-border)',
                        color: 'var(--color-blue-light)',
                        background: 'var(--color-bg-secondary)',
                      }}
                    >
                      📁 {isAr ? 'تصفح واختيار صورة من جهازك' : 'Browse & Choose Photo'}
                    </span>
                  </div>
                </div>

                {/* Visible Direct Standard File Chooser */}
                <div style={{
                  marginBottom: '1.25rem',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.45rem' }}>
                    {isAr ? 'أو يمكنك اختيار الملف مباشرة من هنا:' : 'Or choose file directly from here:'}
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoUpload(file)
                      e.target.value = ''
                    }}
                    disabled={uploading}
                    className="form-input"
                    style={{ padding: '0.5rem', width: '100%', cursor: 'pointer' }}
                  />
                </div>

                {uploading && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div className="skill-bar">
                      <div className="skill-bar-fill" style={{ width: `${uploadProgress || 100}%` }} />
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-blue-light)', marginTop: '0.35rem', textAlign: 'center' }}>
                      {isAr ? `جاري رفع وحفظ الصورة... ${uploadProgress ? uploadProgress + '%' : ''}` : `Uploading & saving photo... ${uploadProgress ? uploadProgress + '%' : ''}`}
                    </p>
                  </div>
                )}

                {/* Direct Image URL input */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">{isAr ? 'أو ضع رابط صورة مباشر (URL):' : 'Or enter direct image URL:'}</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input
                      type="url"
                      className="form-input"
                      style={{ flex: 1, minWidth: '220px' }}
                      value={hero.photo_url || ''}
                      onChange={(e) => setHero((h) => ({ ...h, photo_url: e.target.value }))}
                      placeholder="https://example.com/photo.jpg"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={handleSaveDirectUrl}
                      disabled={savingPhoto || uploading || !hero.photo_url?.trim()}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.25rem' }}
                    >
                      <Save size={15} />
                      {savingPhoto ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'تطبيق وحفظ الرابط' : 'Apply & Save')}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                    {isAr ? 'عند لصق رابط خارجي، اضغط على "تطبيق وحفظ الرابط" لحفظه في قاعدة البيانات.' : 'When pasting an external URL, click "Apply & Save" to store it.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Texts & Headings Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              {isAr ? 'نصوص وعناوين قسم البداية' : 'Hero Texts & Headings'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'الاسم الأول (بالشعار):' : 'Brand Name (Part 1):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.brand_first || ''}
                  onChange={(e) => setHero((h) => ({ ...h, brand_first: e.target.value }))}
                  placeholder="HAMZA"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isAr ? 'الاسم الثاني (بالشعار):' : 'Brand Name (Part 2):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.brand_last || ''}
                  onChange={(e) => setHero((h) => ({ ...h, brand_last: e.target.value }))}
                  placeholder="ESHTIBA"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'شارة التوفر (بالعربية):' : 'Availability Badge (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.badge_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, badge_ar: e.target.value }))}
                  placeholder="متاح للعمل الحر والمشاريع"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isAr ? 'شارة التوفر (بالإنجليزية):' : 'Availability Badge (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.badge_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, badge_en: e.target.value }))}
                  placeholder="AVAILABLE FOR FREELANCE"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'العنوان الوظيفي / التخصص (بالعربية):' : 'Specialty / Tagline (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.tagline_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, tagline_ar: e.target.value }))}
                  placeholder="مطور برمجيات وحلول رقمية متكاملة"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isAr ? 'العنوان الوظيفي / التخصص (بالإنجليزية):' : 'Specialty / Tagline (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.tagline_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, tagline_en: e.target.value }))}
                  placeholder="Full-Stack Developer & Software Engineer"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'الوصف التعريفي (بالعربية):' : 'Hero Description (Arabic):'}</label>
                <textarea
                  rows="3"
                  className="form-input"
                  value={hero.description_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, description_ar: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{isAr ? 'الوصف التعريفي (بالإنجليزية):' : 'Hero Description (English):'}</label>
                <textarea
                  rows="3"
                  className="form-input"
                  value={hero.description_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, description_en: e.target.value }))}
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              {isAr ? 'أزرار الإجراء الرئيسي:' : 'Call-To-Action (CTA) Buttons:'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'نص الزر الأول (عربي):' : 'Primary CTA (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.cta_primary_text_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, cta_primary_text_ar: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'نص الزر الأول (إنجليزي):' : 'Primary CTA (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.cta_primary_text_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, cta_primary_text_en: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'نص الزر الثاني (عربي):' : 'Secondary CTA (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.cta_secondary_text_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, cta_secondary_text_ar: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'نص الزر الثاني (إنجليزي):' : 'Secondary CTA (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.cta_secondary_text_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, cta_secondary_text_en: e.target.value }))}
                />
              </div>
            </div>

            {/* Experience Stats */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              {isAr ? 'إحصائيات الإنجاز والخبرة:' : 'Achievement & Experience Stats:'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Stat 1 */}
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <label className="form-label">{isAr ? 'الإحصائية 1 (القيمة):' : 'Stat 1 (Value):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.stat1_value || ''}
                  onChange={(e) => setHero((h) => ({ ...h, stat1_value: e.target.value }))}
                  style={{ marginBottom: '0.5rem' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder={isAr ? 'الوصف بالعربية' : 'Description in Arabic'}
                  value={hero.stat1_label_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, stat1_label_ar: e.target.value }))}
                  style={{ marginBottom: '0.5rem' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder={isAr ? 'الوصف بالإنجليزية' : 'Description in English'}
                  value={hero.stat1_label_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, stat1_label_en: e.target.value }))}
                />
              </div>

              {/* Stat 2 */}
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <label className="form-label">{isAr ? 'الإحصائية 2 (القيمة):' : 'Stat 2 (Value):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.stat2_value || ''}
                  onChange={(e) => setHero((h) => ({ ...h, stat2_value: e.target.value }))}
                  style={{ marginBottom: '0.5rem' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder={isAr ? 'الوصف بالعربية' : 'Description in Arabic'}
                  value={hero.stat2_label_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, stat2_label_ar: e.target.value }))}
                  style={{ marginBottom: '0.5rem' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder={isAr ? 'الوصف بالإنجليزية' : 'Description in English'}
                  value={hero.stat2_label_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, stat2_label_en: e.target.value }))}
                />
              </div>

              {/* Stat 3 */}
              <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                <label className="form-label">{isAr ? 'الإحصائية 3 (القيمة):' : 'Stat 3 (Value):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.stat3_value || ''}
                  onChange={(e) => setHero((h) => ({ ...h, stat3_value: e.target.value }))}
                  style={{ marginBottom: '0.5rem' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder={isAr ? 'الوصف بالعربية' : 'Description in Arabic'}
                  value={hero.stat3_label_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, stat3_label_ar: e.target.value }))}
                  style={{ marginBottom: '0.5rem' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder={isAr ? 'الوصف بالإنجليزية' : 'Description in English'}
                  value={hero.stat3_label_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, stat3_label_en: e.target.value }))}
                />
              </div>
            </div>

            {/* Floating Services Card Under Photo */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
              {isAr ? 'البطاقة العائمة أسفل صورتك:' : 'Floating Card Under Photo:'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'عنوان البطاقة (عربي):' : 'Card Title (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.hud_title_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, hud_title_ar: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'عنوان البطاقة (إنجليزي):' : 'Card Title (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={hero.hud_title_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, hud_title_en: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'نص البطاقة (عربي):' : 'Card Text (Arabic):'}</label>
                <textarea
                  rows="2"
                  className="form-input"
                  value={hero.hud_text_ar || ''}
                  onChange={(e) => setHero((h) => ({ ...h, hud_text_ar: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'نص البطاقة (إنجليزي):' : 'Card Text (English):'}</label>
                <textarea
                  rows="2"
                  className="form-input"
                  value={hero.hud_text_en || ''}
                  onChange={(e) => setHero((h) => ({ ...h, hud_text_en: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ textAlign: isAr ? 'left' : 'right' }}>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                <Save size={16} /> {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ تعديلات قسم البداية' : 'Save Hero Settings')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: About Section Editor */}
      {activeTab === 'about' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            {isAr ? 'تعديل نصوص وبيانات قسم نبذة عني' : 'About Me Section Content'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">{isAr ? 'الفقرة التعريفية الأولى (عربي):' : 'Bio Paragraph 1 (Arabic):'}</label>
              <textarea
                rows="3"
                className="form-input"
                value={about.p1_ar || ''}
                onChange={(e) => setAbout((a) => ({ ...a, p1_ar: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isAr ? 'الفقرة التعريفية الأولى (إنجليزي):' : 'Bio Paragraph 1 (English):'}</label>
              <textarea
                rows="3"
                className="form-input"
                value={about.p1_en || ''}
                onChange={(e) => setAbout((a) => ({ ...a, p1_en: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">{isAr ? 'الفقرة التعريفية الثانية (عربي):' : 'Bio Paragraph 2 (Arabic):'}</label>
              <textarea
                rows="3"
                className="form-input"
                value={about.p2_ar || ''}
                onChange={(e) => setAbout((a) => ({ ...a, p2_ar: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isAr ? 'الفقرة التعريفية الثانية (إنجليزي):' : 'Bio Paragraph 2 (English):'}</label>
              <textarea
                rows="3"
                className="form-input"
                value={about.p2_en || ''}
                onChange={(e) => setAbout((a) => ({ ...a, p2_en: e.target.value }))}
              />
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            {isAr ? 'شبكة المعلومات الشخصية:' : 'Personal Information Grid:'}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">{isAr ? 'الاسم الكامل:' : 'Full Name:'}</label>
              <input
                type="text"
                className="form-input"
                value={about.name || ''}
                onChange={(e) => setAbout((a) => ({ ...a, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isAr ? 'الموقع / البلد:' : 'Location / Country:'}</label>
              <input
                type="text"
                className="form-input"
                value={about.location || ''}
                onChange={(e) => setAbout((a) => ({ ...a, location: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isAr ? 'البريد الإلكتروني:' : 'Email Address:'}</label>
              <input
                type="email"
                className="form-input"
                value={about.email || ''}
                onChange={(e) => setAbout((a) => ({ ...a, email: e.target.value }))}
                dir="ltr"
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isAr ? 'حالة التوفر:' : 'Availability Status:'}</label>
              <input
                type="text"
                className="form-input"
                value={about.status || ''}
                onChange={(e) => setAbout((a) => ({ ...a, status: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isAr ? 'سنوات الخبرة:' : 'Years of Experience:'}</label>
              <input
                type="text"
                className="form-input"
                value={about.experience || ''}
                onChange={(e) => setAbout((a) => ({ ...a, experience: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{isAr ? 'رابط ملف CV مخصص (اختياري):' : 'Custom CV URL (Optional):'}</label>
              <input
                type="text"
                className="form-input"
                placeholder={isAr ? 'اتركه فارغاً للتوليد التلقائي لـ PDF بالهوية البصرية' : 'Leave empty for automatic branded PDF generation'}
                value={about.cv_url || ''}
                onChange={(e) => setAbout((a) => ({ ...a, cv_url: e.target.value }))}
                dir="ltr"
              />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                {isAr
                  ? '✨ يتم توليد السيرة الذاتية وتنسيقها تلقائياً بصيغة PDF بهويتك البصرية من بيانات الموقع (الخبرات، المهارات، والمشاريع).'
                  : '✨ Your CV is dynamically generated as a high-quality PDF directly from your website data.'}
              </span>
            </div>
          </div>

          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              <Save size={16} /> {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ تعديلات قسم نبذة عني' : 'Save About Settings')}
            </button>
          </div>
        </div>
      )}

      {/* TAB: Skills Management */}
      {activeTab === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Skills Section Header Settings */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>⚡</span> {isAr ? 'عناوين ونصوص قسم المهارات' : 'Skills Section Headings'}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  {isAr ? 'تعديل الشارة، العنوان الرئيسي، والوصف التمهيدي لقسم المهارات.' : 'Customize badge, main title, and subtitle for the skills section.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Save size={14} />
                {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ نصوص المهارات' : 'Save Headings')}
              </button>
            </div>

            <div className="cms-grid-2col">
              <div className="form-group">
                <label className="form-label">{isAr ? 'شارة القسم (عربي):' : 'Badge (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={skills?.badge_ar ?? ''}
                  onChange={(e) => setSkills((s) => ({ ...s, badge_ar: e.target.value }))}
                  placeholder={isAr ? 'المهارات التقنية' : 'Badge in Arabic'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'شارة القسم (إنجليزي):' : 'Badge (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={skills?.badge_en ?? ''}
                  onChange={(e) => setSkills((s) => ({ ...s, badge_en: e.target.value }))}
                  dir="ltr"
                  placeholder="Skills"
                />
              </div>
            </div>

            <div className="cms-grid-2col">
              <div className="form-group">
                <label className="form-label">{isAr ? 'العنوان الرئيسي (عربي):' : 'Section Title (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={skills?.title_ar ?? ''}
                  onChange={(e) => setSkills((s) => ({ ...s, title_ar: e.target.value }))}
                  placeholder={isAr ? 'الخبرات والمهارات البرمجية' : 'Title in Arabic'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'العنوان الرئيسي (إنجليزي):' : 'Section Title (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={skills?.title_en ?? ''}
                  onChange={(e) => setSkills((s) => ({ ...s, title_en: e.target.value }))}
                  dir="ltr"
                  placeholder="Technical Expertise"
                />
              </div>
            </div>

            <div className="cms-grid-2col" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'الوصف الفرعي (عربي):' : 'Subtitle (Arabic):'}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={skills?.subtitle_ar ?? ''}
                  onChange={(e) => setSkills((s) => ({ ...s, subtitle_ar: e.target.value }))}
                  placeholder={isAr ? 'التقنيات والأدوات التي أعتمد عليها في بناء تطبيقات ويب عصرية وقابلة للتوسع' : 'Subtitle in Arabic'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'الوصف الفرعي (إنجليزي):' : 'Subtitle (English):'}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={skills?.subtitle_en ?? ''}
                  onChange={(e) => setSkills((s) => ({ ...s, subtitle_en: e.target.value }))}
                  dir="ltr"
                  placeholder="Technologies and tools I use to build modern, scalable applications"
                />
              </div>
            </div>
          </div>

          {/* Categories & Skills Editor */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {isAr ? 'تصنيفات المهارات والنسب المئوية' : 'Skill Categories & Levels'}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {isAr ? 'إضافة وتعديل التصنيفات (مثل Frontend, Backend) والمهارات بداخل كل منها.' : 'Manage categories and individual skills with percentage levels.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCategory}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} />
                {isAr ? 'إضافة تصنيف جديد' : 'Add Category'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(skills.categories || []).map((cat, catIdx) => (
                <div
                  key={cat.id || catIdx}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  {/* Category Header Row */}
                  <div className="cms-cat-header-grid">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'أيقونة' : 'Icon'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cat.icon || '⚡'}
                        onChange={(e) => handleUpdateCategory(catIdx, 'icon', e.target.value)}
                        style={{ textAlign: 'center', fontSize: '1.2rem', padding: '0.4rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'اسم التصنيف (عربي)' : 'Title (AR)'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cat.title_ar || ''}
                        onChange={(e) => handleUpdateCategory(catIdx, 'title_ar', e.target.value)}
                        placeholder="مثال: تطوير الواجهات"
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'اسم التصنيف (إنجليزي)' : 'Title (EN)'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={cat.title_en || ''}
                        onChange={(e) => handleUpdateCategory(catIdx, 'title_en', e.target.value)}
                        placeholder="e.g. Frontend"
                        dir="ltr"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', alignSelf: 'flex-end', height: '42px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(catIdx, 'up')}
                        disabled={catIdx === 0}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0 0.4rem', height: '38px', opacity: catIdx === 0 ? 0.3 : 1 }}
                        title={isAr ? 'تحريك التصنيف للأعلى' : 'Move Category Up'}
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(catIdx, 'down')}
                        disabled={catIdx === (skills.categories || []).length - 1}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0 0.4rem', height: '38px', opacity: catIdx === (skills.categories || []).length - 1 ? 0.3 : 1 }}
                        title={isAr ? 'تحريك التصنيف للأسفل' : 'Move Category Down'}
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(catIdx)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-error)', height: '38px', padding: '0 0.5rem' }}
                        title={isAr ? 'حذف التصنيف' : 'Delete Category'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Skills inside Category */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.15)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        {isAr ? `مهارات هذا التصنيف (${(cat.skills || []).length}):` : `Skills (${(cat.skills || []).length}):`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddSkillToCategory(catIdx)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Plus size={13} /> {isAr ? 'إضافة مهارة' : 'Add Skill'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {(cat.skills || []).map((sk, sIdx) => (
                        <div
                          key={sIdx}
                          className="cms-skill-row-grid"
                        >
                          <input
                            type="text"
                            className="form-input"
                            value={sk.name || ''}
                            onChange={(e) => handleUpdateSkill(catIdx, sIdx, 'name', e.target.value)}
                            placeholder="اسم المهارة (مثل: React.js)"
                            style={{ height: '36px' }}
                          />

                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="5"
                            value={sk.level || 80}
                            onChange={(e) => handleUpdateSkill(catIdx, sIdx, 'level', Number(e.target.value))}
                            style={{ accentColor: 'var(--color-primary)' }}
                          />

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="form-input"
                              value={sk.level || 0}
                              onChange={(e) => handleUpdateSkill(catIdx, sIdx, 'level', Number(e.target.value))}
                              style={{ height: '36px', textAlign: 'center', padding: '0.2rem' }}
                            />
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>%</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveSkill(catIdx, sIdx, 'up')}
                              disabled={sIdx === 0}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0.2rem', opacity: sIdx === 0 ? 0.3 : 1 }}
                              title={isAr ? 'تحريك للأعلى' : 'Move Up'}
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSkill(catIdx, sIdx, 'down')}
                              disabled={sIdx === (cat.skills || []).length - 1}
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0.2rem', opacity: sIdx === (cat.skills || []).length - 1 ? 0.3 : 1 }}
                              title={isAr ? 'تحريك للأسفل' : 'Move Down'}
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSkill(catIdx, sIdx)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--color-error)', padding: '0.2rem' }}
                              title={isAr ? 'حذف المهارة' : 'Delete Skill'}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Tags Cloud */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                    {isAr ? 'سحابة وسوم التقنيات (Tech Tags)' : 'Technology Tags Cloud'}
                  </h3>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: (skills.show_tags !== false) ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: (skills.show_tags !== false) ? 'var(--color-success)' : 'var(--color-error)',
                    }}
                  >
                    {(skills.show_tags !== false) ? (isAr ? '✓ مفعل وظاهر بالموقع' : 'Visible on site') : (isAr ? '✗ معطل ومخفي عن الموقع' : 'Hidden from site')}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    ({(skills.tags || []).length} {isAr ? 'وسماً' : 'tags'})
                  </span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  {isAr ? 'الكلمات المفتاحية والتقنيات التي تظهر أسفل قسم المهارات. يمكنك تعديل أي وسم، حذفه، أو إخفاء السحابة كاملة.' : 'Keywords and badges displayed under skills. You can edit, delete, or hide the cloud.'}
                </p>
              </div>

              {/* Action buttons: Toggle Section & Clear / Restore */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleToggleTagsVisibility}
                  className={`btn btn-sm ${skills.show_tags === false ? 'btn-primary' : 'btn-outline'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title={isAr ? (skills.show_tags === false ? 'إظهار السحابة في الموقع' : 'إخفاء السحابة من الموقع') : (skills.show_tags === false ? 'Show tags on site' : 'Hide tags from site')}
                >
                  {skills.show_tags === false ? <Eye size={14} /> : <EyeOff size={14} />}
                  {skills.show_tags === false ? (isAr ? 'إظهار السحابة' : 'إخفاء السحابة') : (isAr ? 'إخفاء السحابة' : 'Hide Section')}
                </button>

                {(skills.tags || []).length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearAllTags}
                    className="btn btn-sm btn-ghost"
                    style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    title={isAr ? 'حذف كافة الوسوم دفعة واحدة' : 'Clear all tags'}
                  >
                    <Trash2 size={13} />
                    {isAr ? 'حذف كافة الوسوم' : 'Clear All'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRestoreDefaultTags}
                    className="btn btn-sm btn-outline"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <RotateCcw size={13} />
                    {isAr ? 'استعادة الوسوم الافتراضية' : 'Restore Defaults'}
                  </button>
                )}
              </div>
            </div>

            {/* Notice if hidden */}
            {skills.show_tags === false && (
              <div style={{ padding: '0.65rem 1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px dashed rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.83rem', color: 'var(--color-text-muted)' }}>
                {isAr ? '⚠️ تنبيه: سحابة الوسوم معطلة ومخفية حالياً ولن تظهر للزوار في قسم المهارات. اضغط "إظهار السحابة" لإعادة تفعيلها.' : '⚠️ Notice: Tech Tags cloud is currently hidden and will not be displayed on the portfolio.'}
              </div>
            )}

            {/* Cloud tags list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginBottom: '1.25rem', minHeight: '44px', alignItems: 'center' }}>
              {(skills.tags || []).length === 0 ? (
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  {isAr ? 'لا توجد وسوم حالياً. يمكنك كتابة وسم وإضافته أدناه، أو النقر على "استعادة الوسوم الافتراضية".' : 'No tags found. Add tags below or click "Restore Defaults".'}
                </div>
              ) : (
                (skills.tags || []).map((tg, tIdx) => {
                  const isEditing = editingTagIdx === tIdx
                  if (isEditing) {
                    return (
                      <span
                        key={tIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(59, 130, 246, 0.18)',
                          border: '2px solid var(--color-primary)',
                          borderRadius: '9999px',
                        }}
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editingTagValue}
                          onChange={(e) => setEditingTagValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleSaveEditTag(tIdx)
                            } else if (e.key === 'Escape') {
                              e.preventDefault()
                              handleCancelEditTag()
                            }
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--color-text-main)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            width: `${Math.max(60, (editingTagValue.length + 2) * 9)}px`,
                            padding: '0 0.25rem',
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditTag(tIdx)}
                          title={isAr ? 'حفظ التعديل (Enter)' : 'Save (Enter)'}
                          style={{
                            background: 'var(--color-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditTag}
                          title={isAr ? 'إلغاء (Esc)' : 'Cancel (Esc)'}
                          style={{
                            background: 'transparent',
                            color: 'var(--color-text-muted)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    )
                  }

                  return (
                    <span
                      key={tIdx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.35rem 0.75rem',
                        background: 'rgba(59, 130, 246, 0.12)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '9999px',
                        fontSize: '0.85rem',
                        color: 'var(--color-primary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span
                        onClick={() => handleStartEditTag(tIdx, tg)}
                        title={isAr ? 'انقر لتعديل هذا الوسم' : 'Click to edit tag'}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                      >
                        {tg}
                      </span>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEditTag(tIdx, tg)}
                        title={isAr ? 'تعديل هذا الوسم' : 'Edit tag'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          opacity: 0.75,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1'
                          e.currentTarget.style.color = 'var(--color-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.75'
                          e.currentTarget.style.color = 'var(--color-text-muted)'
                        }}
                      >
                        <Pencil size={11} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tIdx)}
                        title={isAr ? 'حذف هذا الوسم' : 'Delete tag'}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-error)',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          opacity: 0.75,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.75'
                        }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  )
                })
              )}
            </div>

            {/* Add tag form */}
            <div style={{ display: 'flex', gap: '0.6rem', maxWidth: '440px' }}>
              <input
                type="text"
                className="form-input"
                placeholder={isAr ? 'أضف وسماً جديداً (مثل Docker)' : 'Add tag (e.g. Docker)'}
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn btn-outline"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
              >
                <Plus size={14} /> {isAr ? 'إضافة وسم' : 'Add Tag'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '0.65rem 1.6rem' }}>
              <Save size={16} /> {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ تعديلات المهارات' : 'Save Skills Settings')}
            </button>
          </div>
        </div>
      )}

      {/* TAB: Services Management */}
      {activeTab === 'services' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Services Header Settings */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🛠️</span> {isAr ? 'عناوين ونصوص قسم الخدمات' : 'Services Section Headings'}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  {isAr ? 'تعديل الشارة، العنوان الرئيسي، والوصف لقسم الخدمات المقدمة.' : 'Customize badge, main title, and subtitle for services section.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Save size={14} />
                {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ نصوص الخدمات' : 'Save Headings')}
              </button>
            </div>

            <div className="cms-grid-2col">
              <div className="form-group">
                <label className="form-label">{isAr ? 'شارة القسم (عربي):' : 'Badge (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={services?.badge_ar ?? ''}
                  onChange={(e) => setServices((s) => ({ ...s, badge_ar: e.target.value }))}
                  placeholder={isAr ? 'الخدمات البرمجية' : 'Badge in Arabic'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'شارة القسم (إنجليزي):' : 'Badge (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={services?.badge_en ?? ''}
                  onChange={(e) => setServices((s) => ({ ...s, badge_en: e.target.value }))}
                  dir="ltr"
                  placeholder="Services"
                />
              </div>
            </div>

            <div className="cms-grid-2col">
              <div className="form-group">
                <label className="form-label">{isAr ? 'العنوان الرئيسي (عربي):' : 'Section Title (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={services?.title_ar ?? ''}
                  onChange={(e) => setServices((s) => ({ ...s, title_ar: e.target.value }))}
                  placeholder={isAr ? 'ماذا أقدم لعملائي' : 'Title in Arabic'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'العنوان الرئيسي (إنجليزي):' : 'Section Title (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={services?.title_en ?? ''}
                  onChange={(e) => setServices((s) => ({ ...s, title_en: e.target.value }))}
                  dir="ltr"
                  placeholder="What I Offer"
                />
              </div>
            </div>

            <div className="cms-grid-2col" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'الوصف الفرعي (عربي):' : 'Subtitle (Arabic):'}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={services?.subtitle_ar ?? ''}
                  onChange={(e) => setServices((s) => ({ ...s, subtitle_ar: e.target.value }))}
                  placeholder={isAr ? 'حلول تقنية متكاملة ومخصصة لاحتياجاتك' : 'Subtitle in Arabic'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'الوصف الفرعي (إنجليزي):' : 'Subtitle (English):'}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={services?.subtitle_en ?? ''}
                  onChange={(e) => setServices((s) => ({ ...s, subtitle_en: e.target.value }))}
                  dir="ltr"
                  placeholder="Comprehensive and tailored solutions for your needs"
                />
              </div>
            </div>
          </div>

          {/* Services Cards List */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {isAr ? 'قائمة بطاقات الخدمات' : 'Services Cards List'}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {isAr ? 'إضافة وتعديل أو حذف بطاقات الخدمات المعروضة.' : 'Add, edit, or delete service cards.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddService}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} />
                {isAr ? 'إضافة خدمة جديدة' : 'Add Service'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(services.services || []).map((srv, sIdx) => (
                <div
                  key={srv.id || sIdx}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div className="cms-cat-header-grid">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'أيقونة' : 'Icon'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={srv.icon || '🚀'}
                        onChange={(e) => handleUpdateService(sIdx, 'icon', e.target.value)}
                        style={{ textAlign: 'center', fontSize: '1.2rem', padding: '0.4rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'عنوان الخدمة (عربي)' : 'Title (AR)'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={srv.title_ar || ''}
                        onChange={(e) => handleUpdateService(sIdx, 'title_ar', e.target.value)}
                        placeholder="مثال: تطوير واجهات الويب"
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'عنوان الخدمة (إنجليزي)' : 'Title (EN)'}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={srv.title_en || ''}
                        onChange={(e) => handleUpdateService(sIdx, 'title_en', e.target.value)}
                        placeholder="e.g. Frontend Development"
                        dir="ltr"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', alignSelf: 'flex-end', height: '42px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveService(sIdx, 'up')}
                        disabled={sIdx === 0}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0 0.4rem', height: '38px', opacity: sIdx === 0 ? 0.3 : 1 }}
                        title={isAr ? 'تحريك الخدمة للأعلى' : 'Move Service Up'}
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveService(sIdx, 'down')}
                        disabled={sIdx === (services.services || []).length - 1}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0 0.4rem', height: '38px', opacity: sIdx === (services.services || []).length - 1 ? 0.3 : 1 }}
                        title={isAr ? 'تحريك الخدمة للأسفل' : 'Move Service Down'}
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(sIdx)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-error)', height: '38px', padding: '0 0.5rem' }}
                        title={isAr ? 'حذف الخدمة' : 'Delete Service'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="cms-grid-2col" style={{ marginBottom: 0 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'وصف الخدمة (عربي)' : 'Description (AR)'}</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={srv.description_ar || ''}
                        onChange={(e) => handleUpdateService(sIdx, 'description_ar', e.target.value)}
                        placeholder="شرح موجز للخدمة بالعربية..."
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'وصف الخدمة (إنجليزي)' : 'Description (EN)'}</label>
                      <textarea
                        className="form-input"
                        rows={2}
                        value={srv.description_en || ''}
                        onChange={(e) => handleUpdateService(sIdx, 'description_en', e.target.value)}
                        placeholder="Brief description in English..."
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '0.65rem 1.6rem' }}>
              <Save size={16} /> {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ تعديلات الخدمات' : 'Save Services Settings')}
            </button>
          </div>
        </div>
      )}

      {/* TAB: Experience Management */}
      {activeTab === 'experience' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Experience Header Settings */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💼</span> {isAr ? 'عناوين ونصوص قسم الخبرات' : 'Experience Section Headings'}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  {isAr ? 'تعديل الشارة، العنوان الرئيسي، والوصف للخط الزمني للخبرات المهنية.' : 'Customize badge, main title, and subtitle for experience timeline.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Save size={14} />
                {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ نصوص الخبرات' : 'Save Headings')}
              </button>
            </div>

            <div className="cms-grid-2col">
              <div className="form-group">
                <label className="form-label">{isAr ? 'شارة القسم (عربي):' : 'Badge (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={experience?.badge_ar ?? ''}
                  onChange={(e) => setExperience((exp) => ({ ...exp, badge_ar: e.target.value }))}
                  placeholder={isAr ? 'الخبرات والمسيرة' : 'Badge in Arabic'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'شارة القسم (إنجليزي):' : 'Badge (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={experience?.badge_en ?? ''}
                  onChange={(e) => setExperience((exp) => ({ ...exp, badge_en: e.target.value }))}
                  dir="ltr"
                  placeholder="Experience"
                />
              </div>
            </div>

            <div className="cms-grid-2col">
              <div className="form-group">
                <label className="form-label">{isAr ? 'العنوان الرئيسي (عربي):' : 'Section Title (Arabic):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={experience?.title_ar ?? ''}
                  onChange={(e) => setExperience((exp) => ({ ...exp, title_ar: e.target.value }))}
                  placeholder={isAr ? 'مسيرتي المهنية' : 'Title in Arabic'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'العنوان الرئيسي (إنجليزي):' : 'Section Title (English):'}</label>
                <input
                  type="text"
                  className="form-input"
                  value={experience?.title_en ?? ''}
                  onChange={(e) => setExperience((exp) => ({ ...exp, title_en: e.target.value }))}
                  dir="ltr"
                  placeholder="Career Journey"
                />
              </div>
            </div>

            <div className="cms-grid-2col" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'الوصف الفرعي (عربي):' : 'Subtitle (Arabic):'}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={experience?.subtitle_ar ?? ''}
                  onChange={(e) => setExperience((exp) => ({ ...exp, subtitle_ar: e.target.value }))}
                  placeholder={isAr ? 'محطات من مسيرتي في تطوير البرمجيات والحلول الرقمية' : 'Subtitle in Arabic'}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{isAr ? 'الوصف الفرعي (إنجليزي):' : 'Subtitle (English):'}</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={experience?.subtitle_en ?? ''}
                  onChange={(e) => setExperience((exp) => ({ ...exp, subtitle_en: e.target.value }))}
                  dir="ltr"
                  placeholder="Key milestones in my career path as a software engineer"
                />
              </div>
            </div>
          </div>

          {/* Experiences List */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {isAr ? 'محطات المسيرة المهنية والخبرات' : 'Career Timeline Items'}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {isAr ? 'إضافة وتعديل أو ترتيب المحطات الوظيفية والخبرات البرمجية.' : 'Manage career positions, dates, and technologies used.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={15} />
                {isAr ? 'إضافة خبرة جديدة' : 'Add Experience'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(experience.experiences || []).map((exp, eIdx) => (
                <div
                  key={exp.id || eIdx}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>💼</span>
                        <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                          {isAr ? (exp.title_ar || exp.title_en || `خبرة #${eIdx + 1}`) : (exp.title_en || exp.title_ar || `Position #${eIdx + 1}`)}
                        </span>
                        {exp.is_current && (
                          <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 700 }}>
                            {isAr ? 'حتى الآن' : 'Current'}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button
                          type="button"
                          onClick={() => handleMoveExperience(eIdx, 'up')}
                          disabled={eIdx === 0}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0 0.4rem', height: '34px', opacity: eIdx === 0 ? 0.3 : 1 }}
                          title={isAr ? 'تحريك الخبرة للأعلى' : 'Move Experience Up'}
                        >
                          <ArrowUp size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveExperience(eIdx, 'down')}
                          disabled={eIdx === (experience.experiences || []).length - 1}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '0 0.4rem', height: '34px', opacity: eIdx === (experience.experiences || []).length - 1 ? 0.3 : 1 }}
                          title={isAr ? 'تحريك الخبرة للأسفل' : 'Move Experience Down'}
                        >
                          <ArrowDown size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(eIdx)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-error)', height: '34px', padding: '0 0.5rem' }}
                          title={isAr ? 'حذف هذه الخبرة' : 'Delete Experience'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Titles Row */}
                    <div className="cms-grid-2col" style={{ marginBottom: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'المسمى الوظيفي (عربي)' : 'Job Title (AR)'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.title_ar || ''}
                          onChange={(e) => handleUpdateExperience(eIdx, 'title_ar', e.target.value)}
                          placeholder="مثال: مطور Full Stack"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'المسمى الوظيفي (إنجليزي)' : 'Job Title (EN)'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.title_en || ''}
                          onChange={(e) => handleUpdateExperience(eIdx, 'title_en', e.target.value)}
                          placeholder="e.g. Full Stack Developer"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Company & Location */}
                    <div className="cms-exp-company-grid">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'الشركة / الجهة (عربي)' : 'Company (AR)'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.company_ar || ''}
                          onChange={(e) => handleUpdateExperience(eIdx, 'company_ar', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'الشركة (إنجليزي)' : 'Company (EN)'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.company_en || ''}
                          onChange={(e) => handleUpdateExperience(eIdx, 'company_en', e.target.value)}
                          dir="ltr"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'الموقع (عربي)' : 'Location (AR)'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.location_ar || ''}
                          onChange={(e) => handleUpdateExperience(eIdx, 'location_ar', e.target.value)}
                          placeholder="ليبيا / عن بُعد"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'الموقع (إنجليزي)' : 'Location (EN)'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.location_en || ''}
                          onChange={(e) => handleUpdateExperience(eIdx, 'location_en', e.target.value)}
                          placeholder="Remote"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Dates & Current */}
                    <div className="cms-exp-dates-grid">
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'تاريخ البدء:' : 'Start Date:'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.start_date || ''}
                          onChange={(e) => handleUpdateExperience(eIdx, 'start_date', e.target.value)}
                          placeholder="مثال: 2022"
                          dir="ltr"
                        />
                      </div>

                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'تاريخ الانتهاء:' : 'End Date:'}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exp.end_date || ''}
                          disabled={exp.is_current}
                          onChange={(e) => handleUpdateExperience(eIdx, 'end_date', e.target.value)}
                          placeholder={exp.is_current ? (isAr ? 'حتى الآن' : 'Present') : 'مثال: 2023'}
                          dir="ltr"
                        />
                      </div>

                      <div style={{ paddingTop: '1.2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="checkbox"
                            checked={!!exp.is_current}
                            onChange={(e) => handleUpdateExperience(eIdx, 'is_current', e.target.checked)}
                          />
                          <span>{isAr ? 'الوظيفة الحالية' : 'Current Job'}</span>
                        </label>
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="cms-grid-2col" style={{ marginBottom: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'الوصف والمهام (عربي)' : 'Description (AR)'}</label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={exp.description_ar || ''}
                          onChange={(e) => handleUpdateExperience(eIdx, 'description_ar', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>{isAr ? 'الوصف والمهام (إنجليزي)' : 'Description (EN)'}</label>
                        <textarea
                          className="form-input"
                          rows={3}
                          value={exp.description_en || ''}
                          onChange={(e) => handleUpdateExperience(eIdx, 'description_en', e.target.value)}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Technologies Tags Manager */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{isAr ? 'التقنيات والأدوات المستخدمة في هذه المحطة:' : 'Technologies & Tools Used:'}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          ({(exp.technologies || []).length} {isAr ? 'تقنيات' : 'items'})
                        </span>
                      </label>

                      {/* Display existing tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.65rem', minHeight: '32px', alignItems: 'center' }}>
                        {Array.isArray(exp.technologies) && exp.technologies.length > 0 ? (
                          exp.technologies.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="cms-tag-pill"
                              style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
                            >
                              <span>{t}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveExpTech(eIdx, tIdx)}
                                style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                title={isAr ? 'حذف هذه التقنية' : 'Remove technology'}
                              >
                                <X size={13} />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            {isAr ? 'لم يتم إضافة أي تقنيات بعد. اكتب اسم التقنية أدناه واضغط إضافة.' : 'No technologies added yet. Type below and click Add.'}
                          </span>
                        )}
                      </div>

                      {/* Input to add tag */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder={isAr ? 'اكتب تقنية (مثل: Docker أو React) أو عدة تقنيات مفصولة بفاصلة واضغط إضافة...' : 'Type technology and press Enter or Add...'}
                          value={newExpTechInputs[eIdx] || ''}
                          onChange={(e) => setNewExpTechInputs(prev => ({ ...prev, [eIdx]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleAddExpTech(eIdx)
                            }
                          }}
                          style={{ height: '36px', fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddExpTech(eIdx)}
                          className="btn btn-outline btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}
                        >
                          <Plus size={14} /> {isAr ? 'إضافة' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '0.65rem 1.6rem' }}>
              <Save size={16} /> {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ تعديلات الخبرات' : 'Save Experience Settings')}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Contact & Socials */}
      {activeTab === 'contact' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            {isAr ? 'بيانات الاتصال وروابط التواصل الاجتماعي' : 'Contact Details & Social Links'}
          </h3>

          <div className="cms-grid-2col">
            <div className="form-group">
              <label className="form-label">{isAr ? 'بريد التواصل الرئيسي:' : 'Primary Contact Email:'}</label>
              <input
                type="email"
                className="form-input"
                value={contact.email || ''}
                onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isAr ? 'الموقع الجغرافي:' : 'Location:'}</label>
              <input
                type="text"
                className="form-input"
                value={contact.location || ''}
                onChange={(e) => setContact((c) => ({ ...c, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="cms-grid-2col" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">{isAr ? 'رابط GitHub:' : 'GitHub URL:'}</label>
              <input
                type="url"
                className="form-input"
                value={contact.github_url || ''}
                onChange={(e) => setContact((c) => ({ ...c, github_url: e.target.value }))}
                placeholder="https://github.com/username"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{isAr ? 'رابط LinkedIn:' : 'LinkedIn URL:'}</label>
              <input
                type="url"
                className="form-input"
                value={contact.linkedin_url || ''}
                onChange={(e) => setContact((c) => ({ ...c, linkedin_url: e.target.value }))}
                placeholder="https://linkedin.com/in/username"
                dir="ltr"
              />
            </div>
          </div>

          <div style={{ textAlign: isAr ? 'left' : 'right' }}>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary">
              <Save size={16} /> {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ بيانات التواصل' : 'Save Contact Settings')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
