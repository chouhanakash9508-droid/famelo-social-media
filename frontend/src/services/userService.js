import api from './api';

export const userService = {
  // Get my profile
  async getMyProfile() {
    try {
      const response = await api.get('/api/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching my profile:', error);
      throw error;
    }
  },

  // Get user profile by username
  async getUserProfile(username) {
    try {
      const response = await api.get(`/api/users/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Get user posts
  async getUserPosts(username, type = 'posts') {
    try {
      const response = await api.get(`/api/users/${username}/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  // Follow/unfollow user
  async toggleFollow(userId) {
    try {
      const response = await api.post(`/api/users/${userId}/follow`);
      return response.data;
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/api/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Upload profile picture
  async uploadProfilePicture(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }
};