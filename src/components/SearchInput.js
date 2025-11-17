import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import useSearch from '../hooks/useSearch';
import SearchDropdown from './SearchDropdown';

const SearchInput = ({ className = '', placeholder = "Search posts, tags, authors..." }) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const {
    query,
    setQuery,
    results,
    isLoading,
    isOpen,
    setIsOpen,
    clearSearch,
    hasResults
  } = useSearch();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      
      // Escape to close search
      if (e.key === 'Escape') {
        if (isOpen) {
          setIsOpen(false);
          inputRef.current?.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="
            block w-full pl-10 pr-10 py-2 border border-light-border dark:border-dark-border
            rounded-lg bg-light-input dark:bg-dark-input
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
            focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
            transition-colors duration-200
          "
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {!query && (
            <div className="mr-3 hidden sm:flex items-center space-x-1 text-xs text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">⌘</kbd>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">K</kbd>
            </div>
          )}
        </div>
      </div>

      <SearchDropdown
        isOpen={isOpen}
        results={results}
        isLoading={isLoading}
        query={query}
        onClose={() => setIsOpen(false)}
        hasResults={hasResults}
      />
    </div>
  );
};

export default SearchInput;