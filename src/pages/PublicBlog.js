import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
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
  Bookmark,
  Play,
  Pause
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
  const [tenantData, setTenantData] = useState(null);
  const [seoSettings, setSeoSettings] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, [tenantSlug, currentPage, searchQuery, selectedTag]);
  
  // Auto-play slider
  useEffect(() => {
    if (isAutoPlaying && trendingPosts.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.min(trendingPosts.length, 5));
      }, 4000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, trendingPosts.length]);
  
  // Real-time view count updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time view updates
      setPosts(prevPosts => 
        prevPosts.map(post => ({
          ...post,
          views: (post.views || 0) + Math.floor(Math.random() * 3)
        }))
      );
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

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
      
      // Fetch tenant data and SEO settings
      const [tenantInfo] = await Promise.all([
        publicApi.getTenant(tenantSlug)
      ]);
      
      setTenantData(tenantInfo);
      setSeoSettings(tenantInfo?.settings?.seo || {});
      
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
      setTenantData(null);
      setSeoSettings(null);
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
  
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % Math.min(trendingPosts.length, 5));
  };
  
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + Math.min(trendingPosts.length, 5)) % Math.min(trendingPosts.length, 5));
  };
  
  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
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
        <title>{seoSettings?.metaTitle || (tenantData?.name ? `${tenantData.name} - Blog` : (tenantSlug ? `${tenantSlug} - Modern Blog Magazine` : 'Sprilliblo - Modern Blog Platform'))}</title>
        <meta name="description" content={seoSettings?.metaDescription || (tenantData?.description || (tenantSlug ? `Discover the latest stories, insights, and expertise from ${tenantSlug}. A modern magazine-style blog with trending articles and expert content.` : 'Discover amazing stories and insights on Sprilliblo, a modern blog platform.'))} />
        {seoSettings?.metaKeywords && <meta name="keywords" content={seoSettings.metaKeywords} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={seoSettings?.ogTitle || seoSettings?.metaTitle || (tenantData?.name ? `${tenantData.name} - Blog` : (tenantSlug ? `${tenantSlug} - Modern Blog Magazine` : 'Sprilliblo - Modern Blog Platform'))} />
        <meta property="og:description" content={seoSettings?.ogDescription || seoSettings?.metaDescription || (tenantData?.description || (tenantSlug ? `Discover the latest stories, insights, and expertise from ${tenantSlug}` : 'Discover amazing stories and insights on Sprilliblo'))} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={seoSettings?.ogImage || featuredPost?.featuredImage || '/logo512.png'} />
        {tenantSlug && <meta property="og:url" content={`https://${tenantSlug}.sprilliblo.com`} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content={seoSettings?.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={seoSettings?.twitterTitle || seoSettings?.ogTitle || seoSettings?.metaTitle || (tenantData?.name ? `${tenantData.name} - Blog` : (tenantSlug ? `${tenantSlug} - Modern Blog Magazine` : 'Sprilliblo - Modern Blog Platform'))} />
        <meta name="twitter:description" content={seoSettings?.twitterDescription || seoSettings?.ogDescription || seoSettings?.metaDescription || (tenantData?.description || (tenantSlug ? `Discover the latest stories, insights, and expertise from ${tenantSlug}` : 'Discover amazing stories and insights on Sprilliblo'))} />
        <meta name="twitter:image" content={seoSettings?.twitterImage || seoSettings?.ogImage || featuredPost?.featuredImage || '/logo512.png'} />
        
        {/* SEO */}
        {seoSettings?.indexable === false && <meta name="robots" content="noindex" />}
        {seoSettings?.followLinks === false && <meta name="robots" content="nofollow" />}
        {seoSettings?.canonicalUrl && <link rel="canonical" href={seoSettings.canonicalUrl} />}
        {!seoSettings?.canonicalUrl && tenantSlug && <link rel="canonical" href={`https://${tenantSlug}.sprilliblo.com`} />}
        
        {/* Structured Data */}
        {seoSettings?.structuredData && (
          <script type="application/ld+json">
            {seoSettings.structuredData}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <PublicHeader tenantSlug={tenantSlug} />
        
        {/* Modern Hero Slider */}
        {trendingPosts.length > 0 && (
          <section className="relative bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 border-b border-light-border dark:border-dark-border overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
              <div className="relative">
                {/* Slider Container */}
                <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden" ref={sliderRef}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 300 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -300 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      {trendingPosts[currentSlide] && (
                        <div className="relative h-full">
                          {/* Background Image with Fallback */}
                          <div className="absolute inset-0">
                            {trendingPosts[currentSlide].featuredImage ? (
                              <img
                                src={trendingPosts[currentSlide].featuredImage}
                                alt={trendingPosts[currentSlide].title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : null}
                            {/* Default Background */}
                            <div 
                              className={`w-full h-full bg-gradient-to-br from-accent-primary via-accent-secondary to-purple-600 ${trendingPosts[currentSlide].featuredImage ? 'hidden' : 'block'}`}
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '30px 30px'
                              }}
                            ></div>
                            {/* Enhanced Overlay for Better Text Visibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
                            <div className="absolute inset-0 bg-black/30"></div>
                          </div>
                          
                          {/* Content Overlay with Enhanced Visibility */}
                          <div className="relative h-full flex items-end p-6 sm:p-8 lg:p-12">
                            <div className="max-w-2xl">
                              {/* Badge with Background */}
                              <div className="flex items-center space-x-2 mb-4">
                                <div className="flex items-center space-x-2 bg-accent-primary/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                  <TrendingUp className="w-4 h-4 text-white" />
                                  <span className="text-sm font-medium text-white uppercase tracking-wide">
                                    Trending #{currentSlide + 1}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Title with Text Shadow */}
                              <Link to={`/blog/${tenantSlug}/posts/${trendingPosts[currentSlide].slug}`}>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white hover:text-accent-primary transition-colors mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                                  {trendingPosts[currentSlide].title}
                                </h1>
                              </Link>
                              
                              {/* Excerpt with Background */}
                              {trendingPosts[currentSlide].excerpt && (
                                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 mb-6">
                                  <p className="text-white text-base sm:text-lg leading-relaxed line-clamp-2">
                                    {trendingPosts[currentSlide].excerpt}
                                  </p>
                                </div>
                              )}
                              
                              {/* Meta Info with Background */}
                              <div className="flex flex-wrap items-center gap-3 mb-6">
                                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                                  <User className="w-4 h-4" />
                                  <span>{typeof trendingPosts[currentSlide].author === 'string' ? trendingPosts[currentSlide].author : `${trendingPosts[currentSlide].author?.firstName || ''} ${trendingPosts[currentSlide].author?.lastName || ''}`.trim() || 'Anonymous'}</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                                  <Eye className="w-4 h-4" />
                                  <span>{(trendingPosts[currentSlide].views || 0).toLocaleString()} views</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                                  <Clock className="w-4 h-4" />
                                  <span>{calculateReadTime(trendingPosts[currentSlide].content)} min read</span>
                                </div>
                              </div>
                              
                              {/* CTA Button */}
                              <Link
                                to={`/blog/${tenantSlug}/posts/${trendingPosts[currentSlide].slug}`}
                                className="inline-flex items-center px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                              >
                                Read Article
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Slider Controls */}
                <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
                  <button
                    onClick={prevSlide}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors pointer-events-auto"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors pointer-events-auto"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                {/* Slider Indicators */}
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2">
                  {trendingPosts.slice(0, 5).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                        index === currentSlide ? 'bg-accent-primary' : 'bg-white/50'
                      }`}
                    />
                  ))}
                  
                  {/* Auto-play toggle */}
                  <button
                    onClick={toggleAutoPlay}
                    className="ml-4 w-8 h-8 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Mobile-Responsive Search Bar */}
        <section className="bg-light-surface1 dark:bg-dark-surface1 border-b border-light-border dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles, topics, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-colors text-sm sm:text-base"
                />
              </div>
              <button
                type="submit"
                className="px-4 sm:px-6 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
              >
                Search
              </button>
            </form>
            
            {(searchQuery || selectedTag) && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm">
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

        {/* Mobile-Responsive Content Grid */}
        <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Content - Latest Posts */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Latest Articles</h2>
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
                            <span className="font-medium">{(post.views || 0).toLocaleString()} views</span>
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