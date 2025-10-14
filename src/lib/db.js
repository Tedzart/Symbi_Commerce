// lib/db.js
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  // Fail fast so the error is visible in logs instead of silently using localhost
  throw new Error(
    'Missing DATABASE_URL environment variable. Set it in Vercel (Settings → Environment Variables).'
  );
}

let pool = global.__pgPool;

if (!pool) {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // required for Neon
    max: 10, // tune down if you see "too many connections"
  });
  global.__pgPool = pool;
}

module.exports = pool;
