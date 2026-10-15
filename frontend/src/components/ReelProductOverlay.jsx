import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReelProductOverlay = ({ product, onBuyNow, onViewProduct }) => {
  const [expanded, setExpanded] = useState(false);
  const price = product?.discount_price_inr || product?.price_inr;

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-lg border border-gray-700 rounded-xl p-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{product.name}</p>
          <p className="text-sm font-bold text-white">₹{price?.toLocaleString()}</p>
        </div>
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={onViewProduct}
            className="bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Product
          </button>
          <button
            onClick={onBuyNow}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ReelProductOverlay;
