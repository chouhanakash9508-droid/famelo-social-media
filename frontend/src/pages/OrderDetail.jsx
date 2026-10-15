import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { commerceService } from '../services/commerceService';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['pending_payment', 'payment_confirmed', 'order_confirmed', 'processing', 'packed', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await commerceService.getOrder(orderId);
      setOrder(data.order || null);
    } catch (e) {
      console.error('Failed to load order', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    try {
      await commerceService.createReturn(order.order_id, 'Customer return request', []);
      toast.success('Return requested');
      loadOrder();
    } catch (e) {
      toast.error('Failed to request return');
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Loading...</div>;
  if (!order) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Order not found</div>;

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white">Order {order.order_id}</h1>
              <p className="text-[11px] text-gray-400 capitalize">{order.status.replace('_', ' ')}</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Tracking</h3>
            <div className="space-y-2">
              {STATUS_FLOW.map((status, idx) => (
                <div key={status} className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${idx <= currentStatusIndex ? 'bg-green-500' : 'bg-gray-700'}`} />
                  <span className={`text-xs capitalize ${idx <= currentStatusIndex ? 'text-white' : 'text-gray-500'}`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-white">Items</h3>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-gray-300">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{(item.price_inr * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800">
              <span>Total</span>
              <span className="text-white font-semibold">₹{order.total_inr.toLocaleString()}</span>
            </div>
          </div>

          {order.status === 'delivered' && (
            <button onClick={handleReturn} className="w-full bg-gray-800 border border-gray-700 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Request Return / Refund</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
