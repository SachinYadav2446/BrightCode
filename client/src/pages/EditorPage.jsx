import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { initSocket } from '../socket';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, FileCode, Play, LogOut, FilePlus, Terminal as TerminalIcon,
    Monitor, Link as LinkIcon, Trash2, Edit2, Shield, Sparkles,
    PenTool, Eraser, Layout as WhiteboardIcon,
    Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Share2
} from 'lucide-react';
import axios from 'axios';
import './EditorPage.css';
import { useAuth } from '../context/AuthContext';


const EditorPage = () => {
    const { user, updateXP } = useAuth(); // BUG FIX: added updateXP
    const socketRef = useRef(null);
    const { roomId } = useParams();
    const navigate = useNavigate();

    // ── Core Editor States ──────────────────────────────────────────────────
    const [clients, setClients] = useState([]);
    const [files, setFiles] = useState({});
    const [activeFile, setActiveFile] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState('javascript');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', targetFile: '', defaultValue: '' });

    // ── Sidebar/Tab States (BUG FIX: both were missing) ─────────────────────
    const [activeTab, setActiveTab] = useState('files');

    // ── Whiteboard States ────────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState('editor');
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawColor, setDrawColor] = useState('#fbbf24');

    // ── Terminal States ──────────────────────────────────────────────────────
    const [terminalLogs, setTerminalLogs] = useState([
        { output: 'Sentinel Shell Initialized. Ready for input.', isSystem: true }
    ]);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [terminalInput, setTerminalInput] = useState('');
    const terminalEndRef = useRef(null);

    // ── Admin States ─────────────────────────────────────────────────────────
    const [adminId, setAdminId] = useState(null);
    const [myId, setMyId] = useState(null);
    const [myPermission, setMyPermission] = useState('write');
    const isAdmin = adminId === myId;

    // ── Resizer & Modal Addition ─────────────────────────────────────────────
    const [creationLang, setCreationLang] = useState('javascript');

    // ── Resizer States ───────────────────────────────────────────────────────
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
    const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);

    const prevSidebarWidth = useRef(280);
    const prevTerminalHeight = useRef(200);

    const isResizingSidebar = useRef(false);
    const isResizingTerminal = useRef(false);

    const startSidebarResize = () => { if (!isSidebarCollapsed) { isResizingSidebar.current = true; document.body.style.cursor = 'col-resize'; } };
    const startTerminalResize = () => { if (!isTerminalCollapsed) { isResizingTerminal.current = true; document.body.style.cursor = 'row-resize'; } };

    const toggleSidebar = (e) => {
        e.stopPropagation();
        if (isSidebarCollapsed) {
            setSidebarWidth(prevSidebarWidth.current);
            setIsSidebarCollapsed(false);
        } else {
            prevSidebarWidth.current = sidebarWidth;
            setSidebarWidth(0);
            setIsSidebarCollapsed(true);
        }
    };

    const toggleTerminal = (e) => {
        e.stopPropagation();
        if (isTerminalCollapsed) {
            setTerminalHeight(prevTerminalHeight.current);
            setIsTerminalCollapsed(false);
        } else {
            prevTerminalHeight.current = terminalHeight;
            setTerminalHeight(0);
            setIsTerminalCollapsed(true);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizingSidebar.current) {
                const newWidth = e.clientX;
                if (newWidth > 180 && newWidth < 500) {
                    setSidebarWidth(newWidth);
                    setIsSidebarCollapsed(false);
                }
            }
            if (isResizingTerminal.current) {
                const newHeight = window.innerHeight - e.clientY;
                if (newHeight >= 0 && newHeight < 600) {
                    setTerminalHeight(newHeight);
                    if (newHeight > 20) setIsTerminalCollapsed(false);
                    else if (newHeight === 0) setIsTerminalCollapsed(true);
                }
            }
        };
        const handleMouseUp = () => {
            isResizingSidebar.current = false;
            isResizingTerminal.current = false;
            document.body.style.cursor = 'default';
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);


    // ── Socket.io Effect ─────────────────────────────────────────────────────
    useEffect(() => {
        let isStopped = false;

        const init = async () => {
            try {
                const socket = await initSocket();
                if (isStopped) { socket.disconnect(); return; }
                socketRef.current = socket;

                socket.on('connect_error', () => toast.error('Connection failed. Retrying...'));

                socket.emit('join-room', { roomId, username: user?.username });

                socket.on('initial-data', ({ files, users, adminId, yourId }) => {
                    if (isStopped) return;
                    setFiles(files);
                    setClients(users);
                    setAdminId(adminId);
                    setMyId(yourId);
                    const fileNames = Object.keys(files);
                    if (fileNames.length > 0) {
                        setActiveFile(fileNames[0]);
                        setLanguage(files[fileNames[0]].language);
                    }
                });



                // Terminal
                socket.on('terminal-output', (log) => {
                    setTerminalLogs(prev => [...prev, log]);
                    setIsTerminalOpen(true);
                });

                // User events
                socket.on('user-joined', ({ username, socketId, role }) => {
                    if (isStopped || username === user?.username) return;
                    toast.success(`${username} joined as ${role}`);
                    setClients(prev => prev.find(u => u.id === socketId) ? prev : [...prev, { id: socketId, username, role }]);
                });
                socket.on('permission-changed', ({ permission }) => {
                    setMyPermission(permission);
                    toast(`Permissions Updated: You are now [${permission.toUpperCase()}]`, {
                        icon: permission === 'write' ? '✍️' : '🔒',
                        style: { background: '#1c1917', color: '#fbbf24' }
                    });
                });
                socket.on('user-status-updated', ({ targetId, permission }) =>
                    setClients(prev => prev.map(u => u.id === targetId ? { ...u, permission } : u))
                );
                socket.on('get-kicked', () => { toast.error("Removed from workspace by admin."); navigate('/'); });
                socket.on('code-update', ({ fileName, content }) => {
                    if (!isStopped) setFiles(prev => ({ ...prev, [fileName]: { ...prev[fileName], content } }));
                });
                socket.on('file-created', ({ fileName, language, content }) => {
                    if (!isStopped) {
                        setFiles(prev => ({ ...prev, [fileName]: { content: content || '', language } }));
                        setActiveFile(fileName);
                        toast.success(`File ${fileName} created`);
                    }
                });
                socket.on('file-deleted', ({ fileName }) => {
                    if (!isStopped) {
                        setFiles(prev => { const n = { ...prev }; delete n[fileName]; return n; });
                        setActiveFile(prev => prev === fileName ? '' : prev);
                        toast.success(`File ${fileName} deleted`);
                    }
                });
                socket.on('file-renamed', ({ oldName, newName }) => {
                    if (!isStopped) {
                        setFiles(prev => { const n = { ...prev }; n[newName] = n[oldName]; delete n[oldName]; return n; });
                        setActiveFile(prev => prev === oldName ? newName : prev);
                        toast.success(`File renamed to ${newName}`);
                    }
                });
                socket.on('user-left', ({ id, username }) => {
                    if (!isStopped) { toast.success(`${username} left`); setClients(prev => prev.filter(c => c.id !== id)); }
                });
                socket.on('session-ended', ({ message }) => {
                    if (!isStopped) { toast.error(message, { duration: 5000 }); navigate('/'); }
                });



            } catch (err) {
                console.error('Socket init error:', err);
                toast.error('Failed to initialize workspace');
            }
        };

        if (user) init();

        return () => {
            isStopped = true;
            if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
        };
    }, [roomId, user?.username, navigate]);

    // ── Core Handlers ─────────────────────────────────────────────────────────
    const handleCodeChange = (value) => {
        if (!activeFile || !socketRef.current) return;
        setFiles(prev => ({ ...prev, [activeFile]: { ...prev[activeFile], content: value } }));
        socketRef.current.emit('code-change', { roomId, fileName: activeFile, content: value });
    };

    const runCode = async () => {
        if (!activeFile || isRunning) return;

        // Auto-expand terminal if collapsed
        if (isTerminalCollapsed) {
            setTerminalHeight(prevTerminalHeight.current || 200);
            setIsTerminalCollapsed(false);
        }

        setIsRunning(true);
        setOutput('Running...');
        try {
            const currentFile = files[activeFile];
            const pistonLangMap = {
                javascript: 'js',
                python: 'python3',
                cpp: 'cpp',
                java: 'java'
            };
            const lang = pistonLangMap[currentFile.language] || currentFile.language;

            const response = await axios.post('http://localhost:5050/execute', {
                language: lang,
                files: [{ name: currentFile.language === 'java' ? 'Main.java' : activeFile, content: currentFile.content }]
            });
            const runInfo = response.data.run;
            setOutput(runInfo.stdout || runInfo.stderr || 'Success (No output)');
            if (!runInfo.stderr && (runInfo.stdout || runInfo.code === 0)) {
                try {
                    const token = localStorage.getItem('token');
                    const xpAmount = 5;
                    const xpRes = await axios.post('http://localhost:5050/add-xp', { amount: xpAmount },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (xpRes.data.success) {
                        const { xp, ...stats } = xpRes.data;
                        updateXP(xp, stats);
                    }
                } catch { console.error('XP Sync Error'); }
            }
        } catch (error) {
            setOutput('Execution error: ' + (error.response?.data?.details || error.message));
        }
        setIsRunning(false);
    };

    const createNewFile = () => setModalConfig({ isOpen: true, type: 'create', targetFile: '', defaultValue: '' });

    const copyInviteLink = async () => {
        try { await navigator.clipboard.writeText(window.location.href); toast.success('Invite link copied!'); }
        catch { toast.error('Failed to copy link'); }
    };

    const deleteFile = (e, fileName) => {
        e.stopPropagation();
        if (Object.keys(files).length === 1) { toast.error('Cannot delete the last remaining file'); return; }
        setModalConfig({ isOpen: true, type: 'delete', targetFile: fileName, defaultValue: '' });
    };

    const renameFile = (e, oldName) => {
        e.stopPropagation();
        setModalConfig({ isOpen: true, type: 'rename', targetFile: oldName, defaultValue: oldName });
    };

    const handleModalSubmit = (fileName) => {
        const { type, targetFile } = modalConfig;
        if (type === 'create' && fileName && socketRef.current) {
            const extMap = { javascript: 'js', python: 'py', cpp: 'cpp', java: 'java' };
            const ext = extMap[creationLang];
            const finalName = fileName.includes('.') ? fileName : `${fileName}.${ext}`;

            if (files[finalName]) {
                toast.error('File name already exists');
                return;
            }

            socketRef.current.emit('file-create', {
                roomId,
                fileName: finalName,
                language: creationLang
            });
        } else if (type === 'rename' && fileName && fileName !== targetFile) {
            if (files[fileName]) { toast.error('File name already exists'); }
            else if (socketRef.current) { socketRef.current.emit('file-rename', { roomId, oldName: targetFile, newName: fileName }); }
        } else if (type === 'delete') {
            socketRef.current?.emit('file-delete', { roomId, fileName: targetFile });
        }
        setModalConfig({ isOpen: false });
    };




    // ── Whiteboard ────────────────────────────────────────────────────────────
    const startDrawing = ({ nativeEvent }) => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath(); ctx.moveTo(nativeEvent.offsetX, nativeEvent.offsetY);
        setIsDrawing(true);
    };
    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(nativeEvent.offsetX, nativeEvent.offsetY);
        ctx.strokeStyle = drawColor; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
    };
    const stopDrawing = () => setIsDrawing(false);
    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    // ── Terminal ──────────────────────────────────────────────────────────────
    const runTerminalCommand = (e) => {
        if (e.key === 'Enter' && terminalInput.trim()) {
            socketRef.current?.emit('terminal-command', { command: terminalInput });
            setTerminalInput('');
        }
    };

    useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalLogs]);

    if (!user) return null;

    // ── RENDER ────────────────────────────────────────────────────────────────
    return (
        <>
            <AnimatePresence>
                {modalConfig.isOpen && (
                    <div className="custom-modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="custom-modal">
                            <div className="custom-modal-header">
                                <h3>{modalConfig.type === 'create' ? 'Create New File' : modalConfig.type === 'rename' ? 'Rename File' : 'Delete File'}</h3>
                            </div>
                            <div className="custom-modal-body">
                                {modalConfig.type === 'delete' ? (
                                    <p>Delete <span className="highlight-file">{modalConfig.targetFile}</span>?</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {modalConfig.type === 'create' && (
                                            <div className="modal-field">
                                                <label>Select Language</label>
                                                <select className="premium-input modal-select" value={creationLang} onChange={(e) => setCreationLang(e.target.value)}>
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="java">Java</option>
                                                </select>
                                            </div>
                                        )}
                                        <div className="modal-field">
                                            <label>{modalConfig.type === 'create' ? 'File Name' : 'New Name'}</label>
                                            <input type="text" autoFocus defaultValue={modalConfig.defaultValue}
                                                onKeyDown={e => e.key === 'Enter' && handleModalSubmit(e.target.value)}
                                                placeholder={modalConfig.type === 'create' ? "e.g. data_processor" : "e.g. main.js"} className="premium-input modal-input" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="custom-modal-footer">
                                <button className="secondary-btn" onClick={() => setModalConfig({ isOpen: false })}>Cancel</button>
                                <button className={`primary-btn ${modalConfig.type === 'delete' ? 'danger-btn' : 'glow-btn'}`}
                                    onClick={(e) => {
                                        const modalEl = e.target.closest('.custom-modal');
                                        const input = modalEl.querySelector('input');
                                        handleModalSubmit(input ? input.value : null);
                                    }}>
                                    {modalConfig.type === 'delete' ? 'Delete' : 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* ── TOP NAVBAR (MERGED) ────────────────────────────────────────── */}
            <nav className="editor-navbar">
                <div className="navbar-left">
                    <div className="navbar-logo">
                        <span className="logo-code">CODE</span>
                        <span className="logo-bright">BRIGHT</span>
                    </div>
                </div>

                <div className="navbar-center">
                    <div className="view-selector">
                        <button className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => setViewMode('editor')}><FileCode size={14} /> IDE</button>
                        <button className={`view-btn ${viewMode === 'whiteboard' ? 'active' : ''}`} onClick={() => setViewMode('whiteboard')}><WhiteboardIcon size={14} /> Architect</button>
                    </div>
                    <div className="current-path">
                        <span>projects / {roomId?.slice(0, 8)}... /</span>
                        <span className="file-name">{viewMode === 'editor' ? (activeFile || 'No file') : 'System Architect'}</span>
                    </div>
                </div>



                <div className="navbar-right">
                    {viewMode === 'editor' && (
                        <>
                            <button className={`icon-btn terminal-toggle-btn ${!isTerminalCollapsed ? 'active' : ''}`}
                                onClick={toggleTerminal}
                                title="Toggle Terminal">
                                <TerminalIcon size={16} />
                            </button>
                            <button className={`primary-btn run-btn-small ${isRunning ? 'loading' : ''}`} onClick={runCode} disabled={isRunning || !activeFile}>
                                <Play size={14} fill="white" /> <span>{isRunning ? '...' : 'Run'}</span>
                            </button>
                        </>
                    )}
                    {viewMode === 'whiteboard' && (
                        <div className="canvas-tools">
                            <button className="tool-btn" onClick={() => setDrawColor('#fbbf24')} style={{ color: drawColor === '#fbbf24' ? '#fbbf24' : '#666' }}><PenTool size={18} /></button>
                            <button className="tool-btn" onClick={() => setDrawColor('#0d0d0d')} title="Eraser"><Eraser size={18} /></button>
                            <button className="tool-btn danger" onClick={clearCanvas}><Trash2 size={18} /></button>
                        </div>
                    )}
                </div>
            </nav>

            {/* ── MAIN LAYOUT ─────────────────────────────────────────────────── */}
            <div className="editor-layout" style={{ gridTemplateColumns: `${sidebarWidth}px ${isSidebarCollapsed ? 2 : 2}px 1fr` }}>
                <aside className="sidebar">


                    <div className="sidebar-content">
                        <div className="sidebar-section">
                            <div className="sidebar-header">
                                <span className="sidebar-title">FILES</span>
                                <button className="add-file-btn" onClick={createNewFile} title="New File">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="file-list">
                                {Object.keys(files).map(name => (
                                    <div key={name} className={`file-item ${activeFile === name ? 'active' : ''}`}
                                        onClick={() => { setActiveFile(name); setLanguage(files[name].language); }}>
                                        <div className="file-info">
                                            <span className="file-name-text">{name}</span>
                                        </div>
                                        <div className="file-actions">
                                            <button onClick={(e) => renameFile(e, name)} className="file-action-btn" title="Rename"><Edit2 size={12} /></button>
                                            <button onClick={(e) => deleteFile(e, name)} className="file-action-btn danger" title="Delete"><Trash2 size={12} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-footer">
                        <div className="collaborators-preview" onClick={() => setIsUsersDropdownOpen(!isUsersDropdownOpen)}>
                            <div className="avatar-stack">
                                {clients.slice(0, 4).map(c => {
                                    const role = c?.id === adminId ? 'admin' : (c?.permission === 'write' ? 'editor' : 'reviewer');
                                    const initial = role === 'admin' ? 'A' : (role === 'editor' ? 'E' : 'R');
                                    return (
                                        <div key={c?.id} className={`stack-avatar ${role}`} title={`${c?.username} (${role.toUpperCase()})`}>
                                            {initial}
                                            {c?.id === adminId && <div className="admin-status-dot"></div>}
                                        </div>
                                    );
                                })}
                                {clients.length > 4 && (
                                    <div className="stack-avatar extra">+{clients.length - 4}</div>
                                )}
                            </div>
                            <span className="preview-label">Collaborators</span>
                            <ChevronUp size={12} style={{ transform: isUsersDropdownOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </div>

                        <AnimatePresence>
                            {isUsersDropdownOpen && (
                                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="users-sidebar-dropdown">
                                    <div className="dropdown-header">
                                        <h3>Workspace Participants</h3>
                                        <div className="participant-count-pill">{clients.length}</div>
                                    </div>
                                    <div className="dropdown-body">
                                        {clients.map(c => (
                                            <div key={c?.id} className={`user-dropdown-item ${c?.id === adminId ? 'is-owner' : ''}`}>
                                                <div className="user-info">
                                                    <div className={`avatar ${c?.id === adminId ? 'admin' : (c?.permission === 'write' ? 'editor' : 'reviewer')}`}>
                                                        {c?.id === adminId ? 'A' : (c?.permission === 'write' ? 'E' : 'R')}
                                                        {c?.id === adminId && <div className="admin-status-dot"></div>}
                                                    </div>
                                                    <div className="user-text">
                                                        <span className={`username ${c?.id === myId ? 'me' : ''}`}>
                                                            {c?.id === myId ? 'You' : c?.username}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isAdmin && c?.id !== myId && (
                                                    <div className="admin-actions">
                                                        <button className="action-icon-btn" title="Toggle permissions"
                                                            onClick={(e) => { e.stopPropagation(); socketRef.current?.emit('update-permissions', { targetId: c.id, permission: c.permission === 'read' ? 'write' : 'read' }); }}>
                                                            <PenTool size={12} />
                                                        </button>
                                                        <button className="action-icon-btn danger" title="Remove user"
                                                            onClick={(e) => { e.stopPropagation(); socketRef.current?.emit('kick-user', { targetId: c.id }); }}>
                                                            <LogOut size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="footer-actions">
                            <button className="icon-btn invite-btn" onClick={copyInviteLink} title="Copy Invite Link">
                                <Share2 size={16} />
                            </button>
                            <button className="secondary-btn logout-btn" onClick={() => navigate('/')}>
                                <LogOut size={14} /> Leave Space
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Sidebar Resizer */}
                <div className={`resizer-x ${isSidebarCollapsed ? 'collapsed' : ''}`} onMouseDown={startSidebarResize}>
                    <button className={`collapse-toggle-btn x ${isSidebarCollapsed ? 'collapsed' : ''}`} onClick={toggleSidebar}>
                        {isSidebarCollapsed ? (
                            <>
                                <ChevronRight size={14} />
                                <span className="toggle-text">WORKSPACE</span>
                            </>
                        ) : <ChevronLeft size={10} />}
                    </button>
                </div>

                <main className="main-content" style={{ gridTemplateRows: `1fr ${isTerminalCollapsed ? 2 : 2}px ${terminalHeight}px` }}>

                    <div className="editor-container" style={{ display: viewMode === 'editor' ? 'block' : 'none', minHeight: 0, overflow: 'hidden' }}>
                        <div className="editor-wrapper">
                            {activeFile ? (
                                <Editor
                                    height="100%"
                                    language={language}
                                    theme="vs-dark"
                                    value={files[activeFile]?.content}
                                    onChange={handleCodeChange}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: true },
                                        readOnly: myPermission === 'read',
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        colorDecorators: true,
                                        quickSuggestions: true,
                                        suggestOnTriggerCharacters: true,
                                        parameterHints: { enabled: true },
                                        bracketPairColorization: { enabled: true },
                                        wordWrap: 'off',
                                    }}
                                />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                    Select a file to start coding
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="whiteboard-container" style={{ display: viewMode === 'whiteboard' ? 'flex' : 'none', minHeight: 0, overflow: 'hidden' }}>
                        <div className="whiteboard-header">
                            <div className="status-badge" style={{ background: 'rgba(251,191,36,0.05)', color: '#fbbf24' }}>
                                <Sparkles size={14} /> Collaborative Canvas Active
                            </div>
                        </div>
                        <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw}
                            onMouseUp={stopDrawing} onMouseLeave={stopDrawing} width={1200} height={800} className="main-canvas" />
                    </div>

                    {/* Terminal Resizer */}
                    <div className={`resizer-y ${isTerminalCollapsed ? 'collapsed' : ''}`} onMouseDown={startTerminalResize}>
                    </div>

                    <div className="terminal-panel">
                        <div className="terminal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="terminal-title">
                                <Sparkles size={12} style={{ marginRight: '6px' }} />
                                System Diagnostics & Output
                            </div>
                            <div style={{ fontSize: '0.6rem', opacity: 0.5, fontStyle: 'italic' }}>
                                {isRunning ? 'EXECUTION_IN_PROGRESS...' : 'AWAITING_INPUT'}
                            </div>
                        </div>
                        <pre className="terminal-body" style={{ height: '100%', overflowY: 'auto' }}>
                            {output || '> System ready. Select a target file and trigger [RUN].'}
                        </pre>
                    </div>
                </main>


            </div>
        </>
    );
};

export default EditorPage;
