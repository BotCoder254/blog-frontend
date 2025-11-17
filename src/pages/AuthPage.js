import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const AuthPage = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'register', 'forgot'
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const getTitle = () => {
    switch (currentView) {
      case 'register':
        return 'Create your account';
      case 'forgot':
        return 'Reset your password';
      default:
        return 'Welcome back';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'register':
        return 'Start your blogging journey today';
      case 'forgot':
        return 'We\'ll help you get back in';
      default:
        return 'Sign in to your account';
    }
  };

  const renderForm = () => {
    switch (currentView) {
      case 'register':
        return (
          <RegisterForm 
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordForm 
            onSwitchToLogin={() => setCurrentView('login')}
          />
        );
      default:
        return (
          <LoginForm 
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgot={() => setCurrentView('forgot')}
          />
        );
    }
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      {renderForm()}
    </AuthLayout>
  );
};

export default AuthPage;