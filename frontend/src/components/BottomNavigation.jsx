import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Play, User, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const navItems = [
    { 
      icon: Home, 
      path: '/', 
      label: 'Home',
      activeIcon: Home
    },
    { 
      icon: Search, 
      path: '/search', 
      label: 'Search',
      activeIcon: Search
    },
    { 
      icon: PlusSquare, 
      path: '/create', 
      label: 'Create',
      activeIcon: PlusSquare
    },
    { 
      icon: Play, 
      path: '/reels', 
      label: 'Reels',
      activeIcon: Play
    },
    { 
      icon: User, 
      path: '/profile', 
      label: 'Profile',
      activeIcon: User,
      isProfile: true
    }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={`fixed bottom-0 left-0 right-0 z-50 ${
        isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
      } border-t backdrop-blur-lg bg-opacity-95`}
    >
      <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleNavigation(item.path)}
              className="flex flex-col items-center justify-center p-3 min-w-[48px]"
            >
              <div className="relative">
                {item.isProfile ? (
                  <div className={`w-6 h-6 rounded-full overflow-hidden ${
                    active ? 'ring-2 ring-black dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-black' : ''
                  }`}>
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {user?.displayName?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <Icon 
                    className={`w-6 h-6 transition-colors duration-200 ${
                      active 
                        ? (isDark ? 'text-white' : 'text-black')
                        : (isDark ? 'text-gray-400' : 'text-gray-600')
                    } ${active && item.path === '/create' ? 'stroke-2' : ''}`}
                    fill={active && (item.path === '/' || item.path === '/reels') ? 'currentColor' : 'none'}
                  />
                )}
                
                {/* Active indicator dot */}
                {active && !item.isProfile && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                      isDark ? 'bg-white' : 'bg-black'
                    }`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BottomNavigation;