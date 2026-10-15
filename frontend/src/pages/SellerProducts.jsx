import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { commerceService } from '../services/commerceService';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await commerceService.getMyProducts();
      setProducts(data.products || []);
    } catch (e) {
      console.error('Failed to load products', e);
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
                <h1 className="text-base font-bold text-white">My Products</h1>
                <p className="text-[11px] text-gray-400">{products.length} products</p>
              </div>
            </div>
            <button onClick={() => navigate('/create-product')} className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </header>

        <div className="px-4 py-4 space-y-3">
          {products.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-10">No products yet. Create your first product to start selling.</div>
          ) : (
            products.map((product) => (
              <motion.div
                key={product.id}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center space-x-3"
              >
                {(product.images || [])[0] && (
                  <img src={product.images[0]} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400">₹{product.price_inr.toLocaleString()}</p>
                  <span className="text-[10px] border border-gray-700 rounded-full px-2 py-0.5 text-gray-300 capitalize">{product.status}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProducts;
