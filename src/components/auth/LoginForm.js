import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

const LoginForm = ({ onSwitchToRegister, onSwitchToForgot }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      // Navigation will be handled by the auth context
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    loginMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-accent-error/10 border border-accent-error/20 text-accent-error text-sm"
        >
          {errors.general}
        </motion.div>
      )}

      <Input
        label="Email address"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        icon={Mail}
        placeholder="Enter your email"
        autoComplete="email"
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          icon={Lock}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="h-4 w-4 text-accent-primary focus:ring-accent-primary border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Remember me
          </span>
        </label>

        <button
          type="button"
          onClick={onSwitchToForgot}
          className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={loginMutation.isPending}
      >
        Sign in
      </Button>

      <div className="text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
        </span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium"
        >
          Sign up
        </button>
      </div>
    </motion.form>
  );
};

export default LoginForm;