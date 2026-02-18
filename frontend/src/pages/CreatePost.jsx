import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Image as ImageIcon, Video, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadPost } from '../services/uploadService';
import ImageCropper from '../components/ImageCropper';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const [step, setStep] = useState('select'); // 'select', 'crop', 'caption'
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    
    // Skip crop for videos, go directly to caption
    if (file.type.startsWith('video/')) {
      setCroppedFile(file);
      setStep('caption');
    } else {
      setStep('crop');
    }
  };

  const handleCrop = (croppedBlob) => {
    setCroppedFile(croppedBlob);
    setStep('caption');
  };

  const handleShare = async () => {
    if (!croppedFile || !user) return;

    try {
      setUploading(true);
      
      const postData = {
        file: croppedFile,
        caption: caption.trim(),
        location: location.trim(),
        user: user
      };

      await uploadPost(postData, (progress) => {
        setUploadProgress(progress);
      });
      
      toast.success('Post shared successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error uploading post:', error);
      toast.error('Failed to share post');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    navigate('/');
  };

  const handleBack = () => {
    if (step === 'caption') {
      setStep(selectedFile?.type.startsWith('video/') ? 'select' : 'crop');
    } else if (step === 'crop') {
      setStep('select');
    }
  };

  // Upload Progress Modal
  if (uploading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-900 rounded-lg p-6 mx-4 w-full max-w-sm"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Sharing post...</h3>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-gray-400 text-sm">{Math.round(uploadProgress)}% complete</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button onClick={step === 'select' ? handleClose : handleBack} className="text-white">
          {step === 'select' ? <X className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
        </button>
        
        <h1 className="text-white font-semibold">
          {step === 'select' && 'New post'}
          {step === 'crop' && 'Crop'}
          {step === 'caption' && 'New post'}
        </h1>

        <div className="flex items-center space-x-4">
          {step === 'crop' && (
            <button
              onClick={() => handleCrop(selectedFile)}
              className="text-blue-500 font-semibold hover:text-blue-400 transition-colors"
            >
              Next
            </button>
          )}
          {step === 'caption' && (
            <button
              onClick={handleShare}
              disabled={!caption.trim()}
              className={`font-semibold transition-colors ${
                caption.trim()
                  ? 'text-blue-500 hover:text-blue-400'
                  : 'text-blue-800 cursor-not-allowed'
              }`}
            >
              Share
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center px-8"
            >
              <div className="text-center">
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
                  Select from device
                </motion.button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </motion.div>
          )}

          {step === 'crop' && selectedFile && (
            <ImageCropper
              imageSrc={previewUrl}
              onCrop={handleCrop}
              onBack={handleBack}
            />
          )}

          {step === 'caption' && (
            <motion.div
              key="caption"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="p-4 flex-1">
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
                      className="w-full bg-transparent text-white placeholder-gray-400 resize-none focus:outline-none text-sm leading-relaxed"
                      rows={4}
                      maxLength={2200}
                    />
                    <div className="text-gray-400 text-xs mt-2">
                      {caption.length}/2,200
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Add location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder-gray-400 border-b border-gray-700 pb-2 focus:outline-none focus:border-gray-500 transition-colors text-sm"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreatePost;