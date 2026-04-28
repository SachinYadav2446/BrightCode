import React, { useState, useEffect, useRef } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { initSocket } from '../socket';

import toast from 'react-hot-toast';

import Editor from '@monaco-editor/react';

import { motion, AnimatePresence } from 'framer-motion';

import {

    Users, FileCode, Play, LogOut, FilePlus, Terminal as TerminalIcon,

    Monitor, Link as LinkIcon, Trash2, Edit2, Sparkles, Brain, Bot, Send,

    PenTool, Eraser, Layout as WhiteboardIcon, Zap, Shield, Languages,

    Mic, MicOff, Video, VideoOff, PhoneOff, Phone, Plus,

    ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Share2

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

    const [snapshots, setSnapshots] = useState([]);



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



    // ── AI Sentinel States ───────────────────────────────────────────────────

    const [isSidekickOpen, setIsSidekickOpen] = useState(false);

    const [aiMessages, setAiMessages] = useState([

        { role: 'ai', content: "Hello! I am your AI Sentinel. How can I assist you with your code today?" }

    ]);

    const [isAiThinking, setIsAiThinking] = useState(false);

    const [aiInput, setAiInput] = useState('');



    // ── Resizer & Modal Addition ─────────────────────────────────────────────

    const [creationLang, setCreationLang] = useState('javascript');



    // ── FEATURE 1: Hologram Comms (WebRTC) ───────────────────────────────────

    const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);

    const [isCallActive, setIsCallActive] = useState(false);

    const [isMuted, setIsMuted] = useState(false);

    const [isVideoOn, setIsVideoOn] = useState(false);

    const localVideoRef = useRef(null);

    const remoteVideoRef = useRef(null);

    const localStreamRef = useRef(null);

    const peerConnectionRef = useRef(null);



    // ── Resizer States ───────────────────────────────────────────────────────

    const [sidebarWidth, setSidebarWidth] = useState(280);

    const [terminalHeight, setTerminalHeight] = useState(200);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);



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
        if (e && e.stopPropagation) e.stopPropagation();
        if (isTerminalCollapsed) {
            // Ensure height is at least 200px if prev was too small
            const newHeight = Math.max(prevTerminalHeight.current, 200);
            setTerminalHeight(newHeight);
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





    // ── FEATURE 4: AI Translator ──────────────────────────────────────────────

    const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);

    const [translateTarget, setTranslateTarget] = useState('python');

    const [translatedCode, setTranslatedCode] = useState('');

    const [isTranslating, setIsTranslating] = useState(false);



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



                socket.on('initial-data', ({ files, users, adminId, yourId, snapshots }) => {

                    if (isStopped) return;

                    setFiles(files);

                    setClients(users);

                    setAdminId(adminId);

                    setMyId(yourId);

                    setSnapshots(snapshots || []);

                    const fileNames = Object.keys(files);

                    if (fileNames.length > 0) {

                        setActiveFile(fileNames[0]);

                        setLanguage(files[fileNames[0]].language);

                    }

                });



                // Warp Drive

                socket.on('snapshot-captured', (snapshot) => {

                    setSnapshots(prev => [snapshot, ...prev]);

                    toast.success(`Temporal Link Established: ${snapshot.name}`);

                });

                socket.on('files-warped', ({ files, warpedBy, snapshotName }) => {

                    setFiles(files);

                    toast(`WARP DETECTED: ${warpedBy} shifted to [${snapshotName}]`, {

                        icon: '🌀', style: { background: '#6366f1', color: 'white' }

                    });

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



                // ── WebRTC Signaling ─────────────────────────────────────────

                socket.on('webrtc-offer', async ({ offer, from }) => handleIncomingCall(offer, from));

                socket.on('webrtc-answer', async ({ answer }) => {

                    if (peerConnectionRef.current) {

                        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));

                    }

                });

                socket.on('webrtc-ice-candidate', async ({ candidate }) => {

                    if (peerConnectionRef.current && candidate) {

                        try { await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate)); } catch { }

                    }

                });

                socket.on('call-ended', () => { endCall(); toast('Call ended by peer', { icon: '📵' }); });



            } catch (err) {

                console.error('Socket init error:', err);

                toast.error('Failed to initialize workspace');

            }

        };



        if (user) init();



        return () => {

            isStopped = true;

            if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }

            endCall();

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



            const response = await axios.post('http://localhost:5051/execute', {

                language: lang,

                files: [{ name: currentFile.language === 'java' ? 'Main.java' : activeFile, content: currentFile.content }]

            });

            const runInfo = response.data.run;

            setOutput(runInfo.stdout || runInfo.stderr || 'Success (No output)');

            if (!runInfo.stderr && (runInfo.stdout || runInfo.code === 0)) {

                try {

                    const token = localStorage.getItem('token');

                    const xpAmount = 10;

                    const xpRes = await axios.post('http://localhost:5051/add-xp', { amount: xpAmount },

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



    // ── AI Sentinel ──────────────────────────────────────────────────────────

    const sendMessageToAi = async () => { // BUG FIX: was handleAiSubmit, now properly named

        if (!aiInput.trim()) return;

        const userMsg = { role: 'user', content: aiInput };

        const inputCopy = aiInput;

        setAiMessages(prev => [...prev, userMsg]);

        setAiInput('');

        setIsAiThinking(true);

        try {

            const input = inputCopy.toLowerCase();

            setTimeout(() => {

                let response = '';

                if (input.includes('optimize')) {

                    response = "### ⚡ Optimization Protocol\nAnalysis complete. Recommend `.map()`/`.filter()` over explicit loops for ~15% better allocation. Consider `useMemo` for expensive computations.";

                } else if (input.includes('explain')) {

                    response = `### 🔍 Code Breakdown\nIn **${activeFile}**, the logic initializes a reactive state loop creating a data sink for incoming signals from the Code Sight server via WebSocket channels.`;

                } else if (input.includes('generate') || input.includes('create')) {

                    response = "### 🛠️ Boilerplate Generated\n```javascript\nconst handler = async (req, res) => {\n  try {\n    const data = await processRequest(req.body);\n    res.json({ success: true, data });\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n};\n```";

                } else if (input.includes('bug') || input.includes('fix')) {

                    response = "### 🐛 Diagnostic Mode\nActivate the **Watchdog** (Shield icon in toolbar) for a full security scan. Common issues: unhandled promise chains, missing null-checks, type coercion with `==`.";

                } else {

                    response = `Sentinel standby. Currently monitoring **${activeFile || 'workspace'}**. The architecture looks stable. How shall we proceed?`;

                }

                setAiMessages(prev => [...prev, { role: 'ai', content: response }]);

                setIsAiThinking(false);

            }, 1000);

        } catch {

            setIsAiThinking(false);

            toast.error("Sentinel Offline.");

        }

    };





    // ── FEATURE 4: AI Translator ──────────────────────────────────────────────

    const translateCode = async () => {

        if (!activeFile || isTranslating) return;

        setIsTranslating(true);

        setTranslatedCode('');

        const sourceCode = files[activeFile]?.content || '';

        await new Promise(r => setTimeout(r, 1500));

        const sanitized = sourceCode

            .split('\n').join('\n    ')

            .replace(/const |let |var /g, '')

            .replace(/;/g, '')

            .replace(/\/\//g, '#')

            .replace(/console\.log/g, 'print');

        const translations = {

            python: `# AI Sentinel — Translated to Python\n# Source: ${activeFile}\n\ndef main():\n    ${sanitized}\n\nif __name__ == '__main__':\n    main()`,

            rust: `// AI Sentinel — Translated to Rust\n// Source: ${activeFile}\n\nfn main() {\n    println!("Code Sight — Rust port");\n    // Note: Rust requires explicit type annotations\n    // Manual port recommended for production use\n}`,

            go: `// AI Sentinel — Translated to Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Code Sight — Go port")\n    // Note: Go requires explicit type declarations\n}`,

            java: `// AI Sentinel — Translated to Java\n// Source: ${activeFile}\n\npublic class Translated {\n    public static void main(String[] args) {\n        System.out.println("Code Sight — Java port");\n    }\n}`,

        };

        setTranslatedCode(translations[translateTarget] || '// Translation not available for this target language.');

        setIsTranslating(false);

        toast.success(`Code translated to ${translateTarget}!`);

    };



    // ── FEATURE 1: WebRTC Hologram Comms ─────────────────────────────────────

    const createPeerConnection = (targetId) => {

        const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

        peerConnectionRef.current = pc;

        pc.onicecandidate = (event) => {

            if (event.candidate && socketRef.current) {

                socketRef.current.emit('webrtc-ice-candidate', { roomId, candidate: event.candidate, targetId });

            }

        };

        pc.ontrack = (event) => {

            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];

        };

        return pc;

    };



    const startCall = async () => {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoOn });

            localStreamRef.current = stream;

            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const target = clients.find(c => c.id !== myId);

            if (!target) { toast.error('No other collaborator in room to call.'); stream.getTracks().forEach(t => t.stop()); return; }

            const pc = createPeerConnection(target.id);

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();

            await pc.setLocalDescription(offer);

            socketRef.current.emit('webrtc-offer', { roomId, offer, targetId: target.id });

            setIsCallActive(true);

            toast.success('Hologram Comms initiated...', { style: { background: '#1c1917', color: '#34d399' } });

        } catch (err) {

            toast.error('Microphone/Camera access denied: ' + err.message);

        }

    };



    const handleIncomingCall = async (offer, from) => {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoOn });

            localStreamRef.current = stream;

            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const pc = createPeerConnection(from);

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            const answer = await pc.createAnswer();

            await pc.setLocalDescription(answer);

            socketRef.current.emit('webrtc-answer', { roomId, answer, targetId: from });

            setIsCallActive(true);

            setIsVoiceChatOpen(true);

            toast(`Incoming Hologram Comms — connection established`, { icon: '📡' });

        } catch { }

    };



    const endCall = () => {

        if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }

        if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }

        setIsCallActive(false);

        socketRef.current?.emit('end-call', { roomId });

    };



    const toggleMute = () => {

        if (localStreamRef.current) {

            localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = isMuted; });

            setIsMuted(prev => !prev);

        }

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



            {/* ── HOLOGRAM COMMS PiP ──────────────────────────────────────────── */}

            <AnimatePresence>

                {isVoiceChatOpen && (

                    <motion.div initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }} className="hologram-pip">

                        <div className="hologram-header">

                            <div className="hologram-title"><span className="hologram-dot"></span> Hologram Comms</div>

                            <button className="icon-btn" onClick={() => setIsVoiceChatOpen(false)}><Plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>

                        </div>

                        <div className="hologram-video-area">

                            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />

                            <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />

                            {!isCallActive && (

                                <div className="hologram-idle">

                                    <div className="idle-ring"></div>

                                    <span>No active connection</span>

                                </div>

                            )}

                        </div>

                        <div className="hologram-controls">

                            {isCallActive ? (

                                <>

                                    <button className={`holo-btn ${isMuted ? 'danger' : ''}`} onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>

                                        {isMuted ? <MicOff size={16} /> : <Mic size={16} />}

                                    </button>

                                    <button className="holo-btn call-end" onClick={endCall} title="End Call">

                                        <PhoneOff size={16} />

                                    </button>

                                    <button className={`holo-btn ${isVideoOn ? 'active-green' : ''}`} onClick={() => setIsVideoOn(v => !v)} title="Toggle Video">

                                        {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}

                                    </button>

                                </>

                            ) : (

                                <button className="holo-btn holo-primary full-width" onClick={startCall}>

                                    <Phone size={16} /> Start Hologram

                                </button>

                            )}

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>





            {/* ── AI TRANSLATOR PANEL ─────────────────────────────────────────── */}

            <AnimatePresence>

                {isTranslatorOpen && (

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="translator-panel">

                        <div className="translator-header">

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Languages size={16} color="#818cf8" /> AI Translator</div>

                            <button className="icon-btn" onClick={() => setIsTranslatorOpen(false)}><Plus size={14} style={{ transform: 'rotate(45deg)' }} /></button>

                        </div>

                        <div className="translator-body">

                            <div className="translator-lang-row">

                                <span className="translator-label">From: <strong>{activeFile?.split('.').pop()?.toUpperCase() || 'JS'}</strong></span>

                                <span className="translator-arrow">→</span>

                                <select value={translateTarget} onChange={e => { setTranslateTarget(e.target.value); setTranslatedCode(''); }} className="lang-select">

                                    <option value="python">Python</option>

                                    <option value="rust">Rust</option>

                                    <option value="go">Go</option>

                                    <option value="java">Java</option>

                                </select>

                            </div>

                            {isTranslating && (

                                <div className="translator-thinking">

                                    <div className="scan-ring" style={{ borderTopColor: '#818cf8' }}></div>

                                    <p>Translating architecture...</p>

                                </div>

                            )}

                            {translatedCode && !isTranslating && (

                                <div className="translated-output">

                                    <pre>{translatedCode}</pre>

                                </div>

                            )}

                        </div>

                        <div className="translator-footer">

                            <button className="primary-btn" style={{ width: '100%', justifyContent: 'center', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}

                                onClick={translateCode} disabled={isTranslating || !activeFile}>

                                {isTranslating ? 'Translating...' : `Translate → ${translateTarget.charAt(0).toUpperCase() + translateTarget.slice(1)}`}

                            </button>

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>



            {/* ── MAIN LAYOUT ─────────────────────────────────────────────────── */}

            <div className="editor-layout" style={{ gridTemplateColumns: `${sidebarWidth}px ${isSidebarCollapsed ? 8 : 4}px 1fr` }}>

                <aside className="sidebar">

                    <div className="sidebar-header">

                        <div className="logo-section" style={{ color: 'var(--workspace-accent)' }}>
                            <div className="logo-icon-wrapper">
                                <Monitor size={22} strokeWidth={2.5} />
                            </div>
                            <span className="logo-text">CODE <span className="text-bright">BRIGHT</span></span>
                        </div>

                        <div style={{ fontSize: '0.6rem', color: 'var(--workspace-text-muted)', marginTop: '8px', letterSpacing: '1px' }}>

                            HEURISTIC INTERFACE v4.0.2

                        </div>

                    </div>







                    <div className="sidebar-content">
                        <div className="sidebar-section">
                            <div className="section-title">
                                <span>WORKSPACE</span>
                                <button onClick={createNewFile} className="icon-btn-ghost"><FilePlus size={16} /></button>
                            </div>
                            <div className="file-list">
                                {/* Recursive folder structure would go here, for now using simple list with folders */}
                                <div className="folder-item">
                                    <div className="folder-header">
                                        <ChevronDown size={14} />
                                        <span className="folder-icon">📂</span>
                                        <span>DEVESH</span>
                                    </div>
                                    <div className="folder-contents">
                                        {Object.keys(files).map(name => (
                                            <div key={name} className={`file-item ${activeFile === name ? 'active' : ''}`}
                                                onClick={() => { setActiveFile(name); setLanguage(files[name].language); }}>
                                                <div className="active-indicator" />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                                                    <FileCode size={14} className="file-icon" />
                                                    <span className="file-name-text">{name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-panels">
                        <div className={`collapsible-panel ${activeTab === 'users' ? 'expanded' : ''}`}>
                            <div className="panel-header" onClick={() => setActiveTab(activeTab === 'users' ? 'files' : 'users')}>
                                <div className="panel-title">
                                    <span className="panel-icon-badge">A</span>
                                    <span>COLLABORATORS</span>
                                </div>
                                <ChevronUp size={16} className={`panel-arrow ${activeTab === 'users' ? 'rotated' : ''}`} />
                            </div>
                            <AnimatePresence>
                                {activeTab === 'users' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="panel-content"
                                    >
                                        <div className="user-list-mini">
                                            {clients.map(c => (
                                                <div key={c?.id} className="user-item-mini">
                                                    <div className="user-status-dot online" />
                                                    <span>{c?.username}</span>
                                                    {c?.id === adminId && <span className="owner-tag">OWNER</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="sidebar-action-bar">
                        <button className="action-btn-circle" onClick={copyInviteLink} title="Share Link">
                            <Share2 size={18} />
                        </button>
                        <button className="action-btn-leave" onClick={() => navigate('/hub')}>
                            <LogOut size={16} />
                            <span>Leave</span>
                        </button>
                        {isAdmin && (
                            <button className="action-btn-end" onClick={() => {
                                if (window.confirm("Permanently end this session?")) {
                                    socketRef.current?.emit('end-session', { roomId });
                                }
                            }}>
                                <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
                                <span>End</span>
                            </button>
                        )}
                    </div>

                </aside>



                {/* Sidebar Resizer */}

                <div className={`resizer-x ${isSidebarCollapsed ? 'collapsed' : ''}`} onMouseDown={startSidebarResize}>
                    {/* Collapse arrow removed per user request */}
                </div>



                <main className="main-content" style={{ gridTemplateRows: `70px 1fr ${isTerminalCollapsed ? 8 : 6}px ${terminalHeight}px` }}>

                    <header className="editor-nav">

                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                            <div className="view-selector">
                                <button className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => setViewMode('editor')}>
                                    <FileCode size={14} /> IDE
                                </button>
                                <button className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => setViewMode('preview')}>
                                    <Monitor size={14} /> Preview
                                </button>
                                <button className={`view-btn ${viewMode === 'whiteboard' ? 'active' : ''}`} onClick={() => setViewMode('whiteboard')}>
                                    <WhiteboardIcon size={14} /> Architect
                                </button>
                            </div>

                            <div className="current-path">

                                <span>projects / {roomId?.slice(0, 8)}... /</span>

                                <span className="file-name">{viewMode === 'editor' ? (activeFile || 'No file') : 'System Architect'}</span>

                            </div>

                        </div>



                        <div className="editor-nav-actions">
                            <button className="nav-icon-btn" onClick={() => navigate('/hub')} title="Exit">
                                <LogOut size={18} />
                            </button>
                            <button className="nav-icon-btn" onClick={toggleTerminal} title="Terminal">
                                <TerminalIcon size={18} />
                            </button>
                            <button className="export-btn">
                                <Share2 size={16} /> Export
                            </button>
                            <button className={`nav-play-btn ${isRunning ? 'pulse' : ''}`} onClick={runCode} disabled={isRunning}>
                                <Play size={18} fill="currentColor" />
                            </button>
                        </div>

                    </header>



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
                        {/* Collapse arrow removed per user request */}
                    </div>



                    <div className="terminal-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div className="terminal-header">
                            <div className="terminal-title">
                                <TerminalIcon size={14} style={{ marginRight: '8px' }} />
                                <span>SENTINEL SHELL & DIAGNOSTICS</span>
                            </div>
                            <div className="terminal-status">
                                {isRunning ? 'EXECUTING_CODE...' : 'SYSTEM_READY'}
                            </div>
                        </div>

                        <div className="terminal-body" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                            {/* Show combined logs: Execution output + Interactive shell logs */}
                            {output && (
                                <div className="log-line system">
                                    <pre className="log-out">{output}</pre>
                                </div>
                            )}
                            {terminalLogs.map((log, index) => (
                                <div key={index} className={`log-line ${log.isError ? 'error' : ''} ${log.isSystem ? 'system' : ''}`}>
                                    {log.command && <span className="log-prompt">$ {log.command}</span>}
                                    <pre className="log-out">{log.output}</pre>
                                </div>
                            ))}
                            <div ref={terminalEndRef} />
                        </div>

                        <div className="terminal-input-wrapper">
                            <span className="prompt-symbol">λ</span>
                            <input
                                type="text"
                                className="terminal-input"
                                placeholder="Execute system command..."
                                value={terminalInput}
                                onChange={(e) => setTerminalInput(e.target.value)}
                                onKeyDown={runTerminalCommand}
                            />
                        </div>
                    </div>

                </main>



                {/* AI Trigger Bubble */}

                <div className={`ai-trigger-bubble ${isSidekickOpen ? 'active' : ''}`} onClick={() => setIsSidekickOpen(o => !o)}>

                    <Sparkles size={24} color="#fff" />

                </div>



                <AnimatePresence>

                    {isSidekickOpen && (

                        <motion.aside initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="ai-sidekick">

                            <div className="ai-header">

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                    <Bot size={22} color="#fbbf24" /><h3>AI Sentinel</h3>

                                </div>

                                <button className="icon-btn" onClick={() => setIsSidekickOpen(false)}><Plus size={20} style={{ transform: 'rotate(45deg)' }} /></button>

                            </div>

                            <div className="ai-messages">

                                {aiMessages.map((msg, i) => (

                                    <div key={i} className={`ai-message ${msg.role}`}>

                                        <div className="avatar">{msg.role === 'ai' ? <Brain size={16} /> : <Users size={16} />}</div>

                                        <div className="msg-content">{msg.content}</div>

                                    </div>

                                ))}

                                {isAiThinking && (

                                    <div className="ai-message ai thinking">

                                        <div className="avatar"><Brain size={16} className="pulse-icon" /></div>

                                        <div className="msg-content">Analyzing codebase...</div>

                                    </div>

                                )}

                            </div>

                            {/* BUG FIX: was onSubmit={handleAiSubmit} which didn't exist */}

                            <form className="ai-input-area" onSubmit={(e) => { e.preventDefault(); sendMessageToAi(); }}>

                                <input type="text" placeholder="Ask Sentinel..." value={aiInput} onChange={(e) => setAiInput(e.target.value)} />

                                <button type="submit" disabled={!aiInput.trim() || isAiThinking}><Send size={18} /></button>

                            </form>

                        </motion.aside>

                    )}

                </AnimatePresence>

            </div>

        </>

    );

};



export default EditorPage;

