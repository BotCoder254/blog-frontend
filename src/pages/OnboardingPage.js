import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import OnboardingForm from '../components/auth/OnboardingForm';

const OnboardingPage = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  // If user is authenticated and has tenants, redirect to dashboard
  if (isAuthenticated && user?.tenants?.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AuthLayout 
      title="Create your blog" 
      subtitle="Set up your blog and start sharing your stories with the world"
    >
      <OnboardingForm />
    </AuthLayout>
  );
};

export default OnboardingPage;