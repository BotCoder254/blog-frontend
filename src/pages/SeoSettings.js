import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Facebook, 
  Twitter, 
  Eye, 
  Save, 
  ArrowLeft,
  Globe,
  Image,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';

const SeoSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tenantId = user?.currentTenant?.id || user?.currentTenantId;

  const [formData, setFormData] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterCard: 'summary_large_image',
    indexable: true,
    followLinks: true,
    canonicalUrl: '',
    structuredData: ''
  });

  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Fetch SEO settings
  const { data: seoSettings, isLoading } = useQuery({
    queryKey: ['seoSettings', tenantId],
    queryFn: async () => {
      try {
        const response = await api.get(`/tenants/${tenantId}/seo`);
        return response.data || {};
      } catch (error) {
        console.warn('SEO settings not available, using defaults:', error.message);
        return {};
      }
    },
    enabled: !!tenantId,
    retry: false,
    refetchOnWindowFocus: false
  });

  // Update SEO settings mutation
  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/tenants/${tenantId}/seo`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['seoSettings', tenantId]);
    }
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: (data) => api.post(`/tenants/${tenantId}/seo/preview`, data),
    onSuccess: (response) => {
      setPreview(response.data);
    }
  });

  useEffect(() => {
    if (seoSettings) {
      setFormData(prev => ({ ...prev, ...seoSettings }));
    }
  }, [seoSettings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
    }
  };

  const handlePreview = () => {
    previewMutation.mutate(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic SEO', icon: Search },
    { id: 'social', label: 'Social Media', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Eye }
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        </div>
      </MainLayout>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SEO & Visibility</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Control how your blog appears on search engines and social media
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={previewMutation.isPending}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center
                      ${activeTab === tab.id
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Basic SEO Tab */}
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Search Engine Optimization
                  </h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Meta Title"
                      value={formData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      placeholder="Your blog's title for search engines"
                      maxLength={60}
                      helperText={`${formData.metaTitle?.length || 0}/60 characters`}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={formData.metaDescription}
                        onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                        placeholder="Brief description of your blog for search results"
                        maxLength={160}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.metaDescription?.length || 0}/160 characters
                      </p>
                    </div>
                    
                    <Input
                      label="Meta Keywords"
                      value={formData.metaKeywords}
                      onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      helperText="Comma-separated keywords (optional)"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Search Engine Visibility
                  </h4>
                  
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.indexable}
                        onChange={(e) => handleInputChange('indexable', e.target.checked)}
                        className="w-4 h-4 text-accent-primary border-gray-300 rounded focus:ring-accent-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Allow search engines to index this blog
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.followLinks}
                        onChange={(e) => handleInputChange('followLinks', e.target.checked)}
                        className="w-4 h-4 text-accent-primary border-gray-300 rounded focus:ring-accent-primary"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Allow search engines to follow links
                      </span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Facebook/Open Graph */}
                <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
                  <div className="flex items-center space-x-2 mb-4">
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Facebook & Open Graph
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="OG Title"
                      value={formData.ogTitle}
                      onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                      placeholder="Title for social media shares"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        OG Description
                      </label>
                      <textarea
                        value={formData.ogDescription}
                        onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                        placeholder="Description for social media shares"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <Input
                      label="OG Image URL"
                      value={formData.ogImage}
                      onChange={(e) => handleInputChange('ogImage', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      helperText="Recommended size: 1200x630px"
                    />
                  </div>
                </div>

                {/* Twitter */}
                <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
                  <div className="flex items-center space-x-2 mb-4">
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Twitter Cards
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Card Type
                      </label>
                      <select
                        value={formData.twitterCard}
                        onChange={(e) => handleInputChange('twitterCard', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary Large Image</option>
                      </select>
                    </div>
                    
                    <Input
                      label="Twitter Title"
                      value={formData.twitterTitle}
                      onChange={(e) => handleInputChange('twitterTitle', e.target.value)}
                      placeholder="Title for Twitter shares"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter Description
                      </label>
                      <textarea
                        value={formData.twitterDescription}
                        onChange={(e) => handleInputChange('twitterDescription', e.target.value)}
                        placeholder="Description for Twitter shares"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <Input
                      label="Twitter Image URL"
                      value={formData.twitterImage}
                      onChange={(e) => handleInputChange('twitterImage', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      helperText="Recommended size: 1200x600px"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Advanced SEO Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Canonical URL"
                      value={formData.canonicalUrl}
                      onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
                      placeholder="https://yourdomain.com"
                      helperText="Preferred URL for this content"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Structured Data (JSON-LD)
                      </label>
                      <textarea
                        value={formData.structuredData}
                        onChange={(e) => handleInputChange('structuredData', e.target.value)}
                        placeholder='{"@context": "https://schema.org", "@type": "Blog", ...}'
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Valid JSON-LD structured data for rich snippets
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Live Preview
              </h3>
              
              {preview ? (
                <div className="space-y-6">
                  {/* Google Preview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Search className="w-4 h-4 mr-2" />
                      Google Search
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                      <div className="text-blue-600 text-sm hover:underline cursor-pointer">
                        {preview.google?.title}
                      </div>
                      <div className="text-green-600 text-xs mt-1">
                        {preview.google?.url}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {preview.google?.description}
                      </div>
                    </div>
                  </div>

                  {/* Facebook Preview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                      {preview.facebook?.image && (
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {preview.facebook?.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {preview.facebook?.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {preview.facebook?.url}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Twitter Preview */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                      {preview.twitter?.image && (
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {preview.twitter?.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {preview.twitter?.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Click "Preview" to see how your blog will appear on search engines and social media
                  </p>
                </div>
              )}
            </div>

            {/* SEO Tips */}
            <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-6 border border-light-border dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                SEO Tips
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Keep meta titles under 60 characters
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Write compelling meta descriptions (150-160 chars)
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Use high-quality images (1200x630px for OG)
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Test your structured data with Google's tool
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default SeoSettings;