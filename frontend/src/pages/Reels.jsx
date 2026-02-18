import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reelsService } from '../services/reelsService';

const Reels = () => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const { user } = useAuth();

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      setLoading(true);
      const response = await reelsService.getReels(1, 10);
      setReels(response.reels || []);
      setHasMore(response.has_more);
    } catch (error) {
      console.error('Error loading reels:', error);
      // Fallback to mock data
      const mockReels = [
        {
          id: '1',
          user: {
            username: 'alice_wonder',
            photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          },
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          caption: 'Amazing sunset vibes 🌅 #sunset #nature #reels',
          likes_count: 1234,
          comments_count: 89,
          is_liked: false,
          is_saved: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user: {
            username: 'john_doe',
            photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          caption: 'Dancing in the rain ☔️ #dance #rain #mood #viral',
          likes_count: 2567,
          comments_count: 156,
          is_liked: true,
          is_saved: false,
          created_at: new Date().toISOString()
        }
      ];
      setReels(mockReels);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Play current video and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.currentTime = 0;
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0 && currentIndex < reels.length - 1) {
        // Swipe up - next reel
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe down - previous reel
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const handleLike = async (reelId) => {
    try {
      const response = await reelsService.toggleLike(reelId);
      setReels(prev => prev.map(reel => 
        reel.id === reelId 
          ? { 
              ...reel, 
              is_liked: response.is_liked,
              likes_count: response.is_liked ? reel.likes_count + 1 : reel.likes_count - 1
            }
          : reel
      ));
    } catch (error) {
      console.error('Error liking reel:', error);
    }
  };

  const handleSave = async (reelId) => {
    try {
      const response = await reelsService.toggleSave(reelId);
      setReels(prev => prev.map(reel => 
        reel.id === reelId 
          ? { ...reel, is_saved: response.is_saved }
          : reel
      ));
    } catch (error) {
      console.error('Error saving reel:', error);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    videoRefs.current.forEach(video => {
      if (video) {
        video.muted = !muted;
      }
    });
  };

  const formatCount = (count) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center">
        <Play className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-white text-xl font-semibold mb-2">No Reels Yet</h3>
        <p className="text-gray-400 text-center">Start creating amazing reels to see them here!</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      <div
        ref={containerRef}
        className="h-full w-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full relative flex items-center justify-center"
          >
            {/* Video */}
            <video
              ref={el => videoRefs.current[currentIndex] = el}
              src={reels[currentIndex]?.video_url}
              className="w-full h-full object-cover"
              loop
              muted={muted}
              playsInline
              preload="metadata"
              onError={(e) => console.error('Video error:', e)}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Right Side Actions */}
            <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-6">
              {/* User Avatar */}
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                  {reels[currentIndex]?.user?.photoURL ? (
                    <img
                      src={reels[currentIndex].user.photoURL}
                      alt={reels[currentIndex].user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {reels[currentIndex]?.user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Follow Button */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              </motion.div>

              {/* Like */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => handleLike(reels[currentIndex]?.id)}
                className="flex flex-col items-center"
              >
                <Heart 
                  className={`w-8 h-8 ${
                    reels[currentIndex]?.is_liked 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-white'
                  }`}
                />
                <span className="text-white text-xs mt-1 font-semibold">
                  {formatCount(reels[currentIndex]?.likes_count || 0)}
                </span>
              </motion.button>

              {/* Comment */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <MessageCircle className="w-8 h-8 text-white" />
                <span className="text-white text-xs mt-1 font-semibold">
                  {formatCount(reels[currentIndex]?.comments_count || 0)}
                </span>
              </motion.button>

              {/* Share */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <Send className="w-8 h-8 text-white" />
              </motion.button>

              {/* Save */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => handleSave(reels[currentIndex]?.id)}
                className="flex flex-col items-center"
              >
                <Bookmark 
                  className={`w-8 h-8 ${
                    reels[currentIndex]?.is_saved 
                      ? 'fill-white text-white' 
                      : 'text-white'
                  }`}
                />
              </motion.button>

              {/* More */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                className="flex flex-col items-center"
              >
                <MoreHorizontal className="w-8 h-8 text-white" />
              </motion.button>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-20 p-4">
              <div className="flex items-center mb-2">
                <span className="font-bold text-white text-base">
                  @{reels[currentIndex]?.user?.username}
                </span>
              </div>
              
              {reels[currentIndex]?.caption && (
                <p className="text-white text-sm leading-relaxed mb-2">
                  {reels[currentIndex].caption}
                </p>
              )}

              {/* Music/Audio Info */}
              <div className="flex items-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2">
                  <div className="w-3 h-3 bg-black rounded-full animate-spin" />
                </div>
                <span className="text-white text-xs">Original audio</span>
              </div>
            </div>

            {/* Mute Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className="absolute top-16 right-4 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
            >
              {muted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </motion.button>

            {/* Progress Indicator */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {reels.map((_, index) => (
                <div
                  key={index}
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white w-8' 
                      : index < currentIndex 
                      ? 'bg-white w-4' 
                      : 'bg-gray-600 w-4'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe Indicators */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-4 flex flex-col items-center space-y-2 pointer-events-none">
        {currentIndex > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-white text-xs"
          >
            ↓ Swipe down
          </motion.div>
        )}
        {currentIndex < reels.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="text-white text-xs"
          >
            ↑ Swipe up
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Reels;