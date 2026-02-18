import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const CommentsModal = ({ isOpen, onClose, postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  // Mock comments data
  const mockComments = [
    {
      id: 1,
      user: {
        username: 'alice_j',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
      },
      text: 'Amazing shot! 😍',
      timestamp: '2h',
      likes: 12
    },
    {
      id: 2,
      user: {
        username: 'david_w',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      text: 'Love the composition and colors! Where was this taken?',
      timestamp: '1h',
      likes: 8
    },
    {
      id: 3,
      user: {
        username: 'sarah_m',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      text: 'Stunning! 🔥🔥',
      timestamp: '45m',
      likes: 5
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTimeout(() => {
        setComments(mockComments);
        setLoading(false);
      }, 300);
      
      // Focus input after modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, postId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      user: {
        username: user?.username || 'you',
        avatar_url: user?.avatar_url || 'https://via.placeholder.com/40'
      },
      text: newComment,
      timestamp: 'now',
      likes: 0
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full md:w-96 md:max-w-md h-[70vh] md:h-[80vh] md:rounded-t-2xl rounded-t-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-black">Comments</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img
                    src={comment.user.avatar_url}
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm text-black">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-gray-400">{comment.timestamp}</span>
                    </div>
                    <p className="text-sm text-black mb-2">{comment.text}</p>
                    <div className="flex items-center space-x-4">
                      <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                        Reply
                      </button>
                      {comment.likes > 0 && (
                        <span className="text-xs text-gray-500">
                          {comment.likes} likes
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <img
              src={user?.avatar_url || 'https://via.placeholder.com/32'}
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                maxLength={500}
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                newComment.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;