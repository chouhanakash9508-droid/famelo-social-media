import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adService } from '../services/adService';

const AdminAds = () => {
  const [campaigns, setCampaigns] = useState([]);
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
    }
  };

  const updateStatus = async (campaignId, status) => {
    try {
      await adService.updateCampaignStatus(campaignId, status);
      loadCampaigns();
    } catch (e) {
      console.error('Failed to update status', e);
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
              <h1 className="text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Ad Management
              </h1>
              <p className="text-[11px] text-gray-400">Review and moderate ads</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-3">
          {campaigns.length === 0 ? (
            <div className="text-center text-gray-400 text-xs py-10">No campaigns found.</div>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">{campaign.name || campaign.title}</h3>
                  <span className="text-[10px] border border-gray-700 rounded-full px-2 py-0.5 text-gray-300 capitalize">
                    {campaign.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">{campaign.business_name}</p>
                <p className="text-[11px] text-gray-400 line-clamp-2">{campaign.description}</p>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>₹{Number(campaign.price_inr || 0).toLocaleString()}</span>
                  <span>{Number(campaign.impressions || 0).toLocaleString()} impressions</span>
                </div>
                {campaign.status === 'pending_review' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <button onClick={() => updateStatus(campaign.id, 'active')} className="flex items-center space-x-1 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button onClick={() => updateStatus(campaign.id, 'rejected')} className="flex items-center space-x-1 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg">
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
                {campaign.status === 'active' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <button onClick={() => updateStatus(campaign.id, 'paused')} className="bg-yellow-600 text-white text-xs px-3 py-1.5 rounded-lg">
                      Pause
                    </button>
                  </div>
                )}
                {campaign.status === 'paused' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <button onClick={() => updateStatus(campaign.id, 'active')} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg">
                      Resume
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAds;
