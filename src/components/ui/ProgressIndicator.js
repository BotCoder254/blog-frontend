import React from 'react';
import { motion } from 'framer-motion';

const ProgressIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {Math.round((currentStep / totalSteps) * 100)}% complete
        </span>
      </div>
      
      <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-2">
        <motion.div
          className="bg-accent-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;