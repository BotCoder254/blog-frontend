import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  Menu, 
  Sun, 
  Moon,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMobileMenuToggle, isMobile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, currentTenant } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-light-surface1 dark:bg-dark-surface1 border-b border-light-border dark:border-dark-border">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {isMobile && (
              <button
                onClick={onMobileMenuToggle}
                className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            
            {isMobile && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {currentTenant?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <h1 className="text-lg font-bold text-accent-primary">
                  SPRILLIBLO
                </h1>
              </div>
            )}

            {/* Search Bar - Hidden on mobile */}
            {!isMobile && (
              <div className="relative max-w-md w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts, categories..."
                  className="
                    block w-full pl-10 pr-3 py-2 border border-light-border dark:border-dark-border
                    rounded-lg bg-light-input dark:bg-dark-input
                    text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                    focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
                    transition-colors duration-200
                  "
                />
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Create Post Button - Mobile */}
            {isMobile && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/posts/create')}
                className="p-2 bg-accent-primary text-white rounded-lg shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-error rounded-full border-2 border-light-surface1 dark:border-dark-surface1" />
            </button>

            {/* Profile - Desktop only */}
            {!isMobile && (
              <div className="flex items-center space-x-3 pl-3 border-l border-light-border dark:border-dark-border">
                <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentTenant?.role || 'Member'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;