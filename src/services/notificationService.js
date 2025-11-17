import api from './api';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class NotificationService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // WebSocket connection
  connect(userId, onNotificationReceived) {
    if (this.connected) return;

    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const wsUrl = baseUrl.endsWith('/api') ? `${baseUrl}/ws` : `${baseUrl}/api/ws`;
      const socket = new SockJS(wsUrl);
      this.stompClient = Stomp.over(socket);

      // Disable debug logging in production
      this.stompClient.debug = process.env.NODE_ENV === 'development' ? console.log : () => {};

      this.stompClient.connect(
        {},
        () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          console.log('WebSocket connected');

          // Subscribe to user-specific notifications
          const subscription = this.stompClient.subscribe(
            `/user/${userId}/queue/notifications`,
            (message) => {
              const notification = JSON.parse(message.body);
              onNotificationReceived(notification);
            }
          );

          this.subscriptions.set(userId, subscription);
        },
        (error) => {
          console.warn('WebSocket connection failed, continuing without real-time notifications:', error);
          this.connected = false;
          // Don't attempt reconnect for 403 errors
          if (!error.toString().includes('403')) {
            this.handleReconnect(userId, onNotificationReceived);
          }
        }
      );
    } catch (error) {
      console.warn('WebSocket initialization failed:', error);
    }
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.subscriptions.forEach(subscription => subscription.unsubscribe());
      this.subscriptions.clear();
      this.stompClient.disconnect();
      this.connected = false;
      console.log('WebSocket disconnected');
    }
  }

  handleReconnect(userId, onNotificationReceived) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(userId, onNotificationReceived);
      }, delay);
    }
  }

  // API methods
  async getNotifications(tenantId, page = 0, size = 20) {
    const response = await api.get(`/tenants/${tenantId}/notifications?page=${page}&size=${size}`);
    return response.data;
  }

  async getRecentNotifications(tenantId) {
    try {
      const response = await api.get(`/tenants/${tenantId}/notifications/recent`);
      return response;
    } catch (error) {
      console.warn('Failed to fetch recent notifications:', error.message);
      return [];
    }
  }

  async getUnreadNotifications(tenantId) {
    const response = await api.get(`/tenants/${tenantId}/notifications/unread`);
    return response.data;
  }

  async getUnreadCount(tenantId) {
    try {
      const response = await api.get(`/tenants/${tenantId}/notifications/unread/count`);
      return response.count || 0;
    } catch (error) {
      console.warn('Failed to fetch unread count:', error.message);
      return 0;
    }
  }

  async markAsRead(tenantId, notificationId) {
    const response = await api.put(`/tenants/${tenantId}/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllAsRead(tenantId) {
    await api.put(`/tenants/${tenantId}/notifications/read-all`);
  }

  async deleteNotification(tenantId, notificationId) {
    await api.delete(`/tenants/${tenantId}/notifications/${notificationId}`);
  }

  async deleteAllNotifications(tenantId) {
    await api.delete(`/tenants/${tenantId}/notifications/all`);
  }
}

export default new NotificationService();