import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// POST /api/uploads/project-image - Protected: Upload project image (single)
router.post('/project-image', authenticate, upload.single('image'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
      message: 'Image uploaded successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/uploads/project-images - Protected: Upload up to 5 project images
router.post('/project-images', authenticate, upload.array('images', 5), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided.' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);

    res.json({
      urls,
      count: urls.length,
      message: 'Images uploaded successfully.'
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/uploads/:filename - Protected: Delete uploaded file
router.delete('/:filename', authenticate, (req, res, next) => {
  try {
    const { filename } = req.params;
    const UPLOADS_DIR = process.env.UPLOADS_DIR || './uploads';
    const filePath = path.resolve(UPLOADS_DIR, filename);

    // Security: ensure path is within uploads directory
    const uploadsPath = path.resolve(UPLOADS_DIR);
    if (!filePath.startsWith(uploadsPath)) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found.' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
