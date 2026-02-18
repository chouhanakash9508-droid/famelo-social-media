import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfileStats = ({ posts, followers, following }) => (
  <div className="flex justify-center space-x-8 py-6">
    <div className="text-center">
      <div className="text-xl font-semibold text-black">{posts}</div>
      <div className="text-sm text-gray-500">posts</div>
    </div>
    <div className="text-center">
      <div className="text-xl font-semibold text-black">{followers.toLocaleString()}</div>
      <div className="text-sm text-gray-500">followers</div>
    </div>
    <div className="text-center">
      <div className="text-xl font-semibold text-black">{following.toLocaleString()}</div>
      <div className="text-sm text-gray-500">following</div>
    </div>
  </div>
);

const PostGrid = ({ posts, onPostClick }) => (
  <div className="grid grid-cols-3 gap-1">
    {posts.map((post, index) => (
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

const PostModal = ({ post, isOpen, onClose }) => {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Media */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {post.media_type === 'video' ? (
            <video
              src={post.media_url}
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
            />
          ) : (
            <img
              src={post.media_url}
              alt="Post"
              className="max-w-full max-h-full object-contain"
            />
          )}
        </div>

        {/* Details */}
        <div className="w-80 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center">
              <img
                src={post.user.avatar_url}
                alt={post.user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="ml-3 font-semibold text-black">{post.user.username}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Caption */}
          <div className="flex-1 p-4 overflow-y-auto">
            {post.caption && (
              <div className="mb-4">
                <span className="font-semibold text-black mr-2">{post.user.username}</span>
                <span className="text-black">{post.caption}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <button className="transition-transform duration-150 hover:scale-110">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button className="transition-transform duration-150 hover:scale-110">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
              <button className="transition-transform duration-150 hover:scale-110">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
            <div className="text-sm font-semibold text-black mb-1">
              {post.likes_count.toLocaleString()} likes
            </div>
            <div className="text-xs text-gray-400 uppercase">
              {post.created_at}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock user data
  const profileData = {
    ...user,
    posts_count: 45,
    followers_count: 1250,
    following_count: 890,
    bio: 'Photography enthusiast 📸 | Travel lover ✈️ | Coffee addict ☕'
  };

  // Mock posts data
  const mockPosts = [
    {
      id: 1,
      user: { username: user?.username, avatar_url: user?.avatar_url },
      media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
      media_type: 'image',
      caption: 'Beautiful sunset from my travels ✨',
      likes_count: 1247,
      comments_count: 23,
      created_at: '2 hours ago'
    },
    {
      id: 2,
      user: { username: user?.username, avatar_url: user?.avatar_url },
      media_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
      media_type: 'image',
      caption: 'Coffee and code 💻☕',
      likes_count: 892,
      comments_count: 15,
      created_at: '4 hours ago'
    },
    {
      id: 3,
      user: { username: user?.username, avatar_url: user?.avatar_url },
      media_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
      media_type: 'image',
      caption: 'Morning workout done! 💪',
      likes_count: 2156,
      comments_count: 67,
      created_at: '6 hours ago'
    },
    {
      id: 4,
      user: { username: user?.username, avatar_url: user?.avatar_url },
      media_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
      media_type: 'image',
      caption: 'New kicks 👟',
      likes_count: 543,
      comments_count: 12,
      created_at: '1 day ago'
    },
    {
      id: 5,
      user: { username: user?.username, avatar_url: user?.avatar_url },
      media_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop',
      media_type: 'image',
      caption: 'Ocean vibes 🌊',
      likes_count: 1876,
      comments_count: 34,
      created_at: '2 days ago'
    },
    {
      id: 6,
      user: { username: user?.username, avatar_url: user?.avatar_url },
      media_url: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&h=600&fit=crop',
      media_type: 'image',
      caption: 'Breakfast goals 🥞',
      likes_count: 721,
      comments_count: 18,
      created_at: '3 days ago'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 500);
  }, []);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* Profile Header */}
      <div className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={profileData.avatar_url || 'https://via.placeholder.com/80'}
            alt={profileData.username}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-xl font-light text-black">{profileData.username}</h1>
              <button className="px-4 py-1 border border-gray-300 rounded text-sm font-semibold text-black hover:bg-gray-50 transition-colors">
                Edit profile
              </button>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <div className="font-semibold text-black mb-1">{profileData.full_name}</div>
          <div className="text-black">{profileData.bio}</div>
        </div>

        {/* Stats */}
        <ProfileStats
          posts={profileData.posts_count}
          followers={profileData.followers_count}
          following={profileData.following_count}
        />
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'text-black border-t-2 border-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            POSTS
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${
              activeTab === 'saved'
                ? 'text-black border-t-2 border-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            SAVED
          </button>
          <button
            onClick={() => setActiveTab('tagged')}
            className={`flex-1 py-3 text-center text-sm font-semibold transition-colors ${
              activeTab === 'tagged'
                ? 'text-black border-t-2 border-black'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            TAGGED
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {loading ? (
          <div className="grid grid-cols-3 gap-1 p-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : activeTab === 'posts' ? (
          posts.length > 0 ? (
            <PostGrid posts={posts} onPostClick={handlePostClick} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-light text-black mb-2">Share Photos</h3>
              <p className="text-gray-500 text-center mb-4">When you share photos, they will appear on your profile.</p>
              <button className="text-blue-500 font-semibold hover:text-blue-600 transition-colors">
                Share your first photo
              </button>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-light text-black mb-2">
              {activeTab === 'saved' ? 'Save' : 'Photos of you'}
            </h3>
            <p className="text-gray-500 text-center">
              {activeTab === 'saved' 
                ? 'Save photos and videos that you want to see again.'
                : 'When people tag you in photos, they\'ll appear here.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Post Modal */}
      <PostModal
        post={selectedPost}
        isOpen={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Profile;