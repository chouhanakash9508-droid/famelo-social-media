import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Image, Video, Upload } from 'lucide-react';
import { storyService } from '../services/storyService';

const StoryCreator = ({ isOpen, onClose, onStoryCreated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview({
          url: e.target.result,
          type: file.type.startsWith('image/') ? 'image' : 'video'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await storyService.createStory(selectedFile);
      onStoryCreated();
      handleClose();
    } catch (error) {
      console.error('Error uploading story:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-white font-semibold text-lg">Create Story</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {!preview ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-400 mb-6">Share a moment with your story</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-blue-500 transition-colors"
                    >
                      <Image className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">Photo</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        fileInputRef.current.accept = 'video/*';
                        fileInputRef.current?.click();
                      }}
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-600 rounded-xl hover:border-blue-500 transition-colors"
                    >
                      <Video className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-400">Video</span>
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Preview */}
                <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
                  {preview.type === 'image' ? (
                    <img
                      src={preview.url}
                      alt="Story preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      src={preview.url}
                      className="w-full h-full object-cover"
                      controls
                      muted
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Choose Different
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Share Story
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryCreator;