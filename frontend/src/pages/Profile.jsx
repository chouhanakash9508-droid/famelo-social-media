import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, Bookmark, Tag, Settings, MoreHorizontal, ArrowLeft, Play, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import EditProfileModal from '../components/EditProfileModal';
import PostModal from '../components/PostModal';

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = !username || username === currentUser?.displayName;

  useEffect(() => {
    loadProfile();
  }, [username, currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      const targetUsername = username || currentUser?.displayName;
      if (!targetUsername) return;
      
      const profileData = await userService.getUserProfile(targetUsername);
      setProfile(profileData);
      setIsFollowing(profileData.is_following || false);
      
      // Load posts and reels
      const [postsData, reelsData] = await Promise.all([
        userService.getUserPosts(targetUsername, 'posts'),
        userService.getUserPosts(targetUsername, 'reels')
      ]);
      
      setPosts(postsData.posts || []);
      setReels(reelsData.reels || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || followLoading) return;

    try {
      setFollowLoading(true);
      const response = await userService.toggleFollow(profile.id);
      setIsFollowing(response.is_following);
      
      // Update follower count optimistically
      setProfile(prev => ({
        ...prev,
        followers_count: response.is_following 
          ? prev.followers_count + 1 
          : prev.followers_count - 1
      }));
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const formatCount = (count) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="w-24 h-6 bg-gray-800 rounded"></div>
            <div className="w-6 h-6 bg-gray-800 rounded"></div>
          </div>

          {/* Profile Info Skeleton */}
          <div className="px-4 py-6">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-gray-800 rounded-full mr-6"></div>
              <div className="flex-1">
                <div className="flex justify-around mb-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="w-8 h-6 bg-gray-800 rounded mb-1"></div>
                      <div className="w-12 h-4 bg-gray-800 rounded"></div>
                    </div>
                  ))}
                </div>
                <div className="w-full h-8 bg-gray-800 rounded"></div>
              </div>
            </div>
            <div className="w-32 h-5 bg-gray-800 rounded mb-2"></div>
            <div className="w-full h-4 bg-gray-800 rounded"></div>
          </div>

          {/* Posts Grid Skeleton */}
          <div className="border-t border-gray-800 pt-4">
            <div className="grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-800"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">User not found</h2>
          <p className="text-gray-400">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const currentPosts = activeTab === 'reels' ? reels : posts;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center">
          {!isOwnProfile && (
            <button onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-white">
            {profile.username}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {isOwnProfile ? (
            <button onClick={() => setShowEditModal(true)}>
              <Settings className="w-6 h-6 text-white" />
            </button>
          ) : (
            <button>
              <MoreHorizontal className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </header>

      {/* Profile Info */}
      <div className="px-4 py-6">
        <div className="flex items-start mb-6">
          {/* Profile Picture */}
          <div className="relative mr-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                  {profile.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            {/* Add Story Ring for Own Profile */}
            {isOwnProfile && (
              <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                <Camera className="w-3 h-3 text-white" />
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="flex justify-around mb-4">
              <div className="text-center">
                <div className="font-semibold text-white text-lg">
                  {formatCount(profile.posts_count || 0)}
                </div>
                <div className="text-gray-400 text-sm">posts</div>
              </div>
              <div className="text-center cursor-pointer">
                <div className="font-semibold text-white text-lg">
                  {formatCount(profile.followers_count || 0)}
                </div>
                <div className="text-gray-400 text-sm">followers</div>
              </div>
              <div className="text-center cursor-pointer">
                <div className="font-semibold text-white text-lg">
                  {formatCount(profile.following_count || 0)}
                </div>
                <div className="text-gray-400 text-sm">following</div>
              </div>
            </div>

            {/* Action Button */}
            {isOwnProfile ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditModal(true)}
                className="w-full py-2 border border-gray-600 rounded-lg text-white font-semibold hover:bg-gray-900 transition-colors"
              >
                Edit profile
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleFollow}
                disabled={followLoading}
                className={`w-full py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 ${
                  isFollowing
                    ? 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {followLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={isFollowing ? 'following' : 'follow'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </motion.span>
                  </AnimatePresence>
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <div className="font-semibold text-white mb-1">
            {profile.display_name || profile.displayName}
          </div>
          {profile.bio && (
            <div className="text-white text-sm leading-relaxed whitespace-pre-line">
              {profile.bio}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center transition-colors ${
              activeTab === 'posts'
                ? 'border-t-2 border-white'
                : 'border-t-2 border-transparent'
            }`}
          >
            <Grid className={`w-6 h-6 ${
              activeTab === 'posts' ? 'text-white' : 'text-gray-400'
            }`} />
          </button>
          
          <button
            onClick={() => setActiveTab('reels')}
            className={`flex-1 py-3 flex items-center justify-center transition-colors ${
              activeTab === 'reels'
                ? 'border-t-2 border-white'
                : 'border-t-2 border-transparent'
            }`}
          >
            <Play className={`w-6 h-6 ${
              activeTab === 'reels' ? 'text-white' : 'text-gray-400'
            }`} />
          </button>
          
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 flex items-center justify-center transition-colors ${
                activeTab === 'saved'
                  ? 'border-t-2 border-white'
                  : 'border-t-2 border-transparent'
              }`}
            >
              <Bookmark className={`w-6 h-6 ${
                activeTab === 'saved' ? 'text-white' : 'text-gray-400'
              }`} />
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('tagged')}
            className={`flex-1 py-3 flex items-center justify-center transition-colors ${
              activeTab === 'tagged'
                ? 'border-t-2 border-white'
                : 'border-t-2 border-transparent'
            }`}
          >
            <Tag className={`w-6 h-6 ${
              activeTab === 'tagged' ? 'text-white' : 'text-gray-400'
            }`} />
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="pb-20">
        {currentPosts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {currentPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="aspect-square bg-gray-900 cursor-pointer relative group overflow-hidden"
                onClick={() => handlePostClick(post)}
              >
                <img
                  src={post.media_url || post.video_url || post.mediaUrl}
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
                      {formatCount(post.likes_count || post.likesCount || 0)}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-1 fill-current" viewBox="0 0 24 24">
                        <path d="M21,6H3A1,1 0 0,0 2,7V17A1,1 0 0,0 3,18H21A1,1 0 0,0 22,17V7A1,1 0 0,0 21,6M13,8V16H11V8H13M7,8V16H5V8H7M19,8V16H17V8H19Z"/>
                      </svg>
                      {formatCount(post.comments_count || post.commentsCount || 0)}
                    </div>
                  </div>
                </div>

                {/* Video/Reel Indicator */}
                {(post.video_url || post.mediaType === 'video' || activeTab === 'reels') && (
                  <div className="absolute top-2 right-2">
                    <Play className="w-4 h-4 text-white fill-current" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-gray-600 rounded-full flex items-center justify-center">
              {activeTab === 'posts' ? (
                <Grid className="w-8 h-8 text-gray-600" />
              ) : activeTab === 'reels' ? (
                <Play className="w-8 h-8 text-gray-600" />
              ) : activeTab === 'saved' ? (
                <Bookmark className="w-8 h-8 text-gray-600" />
              ) : (
                <Tag className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <h3 className="text-xl font-light text-white mb-2">
              {activeTab === 'posts' ? 'No Posts Yet' : 
               activeTab === 'reels' ? 'No Reels Yet' :
               activeTab === 'saved' ? 'No Saved Posts' : 'No Tagged Posts'}
            </h3>
            {isOwnProfile && activeTab === 'posts' && (
              <p className="text-gray-400 text-sm">
                When you share photos and videos, they'll appear on your profile.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onProfileUpdated={(updatedProfile) => {
          setProfile(prev => ({ ...prev, ...updatedProfile }));
          setShowEditModal(false);
        }}
      />

      {/* Post Modal */}
      <PostModal
        post={selectedPost}
        isOpen={showPostModal}
        onClose={() => {
          setShowPostModal(false);
          setSelectedPost(null);
        }}
        onLike={() => {}}
        onSave={() => {}}
      />
    </div>
  );
};

export default Profile;