/**
 * Automated Arabic-to-English Project Translation Engine & Dictionary
 * Provides structured, professional English translations for all existing
 * portfolio projects and an intelligent translation pipeline for newly created projects.
 */

export const EXISTING_PROJECT_TRANSLATIONS = {
  // 1. Tashile - Real Estate Platform
  '2d23f2dd-e3fe-442a-a6cc-bcf7c15b28c8': {
    title: '🏠 Tashile – Smart Real Estate Marketing Platform',
    description: `🔐 User Management & Authentication System in Tashile Platform

The platform supports two types of users:

1. Real Estate Company
• Account registration via email.
• Secure email and password login.
• Email verification.
• Password recovery.
• Company profile management.
• Adding and managing property listings.
• Receiving and managing property viewing requests.

2. Client
• Account creation via email.
• Email and password authentication.
• Email verification.
• Password recovery.
• Personal profile management.
• Property search and detailed viewing.
• Property location analysis and surrounding amenities.
• Booking appointments for property viewings.`,
    long_description: `Comprehensive real estate marketing and property management web platform built with React.js, Supabase, and PostgreSQL. Features role-based access control for real estate agencies and individual buyers/renters, interactive Google Maps spatial exploration, automated schedule booking for property showings, and responsive modern UI.`,
    category: 'Full Stack Web Application',
  },

  // 2. Runway - Airport Runway Damage Analysis
  '3fe51fd2-cc37-449c-9a47-8eb2a5b75967': {
    title: 'Runway – AI-Powered Runway Damage Analysis & Assessment Platform',
    description: `An intelligent platform leveraging artificial intelligence techniques to assess runway conditions across Libya and evaluate damage severity through image and geospatial data analysis. It identifies damage zones on dynamic heatmaps, generating preliminary reports detailing damage percentages, estimated maintenance costs in local and foreign currencies, anticipated risk levels, and maintenance progress tracking, along with analytical archiving for retrospective audit.`,
    long_description: `Specialized engineering platform combining Computer Vision / AI image processing with GIS heatmapping to automate airport runway inspections. Computes structural degradation indexes, calculates multi-currency maintenance estimates, and archives historical assessments for aviation authorities.`,
    category: 'AI & Data Engineering',
  },

  // 3. Sanad Insurance
  '1d282878-4ffc-4542-a176-71bf5968fc66': {
    title: 'Sanad Insurance – UI/UX Modernization & Enterprise Portal',
    description: `Comprehensive redesign and frontend modernization of the Sanad Insurance enterprise system. Built to establish a cohesive visual identity reflecting trust and professionalism in the insurance sector, optimizing user workflows, restructuring UI components, and delivering high-performance, modern, and responsive internal dashboards.`,
    long_description: `Enterprise-grade portal redesign for Sanad Insurance. Streamlines policy lifecycle workflows, claim submission portals, and internal agent management with custom design tokens, accessible components, and responsive layouts.`,
    category: 'UI/UX & Frontend Engineering',
  },

  // 4. Fezzan University - Moasher
  '5d86a084-7ff2-4073-8a1b-02080b4a060d': {
    title: 'Moasher – Academic Decision Support & Dropout Prediction System (Fezzan University)',
    description: `An end-to-end academic decision support platform for Fezzan University designed to evaluate student academic performance and predict students at risk of academic probation or dropout. Features role-based dashboards, department and course management, GPA calculations, risk-tier analytics, and AI-driven risk factor identification with actionable institutional recommendations.`,
    long_description: `Decision-support system for higher education combining Next.js 14, Django REST Framework, XGBoost predictive modeling, and SHAP interpretability. Enables academic deans to spot early warning signs of student attrition and initiate targeted academic interventions.`,
    category: 'Machine Learning & Decision Support',
  },

  // 5. Madar Al-Elm School ERP
  '442d620f-39e9-4dee-ab9a-84bb4bd0529e': {
    title: 'Madar Al-Elm – Comprehensive School Management ERP System',
    description: `A comprehensive ERP solution orchestrating academic, administrative, and financial workflows for Madar Al-Elm School. Provides multi-role RBAC access control with tailored portals for administrators, teachers, parents, and students. Manages tuition installments, fee payments, automated receipts, academic reporting, real-time attendance tracking, exam scheduling, gradebooks, and extracurricular activities.`,
    long_description: `Full-featured educational ERP system managing student records, gradebook calculations, daily attendance, automated payment installments, and official PDF grade transcripts with complete audit logs and secure role-based permissions.`,
    category: 'Enterprise ERP System',
  },

  // 6. Food Janzour
  'ffb948e5-2976-4065-acd8-1bd5d3b28d9a': {
    title: 'Food Janzour – Corporate Wholesale Food Distribution Portal',
    description: `A corporate web platform for Food Janzour Co., specializing in wholesale food supply and distribution across Janzour, Tripoli, and Libya. Showcases wholesale product portfolios, logistical services, location navigation, and direct inquiry channels.\n\nHighlights supply lines in canned goods, cooking oils, grains and legumes, dairy and cheeses, frozen meats, and beverages.`,
    long_description: `Corporate commercial portal developed for Food Janzour Co. with responsive product catalogs, inquiry forms, interactive Google Maps integration, and customized business domain email connectivity.`,
    category: 'Corporate Web Platform',
  },

  // 7. Janzour Electronics
  '72cc9456-0aac-422d-ae03-31a6156c9427': {
    title: 'Janzour Electronics – Official Corporate Web Platform',
    description: `A modern corporate website for Janzour Electronics developed to highlight commercial electronics products, warranties, and enterprise services. Offers an ultra-responsive browsing experience across devices, interactive Google Maps location integration, and custom enterprise business email integration to reinforce brand identity and client communication.`,
    long_description: `High-performance bilingual digital showcase for Janzour Electronics featuring responsive catalog browsing, customer support contact forms, Google Maps navigation, and corporate email integration.`,
    category: 'Corporate Web Platform',
  },

  // 8. MyLabLink
  '0ef1a07b-62e4-4324-8b58-479b097d4036': {
    title: 'MyLabLink – Smart Medical Laboratory Results Management Platform',
    description: `An intelligent and secure web platform for medical lab results management and tracking, seamlessly interconnecting patients, physicians, and diagnostic laboratories. Enables instant patient access to digital test reports, automated release notifications, historical biomarker trend visualization, and specialized clinical dashboards for physicians to monitor patient diagnostic progress.`,
    long_description: `HealthTech portal connecting diagnostic laboratories with clinics and patients. Features 2-factor authentication, verified electronic test result delivery, historical diagnostic charting, and encrypted communication channels.`,
    category: 'HealthTech Web Platform',
  },
}

// Arabic to English glossary for automated translation of new projects
const GLOSSARY_PHRASES = [
  // Titles & Systems
  [/نظام إدارة المدرسة/gi, 'School Management System'],
  [/نظام إدارة المدارس/gi, 'School Management System'],
  [/نظام إدارة/gi, 'Management System'],
  [/نظام متكامل/gi, 'Integrated System'],
  [/نظام دعم القرار/gi, 'Decision Support System'],
  [/نظام ذكي/gi, 'Intelligent System'],
  [/منصة ذكية/gi, 'Smart Platform'],
  [/منصة التسويق العقاري/gi, 'Real Estate Marketing Platform'],
  [/منصة ويب/gi, 'Web Platform'],
  [/موقع إلكتروني/gi, 'Website'],
  [/موقع شركة/gi, 'Corporate Website'],
  [/تطبيق ويب/gi, 'Web Application'],
  [/لوحة تحكم/gi, 'Dashboard'],
  [/لوحات تحكم/gi, 'Dashboards'],
  [/متجر إلكتروني/gi, 'E-Commerce Store'],
  [/بوابة إلكترونية/gi, 'Online Portal'],
  [/الذكاء الاصطناعي/gi, 'Artificial Intelligence (AI)'],
  [/قواعد البيانات/gi, 'Databases'],
  [/واجهات المستخدم/gi, 'User Interfaces'],
  [/تجربة المستخدم/gi, 'User Experience (UX)'],
  [/إدارة الطلاب/gi, 'Student Management'],
  [/إدارة المعلمين/gi, 'Teacher Management'],
  [/إدارة الحضور/gi, 'Attendance Tracking'],
  [/إدارة المدفوعات/gi, 'Payment Management'],
  [/تحليل البيانات/gi, 'Data Analysis'],

  // Verbs & Actions
  [/يهدف إلى/gi, 'aims to'],
  [/تم تطويرها/gi, 'was developed'],
  [/تم تطويره/gi, 'was developed'],
  [/يعتمد على/gi, 'relies on'],
  [/يتميز بـ/gi, 'features'],
  [/يوفر النظام/gi, 'The system provides'],
  [/توفر المنصة/gi, 'The platform provides'],
  [/تتيح للمستخدم/gi, 'Allows the user to'],
  [/يتيح للمستخدم/gi, 'Allows the user to'],
  [/تتيح للمريض/gi, 'Allows the patient to'],
  [/تسجيل الدخول/gi, 'Login'],
  [/إنشاء حساب/gi, 'Create Account'],
  [/استعادة كلمة المرور/gi, 'Password Recovery'],
  [/تأكيد البريد الإلكتروني/gi, 'Email Verification'],
]

const WORD_DICTIONARY = {
  'نظام': 'System',
  'منصة': 'Platform',
  'موقع': 'Website',
  'مشروع': 'Project',
  'تطبيق': 'Application',
  'ذكي': 'Smart',
  'ذكية': 'Smart',
  'متكامل': 'Integrated',
  'متكاملة': 'Integrated',
  'حديث': 'Modern',
  'حديثة': 'Modern',
  'متطور': 'Advanced',
  'متطورة': 'Advanced',
  'شامل': 'Comprehensive',
  'شاملة': 'Comprehensive',
  'سريع': 'Fast',
  'سريعة': 'Fast',
  'آمن': 'Secure',
  'آمنة': 'Secure',
  'إدارة': 'Management',
  'تحليل': 'Analysis',
  'تقييم': 'Assessment',
  'تسويق': 'Marketing',
  'عقارات': 'Real Estate',
  'عقاري': 'Real Estate',
  'مدرسة': 'School',
  'طبي': 'Medical',
  'مختبر': 'Laboratory',
  'مختبرات': 'Laboratories',
  'نتائج': 'Results',
  'حضور': 'Attendance',
  'طلاب': 'Students',
  'معلمين': 'Teachers',
  'مدفوعات': 'Payments',
  'أقساط': 'Installments',
  'بيانات': 'Data',
  'واجهة': 'Interface',
  'واجهات': 'Interfaces',
  'لوحة': 'Dashboard',
  'إلكتروني': 'Electronic / Digital',
  'إلكترونية': 'Electronic / Digital',
  'شركة': 'Company',
  'خدمات': 'Services',
  'منتجات': 'Products',
  'تقرير': 'Report',
  'تقارير': 'Reports',
  'معاينة': 'Preview',
  'تواصل': 'Contact',
  'تنبؤ': 'Prediction',
  'أكاديمي': 'Academic',
  'أكاديمية': 'Academic',
  'جامعة': 'University',
}

/**
 * Checks if a string contains Arabic characters
 */
export function isArabicText(text) {
  if (!text || typeof text !== 'string') return false
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text)
}

/**
 * Normalizes title for loose dictionary lookup
 */
function normalizeKey(str) {
  if (!str) return ''
  return str.toLowerCase().replace(/[\s\-_–—]/g, '').trim()
}

/**
 * Automatic rule-based and glossary-driven Arabic to English translator
 */
export function autoTranslateArabic(text) {
  if (!text || typeof text !== 'string') return text
  if (!isArabicText(text)) return text

  let translated = text

  // 1. Match multi-word glossary phrases first
  for (const [pattern, replacement] of GLOSSARY_PHRASES) {
    translated = translated.replace(pattern, replacement)
  }

  // 2. If the text is a short title and still largely Arabic, translate word by word
  if (isArabicText(translated)) {
    const words = translated.split(/(\s+|[.,:;!؟\-\(\)«»])/g)
    const translatedWords = words.map(w => {
      const cleanW = w.trim().replace(/^ال/, '')
      const direct = WORD_DICTIONARY[w.trim()] || WORD_DICTIONARY[cleanW]
      return direct ? direct : w
    })
    translated = translatedWords.join('')
  }

  return translated.trim()
}

/**
 * Local storage caching for generated translations
 */
function getCachedTranslation(id) {
  try {
    const raw = localStorage.getItem('portfolio_project_translations_cache')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed[id] || null
  } catch {
    return null
  }
}

function setCachedTranslation(id, data) {
  try {
    const raw = localStorage.getItem('portfolio_project_translations_cache') || '{}'
    const parsed = JSON.parse(raw)
    parsed[id] = data
    localStorage.setItem('portfolio_project_translations_cache', JSON.stringify(parsed))
  } catch {}
}

/**
 * Primary helper: Returns fully localized project object based on active language
 * @param {Object} project - The raw project object from API or database
 * @param {string} lang - 'ar' or 'en'
 * @returns {Object} Localized project
 */
export function getLocalizedProject(project, lang = 'ar') {
  if (!project) return project

  // When language is Arabic, always display original Arabic content
  if (lang === 'ar') {
    return {
      ...project,
      title: project.title_ar || project.title || '',
      description: project.description_ar || project.description || '',
      long_description: project.long_description_ar || project.long_description || '',
    }
  }

  // When language is English:
  // 1. Direct English field on project object if provided
  if (project.title_en && project.description_en) {
    return {
      ...project,
      title: project.title_en,
      description: project.description_en,
      long_description: project.long_description_en || project.long_description || project.description_en,
    }
  }

  // 2. Lookup in static structured translations by project ID
  if (project.id && EXISTING_PROJECT_TRANSLATIONS[project.id]) {
    const t = EXISTING_PROJECT_TRANSLATIONS[project.id]
    return {
      ...project,
      title: t.title,
      description: t.description,
      long_description: t.long_description || project.long_description || t.description,
      category: t.category || project.category,
    }
  }

  // 3. Lookup by matching title in dictionary
  const normalizedTitle = normalizeKey(project.title)
  for (const [id, t] of Object.entries(EXISTING_PROJECT_TRANSLATIONS)) {
    if (normalizeKey(t.title) === normalizedTitle || normalizeKey(id) === normalizedTitle) {
      return {
        ...project,
        title: t.title,
        description: t.description,
        long_description: t.long_description || project.long_description || t.description,
      }
    }
  }

  // 4. Lookup from localStorage cache
  if (project.id) {
    const cached = getCachedTranslation(project.id)
    if (cached && cached.title && cached.description) {
      return {
        ...project,
        title: cached.title,
        description: cached.description,
        long_description: cached.long_description || project.long_description || cached.description,
      }
    }
  }

  // 5. Automatic translation pipeline for newly added Arabic projects
  const autoTitle = autoTranslateArabic(project.title || '')
  const autoDesc = autoTranslateArabic(project.description || '')
  const autoLong = project.long_description ? autoTranslateArabic(project.long_description) : ''

  const generated = {
    title: autoTitle || project.title,
    description: autoDesc || project.description,
    long_description: autoLong || project.long_description || autoDesc || project.description,
  }

  // Cache it for subsequent renders
  if (project.id) {
    setCachedTranslation(project.id, generated)
  }

  return {
    ...project,
    title: generated.title,
    description: generated.description,
    long_description: generated.long_description,
  }
}
