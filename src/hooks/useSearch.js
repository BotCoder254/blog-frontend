import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const useSearch = (initialQuery = '') => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search API call
  const { data: results, isLoading, error } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const response = await api.get(`/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
      return response.data;
    },
    enabled: !!debouncedQuery.trim(),
    staleTime: 30000, // 30 seconds
  });

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
  }, []);

  const hasResults = results && (
    results.posts?.length > 0 || 
    results.tags?.length > 0 || 
    results.authors?.length > 0
  );

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    isLoading,
    error,
    isOpen,
    setIsOpen,
    clearSearch,
    hasResults
  };
};

export default useSearch;