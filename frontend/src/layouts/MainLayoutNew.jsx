import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('home');
    else if (path === '/discover') setActiveTab('discover');
    else if (path === '/create') setActiveTab('create');
    else if (path === '/activity') setActiveTab('activity');
    else if (path === '/profile') setActiveTab('profile');
  }, [location]);

  const navItems = [
    { id: 'home', path: '/', icon: 'home' },
    { id: 'discover', path: '/discover', icon: 'search' },
    { id: 'create', path: '/create', icon: 'plus' },
    { id: 'activity', path: '/activity', icon: 'heart' },
    { id: 'profile', path: '/profile', icon: 'user' }
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderIcon = (iconName, isActive) => {
    const baseClass = `w-6 h-6 transition-all duration-200 ${isActive ? 'text-black' : 'text-gray-700'}`;
    
    switch (iconName) {
      case 'home':
        return (
          <svg className={baseClass} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? 0 : 1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        );
      case 'search':
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        );
      case 'plus':
        return (
          <svg className={baseClass} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        );
      case 'heart':
        return (
          <svg className={baseClass} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? 0 : 1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        );
      case 'user':
        return user?.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt="Profile" 
            className={`w-6 h-6 rounded-full object-cover transition-all duration-200 ${
              isActive ? 'ring-2 ring-black ring-offset-1' : 'ring-1 ring-gray-300'
            }`}
          />
        ) : (
          <svg className={baseClass} fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isActive ? 0 : 1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="text-2xl font-bold text-black cursor-pointer" onClick={() => navigate('/')}>
            Framelo
          </div>
          
          {/* Desktop Search */}
          <div className="hidden lg:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-64 px-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all duration-200"
              />
              <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className="p-2 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {renderIcon(item.icon, activeTab === item.id)}
              </button>
            ))}
            
            {/* Desktop Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-1 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {renderIcon('user', activeTab === 'profile')}
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Settings
                  </button>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:pt-16 pb-16 md:pb-0">
        <div className="transition-all duration-300 ease-out">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`p-3 transition-all duration-200 ${
                activeTab === item.id ? 'scale-105' : 'scale-100 hover:scale-105'
              }`}
            >
              {renderIcon(item.icon, activeTab === item.id)}
            </button>
          ))}
        </div>
      </nav>
      
      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;