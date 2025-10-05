'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'unknown', label: 'Unknown', color: 'bg-gray-100 text-gray-800' },
];

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '$0.00' : '$' + num.toFixed(2);
};

export default function OrderManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Update URL with current filters
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
        router.replace(`/admin/orders?${params.toString()}`);

        // Build API URL with filters
        const apiUrl = `/api/admin/orders?${params.toString()}`;
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch orders');
        }
        
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [statusFilter, startDate, endDate, router]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update order');

      const updatedOrder = await res.json();
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update order status: ' + err.message);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
  };

  if (loading) return <div className="p-6">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="text-sm text-gray-500">
          Showing {orders.length} orders
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="font-medium mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p>No orders found matching your filters</p>
          <button
            onClick={handleResetFilters}
            className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header with Status */}
              <div className="p-4 border-b flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()} at{' '}
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusOptions.find(s => s.value === order.status)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {statusOptions.find(s => s.value === order.status)?.label || order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="text-sm border rounded p-1"
                  >
                    {statusOptions
                      .filter(opt => opt.value !== 'all' && opt.value !== 'unknown')
                      .map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 border-b">
                <h4 className="font-medium mb-2">Customer</h4>
                <p>{order.customer_fname} {order.customer_lname}</p>
                <p className="text-sm text-gray-600">{order.customer_email}</p>
              </div>

              {/* Order Items */}
              <div className="p-4 border-b">
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p>Product ID: {item.product_id}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                          {item.user_id && ` (User: ${item.user_id})`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Footer */}
              <div className="p-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                </div>
                <div className="font-semibold">
                  Total: {formatCurrency(order.total_amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}