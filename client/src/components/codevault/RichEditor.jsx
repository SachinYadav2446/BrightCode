import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Heading } from '@tiptap/extension-heading';
import { motion, AnimatePresence } from 'framer-motion';
import { CodeBlock } from '@tiptap/extension-code-block';
import CodeBlockComponent from './CodeBlockComponent';
import ImageComponent from './ImageComponent';
import DiagramModal from './DiagramModal';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useEffect, useCallback, useState, useMemo, useRef, useLayoutEffect } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, List, ListOrdered, CheckSquare, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Quote, Minus, Image as ImageIcon,
  Link as LinkIcon, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Type,
  Highlighter, Palette, ChevronDown, RotateCcw, RotateCw,
  Code2, X as XIcon, Upload, Globe, PenTool
} from 'lucide-react';
import './RichEditor.css';

const TEXT_COLORS = [
  { label: 'Default', value: 'inherit' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'White', value: '#ffffff' },
  { label: 'Gray', value: '#9ca3af' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', value: '#fef08a' },
  { label: 'Green', value: '#bbf7d0' },
  { label: 'Blue', value: '#bfdbfe' },
  { label: 'Pink', value: '#fbcfe8' },
  { label: 'Orange', value: '#fed7aa' },
  { label: 'Purple', value: '#e9d5ff' },
];

// ── Small reusable toolbar button ──────────────────────────────
const ToolbarButton = ({ onClick, isActive, title, children, disabled, className }) => (
  <button
    onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick(); }}
    className={`toolbar-btn ${isActive ? 'toolbar-btn-active' : ''} ${disabled ? 'toolbar-btn-disabled' : ''} ${className || ''}`}
    title={title}
    type="button"
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="toolbar-divider" />;

// ── Color picker dropdown ────────────────────────────────────────
const ColorPicker = ({ colors, onSelect, triggerIcon, title }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="color-picker-wrapper">
      <button
        className="toolbar-btn color-picker-trigger"
        onMouseDown={(e) => { e.preventDefault(); setOpen(o => !o); }}
        title={title}
        type="button"
      >
        {triggerIcon}
        <ChevronDown size={10} />
      </button>
      {open && (
        <>
          {/* invisible overlay to close on outside click */}
          <div className="color-picker-backdrop" onMouseDown={() => setOpen(false)} />
          <div className="color-picker-dropdown">
            <div className="color-picker-title">{title}</div>
            <div className="color-swatches">
              {colors.map((c) => (
                <button
                  key={c.value}
                  className="color-swatch"
                  style={{
                    background: c.value === 'inherit' ? 'transparent' : c.value,
                    border: c.value === 'inherit' ? '2px dashed #555' : '2px solid transparent'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect(c.value === 'inherit' ? null : c.value);
                    setOpen(false);
                  }}
                  title={c.label}
                  type="button"
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Heading active class manager (adds heading-active to the DOM node under cursor) ──
const HeadingPicker = ({ editor }) => {
  const activeNodeRef = useRef(null);

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      // Remove class from previous node
      if (activeNodeRef.current) {
        activeNodeRef.current.classList.remove('heading-active');
        activeNodeRef.current = null;
      }

      // Check if cursor is inside a heading
      let level = null;
      for (let l = 1; l <= 6; l++) {
        if (editor.isActive('heading', { level: l })) { level = l; break; }
      }
      if (!level) return;

      // Find the heading DOM node at cursor position
      const { from } = editor.state.selection;
      const domAtPos = editor.view.domAtPos(from);
      let node = domAtPos.node;
      while (node && node.nodeType !== 1) node = node.parentNode;
      while (node && !['H1','H2','H3','H4','H5','H6'].includes(node.tagName)) {
        node = node.parentNode;
      }
      if (!node) return;

      node.classList.add('heading-active');
      activeNodeRef.current = node;
    };

    const clear = () => {
      if (activeNodeRef.current) {
        activeNodeRef.current.classList.remove('heading-active');
        activeNodeRef.current = null;
      }
    };

    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    editor.on('blur', clear);

    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
      editor.off('blur', clear);
      clear();
    };
  }, [editor]);

  return null; // no UI rendered
};

// ── Main RichEditor component ────────────────────────────────────
const RichEditor = ({ content, onChange, editable = true }) => {

  // Detect if legacy plain text (not HTML) so we can wrap it
  const initialContent = useMemo(() => {
    if (!content) return '<p></p>';
    const isHTML = /<[a-z][\s\S]*>/i.test(content);
    if (isHTML) return content;
    // Legacy plain text / markdown — wrap lines as paragraphs
    return content
      .split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '<p></p>')
      .join('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once per mount

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }).extend({
        // Add paste rules so pasted markdown headings (# H1, ## H2 etc.) are converted
        addPasteRules() {
          return [1, 2, 3, 4, 5, 6].map((level) => ({
            find: new RegExp(`^(#{${level}})\\s(.+)$`, 'gm'),
            handler: ({ state, range, match }) => {
              const { tr } = state;
              const start = range.from;
              const end = range.to;
              const headingText = match[2];
              tr.replaceWith(
                start,
                end,
                state.schema.nodes.heading.create(
                  { level },
                  state.schema.text(headingText)
                )
              );
            },
          }));
        },
      }),
      CodeBlock.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageComponent);
        },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: 'Start writing your note…  (use # for headings, **text** for bold, etc.)'
      }),
    ],
    content: initialContent,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose-editor',
      },
      // Transform plain-text paste: convert markdown headings to HTML headings
      transformPastedText(text) {
        return text
          .split('\n')
          .map((line) => {
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
              const level = match[1].length;
              const content = match[2];
              return `<h${level}>${content}</h${level}>`;
            }
            return line;
          })
          .join('\n');
      },
    },
  });

  // Update editor content when a different note is loaded (note switch)
  useEffect(() => {
    if (!editor || !content) return;
    const currentHTML = editor.getHTML();
    if (content === currentHTML) return;

    const isHTML = /<[a-z][\s\S]*>/i.test(content);
    const safeContent = isHTML
      ? content
      : content.split('\n').map(l => l.trim() ? `<p>${l}</p>` : '<p></p>').join('');

    // Use queueMicrotask so Tiptap's internal state is settled
    queueMicrotask(() => {
      editor.commands.setContent(safeContent, false);
    });
    // only re-run when the content prop changes externally (note switch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  const [modalConfig, setModalConfig] = useState({ show: false, title: '', placeholder: '', value: '', type: '' });
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [diagramInitialData, setDiagramInitialData] = useState(null);
  const diagramEditCallbackRef = useRef(null);
  const fileInputRef = useRef(null);

  // Listen for edit-diagram events from ImageComponent
  useEffect(() => {
    const handler = (e) => {
      const { diagramData, updateAttributes, deleteNode } = e.detail;
      setDiagramInitialData(diagramData);
      diagramEditCallbackRef.current = { updateAttributes, deleteNode };
      setDiagramOpen(true);
    };
    document.addEventListener('edit-diagram', handler);
    return () => document.removeEventListener('edit-diagram', handler);
  }, []);

  // Handle local file upload — convert to base64 and insert
  const handleImageFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  }, [editor]);

  // Handle URL-based image insert
  const handleImageUpload = useCallback(() => {
    setModalConfig({
      show: true,
      title: 'Insert Image from URL',
      placeholder: 'https://example.com/image.png',
      value: '',
      type: 'image'
    });
  }, []);

  // Handle diagram save — insert exported PNG into editor, or update existing
  const handleDiagramSave = useCallback((base64PNG, diagramJSON) => {
    if (!editor) return;
    const editCallback = diagramEditCallbackRef.current;
    if (editCallback) {
      // Editing existing diagram — update the image node in place
      editCallback.updateAttributes({ src: base64PNG, title: diagramJSON });
      diagramEditCallbackRef.current = null;
    } else {
      // New diagram — insert as image node
      editor.chain().focus().setImage({
        src: base64PNG,
        alt: 'diagram',
        title: diagramJSON,
      }).run();
    }
    setDiagramOpen(false);
    setDiagramInitialData(null);
  }, [editor]);

  const handleLinkSet = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    setModalConfig({
      show: true,
      title: 'Insert Link',
      placeholder: 'Enter URL...',
      value: prev,
      type: 'link'
    });
  }, [editor]);

  const onModalSubmit = (val) => {
    if (modalConfig.type === 'link') {
      if (val === '') editor.chain().focus().unsetLink().run();
      else editor.chain().focus().setLink({ href: val }).run();
    } else {
      if (val) editor.chain().focus().setImage({ src: val }).run();
    }
    setModalConfig({ ...modalConfig, show: false });
  };

  if (!editor) return null;

  return (
    <div className="rich-editor-wrapper">
      {editable && (
        <div className="rich-toolbar" onMouseDown={e => e.preventDefault()}>

          {/* History */}
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>
            <RotateCcw size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>
            <RotateCw size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1 (red)" className="h1-btn">
            <Heading1 size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2 (amber)" className="h2-btn">
            <Heading2 size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3 (green)" className="h3-btn">
            <Heading3 size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} isActive={editor.isActive('heading', { level: 4 })} title="Heading 4 (blue)" className="h4-btn">
            <Heading4 size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} isActive={editor.isActive('heading', { level: 5 })} title="Heading 5 (purple)" className="h5-btn">
            <Heading5 size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} isActive={editor.isActive('heading', { level: 6 })} title="Heading 6 (pink)" className="h6-btn">
            <Heading6 size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph') && !editor.isActive('heading')} title="Paragraph">
            <Type size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Inline formatting */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline">
            <UnderlineIcon size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
            <Code size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Colors */}
          <ColorPicker
            colors={TEXT_COLORS}
            title="Text Color"
            triggerIcon={
              <>
                <Palette size={14} />
                <div
                  className="color-bar"
                  style={{ background: editor.getAttributes('textStyle').color || '#e4e4e7' }}
                />
              </>
            }
            onSelect={(color) => {
              if (color) editor.chain().focus().setColor(color).run();
              else editor.chain().focus().unsetColor().run();
            }}
          />
          <ColorPicker
            colors={HIGHLIGHT_COLORS}
            title="Highlight Color"
            triggerIcon={
              <>
                <Highlighter size={14} />
                <div
                  className="color-bar"
                  style={{ background: '#fef08a' }}
                />
              </>
            }
            onSelect={(color) => {
              if (color) editor.chain().focus().setHighlight({ color }).run();
              else editor.chain().focus().unsetHighlight().run();
            }}
          />

          <ToolbarDivider />

          {/* Alignment */}
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
            <AlignLeft size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
            <AlignCenter size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
            <AlignRight size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
            <AlignJustify size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
            <ListOrdered size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')} title="Checklist">
            <CheckSquare size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Block elements */}
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
            <Quote size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
            <Code2 size={14} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
            <Minus size={14} />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Media */}
          <ToolbarButton onClick={handleLinkSet} isActive={editor.isActive('link')} title="Insert Link">
            <LinkIcon size={14} />
          </ToolbarButton>
          {/* Upload image from PC */}
          <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Upload Image from PC">
            <Upload size={14} />
          </ToolbarButton>
          {/* Insert image by URL */}
          <ToolbarButton onClick={handleImageUpload} title="Insert Image from URL">
            <Globe size={14} />
          </ToolbarButton>
          {/* Draw diagram */}
          <ToolbarButton onClick={() => { setDiagramInitialData(null); setDiagramOpen(true); }} title="Insert Diagram">
            <PenTool size={14} />
          </ToolbarButton>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageFileUpload}
          />
        </div>
      )}

      <div className="rich-editor-scroll">
        <HeadingPicker editor={editor} />
        <EditorContent editor={editor} className="rich-editor-content" />
      </div>

      {/* Custom Modal for Link/Image */}
      <AnimatePresence>
        {modalConfig.show && (
          <div className="editor-modal-overlay" onClick={() => setModalConfig({ ...modalConfig, show: false })}>
            <motion.div
              className="editor-modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="editor-modal-header">
                <h3>{modalConfig.title}</h3>
                <button className="close-modal-btn" onClick={() => setModalConfig({ ...modalConfig, show: false })}>
                  <XIcon size={18} />
                </button>
              </div>
              <div className="editor-modal-body">
                <input
                  autoFocus
                  type="text"
                  placeholder={modalConfig.placeholder}
                  value={modalConfig.value}
                  onChange={e => setModalConfig({ ...modalConfig, value: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onModalSubmit(modalConfig.value);
                    if (e.key === 'Escape') setModalConfig({ ...modalConfig, show: false });
                  }}
                  className="editor-modal-input"
                />
              </div>
              <div className="editor-modal-footer">
                <button className="modal-btn-cancel" onClick={() => setModalConfig({ ...modalConfig, show: false })}>
                  Cancel
                </button>
                <button className="modal-btn-primary" onClick={() => onModalSubmit(modalConfig.value)}>
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Diagram editor modal */}
      {diagramOpen && (
        <DiagramModal
          onSave={handleDiagramSave}
          onClose={() => setDiagramOpen(false)}
          initialData={diagramInitialData}
        />
      )}
    </div>
  );
};

export default RichEditor;
