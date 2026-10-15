import api from './api';

export const adService = {
  getPackages: async () => {
    const res = await api.get('/api/ads/packages');
    return res.data;
  },

  createBusiness: async (data) => {
    const res = await api.post('/api/businesses', data);
    return res.data;
  },

  getMyBusiness: async () => {
    const res = await api.get('/api/businesses/me');
    return res.data;
  },

  createCampaign: async (data) => {
    const res = await api.post('/api/campaigns', data);
    return res.data;
  },

  getMyCampaigns: async () => {
    const res = await api.get('/api/campaigns/me');
    return res.data;
  },

  getCampaign: async (campaignId) => {
    const res = await api.get(`/api/campaigns/${campaignId}`);
    return res.data;
  },

  submitCampaign: async (campaignId) => {
    const res = await api.post(`/api/campaigns/${campaignId}/submit`);
    return res.data;
  },

  createPaymentOrder: async (campaignId) => {
    const res = await api.post('/api/payments/create-order', { campaign_id: campaignId });
    return res.data;
  },

  verifyPayment: async (campaignId, payload) => {
    const res = await api.post('/api/payments/verify', {
      campaign_id: campaignId,
      ...payload,
    });
    return res.data;
  },

  getAdsFeed: async () => {
    const res = await api.get('/api/ads/feed');
    return res.data;
  },

  trackAdClick: async (adId) => {
    const res = await api.post(`/api/ads/${adId}/click`);
    return res.data;
  },

  updateCampaignStatus: async (campaignId, status) => {
    const res = await api.put(`/api/admin/campaigns/${campaignId}/status`, { status });
    return res.data;
  },
};

export default adService;
