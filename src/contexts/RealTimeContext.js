import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const { user } = useAuth();
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState(new Map());
  const [listeners, setListeners] = useState(new Map());
  
  const tenantId = user?.currentTenant?.id || user?.currentTenantId;

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (connected || !user?.id || !tenantId) return;

    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const wsUrl = baseUrl.endsWith('/api') ? `${baseUrl}/ws` : `${baseUrl}/api/ws`;
      const socket = new SockJS(wsUrl);
      const client = Stomp.over(socket);

      // Disable debug logging in production
      client.debug = process.env.NODE_ENV === 'development' ? console.log : () => {};

      client.connect(
        {},
        () => {
          console.log('Real-time WebSocket connected');
          setStompClient(client);
          setConnected(true);
          
          // Subscribe to user notifications
          const notificationSub = client.subscribe(
            `/user/${user.id}/queue/notifications`,
            (message) => {
              const notification = JSON.parse(message.body);
              notifyListeners('notification', notification);
            }
          );
          
          // Subscribe to tenant-specific updates
          const dashboardSub = client.subscribe(
            `/topic/dashboard/${tenantId}`,
            (message) => {
              const update = JSON.parse(message.body);
              notifyListeners('dashboard', update);
            }
          );
          
          const commentsSub = client.subscribe(
            `/topic/comments/${tenantId}`,
            (message) => {
              const update = JSON.parse(message.body);
              notifyListeners('comments', update);
            }
          );
          
          const postsSub = client.subscribe(
            `/topic/posts/${tenantId}`,
            (message) => {
              const update = JSON.parse(message.body);
              notifyListeners('posts', update);
            }
          );
          
          setSubscriptions(new Map([
            ['notifications', notificationSub],
            ['dashboard', dashboardSub],
            ['comments', commentsSub],
            ['posts', postsSub]
          ]));
        },
        (error) => {
          console.warn('WebSocket connection failed, continuing without real-time updates:', error);
          setConnected(false);
        }
      );
    } catch (error) {
      console.warn('WebSocket initialization failed:', error);
    }
  }, [user?.id, tenantId, connected]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (stompClient && connected) {
      subscriptions.forEach(subscription => subscription.unsubscribe());
      setSubscriptions(new Map());
      stompClient.disconnect();
      setStompClient(null);
      setConnected(false);
      console.log('Real-time WebSocket disconnected');
    }
  }, [stompClient, connected, subscriptions]);

  // Notify all listeners for a specific event type
  const notifyListeners = useCallback((eventType, data) => {
    const eventListeners = listeners.get(eventType) || [];
    eventListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in ${eventType} listener:`, error);
      }
    });
  }, [listeners]);

  // Add event listener
  const addEventListener = useCallback((eventType, listener) => {
    const eventListeners = listeners.get(eventType) || [];
    const newListeners = [...eventListeners, listener];
    setListeners(prev => new Map(prev.set(eventType, newListeners)));
    
    // Return cleanup function
    return () => {
      const currentListeners = listeners.get(eventType) || [];
      const filteredListeners = currentListeners.filter(l => l !== listener);
      setListeners(prev => new Map(prev.set(eventType, filteredListeners)));
    };
  }, [listeners]);

  // Remove event listener
  const removeEventListener = useCallback((eventType, listener) => {
    const eventListeners = listeners.get(eventType) || [];
    const filteredListeners = eventListeners.filter(l => l !== listener);
    setListeners(prev => new Map(prev.set(eventType, filteredListeners)));
  }, [listeners]);

  // Send message to server
  const sendMessage = useCallback((destination, message) => {
    if (stompClient && connected) {
      stompClient.send(destination, {}, JSON.stringify(message));
    }
  }, [stompClient, connected]);

  // Connect when user and tenant are available
  useEffect(() => {
    if (user?.id && tenantId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [user?.id, tenantId, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const value = {
    connected,
    addEventListener,
    removeEventListener,
    sendMessage,
    connect,
    disconnect
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};