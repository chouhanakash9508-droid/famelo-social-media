import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, Crop } from 'lucide-react';

const ImageCropper = ({ imageSrc, onCrop, onBack }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(prev.x + deltaX, 100 - prev.width)),
      y: Math.max(0, Math.min(prev.y + deltaY, 100 - prev.height))
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      canvas.width = 1080;
      canvas.height = 1080;
      
      const sourceX = (img.width - size) / 2;
      const sourceY = (img.height - size) / 2;
      
      ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, 1080, 1080);
      
      canvas.toBlob((blob) => {
        onCrop(blob);
      }, 'image/jpeg', 0.9);
    };
    
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button onClick={onBack} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white font-semibold">Crop</h1>
        <button onClick={handleCrop} className="text-blue-500 font-semibold">
          Next
        </button>
      </header>

      {/* Crop Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md aspect-square">
          <img
            src={imageSrc}
            alt="Crop preview"
            className="w-full h-full object-cover rounded-lg"
            draggable={false}
          />
          
          {/* Crop Overlay */}
          <div 
            className="absolute inset-0 border-2 border-white rounded-lg cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Corner handles */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="flex items-center justify-center space-x-8 p-4 border-t border-gray-800">
        <button className="flex flex-col items-center text-white">
          <RotateCcw className="w-6 h-6 mb-1" />
          <span className="text-xs">Rotate</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <Crop className="w-6 h-6 mb-1" />
          <span className="text-xs">Crop</span>
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;