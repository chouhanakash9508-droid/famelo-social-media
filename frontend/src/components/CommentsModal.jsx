import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MoreHorizontal, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { commentsService } from '../services/commentsService';

const EmojiPicker = ({ onEmojiSelect, isOpen }) => {
  const emojis = ['😀', '😂', '😍', '🥰', '😘', '😊', '😎', '🤔', '😢', '😭', '😡', '🤯', '🔥', '💯', '❤️', '👍', '👎', '🙌', '👏', '💪'];
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-12 left-0 bg-gray-800 rounded-lg p-2 grid grid-cols-5 gap-2 shadow-lg z-10"
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onEmojiSelect(emoji)}
          className="text-xl hover:bg-gray-700 rounded p-1 transition-colors"
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
};

const Comment = ({ comment, onReply, onLike, onDelete, currentUserId, level = 0 }) => {
  const [showReplies, setShowReplies] = useState(true);
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${level > 0 ? 'ml-8 mt-2' : 'mb-4'}`}
    >
      <div className="flex space-x-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
          {comment.user?.photoURL ? (
            <img
              src={comment.user.photoURL}
              alt={comment.user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs">
              {comment.user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-white text-sm">
              {comment.user?.username || 'Unknown'}
            </span>
            <span className="text-gray-400 text-xs">
              {formatTimeAgo(comment.created_at)}
            </span>
            {comment.user?.uid === currentUserId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <p className="text-white text-sm mt-1 leading-relaxed">
            {comment.text}
          </p>
          
          <div className="flex items-center space-x-4 mt-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onLike(comment.id)}
              className={`flex items-center space-x-1 text-xs ${
                comment.is_liked 
                  ? 'text-red-500' 
                  : 'text-gray-400 hover:text-red-400'
              } transition-colors`}
            >
              <Heart className={`w-4 h-4 ${comment.is_liked ? 'fill-current' : ''}`} />
              <span>{comment.likes_count || 0}</span>
            </motion.button>
            
            <button
              onClick={() => onReply(comment)}
              className="text-gray-400 hover:text-white text-xs font-medium transition-colors"
            >
              Reply
            </button>
          </div>
          
          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.length > 2 && !showReplies && (
                <button
                  onClick={() => setShowReplies(true)}
                  className="text-gray-400 text-xs hover:text-white transition-colors mb-2"
                >
                  View {comment.replies.length} replies
                </button>
              )}
              
              {(showReplies ? comment.replies : comment.replies.slice(0, 2)).map((reply) => (
                <Comment
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  level={level + 1}
                />
              ))}
              
              {comment.replies.length > 2 && showReplies && (
                <button
                  onClick={() => setShowReplies(false)}
                  className="text-gray-400 text-xs hover:text-white transition-colors mt-2"
                >
                  Hide replies
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const CommentsModal = ({ isOpen, onClose, postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { user } = useAuth();
  const { socket } = useWebSocket();
  const inputRef = useRef(null);
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
  }, [isOpen, postId]);
  
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_comment' && data.post_id === postId) {
          setComments(prev => [data.comment, ...prev]);
        } else if (data.type === 'comment_like_update') {
          updateCommentLike(data.comment_id, data.is_liked, data.likes_count);
        } else if (data.type === 'comment_deleted') {
          setComments(prev => prev.filter(c => c.id !== data.comment_id));
        }
      };
    }
  }, [socket, postId]);
  
  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentsService.getComments(postId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateCommentLike = (commentId, isLiked, likesCount) => {
    const updateComment = (comments) => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, is_liked: isLiked, likes_count: likesCount };
        }
        if (comment.replies) {
          return { ...comment, replies: updateComment(comment.replies) };
        }
        return comment;
      });
    };
    setComments(prev => updateComment(prev));
  };
  
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      await commentsService.addComment(postId, newComment, replyTo?.id);
      setNewComment('');
      setReplyTo(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReply = (comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.user.username} `);
    inputRef.current?.focus();
  };
  
  const handleLike = async (commentId) => {
    try {
      await commentsService.toggleCommentLike(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  
  const handleDelete = async (commentId) => {
    try {
      await commentsService.deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  const handleEmojiSelect = (emoji) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-end md:items-center md:justify-center"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-black w-full md:w-96 md:max-w-md max-h-[85vh] md:max-h-[80vh] rounded-t-3xl md:rounded-2xl overflow-hidden border-t border-gray-800 md:border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Comments</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto max-h-[50vh] md:max-h-[60vh] p-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex space-x-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-gray-700 rounded mb-2"></div>
                        <div className="w-full h-3 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-1">
                  {comments.map((comment) => (
                    <Comment
                      key={comment.id}
                      comment={comment}
                      onReply={handleReply}
                      onLike={handleLike}
                      onDelete={handleDelete}
                      currentUserId={user?.uid}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No comments yet</p>
                  <p className="text-gray-500 text-sm mt-1">Be the first to comment!</p>
                </div>
              )}
            </div>
            
            {/* Comment Input */}
            <div className="border-t border-gray-800 p-4">
              {replyTo && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between mb-3 p-2 bg-gray-900 rounded-lg"
                >
                  <span className="text-sm text-gray-300">
                    Replying to <span className="text-blue-400">@{replyTo.user.username}</span>
                  </span>
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setNewComment('');
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs">
                      {user?.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 relative">
                  <div className="flex items-center space-x-2 bg-gray-900 rounded-full px-4 py-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add a comment..."
                      className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
                      disabled={loading}
                    />
                    
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={handleAddComment}
                      disabled={loading || !newComment.trim()}
                      className="text-blue-500 font-semibold text-sm disabled:opacity-50 hover:text-blue-400 transition-colors"
                    >
                      {loading ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                  
                  <EmojiPicker
                    isOpen={showEmojiPicker}
                    onEmojiSelect={handleEmojiSelect}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommentsModal;