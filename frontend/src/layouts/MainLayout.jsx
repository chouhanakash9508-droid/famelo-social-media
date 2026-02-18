import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Heart, MessageCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNavigation from '../components/BottomNavigation';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-opacity-95 ${
          isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        } border-b px-4 py-3`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <motion.div 
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2"
          >
            <img 
              src="/logo.png.png" 
              alt="Famelo Logo" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Famelo
            </h1>
          </motion.div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </motion.button>
            <Link to="/activity">
              <motion.div whileTap={{ scale: 0.9 }} className="p-2">
                <Heart className={`w-6 h-6 transition-colors ${
                  location.pathname === '/activity' 
                    ? 'fill-red-500 text-red-500' 
                    : (isDark ? 'text-white' : 'text-black')
                }`} />
              </motion.div>
            </Link>
            <Link to="/messages">
              <motion.div whileTap={{ scale: 0.9 }} className="p-2">
                <MessageCircle className={`w-6 h-6 transition-colors ${
                  location.pathname.startsWith('/messages') 
                    ? (isDark ? 'fill-white text-white' : 'fill-black text-black')
                    : (isDark ? 'text-white' : 'text-black')
                }`} />
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16 pb-20">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;