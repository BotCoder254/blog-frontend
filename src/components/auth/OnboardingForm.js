import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ProgressIndicator from '../ui/ProgressIndicator';

const OnboardingForm = () => {
  const [formData, setFormData] = useState({
    blogName: '',
    blogSlug: '',
  });
  const [errors, setErrors] = useState({});
  const [slugCheckDebounce, setSlugCheckDebounce] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  const { user } = useAuth();

  // Debounced slug availability check
  const { data: slugCheck, isLoading: isCheckingSlug } = useQuery({
    queryKey: ['slug-check', slugCheckDebounce],
    queryFn: () => apiService.checkSlugAvailability(slugCheckDebounce),
    enabled: !!slugCheckDebounce && slugCheckDebounce.length >= 3,
    staleTime: 30000,
  });

  const { createTenant } = useAuth();

  const createTenantMutation = useMutation({
    mutationFn: createTenant,
    onSuccess: () => {
      setIsComplete(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.blogSlug && formData.blogSlug.length >= 3) {
        setSlugCheckDebounce(formData.blogSlug);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.blogSlug]);

  const validateSlugFormat = (slug) => {
    if (!slug) return false;
    return /^[a-z0-9-]+$/.test(slug) && 
           !slug.startsWith('-') && 
           !slug.endsWith('-') &&
           !slug.includes('--') &&
           slug.length >= 3 &&
           slug.length <= 50;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'blogSlug') {
      processedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Auto-generate slug from blog name
    if (name === 'blogName' && !formData.blogSlug) {
      const autoSlug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      
      setFormData(prev => ({
        ...prev,
        blogSlug: autoSlug
      }));
    }

    // Clear errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.blogName.trim()) newErrors.blogName = 'Blog name is required';
    if (!formData.blogSlug.trim()) newErrors.blogSlug = 'Blog slug is required';
    if (!validateSlugFormat(formData.blogSlug)) {
      newErrors.blogSlug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    if (slugCheck && !slugCheck.available) {
      newErrors.blogSlug = 'This slug is already taken';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createTenantMutation.mutate(formData);
  };

  const getSlugStatus = () => {
    if (!formData.blogSlug || formData.blogSlug.length < 3) return null;
    if (!validateSlugFormat(formData.blogSlug)) return 'invalid';
    if (isCheckingSlug) return 'checking';
    if (slugCheck) return slugCheck.available ? 'available' : 'taken';
    return null;
  };

  const renderSlugStatus = () => {
    const status = getSlugStatus();
    
    switch (status) {
      case 'checking':
        return (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Checking availability...
          </div>
        );
      case 'available':
        return (
          <div className="flex items-center text-sm text-accent-success mt-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Available!
          </div>
        );
      case 'taken':
        return (
          <div className="space-y-2 mt-1">
            <div className="flex items-center text-sm text-accent-error">
              <XCircle className="h-4 w-4 mr-2" />
              Already taken
            </div>
            {slugCheck?.suggestions?.length > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Try: {slugCheck.suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, blogSlug: suggestion }))}
                    className="text-accent-primary hover:text-accent-primary/80 underline mr-2"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case 'invalid':
        return (
          <div className="flex items-center text-sm text-accent-error mt-1">
            <XCircle className="h-4 w-4 mr-2" />
            Invalid format
          </div>
        );
      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto w-20 h-20 bg-accent-success/10 rounded-full flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-accent-success" />
        </motion.div>
        
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to SPRILLIBLO!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your blog <strong>{formData.blogName}</strong> is ready. Redirecting to your dashboard...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <ProgressIndicator currentStep={1} totalSteps={1} />

      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-accent-error/10 border border-accent-error/20 text-accent-error text-sm"
        >
          {errors.general}
        </motion.div>
      )}

      <div className="space-y-4">
        <Input
          label="Blog name"
          type="text"
          name="blogName"
          value={formData.blogName}
          onChange={handleChange}
          error={errors.blogName}
          icon={Globe}
          placeholder="My Awesome Blog"
        />

        <div>
          <Input
            label="Blog URL slug"
            type="text"
            name="blogSlug"
            value={formData.blogSlug}
            onChange={handleChange}
            error={errors.blogSlug}
            icon={Globe}
            placeholder="my-awesome-blog"
          />
          
          {renderSlugStatus()}
          
          {formData.blogSlug && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Your blog will be available at: <strong>sprilliblo.com/{formData.blogSlug}</strong>
            </p>
          )}
        </div>
      </div>

      <div className="bg-light-surface1 dark:bg-dark-surface1 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Welcome, {user?.firstName}!
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You're just one step away from creating your blog. Choose a unique name and URL for your blog.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={createTenantMutation.isPending}
        disabled={!formData.blogName || !formData.blogSlug || getSlugStatus() !== 'available'}
      >
        Create My Blog
      </Button>
    </motion.form>
  );
};

export default OnboardingForm;