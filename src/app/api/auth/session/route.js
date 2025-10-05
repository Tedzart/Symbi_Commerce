import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function GET() {
  const userId = cookies().get('user_id')?.value;
  
  if (!userId) {
    return new Response(JSON.stringify({ isAuthenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = await pool.connect();
  
  try {
    const user = await client.query(
      'SELECT id, fname, lname, email FROM cusinfo WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return new Response(JSON.stringify({ isAuthenticated: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      isAuthenticated: true,
      user: user.rows[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Session validation error:', error);
    return new Response(JSON.stringify({ isAuthenticated: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    client.release();
  }
}