/**
 * Apply DB changes without phpMyAdmin (uses Backend/.env — DB_HOST, DB_USER, DB_PASSWORD, DB_NAME).
 *
 *   cd Backend
 *   npm run db:migrate
 *
 * Same logic as server startup `ensurePropertySchema()` (ENUM + amenity columns + district/state).
 */
import '../config/loadEnv.js';
import db from '../config/database.js';
import { ensurePropertySchema } from '../utils/ensurePropertySchema.js';
import { ensureNotificationSchema } from '../utils/ensureNotificationSchema.js';
import { ensureAdminSchema } from '../utils/ensureAdminSchema.js';
import { ensureBrokerSchema } from '../utils/ensureBrokerSchema.js';
import { ensurePerformanceIndexes } from '../utils/ensurePerformanceIndexes.js';
import { ensureProjectSchema } from '../utils/ensureProjectSchema.js';
import { ensureWorkerSchema } from '../utils/ensureWorkerSchema.js';
import { ensureServiceDetailSchema } from '../utils/ensureServiceDetailSchema.js';
import { ensureMissionSchema } from '../utils/ensureMissionSchema.js';

async function main() {
  const name = process.env.DB_NAME || 'realestate';
  const host = process.env.DB_HOST || '127.0.0.1';
  console.log(`Connecting to MySQL: ${host} / database "${name}" …\n`);

  await ensurePropertySchema();
  await ensureNotificationSchema();
  await ensureAdminSchema();
  await ensureBrokerSchema();
  await ensurePerformanceIndexes();
  await ensureProjectSchema();
  await ensureWorkerSchema();
  await ensureServiceDetailSchema();
  await ensureMissionSchema();

  console.log('\nDone. You can start the API with: npm run dev');
  await db.end();
}

main().catch((err) => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});
