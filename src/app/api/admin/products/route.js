import pool from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const client = await pool.connect();
  
  try {
    if (id) {
      // Fetch single product
      const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: 'Product not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify(result.rows[0]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Fetch all products
      const result = await client.query('SELECT * FROM products ORDER BY id DESC');
      return new Response(JSON.stringify(result.rows), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    client.release();
  }
}

export async function POST(request) {
  try {
    const productData = await request.json();
    
    // Basic validation
    if (!productData.name || !productData.price || productData.stock === undefined) {
      return new Response(JSON.stringify({ 
        error: 'Name, price and stock are required' 
      }), { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      `INSERT INTO products 
       (name, price, stock, description, image_url, category) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        productData.name,
        productData.price,
        productData.stock,
        productData.description || null,
        productData.image_url || null,
        productData.category || null
      ]
    );
    client.release();

    return new Response(JSON.stringify(result.rows[0]), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Database error:', err);
    return new Response(JSON.stringify({ 
      error: 'Failed to create product' 
    }), { status: 500 });
  }
}

export async function PUT(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response(JSON.stringify({ error: 'Product ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const productData = await request.json();
    
    // Basic validation
    if (!productData.name || !productData.price || productData.stock === undefined) {
      return new Response(JSON.stringify({ 
        error: 'Name, price and stock are required' 
      }), { status: 400 });
    }

    const client = await pool.connect();
    
    // First check if product exists
    const checkResult = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update the product
    const result = await client.query(
      `UPDATE products SET
        name = $1,
        price = $2,
        stock = $3,
        description = $4,
        image_url = $5,
        category = $6,
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        productData.name,
        productData.price,
        productData.stock,
        productData.description || null,
        productData.image_url || null,
        productData.category || null,
        id
      ]
    );
    client.release();

    return new Response(JSON.stringify(result.rows[0]), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Database error:', err);
    return new Response(JSON.stringify({ 
      error: 'Failed to update product' 
    }), { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  let id = searchParams.get('id');

  // Convert ID to integer if needed
  id = parseInt(id, 10);
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: 'Invalid product ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = await pool.connect();
  
  try {
    // Check if product exists
    const checkResult = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete the product
    await client.query('DELETE FROM products WHERE id = $1', [id]);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Handle foreign key constraint violation
    if (error.code === '23503') { // PostgreSQL foreign key violation code
      return new Response(JSON.stringify({ 
        error: 'Cannot delete product - it is referenced by other records'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Database error',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    client.release();
  }
}