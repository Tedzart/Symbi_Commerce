// pages/api/check-db.js
const pool = require('../../lib/db');

module.exports = async function handler(req, res) {
  try {
    const { rows } = await pool.query('SELECT now() as now');
    return res.status(200).json({ ok: true, now: rows[0].now });
  } catch (err) {
    console.error('CHECK-DB-ERROR', err);
    return res.status(500).json({ ok: false, message: 'DB error — check logs' });
  }
};
