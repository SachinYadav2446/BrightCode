import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { initSocket } from '../socket';

import toast from 'react-hot-toast';

import Editor from '@monaco-editor/react';

import { motion, AnimatePresence } from 'framer-motion';

import JSZip from 'jszip';

import {

    Users, FileCode, Play, LogOut, FilePlus, Terminal as TerminalIcon,

    Monitor, Link as LinkIcon, Trash2, Edit2, Sparkles, Brain, Bot, Send,

    PenTool, Eraser, Layout as WhiteboardIcon, Zap, Shield, Languages,

    Mic, MicOff, Video, VideoOff, PhoneOff, Phone, Plus,
    ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Share2, Download,
    Folder, FolderOpen, FolderPlus, File as FileIcon, X
} from 'lucide-react';

import axios from 'axios';

import './EditorPage.css';

import { useAuth } from '../context/AuthContext';

import CodeBrightLogo from '../components/CodeBrightLogo';

// â”€â”€ RemoteVideoTile: renders a remote participant's video â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RemoteVideoTile = ({ socketId, participant }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && participant.stream) {
            videoRef.current.srcObject = participant.stream;
        }
    }, [participant.stream]);

    return (
        <div className="vc-tile">
            <video ref={videoRef} autoPlay playsInline className="vc-video" />
            {(!participant.isVideoOn || !participant.stream) && (
                <div className="vc-avatar-fallback">
                    <span>{participant.username?.charAt(0).toUpperCase()}</span>
                </div>
            )}
            <div className="vc-tile-label">
                <span>{participant.username}</span>
                <div className="vc-tile-icons">
                    {participant.isMuted && <MicOff size={12} />}
                    {!participant.isVideoOn && <VideoOff size={12} />}
                </div>
            </div>
        </div>
    );
};





const EditorPage = () => {

    const { user, updateXP } = useAuth(); // BUG FIX: added updateXP

    const socketRef = useRef(null);
    const modalInputRef = useRef(null);

    const { roomId } = useParams();

    const navigate = useNavigate();



    // â”€â”€ Core Editor States â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const [clients, setClients] = useState([]);

    const [files, setFiles] = useState({});

    const [activeFile, setActiveFile] = useState('');

    const [output, setOutput] = useState('');

    const [isRunning, setIsRunning] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState(new Set(['/']));

    const [language, setLanguage] = useState('javascript');

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', targetFile: '', defaultValue: '' });
    const [modalInputValue, setModalInputValue] = useState('');



    // â”€â”€ Sidebar/Tab States (BUG FIX: both were missing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const [sidebarView, setSidebarView] = useState('files'); // 'files', 'collaborators', 'chat'

    const [snapshots, setSnapshots] = useState([]);

    // â”€â”€ Chat States â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    // Navigate sidebar views with arrow buttons
    const goToNextView = () => {
        if (sidebarView === 'files') setSidebarView('collaborators');
        else if (sidebarView === 'collaborators') setSidebarView('chat');
    };

    const goToPreviousView = () => {
        if (sidebarView === 'chat') setSidebarView('collaborators');
        else if (sidebarView === 'collaborators') setSidebarView('files');
    };



    // â”€â”€ Whiteboard States â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const [viewMode, setViewMode] = useState('editor');

    const canvasRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);

    const [drawColor, setDrawColor] = useState('#fbbf24');

    const [drawTool, setDrawTool] = useState('pen');

    const [drawWidth, setDrawWidth] = useState(3);

    const [eraserWidth, setEraserWidth] = useState(20);

    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const [snapshot, setSnapshot] = useState(null);

    // Undo/Redo states
    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    // Text tool states
    const [isAddingText, setIsAddingText] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });



    // â”€â”€ Terminal States â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const [terminalLogs, setTerminalLogs] = useState([

        { output: 'Sentinel Shell Initialized. Ready for input.', isSystem: true }

    ]);

    const [isTerminalOpen, setIsTerminalOpen] = useState(false);

    const [terminalInput, setTerminalInput] = useState('');

    const terminalEndRef = useRef(null);



    // â”€â”€ Admin States â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const [adminId, setAdminId] = useState(null);
    const [myId, setMyId] = useState(null);
    const [myPermission, setMyPermission] = useState('viewer'); // Default to viewer
    const [workspaceOwner, setWorkspaceOwner] = useState('');
    const [workspaceName, setWorkspaceName] = useState('');
    const [showEndSessionModal, setShowEndSessionModal] = useState(false);

    const isAdmin = adminId === myId;
    const canWrite = isAdmin || myPermission === 'writer';
    const isViewer = myPermission === 'viewer' && !isAdmin;

    // Workspace folder name: use workspace name if available, otherwise fallback to owner username
    const workspaceFolderName = (workspaceName || workspaceOwner || user?.username || 'WORKSPACE').toUpperCase();



    // â”€â”€ AI Sentinel States â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const [isSidekickOpen, setIsSidekickOpen] = useState(false);

    const [aiMessages, setAiMessages] = useState([

        { role: 'ai', content: "Hello! I am your AI Sentinel. How can I assist you with your code today?" }

    ]);

    const [isAiThinking, setIsAiThinking] = useState(false);

    const [aiInput, setAiInput] = useState('');



    // â”€â”€ Resizer & Modal Addition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const [creationLang, setCreationLang] = useState('javascript');



    // â”€â”€ FEATURE 1: Multi-User Video Call (WebRTC) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [isVideoCallOpen, setIsVideoCallOpen] = useState(true); // Always open by default
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false); // Camera off by default
    const [callParticipants, setCallParticipants] = useState({}); // socketId -> { username, stream, isMuted, isVideoOn }
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnectionsRef = useRef({}); // socketId -> RTCPeerConnection
    // Keep legacy refs for backward compat
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const isVoiceChatOpen = isVideoCallOpen;
    const setIsVoiceChatOpen = setIsVideoCallOpen;



    // â”€â”€ Resizer States â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const sidebarWidth = 280; // Hardcoded fixed width

    const [terminalHeight, setTerminalHeight] = useState(200);


    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const [isTerminalCollapsed, setIsTerminalCollapsed] = useState(false);



    const prevSidebarWidth = useRef(280);

    const prevTerminalHeight = useRef(200);



    const isResizingSidebar = useRef(false);

    const isResizingTerminal = useRef(false);





    const startTerminalResize = () => { if (!isTerminalCollapsed) { isResizingTerminal.current = true; document.body.style.cursor = 'row-resize'; } };



    const toggleSidebar = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setIsSidebarCollapsed(!isSidebarCollapsed);
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





    // â”€â”€ FEATURE 4: AI Translator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);

    const [translateTarget, setTranslateTarget] = useState('python');

    const [translatedCode, setTranslatedCode] = useState('');

    const [isTranslating, setIsTranslating] = useState(false);



    // â”€â”€ Socket.io Effect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    useEffect(() => {

        let isStopped = false;



        const init = async () => {

            try {

                const socket = await initSocket();

                if (isStopped) { socket.disconnect(); return; }

                socketRef.current = socket;



                socket.on('connect_error', () => toast.error('Connection failed. Retrying...'));



                socket.on('connect', () => {
                    console.log('Socket connected/reconnected. Re-joining room...');
                    socket.emit('join-room', { roomId, username: user?.username });
                });
                if (socket.connected) {
                    socket.emit('join-room', { roomId, username: user?.username });
                }



                socket.on('initial-data', ({ files, users, adminId, yourId, snapshots, workspaceOwner, workspaceName }) => {
                    if (isStopped) return;
                    setFiles(files);
                    setClients(users);
                    setAdminId(adminId);
                    setMyId(yourId);
                    setSnapshots(snapshots || []);
                    if (workspaceOwner) setWorkspaceOwner(workspaceOwner);
                    if (workspaceName) setWorkspaceName(workspaceName);
                    // Don't auto-open any file â€” let user pick from tree
                });



                // Warp Drive

                socket.on('snapshot-captured', (snapshot) => {

                    setSnapshots(prev => [snapshot, ...prev]);

                    toast.success(`Temporal Link Established: ${snapshot.name}`);

                });

                socket.on('files-warped', ({ files, warpedBy, snapshotName }) => {

                    setFiles(files);

                    toast(`WARP DETECTED: ${warpedBy} shifted to [${snapshotName}]`, {

                        icon: 'ðŸŒ€', style: { background: '#6366f1', color: 'white' }

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

                        icon: permission === 'write' ? 'âœï¸' : 'ðŸ”’',

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
                        // Only switch to the file if it's a real file (not a folder placeholder)
                        if (!fileName.endsWith('/.keep')) {
                            setActiveFile(fileName);
                            setLanguage(language);
                            toast.success(`Created ${fileName.split('/').pop()}`);
                        }
                    }
                });

                socket.on('file-deleted', ({ fileName }) => {

                    if (!isStopped) {

                        setFiles(prev => { const n = { ...prev }; delete n[fileName]; return n; });

                        setActiveFile(prev => prev === fileName ? '' : prev);

                        toast.success(`File ${fileName} deleted`);

                    }

                });

                socket.on('file-renamed', ({ oldName, newName, newLanguage }) => {
                    if (!isStopped) {
                        setFiles(prev => {
                            const n = { ...prev };
                            if (n[oldName]) {
                                n[newName] = { ...n[oldName], language: newLanguage || n[oldName].language };
                                delete n[oldName];
                            }
                            return n;
                        });
                        if (activeFile === oldName) {
                            setActiveFile(newName);
                            if (newLanguage) setLanguage(newLanguage);
                        }
                        toast.success(`File renamed to ${newName.split('/').pop()}`);
                    }
                });

                socket.on('folder-deleted', ({ folderPath, deletedFiles }) => {
                    if (!isStopped) {
                        setFiles(prev => {
                            const newFiles = { ...prev };
                            deletedFiles.forEach(f => delete newFiles[f]);
                            return newFiles;
                        });
                        if (deletedFiles.includes(activeFile)) {
                            setActiveFile('');
                        }
                        setExpandedFolders(prev => {
                            const newExpanded = new Set(prev);
                            newExpanded.delete(folderPath);
                            deletedFiles.forEach(f => {
                                if (f.endsWith('/.keep')) {
                                    newExpanded.delete(f.replace('/.keep', ''));
                                }
                            });
                            return newExpanded;
                        });
                        toast.success(`Folder deleted`);
                    }
                });

                socket.on('folder-renamed', ({ oldPath, newPath, renamedMap }) => {
                    if (!isStopped) {
                        setFiles(prev => {
                            const newFiles = { ...prev };
                            Object.entries(renamedMap).forEach(([oldF, newF]) => {
                                if (newFiles[oldF]) {
                                    // Recalculate language based on new extension if it changed
                                    const newLang = getFileLanguage(newF);
                                    newFiles[newF] = { ...newFiles[oldF], language: newLang };
                                    delete newFiles[oldF];
                                }
                            });
                            return newFiles;
                        });

                        if (renamedMap[activeFile]) {
                            const newActive = renamedMap[activeFile];
                            setActiveFile(newActive);
                            setLanguage(getFileLanguage(newActive));
                        }

                        setExpandedFolders(prev => {
                            const newExpanded = new Set(prev);
                            // Also rename nested expanded folders
                            const oldPrefix = oldPath + '/';
                            const newPrefix = newPath + '/';

                            prev.forEach(path => {
                                if (path === oldPath) {
                                    newExpanded.delete(oldPath);
                                    newExpanded.add(newPath);
                                } else if (path.startsWith(oldPrefix)) {
                                    newExpanded.delete(path);
                                    newExpanded.add(path.replace(oldPrefix, newPrefix));
                                }
                            });
                            return newExpanded;
                        });
                        toast.success(`Folder renamed to ${newPath.split('/').pop()}`);
                    }
                });

                socket.on('user-left', ({ id, username }) => {

                    if (!isStopped) { toast.success(`${username} left`); setClients(prev => prev.filter(c => c.id !== id)); }

                });

                socket.on('session-ended', ({ message }) => {

                    if (!isStopped) { navigate('/workspace'); }

                });

                // â”€â”€ Chat Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                socket.on('chat-message', ({ username, message, timestamp }) => {
                    if (!isStopped) {
                        setChatMessages(prev => [...prev, { username, message, timestamp, id: Date.now() }]);
                    }
                });

                // â”€â”€ WebRTC Signaling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

                // â”€â”€ Multi-User WebRTC Video Call Signaling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                socket.on('webrtc-offer', async ({ offer, from }) => {
                    await handleIncomingOffer(offer, from);
                });

                socket.on('webrtc-answer', async ({ answer, from }) => {
                    const pc = peerConnectionsRef.current[from];
                    if (pc) {
                        try { await pc.setRemoteDescription(new RTCSessionDescription(answer)); } catch { }
                    }
                });

                socket.on('webrtc-ice-candidate', async ({ candidate, from }) => {
                    const pc = peerConnectionsRef.current[from];
                    if (pc && candidate) {
                        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { }
                    }
                });

                // New peer joined the call â€” initiate connection to them
                socket.on('video-call-user-joined', async ({ socketId, username }) => {
                    toast(`${username} joined the call`, { icon: 'ðŸ“¹' });
                    if (localStreamRef.current) {
                        await initiateCallToPeer(socketId, username);
                    }
                });

                // Peer left the call
                socket.on('video-call-user-left', ({ socketId, username }) => {
                    toast(`${username} left the call`, { icon: 'ðŸ“µ' });
                    closePeerConnection(socketId);
                });

                // Peer toggled mute/video
                socket.on('video-call-peer-state', ({ socketId, isMuted, isVideoOn, username }) => {
                    setCallParticipants(prev => ({
                        ...prev,
                        [socketId]: { ...prev[socketId], isMuted, isVideoOn, username }
                    }));
                });

                socket.on('call-ended', () => { endCall(); toast('Call ended by peer', { icon: 'ðŸ“µ' }); });



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

    // Auto-join call when clients list is populated
    useEffect(() => {
        if (clients.length > 0 && !isCallActive && socketRef.current) {
            // Small delay to ensure socket is fully ready
            const timer = setTimeout(() => {
                autoJoinCall();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [clients.length]);

    // â”€â”€ Auto-refresh Preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (viewMode === 'preview') {
            // If no frontend files exist, switch back to editor mode
            if (!hasFrontendFiles()) {
                setViewMode('editor');
                toast('Switched to IDE mode - no frontend files available', { icon: 'ðŸ“' });
                return;
            }

            const iframe = document.getElementById('preview-iframe');
            if (iframe) {
                iframe.srcdoc = generatePreview();
            }
        }
    }, [files, viewMode]);



    // â”€â”€ Core Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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



            const response = await axios.post(`${API_URL}/execute`, {

                language: lang,

                files: [{ name: currentFile.language === 'java' ? 'Main.java' : activeFile, content: currentFile.content }]

            });

            const runInfo = response.data.run;

            setOutput(runInfo.stdout || runInfo.stderr || 'Success (No output)');

            if (!runInfo.stderr && (runInfo.stdout || runInfo.code === 0)) {

                try {

                    const token = localStorage.getItem('token');

                    const xpAmount = 10;

                    const xpRes = await axios.post(`${API_URL}/add-xp`, { amount: xpAmount },

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

    // â”€â”€ Export File Function â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const exportFile = () => {
        if (!activeFile) {
            return;
        }

        const currentFile = files[activeFile];
        if (!currentFile) {
            return;
        }

        // Create a blob from the file content
        const blob = new Blob([currentFile.content], { type: 'text/plain' });

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = activeFile.split('/').pop(); // Get just the filename

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    // â”€â”€ Download Single File Function â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const downloadFile = (e, filePath) => {
        e.stopPropagation();

        const fileData = files[filePath];
        if (!fileData) {
            toast.error('File not found');
            return;
        }

        const blob = new Blob([fileData.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filePath.split('/').pop();

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`Downloaded ${filePath.split('/').pop()}`);
    };

    // â”€â”€ Download Folder as ZIP Function â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const downloadFolder = async (e, folderPath) => {
        e.stopPropagation();

        const zip = new JSZip();
        const folderName = folderPath.split('/').pop() || 'workspace';

        // Get all files in this folder
        const folderFiles = Object.entries(files).filter(([path]) => {
            if (folderPath === '') {
                // Root folder - include all files
                return true;
            }
            return path.startsWith(folderPath + '/') && !path.endsWith('/.keep');
        });

        if (folderFiles.length === 0) {
            toast.error('Folder is empty');
            return;
        }

        // Add files to zip
        folderFiles.forEach(([filePath, fileData]) => {
            // Remove the folder prefix to maintain relative structure
            const relativePath = folderPath === '' ? filePath : filePath.replace(folderPath + '/', '');
            zip.file(relativePath, fileData.content || '');
        });

        try {
            toast.loading('Creating ZIP file...', { id: 'zip-download' });
            const content = await zip.generateAsync({ type: 'blob' });

            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${folderName}.zip`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Downloaded ${folderName}.zip`, { id: 'zip-download' });
        } catch (error) {
            console.error('ZIP creation failed:', error);
            toast.error('Failed to create ZIP file', { id: 'zip-download' });
        }
    };

    // â”€â”€ Check if Frontend Files Exist â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const hasFrontendFiles = () => {
        const frontendExtensions = ['html', 'htm', 'css', 'scss', 'js', 'jsx', 'ts', 'tsx'];
        return Object.keys(files).some(fileName => {
            const ext = fileName.split('.').pop()?.toLowerCase();
            return frontendExtensions.includes(ext);
        });
    };

    // â”€â”€ Preview Generation Function â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const generatePreview = () => {
        // Collect HTML, CSS, and JS files
        let htmlContent = '';
        let cssContent = '';
        let jsContent = '';

        Object.entries(files).forEach(([fileName, fileData]) => {
            const ext = fileName.split('.').pop()?.toLowerCase();

            if (ext === 'html' || ext === 'htm') {
                htmlContent += fileData.content || '';
            } else if (ext === 'css' || ext === 'scss') {
                cssContent += fileData.content || '';
            } else if (ext === 'js' || ext === 'jsx') {
                jsContent += fileData.content || '';
            }
        });

        // If no HTML file, create a basic structure
        if (!htmlContent) {
            htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`;
        }

        // Inject CSS and JS into HTML
        const previewHTML = htmlContent.replace(
            '</head>',
            `<style>${cssContent}</style></head>`
        ).replace(
            '</body>',
            `<script>${jsContent}</script></body>`
        );

        return previewHTML;
    };

    // â”€â”€ Chat Functions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const sendChatMessage = () => {
        if (!chatInput.trim() || !socketRef.current) return;

        const message = {
            username: user?.username || 'Anonymous',
            message: chatInput.trim(),
            timestamp: new Date().toISOString()
        };

        socketRef.current.emit('chat-message', { roomId, ...message });
        setChatInput('');
    };

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);



    // â”€â”€ File System Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const openModal = (config) => {
        setModalConfig({ ...config, isOpen: true });
        setModalInputValue(config.defaultValue || '');
    };

    const createNewFile = (folderPath) => {
        const path = typeof folderPath === 'string' ? folderPath : '';
        openModal({ type: 'create', targetFile: path, defaultValue: '' });
    };
    const createNewFolder = (folderPath) => {
        const path = typeof folderPath === 'string' ? folderPath : '';
        openModal({ type: 'create-folder', targetFile: path, defaultValue: '' });
    };

    const getFileLanguage = (name) => {
        const ext = (name.split('.').pop() || '').toLowerCase();
        return {
            js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
            py: 'python', html: 'html', htm: 'html', css: 'css', scss: 'css',
            json: 'json', md: 'markdown', mdx: 'markdown', cpp: 'cpp', c: 'cpp',
            h: 'cpp', java: 'java', sql: 'sql', yaml: 'yaml', yml: 'yaml',
            sh: 'shell', txt: 'plaintext', env: 'plaintext'
        }[ext] || 'plaintext';
    };

    const getFileColor = (name) => {
        const ext = (name.split('.').pop() || '').toLowerCase();
        return {
            js: '#f7df1e', jsx: '#61dafb', ts: '#3178c6', tsx: '#61dafb',
            py: '#3572A5', html: '#e34f26', css: '#7c83fd', scss: '#c6538c',
            json: '#f5a623', md: '#aaaaaa', cpp: '#5a9fd4', c: '#5a9fd4',
            java: '#b07219', sql: '#336791', yaml: '#cc1018', sh: '#89e051'
        }[ext] || '#6b7280';
    };

    const handleModalSubmit = () => {
        const inputVal = modalInputValue.trim();
        const { type, targetFile } = modalConfig;

        // Validation for new names
        if (['create', 'create-folder', 'rename', 'rename-folder'].includes(type)) {
            if (!inputVal) { toast.error('Name cannot be empty'); return; }
            if (/[\\/:*?"<>|]/.test(inputVal)) {
                toast.error('Name contains invalid characters');
                return;
            }
        }

        if (type === 'create') {
            if (!inputVal.includes('.')) { toast.error('Add extension: e.g. index.js or style.css'); return; }
            const finalName = targetFile ? `${targetFile}/${inputVal}` : inputVal;
            if (files[finalName]) { toast.error('File already exists'); return; }
            const lang = getFileLanguage(inputVal);
            socketRef.current?.emit('file-create', { roomId, fileName: finalName, language: lang });
            setExpandedFolders(p => new Set(p).add(targetFile || '/'));

        } else if (type === 'create-folder') {
            const clean = inputVal;
            const folderPath = targetFile ? `${targetFile}/${clean}` : clean;

            // Check if folder or file with same name exists
            const folderPrefix = folderPath + '/';
            const exists = Object.keys(files).some(f => f === folderPath || f.startsWith(folderPrefix));
            if (exists) { toast.error('Folder already exists'); return; }

            socketRef.current?.emit('file-create', { roomId, fileName: `${folderPath}/.keep`, language: 'plaintext' });
            setExpandedFolders(p => { const s = new Set(p); s.add('/'); s.add(folderPath); return s; });
            toast.success(`Folder ${clean} created`);

        } else if (type === 'rename') {
            const parts = targetFile.split('/');
            const oldBase = parts.pop();
            const newBase = inputVal.includes('.') ? inputVal : `${inputVal}.${oldBase.split('.').pop()}`;
            if (newBase === oldBase) { setModalConfig({ isOpen: false }); return; }
            const newPath = [...parts, newBase].join('/');
            if (files[newPath]) { toast.error('Name already in use'); return; }
            socketRef.current?.emit('file-rename', { roomId, oldName: targetFile, newName: newPath });

        } else if (type === 'delete') {
            socketRef.current?.emit('file-delete', { roomId, fileName: targetFile });

        } else if (type === 'rename-folder') {
            const parts = targetFile.split('/');
            parts.pop();
            const newPath = [...parts, inputVal].join('/');
            if (newPath === targetFile) { setModalConfig({ isOpen: false }); return; }

            // Check if target name already exists
            const newPrefix = newPath + '/';
            const exists = Object.keys(files).some(f => f === newPath || f.startsWith(newPrefix));
            if (exists) { toast.error('Name already in use'); return; }

            socketRef.current?.emit('folder-rename', { roomId, oldPath: targetFile, newPath });

        } else if (type === 'delete-folder') {
            socketRef.current?.emit('folder-delete', { roomId, folderPath: targetFile });
        }

        setModalConfig({ isOpen: false });
    };

    const deleteFile = (e, fileName) => {
        e.stopPropagation();
        openModal({ type: 'delete', targetFile: fileName, defaultValue: '' });
    };
    const deleteFolder = (e, folderPath) => {
        e.stopPropagation();
        openModal({ type: 'delete-folder', targetFile: folderPath, defaultValue: '' });
    };
    const renameFile = (e, oldPath) => {
        e.stopPropagation();
        openModal({ type: 'rename', targetFile: oldPath, defaultValue: oldPath.split('/').pop() });
    };
    const renameFolder = (e, folderPath) => {
        e.stopPropagation();
        openModal({ type: 'rename-folder', targetFile: folderPath, defaultValue: folderPath.split('/').pop() });
    };





    // â”€â”€ Copy invite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        }
        catch {
            // Silent fail
        }
    };

    // â”€â”€ AI Sentinel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

                    response = "### âš¡ Optimization Protocol\nAnalysis complete. Recommend `.map()`/`.filter()` over explicit loops for ~15% better allocation. Consider `useMemo` for expensive computations.";

                } else if (input.includes('explain')) {

                    response = `### ðŸ” Code Breakdown\nIn **${activeFile}**, the logic initializes a reactive state loop creating a data sink for incoming signals from the Code Sight server via WebSocket channels.`;

                } else if (input.includes('generate') || input.includes('create')) {

                    response = "### ðŸ› ï¸ Boilerplate Generated\n```javascript\nconst handler = async (req, res) => {\n  try {\n    const data = await processRequest(req.body);\n    res.json({ success: true, data });\n  } catch (err) {\n    res.status(500).json({ error: err.message });\n  }\n};\n```";

                } else if (input.includes('bug') || input.includes('fix')) {

                    response = "### ðŸ› Diagnostic Mode\nActivate the **Watchdog** (Shield icon in toolbar) for a full security scan. Common issues: unhandled promise chains, missing null-checks, type coercion with `==`.";

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





    // â”€â”€ FEATURE 4: AI Translator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

            python: `# AI Sentinel â€” Translated to Python\n# Source: ${activeFile}\n\ndef main():\n    ${sanitized}\n\nif __name__ == '__main__':\n    main()`,

            rust: `// AI Sentinel â€” Translated to Rust\n// Source: ${activeFile}\n\nfn main() {\n    println!("Code Sight â€” Rust port");\n    // Note: Rust requires explicit type annotations\n    // Manual port recommended for production use\n}`,

            go: `// AI Sentinel â€” Translated to Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Code Sight â€” Go port")\n    // Note: Go requires explicit type declarations\n}`,

            java: `// AI Sentinel â€” Translated to Java\n// Source: ${activeFile}\n\npublic class Translated {\n    public static void main(String[] args) {\n        System.out.println("Code Sight â€” Java port");\n    }\n}`,

        };

        setTranslatedCode(translations[translateTarget] || '// Translation not available for this target language.');

        setIsTranslating(false);

        toast.success(`Code translated to ${translateTarget}!`);

    };



    // â”€â”€ FEATURE 1: Multi-User WebRTC Video Call â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const STUN_SERVERS = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ]
    };

    const createPeerConnection = (targetId) => {
        const pc = new RTCPeerConnection(STUN_SERVERS);
        peerConnectionsRef.current[targetId] = pc;
        // Legacy single ref
        peerConnectionRef.current = pc;

        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('webrtc-ice-candidate', { roomId, candidate: event.candidate, targetId });
            }
        };

        pc.ontrack = (event) => {
            const stream = event.streams[0];
            // Legacy single remote ref
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
            setCallParticipants(prev => ({
                ...prev,
                [targetId]: { ...prev[targetId], stream }
            }));
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                closePeerConnection(targetId);
            }
        };

        return pc;
    };

    const closePeerConnection = (socketId) => {
        const pc = peerConnectionsRef.current[socketId];
        if (pc) { pc.close(); delete peerConnectionsRef.current[socketId]; }
        setCallParticipants(prev => {
            const updated = { ...prev };
            delete updated[socketId];
            return updated;
        });
    };

    // Get local media stream (audio + optional video)
    const getLocalStream = async (withVideo = true) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: withVideo });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            return stream;
        } catch (err) {
            // Try audio only if video fails
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
                return stream;
            } catch {
                console.log('Microphone/Camera access denied - user can enable later');
                return null;
            }
        }
    };

    // Auto-join the call when workspace loads
    const autoJoinCall = async () => {
        // Start with audio only, camera off by default
        const stream = await getLocalStream(false);
        if (!stream) {
            // If no permissions, still mark as active but without stream
            setIsCallActive(true);
            return;
        }

        setIsCallActive(true);

        // Tell everyone we joined
        socketRef.current?.emit('video-call-join', { roomId, username: user?.username });

        // Connect to all existing participants in the room (except self)
        const otherClients = clients.filter(c => c.id !== myId);
        for (const client of otherClients) {
            await initiateCallToPeer(client.id, client.username);
        }
    };

    // Initiate a peer connection and send offer
    const initiateCallToPeer = async (targetId, targetUsername) => {
        if (!localStreamRef.current) return;
        const pc = createPeerConnection(targetId);
        setCallParticipants(prev => ({
            ...prev,
            [targetId]: { username: targetUsername, stream: null, isMuted: false, isVideoOn: true }
        }));
        localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit('webrtc-offer', { roomId, offer, targetId });
    };

    // Handle incoming offer from a peer
    const handleIncomingOffer = async (offer, from) => {
        // Auto-get stream if not already in call
        let stream = localStreamRef.current;
        if (!stream) {
            stream = await getLocalStream(isVideoOn);
            if (!stream) return;
            setIsCallActive(true);
            setIsVideoCallOpen(true);
            socketRef.current?.emit('video-call-join', { roomId, username: user?.username });
        }

        const callerInfo = clients.find(c => c.id === from);
        const pc = createPeerConnection(from);
        setCallParticipants(prev => ({
            ...prev,
            [from]: { username: callerInfo?.username || 'Peer', stream: null, isMuted: false, isVideoOn: true }
        }));

        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current?.emit('webrtc-answer', { roomId, answer, targetId: from });

        toast(`${callerInfo?.username || 'Someone'} joined the call`, { icon: 'ðŸ“¹' });
    };

    // Leave the call (only called when leaving workspace)
    const endCall = () => {
        // Stop all local tracks
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        if (localVideoRef.current) localVideoRef.current.srcObject = null;

        // Close all peer connections
        Object.keys(peerConnectionsRef.current).forEach(id => {
            peerConnectionsRef.current[id]?.close();
        });
        peerConnectionsRef.current = {};
        peerConnectionRef.current = null;

        setCallParticipants({});
        setIsCallActive(false);
        setIsMuted(false);

        socketRef.current?.emit('video-call-leave', { roomId, username: user?.username });
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const newMuted = !isMuted;
            localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
            setIsMuted(newMuted);
            socketRef.current?.emit('video-call-state', { roomId, isMuted: newMuted, isVideoOn, username: user?.username });
        }
    };

    const toggleVideo = async () => {
        if (!localStreamRef.current) {
            // No stream yet, need to get camera access
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                // Add tracks to all existing peer connections
                Object.values(peerConnectionsRef.current).forEach(pc => {
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream);
                    });
                });

                setIsVideoOn(true);
                socketRef.current?.emit('video-call-state', { roomId, isMuted, isVideoOn: true, username: user?.username });
            } catch (err) {
                toast.error('Camera access denied');
            }
        } else {
            const newVideoOn = !isVideoOn;
            const videoTracks = localStreamRef.current.getVideoTracks();

            if (videoTracks.length > 0) {
                videoTracks.forEach(t => { t.enabled = newVideoOn; });
            } else if (newVideoOn) {
                // Need to add video track
                try {
                    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const videoTrack = videoStream.getVideoTracks()[0];
                    localStreamRef.current.addTrack(videoTrack);

                    // Add to all peer connections
                    Object.values(peerConnectionsRef.current).forEach(pc => {
                        pc.addTrack(videoTrack, localStreamRef.current);
                    });
                } catch (err) {
                    toast.error('Camera access denied');
                    return;
                }
            }

            setIsVideoOn(newVideoOn);
            socketRef.current?.emit('video-call-state', { roomId, isMuted, isVideoOn: newVideoOn, username: user?.username });
        }
    };





    // â”€â”€ Whiteboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const getCoordinates = (nativeEvent) => {

        const canvas = canvasRef.current;

        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();

        // Account for canvas scaling (CSS size vs Coordinate size)

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



        setStartPos({ x, y });

        // Save state for shape previews

        setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));



        if (drawTool === 'pen' || drawTool === 'eraser') {

            ctx.beginPath();

            ctx.moveTo(x, y);

            ctx.lineCap = 'round';

            ctx.lineJoin = 'round';

        }



        setIsDrawing(true);

    };



    const draw = ({ nativeEvent }) => {

        if (!isDrawing) return;

        const { x, y } = getCoordinates(nativeEvent);

        const ctx = canvasRef.current.getContext('2d');



        if (drawTool === 'pen' || drawTool === 'eraser') {

            ctx.strokeStyle = drawTool === 'eraser' ? '#120e0b' : drawColor;

            ctx.lineWidth = drawTool === 'eraser' ? eraserWidth : drawWidth;

            ctx.lineTo(x, y);

            ctx.stroke();

        } else {

            // Shapes logic: restore snapshot and draw preview

            if (snapshot) {

                ctx.putImageData(snapshot, 0, 0);

                ctx.strokeStyle = drawColor;

                ctx.lineWidth = drawWidth;

                ctx.lineCap = 'round';

                ctx.beginPath();



                const dx = x - startPos.x;

                const dy = y - startPos.y;



                if (drawTool === 'rect') {

                    ctx.strokeRect(startPos.x, startPos.y, dx, dy);

                } else if (drawTool === 'circle') {

                    const radius = Math.sqrt(dx * dx + dy * dy);

                    ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);

                    ctx.stroke();

                } else if (drawTool === 'line') {

                    ctx.moveTo(startPos.x, startPos.y);

                    ctx.lineTo(x, y);

                    ctx.stroke();

                } else if (drawTool === 'arrow') {

                    const headLength = 15;

                    const angle = Math.atan2(dy, dx);

                    ctx.moveTo(startPos.x, startPos.y);

                    ctx.lineTo(x, y);

                    ctx.lineTo(x - headLength * Math.cos(angle - Math.PI / 6), y - headLength * Math.sin(angle - Math.PI / 6));

                    ctx.moveTo(x, y);

                    ctx.lineTo(x - headLength * Math.cos(angle + Math.PI / 6), y - headLength * Math.sin(angle + Math.PI / 6));

                    ctx.stroke();

                } else if (drawTool === 'triangle') {

                    ctx.moveTo(startPos.x + dx / 2, startPos.y);

                    ctx.lineTo(startPos.x, startPos.y + dy);

                    ctx.lineTo(startPos.x + dx, startPos.y + dy);

                    ctx.closePath();

                    ctx.stroke();

                } else if (drawTool === 'diamond') {
                    // Diamond shape for decision nodes
                    const centerX = startPos.x + dx / 2;
                    const centerY = startPos.y + dy / 2;
                    ctx.moveTo(centerX, startPos.y);
                    ctx.lineTo(startPos.x + dx, centerY);
                    ctx.lineTo(centerX, startPos.y + dy);
                    ctx.lineTo(startPos.x, centerY);
                    ctx.closePath();
                    ctx.stroke();

                } else if (drawTool === 'cylinder') {
                    // Cylinder shape for databases
                    const ellipseHeight = Math.abs(dy) * 0.15;
                    ctx.ellipse(startPos.x + dx / 2, startPos.y + ellipseHeight, Math.abs(dx) / 2, ellipseHeight, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(startPos.x, startPos.y + ellipseHeight);
                    ctx.lineTo(startPos.x, startPos.y + dy - ellipseHeight);
                    ctx.moveTo(startPos.x + dx, startPos.y + ellipseHeight);
                    ctx.lineTo(startPos.x + dx, startPos.y + dy - ellipseHeight);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.ellipse(startPos.x + dx / 2, startPos.y + dy - ellipseHeight, Math.abs(dx) / 2, ellipseHeight, 0, 0, Math.PI * 2);
                    ctx.stroke();

                } else if (drawTool === 'hexagon') {
                    // Hexagon shape for processes
                    const w = dx;
                    const h = dy;
                    const offset = w * 0.2;
                    ctx.moveTo(startPos.x + offset, startPos.y);
                    ctx.lineTo(startPos.x + w - offset, startPos.y);
                    ctx.lineTo(startPos.x + w, startPos.y + h / 2);
                    ctx.lineTo(startPos.x + w - offset, startPos.y + h);
                    ctx.lineTo(startPos.x + offset, startPos.y + h);
                    ctx.lineTo(startPos.x, startPos.y + h / 2);
                    ctx.closePath();
                    ctx.stroke();

                } else if (drawTool === 'parallelogram') {
                    // Parallelogram for data/input
                    const offset = dx * 0.2;
                    ctx.moveTo(startPos.x + offset, startPos.y);
                    ctx.lineTo(startPos.x + dx, startPos.y);
                    ctx.lineTo(startPos.x + dx - offset, startPos.y + dy);
                    ctx.lineTo(startPos.x, startPos.y + dy);
                    ctx.closePath();
                    ctx.stroke();

                } else if (drawTool === 'doubleArrow') {
                    // Double-headed arrow for relationships
                    const headLength = 15;
                    const angle = Math.atan2(dy, dx);

                    // Main line
                    ctx.moveTo(startPos.x, startPos.y);
                    ctx.lineTo(startPos.x + dx, startPos.y + dy);
                    ctx.stroke();

                    // First arrowhead
                    ctx.beginPath();
                    ctx.moveTo(startPos.x + dx, startPos.y + dy);
                    ctx.lineTo(startPos.x + dx - headLength * Math.cos(angle - Math.PI / 6), startPos.y + dy - headLength * Math.sin(angle - Math.PI / 6));
                    ctx.moveTo(startPos.x + dx, startPos.y + dy);
                    ctx.lineTo(startPos.x + dx - headLength * Math.cos(angle + Math.PI / 6), startPos.y + dy - headLength * Math.sin(angle + Math.PI / 6));
                    ctx.stroke();

                    // Second arrowhead (at start)
                    ctx.beginPath();
                    ctx.moveTo(startPos.x, startPos.y);
                    ctx.lineTo(startPos.x + headLength * Math.cos(angle - Math.PI / 6), startPos.y + headLength * Math.sin(angle - Math.PI / 6));
                    ctx.moveTo(startPos.x, startPos.y);
                    ctx.lineTo(startPos.x + headLength * Math.cos(angle + Math.PI / 6), startPos.y + headLength * Math.sin(angle + Math.PI / 6));
                    ctx.stroke();
                }

            }

        }

    };



    const stopDrawing = () => {

        setIsDrawing(false);

        setSnapshot(null);

    };



    const clearCanvas = () => {

        const ctx = canvasRef.current.getContext('2d');

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    };



    // â”€â”€ Terminal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const runTerminalCommand = (e) => {

        if (e.key === 'Enter' && terminalInput.trim()) {

            socketRef.current?.emit('terminal-command', { command: terminalInput });

            setTerminalInput('');

        }

    };



    useEffect(() => { terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [terminalLogs]);



    if (!user) return null;



    // â”€â”€ FILE SYSTEM TREE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const fileTree = React.useMemo(() => {
        const root = { type: 'folder', children: {} };
        Object.keys(files).forEach(path => {
            const parts = path.split('/');
            let current = root;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current.children[parts[i]]) {
                    current.children[parts[i]] = { type: 'folder', children: {} };
                }
                current = current.children[parts[i]];
            }
            const fileName = parts[parts.length - 1];
            if (fileName === '.keep') return;
            current.children[fileName] = { type: 'file', path };
        });
        return root;
    }, [files]);

    const toggleFolder = (path) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    };

    const renderFileTree = (node, path = '', depth = 0) => {
        return Object.entries(node.children)
            .sort(([nameA, nodeA], [nameB, nodeB]) => {
                if (nodeA.type === nodeB.type) return nameA.localeCompare(nameB);
                return nodeA.type === 'folder' ? -1 : 1;
            })
            .map(([name, childNode]) => {
                const currentPath = path ? `${path}/${name}` : name;

                if (childNode.type === 'folder') {
                    const isExpanded = expandedFolders.has(currentPath);
                    return (
                        <div key={currentPath} className="folder-item">
                            <div className="folder-header" onClick={() => toggleFolder(currentPath)} style={{ paddingLeft: `${depth * 12 + 8}px` }}>
                                <span className="tree-arrow">{isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
                                {isExpanded
                                    ? <FolderOpen size={14} style={{ color: '#e2a04a', flexShrink: 0 }} />
                                    : <Folder size={14} style={{ color: '#e2a04a', flexShrink: 0 }} />}
                                <span className="folder-name-text" style={{ flex: 1, fontSize: '0.85rem' }}>{name}</span>
                                {canWrite && (
                                    <div className="folder-actions" style={{ display: 'flex', gap: '4px' }}>
                                        <button className="icon-btn-ghost" onClick={(e) => { e.stopPropagation(); createNewFile(currentPath); }} title="New File"><FilePlus size={12} /></button>
                                        <button className="icon-btn-ghost" onClick={(e) => { e.stopPropagation(); createNewFolder(currentPath); }} title="New Folder"><FolderPlus size={12} /></button>
                                        <button className="icon-btn-ghost" onClick={(e) => renameFolder(e, currentPath)} title="Rename"><Edit2 size={12} /></button>
                                        <button className="icon-btn-ghost" onClick={(e) => deleteFolder(e, currentPath)} title="Delete"><Trash2 size={12} /></button>
                                    </div>
                                )}
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        {Object.keys(childNode.children).length === 0 ? (
                                            <div className="empty-folder-hint-inline" style={{ paddingLeft: `${depth * 12 + 32}px`, fontSize: '0.75rem', color: 'var(--text-muted)', paddingY: '4px', fontStyle: 'italic' }}>
                                                (empty)
                                            </div>
                                        ) : renderFileTree(childNode, currentPath, depth + 1)}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                }

                const isActive = activeFile === currentPath;
                return (
                    <div key={currentPath} className={`file-item ${isActive ? 'active' : ''}`}
                        onClick={() => { setActiveFile(currentPath); setLanguage(files[currentPath].language); }}
                        style={{ paddingLeft: `${depth * 12 + 24}px` }}>
                        <div className="active-indicator" />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}>
                            <FileIcon size={13} style={{ color: getFileColor(name), flexShrink: 0 }} />
                            <span className="file-name-text">{name}</span>
                        </div>
                        {canWrite && (
                            <div className="file-actions" style={{ display: 'flex', gap: '4px' }}>
                                <button className="icon-btn-ghost" onClick={(e) => renameFile(e, currentPath)} title="Rename"><Edit2 size={12} /></button>
                                <button className="icon-btn-ghost" onClick={(e) => deleteFile(e, currentPath)} title="Delete"><Trash2 size={12} /></button>
                            </div>
                        )}
                    </div>
                );
            });
    };

    // â”€â”€ RENDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return (

        <>

            <AnimatePresence>

                {modalConfig.isOpen && (

                    <div className="custom-modal-overlay">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="custom-modal">

                            <div className="custom-modal-header">
                                <h3>
                                    {modalConfig.type === 'create' ? 'New File' :
                                        modalConfig.type === 'create-folder' ? 'New Folder' :
                                            (modalConfig.type === 'rename' || modalConfig.type === 'rename-folder') ? 'Rename' :
                                                'Delete'}
                                </h3>
                            </div>

                            <div className="custom-modal-body">
                                {(modalConfig.type === 'delete' || modalConfig.type === 'delete-folder') ? (
                                    <div>
                                        <p>Are you sure you want to delete <span className="highlight-file">{modalConfig.targetFile.split('/').pop()}</span>?</p>
                                        {modalConfig.type === 'delete-folder' && (
                                            <div className="warning-message">
                                                <p>All files and subfolders inside will be permanently deleted.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="modal-field">
                                        <label>
                                            {modalConfig.type === 'create'
                                                ? 'File name (include extension)'
                                                : modalConfig.type === 'create-folder'
                                                    ? 'Folder name'
                                                    : 'New name'}
                                        </label>
                                        <input
                                            type="text"
                                            autoFocus
                                            value={modalInputValue}
                                            onChange={e => setModalInputValue(e.target.value)}
                                            placeholder={
                                                modalConfig.type === 'create' ? 'e.g. index.js, App.tsx, style.css'
                                                    : modalConfig.type === 'create-folder' ? 'e.g. components'
                                                        : 'New name...'
                                            }
                                            className="premium-input modal-input"
                                            onKeyDown={e => { if (e.key === 'Enter') handleModalSubmit(); }}
                                        />
                                        {modalConfig.type === 'create' && (
                                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '6px' }}>
                                                Language is auto-detected from the extension.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="custom-modal-footer">
                                <button className="secondary-btn" onClick={() => setModalConfig({ isOpen: false })}>Cancel</button>
                                <button
                                    className={`primary-btn ${(modalConfig.type === 'delete' || modalConfig.type === 'delete-folder') ? 'danger-btn' : 'glow-btn'}`}
                                    onClick={handleModalSubmit}
                                >
                                    {(modalConfig.type === 'delete' || modalConfig.type === 'delete-folder') ? 'Delete' : 'Confirm'}
                                </button>
                            </div>

                        </motion.div>
                    </div>

                )}

            </AnimatePresence>



            {/* â”€â”€ END SESSION MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <AnimatePresence>
                {showEndSessionModal && (
                    <div className="custom-modal-overlay" onClick={() => setShowEndSessionModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="end-session-modal"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="end-modal-icon">
                                <div className="warning-icon-circle">
                                    <Plus size={40} style={{ transform: 'rotate(45deg)' }} />
                                </div>
                            </div>

                            <h2 className="end-modal-title">End Session Permanently?</h2>
                            <p className="end-modal-description">
                                This will terminate the workspace for all users and cannot be undone.
                                All files and progress will be permanently lost.
                            </p>

                            <div className="end-modal-actions">
                                <button
                                    className="end-modal-btn cancel-btn"
                                    onClick={() => setShowEndSessionModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="end-modal-btn confirm-btn"
                                    onClick={() => {
                                        socketRef.current?.emit('end-session', { roomId });
                                        setShowEndSessionModal(false);
                                        navigate('/workspace');
                                    }}
                                >
                                    <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
                                    End Session
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* â”€â”€ PRESENCE PANEL (Always Visible) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="presence-panel"
            >
                {/* Header */}
                <div className="presence-header">
                    <div className="presence-title">
                        <Users size={14} />
                        <span>Workspace</span>
                        <span className="presence-count">{clients.length}</span>
                    </div>
                </div>

                {/* Participants Grid */}
                <div className="presence-grid">
                    {/* Local user tile */}
                    <div className="presence-tile">
                        <div className="presence-video-container">
                            <video ref={localVideoRef} autoPlay playsInline muted className="presence-video" />
                            {!isVideoOn && (
                                <div className="presence-avatar">
                                    <span>{user?.username?.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            <div className="presence-status-badge online" />
                        </div>
                        <div className="presence-info">
                            <span className="presence-name">{user?.username}</span>
                            <span className="presence-you-tag">You</span>
                        </div>
                    </div>

                    {/* Remote participants */}
                    {clients.filter(c => c.id !== myId).map(client => {
                        const participant = callParticipants[client.id];
                        return (
                            <div key={client.id} className="presence-tile">
                                <div className="presence-video-container">
                                    {participant?.stream ? (
                                        <>
                                            <video
                                                ref={el => {
                                                    if (el && participant.stream) {
                                                        el.srcObject = participant.stream;
                                                    }
                                                }}
                                                autoPlay
                                                playsInline
                                                className="presence-video"
                                            />
                                            {!participant.isVideoOn && (
                                                <div className="presence-avatar">
                                                    <span>{client.username?.charAt(0).toUpperCase()}</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="presence-avatar">
                                            <span>{client.username?.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                    <div className="presence-status-badge online" />
                                    {participant?.isMuted && (
                                        <div className="presence-muted-badge">
                                            <MicOff size={10} />
                                        </div>
                                    )}
                                </div>
                                <div className="presence-info">
                                    <span className="presence-name">{client.username}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Controls */}
                <div className="presence-controls">
                    <button
                        className={`presence-control-btn ${isMuted ? 'muted' : ''}`}
                        onClick={toggleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                    <button
                        className={`presence-control-btn ${!isVideoOn ? 'off' : ''}`}
                        onClick={toggleVideo}
                        title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {isVideoOn ? <Video size={16} /> : <VideoOff size={16} />}
                    </button>
                </div>
            </motion.div>





            {/* â”€â”€ AI TRANSLATOR PANEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}

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

                                <span className="translator-arrow">â†’</span>

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

                                {isTranslating ? 'Translating...' : `Translate â†’ ${translateTarget.charAt(0).toUpperCase() + translateTarget.slice(1)}`}

                            </button>

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>



            {/* â”€â”€ MAIN LAYOUT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}

            <div className="ide-shell">

                {/* â”€â”€ FULL-WIDTH TOPBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                <header className="editor-nav">

                    <div className="nav-left">
                        <CodeBrightLogo size="small" />
                    </div>



                    <div className="nav-center">
                        <div className="view-selector">
                            <button className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => setViewMode('editor')}>
                                <FileCode size={14} /> IDE
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`}
                                onClick={() => hasFrontendFiles() && setViewMode('preview')}
                                disabled={!hasFrontendFiles()}
                                title={!hasFrontendFiles() ? 'Preview only available for HTML/CSS/JS files' : 'Preview'}
                            >
                                <Monitor size={14} /> Preview
                            </button>
                            <button className={`view-btn ${viewMode === 'whiteboard' ? 'active' : ''}`} onClick={() => setViewMode('whiteboard')}>
                                <WhiteboardIcon size={14} /> Architect
                            </button>
                        </div>
                    </div>

                    <div className="nav-right">
                        <div className="editor-nav-actions">

                            <button
                                className={`nav-icon-btn ${!isTerminalCollapsed ? 'active' : ''}`}
                                onClick={toggleTerminal}
                                title="Terminal"
                            >
                                <TerminalIcon size={18} />
                            </button>
                            <button className="export-btn" onClick={exportFile} disabled={!activeFile}>
                                <Download size={16} /> Export
                            </button>
                            <button className={`nav-play-btn ${isRunning ? 'pulse' : ''}`} onClick={runCode} disabled={isRunning}>
                                <Play size={18} fill="currentColor" />
                            </button>
                        </div>
                    </div>

                </header>

                <div className="editor-layout" style={{ gridTemplateColumns: `${isSidebarCollapsed ? 0 : sidebarWidth}px 1fr`, position: 'relative' }}>

                    <button
                        className={`sidebar-handle-toggle ${isSidebarCollapsed ? 'collapsed' : ''}`}
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {isSidebarCollapsed && <span className="handle-text">WORKSPACE</span>}
                        <div className="handle-icon">
                            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                        </div>
                    </button>







                    <aside className="sidebar">

                        <div className="sidebar-content">
                            {/* Header with title and navigation arrows */}
                            <div className="sidebar-header-bar">
                                {/* Left arrow - only show if not on first view */}
                                {sidebarView !== 'files' && (
                                    <button className="sidebar-nav-btn" onClick={goToPreviousView} title="Go back">
                                        <ChevronLeft size={16} />
                                    </button>
                                )}

                                <span className="sidebar-title">
                                    {sidebarView === 'files' && 'EXPLORER'}
                                    {sidebarView === 'collaborators' && 'COLLABORATORS'}
                                    {sidebarView === 'chat' && 'TEAM CHAT'}
                                </span>

                                {/* Right arrow - only show if not on last view */}
                                {sidebarView !== 'chat' && (
                                    <button className="sidebar-nav-btn" onClick={goToNextView} title="Next">
                                        <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Files View */}
                            {sidebarView === 'files' && (
                                <div className="sidebar-section">
                                    <div className="file-list">
                                        <div className="folder-item root-folder">
                                            <div className="folder-header root-folder-header" onClick={() => toggleFolder('/')}>
                                                <span className="tree-arrow">{expandedFolders.has('/') ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>
                                                {expandedFolders.has('/') ? <FolderOpen size={14} style={{ color: '#e2a04a', flexShrink: 0 }} /> : <Folder size={14} style={{ color: '#e2a04a', flexShrink: 0 }} />}
                                                <span className="folder-name-text root-name" style={{ flex: 1 }}>{workspaceFolderName}</span>
                                                {canWrite && (
                                                    <div className="folder-actions" style={{ display: 'flex', gap: '4px' }}>
                                                        <button className="icon-btn-ghost" onClick={(e) => { e.stopPropagation(); createNewFile(''); }} title="New File in root"><FilePlus size={12} /></button>
                                                        <button className="icon-btn-ghost" onClick={(e) => { e.stopPropagation(); createNewFolder(''); }} title="New Folder in root"><FolderPlus size={12} /></button>
                                                    </div>
                                                )}
                                            </div>
                                            <AnimatePresence>
                                                {expandedFolders.has('/') && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                                        {Object.keys(fileTree.children).length === 0 ? (
                                                            <div className="empty-folder-hint">
                                                                <span>No files yet.</span>
                                                                {canWrite && <button onClick={() => createNewFile('')} className="hint-btn">+ New File</button>}
                                                            </div>
                                                        ) : renderFileTree(fileTree, '')}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Collaborators View */}
                            {sidebarView === 'collaborators' && (
                                <div className="sidebar-section">
                                    <div className="user-list-full">
                                        {clients.map(c => {
                                            const userRole = c?.id === adminId ? 'admin' : (c?.permission || 'viewer');
                                            return (
                                                <div key={c?.id} className="user-item-full">
                                                    <div className="user-info-group">
                                                        <div className="user-status-dot online" />
                                                        <span className="user-name">
                                                            {c?.username}
                                                            {c?.id === myId && <span className="you-tag"> (You)</span>}
                                                        </span>
                                                        <span className={`role-badge ${userRole}`}>
                                                            {userRole === 'admin' ? 'ADMIN' : userRole === 'writer' ? 'WRITER' : 'VIEWER'}
                                                        </span>
                                                    </div>
                                                    <div className="user-actions">
                                                        {isAdmin && c?.id !== myId && c?.id !== adminId && (
                                                            <>
                                                                <button
                                                                    className={`role-toggle-btn ${c?.permission === 'writer' ? 'active' : ''}`}
                                                                    onClick={() => {
                                                                        if (socketRef.current) {
                                                                            const newPermission = c?.permission === 'writer' ? 'viewer' : 'writer';
                                                                            socketRef.current.emit('change-permission', {
                                                                                roomId,
                                                                                targetId: c?.id,
                                                                                permission: newPermission
                                                                            });
                                                                        }
                                                                    }}
                                                                    title={c?.permission === 'writer' ? 'Revoke write access' : 'Grant write access'}
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    className="kick-btn"
                                                                    onClick={() => {
                                                                        if (socketRef.current) {
                                                                            socketRef.current.emit('kick-user', { roomId, targetId: c?.id });
                                                                        }
                                                                    }}
                                                                    title="Remove user"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Chat View */}
                            {sidebarView === 'chat' && (
                                <div className="sidebar-section chat-section">
                                    <div className="chat-messages">
                                        {chatMessages.length === 0 ? (
                                            <div className="chat-empty">
                                                <Send size={32} style={{ opacity: 0.3 }} />
                                                <p>No messages yet</p>
                                                <span>Start the conversation!</span>
                                            </div>
                                        ) : (
                                            chatMessages.map(msg => {
                                                const isOwnMessage = msg.username === user?.username;
                                                return (
                                                    <div key={msg.id} className={`chat-message ${isOwnMessage ? 'own-message' : ''}`}>
                                                        <div className="chat-message-header">
                                                            <span className="chat-username">{isOwnMessage ? 'You' : msg.username}</span>
                                                            <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="chat-message-text">{msg.message}</div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>
                                    <div className="chat-input-container">
                                        <input
                                            type="text"
                                            className="chat-input"
                                            placeholder="Type a message..."
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                                        />
                                        <button className="chat-send-btn" onClick={sendChatMessage}>
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="sidebar-action-bar">
                            <button className="action-btn-circle" onClick={copyInviteLink} title="Share Link">
                                <Share2 size={18} />
                            </button>
                            <button className="action-btn-leave" onClick={() => {
                                // Leave workspace but keep it active
                                if (socketRef.current) {
                                    socketRef.current.emit('leave-workspace', {
                                        roomId,
                                        username: user?.username
                                    });
                                    socketRef.current.disconnect();
                                }
                                navigate('/workspace');
                            }}>
                                <LogOut size={16} />
                                <span>Leave</span>
                            </button>
                            {isAdmin && (
                                <button className="action-btn-end" onClick={() => setShowEndSessionModal(true)}>
                                    <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
                                    <span>End</span>
                                </button>
                            )}
                        </div>

                    </aside>







                    <main className="main-content" style={{ gridTemplateRows: `1fr ${isTerminalCollapsed ? 0 : 2}px ${terminalHeight}px` }}>




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

                                            readOnly: !canWrite,

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

                                    <div className="editor-empty-state">
                                        <div className="empty-state-content">
                                            <div className="empty-state-icon">
                                                <FileCode size={48} strokeWidth={1} />
                                            </div>
                                            <h2>No file selected</h2>
                                            <p>Select a file from the explorer to start building your vision.</p>
                                            {canWrite && (
                                                <div className="empty-state-actions">
                                                    <button onClick={() => createNewFile('')} className="empty-action-btn">
                                                        <FilePlus size={16} /> New File
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                )}

                            </div>





                        </div>

                        {/* â”€â”€ PREVIEW CONTAINER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                        <div className="preview-container" style={{ display: viewMode === 'preview' ? 'flex' : 'none', minHeight: 0, overflow: 'hidden' }}>
                            <div className="preview-main">
                                <div className="preview-toolbar">
                                    <div className="preview-info">
                                        <Monitor size={16} />
                                        <span>Live Preview</span>
                                    </div>
                                    <button
                                        className="preview-refresh-btn"
                                        onClick={() => {
                                            const iframe = document.getElementById('preview-iframe');
                                            if (iframe) {
                                                iframe.srcdoc = generatePreview();
                                            }
                                        }}
                                        title="Refresh Preview"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="preview-frame-wrapper">
                                    <iframe
                                        id="preview-iframe"
                                        className="preview-iframe"
                                        title="Preview"
                                        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                                        srcDoc={generatePreview()}
                                    />
                                </div>
                            </div>
                        </div>



                        <div className="whiteboard-container" style={{ display: viewMode === 'whiteboard' ? 'flex' : 'none', minHeight: 0, overflow: 'hidden' }}>

                            <div className="whiteboard-main">

                                <div className="floating-toolbar">
                                    <div className="toolbar-group">
                                        <div className="color-swatches">
                                            {['#fbbf24', 'var(--primary)', '#3b82f6', '#10b981', '#ffffff'].map(color => (
                                                <button
                                                    key={color}
                                                    className={`swatch ${drawColor === color && drawTool !== 'eraser' ? 'active' : ''}`}
                                                    style={{ background: color }}
                                                    onClick={() => { setDrawColor(color); setDrawTool('pen'); }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="toolbar-divider" />

                                    <div className="toolbar-group">
                                        <button className={`icon-tool ${drawTool === 'pen' ? 'active' : ''}`} onClick={() => setDrawTool('pen')} title="Pen"><PenTool size={16} /></button>
                                        <button className={`icon-tool ${drawTool === 'eraser' ? 'active' : ''}`} onClick={() => setDrawTool('eraser')} title="Eraser"><Eraser size={16} /></button>
                                        <button className={`icon-tool ${drawTool === 'rect' ? 'active' : ''}`} onClick={() => setDrawTool('rect')} title="Rectangle"><div className="mini-shape rect"></div></button>
                                        <button className={`icon-tool ${drawTool === 'circle' ? 'active' : ''}`} onClick={() => setDrawTool('circle')} title="Circle"><div className="mini-shape circle"></div></button>
                                        <button className={`icon-tool ${drawTool === 'line' ? 'active' : ''}`} onClick={() => setDrawTool('line')} title="Line"><div className="mini-shape line"></div></button>
                                        <button className={`icon-tool ${drawTool === 'triangle' ? 'active' : ''}`} onClick={() => setDrawTool('triangle')} title="Triangle"><div className="mini-shape triangle"></div></button>
                                        <button className={`icon-tool ${drawTool === 'arrow' ? 'active' : ''}`} onClick={() => setDrawTool('arrow')} title="Arrow"><ChevronRight size={16} /></button>
                                    </div>

                                    <div className="toolbar-divider" />

                                    {/* Advanced Diagram Shapes */}
                                    <div className="toolbar-group">
                                        <button className={`icon-tool ${drawTool === 'diamond' ? 'active' : ''}`} onClick={() => setDrawTool('diamond')} title="Diamond (Decision)"><div className="mini-shape diamond"></div></button>
                                        <button className={`icon-tool ${drawTool === 'cylinder' ? 'active' : ''}`} onClick={() => setDrawTool('cylinder')} title="Cylinder (Database)"><div className="mini-shape cylinder"></div></button>
                                        <button className={`icon-tool ${drawTool === 'hexagon' ? 'active' : ''}`} onClick={() => setDrawTool('hexagon')} title="Hexagon (Process)"><div className="mini-shape hexagon"></div></button>
                                        <button className={`icon-tool ${drawTool === 'parallelogram' ? 'active' : ''}`} onClick={() => setDrawTool('parallelogram')} title="Parallelogram (Data)"><div className="mini-shape parallelogram"></div></button>
                                        <button className={`icon-tool ${drawTool === 'doubleArrow' ? 'active' : ''}`} onClick={() => setDrawTool('doubleArrow')} title="Double Arrow (Relationship)"><div className="mini-shape double-arrow"></div></button>
                                    </div>


                                    <div className="toolbar-divider" />

                                    <div className="toolbar-group size-group">
                                        <input
                                            type="range"
                                            min="1"
                                            max={drawTool === 'eraser' ? "100" : "20"}
                                            value={drawTool === 'eraser' ? eraserWidth : drawWidth}
                                            onChange={(e) => drawTool === 'eraser' ? setEraserWidth(parseInt(e.target.value)) : setDrawWidth(parseInt(e.target.value))}
                                            className="compact-slider"
                                        />
                                        <span className="size-indicator">{drawTool === 'eraser' ? eraserWidth : drawWidth}px</span>
                                    </div>

                                    <div className="toolbar-divider" />

                                    <button className="compact-clear-btn" onClick={clearCanvas} title="Clear Canvas">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    width={1920}
                                    height={1080}
                                    className="main-canvas"
                                />
                            </div>

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
                                <span className="prompt-symbol">Î»</span>
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

            </div>

        </>


    );

};



export default EditorPage;

