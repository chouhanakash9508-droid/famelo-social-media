import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, BarChart3, ShoppingBag, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adService } from '../services/adService';

const BusinessDashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await adService.getMyCampaigns();
      setCampaigns(data.campaigns || []);
    } catch (e) {
      console.error('Failed to load campaigns', e);
    } finally {
      setLoading(false);
    }
  };

  const totalSpend = campaigns.reduce((sum, c) => sum + (Number(c.price_inr) || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (Number(c.impressions) || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (Number(c.clicks) || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

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
                <h1 className="text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Business Dashboard
                </h1>
                <p className="text-[11px] text-gray-400">Manage your ads</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/create-campaign')}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </header>

        <div className="px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-4 h-4 text-green-400" />
                <p className="text-[11px] text-gray-400">Active</p>
              </div>
              <p className="text-lg font-bold text-white">{activeCampaigns}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <p className="text-[11px] text-gray-400">Impressions</p>
              </div>
              <p className="text-lg font-bold text-white">{totalImpressions.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <p className="text-[11px] text-gray-400">Clicks</p>
              </div>
              <p className="text-lg font-bold text-white">{totalClicks.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center space-x-2 mb-1">
                <ShoppingBag className="w-4 h-4 text-yellow-400" />
                <p className="text-[11px] text-gray-400">Total Spend</p>
              </div>
              <p className="text-lg font-bold text-white">₹{totalSpend.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">My Campaigns</h2>
            <button onClick={() => navigate('/create-campaign')} className="text-xs text-purple-400 hover:text-purple-300">
              New Campaign
            </button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 text-xs py-10">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-10">
              No campaigns yet. Create your first campaign to start advertising.
            </div>
          ) : (
            <div className="space-y-2.5">
              {campaigns.map((campaign) => (
                <motion.button
                  key={campaign.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  className="w-full text-left bg-gray-900 border border-gray-800 rounded-xl p-3.5 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{campaign.name || campaign.title}</h3>
                    <span className="text-[10px] border border-gray-700 rounded-full px-2 py-0.5 text-gray-300 capitalize">
                      {campaign.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-1">{campaign.business_name}</p>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>₹{Number(campaign.price_inr || 0).toLocaleString()}</span>
                    <span>{Number(campaign.impressions || 0).toLocaleString()} impressions</span>
                    <span>{Number(campaign.clicks || 0).toLocaleString()} clicks</span>
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

export default BusinessDashboard;
