import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Save, 
  Eye, 
  Send, 
  ArrowLeft, 
  Image, 
  Tag, 
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import RichTextEditor from '../components/ui/RichTextEditor';
import TagInput from '../components/TagInput';
import CategorySelect from '../components/CategorySelect';
import MediaModal from '../components/MediaModal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import apiService from '../services/api';

const PostEditor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { currentTenant } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    bodyHtml: '',
    bodyMarkdown: '',
    tags: [],
    categories: [],
    coverImageUrl: '',
    status: 'DRAFT'
  });
  
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving', 'saved', 'error'

  const isEditing = !!postId;

  // Load existing post
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', currentTenant?.id, postId],
    queryFn: () => apiService.getPost(currentTenant.id, postId),
    enabled: isEditing && !!currentTenant?.id,
    onSuccess: (data) => {
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        bodyHtml: data.bodyHtml || '',
        bodyMarkdown: data.bodyMarkdown || '',
        tags: data.tags || [],
        categories: data.categories || [],
        coverImageUrl: data.coverImageUrl || '',
        status: data.status || 'DRAFT'
      });
    }
  });

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) {
        return apiService.updatePost(currentTenant.id, postId, data);
      } else {
        return apiService.createPost(currentTenant.id, data);
      }
    },
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: (data) => {
      setSaveStatus('saved');
      setLastSaved(new Date());
      if (!isEditing) {
        // Redirect to edit mode after first save
        navigate(`/posts/edit/${data.id}`, { replace: true });
      }
    },
    onError: () => {
      setSaveStatus('error');
    }
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: (data) => {
      const publishData = { ...data, status: 'PUBLISHED' };
      if (isEditing) {
        return apiService.updatePost(currentTenant.id, postId, publishData);
      } else {
        return apiService.createPost(currentTenant.id, publishData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      navigate('/posts');
    }
  });

  // Auto-save effect
  useEffect(() => {
    if (!formData.title) return;

    const timer = setTimeout(() => {
      autoSaveMutation.mutate(formData);
    }, 5000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Generate slug from title
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateContent = () => {
    const contentSize = new Blob([formData.bodyHtml || '']).size;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (contentSize > maxSize) {
      alert('Content is too large. Please reduce the content size to under 5MB.');
      return false;
    }
    
    return true;
  };

  const handleSave = () => {
    if (validateContent()) {
      autoSaveMutation.mutate(formData);
    }
  };

  const handlePublish = () => {
    if (validateContent()) {
      publishMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/posts')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Posts
            </Button>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              {saveStatus === 'saving' && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary"></div>
                  <span>Saving...</span>
                </div>
              )}
              {saveStatus === 'saved' && lastSaved && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-accent-success" />
                  <span>Saved {Math.floor((new Date() - lastSaved) / 1000)}s ago</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-accent-error" />
                  <span>Save failed</span>
                </div>
              )}
              
              {/* Content Size Indicator */}
              {formData.bodyHtml && (
                <div className="flex items-center space-x-1">
                  <span>Size:</span>
                  <span className={`font-medium ${
                    new Blob([formData.bodyHtml]).size > 4 * 1024 * 1024 
                      ? 'text-accent-warning' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {(new Blob([formData.bodyHtml]).size / 1024).toFixed(1)}KB
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSave}
              loading={autoSaveMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            
            <Button
              onClick={handlePublish}
              loading={publishMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 px-2">
          {/* Metadata Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-4 border border-light-border dark:border-dark-border">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Post Settings
              </h3>
              
              <div className="space-y-4">
                <Input
                  label="Post Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter post title..."
                />
                
                <Input
                  label="URL Slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="post-url-slug"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Brief description of your post..."
                    rows={3}
                    className="w-full px-3 py-2 border border-light-border dark:border-dark-border rounded-lg bg-light-input dark:bg-dark-input text-gray-900 dark:text-white resize-none"
                  />
                </div>
                
                <div>
                  <Input
                    label="Cover Image URL"
                    value={formData.coverImageUrl}
                    onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    icon={Image}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowImageModal(true)}
                    className="mt-2 w-full"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Choose from Media Library
                  </Button>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-4 border border-light-border dark:border-dark-border">
              <TagInput
                tags={formData.tags}
                onChange={(tags) => handleInputChange('tags', tags)}
                placeholder="Add tags..."
              />
            </div>
            
            {/* Categories */}
            <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-4 border border-light-border dark:border-dark-border">
              <CategorySelect
                categories={formData.categories}
                onChange={(categories) => handleInputChange('categories', categories)}
                multiple={true}
              />
            </div>

            {/* Status */}
            <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-4 border border-light-border dark:border-dark-border">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Status
              </h3>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="xl:col-span-4">
            <AnimatePresence mode="wait">
              {showPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-light-surface1 dark:bg-dark-surface1 rounded-xl p-8 border border-light-border dark:border-dark-border"
                >
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {formData.title || 'Untitled Post'}
                  </h1>
                  
                  {formData.excerpt && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                      {formData.excerpt}
                    </p>
                  )}
                  
                  {formData.coverImageUrl && (
                    <img
                      src={formData.coverImageUrl}
                      alt="Cover"
                      className="w-full h-64 object-cover rounded-lg mb-6"
                    />
                  )}
                  
                  <div 
                    className="prose prose-gray dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.bodyHtml }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <RichTextEditor
                    value={formData.bodyHtml}
                    onChange={(value) => handleInputChange('bodyHtml', value)}
                    placeholder="Start writing your post..."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Media Modal */}
        <MediaModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          onSelect={(media) => {
            if (Array.isArray(media)) {
              // Multiple images selected
              media.forEach(m => {
                const img = `<img src="${m.url}" alt="${m.filename}" style="max-width: 100%; height: auto;" />`;
                handleInputChange('bodyHtml', formData.bodyHtml + img);
              });
            } else {
              // Single image selected - use for cover image
              handleInputChange('coverImageUrl', media.url);
            }
          }}
          allowMultiple={false}
        />
      </div>
    </MainLayout>
  );
};

export default PostEditor;