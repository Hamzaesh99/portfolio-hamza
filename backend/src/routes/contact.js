import express from 'express';
import { body, validationResult } from 'express-validator';
import { dbAll, dbRun, saveDb } from '../database/init.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/contact - Public: Submit contact form
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('subject').optional().trim()
], (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, subject, message } = req.body;

    dbRun(`
      INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)
    `, [name, email, subject || null, message]);
    saveDb();

    res.status(201).json({ message: 'Message sent successfully! I will get back to you soon.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/contact - Protected: Get all messages
router.get('/', authenticate, (req, res, next) => {
  try {
    const contacts = dbAll('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ contacts });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/contact/:id/read - Protected: Mark as read
router.patch('/:id/read', authenticate, (req, res, next) => {
  try {
    dbRun('UPDATE contacts SET read = 1 WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contact/:id - Protected: Delete message
router.delete('/:id', authenticate, (req, res, next) => {
  try {
    dbRun('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    saveDb();
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
