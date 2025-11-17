import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { Folder, Search, Grid } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';

const CategoriesPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const availableCategories = [
    'Technology', 'Business', 'Design', 'Marketing', 'Lifestyle',
    'Travel', 'Food', 'Health', 'Education', 'Entertainment'
  ];

  const { data: posts } = useQuery({
    queryKey: ['posts', user?.currentTenantId],
    queryFn: async () => {
      const response = await fetch(`/api/tenants/${user.currentTenantId}/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    },
    enabled: !!user?.currentTenantId
  });

  // Count posts per category
  const categoryCounts = availableCategories.reduce((acc, category) => {
    const count = posts?.content?.filter(post => 
      post.categories?.includes(category)
    ).length || 0;
    acc[category] = count;
    return acc;
  }, {});

  const filteredCategories = availableCategories.filter(category =>
    !searchQuery || category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Folder className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Organize your content by categories
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Categories Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Grid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No categories found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((category) => (
                <Link
                  key={category}
                  to={`/posts?category=${encodeURIComponent(category)}`}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600 border border-transparent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-600 px-2 py-1 rounded-full">
                    {categoryCounts[category]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;