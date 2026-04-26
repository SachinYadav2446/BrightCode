import React from 'react';
import { BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Library.css';

const Library = () => {
  return (
    <div className="library-page">
      <Navbar currentPage="library" />
      <div className="library-empty">
        <div className="empty-icon">
          <BookOpen size={64} />
        </div>
        <h1>Library</h1>
        <p>Your library is coming soon.</p>
      </div>
    </div>
  );
};

export default Library;
