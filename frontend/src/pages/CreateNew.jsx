import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload', 'edit', 'share'

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file) => {
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        setStep('edit');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleShare = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      navigate('/');
    }, 2000);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
    setStep('upload');
  };

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => navigate('/')}
            className="text-black hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-black">Create new post</h1>
          <div className="w-6"></div>
        </div>

        {/* Upload Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div
            className={`w-full max-w-md border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            
            <h3 className="text-xl font-medium text-black mb-2">
              Drag photos and videos here
            </h3>
            
            <p className="text-gray-500 mb-6">
              Or click to select from your computer
            </p>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Select from computer
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'edit') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={resetUpload}
            className="text-black hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-black">Crop</h1>
          <button
            onClick={() => setStep('share')}
            className="text-blue-500 hover:text-blue-600 font-semibold transition-colors"
          >
            Next
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <div className="w-full max-w-md aspect-square">
            {selectedFile?.type.startsWith('video/') ? (
              <video
                src={preview}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Crop Controls */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center justify-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          onClick={() => setStep('edit')}
          className="text-black hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-black">New post</h1>
        <button
          onClick={handleShare}
          disabled={uploading}
          className="text-blue-500 hover:text-blue-600 font-semibold transition-colors disabled:opacity-50"
        >
          {uploading ? 'Sharing...' : 'Share'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Preview */}
        <div className="md:w-1/2 bg-black flex items-center justify-center">
          <div className="w-full max-w-md aspect-square">
            {selectedFile?.type.startsWith('video/') ? (
              <video
                src={preview}
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Caption & Details */}
        <div className="md:w-1/2 p-4">
          {/* User Info */}
          <div className="flex items-center mb-4">
            <img
              src={user?.avatar_url || 'https://via.placeholder.com/40'}
              alt={user?.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="ml-3 font-semibold text-black">{user?.username}</span>
          </div>

          {/* Caption Input */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={2200}
          />
          
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>{caption.length}/2,200</span>
          </div>

          {/* Additional Options */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-black">Add location</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-black">Tag people</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black font-medium">Sharing your post...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;