import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Icon } from './';

const NotificationsModal = ({ isOpen, onClose }) => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'like',
      user: { username: 'alice_j', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face' },
      content: 'liked your post',
      time: '2h',
      read: false
    },
    {
      id: 2,
      type: 'comment',
      user: { username: 'david_w', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
      content: 'commented: "Amazing shot!"',
      time: '4h',
      read: false
    },
    {
      id: 3,
      type: 'follow',
      user: { username: 'sarah_m', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
      content: 'started following you',
      time: '1d',
      read: true
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like': return 'Heart';
      case 'comment': return 'MessageCircle';
      case 'follow': return 'UserPlus';
      default: return 'Bell';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-80 bg-primary-bg rounded-lg shadow-large border border-border z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-primary-text">Notifications</h3>
            <button onClick={onClose} className="text-primary-text-secondary">
              <Icon name="X" size={20} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-primary-text-tertiary">
                <Icon name="Bell" size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center space-x-3 p-4 hover:bg-primary-bg-tertiary transition-colors cursor-pointer ${
                    !notification.read ? 'border-l-2 border-accent-primary' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar
                      src={notification.user.avatar}
                      alt={notification.user.username}
                      size="sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center">
                      <Icon name={getNotificationIcon(notification.type)} size={10} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-primary-text">
                      <span className="font-semibold">{notification.user.username}</span> {notification.content}
                    </p>
                    <p className="text-xs text-primary-text-tertiary">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-accent-primary rounded-full"></div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <button className="w-full text-accent-primary text-sm font-semibold hover:text-accent-secondary transition-colors">
              View all notifications
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationsModal;