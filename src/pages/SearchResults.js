import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Tag, 
  User, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import api from '../services/api';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['search-full', query],
    queryFn: async () => {
      if (!query.trim()) return null;
      const response = await api.get(`/search?q=${encodeURIComponent(query)}&limit=20`);
      return response.data;
    },
    enabled: !!query.trim(),
  });

  const tabs = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'authors', label: 'Authors', icon: User },
  ];

  const getFilteredResults = () => {
    if (!results) return { posts: [], tags: [], authors: [] };
    
    switch (activeTab) {
      case 'posts':
        return { posts: results.posts || [], tags: [], authors: [] };
      case 'tags':
        return { posts: [], tags: results.tags || [], authors: [] };
      case 'authors':
        return { posts: [], tags: [], authors: results.authors || [] };
      default:
        return results;
    }
  };

  const filteredResults = getFilteredResults();
  const hasResults = filteredResults.posts?.length > 0 || 
                    filteredResults.tags?.length > 0 || 
                    filteredResults.authors?.length > 0;

  const handleResultClick = (type, item) => {
    switch (type) {
      case 'post':
        navigate(`/posts/${item.id}`);
        break;
      case 'tag':
        navigate(`/posts?tag=${encodeURIComponent(item.name)}`);
        break;
      case 'author':
        navigate(`/posts?author=${encodeURIComponent(item.name)}`);
        break;
      default:
        break;
    }
  };

  if (!query.trim()) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search term to find posts, tags, and authors
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-accent-primary hover:text-accent-primary/80 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Search Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Results for "{query}"
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-light-border dark:border-dark-border mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'all' 
              ? (results?.posts?.length || 0) + (results?.tags?.length || 0) + (results?.authors?.length || 0)
              : results?.[tab.id]?.length || 0;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-accent-primary text-accent-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary mr-3" />
          <span className="text-gray-600 dark:text-gray-400">Searching...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            Error searching: {error.message}
          </p>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && !hasResults && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No results found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We couldn't find anything matching "{query}"
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            <p>Try:</p>
            <ul className="mt-2 space-y-1">
              <li>• Different keywords</li>
              <li>• More general terms</li>
              <li>• Checking your spelling</li>
            </ul>
          </div>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && hasResults && (
        <div className="space-y-6">
          {/* Posts */}
          {filteredResults.posts?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {activeTab === 'all' && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-accent-primary" />
                  Posts ({filteredResults.posts.length})
                </h2>
              )}
              
              {filteredResults.posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => handleResultClick('post', post)}
                  className="bg-light-surface1 dark:bg-dark-surface1 rounded-lg p-6 border border-light-border dark:border-dark-border hover:border-accent-primary/50 transition-colors cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                      {post.author && (
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {post.author}
                        </span>
                      )}
                    </div>
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs bg-accent-primary/10 text-accent-primary rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Tags */}
          {filteredResults.tags?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {activeTab === 'all' && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-accent-secondary" />
                  Tags ({filteredResults.tags.length})
                </h2>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.tags.map((tag) => (
                  <div
                    key={tag.name}
                    onClick={() => handleResultClick('tag', tag)}
                    className="bg-light-surface1 dark:bg-dark-surface1 rounded-lg p-4 border border-light-border dark:border-dark-border hover:border-accent-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <Tag className="w-5 h-5 text-accent-secondary" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          #{tag.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {tag.postCount} post{tag.postCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Authors */}
          {filteredResults.authors?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {activeTab === 'all' && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="w-5 h-5 mr-2 text-accent-warning" />
                  Authors ({filteredResults.authors.length})
                </h2>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.authors.map((author) => (
                  <div
                    key={author.id}
                    onClick={() => handleResultClick('author', author)}
                    className="bg-light-surface1 dark:bg-dark-surface1 rounded-lg p-4 border border-light-border dark:border-dark-border hover:border-accent-warning/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-accent-warning" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {author.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {author.postCount} post{author.postCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;