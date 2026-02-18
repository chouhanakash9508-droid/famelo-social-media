import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Upload, Play, Pause } from 'lucide-react';
import { reelsService } from '../services/reelsService';

const ReelCreator = ({ isOpen, onClose, onReelCreated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await reelsService.createReel(selectedFile, caption);
      onReelCreated();
      handleClose();
    } catch (error) {
      console.error('Error uploading reel:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    setUploading(false);
    setIsPlaying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-white font-semibold text-lg">Create Reel</h2>
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
              <div className="text-center">
                <p className="text-gray-400 mb-6">Share your moment with a reel</p>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-xl hover:border-blue-500 transition-colors w-full"
                >
                  <Video className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-white font-medium mb-2">Select Video</span>
                  <span className="text-sm text-gray-400">Choose a video from your device</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video Preview */}
                <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative max-h-96">
                  <video
                    ref={videoRef}
                    src={preview}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  
                  {/* Play/Pause Overlay */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlayPause}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: isPlaying ? 0 : 1 }}
                      className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
                    >
                      <Play className="w-8 h-8 text-white ml-1" />
                    </motion.div>
                  </div>
                </div>

                {/* Caption Input */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full p-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {caption.length}/500
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                      setCaption('');
                    }}
                    className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                  >
                    Choose Different
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Share Reel
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

export default ReelCreator;