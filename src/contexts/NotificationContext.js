import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const tenantId = user?.currentTenant?.id || user?.currentTenantId;

  // Handle new notification received via WebSocket
  const handleNotificationReceived = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        tag: notification.id
      });
    }
  }, []);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (user?.id && tenantId) {
      notificationService.connect(user.id, handleNotificationReceived);
      loadRecentNotifications();
      loadUnreadCount();

      return () => {
        notificationService.disconnect();
      };
    }
  }, [user?.id, tenantId, handleNotificationReceived]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const loadRecentNotifications = async () => {
    if (!tenantId) {
      console.log('No tenantId available for loading notifications');
      return;
    }
    
    console.log('Loading recent notifications for tenant:', tenantId);
    try {
      setIsLoading(true);
      const data = await notificationService.getRecentNotifications(tenantId);
      console.log('Loaded notifications:', data);
      console.log('Setting notifications state to:', data || []);
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    if (!tenantId) return;
    
    try {
      const count = await notificationService.getUnreadCount(tenantId);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!tenantId) return;
    
    try {
      await notificationService.markAsRead(tenantId, notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!tenantId) return;
    
    try {
      await notificationService.markAllAsRead(tenantId);
      
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          read: true, 
          readAt: new Date().toISOString() 
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!tenantId) return;
    
    try {
      await notificationService.deleteNotification(tenantId, notificationId);
      
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!tenantId) return;
    
    try {
      await notificationService.deleteAllNotifications(tenantId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    loadRecentNotifications,
    loadUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};