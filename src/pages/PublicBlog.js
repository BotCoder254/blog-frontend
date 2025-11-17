import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Clock, 
  Tag, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Star,
  Eye,
  User,
  Filter,
  MessageCircle,
  Heart,
  Share2,
  Bookmark
} from 'lucide-react';
import PublicHeader from '../components/PublicHeader';

const PublicBlog = () => {
  const { tenantSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');

  useEffect(() => {
    fetchAllData();
  }, [tenantSlug, currentPage, searchQuery, selectedTag]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const { default: publicApi } = await import('../services/publicApi');
      
      // If no tenantSlug, show a default landing page with sample data
      if (!tenantSlug) {
        // Set some default data for the landing page
        setPosts([]);
        setTotalPages(0);
        setFeaturedPost(null);
        setTrendingPosts([]);
        setRecentPosts([]);
        setPopularTags([]);
        return;
      }
      
      // Fetch main posts
      const params = { page: currentPage, size: 12 };
      if (searchQuery) params.q = searchQuery;
      if (selectedTag) params.tag = selectedTag;
      
      const [postsData, featuredData, trendingData, recentData] = await Promise.all([
        publicApi.getPosts(tenantSlug, params),
        publicApi.getPosts(tenantSlug, { page: 0, size: 1 }),
        publicApi.getPosts(tenantSlug, { page: 0, size: 6, sort: 'views' }),
        publicApi.getPosts(tenantSlug, { page: 0, size: 8 })
      ]);


      setPosts(postsData.content || []);
      setTotalPages(postsData.totalPages || 0);
      setFeaturedPost(featuredData.content?.[0] || null);
      setTrendingPosts(trendingData.content || []);
      setRecentPosts(recentData.content || []);
      
      // Extract popular tags
      const allTags = (postsData.content || []).flatMap(post => post.tags || []);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
      setPopularTags(Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag)
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty data on error
      setPosts([]);
      setTotalPages(0);
      setFeaturedPost(null);
      setTrendingPosts([]);
      setRecentPosts([]);
      setPopularTags([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.split(' ').length || 0;
    return Math.ceil(words / wordsPerMinute) || 1;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedTag) params.set('tag', selectedTag);
    setSearchParams(params);
  };

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
    setCurrentPage(0);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    params.set('tag', tag);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTag('');
    setCurrentPage(0);
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <PublicHeader tenantSlug={tenantSlug} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{tenantSlug ? `${tenantSlug} - Modern Blog Magazine` : 'Sprilliblo - Modern Blog Platform'}</title>
        <meta name="description" content={tenantSlug ? `Discover the latest stories, insights, and expertise from ${tenantSlug}. A modern magazine-style blog with trending articles and expert content.` : 'Discover amazing stories and insights on Sprilliblo, a modern blog platform.'} />
        <meta property="og:title" content={tenantSlug ? `${tenantSlug} - Modern Blog Magazine` : 'Sprilliblo - Modern Blog Platform'} />
        <meta property="og:description" content={tenantSlug ? `Discover the latest stories, insights, and expertise from ${tenantSlug}` : 'Discover amazing stories and insights on Sprilliblo'} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={featuredPost?.featuredImage || '/logo512.png'} />
        {tenantSlug && <link rel="canonical" href={`https://${tenantSlug}.sprilliblo.com`} />}
      </Helmet>

      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <PublicHeader tenantSlug={tenantSlug} />
        
        {/* Hero Section - Featured Story */}
        {featuredPost && (
          <section className="relative bg-light-surface1 dark:bg-dark-surface1 border-b border-light-border dark:border-dark-border">
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-accent-primary" />
                    <span className="text-sm font-medium text-accent-primary uppercase tracking-wide">
                      Featured Story
                    </span>
                  </div>
                  
                  <Link to={`/blog/${tenantSlug}/posts/${featuredPost.slug}`}>
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight hover:text-accent-primary transition-colors">
                      {featuredPost.title}
                    </h1>
                  </Link>
                  
                  {featuredPost.excerpt && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{typeof featuredPost.author === 'string' ? featuredPost.author : `${featuredPost.author?.firstName || ''} ${featuredPost.author?.lastName || ''}`.trim() || 'Anonymous'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featuredPost.publishedAt)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{calculateReadTime(featuredPost.content)} min read</span>
                    </span>
                  </div>
                  
                  <Link
                    to={`/blog/${tenantSlug}/posts/${featuredPost.slug}`}
                    className="inline-flex items-center px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium"
                  >
                    Read Full Story
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </motion.div>
                
                {featuredPost.featuredImage && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    <img
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      className="w-full h-80 lg:h-96 object-cover rounded-xl shadow-lg"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Search Bar */}
        <section className="bg-light-surface1 dark:bg-dark-surface1 border-b border-light-border dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <form onSubmit={handleSearch} className="flex gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, topics, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium"
              >
                Search
              </button>
            </form>
            
            {(searchQuery || selectedTag) && (
              <div className="flex items-center justify-center gap-2 mt-4 text-sm">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Active filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full">
                    "{searchQuery}"
                  </span>
                )}
                {selectedTag && (
                  <span className="px-3 py-1 bg-accent-secondary/10 text-accent-secondary rounded-full">
                    #{selectedTag}
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-accent-primary hover:underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Multi-Column Content Grid */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content - Latest Posts */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Articles</h2>
                <div className="h-px bg-gradient-to-r from-accent-primary to-transparent flex-1 ml-4"></div>
              </div>
              
              <div className="space-y-8">
                {posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl overflow-hidden border border-light-border dark:border-dark-border hover:shadow-xl transition-all duration-300 group"
                  >
                    {/* Featured Image */}
                    {post.featuredImage && (
                      <div className="aspect-video w-full overflow-hidden">
                        <Link to={`/blog/${tenantSlug}/posts/${post.slug}`}>
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Categories/Tags */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories.slice(0, 2).map((category) => (
                            <span
                              key={category}
                              className="px-3 py-1 text-xs font-medium bg-accent-secondary/10 text-accent-secondary rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Title */}
                      <Link to={`/blog/${tenantSlug}/posts/${post.slug}`} className="block group">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-accent-primary transition-colors leading-tight">
                          {post.title}
                        </h3>
                      </Link>
                      
                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-base leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Author Info */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-accent-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {(() => {
                            const authorName = typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous';
                            return authorName.split(' ').map(n => n[0]).join('').slice(0, 2);
                          })()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(post.publishedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4 py-3 border-t border-light-border dark:border-dark-border">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{calculateReadTime(post.content)} min read</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views || 0} views</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.commentsCount || 0} comments</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors">
                            <Heart className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors">
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 4).map((tag) => (
                            <button
                              key={tag}
                              onClick={() => handleTagClick(tag)}
                              className="px-3 py-1 text-xs bg-accent-primary/10 text-accent-primary rounded-full hover:bg-accent-primary/20 transition-colors font-medium"
                            >
                              #{tag}
                            </button>
                          ))}
                          {post.tags.length > 4 && (
                            <span className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                              +{post.tags.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-light-surface1 dark:bg-dark-surface1 border border-light-border dark:border-dark-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {currentPage + 1} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm bg-light-surface1 dark:bg-dark-surface1 border border-light-border dark:border-dark-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Trending Posts */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-accent-secondary" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trending</h3>
              </div>
              
              <div className="space-y-4">
                {trendingPosts.slice(0, 5).map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/blog/${tenantSlug}/posts/${post.slug}`}
                    className="block p-4 bg-light-surface1 dark:bg-dark-surface1 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-all"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl font-bold text-accent-secondary">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                          {post.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous'}</span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.views || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar - Tags & Recent */}
            <div className="space-y-8">
              {/* Popular Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-2 text-sm rounded-full transition-colors ${
                        selectedTag === tag
                          ? 'bg-accent-primary text-white'
                          : 'bg-light-surface1 dark:bg-dark-surface1 text-gray-700 dark:text-gray-300 border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Posts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Posts</h3>
                <div className="space-y-3">
                  {recentPosts.slice(0, 6).map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${tenantSlug}/posts/${post.slug}`}
                      className="block p-3 bg-light-surface1 dark:bg-dark-surface1 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-all"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(post.publishedAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PublicBlog;