import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onLike, onSave, onComment }) => {
  const [showHeart, setShowHeart] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const { user } = useAuth();

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (!post.isLiked) {
        onLike();
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    }
    setLastTap(now);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  return (
    <article className="bg-black border-b border-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
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
          <div className="ml-3">
            <span className="font-semibold text-white text-sm">
              {post.user?.username || 'Unknown'}
            </span>
            {post.location && (
              <div className="text-xs text-gray-400">{post.location}</div>
            )}
          </div>
        </div>
        <button className="text-white">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </header>

      {/* Image/Video */}
      <div className="relative">
        <div 
          className="w-full aspect-square bg-gray-900 relative overflow-hidden"
          onTouchEnd={handleDoubleTap}
          onDoubleClick={handleDoubleTap}
        >
          {post.mediaType === 'video' ? (
            <video
              src={post.mediaUrl}
              className="w-full h-full object-cover"
              controls
              playsInline
            />
          ) : (
            <img
              src={post.mediaUrl}
              alt={post.caption}
              className="w-full h-full object-cover"
              loading="lazy"
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
                <Heart className="w-20 h-20 text-white fill-white drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onLike}
              className="flex items-center"
            >
              <Heart 
                className={`w-6 h-6 ${
                  post.isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-white hover:text-gray-300'
                } transition-colors`}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onComment}
              className="flex items-center"
            >
              <MessageCircle className="w-6 h-6 text-white hover:text-gray-300 transition-colors" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="flex items-center"
            >
              <Send className="w-6 h-6 text-white hover:text-gray-300 transition-colors" />
            </motion.button>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onSave}
            className="flex items-center"
          >
            <Bookmark 
              className={`w-6 h-6 ${
                post.isSaved 
                  ? 'fill-white text-white' 
                  : 'text-white hover:text-gray-300'
              } transition-colors`}
            />
          </motion.button>
        </div>

        {/* Likes Count */}
        {post.likesCount > 0 && (
          <div className="mb-2">
            <span className="font-semibold text-white text-sm">
              {post.likesCount.toLocaleString()} {post.likesCount === 1 ? 'like' : 'likes'}
            </span>
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <span className="font-semibold text-white text-sm mr-2">
              {post.user?.username}
            </span>
            <span className="text-white text-sm">
              {post.caption}
            </span>
          </div>
        )}

        {/* Comments Preview */}
        {post.commentsCount > 0 && (
          <button 
            onClick={onComment}
            className="text-gray-400 text-sm mb-2 hover:text-gray-300 transition-colors"
          >
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Timestamp */}
        <div className="text-gray-400 text-xs uppercase">
          {formatTimeAgo(post.createdAt)}
        </div>
      </div>
    </article>
  );
};

export default PostCard;