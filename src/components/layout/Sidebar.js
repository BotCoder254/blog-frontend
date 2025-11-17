import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  Folder, 
  Tag, 
  MessageCircle, 
  Users, 
  Image, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Bell,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ collapsed, onToggleCollapse, isMobile, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, currentTenant, logout } = useAuth();
  const { isDark } = useTheme();

  const navigationItems = [
    {
      group: 'Content',
      items: [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: FileText, label: 'Posts', path: '/posts' },
        { icon: PlusCircle, label: 'Create Post', path: '/posts/create', highlight: true },
        { icon: Folder, label: 'Categories', path: '/categories' },
        { icon: Tag, label: 'Tags', path: '/tags' },
      ]
    },
    {
      group: 'Community',
      items: [
        { icon: MessageCircle, label: 'Comments', path: '/comments' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
      ]
    },
    {
      group: 'Media',
      items: [
        { icon: Image, label: 'Media Library', path: '/media' },
      ]
    },
    {
      group: 'Settings',
      items: [
        { icon: Search, label: 'SEO & Visibility', path: '/seo' },
        { icon: HelpCircle, label: 'SEO Help', path: '/help' },
      ]
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  const canAccessItem = (item) => {
    if (item.adminOnly) {
      return user?.role === 'ADMIN' || currentTenant?.role === 'OWNER';
    }
    return true;
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`
        ${isMobile ? 'w-80' : ''} 
        h-screen bg-light-surface1 dark:bg-dark-surface1 
        border-r border-light-border dark:border-dark-border
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between">
          {(!collapsed || isMobile) && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentTenant?.name?.charAt(0) || 'S'}
                </span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {currentTenant?.name || 'SPRILLIBLO'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentTenant?.slug || 'blog'}
                </p>
              </div>
            </div>
          )}
          
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {navigationItems.map((group) => (
          <div key={group.group} className="mb-6">
            {(!collapsed || isMobile) && (
              <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {group.group}
              </h3>
            )}
            
            <div className="space-y-1 px-2">
              {group.items
                .filter(canAccessItem)
                .map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl
                        transition-all duration-200 text-left
                        ${active 
                          ? 'bg-accent-primary text-white shadow-lg' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover'
                        }
                        ${item.highlight && !active ? 'ring-2 ring-accent-primary/20' : ''}
                        ${collapsed && !isMobile ? 'justify-center' : ''}
                      `}
                    >
                      <Icon className={`w-5 h-5 ${collapsed && !isMobile ? '' : 'flex-shrink-0'}`} />
                      
                      {(!collapsed || isMobile) && (
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      )}
                      
                      {item.highlight && (!collapsed || isMobile) && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-accent-secondary rounded-full animate-pulse" />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-light-border dark:border-dark-border">
        {(!collapsed || isMobile) && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Signed in as
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-accent-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={logout}
          className={`
            w-full flex items-center space-x-3 px-3 py-2 rounded-xl
            text-gray-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover
            transition-colors duration-200
            ${collapsed && !isMobile ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-5 h-5" />
          {(!collapsed || isMobile) && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;