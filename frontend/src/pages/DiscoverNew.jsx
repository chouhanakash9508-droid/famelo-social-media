import { useState, useEffect } from 'react';

const SearchBar = ({ value, onChange, onFocus, onBlur }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <input
      type="text"
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder="Search"
      className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all duration-200"
    />
  </div>
);

const PostGrid = ({ posts, onPostClick }) => (
  <div className="grid grid-cols-3 gap-1">
    {posts.map((post) => (
      <div
        key={post.id}
        className="aspect-square bg-gray-100 relative cursor-pointer group overflow-hidden"
        onClick={() => onPostClick(post)}
      >
        {post.media_type === 'video' ? (
          <>
            <video
              src={post.media_url}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              muted
            />
            <div className="absolute top-2 right-2">
              <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </>
        ) : (
          <img
            src={post.media_url}
            alt="Post"
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-4 text-white">
            <div className="flex items-center space-x-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{post.likes_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{post.comments_count}</span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const UserResult = ({ user, onFollow }) => (
  <div className="flex items-center justify-between p-3">
    <div className="flex items-center space-x-3">
      <img
        src={user.avatar_url}
        alt={user.username}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <div className="font-semibold text-black">{user.username}</div>
        <div className="text-sm text-gray-500">{user.full_name}</div>
        {user.followers_count && (
          <div className="text-xs text-gray-400">
            {user.followers_count.toLocaleString()} followers
          </div>
        )}
      </div>
    </div>
    <button
      onClick={() => onFollow(user.id)}
      className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded transition-colors"
    >
      Follow
    </button>
  </div>
);

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [discoverPosts, setDiscoverPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock discover posts
  const mockDiscoverPosts = [
    {
      id: 1,
      media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      media_type: 'image',
      likes_count: 1247,
      comments_count: 23
    },
    {
      id: 2,
      media_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
      media_type: 'image',
      likes_count: 892,
      comments_count: 15
    },
    {
      id: 3,
      media_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
      media_type: 'image',
      likes_count: 2156,
      comments_count: 67
    },
    {
      id: 4,
      media_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      media_type: 'image',
      likes_count: 543,
      comments_count: 12
    },
    {
      id: 5,
      media_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop',
      media_type: 'image',
      likes_count: 1876,
      comments_count: 34
    },
    {
      id: 6,
      media_url: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=600&fit=crop',
      media_type: 'image',
      likes_count: 721,
      comments_count: 18
    },
    {
      id: 7,
      media_url: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?w=600&h=600&fit=crop',
      media_type: 'image',
      likes_count: 1432,
      comments_count: 29
    },
    {
      id: 8,
      media_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=600&fit=crop',
      media_type: 'image',
      likes_count: 987,
      comments_count: 21
    },
    {
      id: 9,
      media_url: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=600&h=600&fit=crop',
      media_type: 'image',
      likes_count: 654,
      comments_count: 8
    }
  ];

  // Mock search results
  const mockUsers = [
    {
      id: 1,
      username: 'alice_j',
      full_name: 'Alice Johnson',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
      followers_count: 1250
    },
    {
      id: 2,
      username: 'david_w',
      full_name: 'David Wilson',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      followers_count: 567
    },
    {
      id: 3,
      username: 'sarah_m',
      full_name: 'Sarah Martinez',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      followers_count: 2340
    }
  ];

  useEffect(() => {
    // Simulate API call for discover posts
    setTimeout(() => {
      setDiscoverPosts(mockDiscoverPosts);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      // Simulate search API call
      const filteredUsers = mockUsers.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults({ users: filteredUsers, posts: [] });
    } else {
      setSearchResults({ users: [], posts: [] });
    }
  }, [searchQuery]);

  const handlePostClick = (post) => {
    console.log('Post clicked:', post);
  };

  const handleFollow = (userId) => {
    console.log('Follow user:', userId);
  };

  const showSearchResults = searchFocused && (searchQuery.trim() || searchResults.users.length > 0);

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-100">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
        />
      </div>

      {/* Search Results */}
      {showSearchResults ? (
        <div className="bg-white">
          {searchResults.users.length > 0 && (
            <div>
              <div className="px-4 py-2 text-sm font-semibold text-gray-500 bg-gray-50">
                People
              </div>
              {searchResults.users.map(user => (
                <UserResult
                  key={user.id}
                  user={user}
                  onFollow={handleFollow}
                />
              ))}
            </div>
          )}
          
          {searchQuery.trim() && searchResults.users.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-2">No results found</div>
              <div className="text-sm text-gray-400">
                Try searching for something else
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Discover Grid */
        <div className="p-1">
          {loading ? (
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <PostGrid posts={discoverPosts} onPostClick={handlePostClick} />
          )}
        </div>
      )}
    </div>
  );
};

export default Discover;