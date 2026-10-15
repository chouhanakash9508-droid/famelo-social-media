import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { commerceService } from '../services/commerceService';

const AdminCommerce = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [returns, setReturns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, productsRes, returnsRes] = await Promise.all([
        commerceService.adminGetOrders(),
        commerceService.adminGetProducts(),
        commerceService.adminGetReturns(),
      ]);
      setOrders(ordersRes.orders || []);
      setProducts(productsRes.products || []);
      setReturns(returnsRes.returns || []);
    } catch (e) {
      console.error('Failed to load admin commerce data', e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Commerce Admin</h1>
              <p className="text-[11px] text-gray-400">Manage orders, products, returns</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-white">Overview</h3>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>Orders</span>
              <span className="text-white font-semibold">{orders.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>Products</span>
              <span className="text-white font-semibold">{products.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>Returns</span>
              <span className="text-white font-semibold">{returns.length}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white">Recent Orders</h3>
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-white">{order.order_id}</h4>
                  <span className="text-[10px] border border-gray-700 rounded-full px-2 py-0.5 text-gray-300 capitalize">{order.status.replace('_', ' ')}</span>
                </div>
                <p className="text-[11px] text-gray-400">₹{Number(order.total_inr || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommerce;
