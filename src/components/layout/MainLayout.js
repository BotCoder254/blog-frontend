import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

const MainLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        <div className="sticky top-0 h-full">
          <Sidebar 
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
          
          <main className="flex-1 overflow-auto">
            <div className="w-full max-w-none px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Header 
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          isMobile
        />
        
        <main className="pb-16">
          <div className="px-4 py-6">
            {children}
          </div>
        </main>

        <MobileNav />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-light-surface1 dark:bg-dark-surface1 z-50 lg:hidden"
            >
              <Sidebar 
                collapsed={false}
                isMobile
                onClose={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;