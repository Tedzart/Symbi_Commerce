import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import pool from '@/lib/db';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  try {
    const { items, total_amount } = await request.json();
    const userId = session.user.id; 
     const email = session.user.email;// Get user ID from session
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Insert order with user ID
      const orderRes = await client.query(
        `INSERT INTO orders (user_id, total_amount, status,email) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [userId, total_amount, 'pending',email]
      );

      const orderId = orderRes.rows[0].id;

      // Insert order items
      for (const item of items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price,user_id) VALUES ($1, $2, $3, $4, $5)',
          [orderId, item.product_id, item.quantity, item.price, userId ]
        );
      }

      await client.query('COMMIT');
      return new Response(JSON.stringify({ success: true, orderId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Order processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}