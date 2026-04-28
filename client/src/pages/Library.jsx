import React from 'react';
import { BookOpen, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import './Library.css';

const Library = () => {
  return (
    <div className="library-page">

      
      <div className="library-empty">
        <div className="empty-icon">
          <BookOpen size={64} />
        </div>
        <h1>Codex Library</h1>
        <p>Your tactical archives and documentation are being synchronized.</p>
      </div>

    </div>
  );
};

export default Library;
