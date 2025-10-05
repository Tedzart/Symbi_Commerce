import pool from '@/lib/db';

export async function GET(request, { params }) {
  const id = params.id;
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to fetch product' }), { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(request, { params }) {
  const id = params.id;
  const updatedData = await request.json();
  const client = await pool.connect();

  try {
    await client.query(
      `UPDATE products SET name = $1, price = $2, stock = $3 WHERE id = $4`,
      [updatedData.name, updatedData.price, updatedData.stock, id]
    );
    return new Response(JSON.stringify({ message: 'Product updated' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to update product' }), { status: 500 });
  } finally {
    client.release();
  }
}
