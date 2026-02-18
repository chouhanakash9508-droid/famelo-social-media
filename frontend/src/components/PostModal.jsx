import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PostModal = ({ post, isOpen, onClose, onLike, onSave }) => {
  const [showHeart, setShowHeart] = useState(false);
  const { user } = useAuth();

  const handleDoubleTap = () => {
    if (!post.is_liked) {
      onLike(post.id);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const formatCount = (count) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  if (!isOpen || !post) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Media Section */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <div 
              className="relative max-w-full max-h-full cursor-pointer"
              onDoubleClick={handleDoubleTap}
            >
              {post.media_type === 'video' ? (
                <video
                  src={post.media_url || post.mediaUrl}
                  className="max-w-full max-h-[90vh] object-contain"
                  controls
                  autoPlay
                  muted
                />
              ) : (
                <img
                  src={post.media_url || post.mediaUrl}
                  alt={post.caption}
                  className="max-w-full max-h-[90vh] object-contain"
                />
              )}

              {/* Double Tap Heart Animation */}
              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 1 }}
                    exit={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Heart className="w-20 h-20 text-white fill-white drop-shadow-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Info Section */}
          <div className="w-80 bg-black border-l border-gray-800 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                  {post.user?.photoURL ? (
                    <img 
                      src={post.user.photoURL} 
                      alt={post.user.username} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                      {post.user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <span className="ml-3 font-semibold text-white text-sm">
                  {post.user?.username || 'Unknown'}
                </span>
              </div>
              <button className="text-white p-2">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Caption */}
            <div className="flex-1 p-4 overflow-y-auto">
              {post.caption && (
                <div className="mb-4">
                  <span className="font-semibold text-white text-sm mr-2">
                    {post.user?.username}
                  </span>
                  <span className="text-white text-sm leading-relaxed">
                    {post.caption}
                  </span>
                </div>
              )}
              
              <div className="text-gray-400 text-xs uppercase tracking-wide">
                {formatTimeAgo(post.created_at || post.createdAt)}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => onLike(post.id)}
                  >
                    <Heart className={`w-6 h-6 transition-all duration-200 ${
                      post.is_liked || post.isLiked 
                        ? 'fill-red-500 text-red-500 scale-110' 
                        : 'text-white hover:text-gray-300'
                    }`} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }}>
                    <MessageCircle className="w-6 h-6 text-white hover:text-gray-300 transition-colors" />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }}>
                    <Send className="w-6 h-6 text-white hover:text-gray-300 transition-colors" />
                  </motion.button>
                </div>
                <motion.button 
                  whileTap={{ scale: 0.9 }} 
                  onClick={() => onSave(post.id)}
                >
                  <Bookmark className={`w-6 h-6 transition-all duration-200 ${
                    post.is_saved || post.isSaved 
                      ? 'fill-white text-white' 
                      : 'text-white hover:text-gray-300'
                  }`} />
                </motion.button>
              </div>

              {/* Likes Count */}
              {(post.likes_count || post.likesCount) > 0 && (
                <div className="mb-2">
                  <span className="font-semibold text-white text-sm">
                    {formatCount(post.likes_count || post.likesCount)} likes
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostModal;