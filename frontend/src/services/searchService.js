import api from './api';

export const searchService = {
  // Search users by username
  async searchUsers(query) {
    try {
      const response = await api.get(`/api/search/users?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  // Get explore/trending posts
  async getExplorePosts(page = 1, limit = 30) {
    try {
      const response = await api.get(`/api/explore/posts?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching explore posts:', error);
      throw error;
    }
  },

  // Search posts by hashtag or content
  async searchPosts(query, page = 1, limit = 20) {
    try {
      const response = await api.get(`/api/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },

  // Get trending hashtags
  async getTrendingHashtags() {
    try {
      const response = await api.get('/api/explore/hashtags');
      return response.data;
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      throw error;
    }
  }
};