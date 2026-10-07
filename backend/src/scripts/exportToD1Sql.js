import fs from 'fs';
import path from 'path';

const dump = JSON.parse(fs.readFileSync('./dump.json', 'utf8'));

let sql = `-- Cloudflare D1 Migration & Seed
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

`;

// 1. Admin
const adminEmail = 'admin@hamzaeshtiba.com';
const adminHash = '$2a$12$d7mPhucN8/SKPX5Jfr5YA.BbidBHNkbdpXkHkkze3WzqhWFG6Ap56';
sql += `INSERT INTO admins (id, email, password, created_at, updated_at) VALUES (1, '${adminEmail}', '${adminHash}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);\n\n`;

// 2. Projects
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  let cleaned = String(str).replace(/http:\/\/localhost:5000\/uploads\//g, '/uploads/');
  return `'${cleaned.replace(/'/g, "''")}'`;
}

sql += `-- Insert Projects\n`;
for (const p of dump.projects) {
  sql += `INSERT INTO projects (id, title, description, long_description, technologies, image_url, github_url, live_url, featured, order_index, status, images, created_at, updated_at) VALUES (\n`;
  sql += `  ${escapeSql(p.id)},\n`;
  sql += `  ${escapeSql(p.title)},\n`;
  sql += `  ${escapeSql(p.description)},\n`;
  sql += `  ${escapeSql(p.long_description)},\n`;
  sql += `  ${escapeSql(p.technologies)},\n`;
  sql += `  ${escapeSql(p.image_url)},\n`;
  sql += `  ${escapeSql(p.github_url)},\n`;
  sql += `  ${escapeSql(p.live_url)},\n`;
  sql += `  ${p.featured ? 1 : 0},\n`;
  sql += `  ${p.order_index || 0},\n`;
  sql += `  ${escapeSql(p.status || 'published')},\n`;
  sql += `  ${escapeSql(p.images || '[]')},\n`;
  sql += `  ${escapeSql(p.created_at || 'CURRENT_TIMESTAMP')},\n`;
  sql += `  ${escapeSql(p.updated_at || 'CURRENT_TIMESTAMP')}\n`;
  sql += `);\n`;
}

// 3. Site settings
sql += `\n-- Insert Site Settings\n`;
for (const s of dump.site_settings) {
  sql += `INSERT INTO site_settings (key, value, updated_at) VALUES (${escapeSql(s.key)}, ${escapeSql(s.value)}, CURRENT_TIMESTAMP);\n`;
}

const outDir = path.resolve('../migrations');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, '0001_initial_schema_and_data.sql'), sql);
console.log('Migration generated successfully at migrations/0001_initial_schema_and_data.sql');
