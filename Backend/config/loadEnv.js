/**
 * Load Backend/.env regardless of process.cwd() (fixes admin login when
 * `node server.js` or `nodemon` is run from the repo root or another folder).
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });
