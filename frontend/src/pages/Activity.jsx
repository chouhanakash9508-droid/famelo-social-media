import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { notificationsService } from '../services/notificationsService';

const Activity = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useWebSocket();

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          setNotifications(prev => [data.notification, ...prev]);
        }
      };
    }
  }, [socket]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      default:
        return <Heart className="w-4 h-4 text-gray-400" />;
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your photo.';
      case 'comment':
        return 'commented on your photo.';
      case 'follow':
        return 'started following you.';
      default:
        return 'interacted with your content.';
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await notificationsService.markAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
    }

    if (notification.post) {
      console.log('Navigate to post:', notification.post.id);
    } else if (notification.type === 'follow') {
      navigate(`/profile/${notification.actor.username}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="flex items-center px-4 py-3 border-b border-gray-800">
          <button onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-semibold text-white">Activity</h1>
        </header>

        {/* Loading Skeleton */}
        <div className="px-4 py-4 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="w-3/4 h-4 bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="w-1/4 h-3 bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="w-10 h-10 bg-gray-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="flex items-center px-4 py-3 border-b border-gray-800">
        <button onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">Activity</h1>
      </header>

      {/* Notifications List */}
      <div className="px-4 py-4">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-center space-x-3 cursor-pointer hover:bg-gray-900 p-3 rounded-lg transition-colors ${
                  !notification.is_read ? 'bg-gray-900 bg-opacity-30' : ''
                }`}
              >
                {/* User Avatar with Notification Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                    {notification.actor?.photoURL ? (
                      <img
                        src={notification.actor.photoURL}
                        alt={notification.actor.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                        {notification.actor?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  
                  {/* Notification Type Icon */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black rounded-full flex items-center justify-center border border-gray-800">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm">
                    <span className="font-semibold">{notification.actor?.username}</span>
                    <span className="ml-1">{getNotificationMessage(notification)}</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    {formatTimeAgo(notification.created_at)}
                  </div>
                </div>

                {/* Post Thumbnail or Follow Button */}
                {notification.post ? (
                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                    <img
                      src={notification.post.media_url}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : notification.type === 'follow' ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Follow
                  </motion.button>
                ) : null}

                {/* Unread Indicator */}
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-light text-white mb-2">Activity On Your Posts</h3>
            <p className="text-gray-400">
              When someone likes or comments on one of your posts, you'll see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;