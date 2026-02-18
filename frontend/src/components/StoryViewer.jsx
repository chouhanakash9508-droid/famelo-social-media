import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Send, MoreHorizontal, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StoryViewer = ({ stories, initialIndex = 0, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialIndex);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const progressRef = useRef(null);
  const videoRef = useRef(null);
  const { user } = useAuth();

  const currentStory = stories[currentStoryIndex];
  const currentSegment = currentStory?.segments[currentSegmentIndex];
  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    if (!currentSegment || isPaused) return;

    const duration = currentSegment.type === 'video' ? 
      (currentSegment.duration || STORY_DURATION) : STORY_DURATION;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        handleNext();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentStoryIndex, currentSegmentIndex, isPaused, currentSegment]);

  const handleNext = () => {
    if (currentSegmentIndex < currentStory.segments.length - 1) {
      setCurrentSegmentIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setCurrentSegmentIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      const prevStory = stories[currentStoryIndex - 1];
      setCurrentSegmentIndex(prevStory.segments.length - 1);
      setProgress(0);
    }
  };

  const handleTap = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const screenWidth = rect.width;
    
    // Add small delay to prevent accidental taps
    setTimeout(() => {
      if (tapX < screenWidth / 3) {
        handlePrevious();
      } else if (tapX > (screenWidth * 2) / 3) {
        handleNext();
      }
      // Middle third does nothing (for pause/resume)
    }, 50);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    handlePause();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    handleResume();
    
    // Handle tap navigation on touch end
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.changedTouches[0];
    const tapX = touch.clientX - rect.left;
    const screenWidth = rect.width;
    
    setTimeout(() => {
      if (tapX < screenWidth / 3) {
        handlePrevious();
      } else if (tapX > (screenWidth * 2) / 3) {
        handleNext();
      }
    }, 50);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleResume = () => {
    setIsPaused(false);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const storyTime = new Date(timestamp);
    const diffInHours = Math.floor((now - storyTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  if (!currentStory || !currentSegment) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex space-x-1">
          {currentStory.segments.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: index < currentSegmentIndex ? '100%' : 
                         index === currentSegmentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
            {currentStory.user.photoURL ? (
              <img
                src={currentStory.user.photoURL}
                alt={currentStory.user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                {currentStory.user.username[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <span className="text-white font-semibold text-sm">
              {currentStory.user.username}
            </span>
            <div className="text-gray-300 text-xs">
              {formatTimeAgo(currentSegment.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {currentSegment.type === 'video' && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white p-2"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}
          <button onClick={onClose} className="text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Story Content */}
      <div
        className="w-full h-full relative cursor-pointer select-none"
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onMouseLeave={handleResume}
      >
        {currentSegment.type === 'image' ? (
          <img
            src={currentSegment.url}
            alt="Story"
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <video
            ref={videoRef}
            src={currentSegment.url}
            className="w-full h-full object-contain"
            autoPlay
            muted={isMuted}
            loop={false}
            playsInline
            onEnded={handleNext}
          />
        )}

        {/* Tap Areas (visual guide) */}
        <div className="absolute inset-0 flex pointer-events-none">
          <div className="w-1/3 h-full flex items-center justify-start pl-4">
            <div className="w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="w-0 h-0 border-r-4 border-r-white border-t-2 border-t-transparent border-b-2 border-b-transparent" />
            </div>
          </div>
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full flex items-center justify-end pr-4">
            <div className="w-8 h-8 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      {currentStory.user.uid !== user?.uid && (
        <div className="absolute bottom-8 left-4 right-4 z-20">
          <div className="flex items-center space-x-4">
            <div className="flex-1 flex items-center bg-black bg-opacity-50 rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Send message"
                className="flex-1 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              />
            </div>
            <button className="text-white p-2">
              <Heart className="w-6 h-6" />
            </button>
            <button className="text-white p-2">
              <Send className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Pause Indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <div className="w-0 h-0 border-l-8 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1" />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StoryViewer;