import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword, loading } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await resetPassword(email);
    
    if (result.success) {
      setEmailSent(true);
    }
  };

  const isFormValid = email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (emailSent) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-sm text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-8 bg-green-500 rounded-full flex items-center justify-center"
            >
              <Mail className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-4">Email Sent!</h2>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              We've sent a password reset link to{' '}
              <span className="text-white font-medium">{email}</span>.
              Check your email and follow the instructions to reset your password.
            </p>

            <div className="space-y-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors text-sm"
              >
                Send Another Email
              </motion.button>

              <Link
                to="/login"
                className="block w-full py-3 border border-gray-600 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors text-sm"
              >
                Back to Login
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="flex items-center px-4 py-4">
        <Link to="/login" className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm"
        >
          {/* Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 border-2 border-gray-600 rounded-full flex items-center justify-center"
            >
              <Mail className="w-10 h-10 text-gray-400" />
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-2">Trouble Logging In?</h2>
            
            <p className="text-gray-400 text-sm leading-relaxed">
              Enter your email and we'll send you a link to get back into your account.
            </p>
          </div>

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
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

            <motion.button
              type="submit"
              disabled={!isFormValid || loading}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 text-sm ${
                isFormValid && !loading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-800 text-blue-300 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Login Link'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-400 text-sm font-semibold">OR</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Create Account */}
          <Link
            to="/signup"
            className="block w-full py-3 text-center border border-gray-600 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors text-sm"
          >
            Create New Account
          </Link>
        </motion.div>
      </div>

      {/* Back to Login */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-gray-800 py-6"
      >
        <div className="text-center">
          <Link 
            to="/login" 
            className="text-gray-400 text-sm hover:text-white transition-colors"
          >
            Back To Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;