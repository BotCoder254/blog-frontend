import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, TrendingUp, Eye, MessageCircle, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import MainLayout from '../components/layout/MainLayout';

const Dashboard = () => {
  const { user, currentTenant } = useAuth();
  const navigate = useNavigate();

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
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">0</p>
              </div>
              <div className="p-3 bg-accent-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-accent-success">+0%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">from last month</span>
            </div>
          </div>
          
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">0</p>
              </div>
              <div className="p-3 bg-accent-secondary/10 rounded-lg">
                <Eye className="h-6 w-6 text-accent-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-accent-success">+0%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">from last month</span>
            </div>
          </div>
          
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">0</p>
              </div>
              <div className="p-3 bg-accent-warning/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-accent-warning" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-accent-success">+0%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">from last month</span>
            </div>
          </div>
          
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscribers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">0</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-accent-success">+0%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">from last month</span>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
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
          </div>

          {/* Quick Actions */}
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/posts/create')}
              >
                <PlusCircle className="h-4 w-4 mr-3" />
                Create New Post
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-3" />
                View Blog
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-3" />
                Moderate Comments
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-3" />
                Manage Users
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default Dashboard;