import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/90 to-accent-secondary/90" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-4">SPRILLIBLO</h1>
            <p className="text-xl opacity-90 max-w-md">
              Create, share, and manage your multi-tenant blog platform with modern tools and beautiful design.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="lg:hidden">
            <h1 className="text-2xl font-bold text-accent-primary">SPRILLIBLO</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-light-surface1 dark:bg-dark-surface1 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
              
              {children}
            </motion.div>
          </div>
        </div>

        {/* Mobile Brand */}
        <div className="lg:hidden p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 SPRILLIBLO. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;