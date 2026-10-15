import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const SponsoredCard = ({ ad, onAdClick }) => {
  const handleClick = async () => {
    if (onAdClick) {
      await onAdClick(ad.id);
    }
    if (ad.destination_url) {
      window.open(ad.destination_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border-b border-gray-800"
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs">
            {ad.business_name?.[0]?.toUpperCase() || 'B'}
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{ad.business_name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Sponsored</p>
          </div>
        </div>
        <span className="text-[10px] text-gray-500 border border-gray-700 rounded-full px-2 py-0.5">Ad</span>
      </div>

      {ad.image_url && (
        <div className="w-full aspect-video bg-gray-900 relative overflow-hidden">
          <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="px-4 py-3">
        <h3 className="text-sm font-semibold text-white mb-1">{ad.title}</h3>
        <p className="text-xs text-gray-300 leading-relaxed mb-2">{ad.description}</p>
        <button
          onClick={handleClick}
          className="inline-flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
        >
          <span>{ad.cta_text || 'Learn More'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default SponsoredCard;
