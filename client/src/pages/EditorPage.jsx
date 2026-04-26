import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { initSocket } from '../socket';
import Editor from '@monaco-editor/react';
import {
  Files, Search, GitBranch, Bug, Extensions, Settings,
  ChevronRight, ChevronDown, Folder, FileCode, FileText,
  Plus, Trash2, Edit2, X, Play, Terminal,
  SplitSquareHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './EditorPage.css';

const EditorPage = () => {
    const { user } = useAuth();
    const socketRef = useRef(null);
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [files, setFiles] = useState({
        'index.js': { content: '// Welcome to CodeBright Workspace\nconsole.log("Hello World!");', language: 'javascript' },
        'README.md': { content: '# Project README\n\nThis is your workspace.', language: 'markdown' }
    });
    const [openFiles, setOpenFiles] = useState(['index.js']);
    const [activeFile, setActiveFile] = useState('indexFile');
    const [clients, setClients] = useState([]);
    
    const [activeSidebarView, setActiveSidebarView] = useState('explorer');
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [panelVisible, setPanelVisible] = useState(false);
    const [activePanelTab, setActivePanelTab] = useState('terminal');
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [editingFile, setEditingFile] = useState(null);
    const [newFileInput, setNewFileInput] = useState(null);
    
    const [terminalOutput, setTerminalOutput] = useState([
        { type: 'info', content: 'CodeBright Terminal v1.0.0' },
        { type: 'info', content: 'Type "help" for available commands' }
    ]);
    const [terminalInput, setTerminalInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    
    const [editorContent, setEditorContent] = useState('');

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect', () => {
                socketRef.current.emit('join', { roomId, username: user?.username || 'Anonymous' });
            });
            socketRef.current.on('clients', ({ clients }) => setClients(clients));
            socketRef.current.on('code-change', ({ file, code }) => {
                setFiles(prev => ({ ...prev, [file]: { ...prev[file], content: code } }));
            });
        };
        init();
        return () => socketRef.current?.disconnect();
    }, [roomId, user]);

    useEffect(() => {
        if (activeFile && files[activeFile]) {
            setEditorContent(files[activeFile].content);
        }
    }, [activeFile, files]);

    const createFile = (filename) => {
        if (!filename || files[filename]) return;
        const ext = filename.split('.').pop();
        const languageMap = {
            'js': 'javascript', 'jsx': 'javascript',
            'ts': 'typescript', 'tsx': 'typescript',
            'py': 'python', 'html': 'html',
            'css': 'css', 'json': 'json',
            'md': 'markdown'
        };
        setFiles(prev => ({
            ...prev,
            [filename]: { content: '', language: languageMap[ext] || 'plaintext' }
        }));
        setOpenFiles(prev => [...prev, filename]);
        setActiveFile(filename);
        setNewFileInput(null);
    };

    const deleteFile = (filename) => {
        if (!window.confirm(`Delete "${filename}"?`)) return;
        setFiles(prev => {
            const newFiles = { ...prev };
            delete newFiles[filename];
            return newFiles;
        });
        setOpenFiles(prev => prev.filter(f => f !== filename));
        if (activeFile === filename) {
            const remaining = openFiles.filter(f => f !== filename);
            setActiveFile(remaining[0] || '');
        }
    };

    const renameFile = (oldName, newName) => {
        if (!newName || newName === oldName || files[newName]) return;
        setFiles(prev => {
            const newFiles = { ...prev };
            newFiles[newName] = newFiles[oldName];
            delete newFiles[oldName];
            return newFiles;
        });
        setOpenFiles(prev => prev.map(f => f === oldName ? newName : f));
        if (activeFile === oldName) setActiveFile(newName);
        setEditingFile(null);
    };

    const openFile = (filename) => {
        if (!openFiles.includes(filename)) {
            setOpenFiles(prev => [...prev, filename]);
        }
        setActiveFile(filename);
    };

    const closeFile = (filename, e) => {
        e?.stopPropagation();
        setOpenFiles(prev => prev.filter(f => f !== filename));
        if (activeFile === filename) {
            const remaining = openFiles.filter(f => f !== filename);
            setActiveFile(remaining[0] || '');
        }
    };

    const handleEditorChange = (value) => {
        if (!activeFile) return;
        setFiles(prev => ({
            ...prev,
            [activeFile]: { ...prev[activeFile], content: value }
        }));
        socketRef.current?.emit('code-change', { roomId, file: activeFile, code: value });
    };

    const executeCommand = (cmd) => {
        const command = cmd.trim().toLowerCase();
        setTerminalOutput(prev => [...prev, { type: 'command', content: `> ${cmd}` }]);
        
        switch(command) {
            case 'help':
                setTerminalOutput(prev => [...prev, 
                    { type: 'output', content: 'Available commands:\n  help - Show this help\n  clear - Clear terminal\n  ls - List files\n  run - Run current file' }
                ]);
                break;
            case 'clear':
                setTerminalOutput([]);
                break;
            case 'ls':
                setTerminalOutput(prev => [...prev, 
                    { type: 'output', content: Object.keys(files).join('\n') }
                ]);
                break;
            case 'run':
                setIsRunning(true);
                setTerminalOutput(prev => [...prev, { type: 'info', content: `Running ${activeFile}...` }]);
                setTimeout(() => {
                    setTerminalOutput(prev => [...prev, { type: 'output', content: files[activeFile]?.content || 'No output' }]);
                    setIsRunning(false);
                }, 1000);
                break;
            default:
                setTerminalOutput(prev => [...prev, { type: 'error', content: `Command not found: ${cmd}` }]);
        }
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop();
        const iconMap = {
            'js': <FileCode size={16} className="file-icon-js" />,
            'jsx': <FileCode size={16} className="file-icon-jsx" />,
            'ts': <FileCode size={16} className="file-icon-ts" />,
            'tsx': <FileCode size={16} className="file-icon-tsx" />,
            'py': <FileCode size={16} className="file-icon-py" />,
            'html': <FileCode size={16} className="file-icon-html" />,
            'css': <FileCode size={16} className="file-icon-css" />,
            'json': <FileCode size={16} className="file-icon-json" />,
            'md': <FileText size={16} className="file-icon-md" />
        };
        return iconMap[ext] || <FileText size={16} className="file-icon-default" />;
    };

    const getLanguage = (filename) => {
        const ext = filename.split('.').pop();
        const langMap = {
            'js': 'javascript', 'jsx': 'javascript',
            'ts': 'typescript', 'tsx': 'typescript',
            'py': 'python', 'html': 'html',
            'css': 'css', 'json': 'json',
            'md': 'markdown'
        };
        return langMap[ext] || 'plaintext';
    };

    return (
        <div className="vscode-editor">
            <div className="title-bar">
                <div className="window-controls">
                    <div className="window-dot red" />
                    <div className="window-dot yellow" />
                    <div className="window-dot green" />
                </div>
                <div className="title-text">CodeBright - {roomId}</div>
                <div className="window-controls-spacer" />
            </div>

            <div className="editor-container">
                <div className="activity-bar">
                    <div className="activity-top">
                        <button 
                            className={`activity-item ${activeSidebarView === 'explorer' ? 'active' : ''}`}
                            onClick={() => { setActiveSidebarView('explorer'); setSidebarVisible(true); }}
                            title="Explorer"
                        >
                            <Files size={24} />
                        </button>
                        <button 
                            className={`activity-item ${activeSidebarView === 'search' ? 'active' : ''}`}
                            onClick={() => { setActiveSidebarView('search'); setSidebarVisible(true); }}
                            title="Search"
                        >
                            <Search size={24} />
                        </button>
                        <button 
                            className={`activity-item ${activeSidebarView === 'git' ? 'active' : ''}`}
                            onClick={() => { setActiveSidebarView('git'); setSidebarVisible(true); }}
                            title="Source Control"
                        >
                            <GitBranch size={24} />
                        </button>
                        <button 
                            className={`activity-item ${activeSidebarView === 'debug' ? 'active' : ''}`}
                            onClick={() => { setActiveSidebarView('debug'); setSidebarVisible(true); }}
                            title="Run and Debug"
                        >
                            <Bug size={24} />
                        </button>
                        <button 
                            className={`activity-item ${activeSidebarView === 'extensions' ? 'active' : ''}`}
                            onClick={() => { setActiveSidebarView('extensions'); setSidebarVisible(true); }}
                            title="Extensions"
                        >
                            <Extensions size={24} />
                        </button>
                    </div>
                    <div className="activity-bottom">
                        <button className="activity-item" onClick={() => navigate('/workspace')} title="Leave Workspace">
                            <X size={20} />
                        </button>
                        <button className="activity-item" title="Settings">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                {sidebarVisible && (
                    <aside className="sidebar">
                        {activeSidebarView === 'explorer' && (
                            <div className="sidebar-content">
                                <div className="sidebar-header">
                                    <span className="sidebar-title">EXPLORER</span>
                                    <div className="sidebar-actions">
                                        <button 
                                            className="sidebar-action-btn"
                                            onClick={() => setNewFileInput('new')}
                                            title="New File"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="file-tree">
                                    <div className="folder-item expanded">
                                        <div className="folder-header">
                                            <ChevronDown size={16} />
                                            <Folder size={16} className="folder-icon" />
                                            <span>WORKSPACE</span>
                                        </div>
                                        <div className="folder-contents">
                                            {newFileInput === 'new' && (
                                                <div className="file-item editing">
                                                    <FileCode size={16} />
                                                    <input 
                                                        type="text" 
                                                        autoFocus
                                                        placeholder="filename.js"
                                                        onBlur={(e) => createFile(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') createFile(e.target.value);
                                                            if (e.key === 'Escape') setNewFileInput(null);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {Object.keys(files).map(filename => (
                                                <div key={filename}>
                                                    {editingFile === filename ? (
                                                        <div className="file-item editing">
                                                            {getFileIcon(filename)}
                                                            <input 
                                                                type="text" 
                                                                autoFocus
                                                                defaultValue={filename}
                                                                onBlur={(e) => renameFile(filename, e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') renameFile(filename, e.target.value);
                                                                    if (e.key === 'Escape') setEditingFile(null);
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            className={`file-item ${activeFile === filename ? 'active' : ''}`}
                                                            onClick={() => openFile(filename)}
                                                            onContextMenu={(e) => {
                                                                e.preventDefault();
                                                                setContextMenu({ x: e.clientX, y: e.clientY, file: filename });
                                                            }}
                                                        >
                                                            {getFileIcon(filename)}
                                                            <span className="file-name">{filename}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSidebarView === 'search' && (
                            <div className="sidebar-content">
                                <div className="sidebar-header">
                                    <span className="sidebar-title">SEARCH</span>
                                </div>
                                <div className="search-container">
                                    <input type="text" className="search-input" placeholder="Search in files..." />
                                    <input type="text" className="search-input" placeholder="Replace..." />
                                    <button className="search-btn">Search</button>
                                </div>
                            </div>
                        )}

                        {activeSidebarView === 'git' && (
                            <div className="sidebar-content">
                                <div className="sidebar-header">
                                    <span className="sidebar-title">SOURCE CONTROL</span>
                                </div>
                                <div className="git-message">
                                    <p>No git repository detected</p>
                                    <button className="git-init-btn">Initialize Repository</button>
                                </div>
                            </div>
                        )}

                        {activeSidebarView === 'debug' && (
                            <div className="sidebar-content">
                                <div className="sidebar-header">
                                    <span className="sidebar-title">RUN AND DEBUG</span>
                                </div>
                                <div className="debug-actions">
                                    <button className="debug-btn primary" onClick={() => executeCommand('run')} disabled={isRunning}>
                                        <Play size={16} /> Run
                                    </button>
                                    <p className="debug-hint">Press F5 to start debugging</p>
                                </div>
                            </div>
                        )}

                        {activeSidebarView === 'extensions' && (
                            <div className="sidebar-content">
                                <div className="sidebar-header">
                                    <span className="sidebar-title">EXTENSIONS</span>
                                </div>
                                <div className="extensions-search">
                                    <input type="text" className="search-input" placeholder="Search extensions..." />
                                </div>
                                <div className="extensions-list">
                                    <p className="extensions-empty">No extensions installed</p>
                                </div>
                            </div>
                        )}
                    </aside>
                )}

                <div className="main-area">
                    <div className="tab-bar">
                        <div className="tabs-container">
                            {openFiles.map(filename => (
                                <div 
                                    key={filename}
                                    className={`tab ${activeFile === filename ? 'active' : ''}`}
                                    onClick={() => setActiveFile(filename)}
                                >
                                    {getFileIcon(filename)}
                                    <span className="tab-name">{filename}</span>
                                    <button 
                                        className="tab-close"
                                        onClick={(e) => closeFile(filename, e)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="tab-actions">
                            <button className="tab-action-btn" onClick={() => executeCommand('run')} disabled={isRunning} title="Run">
                                <Play size={14} />
                            </button>
                            <button 
                                className="tab-action-btn" 
                                onClick={() => setPanelVisible(!panelVisible)}
                                title="Toggle Panel"
                            >
                                <Terminal size={14} />
                            </button>
                            <button className="tab-action-btn" title="Split Editor">
                                <SplitSquareHorizontal size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="editor-wrapper">
                        {activeFile ? (
                            <Editor
                                height="100%"
                                language={getLanguage(activeFile)}
                                value={editorContent}
                                onChange={handleEditorChange}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: true },
                                    fontSize: 14,
                                    fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    wordWrap: 'on'
                                }}
                            />
                        ) : (
                            <div className="welcome-screen">
                                <div className="welcome-content">
                                    <h1>CodeBright</h1>
                                    <p>Collaborative Code Editor</p>
                                    <p className="welcome-hint">Start by creating a file from the Explorer</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {panelVisible && (
                        <div className="bottom-panel">
                            <div className="panel-tabs">
                                <button 
                                    className={`panel-tab ${activePanelTab === 'terminal' ? 'active' : ''}`}
                                    onClick={() => setActivePanelTab('terminal')}
                                >
                                    <Terminal size={14} /> Terminal
                                </button>
                                <button 
                                    className={`panel-tab ${activePanelTab === 'output' ? 'active' : ''}`}
                                    onClick={() => setActivePanelTab('output')}
                                >
                                    <Play size={14} /> Output
                                </button>
                                <button 
                                    className={`panel-tab ${activePanelTab === 'problems' ? 'active' : ''}`}
                                    onClick={() => setActivePanelTab('problems')}
                                >
                                    <X size={14} /> Problems
                                </button>
                                <div className="panel-actions">
                                    <button 
                                        className="panel-action-btn"
                                        onClick={() => setPanelVisible(false)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="panel-content">
                                {activePanelTab === 'terminal' && (
                                    <div className="terminal-container">
                                        <div className="terminal-output">
                                            {terminalOutput.map((line, i) => (
                                                <div key={i} className={`terminal-line ${line.type}`}>
                                                    {line.content}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="terminal-input-line">
                                            <span className="terminal-prompt">&gt;</span>
                                            <input
                                                type="text"
                                                className="terminal-input"
                                                value={terminalInput}
                                                onChange={(e) => setTerminalInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        executeCommand(terminalInput);
                                                        setTerminalInput('');
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                {activePanelTab === 'output' && (
                                    <div className="output-container">
                                        <p className="output-content">No output yet</p>
                                    </div>
                                )}
                                {activePanelTab === 'problems' && (
                                    <div className="problems-container">
                                        <p>No problems detected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="status-bar">
                <div className="status-left">
                    <button className="status-item">
                        <GitBranch size={12} /> main
                    </button>
                    <button className="status-item errors">
                        <X size={12} /> 0
                    </button>
                    <button className="status-item warnings">
                        <X size={12} /> 0
                    </button>
                </div>
                <div className="status-right">
                    <button className="status-item">
                        Ln 1, Col 1
                    </button>
                    <button className="status-item">
                        UTF-8
                    </button>
                    <button className="status-item language">
                        {activeFile ? getLanguage(activeFile) : 'plaintext'}
                    </button>
                    <button className="status-item">
                        {clients.length} online
                    </button>
                </div>
            </div>

            {contextMenu && (
                <div 
                    className="context-menu"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onMouseLeave={() => setContextMenu(null)}
                >
                    <div className="context-item" onClick={() => setEditingFile(contextMenu.file)}>
                        <Edit2 size={14} /> Rename
                    </div>
                    <div className="context-item delete" onClick={() => deleteFile(contextMenu.file)}>
                        <Trash2 size={14} /> Delete
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorPage;
