import './config/loadEnv.js';
import express from 'express';
import cors from 'cors';
import { ensurePropertySchema } from './utils/ensurePropertySchema.js';
import { ensureNotificationSchema } from './utils/ensureNotificationSchema.js';
import { ensureAdminSchema } from './utils/ensureAdminSchema.js';
import { isFirebaseConfigured } from './config/firebaseAdmin.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import subAdminRoutes from './routes/subAdminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import savedPropertyRoutes from './routes/savedPropertyRoutes.js';

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
app.use('/api/notifications', notificationRoutes);
app.use('/api/saved-properties', savedPropertyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const status =
    err.status ||
    (err.code === 'LIMIT_FILE_SIZE' ? 400 : undefined) ||
    (err.code === 'LIMIT_FILE_COUNT' ? 400 : undefined) ||
    500;
  res.status(status).json({
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

  try {
    await ensureNotificationSchema();
  } catch (e) {
    console.error('⚠️ ensureNotificationSchema failed — run Backend/migrations/003_fcm_notifications.sql:', e.message);
  }

  try {
    await ensureAdminSchema();
  } catch (e) {
    console.error('⚠️ ensureAdminSchema failed — run Backend/migrations/004_admin_accounts.sql:', e.message);
  }

  if (process.env.ENABLE_DAILY_RECOMMENDATIONS !== 'false') {
    try {
      const cron = await import('node-cron');
      const { runDailyRecommendations } = await import('./services/dailyRecommendations.js');
      cron.default.schedule(
        process.env.DAILY_RECOMMENDATIONS_CRON || '0 8 * * *',
        () => {
          runDailyRecommendations()
            .then((r) => console.log('📬 Daily recommendations:', r))
            .catch((err) => console.error('Daily recommendations error:', err.message));
        },
        { timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata' }
      );
      console.log('📅 Daily recommendation cron scheduled');
    } catch (e) {
      console.warn('⚠️ node-cron not available — daily recommendations disabled');
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Real Estate API running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 CORS allowlist: ${allowedOrigins.join(', ')}${process.env.NODE_ENV !== 'production' ? ' (+ dev localhost/127.0.0.1 any port)' : ''}`);
    const awsOk =
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION &&
      process.env.AWS_BUCKET;
    if (!awsOk) {
      console.warn('⚠️  AWS S3 not configured — property image uploads will fail until AWS_* vars are set in Backend/.env');
    }
    if (!isFirebaseConfigured()) {
      console.warn('⚠️  Firebase Admin not configured — push notifications will be in-app only until FIREBASE_* vars are set');
    }
  });
}

start();
