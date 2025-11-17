import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sun, 
  Moon,
  LogIn,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const PublicHeader = ({ tenantSlug }) => {
  const { isAuthenticated, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-light-surface1 dark:bg-dark-surface1 border-b border-light-border dark:border-dark-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {tenantSlug?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-accent-primary">
                  {tenantSlug?.toUpperCase() || 'SPRILLIBLO'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Modern Blog Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
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

            {/* Authentication Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </motion.button>
                
                <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-light-border dark:border-dark-border">
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
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                >
                  Get Started
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;