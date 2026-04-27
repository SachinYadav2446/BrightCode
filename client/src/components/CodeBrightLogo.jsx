import React from 'react';
import { motion } from 'framer-motion';
import './CodeBrightLogo.css';

const CodeBrightLogo = ({ size = 'large' }) => {
  return (
    <div className={`cb-logo-container ${size}`}>
      <div className="cb-logo-text-wrapper">
        <motion.span 
          className="cb-logo-text main"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          BRIGHT
        </motion.span>
        <motion.span 
          className="cb-logo-text accent"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          CODE
        </motion.span>
        
        {/* Animated underlines/decorations */}
        <motion.div 
          className="cb-logo-underline"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
        />
        
        {/* Subtle scanning line effect */}
        <div className="cb-logo-scanner"></div>
      </div>
    </div>
  );
};

export default CodeBrightLogo;
