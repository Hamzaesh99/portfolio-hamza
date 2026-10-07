-- Cloudflare D1 Migration & Seed
-- Generated for Hamza Eshtiba Portfolio & CMS

-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Projects Table
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
);

-- 3. Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clean existing data
DELETE FROM admins;
DELETE FROM projects;
DELETE FROM site_settings;

INSERT INTO admins (id, email, password, created_at, updated_at) VALUES (1, 'admin@hamzaeshtiba.com', '$2a$12$d7mPhucN8/SKPX5Jfr5YA.BbidBHNkbdpXkHkkze3WzqhWFG6Ap56', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Projects
INSERT INTO projects (id, title, description, long_description, technologies, image_url, github_url, live_url, featured, order_index, status, images, created_at, updated_at) VALUES (
  'b6c21fea-ff9f-40a5-9018-abe68ccfb5a8',
  'ApexMetrics - DevOps Cloud Health & Telemetry Dashboard',
  'Full-stack cloud infrastructure monitoring suite that collects metrics, displays interactive real-time graphs, and alerts on anomalous latency spikes.',
  'Developed to monitor multi-container Docker swarms and Kubernetes clusters. Features dynamic SVG telemetry charts, custom threshold alerting via Webhooks, and sub-second metrics polling.',
  '["React","Node.js","Express","Chart.js","Prometheus","SQLite"]',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
  'https://github.com/hamzaeshtiba/apex-metrics-monitor',
  'https://apexmetrics.hamzaeshtiba.dev',
  1,
  3,
  'published',
  '[]',
  '2026-10-05 15:56:08',
  '2026-10-05 15:56:08'
);
INSERT INTO projects (id, title, description, long_description, technologies, image_url, github_url, live_url, featured, order_index, status, images, created_at, updated_at) VALUES (
  'a720dd05-fd7c-440b-b26e-3d1d325886a2',
  'Synthetix AI - Intelligent Content & Code Generation Hub',
  'AI-assisted productivity engine integrating state-of-the-art LLMs to automatically generate, refactor, and review software pull requests.',
  'A modern AI copilot dashboard with streaming markdown tokens, contextual prompt caching, code diff visualization, and custom system instruction presets.',
  '["React","Node.js","OpenAI API","TailwindCSS","Framer Motion"]',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  'https://github.com/hamzaeshtiba/synthetix-ai-hub',
  'https://synthetix.hamzaeshtiba.dev',
  1,
  4,
  'published',
  '[]',
  '2026-10-05 15:56:08',
  '2026-10-05 15:56:08'
);
INSERT INTO projects (id, title, description, long_description, technologies, image_url, github_url, live_url, featured, order_index, status, images, created_at, updated_at) VALUES (
  '48eea133-6dbb-4cf7-af72-b3d114c4b435',
  'FinVault - Modern Decentralized Portfolio & Asset Tracker',
  'Comprehensive financial portfolio manager with multi-currency conversion, transaction categorization, and interactive balance history visualizations.',
  'Designed with banking-level security principles, client-side encryption, and seamless data visualization using modern high-performance charting libraries.',
  '["React","TypeScript","TailwindCSS","Express","SQLite"]',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
  'https://github.com/hamzaeshtiba/finvault-asset-tracker',
  'https://finvault.hamzaeshtiba.dev',
  0,
  5,
  'published',
  '[]',
  '2026-10-05 15:56:08',
  '2026-10-06 14:17:43'
);
INSERT INTO projects (id, title, description, long_description, technologies, image_url, github_url, live_url, featured, order_index, status, images, created_at, updated_at) VALUES (
  'e43d2a67-8fb3-4fa2-ae59-f034b9172b8f',
  'OmniStream - High Performance Video & Media Processing API',
  'Scalable backend API service for automated video transcoding, thumbnail generation, watermark embedding, and Cloudflare R2 delivery.',
  'FFmpeg-powered microservice built on Node.js streams and worker threads. Automatically optimizes uploaded assets for fast adaptive bitrate streaming across mobile and web.',
  '["Node.js","Express","FFmpeg","Cloudflare R2","Docker"]',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop',
  'https://github.com/hamzaeshtiba/omnistream-media-api',
  'https://omnistream.hamzaeshtiba.dev',
  0,
  6,
  'published',
  '[]',
  '2026-10-05 15:56:08',
  '2026-10-06 14:17:46'
);
INSERT INTO projects (id, title, description, long_description, technologies, image_url, github_url, live_url, featured, order_index, status, images, created_at, updated_at) VALUES (
  '0ef1a07b-62e4-4324-8b58-479b097d4036',
  'iohuihuih',
  'kiohiohih',
  NULL,
  '["hiohihiuhuih"]',
  '/uploads/project-d95cae90-da61-4920-b1ff-270fbfcd6bc7.png',
  NULL,
  NULL,
  1,
  0,
  'published',
  '["/uploads/project-d95cae90-da61-4920-b1ff-270fbfcd6bc7.png","/uploads/project-8d631b69-c15b-4015-a211-cdeec510b283.png","/uploads/project-4bd9f735-8b8e-4637-9b19-c4b534e5687b.png","/uploads/project-59c682b4-40d8-4334-a45c-0d550b8a076c.png"]',
  '2026-10-06 16:22:30',
  '2026-10-06 17:18:59'
);

-- Insert Site Settings
INSERT INTO site_settings (key, value, updated_at) VALUES ('hero_name', 'Hamza Eshtiba', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('hero_title', 'Software Engineer & Full Stack Developer', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('hero_subtitle', 'Building modern web applications with passion and precision', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('about_text', 'I am a passionate software engineer with expertise in full-stack development.', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('contact_email', 'hamza@eshtiba.com', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('github_url', 'https://github.com/hamzaeshtiba', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('linkedin_url', 'https://linkedin.com/in/hamzaeshtiba', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('location', 'Libya', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('hero_settings', '{"brand_first":"HAMZA","brand_last":"ESHTIBA","badge_en":"AVAILABLE FOR WORK • FULL STACK ENGINEER","badge_ar":"متاح للعمل والمشاريع • مهندس برمجيات","tagline_en":"FULL STACK SOFTWARE ENGINEER & WEB ARCHITECT","tagline_ar":"هندسة وتطوير تطبيقات الويب الحديثة وحلول الـ FULL STACK","description_en":"I architect and develop modern, scalable web applications that combine pixel-perfect frontend experiences (React.js) with resilient backend APIs (Node.js) and high-performance database architectures.","description_ar":"أصمم وأطور تطبيقات ويب متكاملة وسريعة تجمع بين دقة الواجهات التفاعلية الحديثة (React.js)، وبناء خوادم وواجهات برمجية آمنة (Node.js & REST APIs)، وقواعد بيانات مصممة للأداء العالي وقابلية التوسع.","cta_primary_text_en":"View Projects","cta_primary_text_ar":"استكشف المشاريع","cta_primary_link":"projects","cta_secondary_text_en":"EXPLORE SERVICES","cta_secondary_text_ar":"خدماتي البرمجية","cta_secondary_link":"services","photo_url":"/uploads/project-95e7dc2d-f0ff-451b-8e8b-d9a57b9a1026.jpg","stat1_value":"+3","stat1_label_en":"YEARS EXP","stat1_label_ar":"سنوات خبرة","stat2_value":"+20","stat2_label_en":"PROJECTS BUILT","stat2_label_ar":"مشروعاً منجزاً","stat3_value":"100%","stat3_label_en":"SATISFACTION","stat3_label_ar":"جودة وتفاني","hud_title_en":"SPECIALIZED SERVICES","hud_title_ar":"الخدمات البرمجية المتخصصة","hud_badge_en":"OPEN FOR HIRE","hud_badge_ar":"متاح للمشاريع","hud_text_en":"\"Crafting interactive web applications, engineering robust APIs, designing secure database architectures, and delivering clean, maintainable code.\"","hud_text_ar":"«بناء واجهات ويب تفاعلية حديثة، تطوير APIs قوية وسريعة، تصميم قواعد بيانات آمنة، وضمان أعلى معايير الجودة والأداء.»","hud_meta_en":"⚡ Clean Code & Scalable Architecture","hud_meta_ar":"⚡ كود نظيف وتصميم متجاوب","hud_tags":"React • Node • SQL"}', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('sections_visibility', '{"hero":true,"about":true,"skills":true,"projects":true,"services":true,"experience":true,"contact":true}', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('about_settings', '{"badge_text_en":"About Me","badge_text_ar":"نبذة عني","title_line1_en":"Passionate Developer,","title_line1_ar":"مطور شغوف،","title_line2_en":"Problem Solver","title_line2_ar":"مبتكر للحلول البرمجية","p1_en":"I''m Hamza Eshtiba, a Software Engineer with over 3 years of experience building modern web applications. I specialize in full-stack development with a passion for clean code and elegant architecture.","p1_ar":"أنا حمزة اشطيبه، مهندس برمجيات بخبرة تزيد عن 3 سنوات في بناء تطبيقات الويب الحديثة. متخصص في تطوير Full-Stack مع شغف بالكود النظيف والبنية البرمجية الأنيقة.","p2_en":"From crafting pixel-perfect UIs to designing robust backend APIs, I bring ideas to life with precision and creativity. I believe great software is built at the intersection of technical excellence and great user experience.","p2_ar":"من تصميم واجهات بصرية دقيقة إلى بناء واجهات برمجة تطبيقات (APIs) قوية، أحول الأفكار إلى واقع بدقة وإبداع.","name":"Hamza Eshtiba","location":"Libya 🇱🇾","email":"hamza@eshtiba.com","status":"✅ Available","experience":"3+ Years","languages":"Arabic, English","cv_url":"/cv-hamza-eshtiba.pdf"}', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('contact_settings', '{"email":"hamza@eshtiba.com","location":"Tripoli, Libya","github_url":"https://github.com/hamzaeshtiba","linkedin_url":"https://linkedin.com/in/hamzaeshtiba","twitter_url":""}', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('skills_settings', '{"badge_en":"Skills","badge_ar":"المهارات التقنية","title_en":"Technical Expertise","title_ar":"الخبرات والمهارات البرمجية","subtitle_en":"Technologies and tools I use to build modern, scalable applications","subtitle_ar":"التقنيات والأدوات التي أعتمد عليها في بناء تطبيقات ويب عصرية وقابلة للتوسع","show_tags":true,"categories":[{"id":"cat-3","icon":"🗄️","title_en":"Database","title_ar":"قواعد البيانات (Databases)","skills":[{"name":"SQLite / SQL","level":80},{"name":"PostgreSQL","level":75},{"name":"MongoDB","level":70},{"name":"Redis","level":60}]},{"id":"cat-2","icon":"🔧","title_en":"Backend","title_ar":"تطوير الخوادم (Backend)","skills":[{"name":"Express.js","level":85},{"name":"Node.js","level":85},{"name":"REST APIs","level":90},{"name":"Authentication / JWT","level":82},{"name":"مهارة جديدة","level":80}]},{"id":"cat-1","icon":"⚡","title_en":"Frontend","title_ar":"تطوير الواجهات (Frontend)","skills":[{"name":"React.js","level":90},{"name":"JavaScript / TypeScript","level":88},{"name":"HTML & CSS","level":95},{"name":"Vite / Webpack","level":80}]},{"id":"cat-4","icon":"🛠️","title_en":"Tools & DevOps","title_ar":"الأدوات والبنية التحتية (DevOps)","skills":[{"name":"Git / GitHub","level":90},{"name":"Docker","level":70},{"name":"Linux / CLI","level":80},{"name":"CI/CD","level":65}]},{"id":"cat-1791320434140","icon":"⚡","title_en":"New Category","title_ar":"تصنيف جديد","skills":[{"name":"مهارة جديدة","level":85}]},{"id":"cat-1791320447120","icon":"⚡","title_en":"New Category","title_ar":"تصنيف جديد","skills":[{"name":"مهارة جديدة","level":85}]}],"tags":["React","Node.js","Express","SQLite","TypeScript","JavaScript","HTML5","CSS3","Git","REST API","JWT","PostgreSQL"]}', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('services_settings', '{"badge_en":"Services","badge_ar":"الخدمات البرمجية","title_en":"What I Offer","title_ar":"الخدمات التي أقدمها","subtitle_en":"Professional services to help you build and grow your digital presence","subtitle_ar":"حلول وخدمات برمجية متكاملة لتحويل أفكارك إلى منتجات رقمية ناجحة ومتميزة","services":[{"id":"srv-1","icon":"🖥️","title_en":"Frontend Development","title_ar":"تطوير واجهات المستخدم الحديثة","description_en":"Building responsive, fast, and visually stunning user interfaces with React and modern CSS.","description_ar":"بناء واجهات مستخدم متجاوبة، فائقة السرعة وجذابة بصرياً باستخدام React وأحدث تقنيات CSS."},{"id":"srv-2","icon":"⚙️","title_en":"Backend Development","title_ar":"تطوير الواجهات الخلفية (Backend)","description_en":"Designing scalable REST APIs and server-side logic with Node.js and Express.","description_ar":"تصميم وبناء خوادم وواجهات برمجية RESTful قوية وقابلة للتوسع باستخدام Node.js و Express."},{"id":"srv-3","icon":"🗄️","title_en":"Database Design","title_ar":"تصميم وهندسة قواعد البيانات","description_en":"Architecting efficient database schemas and queries with SQL and NoSQL databases.","description_ar":"هندسة مخططات قواعد البيانات وضبط استعلاماتها للأداء العالي باستخدام SQL و NoSQL."},{"id":"srv-4","icon":"🔒","title_en":"Authentication & Security","title_ar":"أنظمة التوثيق والأمان السيبراني","description_en":"Implementing secure auth systems, JWT tokens, and following security best practices.","description_ar":"تطبيق أنظمة تسجيل دخول وتوثيق آمنة بالكامل بالـ JWT مع الالتزام بأفضل معايير الأمان والحماية."},{"id":"srv-5","icon":"🚀","title_en":"Deployment & DevOps","title_ar":"النشر والتشغيل السحابي","description_en":"Deploying applications to cloud platforms with CI/CD pipelines and Docker.","description_ar":"نشر وإدارة التطبيقات على المنصات السحابية مع أتمتة خطوط النشر CI/CD واستخدام Docker."},{"id":"srv-6","icon":"📱","title_en":"Responsive Design","title_ar":"التصميم المتجاوب لجميع الشاشات","description_en":"Ensuring flawless experience across all devices — mobile, tablet, and desktop.","description_ar":"ضمان تجربة مستخدم مثالية وسلسة على الهواتف الذكية، الأجهزة اللوحية، وشاشات الحواسيب."}]}', CURRENT_TIMESTAMP);
INSERT INTO site_settings (key, value, updated_at) VALUES ('experience_settings', '{"badge_en":"Experience","badge_ar":"الخبرات والمسيرة","title_en":"My Journey","title_ar":"مسيرتي المهنية وخبراتي","subtitle_en":"Professional experience and milestones in my software engineering career","subtitle_ar":"محطات وخبرات واقعية ميزت مسيرتي في هندسة وتطوير البرمجيات","experiences":[{"id":"exp-1","title_en":"Full Stack Developer","title_ar":"مطور Full Stack متكامل","company_en":"Freelance","company_ar":"عمل حر / مستقل","location_en":"Remote","location_ar":"عن بُعد","start_date":"2022","end_date":"","is_current":true,"description_en":"Building custom web applications for clients worldwide. Specializing in React frontends with Node.js backends, delivering production-ready solutions from design to deployment.","description_ar":"بناء تطبيقات ويب مخصصة لعملاء ومؤسسات مختلفة، مع التركيز على واجهات React وخوادم Node.js وتسليم حلول جاهزة للإنتاج من التصميم حتى النشر.","technologies":["React","Node.js","Express","SQLite","PostgreSQL"]},{"id":"exp-2","title_en":"Frontend Developer","title_ar":"مطور واجهات أمامية","company_en":"Tech Startup","company_ar":"شركة تقنية ناشئة","location_en":"Libya","location_ar":"ليبيا","start_date":"2021","end_date":"2022","is_current":false,"description_en":"Led frontend development for multiple SaaS products. Collaborated with design and backend teams to deliver high-quality user interfaces.","description_ar":"قيادة تطوير الواجهات الأمامية لمنتجات SaaS برمجية، والتعاون مع فرق التصميم والخلفية لتقديم تجارب مستخدم عالية الجودة.","technologies":["React","JavaScript","CSS3","REST APIs"]},{"id":"exp-3","title_en":"Junior Web Developer","title_ar":"مطور ويب مبتدئ","company_en":"Digital Agency","company_ar":"وكالة حلول رقمية","location_en":"Libya","location_ar":"ليبيا","start_date":"2020","end_date":"2021","is_current":false,"description_en":"Started my professional journey building websites and web applications. Gained hands-on experience with HTML, CSS, JavaScript, and PHP.","description_ar":"بداية الانطلاقة في بناء المواقع وتطبيقات الويب، واكتساب خبرات عملية قوية في HTML و CSS و JavaScript وقواعد البيانات.","technologies":["HTML","CSS","JavaScript","PHP"]}]}', CURRENT_TIMESTAMP);
