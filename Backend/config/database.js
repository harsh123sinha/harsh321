import './loadEnv.js';
import mysql from 'mysql2';

// Create connection pool (reusing legacy DB configuration)
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'realestate',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisified pool for async/await
const promisePool = pool.promise();

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('   Check your .env file and ensure MySQL is running');
  } else {
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME);
    connection.release();
  }
});

export default promisePool;
