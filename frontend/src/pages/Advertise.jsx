import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, BarChart3, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adService } from '../services/adService';

const PACKAGE_FEATURES = {
  starter: ['3-day campaign', 'Up to 5,000 impressions', 'Basic targeting', '1 advertisement', 'Basic analytics'],
  growth: ['7-day campaign', 'Up to 15,000 impressions', 'Audience targeting', '2 advertisements', 'Basic analytics', 'Optimization suggestions'],
  business: ['14-day campaign', 'Up to 50,000 impressions', 'Advanced audience targeting', '5 advertisements', 'Detailed analytics', 'Priority campaign review'],
  premium: ['30-day campaign', 'Up to 120,000 impressions', 'Advanced targeting', '10 advertisements', 'Detailed analytics', 'Priority review', 'Featured placement where available'],
};

const Advertise = () => {
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await adService.getPackages();
      setPackages(data.packages || []);
    } catch (e) {
      console.error('Failed to load packages', e);
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
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Advertise with Famelo
                </h1>
                <p className="text-xs text-gray-400">Reach real users</p>
              </div>
            </div>
            <div className="p-2 bg-gray-800 rounded-full">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/20 rounded-xl p-4">
            <h2 className="text-base font-semibold text-white mb-1">Grow your business on Famelo</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Promote your products, services, or campaign to relevant users. Choose a package below to get started.
            </p>
          </div>

          <div className="space-y-3">
            {packages.map((pkg) => (
              <motion.button
                key={pkg.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/business-dashboard', { state: { selectedPackageId: pkg.id } })}
                className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{pkg.name}</h3>
                    <p className="text-xs text-gray-400">{pkg.duration_days}-day campaign</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">₹{pkg.price_inr}</div>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mb-2">Up to {pkg.max_impressions.toLocaleString()} impressions</p>
                <div className="flex flex-wrap gap-1.5">
                  {(PACKAGE_FEATURES[pkg.id] || []).map((feature) => (
                    <span key={feature} className="text-[10px] bg-gray-800 text-gray-300 border border-gray-700 rounded-full px-2 py-0.5">
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">Why advertise on Famelo?</h3>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li>• Sponsored placements are clearly labeled.</li>
              <li>• Reach users interested in relevant topics.</li>
              <li>• Track impressions and clicks with simple analytics.</li>
              <li>• Manage campaigns from your business dashboard.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Advertise;
