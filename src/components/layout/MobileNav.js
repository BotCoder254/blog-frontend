import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  Bell, 
  User
} from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: FileText, label: 'Posts', path: '/posts' },
    { icon: PlusCircle, label: 'Create', path: '/posts/create', highlight: true },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-light-surface1 dark:bg-dark-surface1 border-t border-light-border dark:border-dark-border z-30">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileTap={{ scale: 0.95 }}
              className={`
                flex flex-col items-center justify-center p-2 min-w-0 flex-1
                ${active ? 'text-accent-primary' : 'text-gray-600 dark:text-gray-400'}
              `}
            >
              <div className={`
                p-2 rounded-xl transition-all duration-200
                ${active ? 'bg-accent-primary/10' : ''}
                ${item.highlight && !active ? 'bg-accent-primary text-white' : ''}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium mt-1 truncate">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;