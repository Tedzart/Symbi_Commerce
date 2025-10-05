import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import pool from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const email = session.user.email;

    // Get all orders for the logged-in user by email, newest first
    const ordersRes = await pool.query(
      `SELECT * FROM orders WHERE email = $1 ORDER BY created_at DESC`,
      [email]
    );

    const orders = ordersRes.rows;

    // For each order, fetch associated order_items joined with product details
    const fullOrders = await Promise.all(
      orders.map(async (order) => {
        const itemsRes = await pool.query(
          `SELECT oi.*, p.name, p.description, p.image_url
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
          [order.id]
        );

        return {
          ...order,
          items: itemsRes.rows,
        };
      })
    );

    return new Response(JSON.stringify(fullOrders), { status: 200 });
  } catch (err) {
    console.error("Order API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
