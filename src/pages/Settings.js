import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Search, 
  Palette, 
  Users, 
  Shield,
  ArrowLeft,
  Globe,
  Eye
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const Settings = () => {
  const navigate = useNavigate();






  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your blog configuration and preferences
              </p>
            </div>
          </div>
        </div>

        {/* SEO Settings Card */}
        <div className="max-w-2xl">
          <motion.button
            onClick={() => navigate('/seo')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left p-6 rounded-xl border bg-light-surface1 dark:bg-dark-surface1 border-accent-primary/30 hover:border-accent-primary/50 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-lg bg-accent-primary/10">
                <Search className="w-6 h-6 text-accent-primary" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  SEO & Visibility Settings
                  <span className="ml-2 px-2 py-1 text-xs bg-accent-primary text-white rounded-full">
                    Important
                  </span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Control how your blog appears on search engines and social media
                </p>
              </div>
            </div>
          </motion.button>
        </div>





        {/* SEO Configuration Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-xl p-6 border border-accent-primary/20"
        >
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-accent-primary/20 rounded-lg">
              <Globe className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                SEO Best Practices
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Proper SEO configuration is essential for search engine visibility and social media sharing. 
                Configure your meta tags, Open Graph settings, and structured data to maximize your reach.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">✓ Meta Title & Description</div>
                  <div className="text-gray-600 dark:text-gray-400">Optimize for search results</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">✓ Social Media Cards</div>
                  <div className="text-gray-600 dark:text-gray-400">Facebook & Twitter previews</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">✓ Structured Data</div>
                  <div className="text-gray-600 dark:text-gray-400">Rich snippets & schema</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">✓ Indexing Control</div>
                  <div className="text-gray-600 dark:text-gray-400">Search engine visibility</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default Settings;