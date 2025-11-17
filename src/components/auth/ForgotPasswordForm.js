import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import apiService from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ForgotPasswordForm = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: (email) => apiService.forgotPassword(email),
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    forgotPasswordMutation.mutate(email);
  };

  const handleResend = () => {
    forgotPasswordMutation.mutate(email);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-6"
      >
        <div className="mx-auto w-16 h-16 bg-accent-success/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-accent-success" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Check your inbox
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleResend}
            variant="outline"
            className="w-full"
            loading={forgotPasswordMutation.isPending}
          >
            Resend email
          </Button>
          
          <Button
            onClick={onSwitchToLogin}
            variant="ghost"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Button>
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
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

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
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors({});
        }}
        error={errors.email}
        icon={Mail}
        placeholder="Enter your email"
        autoComplete="email"
      />

      <div className="space-y-3">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={forgotPasswordMutation.isPending}
        >
          Send reset link
        </Button>
        
        <Button
          type="button"
          onClick={onSwitchToLogin}
          variant="ghost"
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Button>
      </div>
    </motion.form>
  );
};

export default ForgotPasswordForm;