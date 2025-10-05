import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT id, name, price, description, image_url, category 
      FROM products 
      ORDER BY created_at DESC
      LIMIT 8
    `);
    client.release();
    
    return Response.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    return Response.json(
      { error: 'Failed to fetch products' }, 
      { status: 500 }
    );
  }
}