import { useMemo } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import 'highlight.js/styles/github-dark.css';
import './MarkdownPreview.css';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('sql', sql);

const MarkdownPreview = ({ content }) => {
  const html = useMemo(() => {
    if (!content) return '<p class="empty-preview">Start writing to see preview...</p>';

    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {
            console.error('Highlight error:', err);
          }
        }
        return code;
      }
    });

    try {
      return marked(content);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return '<p class="error-preview">Error rendering markdown</p>';
    }
  }, [content]);

  return (
    <div 
      className="markdown-preview-container"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownPreview;
