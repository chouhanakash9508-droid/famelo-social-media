import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Image, MoreHorizontal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { messagesService } from '../services/messagesService';

const ChatList = ({ chats, onChatSelect }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold text-white">Messages</h1>
      </div>
      
      <div className="overflow-y-auto">
        {chats.map((chat) => (
          <motion.div
            key={chat.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChatSelect(chat)}
            className="flex items-center p-4 hover:bg-gray-900 cursor-pointer border-b border-gray-800"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                {chat.other_user?.photoURL ? (
                  <img
                    src={chat.other_user.photoURL}
                    alt={chat.other_user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {chat.other_user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              {chat.unread_count > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{chat.unread_count}</span>
                </div>
              )}
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white truncate">
                  {chat.other_user?.username}
                </span>
                <span className="text-gray-400 text-xs">
                  {formatTime(chat.last_message_at)}
                </span>
              </div>
              <p className={`text-sm truncate ${chat.unread_count > 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                {chat.last_message}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ChatView = ({ chat, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const { user } = useAuth();
  const { socket } = useWebSocket();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadMessages();
    markAsSeen();
  }, [chat.id]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && data.message.chat_id === chat.id) {
          setMessages(prev => [...prev, data.message]);
          markAsSeen();
        } else if (data.type === 'typing' && data.chat_id === chat.id) {
          setTyping(data.is_typing);
        }
      };
    }
  }, [socket, chat.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesService.getMessages(chat.id);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsSeen = async () => {
    try {
      await messagesService.markAsSeen(chat.id);
    } catch (error) {
      console.error('Error marking as seen:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await messagesService.sendMessage(chat.other_user.uid, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendImage = async (file) => {
    try {
      await messagesService.sendImage(chat.other_user.uid, file);
    } catch (error) {
      console.error('Error sending image:', error);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      sendImage(file);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-800">
        <button onClick={onBack} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 mr-3">
          {chat.other_user?.photoURL ? (
            <img
              src={chat.other_user.photoURL}
              alt={chat.other_user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
              {chat.other_user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-white">{chat.other_user?.username}</h2>
        </div>
        <button>
          <MoreHorizontal className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender_id === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.sender_id === user?.uid
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-white'
              }`}>
                {message.type === 'text' ? (
                  <p className="text-sm">{message.text}</p>
                ) : (
                  <img
                    src={message.image_url}
                    alt="Sent image"
                    className="rounded-lg max-w-full"
                  />
                )}
                <div className={`text-xs mt-1 ${
                  message.sender_id === user?.uid ? 'text-blue-100' : 'text-gray-400'
                }`}>
                  {formatTime(message.created_at)}
                  {message.sender_id === user?.uid && message.seen && (
                    <span className="ml-1">✓</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
        
        {typing && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <Image className="w-6 h-6" />
          </button>
          
          <div className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Message..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="text-blue-500 disabled:text-gray-600 transition-colors"
          >
            <Send className="w-6 h-6" />
          </motion.button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { chatId } = useParams();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await messagesService.getChats();
      setChats(response.chats || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    navigate(`/messages/${chat.id}`);
  };

  const handleBack = () => {
    setSelectedChat(null);
    navigate('/messages');
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black">
      <AnimatePresence mode="wait">
        {selectedChat ? (
          <motion.div
            key="chat"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="h-full"
          >
            <ChatView chat={selectedChat} onBack={handleBack} />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="h-full"
          >
            <ChatList chats={chats} onChatSelect={handleChatSelect} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messages;