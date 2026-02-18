import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Button, Icon, CommentsModal } from './index';
import { postService } from '../services/postService';
import toast from 'react-hot-toast';

const FeedCard = ({ post, index, onPostUpdate }) => {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [saved, setSaved] = useState(post.is_saved || false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);

  const handleLike = async () => {
    try {
      if (liked) {
        await postService.unlikePost(post.id);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await postService.likePost(post.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (saved) {
        await postService.unsavePost(post.id);
        setSaved(false);
      } else {
        await postService.savePost(post.id);
        setSaved(true);
      }
    } catch (error) {
      console.error('Failed to toggle save:', error);
    }
  };

  const handleDoubleClick = () => {
    if (!liked) {
      handleLike();
    }
  };

  const openCommentsModal = () => {
    setShowCommentsModal(true);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-primary-bg/90 backdrop-blur-sm mb-4 rounded-lg mx-2 shadow-soft border border-border"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <Avatar
            src={post.author?.avatar_url}
            alt={post.author?.full_name || post.author?.username}
            size="sm"
          />
          <div>
            <h3 className="font-semibold text-primary-text text-sm">
              {post.author?.username}
            </h3>
          </div>
        </div>
        <button className="text-primary-text-secondary p-1">
          <Icon name="MoreHorizontal" size={16} />
        </button>
      </div>

      {/* Media */}
      <div className="relative" onDoubleClick={handleDoubleClick}>
        <img
          src={post.media_url}
          alt="Post content"
          className="w-full aspect-square object-cover"
        />
        <AnimatePresence>
          {liked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate="likePop"
                className="text-red-500"
              >
                <Icon name="Heart" size={80} fill="currentColor" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`${liked ? 'text-red-500' : 'text-primary-text-secondary'}`}
            >
              <Icon name="Heart" size={24} fill={liked ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={openCommentsModal}
              className="text-primary-text-secondary"
            >
              <Icon name="MessageCircle" size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-primary-text-secondary"
            >
              <Icon name="Send" size={24} />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSave}
            className={`${saved ? 'text-accent-primary' : 'text-primary-text-secondary'}`}
          >
            <Icon name="Bookmark" size={24} fill={saved ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Likes */}
        <div className="mb-1">
          <span className="font-semibold text-primary-text text-sm">
            {likeCount.toLocaleString()} likes
          </span>
        </div>

        {/* Caption */}
        <div className="mb-1">
          <span className="font-semibold text-primary-text text-sm mr-1">
            {post.author?.username}
          </span>
          <span className="text-primary-text text-sm">
            {post.caption}
          </span>
        </div>

        {/* Comments toggle */}
        <button
          onClick={openCommentsModal}
          className="text-primary-text-secondary text-sm hover:text-primary-text transition-colors"
        >
          View all comments
        </button>

        {/* Timestamp */}
        <div className="text-primary-text-tertiary text-xs mt-1">
          {formatTimeAgo(post.created_at)}
        </div>

        {/* Comments Modal */}
        <CommentsModal
          isOpen={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
          postId={post.id}
          postAuthor={post.author}
        />
      </div>
    </motion.div>
  );
};

export default FeedCard;