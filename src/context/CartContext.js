'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [sessionId, setSessionId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Generate or retrieve session ID
    const storedSessionId = localStorage.getItem('cart_session_id') || 
      crypto.randomUUID();
    setSessionId(storedSessionId);
    localStorage.setItem('cart_session_id', storedSessionId);
    
    // Load initial cart
    fetchCart(storedSessionId);
  }, []);

  const fetchCart = async (sessionId) => {
    try {
      const res = await fetch(`/api/cart?sessionId=${sessionId}`);
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const addToCart = async (productId) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sessionId })
      });
      
      if (res.ok) {
        await fetchCart(sessionId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      return false;
    }
  };

  const checkout = async (customerData) => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customerData, sessionId })
      });
      
      if (res.ok) {
        const { orderId } = await res.json();
        router.push(`/order-confirmation/${orderId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Checkout failed:', error);
      return false;
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}