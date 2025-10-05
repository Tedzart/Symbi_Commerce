'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const { data: session } = useSession();
  const handleOrder = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (!session) {
        alert('Please login to place an order');
        return;
      }
  
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total_amount: totalPrice
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      
      alert('Order placed successfully!');
      setCart([]);
      setShowCart(false);
    } catch (error) {
      console.error('Order error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Cart Button */}
      <div className="fixed top-12 right-4 z-50">
        <button 
          onClick={() => setShowCart(!showCart)}
          className="bg-blue-600 text-white px-2 py-2 rounded-md hover:bg-blue-500 flex items-center gap-1"
        >
          🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>




      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-40 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button 
              onClick={() => setShowCart(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="border-b pb-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 bg-gray-200 rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <button  
  onClick={handleOrder}
  disabled={isSubmitting || cart.length === 0 || !session}
  className={`bg-green-600 text-white py-2 px-4 rounded-md ${
    isSubmitting || cart.length === 0 || !session 
      ? 'opacity-50 cursor-not-allowed text' 
      : 'hover:bg-green-700'
  }`}
>
  {isSubmitting ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    </span>
  ) : !session ? (
    'Please login'
  ) : (
    'Place Order'
  )}
</button>

              </div>
            </>
          )}
        </div>
      )}

      {/* Rest of your existing code... */}
      <section className="bg-blue-50 py-16">
        {/* Your existing hero content */}
      </section>

      <section className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Featured Products
        </h2>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or category..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && filteredProducts.length === 0 && (
            <p className="text-center mt-2 text-gray-500">No products found matching your search.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden rounded-md mb-4">
                <img
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
              <p className="text-gray-600 line-clamp-2 my-2">{product.description}</p>
              {product.category && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mb-2">
                  {product.category}
                </span>
              )}
              <div className="flex justify-between items-center mt-4">
                <span className="text-lg font-bold text-blue-600">${product.price}</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/products" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
}