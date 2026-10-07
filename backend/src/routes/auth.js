import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import { dbGet, dbRun, saveDb } from '../database/init.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    const admin = dbGet('SELECT * FROM admins WHERE email = ?', [email])
    if (!admin) return res.status(401).json({ error: 'Invalid credentials.' })

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' })

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({ token, admin: { id: admin.id, email: admin.email } })
  } catch (err) { next(err) }
})

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ admin: req.admin })
})

// POST /api/auth/change-password
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { currentPassword, newPassword } = req.body
    const admin = dbGet('SELECT * FROM admins WHERE id = ?', [req.admin.id])
    const isMatch = await bcrypt.compare(currentPassword, admin.password)
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' })

    const hashed = await bcrypt.hash(newPassword, 12)
    dbRun('UPDATE admins SET password = ? WHERE id = ?', [hashed, req.admin.id])
    saveDb()

    res.json({ message: 'Password changed successfully.' })
  } catch (err) { next(err) }
})

export default router
