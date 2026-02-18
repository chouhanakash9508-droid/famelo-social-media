import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, TrendingUp, Users, Play, Heart } from 'lucide-react';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { useDebounce } from '../hooks/useDebounce';

const SearchBar = ({ value, onChange, onFocus, onBlur, isFocused }) => (
  <motion.div 
    animate={{ 
      scale: isFocused ? 1.02 : 1,
      y: isFocused ? -2 : 0
    }}
    transition={{ duration: 0.2 }}
    className="relative mb-6"
  >
    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
      isFocused ? 'text-gray-600' : 'text-gray-400'
    }`} />
    <input
      type="text"
      placeholder="Search people and posts"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl text-sm focus:outline-none transition-all duration-200 ${
        isFocused 
          ? 'focus:ring-2 focus:ring-black/10 focus:bg-white shadow-lg' 
          : 'focus:bg-white'
      }`}
    />
  </motion.div>
);

const UserResult = ({ user, onFollow, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
  >
    <div className="flex items-center space-x-4">
      <motion.img
        whileHover={{ scale: 1.05 }}
        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=000&color=fff`}
        alt={user.username}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all"
      />
      <div>
        <div className="font-semibold text-sm text-gray-900">{user.username}</div>
        <div className="text-sm text-gray-600">{user.full_name}</div>
        <div className="text-xs text-gray-400 mt-0.5">
          {user.followers_count?.toLocaleString() || 0} followers
        </div>
      </div>
    </div>
    
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onFollow(user.id)}
      className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
        user.is_following
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      {user.is_following ? 'Following' : 'Follow'}
    </motion.button>
  </motion.div>
);

const PostGrid = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No trending posts</h3>
        <p className="text-gray-500">Check back later for trending content</p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.03,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          className="aspect-square bg-gray-100 cursor-pointer group relative overflow-hidden rounded-lg"
        >
          {post.media_type === 'video' ? (
            <>
              <video
                src={post.media_url}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                muted
              />
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
            </>
          ) : (
            <img
              src={post.media_url}
              alt="Post"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
          
          {/* Overlay with stats */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
            <div className="text-white text-center">
              <div className="flex items-center space-x-1 text-sm font-semibold">
                <Heart className="w-4 h-4 fill-white" />
                <span>{post.likes_count?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const SuggestedUsers = ({ users, onFollow }) => {
  if (!users || users.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-8"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Users className="w-4 h-4 text-gray-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Suggested for you</h2>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm">
        {users.slice(0, 5).map((user, index) => (
          <UserResult key={user.id} user={user} onFollow={onFollow} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: discoverPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['discover-posts'],
    queryFn: () => postService.getDiscoverPosts(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search-users', debouncedSearch],
    queryFn: () => userService.searchUsers(debouncedSearch),
    enabled: debouncedSearch.length > 0,
    staleTime: 1000 * 60 * 2,
  });

  const { data: suggestions } = useQuery({
    queryKey: ['user-suggestions'],
    queryFn: () => userService.getSuggestions(),
    staleTime: 1000 * 60 * 10,
  });

  const handleFollow = (userId) => {
    console.log('Follow user:', userId);
  };

  const showSearchResults = isSearchFocused && debouncedSearch.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="py-6"
    >
      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        isFocused={isSearchFocused}
      />

      {/* Search Results */}
      <AnimatePresence>
        {showSearchResults && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mb-6"
          >
            <div className="bg-white rounded-2xl border border-gray-200/50 overflow-hidden shadow-lg backdrop-blur-sm">
              {searchLoading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-black rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500 text-sm">Searching...</p>
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                searchResults.map((user, index) => (
                  <UserResult key={user.id} user={user} onFollow={handleFollow} index={index} />
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-500 text-sm">Try searching for something else</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content when not searching */}
      {!showSearchResults && (
        <>
          {/* Suggested Users */}
          <SuggestedUsers users={suggestions} onFollow={handleFollow} />

          {/* Trending Posts */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Trending</h2>
            </div>

            {postsLoading ? (
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {[...Array(12)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="aspect-square bg-gray-200 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <PostGrid posts={discoverPosts?.posts} />
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Discover;