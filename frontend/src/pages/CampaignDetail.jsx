import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { adService } from '../services/adService';

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const data = await adService.getCampaign(campaignId);
      setCampaign(data.campaign || null);
    } catch (e) {
      console.error('Failed to load campaign', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Loading...</div>;
  if (!campaign) return <div className="min-h-screen bg-black text-white flex items-center justify-center text-xs">Campaign not found</div>;

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
                Campaign Details
              </h1>
              <p className="text-[11px] text-gray-400 truncate max-w-[180px]">{campaign.name || campaign.title}</p>
            </div>
          </div>
        </header>

        <div className="px-4 py-4 space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Status</h2>
              <span className="text-[11px] border border-gray-700 rounded-full px-2 py-0.5 text-gray-300 capitalize">
                {campaign.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Payment</h2>
              <span className="text-[11px] border border-gray-700 rounded-full px-2 py-0.5 text-gray-300 capitalize">
                {campaign.payment_status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Package</h2>
              <span className="text-[11px] text-gray-300 capitalize">{campaign.package_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Price</h2>
              <span className="text-xs text-white">₹{Number(campaign.price_inr || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-white">Performance</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-gray-400">Impressions</p>
                <p className="text-sm font-semibold text-white">{Number(campaign.impressions || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Clicks</p>
                <p className="text-sm font-semibold text-white">{Number(campaign.clicks || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">CTR</p>
                <p className="text-sm font-semibold text-white">
                  {campaign.impressions ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : '0.00'}%
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Duration</p>
                <p className="text-sm font-semibold text-white">{campaign.duration_days || 0} days</p>
              </div>
            </div>
          </div>

          {campaign.destination_url && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Destination URL</h3>
                <p className="text-[11px] text-gray-400 break-all">{campaign.destination_url}</p>
              </div>
              <a href={campaign.destination_url} target="_blank" rel="noreferrer" className="text-purple-400">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
