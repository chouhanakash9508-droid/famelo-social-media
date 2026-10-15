import api from './api';

export const reelsService = {
  // Get reels feed
  async getReels(page = 1, limit = 10) {
    try {
      const response = await api.get(`/api/reels?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reels:', error);
      throw error;
    }
  },

  // Create a new reel
  async createReel(file, caption = '', music = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caption', caption);
      if (music) formData.append('music', music);

      const response = await api.post('/api/reels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating reel:', error);
      throw error;
    }
  },

  // Like/unlike reel
  async toggleLike(reelId) {
    try {
      const response = await api.post(`/api/reels/${reelId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Add comment to reel
  async addComment(reelId, text) {
    try {
      const response = await api.post(`/api/reels/${reelId}/comments`, { text });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Save/unsave reel
  async toggleSave(reelId) {
    try {
      const response = await api.post(`/api/reels/${reelId}/save`);
      return response.data;
    } catch (error) {
      console.error('Error toggling save:', error);
      throw error;
    }
  },

  // Admin: Create promo reel
  async createPromoReel(file, caption = '', topic = '', cta = '', linkedFeature = '', priority = 0) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('topic', topic);
    formData.append('cta', cta);
    formData.append('linked_feature', linkedFeature);
    formData.append('priority', priority);
    const response = await api.post('/api/admin/promo-reels', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Admin: List promo reels
  async getPromoReels() {
    const response = await api.get('/api/admin/promo-reels');
    return response.data;
  },

  // Admin: Update promo reel
  async updatePromoReel(reelId, data) {
    const response = await api.put(`/api/admin/promo-reels/${reelId}`, data);
    return response.data;
  },

  // Admin: Delete promo reel
  async deletePromoReel(reelId) {
    const response = await api.delete(`/api/admin/promo-reels/${reelId}`);
    return response.data;
  },

  // Admin: Get promo settings
  async getPromoSettings() {
    const response = await api.get('/api/admin/settings/promo-reels');
    return response.data;
  },

  // Admin: Update promo settings
  async updatePromoSettings(data) {
    const response = await api.put('/api/admin/settings/promo-reels', data);
    return response.data;
  }
};