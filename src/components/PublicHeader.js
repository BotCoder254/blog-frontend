import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon,
  LogIn,
  User,
  Menu,
  X,
  Home,
  Search,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const PublicHeader = ({ tenantSlug }) => {
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('header')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-light-surface1 dark:bg-dark-surface1 border-b border-light-border dark:border-dark-border sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section - Logo/Brand */}
            <div className="flex items-center space-x-4">
              <Link to={tenantSlug ? `/blog/${tenantSlug}` : '/'} className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {tenantSlug?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg sm:text-xl font-bold text-accent-primary">
                    {tenantSlug?.toUpperCase() || 'SPRILLIBLO'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                    Modern Blog Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to={tenantSlug ? `/blog/${tenantSlug}` : '/'}
                className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-accent-primary transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-accent-primary transition-colors">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-accent-primary transition-colors">
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks</span>
              </button>
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Desktop Authentication */}
              <div className="hidden sm:flex items-center space-x-2">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors text-sm"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden lg:inline">Dashboard</span>
                    </motion.button>
                    
                    <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-light-border dark:border-dark-border">
                      <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/auth')}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors text-sm"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="hidden lg:inline">Sign In</span>
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/auth')}
                      className="px-3 sm:px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors text-sm font-medium"
                    >
                      <span className="hidden sm:inline">Get Started</span>
                      <span className="sm:hidden">Join</span>
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-light-surface1 dark:bg-dark-surface1 border-b border-light-border dark:border-dark-border sticky top-16 z-40"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-3">
                <Link 
                  to={tenantSlug ? `/blog/${tenantSlug}` : '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                >
                  <Home className="w-5 h-5 text-accent-primary" />
                  <span className="font-medium text-gray-900 dark:text-white">Home</span>
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors w-full text-left"
                >
                  <Search className="w-5 h-5 text-accent-primary" />
                  <span className="font-medium text-gray-900 dark:text-white">Search</span>
                </button>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors w-full text-left"
                >
                  <Bookmark className="w-5 h-5 text-accent-primary" />
                  <span className="font-medium text-gray-900 dark:text-white">Bookmarks</span>
                </button>
              </nav>

              {/* Mobile Authentication */}
              <div className="pt-4 border-t border-light-border dark:border-dark-border">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3">
                      <div className="w-10 h-10 bg-accent-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate('/dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium"
                    >
                      <User className="w-5 h-5" />
                      <span>Go to Dashboard</span>
                    </motion.button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate('/auth');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-light-border dark:border-dark-border text-gray-900 dark:text-white rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors font-medium"
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigate('/auth');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium"
                    >
                      Get Started
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicHeader;