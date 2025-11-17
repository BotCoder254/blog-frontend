import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  MessageCircle,
  FileText,
  Users,
  Settings,
  Loader2,
  ArrowLeft,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import MainLayout from '../components/layout/MainLayout';
import notificationService from '../services/notificationService';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications: contextNotifications, isLoading, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications, loadRecentNotifications } = useNotifications();
  
  const tenantId = user?.currentTenant?.id || user?.currentTenantId;
  
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());
  const [page, setPage] = useState(0);

  // Use notifications from context instead of separate API call
  const notifications = contextNotifications || [];
  const totalPages = 1; // For now, since we're using context notifications
  
  console.log('NotificationsPage - tenantId:', tenantId);
  console.log('NotificationsPage - contextNotifications:', contextNotifications);
  console.log('NotificationsPage - notifications:', notifications);
  console.log('NotificationsPage - filter:', filter);
  
  const refetch = loadRecentNotifications;

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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)));
    }
  };

  const handleBulkMarkAsRead = async () => {
    const promises = Array.from(selectedNotifications).map(id => {
      const notification = notifications.find(n => n.id === id);
      return notification && !notification.read ? markAsRead(id) : Promise.resolve();
    });
    
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const handleBulkDelete = async () => {
    const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
    await Promise.all(promises);
    setSelectedNotifications(new Set());
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });
  
  console.log('NotificationsPage - filteredNotifications:', filteredNotifications);
  console.log('NotificationsPage - filteredNotifications.length:', filteredNotifications.length);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Stay updated with your blog activity
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {selectedNotifications.size > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="px-3 py-2 text-sm bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Read</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'read', label: 'Read', count: notifications.length - unreadCount }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`
                  px-3 py-2 text-sm rounded-md transition-colors flex items-center space-x-2
                  ${filter === key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <span>{label}</span>
                <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              </button>
            ))}
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-accent-primary hover:text-accent-primary/80 transition-colors"
            >
              {selectedNotifications.size === notifications.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary mr-3" />
            <span className="text-gray-600 dark:text-gray-400">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-12 border border-light-border dark:border-dark-border text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' ? 'All caught up! Check back later for updates.' :
               filter === 'read' ? 'No notifications have been read yet.' :
               'We\'ll notify you when something happens with your blog.'}
            </p>
          </div>
        ) : (
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                const isSelected = selectedNotifications.has(notification.id);
                
                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`
                      p-6 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors cursor-pointer
                      ${!notification.read ? 'bg-accent-primary/5' : ''}
                      ${isSelected ? 'bg-accent-primary/10' : ''}
                    `}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                      
                      <div className={`p-3 rounded-full ${colorClasses}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div 
                        className="flex-1 min-w-0"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
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
                          
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await deleteNotification(notification.id);
                              refetch();
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default NotificationsPage;