import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  MessageCircle,
  FileText,
  Users,
  Settings,
  Loader2
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const MobileNotifications = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'COMMENT_REPLY':
      case 'COMMENT_APPROVED':
      case 'COMMENT_REJECTED':
        return MessageCircle;
      case 'POST_PUBLISHED':
      case 'POST_LIKED':
        return FileText;
      case 'USER_INVITED':
      case 'USER_JOINED':
        return Users;
      default:
        return Settings;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'COMMENT_REPLY':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'COMMENT_APPROVED':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'COMMENT_REJECTED':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'POST_PUBLISHED':
        return 'text-accent-primary bg-accent-primary/10';
      case 'POST_LIKED':
        return 'text-pink-500 bg-pink-50 dark:bg-pink-900/20';
      case 'USER_INVITED':
      case 'USER_JOINED':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    onClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-light-bg dark:bg-dark-bg z-50 lg:hidden"
        >
          {/* Header */}
          <div className="bg-light-surface1 dark:bg-dark-surface1 border-b border-light-border dark:border-dark-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-accent-primary" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-2 text-accent-primary hover:bg-accent-primary/10 rounded-lg transition-colors"
                  >
                    <CheckCheck className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent-primary mr-3" />
                <span className="text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No notifications yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We'll notify you when something happens
                </p>
              </div>
            ) : (
              <div className="divide-y divide-light-border dark:divide-dark-border">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClasses = getNotificationColor(notification.type);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`
                        p-4 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors cursor-pointer
                        ${!notification.read ? 'bg-accent-primary/5' : ''}
                      `}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${colorClasses}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-base font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-accent-primary rounded-full"></div>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-2">
                                {notification.message}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-light-surface1 dark:bg-dark-surface1 border-t border-light-border dark:border-dark-border p-4">
              <button
                onClick={() => {
                  navigate('/notifications');
                  onClose();
                }}
                className="w-full py-3 text-center text-accent-primary font-medium bg-accent-primary/10 rounded-lg hover:bg-accent-primary/20 transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileNotifications;