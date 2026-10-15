import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { commerceService } from '../services/commerceService';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], total_inr: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await commerceService.getCart();
      setCart(data.cart || { items: [], total_inr: 0 });
    } catch (e) {
      console.error('Failed to load cart', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await commerceService.removeFromCart(productId);
      await loadCart();
    } catch (e) {
      console.error('Failed to remove item', e);
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) return;
    navigate('/checkout', { state: { cartItems: cart.items } });
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white">Shopping Cart</h1>
              <p className="text-[11px] text-gray-400">{cart.items.length} items</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-3">
          {cart.items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Your cart is empty</h3>
              <p className="text-gray-400 text-xs">Browse reels and add products to your cart.</p>
            </div>
          ) : (
            <>
              {cart.items.map((item, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center space-x-3">
                  {item.product?.images?.[0] && (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{item.product?.name}</h3>
                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-white">₹{((item.product?.discount_price_inr || item.product?.price_inr || 0) * item.quantity).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleRemove(item.product_id)} className="p-2 text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Subtotal</span>
                  <span className="text-sm font-semibold text-white">₹{cart.total_inr.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">Shipping</span>
                  <span className="text-sm font-semibold text-white">Calculated at checkout</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
