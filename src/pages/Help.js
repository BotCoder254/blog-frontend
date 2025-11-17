import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  FileText,
  Settings,
  Eye,
  Globe,
  Loader2,
  Users
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch help data from backend with fallback
  const { data: helpData, isLoading } = useQuery({
    queryKey: ['seoHelp'],
    queryFn: async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/public/help/seo`);
        if (!response.ok) throw new Error('Help API not available');
        const data = await response.json();
        return data;
      } catch (error) {
        console.warn('Help API not available, using fallback data');
        return {
          categories: [
            {
              id: 'seo-basics',
              title: 'SEO Fundamentals',
              icon: 'Search',
              color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
              articles: [
                { title: 'Meta Title Optimization', description: 'Write compelling titles under 60 characters' },
                { title: 'Meta Description Best Practices', description: 'Create engaging descriptions that drive clicks' },
                { title: 'Keyword Research & Strategy', description: 'Find and target the right keywords' },
                { title: 'Search Engine Indexing', description: 'Control how search engines crawl your site' }
              ]
            },
            {
              id: 'social-media',
              title: 'Social Media Optimization',
              icon: 'Globe',
              color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
              articles: [
                { title: 'Open Graph Setup', description: 'Optimize Facebook and LinkedIn sharing' },
                { title: 'Twitter Cards Configuration', description: 'Create rich Twitter previews' },
                { title: 'Social Media Images', description: 'Optimal image sizes and formats' },
                { title: 'Social Sharing Best Practices', description: 'Maximize engagement and reach' }
              ]
            },
            {
              id: 'technical-seo',
              title: 'Technical SEO',
              icon: 'Settings',
              color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
              articles: [
                { title: 'Structured Data & Schema', description: 'Rich snippets and search features' },
                { title: 'Canonical URLs', description: 'Prevent duplicate content issues' },
                { title: 'XML Sitemaps', description: 'Help search engines discover content' },
                { title: 'Page Speed Optimization', description: 'Improve loading times for better rankings' }
              ]
            }
          ]
        };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false
  });

  const seoCategories = helpData?.categories || [];
  
  const iconMap = {
    Search: Search,
    Globe: Globe,
    Settings: Settings
  };

  const quickActions = [
    {
      title: 'Configure SEO Settings',
      description: 'Optimize your blog for search engines',
      icon: Search,
      action: () => navigate('/seo'),
      color: 'bg-blue-500'
    },
    {
      title: 'Create New Post',
      description: 'Start writing your next article',
      icon: FileText,
      action: () => navigate('/posts/create'),
      color: 'bg-green-500'
    },
    {
      title: 'View Public Blog',
      description: 'See how your blog looks to visitors',
      icon: Eye,
      action: () => window.open('/blog/your-blog', '_blank'),
      color: 'bg-purple-500'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: Mail,
      action: () => window.open('mailto:support@sprilliblo.com'),
      color: 'bg-orange-500'
    }
  ];

  const filteredCategories = seoCategories.filter(category =>
    searchQuery === '' || 
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SEO Help Center</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Master SEO and boost your blog's visibility
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search SEO guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary transition-colors"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                onClick={action.action}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-left p-4 bg-light-surface1 dark:bg-dark-surface1 rounded-xl border border-light-border dark:border-dark-border hover:shadow-md transition-all"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 ${action.color} text-white rounded-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
          </div>
        ) : (
          <>
            {/* SEO Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category, index) => {
                const Icon = iconMap[category.icon] || Search;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {category.title}
                      </h2>
                    </div>
                    
                    <div className="space-y-3">
                      {category.articles.map((article, articleIndex) => (
                        <button
                          key={articleIndex}
                          className="w-full text-left p-3 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-accent-primary transition-colors">
                                {article.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {article.description}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-accent-primary transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-xl p-6 border border-accent-primary/20"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-accent-primary/20 rounded-lg">
              <MessageCircle className="w-6 h-6 text-accent-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Still Need Help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Can't find what you're looking for? Our support team is here to help you succeed with your blog.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.open('mailto:support@sprilliblo.com')}
                  className="inline-flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors font-medium"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </button>
                <button
                  onClick={() => window.open('https://docs.sprilliblo.com', '_blank')}
                  className="inline-flex items-center px-4 py-2 bg-light-surface1 dark:bg-dark-surface1 text-gray-700 dark:text-gray-300 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors font-medium"
                >
                  <Book className="w-4 h-4 mr-2" />
                  Documentation
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
                <button
                  onClick={() => window.open('https://community.sprilliblo.com', '_blank')}
                  className="inline-flex items-center px-4 py-2 bg-light-surface1 dark:bg-dark-surface1 text-gray-700 dark:text-gray-300 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors font-medium"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Community
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default Help;