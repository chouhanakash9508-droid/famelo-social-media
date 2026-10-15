import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { commerceService } from '../services/commerceService';
import toast from 'react-hot-toast';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    price_inr: '',
    discount_price_inr: '',
    category: '',
    images: [],
    stock: '',
    brand: '',
    return_policy: '7-day easy returns',
    shipping_info: 'Standard shipping',
    delivery_estimate_days: '7',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await commerceService.createProduct({ ...form, price_inr: Number(form.price_inr), stock: Number(form.stock) });
      toast.success('Product created');
      navigate('/seller-products');
    } catch (e) {
      toast.error('Failed to create product');
    } finally {
      setLoading(false);
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
              <h1 className="text-base font-bold text-white">Create Product</h1>
              <p className="text-[11px] text-gray-400">Add a new product to sell</p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-300 mb-1">Product Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Description</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Price (₹)</label>
              <input required type="number" value={form.price_inr} onChange={(e) => setForm({ ...form, price_inr: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Discount Price (₹)</label>
              <input type="number" value={form.discount_price_inr} onChange={(e) => setForm({ ...form, discount_price_inr: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Category</label>
            <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Image URLs (comma separated)</label>
            <input value={form.images.join(',')} onChange={(e) => setForm({ ...form, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Stock</label>
            <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-300 mb-1">Brand</label>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center space-x-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Create Product</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
