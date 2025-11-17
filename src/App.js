import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { RealTimeProvider } from './contexts/RealTimeContext';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import PostEditor from './pages/PostEditor';
import PublicBlog from './pages/PublicBlog';
import PublicPost from './pages/PublicPost';

import CommentModeration from './pages/CommentModeration';
import MediaLibrary from './pages/MediaLibrary';
import TagsPage from './pages/TagsPage';
import CategoriesPage from './pages/CategoriesPage';
import SearchResults from './pages/SearchResults';
import NotificationsPage from './pages/NotificationsPage';
import SeoSettings from './pages/SeoSettings';
import Settings from './pages/Settings';
import Help from './pages/Help';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <RealTimeProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <div className="App">
                <Routes>
                  {/* Public Routes - No authentication required */}
                  <Route path="/" element={<PublicBlog />} />
                  <Route path="/blog/:tenantSlug" element={<PublicBlog />} />
                  <Route path="/blog/:tenantSlug/posts/:slug" element={<PublicPost />} />
                  
                  {/* Auth Routes */}
                  <Route path="/auth" element={<AuthPage />} />
                  
                  {/* Protected Routes - Authentication required */}
                  <Route 
                    path="/onboarding" 
                    element={
                      <ProtectedRoute>
                        <OnboardingPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/dashboard" 
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/posts" 
                    element={
                      <ProtectedRoute>
                        <Posts />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/posts/create" 
                    element={
                      <ProtectedRoute>
                        <PostEditor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/posts/edit/:postId" 
                    element={
                      <ProtectedRoute>
                        <PostEditor />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/comments" 
                    element={
                      <ProtectedRoute>
                        <CommentModeration />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/media" 
                    element={
                      <ProtectedRoute>
                        <MediaLibrary />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/tags" 
                    element={
                      <ProtectedRoute>
                        <TagsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/categories" 
                    element={
                      <ProtectedRoute>
                        <CategoriesPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/search" 
                    element={
                      <ProtectedRoute>
                        <SearchResults />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/notifications" 
                    element={
                      <ProtectedRoute>
                        <NotificationsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/seo" 
                    element={
                      <ProtectedRoute>
                        <SeoSettings />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/help" 
                    element={
                      <ProtectedRoute>
                        <Help />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </div>
            </Router>
              </RealTimeProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;