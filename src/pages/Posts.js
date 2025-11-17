import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar,
  User,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/ui/Button';
import apiService from '../services/api';

const Posts = () => {
  const navigate = useNavigate();
  const { currentTenant } = useAuth();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts', currentTenant?.id, statusFilter, searchParams.get('tag'), searchParams.get('category'), searchParams.get('author')],
    queryFn: () => {
      const params = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter.toUpperCase();
      }
      if (searchParams.get('tag')) {
        params.tag = searchParams.get('tag');
      }
      if (searchParams.get('category')) {
        params.category = searchParams.get('category');
      }
      if (searchParams.get('author')) {
        params.author = searchParams.get('author');
      }
      return apiService.getPosts(currentTenant.id, params);
    },
    enabled: !!currentTenant?.id
  });

  const posts = postsData?.content || [];

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    return status === 'PUBLISHED' 
      ? 'bg-accent-success/10 text-accent-success' 
      : 'bg-accent-warning/10 text-accent-warning';
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
        </div>
      </MainLayout>
    );
  }

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {searchParams.get('tag') ? `Tagged with "${searchParams.get('tag')}"` :
               searchParams.get('category') ? `Category: ${searchParams.get('category')}` :
               searchParams.get('author') ? `Posts by ${searchParams.get('author')}` :
               'Manage your blog posts and content'}
            </p>
          </div>
          <Button onClick={() => navigate('/posts/create')}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-gray-900 dark:text-white"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-12 border border-light-border dark:border-dark-border text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No posts found' : 'No posts yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters.'
                : 'Start creating content for your blog by writing your first post.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate('/posts/create')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {post.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                          {post.status.toLowerCase()}
                        </span>
                      </div>
                      
                      {post.excerpt && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{post.author?.firstName} {post.author?.lastName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {post.status === 'PUBLISHED' && post.publishedAt
                              ? `Published ${formatDate(post.publishedAt)}`
                              : `Updated ${formatDate(post.updatedAt)}`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/posts/edit/${post.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      {post.status === 'PUBLISHED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-accent-error hover:text-accent-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default Posts;