import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import './CodeBlockComponent.css';

const CodeBlockComponent = ({ node, updateAttributes, extension }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = node.textContent;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{node.attrs.language || 'text'}</span>
        <button 
          className="code-block-copy-btn" 
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
