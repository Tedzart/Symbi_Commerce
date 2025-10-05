// app/api/testdb/route.js
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return Response.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    return Response.json({ 
      success: false,
      error: err.message,
      stack: err.stack
    }, { status: 500 });
  }
}