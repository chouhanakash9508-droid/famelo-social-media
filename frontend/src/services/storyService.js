import api from './api';

export const storyService = {
  // Get all stories from followed users
  async getStories() {
    try {
      const response = await api.get('/api/stories');
      return response.data;
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },

  // Create a new story
  async createStory(file, duration = 5000) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('duration', duration);

      const response = await api.post('/api/stories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  },

  // Mark story as viewed
  async markStoryViewed(storyId) {
    try {
      const response = await api.post(`/api/stories/${storyId}/view`);
      return response.data;
    } catch (error) {
      console.error('Error marking story as viewed:', error);
      throw error;
    }
  },

  // Delete story
  async deleteStory(storyId) {
    try {
      const response = await api.delete(`/api/stories/${storyId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }
};