import initSqlJs from 'sql.js'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = process.env.DB_PATH || './data/portfolio.db'
const dbFilePath = path.resolve(DB_PATH)

// Ensure data directory exists
const dataDir = path.dirname(dbFilePath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

let db = null
let SQL = null

// Save DB to disk
function saveDb() {
  if (db && SQL) {
    const data = db.export()
    fs.writeFileSync(dbFilePath, Buffer.from(data))
  }
}

// Auto-save every 30 seconds (unref so it does not keep process open)
const saveInterval = setInterval(saveDb, 30000);
if (saveInterval.unref) saveInterval.unref();

// Save on process exit
process.on('exit', saveDb)
process.on('SIGINT', () => { saveDb(); process.exit() })
process.on('SIGTERM', () => { saveDb(); process.exit() })

export async function initDatabase() {
  SQL = await initSqlJs()

  // Load existing DB or create new
  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  // Enable WAL-equivalent settings
  db.run('PRAGMA foreign_keys = ON')

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      long_description TEXT,
      technologies TEXT NOT NULL,
      image_url TEXT,
      github_url TEXT,
      live_url TEXT,
      featured INTEGER DEFAULT 0,
      order_index INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      images TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Ensure images column exists for existing databases
  try {
    const tableInfo = db.exec("PRAGMA table_info(projects)");
    if (tableInfo && tableInfo[0]) {
      const cols = tableInfo[0].values.map(v => v[1]);
      if (!cols.includes('images')) {
        db.run("ALTER TABLE projects ADD COLUMN images TEXT DEFAULT '[]'");
        saveDb();
      }
    }
  } catch (err) {
    console.error('Migration note:', err.message);
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Insert default settings
  const defaults = [
    ['hero_name', 'Hamza Eshtiba'],
    ['hero_title', 'Software Engineer & Full Stack Developer'],
    ['hero_subtitle', 'Building modern web applications with passion and precision'],
    ['about_text', 'I am a passionate software engineer with expertise in full-stack development.'],
    ['contact_email', 'hamza@eshtiba.com'],
    ['github_url', 'https://github.com/hamzaeshtiba'],
    ['linkedin_url', 'https://linkedin.com/in/hamzaeshtiba'],
    ['location', 'Libya'],
    ['sections_visibility', JSON.stringify({
      hero: true, about: true, skills: true, projects: true, services: true, experience: true, contact: true
    })],
    ['skills_settings', JSON.stringify({
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
    })],
    ['services_settings', JSON.stringify({
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
    })],
    ['experience_settings', JSON.stringify({
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
    })],
  ]

  for (const [key, value] of defaults) {
    db.run('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)', [key, value])
  }

  // Ensure default admin exists
  try {
    const adminStmt = db.prepare('SELECT id FROM admins LIMIT 1')
    const hasAdmin = adminStmt.step()
    adminStmt.free()
    if (!hasAdmin) {
      const defaultEmail = process.env.ADMIN_EMAIL || 'admin@hamzaeshtiba.dev'
      const defaultPass = process.env.ADMIN_PASSWORD || 'AdminPassword123!'
      const hashed = await bcrypt.hash(defaultPass, 12)
      db.run('INSERT INTO admins (email, password) VALUES (?, ?)', [defaultEmail, hashed])
      console.log(`👤 Default admin created: ${defaultEmail}`)
    }
  } catch (adminErr) {
    console.warn('Admin check note:', adminErr.message)
  }

  saveDb()
  console.log('✅ Database initialized successfully')
  return db
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db
}

// Helper wrappers to mimic better-sqlite3 API
export function dbAll(sql, params = []) {
  const d = getDb()
  const stmt = d.prepare(sql)
  const rows = []
  stmt.bind(params)
  while (stmt.step()) {
    rows.push(stmt.getAsObject())
  }
  stmt.free()
  return rows
}

export function dbGet(sql, params = []) {
  const rows = dbAll(sql, params)
  return rows[0] || null
}

export function dbRun(sql, params = []) {
  const d = getDb()
  d.run(sql, params)
  // Get lastInsertRowid
  const rows = dbAll('SELECT last_insert_rowid() as id')
  const changes = dbAll('SELECT changes() as c')
  return {
    lastInsertRowid: rows[0]?.id,
    changes: changes[0]?.c || 0
  }
}

export { saveDb }
export default getDb
