import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, Check, Image as ImageIcon, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadPost } from '../services/postService';
import toast from 'react-hot-toast';

const Create = () => {
  const [step, setStep] = useState('select'); // 'select', 'crop', 'caption'
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error('Please select an image or video file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep('crop');
  };

  const handleNext = () => {
    if (step === 'crop') {
      setStep('caption');
    }
  };

  const handleBack = () => {
    if (step === 'caption') {
      setStep('crop');
    } else if (step === 'crop') {
      setStep('select');
      setSelectedFile(null);
      setPreviewUrl('');
    }
  };

  const handleShare = async () => {
    if (!selectedFile || !user) return;

    try {
      setUploading(true);
      
      const postData = {
        file: selectedFile,
        caption: caption.trim(),
        location: location.trim(),
        mediaType: selectedFile.type.startsWith('video/') ? 'video' : 'image'
      };

      await uploadPost(postData);
      
      toast.success('Post shared successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error uploading post:', error);
      toast.error('Failed to share post');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button onClick={handleClose} className="text-white">
          <X className="w-6 h-6" />
        </button>
        
        <h1 className="text-white font-semibold">
          {step === 'select' && 'New post'}
          {step === 'crop' && 'Crop'}
          {step === 'caption' && 'New post'}
        </h1>

        <div className="flex items-center space-x-4">
          {step === 'crop' && (
            <button
              onClick={handleNext}
              className="text-blue-500 font-semibold hover:text-blue-400 transition-colors"
            >
              Next
            </button>
          )}
          {step === 'caption' && (
            <button
              onClick={handleShare}
              disabled={uploading || !caption.trim()}
              className={`font-semibold transition-colors ${
                uploading || !caption.trim()
                  ? 'text-blue-800 cursor-not-allowed'
                  : 'text-blue-500 hover:text-blue-400'
              }`}
            >
              {uploading ? 'Sharing...' : 'Share'}
            </button>
          )}
        </div>
      </header>

      {/* Back Button */}
      {(step === 'crop' || step === 'caption') && (
        <button
          onClick={handleBack}
          className="absolute top-20 left-4 z-10 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Content */}
      <div className="flex-1">
        {step === 'select' && (
          <div className="h-screen flex flex-col items-center justify-center px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
              
              <h2 className="text-2xl font-light text-white mb-2">
                Create new post
              </h2>
              
              <p className="text-gray-400 mb-8">
                Share photos and videos with your friends
              </p>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Select from computer
              </motion.button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          </div>
        )}

        {step === 'crop' && previewUrl && (
          <div className="h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-md aspect-square">
              {selectedFile?.type.startsWith('video/') ? (
                <video
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Selected"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        )}

        {step === 'caption' && (
          <div className="p-4">
            <div className="flex items-start space-x-3 mb-6">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="font-semibold text-white mb-2">
                  {user?.username}
                </div>
                <textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none"
                  rows={4}
                  maxLength={2200}
                />
                <div className="text-gray-400 text-xs mt-2">
                  {caption.length}/2,200
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-gray-400 border-b border-gray-700 pb-2 focus:outline-none focus:border-gray-500 transition-colors"
                />
              </div>

              {previewUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
                  {selectedFile?.type.startsWith('video/') ? (
                    <video
                      src={previewUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;