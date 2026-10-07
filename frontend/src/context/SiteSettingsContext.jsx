import { createContext, useContext, useState, useEffect } from 'react'
import { settingsAPI } from '../lib/api.js'

const DEFAULT_SECTIONS_VISIBILITY = {
  hero: true,
  about: true,
  skills: true,
  projects: true,
  services: true,
  experience: true,
  contact: true,
}

const DEFAULT_HERO_SETTINGS = {
  brand_first: 'HAMZA',
  brand_last: 'ESHTIBA',
  badge_en: 'AVAILABLE FOR WORK • FULL STACK ENGINEER',
  badge_ar: 'متاح للعمل والمشاريع • مهندس برمجيات',
  tagline_en: 'FULL STACK SOFTWARE ENGINEER & WEB ARCHITECT',
  tagline_ar: 'هندسة وتطوير تطبيقات الويب الحديثة وحلول الـ FULL STACK',
  description_en: 'I architect and develop modern, scalable web applications that combine pixel-perfect frontend experiences (React.js) with resilient backend APIs (Node.js) and high-performance database architectures.',
  description_ar: 'أصمم وأطور تطبيقات ويب متكاملة وسريعة تجمع بين دقة الواجهات التفاعلية الحديثة (React.js)، وبناء خوادم وواجهات برمجية آمنة (Node.js & REST APIs)، وقواعد بيانات مصممة للأداء العالي وقابلية التوسع.',
  cta_primary_text_en: 'View Projects',
  cta_primary_text_ar: 'استكشف المشاريع',
  cta_primary_link: 'projects',
  cta_secondary_text_en: 'EXPLORE SERVICES',
  cta_secondary_text_ar: 'خدماتي البرمجية',
  cta_secondary_link: 'services',
  photo_url: '', // blank uses default hero.jpg
  stat1_value: '+3',
  stat1_label_en: 'YEARS EXP',
  stat1_label_ar: 'سنوات خبرة',
  stat2_value: '+20',
  stat2_label_en: 'PROJECTS BUILT',
  stat2_label_ar: 'مشروعاً منجزاً',
  stat3_value: '100%',
  stat3_label_en: 'SATISFACTION',
  stat3_label_ar: 'جودة وتفاني',
  hud_title_en: 'SPECIALIZED SERVICES',
  hud_title_ar: 'الخدمات البرمجية المتخصصة',
  hud_badge_en: 'OPEN FOR HIRE',
  hud_badge_ar: 'متاح للمشاريع',
  hud_text_en: '"Crafting interactive web applications, engineering robust APIs, designing secure database architectures, and delivering clean, maintainable code."',
  hud_text_ar: '«بناء واجهات ويب تفاعلية حديثة، تطوير APIs قوية وسريعة، تصميم قواعد بيانات آمنة، وضمان أعلى معايير الجودة والأداء.»',
  hud_meta_en: '⚡ Clean Code & Scalable Architecture',
  hud_meta_ar: '⚡ كود نظيف وتصميم متجاوب',
  hud_tags: 'React • Node • SQL',
}

const DEFAULT_ABOUT_SETTINGS = {
  badge_text_en: 'About Me',
  badge_text_ar: 'نبذة عني',
  title_line1_en: 'Passionate Developer,',
  title_line1_ar: 'مطور شغوف،',
  title_line2_en: 'Problem Solver',
  title_line2_ar: 'مبتكر للحلول البرمجية',
  p1_en: "I'm Hamza Eshtiba, a Software Engineer with over 3 years of experience building modern web applications. I specialize in full-stack development with a passion for clean code and elegant architecture.",
  p1_ar: 'أنا حمزة اشطيبه، مهندس برمجيات بخبرة تزيد عن 3 سنوات في بناء تطبيقات الويب الحديثة. متخصص في تطوير Full-Stack مع شغف بالكود النظيف والبنية البرمجية الأنيقة.',
  p2_en: 'From crafting pixel-perfect UIs to designing robust backend APIs, I bring ideas to life with precision and creativity. I believe great software is built at the intersection of technical excellence and great user experience.',
  p2_ar: 'من تصميم واجهات بصرية دقيقة إلى بناء واجهات برمجة تطبيقات (APIs) قوية، أحول الأفكار إلى واقع بدقة وإبداع.',
  name: 'Hamza Eshtiba',
  location: 'Libya 🇱🇾',
  email: 'hamza@eshtiba.com',
  status: '✅ Available',
  experience: '3+ Years',
  languages: 'Arabic, English',
  cv_url: '/cv-hamza-eshtiba.pdf',
}

const DEFAULT_CONTACT_SETTINGS = {
  email: 'hamza@eshtiba.com',
  location: 'Tripoli, Libya',
  github_url: 'https://github.com/hamzaeshtiba',
  linkedin_url: 'https://linkedin.com/in/hamzaeshtiba',
  twitter_url: '',
}

export const DEFAULT_SKILLS_SETTINGS = {
  badge_en: 'Skills',
  badge_ar: 'المهارات التقنية',
  title_en: 'Technical Expertise',
  title_ar: 'الخبرات والمهارات البرمجية',
  subtitle_en: 'Technologies and tools I use to build modern, scalable applications',
  subtitle_ar: 'التقنيات والأدوات التي أعتمد عليها في بناء تطبيقات ويب عصرية وقابلة للتوسع',
  show_tags: true,
  categories: [
    {
      id: 'cat-1',
      icon: '⚡',
      title_en: 'Frontend',
      title_ar: 'تطوير الواجهات (Frontend)',
      skills: [
        { name: 'React.js', level: 90 },
        { name: 'JavaScript / TypeScript', level: 88 },
        { name: 'HTML & CSS', level: 95 },
        { name: 'Vite / Webpack', level: 80 },
      ],
    },
    {
      id: 'cat-2',
      icon: '🔧',
      title_en: 'Backend',
      title_ar: 'تطوير الخوادم (Backend)',
      skills: [
        { name: 'Node.js', level: 85 },
        { name: 'Express.js', level: 85 },
        { name: 'REST APIs', level: 90 },
        { name: 'Authentication / JWT', level: 82 },
      ],
    },
    {
      id: 'cat-3',
      icon: '🗄️',
      title_en: 'Database',
      title_ar: 'قواعد البيانات (Databases)',
      skills: [
        { name: 'SQLite / SQL', level: 80 },
        { name: 'PostgreSQL', level: 75 },
        { name: 'MongoDB', level: 70 },
        { name: 'Redis', level: 60 },
      ],
    },
    {
      id: 'cat-4',
      icon: '🛠️',
      title_en: 'Tools & DevOps',
      title_ar: 'الأدوات والبنية التحتية (DevOps)',
      skills: [
        { name: 'Git / GitHub', level: 90 },
        { name: 'Docker', level: 70 },
        { name: 'Linux / CLI', level: 80 },
        { name: 'CI/CD', level: 65 },
      ],
    },
  ],
  tags: ['React', 'Node.js', 'Express', 'SQLite', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'Docker', 'REST API', 'JWT', 'PostgreSQL', 'MongoDB', 'Linux', 'Vite']
}

export const DEFAULT_SERVICES_SETTINGS = {
  badge_en: 'Services',
  badge_ar: 'الخدمات البرمجية',
  title_en: 'What I Offer',
  title_ar: 'الخدمات التي أقدمها',
  subtitle_en: 'Professional services to help you build and grow your digital presence',
  subtitle_ar: 'حلول وخدمات برمجية متكاملة لتحويل أفكارك إلى منتجات رقمية ناجحة ومتميزة',
  services: [
    {
      id: 'srv-1',
      icon: '🖥️',
      title_en: 'Frontend Development',
      title_ar: 'تطوير واجهات المستخدم الحديثة',
      description_en: 'Building responsive, fast, and visually stunning user interfaces with React and modern CSS.',
      description_ar: 'بناء واجهات مستخدم متجاوبة، فائقة السرعة وجذابة بصرياً باستخدام React وأحدث تقنيات CSS.',
    },
    {
      id: 'srv-2',
      icon: '⚙️',
      title_en: 'Backend Development',
      title_ar: 'تطوير الواجهات الخلفية (Backend)',
      description_en: 'Designing scalable REST APIs and server-side logic with Node.js and Express.',
      description_ar: 'تصميم وبناء خوادم وواجهات برمجية RESTful قوية وقابلة للتوسع باستخدام Node.js و Express.',
    },
    {
      id: 'srv-3',
      icon: '🗄️',
      title_en: 'Database Design',
      title_ar: 'تصميم وهندسة قواعد البيانات',
      description_en: 'Architecting efficient database schemas and queries with SQL and NoSQL databases.',
      description_ar: 'هندسة مخططات قواعد البيانات وضبط استعلاماتها للأداء العالي باستخدام SQL و NoSQL.',
    },
    {
      id: 'srv-4',
      icon: '🔒',
      title_en: 'Authentication & Security',
      title_ar: 'أنظمة التوثيق والأمان السيبراني',
      description_en: 'Implementing secure auth systems, JWT tokens, and following security best practices.',
      description_ar: 'تطبيق أنظمة تسجيل دخول وتوثيق آمنة بالكامل بالـ JWT مع الالتزام بأفضل معايير الأمان والحماية.',
    },
    {
      id: 'srv-5',
      icon: '🚀',
      title_en: 'Deployment & DevOps',
      title_ar: 'النشر والتشغيل السحابي',
      description_en: 'Deploying applications to cloud platforms with CI/CD pipelines and Docker.',
      description_ar: 'نشر وإدارة التطبيقات على المنصات السحابية مع أتمتة خطوط النشر CI/CD واستخدام Docker.',
    },
    {
      id: 'srv-6',
      icon: '📱',
      title_en: 'Responsive Design',
      title_ar: 'التصميم المتجاوب لجميع الشاشات',
      description_en: 'Ensuring flawless experience across all devices — mobile, tablet, and desktop.',
      description_ar: 'ضمان تجربة مستخدم مثالية وسلسة على الهواتف الذكية، الأجهزة اللوحية، وشاشات الحواسيب.',
    },
  ]
}

export const DEFAULT_EXPERIENCE_SETTINGS = {
  badge_en: 'Experience',
  badge_ar: 'الخبرات والمسيرة',
  title_en: 'My Journey',
  title_ar: 'مسيرتي المهنية وخبراتي',
  subtitle_en: 'Professional experience and milestones in my software engineering career',
  subtitle_ar: 'محطات وخبرات واقعية ميزت مسيرتي في هندسة وتطوير البرمجيات',
  experiences: [
    {
      id: 'exp-1',
      title_en: 'Full Stack Developer',
      title_ar: 'مطور Full Stack متكامل',
      company_en: 'Freelance',
      company_ar: 'عمل حر / مستقل',
      location_en: 'Remote',
      location_ar: 'عن بُعد',
      start_date: '2022',
      end_date: '',
      is_current: true,
      description_en: 'Building custom web applications for clients worldwide. Specializing in React frontends with Node.js backends, delivering production-ready solutions from design to deployment.',
      description_ar: 'بناء تطبيقات ويب مخصصة لعملاء ومؤسسات مختلفة، مع التركيز على واجهات React وخوادم Node.js وتسليم حلول جاهزة للإنتاج من التصميم حتى النشر.',
      technologies: ['React', 'Node.js', 'Express', 'SQLite', 'PostgreSQL'],
    },
    {
      id: 'exp-2',
      title_en: 'Frontend Developer',
      title_ar: 'مطور واجهات أمامية',
      company_en: 'Tech Startup',
      company_ar: 'شركة تقنية ناشئة',
      location_en: 'Libya',
      location_ar: 'ليبيا',
      start_date: '2021',
      end_date: '2022',
      is_current: false,
      description_en: 'Led frontend development for multiple SaaS products. Collaborated with design and backend teams to deliver high-quality user interfaces.',
      description_ar: 'قيادة تطوير الواجهات الأمامية لمنتجات SaaS برمجية، والتعاون مع فرق التصميم والخلفية لتقديم تجارب مستخدم عالية الجودة.',
      technologies: ['React', 'JavaScript', 'CSS3', 'REST APIs'],
    },
    {
      id: 'exp-3',
      title_en: 'Junior Web Developer',
      title_ar: 'مطور ويب مبتدئ',
      company_en: 'Digital Agency',
      company_ar: 'وكالة حلول رقمية',
      location_en: 'Libya',
      location_ar: 'ليبيا',
      start_date: '2020',
      end_date: '2021',
      is_current: false,
      description_en: 'Started my professional journey building websites and web applications. Gained hands-on experience with HTML, CSS, JavaScript, and PHP.',
      description_ar: 'بداية الانطلاقة في بناء المواقع وتطبيقات الويب، واكتساب خبرات عملية قوية في HTML و CSS و JavaScript وقواعد البيانات.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    },
  ]
}

const SiteSettingsContext = createContext(null)

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    sections_visibility: DEFAULT_SECTIONS_VISIBILITY,
    hero_settings: DEFAULT_HERO_SETTINGS,
    about_settings: DEFAULT_ABOUT_SETTINGS,
    contact_settings: DEFAULT_CONTACT_SETTINGS,
    skills_settings: DEFAULT_SKILLS_SETTINGS,
    services_settings: DEFAULT_SERVICES_SETTINGS,
    experience_settings: DEFAULT_EXPERIENCE_SETTINGS,
  })
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const res = await settingsAPI.get()
      if (res.data) {
        setSettings({
          sections_visibility: {
            ...DEFAULT_SECTIONS_VISIBILITY,
            ...(res.data.sections_visibility || {}),
          },
          hero_settings: {
            ...DEFAULT_HERO_SETTINGS,
            ...(res.data.hero_settings || {}),
          },
          about_settings: {
            ...DEFAULT_ABOUT_SETTINGS,
            ...(res.data.about_settings || {}),
          },
          contact_settings: {
            ...DEFAULT_CONTACT_SETTINGS,
            ...(res.data.contact_settings || {}),
          },
          skills_settings: {
            ...DEFAULT_SKILLS_SETTINGS,
            ...(res.data.skills_settings || {}),
          },
          services_settings: {
            ...DEFAULT_SERVICES_SETTINGS,
            ...(res.data.services_settings || {}),
          },
          experience_settings: {
            ...DEFAULT_EXPERIENCE_SETTINGS,
            ...(res.data.experience_settings || {}),
          },
        })
      }
    } catch (err) {
      console.warn('Could not load remote site settings, using defaults.', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const updateSettings = async (newSettingsPayload) => {
    const res = await settingsAPI.update(newSettingsPayload)
    if (res.data?.settings) {
      setSettings((prev) => ({
        ...prev,
        ...res.data.settings,
      }))
    }
    return res.data
  }

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
        visibility: settings.sections_visibility,
        hero: settings.hero_settings,
        about: settings.about_settings,
        contact: settings.contact_settings,
        skills: settings.skills_settings || DEFAULT_SKILLS_SETTINGS,
        services: settings.services_settings || DEFAULT_SERVICES_SETTINGS,
        experience: settings.experience_settings || DEFAULT_EXPERIENCE_SETTINGS,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  }
  return context
}
