import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, X, Hash, TrendingUp } from 'lucide-react';
import { searchService } from '../services/searchService';
import { postService } from '../services/postService';
import PostModal from '../components/PostModal';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [explorePosts, setExplorePosts] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    loadExplorePosts();
    loadTrendingHashtags();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setActiveTab('search');
      handleSearch();
    } else {
      setActiveTab('explore');
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadExplorePosts = async () => {
    try {
      setLoading(true);
      const response = await searchService.getExplorePosts();
      setExplorePosts(response.posts || []);
    } catch (error) {
      console.error('Error loading explore posts:', error);
      // Fallback to mock data
      const mockPosts = [
        {
          id: '1',
          user: { username: 'alice_wonder', photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
          media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
          caption: 'Beautiful sunset 🌅 #sunset #nature',
          likes_count: 1234,
          comments_count: 89,
          is_liked: false,
          is_saved: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user: { username: 'john_doe', photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
          media_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop',
          caption: 'Mountain adventure 🏔️ #hiking #mountains',
          likes_count: 2567,
          comments_count: 156,
          is_liked: true,
          is_saved: false,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          user: { username: 'sarah_j', photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
          media_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop',
          caption: 'Coffee time ☕ #coffee #morning',
          likes_count: 456,
          comments_count: 23,
          is_liked: false,
          is_saved: true,
          created_at: new Date().toISOString()
        }
      ];
      setExplorePosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingHashtags = async () => {
    try {
      const response = await searchService.getTrendingHashtags();
      setTrendingHashtags(response.hashtags || []);
    } catch (error) {
      console.error('Error loading trending hashtags:', error);
      // Fallback to mock data
      setTrendingHashtags([
        { tag: '#sunset', count: 1234 },
        { tag: '#nature', count: 987 },
        { tag: '#photography', count: 756 },
        { tag: '#travel', count: 654 },
        { tag: '#food', count: 543 }
      ]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await searchService.searchUsers(searchQuery);
      setSearchResults(response.users || []);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setActiveTab('explore');
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleLike = async (postId) => {
    try {
      await postService.toggleLike(postId);
      setExplorePosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              is_liked: !post.is_liked,
              likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          is_liked: !prev.is_liked,
          likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSave = async (postId) => {
    try {
      await postService.toggleSave(postId);
      setExplorePosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, is_saved: !post.is_saved }
          : post
      ));
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prev => ({ ...prev, is_saved: !prev.is_saved }));
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Search Bar */}
      <div className="sticky top-16 bg-black border-b border-gray-800 px-4 py-3 z-40">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users, hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {activeTab === 'search' ? (
          /* Search Results */
          <div>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-gray-800 rounded mb-2"></div>
                      <div className="w-24 h-3 bg-gray-800 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-900 p-3 rounded-xl transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{user.username}</div>
                      {user.displayName && (
                        <div className="text-gray-400 text-sm">{user.displayName}</div>
                      )}
                      {user.followers > 0 && (
                        <div className="text-gray-400 text-xs">
                          {user.followers.toLocaleString()} followers
                        </div>
                      )}
                    </div>
                    <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Follow
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-16">
                <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No results found</p>
                <p className="text-gray-500 text-sm">Try searching for users or hashtags</p>
              </div>
            ) : null}
          </div>
        ) : (
          /* Explore Content */
          <div>
            {/* Trending Hashtags */}
            {trendingHashtags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <TrendingUp className="w-5 h-5 text-white mr-2" />
                  <h2 className="text-white font-semibold text-lg">Trending</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.slice(0, 5).map((hashtag, index) => (
                    <motion.button
                      key={hashtag.tag}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center px-3 py-2 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      <Hash className="w-4 h-4 text-blue-400 mr-1" />
                      <span className="text-white text-sm font-medium">{hashtag.tag.slice(1)}</span>
                      <span className="text-gray-400 text-xs ml-2">{hashtag.count}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Explore Grid */}
            {loading ? (
              <div className="grid grid-cols-3 gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-800 animate-pulse rounded"></div>
                ))}
              </div>
            ) : explorePosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {explorePosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="aspect-square bg-gray-900 cursor-pointer relative group overflow-hidden rounded"
                    onClick={() => handlePostClick(post)}
                  >
                    <img
                      src={post.media_url || post.mediaUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex items-center space-x-4 text-white">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-1 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          {post.likes_count || post.likesCount || 0}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-1 fill-current" viewBox="0 0 24 24">
                            <path d="M21,6H3A1,1 0 0,0 2,7V17A1,1 0 0,0 3,18H21A1,1 0 0,0 22,17V7A1,1 0 0,0 21,6M13,8V16H11V8H13M7,8V16H5V8H7M19,8V16H17V8H19Z"/>
                          </svg>
                          {post.comments_count || post.commentsCount || 0}
                        </div>
                      </div>
                    </div>

                    {/* Video Indicator */}
                    {(post.media_type === 'video' || post.mediaType === 'video') && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No posts to explore</p>
                <p className="text-gray-500 text-sm">Check back later for trending content</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Modal */}
      <PostModal
        post={selectedPost}
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setSelectedPost(null);
        }}
        onLike={handleLike}
        onSave={handleSave}
      />
    </div>
  );
};

export default Search;