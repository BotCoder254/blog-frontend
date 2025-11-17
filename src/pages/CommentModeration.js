import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Trash2, MessageCircle, Clock } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';

const CommentModeration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  
  const tenantId = user?.currentTenant?.id || user?.currentTenantId;

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['pendingComments', tenantId, currentPage],
    queryFn: async () => {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      const response = await fetch(`${BASE_URL}/tenants/${tenantId}/comments?page=${currentPage}&size=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: !!tenantId
  });

  const approveMutation = useMutation({
    mutationFn: async (commentId) => {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      const response = await fetch(`${BASE_URL}/tenants/${tenantId}/comments/${commentId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to approve comment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingComments']);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (commentId) => {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      const response = await fetch(`${BASE_URL}/tenants/${tenantId}/comments/${commentId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to reject comment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingComments']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId) => {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;
      
      const response = await fetch(`${BASE_URL}/tenants/${tenantId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete comment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingComments']);
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Comment Moderation
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Review and moderate pending comments
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : !commentsData?.content?.length ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No pending comments
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All comments have been reviewed and moderated.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {commentsData.content.map((comment) => (
              <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.authorName}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {comment.authorEmail}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {formatDate(comment.createdAt)}
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => approveMutation.mutate(comment.id)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    
                    <button
                      onClick={() => rejectMutation.mutate(comment.id)}
                      disabled={rejectMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => deleteMutation.mutate(comment.id)}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {comment.body}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {commentsData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
                  Page {currentPage + 1} of {commentsData.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(commentsData.totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= commentsData.totalPages - 1}
                  className="px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CommentModeration;