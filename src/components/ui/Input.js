import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({ 
  label, 
  error, 
  icon: Icon, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <motion.input
          ref={ref}
          className={`
            block w-full rounded-lg border border-light-border dark:border-dark-border
            bg-light-input dark:bg-dark-input
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary
            transition-colors duration-200
            ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5
            ${error ? 'border-accent-error focus:ring-accent-error/50 focus:border-accent-error' : ''}
            ${className}
          `}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-accent-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;