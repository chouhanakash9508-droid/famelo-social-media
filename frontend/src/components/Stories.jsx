import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';
import StoryViewer from './StoryViewer';
import StoryCreator from './StoryCreator';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [showViewer, setShowViewer] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStories();
  }, [user]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await storyService.getStories();
      setStories(response.stories || []);
    } catch (error) {
      console.error('Error loading stories:', error);
      // Fallback to empty array
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = async (story, index) => {
    if (story.isYourStory && !story.hasStory) {
      // Open story creator
      setShowCreator(true);
      return;
    }
    
    // Mark stories as viewed and open viewer
    if (story.segments && story.segments.length > 0) {
      try {
        await Promise.all(
          story.segments.map(segment => 
            storyService.markStoryViewed(segment.id)
          )
        );
        
        // Update local state
        setStories(prev => prev.map((s, i) => 
          i === index ? { ...s, isViewed: true } : s
        ));
      } catch (error) {
        console.error('Error marking stories as viewed:', error);
      }
    }
    
    setViewerIndex(index);
    setShowViewer(true);
  };

  const handleStoryCreated = () => {
    loadStories(); // Refresh stories after creation
  };

  const handleCloseViewer = () => {
    setShowViewer(false);
    setViewerIndex(0);
  };

  if (loading) {
    return (
      <div className="bg-black border-b border-gray-800 px-4 py-3">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center animate-pulse">
              <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
              <div className="w-12 h-3 bg-gray-700 rounded mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black border-b border-gray-800 px-4 py-3">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {stories.map((story, index) => (
            <motion.button
              key={story.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStoryClick(story, index)}
              className="flex-shrink-0 flex flex-col items-center"
            >
              <div className="relative">
                {/* Story Ring */}
                <div className={`w-16 h-16 rounded-full p-0.5 ${
                  story.isYourStory && !story.hasStory
                    ? 'bg-gray-600'
                    : story.hasStory && !story.isViewed
                    ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                    : story.hasStory && story.isViewed
                    ? 'bg-gray-600'
                    : 'bg-gray-600'
                }`}>
                  <div className="w-full h-full bg-black rounded-full p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-700">
                      {story.user?.photoURL ? (
                        <img
                          src={story.user.photoURL}
                          alt={story.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                          {story.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add Story Plus Icon */}
                {story.isYourStory && !story.hasStory && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Username */}
              <span className="text-xs text-white mt-1 max-w-[64px] truncate">
                {story.isYourStory ? 'Your story' : story.user?.username}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Story Creator */}
      <StoryCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onStoryCreated={handleStoryCreated}
      />

      {/* Story Viewer */}
      <AnimatePresence>
        {showViewer && (
          <StoryViewer
            stories={stories.filter(s => s.hasStory)}
            initialIndex={Math.max(0, viewerIndex - (stories[0]?.isYourStory && !stories[0]?.hasStory ? 1 : 0))}
            onClose={handleCloseViewer}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Stories;