import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Username or email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await login(formData.emailOrUsername, formData.password);
    
    if (result.success) {
      navigate('/');
    }
  };

  const isFormValid = formData.emailOrUsername.trim() && formData.password;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <img 
                src="/logo.png.png" 
                alt="Famelo Logo" 
                className="w-20 h-20 rounded-full object-cover mb-4 shadow-lg scale-150"
                style={{ objectPosition: 'center' }}
              />
              <h1 
                className="text-4xl font-bold text-white"
                style={{
                  fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: '-0.02em'
                }}
              >
                Famelo
              </h1>
            </motion.div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                name="emailOrUsername"
                placeholder="Phone number, username, or email"
                value={formData.emailOrUsername}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors text-sm ${
                  errors.emailOrUsername 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-700 focus:border-gray-500'
                }`}
                autoCapitalize="none"
                autoCorrect="off"
              />
              {errors.emailOrUsername && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1 px-1"
                >
                  {errors.emailOrUsername}
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
                  Logging in...
                </div>
              ) : (
                'Log in'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-400 text-sm font-semibold">OR</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Forgot Password */}
          <div className="text-center">
            <Link 
              to="/forgot-password" 
              className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Sign Up Link */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-gray-800 py-6"
      >
        <div className="text-center space-y-3">
          <div>
            <span className="text-gray-400 text-sm">Don't have an account? </span>
            <Link 
              to="/signup" 
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors text-sm"
            >
              Sign up
            </Link>
          </div>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/terms" 
              className="text-gray-400 hover:text-gray-300 transition-colors text-xs"
            >
              Terms
            </Link>
            <Link 
              to="/privacy" 
              className="text-gray-400 hover:text-gray-300 transition-colors text-xs"
            >
              Privacy
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;