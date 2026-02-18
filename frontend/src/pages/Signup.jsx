import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Check username availability
    if (name === 'username' && value.length >= 3) {
      checkUsernameAvailability(value);
    }
  };

  const checkUsernameAvailability = async (username) => {
    // Simple client-side validation for demo
    const isValid = /^[a-zA-Z0-9._]+$/.test(username) && username.length >= 3;
    setUsernameAvailable(isValid);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, periods, and underscores';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await signup(
      formData.email, 
      formData.password, 
      formData.username, 
      formData.fullName
    );
    
    if (result.success) {
      navigate('/');
    }
  };

  const isFormValid = formData.email && formData.fullName && formData.username && formData.password.length >= 6;

  const passwordRequirements = [
    { text: 'At least 6 characters', met: formData.password.length >= 6 }
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <img 
                src="/logo.png.png" 
                alt="Famelo Logo" 
                className="w-16 h-16 rounded-full object-cover mb-3 shadow-lg scale-150"
                style={{ objectPosition: 'center' }}
              />
              <h1 
                className="text-4xl font-bold text-white mb-4"
                style={{
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: '-0.02em'
                }}
              >
                Famelo
              </h1>
            </motion.div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sign up to see photos and videos from your friends.
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors text-sm ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:border-gray-500'
                }`}
                autoCapitalize="none"
                autoCorrect="off"
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1 px-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors text-sm ${
                  errors.fullName 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:border-gray-500'
                }`}
              />
              {errors.fullName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1 px-1"
                >
                  {errors.fullName}
                </motion.p>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors pr-10 text-sm ${
                  errors.username 
                    ? 'border-red-500 focus:border-red-500' 
                    : usernameAvailable === true
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-gray-700 focus:border-gray-500'
                }`}
                autoCapitalize="none"
                autoCorrect="off"
              />
              {formData.username && usernameAvailable !== null && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {usernameAvailable ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              )}
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1 px-1"
                >
                  {errors.username}
                </motion.p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors pr-12 text-sm ${
                  errors.password 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:border-gray-500'
                }`}
              />
              {formData.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1 px-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Password Requirements */}
            {formData.password && (
              <div className="space-y-1 px-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center text-xs">
                    {req.met ? (
                      <Check className="w-3 h-3 text-green-500 mr-2" />
                    ) : (
                      <X className="w-3 h-3 text-red-500 mr-2" />
                    )}
                    <span className={req.met ? 'text-green-500' : 'text-red-500'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={!isFormValid || loading}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 text-sm mt-4 ${
                isFormValid && !loading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-800 text-blue-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing up...
                </div>
              ) : (
                'Sign up'
              )}
            </motion.button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed px-4">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
              Terms
            </Link>,{' '}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
              Privacy Policy
            </Link> and{' '}
            <span className="text-gray-300">Cookies Policy</span>.
          </p>
        </motion.div>
      </div>

      {/* Login Link */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-gray-800 py-6"
      >
        <div className="text-center">
          <span className="text-gray-400 text-sm">Have an account? </span>
          <Link 
            to="/login" 
            className="text-blue-400 font-semibold hover:text-blue-300 transition-colors text-sm"
          >
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;