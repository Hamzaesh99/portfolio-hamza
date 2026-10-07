import express from 'express';
import { body, validationResult, param } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { dbAll, dbGet, dbRun, saveDb } from '../database/init.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to parse technologies
function parseTechnologies(tech) {
  if (Array.isArray(tech)) return JSON.stringify(tech);
  if (typeof tech === 'string') {
    try { JSON.parse(tech); return tech; } catch { return JSON.stringify(tech.split(',').map(t => t.trim())); }
  }
  return '[]';
}

function formatProject(project) {
  if (!project) return null;
  let images = [];
  try {
    if (project.images) {
      images = typeof project.images === 'string' ? JSON.parse(project.images) : project.images;
    }
  } catch {}
  if (!Array.isArray(images) || images.length === 0) {
    if (project.image_url) {
      images = [project.image_url];
    } else {
      images = [];
    }
  }
  return {
    ...project,
    images: images.slice(0, 5),
    image_url: images[0] || project.image_url || null,
    technologies: JSON.parse(project.technologies || '[]'),
    featured: Boolean(project.featured)
  };
}

// GET /api/projects - Public: Get all published projects
router.get('/', (req, res, next) => {
  try {
    const { featured, limit } = req.query;

    let query = `SELECT * FROM projects WHERE status = 'published'`;
    const params = [];

    if (featured === 'true') {
      query += ` AND featured = 1`;
    }

    query += ` ORDER BY featured DESC, order_index ASC, created_at DESC`;

    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit));
    }

    const projects = dbAll(query, params);
    res.json({ projects: projects.map(formatProject) });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/admin - Protected: Get all projects including drafts
router.get('/admin', authenticate, (req, res, next) => {
  try {
    const projects = dbAll(`SELECT * FROM projects ORDER BY created_at DESC`);
    res.json({ projects: projects.map(formatProject) });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id - Public: Get single project
router.get('/:id', [
  param('id').notEmpty().withMessage('ID required')
], (req, res, next) => {
  try {
    const project = dbGet(`SELECT * FROM projects WHERE id = ? AND status = 'published'`, [req.params.id]);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ project: formatProject(project) });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects - Protected: Create project
router.post('/', authenticate, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('technologies').notEmpty().withMessage('Technologies are required'),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      title, description, long_description, technologies,
      image_url, images, github_url, live_url, featured, order_index, status
    } = req.body;

    const id = uuidv4();
    let imagesList = [];
    if (Array.isArray(images)) {
      imagesList = images.filter(Boolean).slice(0, 5);
    } else if (image_url) {
      imagesList = [image_url];
    }
    const coverImage = imagesList[0] || image_url || null;

    dbRun(`
      INSERT INTO projects (id, title, description, long_description, technologies, image_url, images, github_url, live_url, featured, order_index, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, title, description, long_description || null,
      parseTechnologies(technologies),
      coverImage,
      JSON.stringify(imagesList),
      github_url || null, live_url || null,
      featured ? 1 : 0,
      order_index || 0,
      status || 'published'
    ]);
    saveDb();

    const project = dbGet('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json({ project: formatProject(project), message: 'Project created successfully.' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id - Protected: Update project
router.put('/:id', authenticate, [
  param('id').notEmpty(),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const existing = dbGet('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Project not found.' });

    const {
      title, description, long_description, technologies,
      image_url, images, github_url, live_url, featured, order_index, status
    } = req.body;

    let imagesJson = null;
    let coverImage = null;
    if (images !== undefined) {
      const arr = Array.isArray(images) ? images.filter(Boolean).slice(0, 5) : [];
      imagesJson = JSON.stringify(arr);
      coverImage = arr[0] || null;
    } else if (image_url !== undefined) {
      coverImage = image_url;
      imagesJson = JSON.stringify(image_url ? [image_url] : []);
    }

    dbRun(`
      UPDATE projects SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        long_description = COALESCE(?, long_description),
        technologies = COALESCE(?, technologies),
        image_url = COALESCE(?, image_url),
        images = COALESCE(?, images),
        github_url = COALESCE(?, github_url),
        live_url = COALESCE(?, live_url),
        featured = COALESCE(?, featured),
        order_index = COALESCE(?, order_index),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title !== undefined ? title : null,
      description !== undefined ? description : null,
      long_description !== undefined ? long_description : null,
      technologies !== undefined ? parseTechnologies(technologies) : null,
      coverImage !== null ? coverImage : (image_url !== undefined ? image_url : null),
      imagesJson,
      github_url !== undefined ? (github_url || null) : null,
      live_url !== undefined ? (live_url || null) : null,
      featured !== undefined ? (featured ? 1 : 0) : null,
      order_index !== undefined ? order_index : null,
      status !== undefined ? status : null,
      req.params.id
    ]);
    saveDb();

    const project = dbGet('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    res.json({ project: formatProject(project), message: 'Project updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id - Protected: Delete project
router.delete('/:id', authenticate, (req, res, next) => {
  try {
    const existing = dbGet('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Project not found.' });

    dbRun('DELETE FROM projects WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id/toggle-featured - Protected: Toggle featured
router.patch('/:id/toggle-featured', authenticate, (req, res, next) => {
  try {
    const project = dbGet('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!project) return res.status(404).json({ error: 'Project not found.' });

    const newFeatured = project.featured ? 0 : 1;
    dbRun('UPDATE projects SET featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newFeatured, req.params.id]);
    saveDb();

    res.json({ featured: Boolean(newFeatured), message: 'Featured status updated.' });
  } catch (err) {
    next(err);
  }
});

export default router;
