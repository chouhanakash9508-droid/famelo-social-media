import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { commerceService } from '../services/commerceService';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const data = await commerceService.getProduct(productId);
      setProduct(data.product || null);
    } catch (e) {
      console.error('Failed to load product', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    navigate('/checkout', { state: { productId: product.id, quantity, variant: selectedVariant } });
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await commerceService.addToCart(product.id, quantity, selectedVariant);
      navigate('/cart');
    } catch (e) {
      console.error('Failed to add to cart', e);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Loading...</div>;
  if (!product) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Product not found</div>;

  const price = product.discount_price_inr || product.price_inr;
  const hasDiscount = product.discount_price_inr && product.discount_price_inr < product.price_inr;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-base font-bold text-white truncate max-w-[200px]">{product.name}</h1>
              <p className="text-[11px] text-gray-400">Product Details</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          {(product.images || []).length > 0 && (
            <div className="w-full aspect-square bg-gray-900 rounded-xl overflow-hidden">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">{product.name}</h2>
              {hasDiscount && (
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                  {Math.round(((product.price_inr - price) / product.price_inr) * 100)}% OFF
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-white">₹{price.toLocaleString()}</span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">₹{product.price_inr.toLocaleString()}</span>
              )}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{product.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>Stock: {product.stock}</span>
              <span>Category: {product.category}</span>
            </div>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-white">Variants</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-3 py-1.5 rounded-lg border text-xs ${
                      selectedVariant === variant
                        ? 'border-purple-500 text-white bg-purple-500/20'
                        : 'border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Delivery</h3>
            </div>
            <p className="text-xs text-gray-300">Estimated delivery: {product.delivery_estimate_days || 7} days</p>
            <p className="text-xs text-gray-400">{product.shipping_info || 'Standard shipping'}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-semibold text-white">Returns</h3>
            </div>
            <p className="text-xs text-gray-300">{product.return_policy || '7-day easy returns'}</p>
          </div>

          {product.seller && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                  {product.seller.username?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{product.seller.displayName || product.seller.username}</p>
                  <p className="text-[11px] text-gray-400">Seller</p>
                </div>
              </div>
              <button onClick={() => navigate(`/profile/${product.seller.username}`)} className="text-xs text-purple-400 hover:text-purple-300">
                View Profile
              </button>
            </div>
          )}

          <div className="flex items-center space-x-3 pb-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gray-800 border border-gray-700 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
