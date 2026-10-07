import bcrypt from 'bcryptjs';

// WebCrypto JWT Helpers
async function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = new TextEncoder();
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + 7 * 86400 };
  const b64 = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${b64(header)}.${b64(fullPayload)}`;
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(unsignedToken));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${unsignedToken}.${sigB64}`;
}

async function verifyJwt(token, secret) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const binarySig = atob(sigB64.replace(/-/g, '+').replace(/_/g, '/'));
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) sigBytes[i] = binarySig.charCodeAt(i);
    const unsignedToken = `${headerB64}.${payloadB64}`;
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(unsignedToken));
    if (!valid) return null;
    const payload = JSON.parse(decodeURIComponent(escape(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// CORS Helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...headers,
    },
  });
}

// Helper to format projects
function formatProject(project) {
  if (!project) return null;
  let images = [];
  try {
    if (project.images) {
      images = typeof project.images === 'string' ? JSON.parse(project.images) : project.images;
    }
  } catch {}
  if (!Array.isArray(images) || images.length === 0) {
    images = project.image_url ? [project.image_url] : [];
  }
  let technologies = [];
  try {
    technologies = typeof project.technologies === 'string' ? JSON.parse(project.technologies) : (project.technologies || []);
  } catch {
    technologies = typeof project.technologies === 'string' ? project.technologies.split(',').map(t => t.trim()) : [];
  }
  return {
    ...project,
    images: images.slice(0, 5),
    image_url: images[0] || project.image_url || null,
    technologies,
    featured: Boolean(project.featured),
  };
}

function parseValue(val) {
  if (typeof val !== 'string') return val;
  try {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      return JSON.parse(trimmed);
    }
    return val;
  } catch {
    return val;
  }
}

// Extract auth token
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  const jwtSecret = env.JWT_SECRET || 'fallback_secret_hamza_portfolio_2026';
  return await verifyJwt(token, jwtSecret);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Handle OPTIONS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Storage for uploaded images
    // GET /uploads/:filename
    if (pathname.startsWith('/uploads/') && method === 'GET') {
      const filename = pathname.replace('/uploads/', '');
      if (!filename || filename.includes('..')) {
        return jsonResponse({ error: 'Invalid filename' }, 400);
      }

      // Check R2 if configured
      if (env.R2_BUCKET) {
        const obj = await env.R2_BUCKET.get(filename);
        if (obj) {
          const headers = new Headers();
          obj.writeHttpMetadata(headers);
          headers.set('etag', obj.httpEtag);
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
          return new Response(obj.body, { headers });
        }
      }

      // Check KV if configured
      if (env.STORAGE) {
        const imgMeta = await env.STORAGE.getWithMetadata(`meta:${filename}`);
        const imgData = await env.STORAGE.get(filename, 'arrayBuffer');
        if (imgData) {
          const contentType = imgMeta?.metadata?.contentType || 'image/png';
          return new Response(imgData, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
              ...corsHeaders,
            },
          });
        }
      }

      return jsonResponse({ error: 'Image not found' }, 404);
    }

    // Health check
    if (pathname === '/api/health' && method === 'GET') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Root Welcome
    if (pathname === '/' && request.headers.get('accept')?.includes('application/json')) {
      return jsonResponse({ message: 'Hamza Eshtiba Portfolio API is running 🚀', health: '/api/health' });
    }

    // ==========================================
    // API ROUTES
    // ==========================================
    if (pathname.startsWith('/api/')) {
      const db = env.DB;
      if (!db) {
        return jsonResponse({ error: 'Database binding (DB) not configured' }, 500);
      }

      const jwtSecret = env.JWT_SECRET || 'fallback_secret_hamza_portfolio_2026';

      try {
        // --- 1. AUTH ROUTES ---
        // POST /api/auth/login
        if (pathname === '/api/auth/login' && method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const { email, password } = body;
          if (!email || !password) {
            return jsonResponse({ error: 'Email and password are required' }, 400);
          }

          const admin = await db.prepare('SELECT * FROM admins WHERE email = ?').bind(email.toLowerCase().trim()).first();
          if (!admin) {
            return jsonResponse({ error: 'Invalid credentials.' }, 401);
          }

          const isMatch = await bcrypt.compare(password, admin.password);
          if (!isMatch) {
            return jsonResponse({ error: 'Invalid credentials.' }, 401);
          }

          const token = await signJwt({ id: admin.id, email: admin.email }, jwtSecret);
          return jsonResponse({ token, admin: { id: admin.id, email: admin.email } });
        }

        // GET /api/auth/me
        if (pathname === '/api/auth/me' && method === 'GET') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);
          return jsonResponse({ admin: adminUser });
        }

        // POST /api/auth/change-password
        if (pathname === '/api/auth/change-password' && method === 'POST') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const body = await request.json().catch(() => ({}));
          const { currentPassword, newPassword } = body;
          if (!currentPassword || !newPassword || newPassword.length < 8) {
            return jsonResponse({ error: 'New password must be at least 8 characters' }, 400);
          }

          const admin = await db.prepare('SELECT * FROM admins WHERE id = ?').bind(adminUser.id).first();
          if (!admin) return jsonResponse({ error: 'Admin not found' }, 404);

          const isMatch = await bcrypt.compare(currentPassword, admin.password);
          if (!isMatch) return jsonResponse({ error: 'Current password is incorrect.' }, 401);

          const hashed = await bcrypt.hash(newPassword, 12);
          await db.prepare('UPDATE admins SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(hashed, adminUser.id).run();

          return jsonResponse({ message: 'Password changed successfully.' });
        }

        // --- 2. PROJECTS ROUTES ---
        // GET /api/projects
        if (pathname === '/api/projects' && method === 'GET') {
          const featured = url.searchParams.get('featured');
          const limit = url.searchParams.get('limit');

          let query = `SELECT * FROM projects WHERE status = 'published'`;
          const params = [];

          if (featured === 'true') {
            query += ` AND featured = 1`;
          }

          query += ` ORDER BY featured DESC, order_index ASC, created_at DESC`;

          if (limit) {
            query += ` LIMIT ?`;
            params.push(parseInt(limit, 10));
          }

          let stmt = db.prepare(query);
          if (params.length > 0) stmt = stmt.bind(...params);
          const { results } = await stmt.all();

          return jsonResponse({ projects: (results || []).map(formatProject) });
        }

        // GET /api/projects/admin
        if (pathname === '/api/projects/admin' && method === 'GET') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const { results } = await db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
          return jsonResponse({ projects: (results || []).map(formatProject) });
        }

        // POST /api/projects
        if (pathname === '/api/projects' && method === 'POST') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const body = await request.json().catch(() => ({}));
          const {
            title, description, long_description, technologies,
            image_url, images, github_url, live_url, featured, order_index, status
          } = body;

          if (!title || !description || !technologies) {
            return jsonResponse({ error: 'Title, description, and technologies are required.' }, 400);
          }

          const id = crypto.randomUUID();
          let imagesList = [];
          if (Array.isArray(images)) {
            imagesList = images.filter(Boolean).slice(0, 5);
          } else if (image_url) {
            imagesList = [image_url];
          }
          const coverImage = imagesList[0] || image_url || null;

          let techStr = typeof technologies === 'string' ? technologies : JSON.stringify(technologies);

          await db.prepare(`
            INSERT INTO projects (id, title, description, long_description, technologies, image_url, images, github_url, live_url, featured, order_index, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `).bind(
            id, title.trim(), description.trim(), long_description || null,
            techStr, coverImage, JSON.stringify(imagesList),
            github_url || null, live_url || null,
            featured ? 1 : 0, order_index || 0, status || 'published'
          ).run();

          const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
          return jsonResponse({ project: formatProject(project), message: 'Project created successfully.' }, 201);
        }

        // GET, PUT, DELETE /api/projects/:id
        const projectMatch = pathname.match(/^\/api\/projects\/([a-zA-Z0-9_-]+)$/);
        if (projectMatch) {
          const projectId = projectMatch[1];

          if (method === 'GET') {
            const project = await db.prepare(`SELECT * FROM projects WHERE id = ? AND status = 'published'`).bind(projectId).first();
            if (!project) return jsonResponse({ error: 'Project not found.' }, 404);
            return jsonResponse({ project: formatProject(project) });
          }

          if (method === 'PUT') {
            const adminUser = await authenticateRequest(request, env);
            if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

            const existing = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first();
            if (!existing) return jsonResponse({ error: 'Project not found.' }, 404);

            const body = await request.json().catch(() => ({}));
            const {
              title, description, long_description, technologies,
              image_url, images, github_url, live_url, featured, order_index, status
            } = body;

            let imagesJson = existing.images;
            let coverImage = existing.image_url;
            if (images !== undefined) {
              const arr = Array.isArray(images) ? images.filter(Boolean).slice(0, 5) : [];
              imagesJson = JSON.stringify(arr);
              coverImage = arr[0] || null;
            } else if (image_url !== undefined) {
              coverImage = image_url;
              imagesJson = JSON.stringify(image_url ? [image_url] : []);
            }

            let techStr = technologies !== undefined
              ? (typeof technologies === 'string' ? technologies : JSON.stringify(technologies))
              : existing.technologies;

            await db.prepare(`
              UPDATE projects SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                long_description = COALESCE(?, long_description),
                technologies = ?,
                image_url = ?,
                images = ?,
                github_url = COALESCE(?, github_url),
                live_url = COALESCE(?, live_url),
                featured = COALESCE(?, featured),
                order_index = COALESCE(?, order_index),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `).bind(
              title !== undefined ? title : null,
              description !== undefined ? description : null,
              long_description !== undefined ? long_description : null,
              techStr,
              coverImage,
              imagesJson,
              github_url !== undefined ? github_url : null,
              live_url !== undefined ? live_url : null,
              featured !== undefined ? (featured ? 1 : 0) : null,
              order_index !== undefined ? order_index : null,
              status !== undefined ? status : null,
              projectId
            ).run();

            const updated = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first();
            return jsonResponse({ project: formatProject(updated), message: 'Project updated successfully.' });
          }

          if (method === 'DELETE') {
            const adminUser = await authenticateRequest(request, env);
            if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

            const existing = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first();
            if (!existing) return jsonResponse({ error: 'Project not found.' }, 404);

            await db.prepare('DELETE FROM projects WHERE id = ?').bind(projectId).run();
            return jsonResponse({ message: 'Project deleted successfully.' });
          }
        }

        // PATCH /api/projects/:id/toggle-featured
        const toggleMatch = pathname.match(/^\/api\/projects\/([a-zA-Z0-9_-]+)\/toggle-featured$/);
        if (toggleMatch && method === 'PATCH') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const projectId = toggleMatch[1];
          const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first();
          if (!project) return jsonResponse({ error: 'Project not found.' }, 404);

          const newFeatured = project.featured ? 0 : 1;
          await db.prepare('UPDATE projects SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(newFeatured, projectId).run();

          return jsonResponse({ featured: Boolean(newFeatured), message: 'Featured status updated.' });
        }

        // --- 3. UPLOADS ROUTES ---
        // POST /api/uploads/project-image (Single)
        if (pathname === '/api/uploads/project-image' && method === 'POST') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const formData = await request.formData();
          const file = formData.get('image');
          if (!file || typeof file === 'string') {
            return jsonResponse({ error: 'No image file provided.' }, 400);
          }

          const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'png';
          const filename = `project-${crypto.randomUUID()}.${ext}`;
          const arrayBuffer = await file.arrayBuffer();

          if (env.R2_BUCKET) {
            await env.R2_BUCKET.put(filename, arrayBuffer, {
              httpMetadata: { contentType: file.type || 'image/png' }
            });
          } else if (env.STORAGE) {
            await env.STORAGE.put(filename, arrayBuffer);
            await env.STORAGE.put(`meta:${filename}`, '1', {
              metadata: { contentType: file.type || 'image/png' }
            });
          }

          const imageUrl = `/uploads/${filename}`;
          return jsonResponse({
            url: imageUrl,
            filename,
            size: file.size,
            message: 'Image uploaded successfully.'
          });
        }

        // POST /api/uploads/project-images (Multiple)
        if (pathname === '/api/uploads/project-images' && method === 'POST') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const formData = await request.formData();
          const files = formData.getAll('images');
          if (!files || files.length === 0) {
            return jsonResponse({ error: 'No image files provided.' }, 400);
          }

          const urls = [];
          for (const file of files.slice(0, 5)) {
            if (!file || typeof file === 'string') continue;
            const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'png';
            const filename = `project-${crypto.randomUUID()}.${ext}`;
            const arrayBuffer = await file.arrayBuffer();

            if (env.R2_BUCKET) {
              await env.R2_BUCKET.put(filename, arrayBuffer, {
                httpMetadata: { contentType: file.type || 'image/png' }
              });
            } else if (env.STORAGE) {
              await env.STORAGE.put(filename, arrayBuffer);
              await env.STORAGE.put(`meta:${filename}`, '1', {
                metadata: { contentType: file.type || 'image/png' }
              });
            }
            urls.push(`/uploads/${filename}`);
          }

          return jsonResponse({ urls, count: urls.length, message: 'Images uploaded successfully.' });
        }

        // DELETE /api/uploads/:filename
        const uploadDelMatch = pathname.match(/^\/api\/uploads\/([a-zA-Z0-9_.-]+)$/);
        if (uploadDelMatch && method === 'DELETE') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const filename = uploadDelMatch[1];
          if (env.R2_BUCKET) {
            await env.R2_BUCKET.delete(filename);
          } else if (env.STORAGE) {
            await env.STORAGE.delete(filename);
            await env.STORAGE.delete(`meta:${filename}`);
          }

          return jsonResponse({ message: 'File deleted successfully.' });
        }

        // --- 4. CONTACT ROUTES ---
        // POST /api/contact
        if (pathname === '/api/contact' && method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const { name, email, subject, message } = body;

          if (!name || !email || !message || message.length < 10) {
            return jsonResponse({ error: 'Valid name, email, and message (min 10 chars) are required.' }, 400);
          }

          await db.prepare(`
            INSERT INTO contacts (name, email, subject, message, created_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(name.trim(), email.trim(), subject ? subject.trim() : null, message.trim()).run();

          return jsonResponse({ message: 'Message sent successfully! I will get back to you soon.' }, 201);
        }

        // GET /api/contact
        if (pathname === '/api/contact' && method === 'GET') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const { results } = await db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
          return jsonResponse({ contacts: results || [] });
        }

        // PATCH /api/contact/:id/read
        const contactReadMatch = pathname.match(/^\/api\/contact\/([0-9]+)\/read$/);
        if (contactReadMatch && method === 'PATCH') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const contactId = contactReadMatch[1];
          await db.prepare('UPDATE contacts SET read = 1 WHERE id = ?').bind(contactId).run();
          return jsonResponse({ message: 'Marked as read.' });
        }

        // DELETE /api/contact/:id
        const contactDelMatch = pathname.match(/^\/api\/contact\/([0-9]+)$/);
        if (contactDelMatch && method === 'DELETE') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const contactId = contactDelMatch[1];
          await db.prepare('DELETE FROM contacts WHERE id = ?').bind(contactId).run();
          return jsonResponse({ message: 'Message deleted.' });
        }

        // --- 5. SETTINGS CMS ROUTES ---
        // GET /api/settings
        if (pathname === '/api/settings' && method === 'GET') {
          const { results } = await db.prepare('SELECT key, value FROM site_settings').all();
          const settings = {};
          for (const row of results || []) {
            settings[row.key] = parseValue(row.value);
          }
          return jsonResponse(settings);
        }

        // PUT /api/settings
        if (pathname === '/api/settings' && method === 'PUT') {
          const adminUser = await authenticateRequest(request, env);
          if (!adminUser) return jsonResponse({ error: 'Unauthorized' }, 401);

          const body = await request.json().catch(() => ({}));
          const payload = body.settings || body;
          if (!payload || typeof payload !== 'object') {
            return jsonResponse({ error: 'Settings payload must be an object.' }, 400);
          }

          for (const [key, rawVal] of Object.entries(payload)) {
            const valueToStore = typeof rawVal === 'object' && rawVal !== null ? JSON.stringify(rawVal) : String(rawVal ?? '');
            await db.prepare(`
              INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
            `).bind(key, valueToStore).run();
          }

          const { results } = await db.prepare('SELECT key, value FROM site_settings').all();
          const updated = {};
          for (const row of results || []) {
            updated[row.key] = parseValue(row.value);
          }

          return jsonResponse({ message: 'Settings updated successfully.', settings: updated });
        }

        return jsonResponse({ error: 'Route not found' }, 404);
      } catch (err) {
        console.error('API Error:', err);
        return jsonResponse({ error: err.message || 'Internal Server Error' }, 500);
      }
    }

    // Static Assets Fallback (Frontend SPA)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
