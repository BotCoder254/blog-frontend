import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Tag, 
  User, 
  Search,
  Loader2
} from 'lucide-react';

const SearchDropdown = ({ 
  isOpen, 
  results, 
  isLoading, 
  query, 
  onClose, 
  hasResults 
}) => {
  const navigate = useNavigate();

  const handleResultClick = (type, item) => {
    onClose();
    
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

  const handleViewAllResults = () => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute top-full left-0 right-0 mt-2 bg-light-surface1 dark:bg-dark-surface1 border border-light-border dark:border-dark-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
      >
        {isLoading && (
          <div className="p-4 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-accent-primary mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Searching...</span>
          </div>
        )}

        {!isLoading && !hasResults && query.trim() && (
          <div className="p-4 text-center">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              No results found for "{query}"
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Try different keywords or check your spelling
            </p>
          </div>
        )}

        {!isLoading && hasResults && (
          <div className="py-2">
            {/* Posts */}
            {results.posts?.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-light-border dark:border-dark-border">
                  Posts
                </div>
                {results.posts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => handleResultClick('post', post)}
                    className="w-full px-4 py-3 text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors flex items-start space-x-3"
                  >
                    <FileText className="w-4 h-4 text-accent-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {post.title}
                      </p>
                      {post.excerpt && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {post.excerpt}
                        </p>
                      )}
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-0.5 text-xs bg-accent-primary/10 text-accent-primary rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Tags */}
            {results.tags?.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-light-border dark:border-dark-border">
                  Tags
                </div>
                {results.tags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleResultClick('tag', tag)}
                    className="w-full px-4 py-3 text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors flex items-center space-x-3"
                  >
                    <Tag className="w-4 h-4 text-accent-secondary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        #{tag.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {tag.postCount} post{tag.postCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Authors */}
            {results.authors?.length > 0 && (
              <div className="mb-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-light-border dark:border-dark-border">
                  Authors
                </div>
                {results.authors.map((author) => (
                  <button
                    key={author.id}
                    onClick={() => handleResultClick('author', author)}
                    className="w-full px-4 py-3 text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors flex items-center space-x-3"
                  >
                    <User className="w-4 h-4 text-accent-warning flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {author.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {author.postCount} post{author.postCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* View All Results */}
            {results.hasMore && (
              <div className="border-t border-light-border dark:border-dark-border">
                <button
                  onClick={handleViewAllResults}
                  className="w-full px-4 py-3 text-sm text-accent-primary hover:bg-light-hover dark:hover:bg-dark-hover transition-colors text-center"
                >
                  View all results for "{query}"
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchDropdown;