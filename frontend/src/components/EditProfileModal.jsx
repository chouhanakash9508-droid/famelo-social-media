import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Button, Icon, Input } from './';

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-primary-bg w-full max-w-md mx-4 rounded-lg shadow-large border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <button onClick={onClose} className="text-primary-text-secondary">
                <Icon name="X" size={24} />
              </button>
              <h2 className="text-lg font-semibold text-primary-text">Edit Profile</h2>
              <Button
                onClick={handleSubmit}
                className="text-accent-primary font-semibold"
                variant="ghost"
              >
                Save
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar
                    src={user?.avatar_url}
                    alt={user?.full_name}
                    size="xl"
                  />
                  <button className="absolute bottom-0 right-0 bg-accent-primary text-white p-2 rounded-full hover:bg-accent-secondary transition-colors">
                    <Icon name="Camera" size={16} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Tell us about yourself"
                    className="w-full px-3 py-2 border border-border rounded-lg bg-primary-bg text-primary-text placeholder-primary-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary resize-none"
                    rows={3}
                    maxLength={150}
                  />
                  <div className="text-right text-xs text-primary-text-tertiary mt-1">
                    {formData.bio.length}/150
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;