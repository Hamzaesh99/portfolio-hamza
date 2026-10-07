import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import { initDatabase } from './database/init.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import uploadRoutes from './routes/uploads.js';
import contactRoutes from './routes/contact.js';
import settingsRoutes from './routes/settings.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database and start server will be called at the bottom

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    // Allow by default or callback
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOADS_DIR || 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);

// Root welcome & Health check
app.get('/', (req, res) => {
  res.json({ message: 'Hamza Eshtiba Portfolio API is running 🚀', health: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to initialize database and start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
