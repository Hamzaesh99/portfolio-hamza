import express from 'express';
import { dbAll, dbRun, saveDb } from '../database/init.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to safely parse JSON strings
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

// GET /api/settings - Public: Get all site settings
router.get('/', (req, res, next) => {
  try {
    const rows = dbAll('SELECT key, value FROM site_settings');
    const settings = {};
    for (const row of rows) {
      settings[row.key] = parseValue(row.value);
    }
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings - Protected: Update site settings
router.put('/', authenticate, (req, res, next) => {
  try {
    const payload = req.body.settings || req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Settings payload must be an object.' });
    }

    for (const [key, rawVal] of Object.entries(payload)) {
      const valueToStore = typeof rawVal === 'object' && rawVal !== null ? JSON.stringify(rawVal) : String(rawVal ?? '');
      dbRun(
        'INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP',
        [key, valueToStore]
      );
    }

    saveDb();

    // Return the updated settings object
    const rows = dbAll('SELECT key, value FROM site_settings');
    const updated = {};
    for (const row of rows) {
      updated[row.key] = parseValue(row.value);
    }

    res.json({
      message: 'Settings updated successfully.',
      settings: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
