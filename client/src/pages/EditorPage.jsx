import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { initSocket } from '../socket';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
    Users, FileCode, Play, LogOut, FilePlus, Terminal as TerminalIcon,
    Monitor, Link as LinkIcon, Trash2, Edit2, Shield, Sparkles,
    PenTool, Eraser, Layout as WhiteboardIcon,
    Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Share2,
    Folder, FolderPlus, Download, XOctagon, Square, Circle, Image as ImageIcon,
    Maximize2, Minimize2, MessageSquare
} from 'lucide-react';
import './EditorPage.css';
import { useAuth } from '../context/AuthContext';
import ChatPanel from '../components/ChatPanel';


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

    // ── Sidebar/Tab States ───────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState('files'); // 'files' | 'users' | 'chat'
    const [showEndModal, setShowEndModal] = useState(false);
    const [previewKey, setPreviewKey] = useState(0);

    // ── Chat States (lifted here so messages survive tab switches) ───────────
    const [chatMessages, setChatMessages] = useState([]);

    // ── Whiteboard States ────────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState('editor'); // 'editor', 'whiteboard', 'preview'
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawColor, setDrawColor] = useState('#fbbf24');
    const [architectTool, setArchitectTool] = useState('pen'); // 'pen', 'eraser', 'rect', 'circle'
    const [brushSize, setBrushSize] = useState(3);
    const [canvasSnapshot, setCanvasSnapshot] = useState(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [previewContent, setPreviewContent] = useState('');

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
    const [myPermission, setMyPermission] = useState('read');
    const isAdmin = adminId === myId;

    // ── Resizer & Modal Addition ─────────────────────────────────────────────


    // ── Resizer States ───────────────────────────────────────────────────────
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [terminalHeight, setTerminalHeight] = useState(200);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    };

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);
    const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);
    const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
    const [collapsedFolders, setCollapsedFolders] = useState(new Set());
    const [workspaceName, setWorkspaceName] = useState('Project');

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
        // Fetch workspace name
        try {
            const workspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
            const currentWS = workspaces.find(ws => ws.id === roomId);
            if (currentWS) setWorkspaceName(currentWS.name);
        } catch (e) { console.error('Error fetching workspace name', e); }

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

                // ── Chat: join room-level chat channel ────────────────────────
                const chatRoomId = `editor_${roomId}`;
                socket.emit('join-chat-room', { roomId: chatRoomId });
                socket.on('chat-history', ({ messages: history }) => {
                    setChatMessages(history);
                });
                socket.on('new-chat-message', (message) => {
                    setChatMessages(prev => [...prev, message]);
                });

                socket.on('initial-data', ({ files, users, adminId, yourId }) => {
                    if (isStopped) return;
                    setFiles(files);
                    setClients(users);
                    setAdminId(adminId);
                    setMyId(yourId);

                    // Find my own permission from the users list
                    const me = users.find(u => u.id === yourId);
                    if (me) setMyPermission(me.permission || 'read');

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
                });
                socket.on('user-status-updated', ({ targetId, permission }) =>
                    setClients(prev => prev.map(u => u.id === targetId ? { ...u, permission } : u))
                );
                socket.on('get-kicked', () => { navigate('/workspace'); });
                socket.on('code-update', ({ fileName, content }) => {
                    if (!isStopped) setFiles(prev => ({ ...prev, [fileName]: { ...prev[fileName], content } }));
                });
                socket.on('file-created', ({ fileName, language, content }) => {
                    if (!isStopped) {
                        setFiles(prev => ({ ...prev, [fileName]: { content: content || '', language } }));
                        setActiveFile(fileName);
                        setLanguage(language);
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
                socketRef.current.on('file-renamed', ({ oldName, newName }) => {
                    setFiles(prev => {
                        const next = { ...prev };
                        const fileData = next[oldName];
                        next[newName] = fileData;
                        delete next[oldName];
                        return next;
                    });
                    if (activeFile === oldName) {
                        setActiveFile(newName);
                        // Language will be synced via the files object in the editor render
                    }
                });

                socketRef.current.on('folder-deleted', ({ folderPath, deletedFiles }) => {
                    setFiles(prev => {
                        const next = { ...prev };
                        deletedFiles.forEach(f => delete next[f]);
                        return next;
                    });
                    toast.success(`Folder ${folderPath} deleted`);
                });

                socketRef.current.on('folder-renamed', ({ oldPath, newPath, renamedMap }) => {
                    setFiles(prev => {
                        const next = { ...prev };
                        Object.entries(renamedMap).forEach(([oldName, newName]) => {
                            next[newName] = next[oldName];
                            delete next[oldName];
                        });
                        return next;
                    });
                    toast.success(`Folder renamed to ${newPath}`);
                });
                socket.on('user-left', ({ id, username }) => {
                    if (!isStopped) { toast.success(`${username} left`); setClients(prev => prev.filter(c => c.id !== id)); }
                });
                socket.on('session-ended', () => {
                    if (!isStopped) navigate('/workspace');
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
        if (!activeFile || isRunning) {
            toast.error('Please select a file to run');
            return;
        }

        const currentFile = files[activeFile];
        if (!currentFile || activeFile.endsWith('/')) {
            toast.error('Invalid file selection');
            return;
        }

        // Auto-expand terminal if collapsed
        if (isTerminalCollapsed) {
            setTerminalHeight(prevTerminalHeight.current || 200);
            setIsTerminalCollapsed(false);
        }

        setIsRunning(true);
        setOutput('Running...');
        try {
            const pistonLangMap = {
                javascript: 'js',
                python: 'python3',
                cpp: 'cpp',
                java: 'java'
            };

            const lang = pistonLangMap[currentFile.language] || currentFile.language;

            // Piston doesn't support HTML/CSS execution - suggest Preview instead
            if (lang === 'html' || lang === 'css') {
                setOutput('System: HTML/CSS cannot be "executed" via terminal. Please use the [Preview] tab at the top to view your web page.');
                setIsRunning(false);
                return;
            }

            const response = await axios.post('http://localhost:5050/execute', {
                language: lang,
                files: [{ name: currentFile.language === 'java' ? 'Main.java' : activeFile.split('/').pop(), content: currentFile.content }]
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


    const generatePreview = () => {
        // Smart entry point discovery
        const allFiles = Object.entries(files);
        console.log("[Preview] Detected Files:", allFiles.map(f => f[0]));

        // 1. Try to find an index.html (case insensitive, ignoring prefix)
        let htmlFileEntry = allFiles.find(([path]) => path.toLowerCase().endsWith('index.html'));

        // 2. Fallback to any HTML file
        if (!htmlFileEntry) {
            htmlFileEntry = allFiles.find(([, f]) => f.language === 'html');
        }

        const htmlFile = htmlFileEntry ? htmlFileEntry[1] : null;

        // Find style and script files similarly
        const cssFile = allFiles.find(([path]) => path.toLowerCase().endsWith('style.css'))?.[1] ||
            allFiles.find(([, f]) => f.language === 'css')?.[1];
        const jsFile = allFiles.find(([path]) => path.toLowerCase().endsWith('script.js'))?.[1] ||
            allFiles.find(([, f]) => f.language === 'javascript' || f.language === 'javascriptreact')?.[1];

        let content = '';
        if (htmlFile) {
            content = htmlFile.content;

            // Inject Tailwind for modern utility support
            const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>';
            if (content.includes('<head>')) {
                content = content.replace('<head>', `<head>${tailwindScript}`);
            } else {
                content = tailwindScript + content;
            }

            // Inject CSS
            if (cssFile) {
                const styleTag = `<style>${cssFile.content}</style>`;
                if (content.includes('</head>')) {
                    content = content.replace('</head>', `${styleTag}</head>`);
                } else {
                    content += styleTag;
                }
            }

            // Inject JS
            if (jsFile) {
                const scriptTag = `<script>${jsFile.content}</script>`;
                if (content.includes('</body>')) {
                    content = content.replace('</body>', `${scriptTag}</body>`);
                } else {
                    content += scriptTag;
                }
            }
        } else {
            // High-end fallback for workspaces without an HTML entry point
            content = `
                <html>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap');
                            body { 
                                background: #0a0a0a; 
                                color: white; 
                                font-family: 'Outfit', sans-serif; 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                height: 100vh; 
                                margin: 0;
                                overflow: hidden;
                            }
                            .card {
                                background: rgba(255, 255, 255, 0.03);
                                backdrop-filter: blur(20px);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                padding: 50px;
                                border-radius: 30px;
                                text-align: center;
                                max-width: 400px;
                                animation: fadeIn 0.8s ease-out;
                            }
                            @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                            h2 { color: #ef4444; margin-bottom: 10px; font-weight: 700; }
                            p { color: #94a3b8; line-height: 1.6; font-size: 0.95rem; }
                            .code-hint { background: #1a1a1a; padding: 10px; border-radius: 10px; font-family: monospace; color: #ef4444; margin-top: 20px; font-size: 0.8rem; }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <h2>No HTML Entry Detected</h2>
                            <p>To use the live preview, please create or select an <b>index.html</b> file in your workspace.</p>
                            <div class="code-hint">Workspace Path: ${workspaceName}/index.html</div>
                        </div>
                    </body>
                </html>
            `;
        }
        return content;
    };



    const toggleFolder = (folderPath) => {
        setCollapsedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderPath)) next.delete(folderPath);
            else next.add(folderPath);
            return next;
        });
    };

    const createNewFile = () => setModalConfig({ isOpen: true, type: 'create', targetFile: '', defaultValue: '' });
    const createNewFolder = () => setModalConfig({ isOpen: true, type: 'create', targetFile: '', defaultValue: 'folder_name' });

    const copyInviteLink = async () => {
        try { await navigator.clipboard.writeText(window.location.href); toast.success('Invite link copied!'); }
        catch { toast.error('Failed to copy link'); }
    };

    const deleteFile = (e, fileName) => {
        e.stopPropagation();
        if (Object.keys(files).length === 1) { toast.error('Cannot delete the last remaining file'); return; }
        setModalConfig({ isOpen: true, type: 'delete', targetFile: fileName, defaultValue: '' });
    };

    const deleteFolder = (e, folderPath) => {
        e.stopPropagation();
        setModalConfig({ isOpen: true, type: 'deleteFolder', targetFile: folderPath, defaultValue: '' });
    };

    const renameFile = (e, oldName) => {
        e.stopPropagation();
        setModalConfig({ isOpen: true, type: 'rename', targetFile: oldName, defaultValue: oldName });
    };

    const renameFolder = (e, oldPath) => {
        e.stopPropagation();
        setModalConfig({ isOpen: true, type: 'renameFolder', targetFile: oldPath, defaultValue: oldPath });
    };

    const createInFolder = (e, folderPath, isFolder = false) => {
        e.stopPropagation();
        // folderPath is absolute (e.g. "Near/src"). 
        // We want to keep it as is, but handle the relative creation.
        const defaultValue = isFolder ? 'folder_name' : '';
        setModalConfig({
            isOpen: true,
            type: 'create',
            targetFile: folderPath, // Store the parent folder here
            defaultValue: defaultValue
        });
    };



    const downloadProject = async () => {
        const zip = new JSZip();
        const projectRoot = zip.folder(workspaceName);

        Object.entries(files).forEach(([path, file]) => {
            // path is e.g. "Near/src/index.js"
            // We want to remove the root prefix if we are already in the root folder zip
            const parts = path.split('/');
            if (parts[0].toLowerCase() === workspaceName.toLowerCase()) {
                parts.shift();
            }
            projectRoot.file(parts.join('/'), file.content || '');
        });

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${workspaceName}.zip`);
        toast.success('Project download started!');
    };

    const downloadFolder = async (e, folderPath) => {
        e.stopPropagation();
        const zip = new JSZip();
        const folderName = folderPath.split('/').pop();
        const subZip = zip.folder(folderName);

        const folderPrefix = folderPath.endsWith('/') ? folderPath : folderPath + '/';

        Object.entries(files).forEach(([path, file]) => {
            if (path.startsWith(folderPrefix)) {
                const relativePath = path.substring(folderPrefix.length);
                if (relativePath) {
                    subZip.file(relativePath, file.content || '');
                }
            }
        });

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${folderName}.zip`);
        toast.success(`Folder ${folderName} download started!`);
    };

    const endSession = () => {
        setShowEndModal(true);
    };

    const confirmEndSession = () => {
        setShowEndModal(false);
        if (socketRef.current) {
            socketRef.current.emit('end-session', { roomId });
        }
        navigate('/workspace');
    };

    const leaveWorkspace = () => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: 'Leave Workspace?',
            message: 'Are you sure you want to leave this workspace? You can always resume later if the session is still active.',
            onConfirm: () => {
                if (socketRef.current) socketRef.current.disconnect();
                navigate('/workspace');
            }
        });
    };


    const handleModalSubmit = (fileName) => {


        if (modalConfig.onConfirm) {
            modalConfig.onConfirm(fileName);
            setModalConfig({ isOpen: false });
            return;
        }

        const { type, targetFile } = modalConfig;

        if (type === 'create' && fileName && socketRef.current) {
            if (!fileName || fileName.trim() === '') return;

            let finalName = fileName.trim();

            // Build the absolute path
            // targetFile is the parent folder (e.g. "Near/src" or "" for root)
            let fullPath = '';
            if (targetFile) {
                fullPath = targetFile + '/' + finalName;
            } else {
                // If no targetFile, it's the workspace root
                fullPath = workspaceName + '/' + finalName;
            }

            // If it was meant to be a folder (no extension or ended with slash)
            if (!fullPath.split('/').pop().includes('.') || finalName.endsWith('/')) {
                if (!fullPath.endsWith('/')) fullPath += '/';
                // No more README.md! Just the folder path itself.
            }


            // Cleanup: ensure it starts with workspaceName exactly once (case-insensitive check)
            const lowerWorkspace = workspaceName.toLowerCase();
            const lowerFullPath = fullPath.toLowerCase();

            if (lowerFullPath.startsWith(lowerWorkspace + '/')) {
                // Keep original workspace name casing for the root, but the rest as typed
                fullPath = workspaceName + fullPath.substring(workspaceName.length);
            } else {
                fullPath = workspaceName + '/' + fullPath;
            }

            // Prevent double slashes and normalize
            fullPath = fullPath.replace(/\/+/g, '/');


            // Extension to Language Map
            const extToLang = {
                js: 'javascript',
                jsx: 'javascriptreact',
                ts: 'typescript',
                tsx: 'typescriptreact',
                html: 'html',
                css: 'css',
                scss: 'scss',
                py: 'python',
                cpp: 'cpp',
                cc: 'cpp',
                c: 'c',
                h: 'cpp',
                java: 'java',
                rs: 'rust',
                go: 'go',
                rb: 'ruby',
                php: 'php',
                swift: 'swift',
                kt: 'kotlin',
                sh: 'shell',
                sql: 'sql',
                yaml: 'yaml',
                yml: 'yaml',
                xml: 'xml',
                json: 'json',
                md: 'markdown',
                txt: 'plaintext'
            };

            const parts = fullPath.split('.');
            const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
            const detectedLang = extToLang[ext] || (fullPath.endsWith('.md') ? 'markdown' : 'plaintext');

            if (files[fullPath]) {
                toast.error('File name already exists');
                return;
            }

            socketRef.current.emit('file-create', {
                roomId,
                fileName: fullPath,
                language: detectedLang
            });

        } else if (type === 'rename' && fileName && fileName !== targetFile) {
            if (files[fileName]) { toast.error('File name already exists'); }
            else if (socketRef.current) { socketRef.current.emit('file-rename', { roomId, oldName: targetFile, newName: fileName }); }
        } else if (type === 'renameFolder' && fileName && fileName !== targetFile) {
            socketRef.current?.emit('folder-rename', { roomId, oldPath: targetFile, newPath: fileName });
        } else if (type === 'delete') {
            socketRef.current?.emit('file-delete', { roomId, fileName: targetFile });
        } else if (type === 'deleteFolder') {
            socketRef.current?.emit('folder-delete', { roomId, folderPath: targetFile });
        }
        setModalConfig({ isOpen: false });
    };







    // ── Whiteboard ────────────────────────────────────────────────────────────
    const getCoordinates = (nativeEvent) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (nativeEvent.clientX - rect.left) * scaleX,
            y: (nativeEvent.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = ({ nativeEvent }) => {
        const { x, y } = getCoordinates(nativeEvent);
        const ctx = canvasRef.current.getContext('2d');

        // Save snapshot for shapes preview
        setCanvasSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
        setStartPos({ x, y });

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { x, y } = getCoordinates(nativeEvent);
        const ctx = canvasRef.current.getContext('2d');

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (architectTool === 'pen' || architectTool === 'eraser') {
            ctx.strokeStyle = architectTool === 'eraser' ? '#0d0d0d' : drawColor;
            ctx.lineTo(x, y);
            ctx.stroke();
        } else {
            // Shapes: Restore snapshot before drawing current preview
            if (canvasSnapshot) {
                ctx.putImageData(canvasSnapshot, 0, 0);
            }
            ctx.strokeStyle = drawColor;
            ctx.beginPath();

            if (architectTool === 'rect') {
                ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
            } else if (architectTool === 'circle') {
                const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
                ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    };


    const stopDrawing = () => setIsDrawing(false);

    const downloadCanvas = () => {
        const link = document.createElement('a');
        link.download = `architect-blueprint-${roomId.slice(0, 8)}.png`;
        link.href = canvasRef.current.toDataURL();
        link.click();
        toast.success('Blueprint exported as PNG!');
    };

    const clearCanvas = () => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title: 'Clear Blueprint?',
            message: 'This will erase everything on the current architectural canvas.',
            onConfirm: () => {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        });
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
            {/* ── END SESSION MODAL ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {showEndModal && (
                    <motion.div
                        className="end-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEndModal(false)}
                    >
                        <motion.div
                            className="end-modal"
                            initial={{ opacity: 0, scale: 0.85, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="end-modal-icon-wrap">
                                <XOctagon size={40} />
                            </div>
                            <h2 className="end-modal-title">End Session?</h2>
                            <p className="end-modal-desc">
                                This will <strong>permanently terminate</strong> this workspace
                                and disconnect all collaborators in real-time.
                            </p>
                            <p className="end-modal-warning">⚠ This action cannot be undone.</p>
                            <div className="end-modal-actions">
                                <button className="end-modal-cancel" onClick={() => setShowEndModal(false)}>
                                    Cancel
                                </button>
                                <button className="end-modal-confirm" onClick={confirmEndSession}>
                                    <XOctagon size={14} /> End Session
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalConfig.isOpen && (
                    <div className="custom-modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`custom-modal ${modalConfig.type === 'delete' || modalConfig.type === 'confirm' ? 'danger' : ''}`}>
                            <div className="custom-modal-header">
                                <h3>{modalConfig.title || (modalConfig.type === 'create' ? 'Create New File' : modalConfig.type === 'rename' ? 'Rename File' : 'Confirm Action')}</h3>
                            </div>
                            <div className="custom-modal-body">
                                {modalConfig.message ? (
                                    <p className="modal-message">{modalConfig.message}</p>
                                ) : modalConfig.type === 'delete' || modalConfig.type === 'deleteFolder' ? (
                                    <p>Delete <span className="highlight-file">{modalConfig.targetFile}</span> permanently?</p>
                                ) : (

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <div className="modal-field">
                                            <label>{modalConfig.type === 'create' ? 'File Name (e.g. main.js)' : 'New Name'}</label>
                                            <div className="modal-input-wrapper">
                                                <input type="text" autoFocus defaultValue={modalConfig.defaultValue}
                                                    onKeyDown={e => e.key === 'Enter' && handleModalSubmit(e.target.value)}
                                                    placeholder={modalConfig.type === 'create' ? "e.g. index.html" : "e.g. main.js"} className="premium-input modal-input" />
                                                {modalConfig.type === 'create' && (
                                                    <div className="modal-input-context">
                                                        Creating in: <span>{modalConfig.targetFile || workspaceName}/</span>
                                                    </div>
                                                )}
                                            </div>
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
                        <button className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => { setViewMode('preview'); setTerminalHeight(0); setIsTerminalCollapsed(true); setPreviewKey(k => k + 1); }}><Monitor size={14} /> Preview</button>
                        <button className={`view-btn ${viewMode === 'whiteboard' ? 'active' : ''}`} onClick={() => { setViewMode('whiteboard'); setTerminalHeight(0); setIsTerminalCollapsed(true); }}><WhiteboardIcon size={14} /> Architect</button>

                    </div>
                </div>



                <div className="navbar-right">
                    <button
                        className="icon-btn fullscreen-btn"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                    >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    {viewMode === 'editor' && (
                        <>
                            <button className={`icon-btn terminal-toggle-btn ${!isTerminalCollapsed ? 'active' : ''}`}
                                onClick={toggleTerminal}
                                title="Toggle Terminal">
                                <TerminalIcon size={16} />
                            </button>
                            <button className="nav-export-btn" onClick={downloadProject} title="Download Full Project">
                                <Download size={14} /> <span>Export</span>
                            </button>
                            <button
                                className={`nav-run-btn ${isRunning ? 'loading' : ''}`}
                                onClick={runCode}
                                disabled={isRunning || !activeFile}
                                title="Run Code"
                            >
                                {isRunning ? <div className="btn-loader"></div> : <Play size={14} fill="currentColor" />}
                                <span>{isRunning ? 'Running...' : 'Run'}</span>
                            </button>
                        </>
                    )}
                    {viewMode === 'preview' && (
                        <button className="nav-export-btn" onClick={() => setPreviewKey(k => k + 1)} title="Refresh Preview">
                            <Monitor size={14} /> <span>Refresh</span>
                        </button>
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
                        {activeTab === 'files' ? (
                            <div className="sidebar-section">
                                <div className="sidebar-header nav-header">
                                    <span className="sidebar-title centered-title">PROJECT</span>
                                    <button className="tab-switch-btn right-btn" onClick={() => setActiveTab('users')} title="View Participants">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="file-list">
                                    {(() => {
                                        const buildTree = (files) => {
                                            const tree = {};
                                            const lowerPrefix = workspaceName.toLowerCase() + '/';

                                            Object.keys(files).forEach(path => {
                                                // Strip workspace name prefix for rendering if it exists
                                                let displayPath = path;
                                                if (path.toLowerCase().startsWith(lowerPrefix)) {
                                                    displayPath = path.substring(lowerPrefix.length);
                                                }

                                                const parts = displayPath.split('/');
                                                let current = tree;

                                                // Handle empty folders (paths ending in /)
                                                const isVirtualFolder = path.endsWith('/');

                                                parts.forEach((part, i) => {
                                                    if (!part) return;

                                                    if (i === parts.length - 1) {
                                                        if (isVirtualFolder) {
                                                            if (!current[part]) current[part] = {};
                                                        } else {
                                                            // This is a file
                                                            if (current[part] && !current[part]._isFile) {
                                                                current[part]._isFile = true;
                                                                current[part].path = path;
                                                            } else {
                                                                current[part] = { _isFile: true, path };
                                                            }
                                                        }
                                                    } else {
                                                        if (!current[part]) current[part] = {};
                                                        current = current[part];
                                                    }
                                                });
                                            });
                                            return tree;
                                        };


                                        const renderTree = (node, name = '', level = 0, currentPath = '') => {
                                            const fullPath = currentPath ? `${currentPath}/${name}` : name;
                                            const isFolder = !node._isFile;
                                            const isCollapsed = collapsedFolders.has(fullPath);

                                            if (isFolder) {
                                                if (!name) {
                                                    // Handle root nodes (should only happen if we have multiple roots)
                                                    return Object.entries(node).sort(([a], [b]) => {
                                                        const aIsFolder = !node[a]._isFile;
                                                        const bIsFolder = !node[b]._isFile;
                                                        if (aIsFolder && !bIsFolder) return -1;
                                                        if (!aIsFolder && bIsFolder) return 1;
                                                        return a.localeCompare(b);
                                                    }).map(([childName, childNode]) => renderTree(childNode, childName, level, ''));
                                                }

                                                const isWorkspaceRoot = name === workspaceName && level === 0;
                                                return (
                                                    <div key={fullPath} className="folder-group">
                                                        <div className={`file-item folder ${isCollapsed ? 'collapsed' : ''} ${isWorkspaceRoot ? 'is-workspace-root' : ''}`}
                                                            style={{ paddingLeft: `${level * 12 + 12}px` }}
                                                            onClick={() => toggleFolder(fullPath)}>
                                                            <div className="file-info">
                                                                <ChevronDown size={12} className="folder-chevron" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none' }} />
                                                                <Folder size={14} className="folder-icon" />
                                                                <span className="file-name-text" style={isWorkspaceRoot ? { textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' } : {}}>{name}</span>
                                                            </div>
                                                            <div className="file-actions folder-actions">
                                                                <button onClick={(e) => createInFolder(e, isWorkspaceRoot ? '' : fullPath, false)} className="file-action-btn" title="New File"><Plus size={12} /></button>
                                                                <button onClick={(e) => createInFolder(e, isWorkspaceRoot ? '' : fullPath, true)} className="file-action-btn" title="New Folder"><FolderPlus size={12} /></button>
                                                                <button onClick={(e) => downloadFolder(e, fullPath)} className="file-action-btn" title="Download ZIP"><Download size={12} /></button>
                                                                {!isWorkspaceRoot && (
                                                                    <>
                                                                        <button onClick={(e) => renameFolder(e, fullPath)} className="file-action-btn" title="Rename"><Edit2 size={12} /></button>
                                                                        <button onClick={(e) => deleteFolder(e, fullPath)} className="file-action-btn danger" title="Delete"><Trash2 size={12} /></button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!isCollapsed && (
                                                            <div className="folder-children">
                                                                {Object.entries(node).sort(([a], [b]) => {
                                                                    const aIsFolder = !node[a]._isFile;
                                                                    const bIsFolder = !node[b]._isFile;
                                                                    if (aIsFolder && !bIsFolder) return -1;
                                                                    if (!aIsFolder && bIsFolder) return 1;
                                                                    return a.localeCompare(b);
                                                                }).map(([childName, childNode]) => renderTree(childNode, childName, level + 1, fullPath))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            } else if (node._isFile) {
                                                const fileName = name;
                                                const filePath = node.path;
                                                return (
                                                    <div key={filePath} className={`file-item ${activeFile === filePath ? 'active' : ''}`}
                                                        style={{ paddingLeft: `${level * 12 + 12}px` }}
                                                        onClick={() => { setActiveFile(filePath); setLanguage(files[filePath].language); }}>
                                                        <div className="file-info">
                                                            <FileCode size={14} className="file-icon" />
                                                            <span className="file-name-text">{fileName}</span>
                                                        </div>
                                                        <div className="file-actions">
                                                            <button onClick={(e) => renameFile(e, filePath)} className="file-action-btn" title="Rename"><Edit2 size={12} /></button>
                                                            <button onClick={(e) => deleteFile(e, filePath)} className="file-action-btn danger" title="Delete"><Trash2 size={12} /></button>
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                // Root node
                                                return Object.entries(node).sort(([a], [b]) => {
                                                    const aIsFolder = !node[a]._isFile;
                                                    const bIsFolder = !node[b]._isFile;
                                                    if (aIsFolder && !bIsFolder) return -1;
                                                    if (!aIsFolder && bIsFolder) return 1;
                                                    return a.localeCompare(b);
                                                }).map(([childName, childNode]) => renderTree(childNode, childName, level, ''));
                                            }
                                        };

                                        return renderTree(buildTree(files), workspaceName);
                                    })()}
                                </div>
                            </div>
                        ) : activeTab === 'users' ? (
                            <div className="sidebar-section">
                                <div className="sidebar-header nav-header">
                                    <button className="tab-switch-btn left-btn" onClick={() => setActiveTab('files')} title="Back to Project">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="sidebar-title centered-title">PARTICIPANTS</span>
                                    <button className="tab-switch-btn right-btn" onClick={() => setActiveTab('chat')} title="Open Chat">
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="dropdown-body participants-tab-body">
                                    {clients.map(c => (
                                        <div key={c?.id} className={`user-dropdown-item ${c?.id === adminId ? 'is-owner' : ''}`}>
                                            <div className="user-info">
                                                <div className={`avatar ${c?.id === adminId ? 'admin' : (c?.permission === 'write' ? 'writer' : 'viewer')}`}>
                                                    {c?.id === adminId ? 'A' : (c?.permission === 'write' ? 'W' : 'V')}
                                                    {c?.id === adminId && <div className="admin-status-dot"></div>}
                                                </div>
                                                <div className="user-text">
                                                    <span className={`username ${c?.id === myId ? 'me' : ''}`}>
                                                        {c?.id === myId ? 'You' : c?.username}
                                                    </span>
                                                    <span className="user-role-label">
                                                        {c?.id === adminId ? 'Admin' : (c?.permission === 'write' ? 'Writer' : 'Viewer')}
                                                    </span>
                                                </div>
                                            </div>
                                            {isAdmin && c?.id !== myId && (
                                                <div className="admin-actions">
                                                    <button className="action-icon-btn" title="Toggle permissions"
                                                        onClick={(e) => { e.stopPropagation(); socketRef.current?.emit('update-permissions', { targetId: c.id, permission: c.permission === 'read' ? 'write' : 'read' }); }}>
                                                        <PenTool size={12} />
                                                    </button>
                                                    <button className="action-icon-btn danger" title="Kick user"
                                                        onClick={(e) => { e.stopPropagation(); socketRef.current?.emit('kick-user', { targetId: c.id }); }}>
                                                        <XOctagon size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : activeTab === 'chat' ? (
                            <div className="sidebar-section sidebar-chat-section">
                                <div className="sidebar-header nav-header">
                                    <button className="tab-switch-btn left-btn" onClick={() => setActiveTab('users')} title="Back to Participants">
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="sidebar-title centered-title"><MessageSquare size={13} style={{verticalAlign:'middle', marginRight:4}} />CHAT</span>
                                </div>
                                <div className="sidebar-chat-body">
                                    <ChatPanel
                                        socket={socketRef.current}
                                        roomId={`editor_${roomId}`}
                                        user={user}
                                        title={`${workspaceName} Chat`}
                                        messages={chatMessages}
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="sidebar-footer">
                        <div className="footer-actions">
                            <button className="icon-btn invite-btn" onClick={copyInviteLink} title="Copy Invite Link">
                                <Share2 size={16} />
                            </button>
                            <div className="footer-btns">
                                <button className="secondary-btn leave-btn" onClick={leaveWorkspace} title="Leave without ending">
                                    <LogOut size={14} /> Leave
                                </button>
                                {isAdmin && (
                                    <button className="primary-btn end-btn" onClick={endSession} title="Terminate Project for everyone">
                                        <XOctagon size={14} /> End
                                    </button>
                                )}
                            </div>
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

                    {/* ── CONTENT AREA (Row 1) ────────────────────────────────── */}
                    <div className="editor-container" style={{ display: viewMode === 'editor' ? 'block' : 'none', minHeight: 0, overflow: 'hidden' }}>
                        <div className="editor-wrapper">
                            {activeFile ? (
                                <Editor
                                    height="100%"
                                    language={files[activeFile]?.language || 'plaintext'}
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
                        <div className="whiteboard-toolbar">
                            <div className="tool-group">
                                <button className={`white-tool-btn ${architectTool === 'pen' ? 'active' : ''}`} onClick={() => setArchitectTool('pen')} title="Pen Tool"><PenTool size={16} /></button>
                                <button className={`white-tool-btn ${architectTool === 'eraser' ? 'active' : ''}`} onClick={() => setArchitectTool('eraser')} title="Eraser Tool"><Eraser size={16} /></button>
                                <button className={`white-tool-btn ${architectTool === 'rect' ? 'active' : ''}`} onClick={() => setArchitectTool('rect')} title="Rectangle"><Square size={16} /></button>
                                <button className={`white-tool-btn ${architectTool === 'circle' ? 'active' : ''}`} onClick={() => setArchitectTool('circle')} title="Circle"><Circle size={16} /></button>
                            </div>
                            <div className="tool-divider"></div>
                            <div className="tool-group">
                                <div className="color-presets">
                                    {['#ef4444', '#3b82f6', '#10b981', '#fbbf24', '#ffffff'].map(color => (
                                        <button key={color} className={`color-dot ${drawColor === color ? 'active' : ''}`}
                                            style={{ backgroundColor: color }} onClick={() => setDrawColor(color)} />
                                    ))}
                                </div>
                                <div className="color-picker-wrap" title="Custom Color">
                                    <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} className="canvas-color-input" />
                                </div>
                                <div className="size-slider-wrap">
                                    <span style={{ fontSize: '0.6rem', color: 'var(--workspace-text-muted)', width: '25px' }}>{brushSize}px</span>
                                    <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="brush-slider" />
                                </div>
                            </div>
                            <div className="tool-divider"></div>
                            <div className="tool-group">
                                <button className="white-tool-btn" onClick={downloadCanvas} title="Export as PNG"><ImageIcon size={16} /></button>
                                <button className="white-tool-btn danger" onClick={clearCanvas} title="Clear Canvas"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw}
                            onMouseUp={stopDrawing} onMouseLeave={stopDrawing} width={1600} height={1000} className="main-canvas" />
                    </div>

                    <div className="preview-container" style={{ display: viewMode === 'preview' ? 'flex' : 'none', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
                        <iframe
                            key={previewKey}
                            title="Live Preview"
                            srcDoc={generatePreview()}
                            style={{ width: '100%', flex: 1, border: 'none', background: '#fff' }}
                            sandbox="allow-scripts allow-modals allow-same-origin"
                        />
                    </div>

                    {/* ── TERMINAL AREA (Row 2 & 3) ─────────────────────────────── */}
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

