import { useEffect, useRef, useState, lazy, Suspense, useLayoutEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import '@excalidraw/excalidraw/index.css';
import './DiagramModal.css';

// Lazy-load Excalidraw to keep initial bundle small
const Excalidraw = lazy(() =>
  import('@excalidraw/excalidraw').then((mod) => ({ default: mod.Excalidraw }))
);

const DiagramModal = ({ onSave, onClose, initialData }) => {
  const excalidrawAPIRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight - 48);

  // Recalculate canvas height on resize
  useLayoutEffect(() => {
    const update = () => setCanvasHeight(window.innerHeight - 48);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Prevent body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = async () => {
    const api = excalidrawAPIRef.current;
    if (!api) return;
    setSaving(true);
    try {
      const { exportToBlob } = await import('@excalidraw/excalidraw');
      const elements = api.getSceneElements();
      const appState = api.getAppState();
      const files = api.getFiles();

      const blob = await exportToBlob({
        elements,
        appState: { ...appState, exportBackground: true, exportWithDarkMode: true },
        files,
        mimeType: 'image/png',
        quality: 1,
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const diagramJSON = JSON.stringify({
          elements,
          appState: { viewBackgroundColor: appState.viewBackgroundColor },
          files,
        });
        onSave(base64, diagramJSON);
        setSaving(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Diagram export failed:', err);
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      background: '#141414',
    }}>
      {/* Header */}
      <div style={{
        height: 48,
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        background: '#0a0a0a',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: '#ef4444',
          fontFamily: 'monospace',
        }}>
          ◈ DIAGRAM EDITOR
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 16px',
              background: saving ? '#7f1d1d' : '#ef4444',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save to Note'}
          </button>

          <button
            onClick={onClose}
            title="Close (Esc)"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#888',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Excalidraw canvas — explicit pixel height is critical */}
      <div style={{
        width: '100%',
        height: canvasHeight,
        position: 'relative',
        overflow: 'hidden',
      }} className="excalidraw-wrapper">
        <Suspense fallback={
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 14,
            color: '#555',
            fontSize: 14,
          }}>
            <Loader size={28} style={{ animation: 'spin 0.9s linear infinite' }} />
            <span>Loading diagram editor…</span>
          </div>
        }>
          <Excalidraw
            excalidrawAPI={(api) => { excalidrawAPIRef.current = api; }}
            initialData={initialData ? {
              elements: initialData.elements || [],
              appState: { ...(initialData.appState || {}), theme: 'dark' },
              files: initialData.files || null,
            } : {
              appState: { theme: 'dark', viewBackgroundColor: '#141414' },
            }}
            theme="dark"
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                export: false,
                toggleTheme: false,
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default DiagramModal;
