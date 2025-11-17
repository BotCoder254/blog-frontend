import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Share2, 
  ArrowLeft, 
  Twitter, 
  Facebook, 
  Linkedin,
  Eye,
  User,
  BookOpen,
  Heart,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import CommentSection from '../components/CommentSection';
import PublicHeader from '../components/PublicHeader';

const PublicPost = () => {
  const { tenantSlug, slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [tenantData, setTenantData] = useState(null);
  const [seoSettings, setSeoSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTenantData();
    fetchPost();
    fetchRelatedPosts();
  }, [tenantSlug, slug]);

  const fetchTenantData = async () => {
    try {
      const { default: publicApi } = await import('../services/publicApi');
      const tenantInfo = await publicApi.getTenant(tenantSlug);
      setTenantData(tenantInfo);
      setSeoSettings(tenantInfo?.settings?.seo || {});
    } catch (error) {
      console.error('Error fetching tenant data:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const { default: publicApi } = await import('../services/publicApi');
      const data = await publicApi.getPost(tenantSlug, slug);
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const { default: publicApi } = await import('../services/publicApi');
      const data = await publicApi.getRelatedPosts(tenantSlug, slug);
      setRelatedPosts(data);
    } catch (error) {
      console.error('Error fetching related posts:', error);
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

  const shareUrl = `https://${tenantSlug}.sprilliblo.com/posts/${slug}`;
  const shareText = post ? `Check out "${post.title}" on ${tenantSlug} blog` : '';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h1>
          <Link
            to={`/${tenantSlug}`}
            className="text-accent-primary hover:underline"
          >
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${post.title || 'Article'} - ${tenantData?.name || tenantSlug || 'Sprilliblo'}`}</title>
        <meta name="description" content={post.excerpt || `Read ${post.title || 'this article'} on ${tenantData?.name || tenantSlug || 'Sprilliblo'} blog`} />
        <meta name="author" content={typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous'} />
        {seoSettings?.metaKeywords && <meta name="keywords" content={seoSettings.metaKeywords} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={seoSettings?.ogTitle || post.title || 'Article'} />
        <meta property="og:description" content={seoSettings?.ogDescription || post.excerpt || `Read ${post.title || 'this article'} on ${tenantData?.name || tenantSlug || 'Sprilliblo'} blog`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:image" content={seoSettings?.ogImage || post.featuredImage || '/logo512.png'} />
        <meta property="article:author" content={typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous'} />
        <meta property="article:published_time" content={post.publishedAt} />
        {post.tags && post.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Twitter */}
        <meta name="twitter:card" content={seoSettings?.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={seoSettings?.twitterTitle || seoSettings?.ogTitle || post.title || 'Article'} />
        <meta name="twitter:description" content={seoSettings?.twitterDescription || seoSettings?.ogDescription || post.excerpt || 'Read this article'} />
        <meta name="twitter:image" content={seoSettings?.twitterImage || seoSettings?.ogImage || post.featuredImage || '/logo512.png'} />
        
        {/* SEO */}
        {seoSettings?.indexable === false && <meta name="robots" content="noindex" />}
        {seoSettings?.followLinks === false && <meta name="robots" content="nofollow" />}
        {seoSettings?.canonicalUrl ? (
          <link rel="canonical" href={`${seoSettings.canonicalUrl}/posts/${slug}`} />
        ) : (
          <link rel="canonical" href={shareUrl} />
        )}
        
        {/* Structured Data */}
        {seoSettings?.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify({
              ...JSON.parse(seoSettings.structuredData),
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "author": {
                "@type": "Person",
                "name": typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous'
              },
              "datePublished": post.publishedAt,
              "url": shareUrl,
              "image": post.featuredImage
            })}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <PublicHeader tenantSlug={tenantSlug} />
        
        {/* Navigation */}
        <div className="bg-light-surface1 dark:bg-dark-surface1 border-b border-light-border dark:border-dark-border">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link
              to={`/blog/${tenantSlug}`}
              className="inline-flex items-center gap-2 text-accent-primary hover:text-accent-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {tenantSlug}
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl border border-light-border dark:border-dark-border overflow-hidden"
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-8 lg:p-12">
                  {/* Article Header */}
                  <header className="mb-8">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/blog/${tenantSlug}?tag=${encodeURIComponent(tag)}`}
                            className="px-3 py-1 text-sm bg-accent-primary/10 text-accent-primary rounded-full hover:bg-accent-primary/20 transition-colors"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    )}

                    <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                      {post.title}
                    </h1>

                    {post.excerpt && (
                      <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-light-border dark:border-dark-border">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {(() => {
                            const authorName = typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous';
                            return authorName.split(' ').map(n => n[0]).join('');
                          })()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.publishedAt)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{calculateReadTime(post.content)} min read</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views || 0} views</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Share Buttons */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Share:</span>
                        <a
                          href={shareLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Share on Twitter"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                        <a
                          href={shareLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Share on Facebook"
                        >
                          <Facebook className="w-4 h-4" />
                        </a>
                        <a
                          href={shareLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Share on LinkedIn"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                        <button
                          onClick={copyToClipboard}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          title="Copy link"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </header>

                  {/* Content */}
                  <div 
                    className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-accent-primary dark:prose-a:text-accent-primary prose-strong:text-gray-900 dark:prose-strong:text-white prose-img:rounded-lg prose-img:shadow-md prose-blockquote:border-accent-primary prose-code:text-accent-primary prose-code:bg-accent-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Article Footer */}
                  <div className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>Like</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>Comment</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        <span>{calculateReadTime(post.content)} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>

              {/* Comments Section */}
              <div className="mt-8">
                <CommentSection tenantSlug={tenantSlug} postSlug={slug} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About the Author</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-accent-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {(() => {
                      const authorName = typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous';
                      return authorName.split(' ').map(n => n[0]).join('');
                    })()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {typeof post.author === 'string' ? post.author : `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() || 'Anonymous'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Content Creator & Writer</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Passionate about sharing knowledge and creating engaging content for readers.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedPosts.slice(0, 4).map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        to={`/blog/${tenantSlug}/posts/${relatedPost.slug}`}
                        className="block group"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-accent-primary transition-colors text-sm line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(relatedPost.publishedAt)}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{calculateReadTime(relatedPost.content)} min</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Table of Contents (if needed) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={copyToClipboard}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                  <Link
                    to={`/blog/${tenantSlug}`}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>More Articles</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicPost;