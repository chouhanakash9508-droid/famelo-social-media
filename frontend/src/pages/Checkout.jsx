import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { commerceService } from '../services/commerceService';
import toast from 'react-hot-toast';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems = location.state?.cartItems || [];
  const preselectedProduct = location.state?.productId;
  const [step, setStep] = useState('address');
  const [address, setAddress] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
  const [order, setOrder] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (preselectedProduct && cartItems.length === 0) {
      setCartItems([{ product_id: preselectedProduct, quantity: location.state?.quantity || 1, variant: location.state?.variant }]);
    }
  }, []);

  const handleCreateOrder = async () => {
    try {
      const data = await commerceService.createOrder({
        items: cartItems,
        address,
        shipping_fee_inr: 0,
        tax_inr: 0,
      });
      setOrder(data.order);
      setStep('payment');
    } catch (e) {
      toast.error('Failed to create order');
    }
  };

  const handlePay = async () => {
    if (!order) return;
    setPaymentLoading(true);
    try {
      const paymentData = await commerceService.createPaymentOrder(order.order_id);
      // In a real integration, you would open Razorpay checkout here.
      // For now, auto-verify in dev mode without keys.
      await commerceService.verifyPayment(order.order_id, {
        razorpay_order_id: paymentData.order_id,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: 'dev',
      });
      toast.success('Payment successful!');
      navigate('/orders');
    } catch (e) {
      toast.error('Payment failed');
    } finally {
      setPaymentLoading(false);
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
              <h1 className="text-base font-bold text-white">Checkout</h1>
              <p className="text-[11px] text-gray-400 capitalize">{step === 'address' ? 'Delivery Address' : 'Payment'}</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          {step === 'address' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">Full Name</label>
                <input required value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Phone</label>
                <input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">Address Line 1</label>
                <input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">City</label>
                <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">State</label>
                  <input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1">Pincode</label>
                  <input required value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <button onClick={handleCreateOrder} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold py-3 rounded-xl">
                Continue to Payment
              </button>
            </motion.div>
          )}

          {step === 'payment' && order && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold text-white">Order Summary</h3>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>Order ID</span>
                  <span className="text-white">{order.order_id}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>Total Amount</span>
                  <span className="text-white font-semibold">₹{order.total_inr.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-white">Payment</h3>
                </div>
                <p className="text-xs text-gray-400">Pay securely via Razorpay.</p>
                <button
                  onClick={handlePay}
                  disabled={paymentLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {paymentLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Pay Securely</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
