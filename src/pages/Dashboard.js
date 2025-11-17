import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useRealTime } from '../contexts/RealTimeContext';
import { PlusCircle, TrendingUp, Eye, MessageCircle, Users, Search, HelpCircle, Clock, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import MainLayout from '../components/layout/MainLayout';
import api from '../services/api';

const Dashboard = () => {
  const { user, currentTenant } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const { connected, addEventListener } = useRealTime();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    pendingComments: 0,
    publishedPosts: 0,
    draftPosts: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const tenantId = currentTenant?.id;
  
  const loadDashboardData = async () => {
    if (!tenantId) return;
    
    try {
      setIsLoading(true);
      
      // Load dashboard stats from new endpoint
      const [statsResponse, activityResponse] = await Promise.all([
        api.get(`/tenants/${tenantId}/dashboard/stats`),
        api.get(`/tenants/${tenantId}/dashboard/recent-activity`).catch(() => ({ recentPosts: [], recentNotifications: [] }))
      ]);
      
      setStats({
        totalPosts: statsResponse.totalPosts || 0,
        publishedPosts: statsResponse.publishedPosts || 0,
        draftPosts: statsResponse.draftPosts || 0,
        totalViews: statsResponse.totalViews || 0,
        totalComments: statsResponse.totalComments || 0,
        pendingComments: statsResponse.pendingComments || 0
      });
      
      // Create recent activity from API response
      const activities = [];
      
      // Add recent posts
      if (activityResponse.recentPosts) {
        activityResponse.recentPosts.slice(0, 3).forEach(post => {
          activities.push({
            id: `post-${post.id}`,
            type: 'post_published',
            title: `Published "${post.title}"`,
            time: post.publishedAt,
            icon: TrendingUp,
            color: 'text-accent-primary'
          });
        });
      }
      
      // Add recent notifications
      if (activityResponse.recentNotifications) {
        activityResponse.recentNotifications.slice(0, 2).forEach(notification => {
          activities.push({
            id: `notification-${notification.id}`,
            type: 'notification',
            title: notification.title,
            time: notification.createdAt,
            icon: MessageCircle,
            color: 'text-accent-secondary'
          });
        });
      }
      
      // Add current notifications as fallback
      notifications.slice(0, 2).forEach(notification => {
        if (!activities.find(a => a.id === `notification-${notification.id}`)) {
          activities.push({
            id: `notification-${notification.id}`,
            type: 'notification',
            title: notification.title,
            time: notification.createdAt,
            icon: MessageCircle,
            color: 'text-accent-secondary'
          });
        }
      });
      
      // Sort by time and take top 5
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivity(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to basic stats
      setStats({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        totalViews: 0,
        totalComments: 0,
        pendingComments: 0
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load dashboard data
  useEffect(() => {
    if (tenantId) {
      loadDashboardData();
      // Refresh data every 30 seconds for real-time updates
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [tenantId]);
  
  // Refresh when notifications change (real-time updates)
  useEffect(() => {
    if (tenantId && !isLoading) {
      loadDashboardData();
    }
  }, [notifications.length, unreadCount]);
  
  // Listen for real-time dashboard updates
  useEffect(() => {
    if (!connected || !tenantId) return;
    
    const cleanup = addEventListener('dashboard', (update) => {
      console.log('Received dashboard update:', update);
      loadDashboardData();
    });
    
    return cleanup;
  }, [connected, tenantId, addEventListener]);
  
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Welcome Section */}
        <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ready to create amazing content for <strong>{currentTenant?.name}</strong>?
              </p>
              {currentTenant?.slug && (
                <div className="mt-3 p-3 bg-accent-primary/10 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your public blog:</p>
                  <a 
                    href={`${window.location.origin}/blog/${currentTenant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-primary hover:underline font-medium"
                  >
                    {window.location.origin}/blog/{currentTenant.slug}
                  </a>
                </div>
              )}
            </div>
            <Button 
              size="lg" 
              className="hidden sm:flex"
              onClick={() => navigate('/posts/create')}
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New Post
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {isLoading ? '...' : stats.totalPosts}
                </p>
              </div>
              <div className="p-3 bg-accent-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {stats.publishedPosts} published, {stats.draftPosts} drafts
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {isLoading ? '...' : stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-accent-secondary/10 rounded-lg">
                <Eye className="h-6 w-6 text-accent-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Across {stats.publishedPosts} published posts
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/comments')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {isLoading ? '...' : stats.totalComments}
                </p>
              </div>
              <div className="p-3 bg-accent-warning/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-accent-warning" />
                {stats.pendingComments > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.pendingComments}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stats.pendingComments > 0 ? (
                <span className="text-accent-warning flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {stats.pendingComments} pending moderation
                </span>
              ) : (
                <span className="text-accent-success">All comments moderated</span>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/notifications')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notifications</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {notifications.length}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg relative">
                <Users className="h-6 w-6 text-purple-500" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {unreadCount > 0 ? (
                <span className="text-accent-warning">{unreadCount} unread</span>
              ) : (
                <span className="text-accent-success">All caught up!</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <div className="flex items-center space-x-2">
                {connected && (
                  <div className="flex items-center space-x-1 text-xs text-accent-success">
                    <div className="w-2 h-2 bg-accent-success rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                )}
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                        <IconComponent className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(activity.time)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-3 text-sm">
                  No recent activity yet.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/posts/create')}
                >
                  Create Your First Post
                </Button>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-accent-primary/5 transition-colors"
                onClick={() => navigate('/posts/create')}
              >
                <PlusCircle className="h-4 w-4 mr-3" />
                Create New Post
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-accent-secondary/5 transition-colors"
                onClick={() => window.open(`/blog/${currentTenant?.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-3" />
                View Public Blog
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-accent-warning/5 transition-colors relative"
                onClick={() => navigate('/comments')}
              >
                <MessageCircle className="h-4 w-4 mr-3" />
                Moderate Comments
                {stats.pendingComments > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.pendingComments}
                  </span>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-purple-500/5 transition-colors"
                onClick={() => navigate('/seo')}
              >
                <Search className="h-4 w-4 mr-3" />
                Configure SEO Settings
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start hover:bg-blue-500/5 transition-colors"
                onClick={() => navigate('/help')}
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                SEO Help & Guides
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Dashboard;