import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { commerceService } from '../services/commerceService';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await commerceService.getMyOrders();
      setOrders(data.orders || []);
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-base font-bold text-white">My Orders</h1>
              <p className="text-[11px] text-gray-400">{orders.length} orders</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">No orders yet</h3>
              <p className="text-gray-400 text-xs">Your order history will appear here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <motion.button
                key={order.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/orders/${order.order_id}`)}
                className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">{order.order_id}</h3>
                  <span className="text-[10px] border border-gray-700 rounded-full px-2 py-0.5 text-gray-300 capitalize">
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mb-1">{order.items?.[0]?.name || 'Order'} {order.items?.length > 1 ? `+${order.items.length - 1} more` : ''}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>₹{Number(order.total_inr || 0).toLocaleString()}</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 flex items-center text-xs text-purple-400">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
