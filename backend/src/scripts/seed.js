import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { initDatabase, dbGet, dbRun, saveDb } from '../database/init.js';

async function seed() {
  console.log('🌱 Seeding database...');
  await initDatabase();

  // 1. Seed Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hamzaeshtiba.dev';
  const adminPass = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const existingAdmin = dbGet('SELECT id FROM admins WHERE email = ?', [adminEmail]);

  if (!existingAdmin) {
    const hashed = await bcrypt.hash(adminPass, 12);
    dbRun('INSERT INTO admins (email, password) VALUES (?, ?)', [adminEmail, hashed]);
    console.log(`✅ Default admin created:\n   Email: ${adminEmail}\n   Password: ${adminPass}`);
  } else {
    console.log(`ℹ️ Admin already exists (${adminEmail})`);
  }

  // 2. Seed Projects
  const existingProjects = dbGet('SELECT COUNT(*) as count FROM projects');
  if (existingProjects && existingProjects.count > 0) {
    console.log(`ℹ️ Projects already seeded (${existingProjects.count} existing)`);
  } else {
    const sampleProjects = [
      {
        title: 'CloudScale - Microservices E-Commerce Platform',
        description: 'An enterprise-grade high-throughput distributed e-commerce architecture designed with asynchronous event bus, caching, and payment integration.',
        long_description: 'Built a multi-tier microservices platform handling thousands of concurrent requests. Features distributed authentication, real-time inventory management, Stripe payment webhooks, and an intuitive responsive customer storefront.',
        technologies: JSON.stringify(['React', 'Node.js', 'Express', 'Redis', 'Docker', 'PostgreSQL', 'TailwindCSS']),
        image_url: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1200&auto=format&fit=crop',
        github_url: 'https://github.com/hamzaeshtiba/cloudscale-ecommerce',
        live_url: 'https://cloudscale-demo.hamzaeshtiba.dev',
        featured: 1,
        order_index: 1,
        status: 'published'
      },
      {
        title: 'DevPulse - Real-time Collaborative Code Workspace',
        description: 'Collaborative cloud code editor with live cursor tracking, instant audio/text channels, Monaco editor integration, and isolated sandbox execution.',
        long_description: 'Architected using WebSocket connections and operational transformation protocols. Enables multiple software engineers to pair program seamlessly in real-time with integrated terminal and test runners.',
        technologies: JSON.stringify(['React', 'TypeScript', 'WebSockets', 'Node.js', 'Monaco Editor', 'Docker']),
        image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
        github_url: 'https://github.com/hamzaeshtiba/devpulse-workspace',
        live_url: 'https://devpulse.hamzaeshtiba.dev',
        featured: 1,
        order_index: 2,
        status: 'published'
      },
      {
        title: 'ApexMetrics - DevOps Cloud Health & Telemetry Dashboard',
        description: 'Full-stack cloud infrastructure monitoring suite that collects metrics, displays interactive real-time graphs, and alerts on anomalous latency spikes.',
        long_description: 'Developed to monitor multi-container Docker swarms and Kubernetes clusters. Features dynamic SVG telemetry charts, custom threshold alerting via Webhooks, and sub-second metrics polling.',
        technologies: JSON.stringify(['React', 'Node.js', 'Express', 'Chart.js', 'Prometheus', 'SQLite']),
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
        github_url: 'https://github.com/hamzaeshtiba/apex-metrics-monitor',
        live_url: 'https://apexmetrics.hamzaeshtiba.dev',
        featured: 1,
        order_index: 3,
        status: 'published'
      },
      {
        title: 'Synthetix AI - Intelligent Content & Code Generation Hub',
        description: 'AI-assisted productivity engine integrating state-of-the-art LLMs to automatically generate, refactor, and review software pull requests.',
        long_description: 'A modern AI copilot dashboard with streaming markdown tokens, contextual prompt caching, code diff visualization, and custom system instruction presets.',
        technologies: JSON.stringify(['React', 'Node.js', 'OpenAI API', 'TailwindCSS', 'Framer Motion']),
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        github_url: 'https://github.com/hamzaeshtiba/synthetix-ai-hub',
        live_url: 'https://synthetix.hamzaeshtiba.dev',
        featured: 1,
        order_index: 4,
        status: 'published'
      },
      {
        title: 'FinVault - Modern Decentralized Portfolio & Asset Tracker',
        description: 'Comprehensive financial portfolio manager with multi-currency conversion, transaction categorization, and interactive balance history visualizations.',
        long_description: 'Designed with banking-level security principles, client-side encryption, and seamless data visualization using modern high-performance charting libraries.',
        technologies: JSON.stringify(['React', 'TypeScript', 'TailwindCSS', 'Express', 'SQLite']),
        image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop',
        github_url: 'https://github.com/hamzaeshtiba/finvault-asset-tracker',
        live_url: 'https://finvault.hamzaeshtiba.dev',
        featured: 0,
        order_index: 5,
        status: 'published'
      },
      {
        title: 'OmniStream - High Performance Video & Media Processing API',
        description: 'Scalable backend API service for automated video transcoding, thumbnail generation, watermark embedding, and Cloudflare R2 delivery.',
        long_description: 'FFmpeg-powered microservice built on Node.js streams and worker threads. Automatically optimizes uploaded assets for fast adaptive bitrate streaming across mobile and web.',
        technologies: JSON.stringify(['Node.js', 'Express', 'FFmpeg', 'Cloudflare R2', 'Docker']),
        image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop',
        github_url: 'https://github.com/hamzaeshtiba/omnistream-media-api',
        live_url: 'https://omnistream.hamzaeshtiba.dev',
        featured: 0,
        order_index: 6,
        status: 'published'
      }
    ];

    for (const proj of sampleProjects) {
      const id = uuidv4();
      dbRun(`
        INSERT INTO projects (id, title, description, long_description, technologies, image_url, github_url, live_url, featured, order_index, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, proj.title, proj.description, proj.long_description,
        proj.technologies, proj.image_url, proj.github_url, proj.live_url,
        proj.featured, proj.order_index, proj.status
      ]);
    }
    console.log(`✅ Seeded ${sampleProjects.length} sample projects successfully`);
  }

  saveDb();
  console.log('🎉 Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
