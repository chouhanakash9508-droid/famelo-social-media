import api from './api';

export const commentsService = {
  // Get comments for a post
  async getComments(postId) {
    try {
      const response = await api.get(`/api/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Add a comment
  async addComment(postId, text, parentId = null) {
    try {
      const response = await api.post(`/api/posts/${postId}/comments`, {
        text,
        parent_id: parentId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Like/unlike a comment
  async toggleCommentLike(commentId) {
    try {
      const response = await api.post(`/api/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId) {
    try {
      const response = await api.delete(`/api/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};