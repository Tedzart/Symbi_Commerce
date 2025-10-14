// src/app/api/check-db/route.js
import { createRequire } from 'module';
import { NextResponse } from 'next/server';

const require = createRequire(import.meta.url);
// adjust the path if your lib is at a different level
const pool = require('../../../../lib/db'); // <-- from src/app/api -> up to project root then lib/db.js

export async function GET() {
  try {
    const { rows } = await pool.query('SELECT now() as now');
    return NextResponse.json({ ok: true, now: rows[0].now });
  } catch (err) {
    console.error('CHECK-DB-ERROR', err);
    return NextResponse.json({ ok: false, message: 'DB error — check logs' }, { status: 500 });
  }
}
