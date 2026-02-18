import api from './api';

export const messagesService = {
  // Get chat list
  async getChats() {
    try {
      const response = await api.get('/api/messages/chats');
      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  },

  // Get messages for a chat
  async getMessages(chatId) {
    try {
      const response = await api.get(`/api/messages/chats/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send text message
  async sendMessage(recipientId, text) {
    try {
      const response = await api.post('/api/messages/send', {
        recipient_id: recipientId,
        text
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Send image message
  async sendImage(recipientId, file) {
    try {
      const formData = new FormData();
      formData.append('recipient_id', recipientId);
      formData.append('file', file);

      const response = await api.post('/api/messages/send-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending image:', error);
      throw error;
    }
  },

  // Mark messages as seen
  async markAsSeen(chatId) {
    try {
      const response = await api.put(`/api/messages/chats/${chatId}/seen`);
      return response.data;
    } catch (error) {
      console.error('Error marking as seen:', error);
      throw error;
    }
  }
};