import { NodeViewWrapper } from '@tiptap/react';
import { useState } from 'react';
import { Trash2, ZoomIn } from 'lucide-react';

const ImageComponent = ({ node, deleteNode, selected }) => {
  const [hovered, setHovered] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  return (
    <NodeViewWrapper
      className={`image-node-wrapper ${selected ? 'image-node-selected' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="image-node-inner">
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          className="image-node-img"
          onClick={() => setLightbox(true)}
          draggable={false}
        />

        {/* Action overlay — shown on hover or when selected */}
        {(hovered || selected) && (
          <div className="image-node-actions">
            <button
              className="image-action-btn image-zoom-btn"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setLightbox(true); }}
              title="View full size"
            >
              <ZoomIn size={14} />
            </button>
            <button
              className="image-action-btn image-delete-btn"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); deleteNode(); }}
              title="Delete image"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="image-lightbox-overlay"
          onClick={() => setLightbox(false)}
        >
          <img
            src={node.attrs.src}
            alt={node.attrs.alt || ''}
            className="image-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="image-lightbox-close"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default ImageComponent;
