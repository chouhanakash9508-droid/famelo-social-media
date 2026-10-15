import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../context/AuthContext';
import Stories from '../components/Stories';
import SponsoredCard from '../components/SponsoredCard';
import adService from '../services/adService';

const PostSkeleton = () => (
  <div className="bg-black border-b border-gray-800 animate-pulse">
    <div className="flex items-center px-4 py-3">
      <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
      <div className="ml-3 flex-1">
        <div className="w-24 h-4 bg-gray-800 rounded mb-1"></div>
      </div>
    </div>
    <div className="w-full aspect-square bg-gray-800"></div>
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex space-x-4">
          <div className="w-6 h-6 bg-gray-800 rounded"></div>
          <div className="w-6 h-6 bg-gray-800 rounded"></div>
          <div className="w-6 h-6 bg-gray-800 rounded"></div>
        </div>
        <div className="w-6 h-6 bg-gray-800 rounded"></div>
      </div>
      <div className="w-20 h-4 bg-gray-800 rounded mb-2"></div>
      <div className="w-full h-4 bg-gray-800 rounded mb-1"></div>
      <div className="w-3/4 h-4 bg-gray-800 rounded"></div>
    </div>
  </div>
);

const PostCard = ({ post, onLike, onSave, onComment }) => {
  const [showHeart, setShowHeart] = useState(false);
  const [lastTap, setLastTap] = useState(0);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!post.isLiked) onLike(post.id);
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
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  const formatLikesCount = (count) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}m`;
  };

  return (
    <article className="bg-black border-b border-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
            {post.user?.photoURL ? (
              <img src={post.user.photoURL} alt={post.user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                {post.user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center">
              <span className="font-semibold text-white text-sm truncate">
                {post.user?.username || 'Unknown'}
              </span>
            </div>
            {post.location && (
              <div className="text-xs text-gray-400 truncate">{post.location}</div>
            )}
          </div>
        </div>
        <button className="text-white p-2 -mr-2">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Media */}
      <div className="relative">
        <div 
          className="w-full aspect-square bg-gray-900 relative overflow-hidden cursor-pointer select-none"
          onDoubleClick={handleDoubleTap}
          onTouchEnd={handleDoubleTap}
        >
          {post.mediaType === 'video' ? (
            <video src={post.mediaUrl} className="w-full h-full object-cover" controls playsInline preload="metadata" />
          ) : (
            <img src={post.mediaUrl} alt={post.caption} className="w-full h-full object-cover" loading="lazy" draggable={false} />
          )}

          {/* Double Tap Heart Animation */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              >
                <Heart className="w-20 h-20 text-white fill-white drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onLike(post.id)}>
              <Heart className={`w-6 h-6 transition-all duration-200 ${
                post.isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white hover:text-gray-300'
              }`} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => onComment(post.id)}>
              <MessageCircle className="w-6 h-6 text-white hover:text-gray-300 transition-colors" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }}>
              <Send className="w-6 h-6 text-white hover:text-gray-300 transition-colors" />
            </motion.button>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onSave(post.id)}>
            <Bookmark className={`w-6 h-6 transition-all duration-200 ${
              post.isSaved ? 'fill-white text-white' : 'text-white hover:text-gray-300'
            }`} />
          </motion.button>
        </div>

        {/* Likes Count */}
        {post.likesCount > 0 && (
          <div className="mb-2">
            <button className="font-semibold text-white text-sm hover:text-gray-300 transition-colors">
              {formatLikesCount(post.likesCount)} {post.likesCount === 1 ? 'like' : 'likes'}
            </button>
          </div>
        )}

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <span className="font-semibold text-white text-sm mr-2">{post.user?.username}</span>
            <span className="text-white text-sm leading-relaxed">{post.caption}</span>
          </div>
        )}

        {/* Comments Preview */}
        {post.commentsCount > 0 && (
          <button onClick={() => onComment(post.id)} className="text-gray-400 text-sm mb-2 hover:text-gray-300 transition-colors">
            View all {post.commentsCount} comments
          </button>
        )}

        {/* Timestamp */}
        <div className="text-gray-400 text-xs uppercase tracking-wide">
          {formatTimeAgo(post.createdAt)}
        </div>
      </div>
    </article>
  );
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [ads, setAds] = useState([]);
  const { user } = useAuth();
  const { ref, inView } = useInView({ threshold: 0 });

  // Mock data
  const mockPosts = [
    {
      id: '1',
      user: { username: 'alice_wonder', photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
      mediaUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      mediaType: 'image',
      caption: 'Beautiful sunset at the beach 🌅 #sunset #nature #photography',
      location: 'Malibu, California',
      likesCount: 1234,
      commentsCount: 89,
      isLiked: false,
      isSaved: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      user: { username: 'john_doe', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
      mediaUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=600&fit=crop',
      mediaType: 'image',
      caption: 'Mountain hiking adventure! 🏔️ #hiking #mountains #adventure',
      location: 'Rocky Mountains, Colorado',
      likesCount: 2567,
      commentsCount: 156,
      isLiked: true,
      isSaved: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    }
  ];

  useEffect(() => {
    const loadInitialPosts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
      setLoading(false);
    };
    loadInitialPosts();
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const morePosts = [
      {
        id: `${Date.now()}-1`,
        user: { username: 'mike_photo', photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        mediaUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=600&fit=crop',
        mediaType: 'image',
        caption: 'Coffee and code ☕️💻',
        likesCount: 456,
        commentsCount: 23,
        isLiked: false,
        isSaved: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ];

    setPosts(prev => [...prev, ...morePosts]);
    if (posts.length > 8) setHasMore(false);
    setLoading(false);
  }, [hasMore, loading, posts.length]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMorePosts();
    }
  }, [inView, hasMore, loading, loadMorePosts]);

  const handleLike = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 }
        : post
    ));
  };

  const handleSave = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, isSaved: !post.isSaved } : post
    ));
  };

  const handleComment = (postId) => {
    console.log('Open comments for post:', postId);
  };

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const data = await adService.getAdsFeed();
      setAds(data.ads || []);
    } catch (e) {
      console.error('Failed to load ads', e);
    }
  };

  const handleAdClick = async (adId) => {
    try {
      await adService.trackAdClick(adId);
    } catch (e) {
      console.error('Failed to track ad click', e);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Stories />
        {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Stories />
      <div className="pb-20">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <PostCard post={post} onLike={handleLike} onSave={handleSave} onComment={handleComment} />
          </motion.div>
        ))}
        {ads.map((ad, idx) => (
          <SponsoredCard key={ad.id} ad={ad} onAdClick={handleAdClick} />
        ))}

        {hasMore && (
          <div ref={ref} className="py-8 flex justify-center">
            {loading && <PostSkeleton />}
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div className="py-12 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">You're all caught up!</h3>
            <p className="text-gray-400 text-sm">You've seen all new posts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;