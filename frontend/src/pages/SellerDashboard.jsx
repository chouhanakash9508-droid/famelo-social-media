import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, TrendingUp, Package, ShoppingBag, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { commerceService } from '../services/commerceService';

const SellerDashboard = () => {
  const [stats, setStats] = useState({ products: 0, orders: 0, sales: 0, returns: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        commerceService.getMyProducts(),
        commerceService.getSellerOrders(),
      ]);
      const products = productsRes.products || [];
      const orders = ordersRes.orders || [];
      const sales = orders.reduce((sum, o) => sum + (Number(o.total_inr) || 0), 0);
      const returns = orders.filter(o => o.status === 'return_requested').length;
      setStats({ products: products.length, orders: orders.length, sales, returns });
      setRecentOrders(orders.slice(0, 5));
    } catch (e) {
      console.error('Failed to load seller data', e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">My Selling</h1>
                <p className="text-[11px] text-gray-400">Dashboard</p>
              </div>
            </div>
            <button onClick={() => navigate('/create-product')} className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Package className="w-4 h-4 text-blue-400" />
                <p className="text-[11px] text-gray-400">Products</p>
              </div>
              <p className="text-lg font-bold text-white">{stats.products}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <ShoppingBag className="w-4 h-4 text-green-400" />
                <p className="text-[11px] text-gray-400">Orders</p>
              </div>
              <p className="text-lg font-bold text-white">{stats.orders}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <p className="text-[11px] text-gray-400">Sales</p>
              </div>
              <p className="text-lg font-bold text-white">₹{stats.sales.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <RefreshCw className="w-4 h-4 text-yellow-400" />
                <p className="text-[11px] text-gray-400">Returns</p>
              </div>
              <p className="text-lg font-bold text-white">{stats.returns}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Orders</h2>
            <button onClick={() => navigate('/seller-orders')} className="text-xs text-purple-400 hover:text-purple-300">
              View All
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-10">No orders yet.</div>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((order) => (
                <motion.button
                  key={order.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/orders/${order.order_id}`)}
                  className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl p-3.5 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{order.order_id}</h3>
                    <span className="text-[10px] border border-gray-700 rounded-full px-2 py-0.5 text-gray-300 capitalize">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{order.items?.[0]?.name || 'Order'} {order.items?.length > 1 ? `+${order.items.length - 1} more` : ''}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1">
                    <span>₹{Number(order.total_inr || 0).toLocaleString()}</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
