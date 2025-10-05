"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function OrdersPageClient() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/customer/orders");
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err?.error || "Failed to fetch orders");
        }
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("API did not return an array");
        }

        setOrders(data);
      } catch (err) {
        setError(err.message);
        setOrders([]);
      }
    };

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

  if (status === "loading") return <p>Loading session...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (status !== "authenticated") return <p>Please log in to view your orders.</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="border rounded p-4 mb-6 shadow-sm">
            <p>
              <strong>Order ID:</strong> {order.id}
            </p>
            <p>
              <strong>Date:</strong> {new Date(order.created_at).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
           <p>
  <strong>Total:</strong> ${Number(order.total_amount).toFixed(2)}
</p>

            <div className="mt-4">
              <strong>Items:</strong>
              <ul className="mt-2">
               {order.items.map((item, index) => (
  <div key={index} className="flex items-center gap-4 border p-2 rounded">
    <img
      src={item.image_url} // Use the full URL saved during upload
      alt={item.name}
      className="w-16 h-16 object-cover rounded"
    />
    <div>
      <p className="font-semibold">{item.name}</p>
      <p>Quantity: {item.quantity}</p>
      <p>Price: ${Number(item.price).toFixed(2)}</p>
    </div>
  </div>
))}

              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
