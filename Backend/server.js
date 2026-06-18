import './config/loadEnv.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensurePropertySchema } from './utils/ensurePropertySchema.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import subAdminRoutes from './routes/subAdminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS: comma-separated FRONTEND_URL values; in development also allow any localhost / 127.0.0.1 port (Vite may use 5174, etc.)
const parseAllowedOrigins = () => {
  const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();
const isDevLocalOrigin = (origin) => {
  if (process.env.NODE_ENV === 'production') return false;
  try {
    const u = new URL(origin);
    const host = u.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    return isLocal && (u.protocol === 'http:' || u.protocol === 'https:');
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isDevLocalOrigin(origin)) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images (legacy compatibility: /images/)
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Real Estate API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subadmin', subAdminRoutes);
app.use('/api/public', publicRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server (ensure DB columns for properties exist — same as migrations/002)
async function start() {
  try {
    await ensurePropertySchema();
  } catch (e) {
    console.error('⚠️ ensurePropertySchema failed — run Backend/migrations/002_property_amenities.sql in MySQL:', e.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Real Estate API running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 CORS allowlist: ${allowedOrigins.join(', ')}${process.env.NODE_ENV !== 'production' ? ' (+ dev localhost/127.0.0.1 any port)' : ''}`);
  });
}

start();
