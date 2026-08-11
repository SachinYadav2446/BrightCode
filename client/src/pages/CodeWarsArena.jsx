import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Swords, Trophy, Clock, Users, Zap, Play, 
    Code, Target, Shield, Crown, Timer, CheckCircle, XCircle,
    Loader, AlertCircle, Star, Award, Plus, Lock, Globe,
    Settings, Copy, Eye, EyeOff, UserPlus, LogOut, RotateCcw,
    ChevronUp, ChevronDown, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { initSocket } from '../socket';
import Editor from '@monaco-editor/react';
import CollaborativeCodeEditor from '../components/codewars/CollaborativeCodeEditor';
import ChatPanel from '../components/ChatPanel';
import BattleCodeEditor from '../components/codewars/BattleCodeEditor';
import './CodeWarsArena.css';

const GAME_MODES = {
    QUICK_BATTLE: {
        name: 'Quick Battle',
        description: '3 questions, 10 minutes',
        duration: 600,
        questions: 3,
        icon: <Zap size={24} />,
        color: '#22c55e'
    },
    STANDARD_WAR: {
        name: 'Standard War', 
        description: '5 questions, 20 minutes',
        duration: 1200,
        questions: 5,
        icon: <Swords size={24} />,
        color: '#f59e0b'
    },
    EPIC_SIEGE: {
        name: 'Epic Siege',
        description: '8 questions, 30 minutes', 
        duration: 1800,
        questions: 8,
        icon: <Crown size={24} />,
        color: 'var(--primary)'
    }
};

const CodeWarsArena = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myFaction, setMyFaction] = useState(null);
    const [gameState, setGameState] = useState('menu'); // menu, room, game, results
    const [currentRoom, setCurrentRoom] = useState(null);
    const [factionRooms, setFactionRooms] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [playerFinished, setPlayerFinished] = useState(false); // Track if current player finished
    const [gameResults, setGameResults] = useState(null); // Store final game results
    const [leftPanelWidth, setLeftPanelWidth] = useState(40); // Percentage width for problem panel
    const [isResizing, setIsResizing] = useState(false);
    
    // Use ref to track if we're processing a game-ended event (forfeit or normal end)
    // This prevents cw-left-room from interfering with results display
    const processingGameEndRef = useRef(false);
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    
    // Create room form state
    const [createForm, setCreateForm] = useState({
        name: '',
        competition: 'code-wars',
        isPrivate: false,
        password: '',
        teamSize: 1,
        maxTeams: 2,
        questionCount: 3,
        timeLimit: 600,
        difficulty: 'mixed',
        allowSpectators: true
    });
    
    // Join room form state
    const [joinForm, setJoinForm] = useState({
        roomId: '',
        password: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        
        console.log('Ã°Å¸Å½Â® CodeWarsArena mounting, user:', user.username);
        
        // Setup socket first
        const s = setupSocketConnection();
        setSocket(s);
        
        // Wait for socket to connect before initializing
        const initTimeout = setTimeout(() => {
            console.log('Ã¢ÂÂ° Socket connection timeout, initializing anyway...');
            initializeArena(s);
        }, 3000); // Wait 3 seconds for socket
        
        const handleConnect = () => {
            console.log('Ã¢Å“â€¦ Socket connected, initializing arena...');
            clearTimeout(initTimeout);
            initializeArena(s);
        };
        
        if (s.connected) {
            // Already connected
            handleConnect();
        } else {
            // Wait for connection
            s.once('connect', handleConnect);
        }
        
        return () => {
            clearTimeout(initTimeout);
            if (s) {
                s.off('connect', handleConnect);
                s.disconnect();
            }
        };
    }, [user]);

    const setupSocketConnection = () => {
        console.log('Ã°Å¸â€Å’ Setting up socket connection...');
        const s = initSocket();
        
        // Connection status logging
        s.on('connect', () => {
            console.log('Ã¢Å“â€¦ Socket connected successfully');
        });
        
        s.on('connect_error', (error) => {
            console.error('Ã¢ÂÅ’ Socket connection error:', error);
            toast.error('Failed to connect to server. Please check if the server is running.');
        });
        
        s.on('disconnect', (reason) => {
            console.warn('Ã¢Å¡Â Ã¯Â¸Â Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                s.connect();
            }
        });
        
        // Socket-based room events (like workspace system)
        s.on('cw-room-created', (data) => {
            console.log('Ã¢Å“â€¦ Room created via socket:', data);
            setLoading(false);
            if (data.success) {
                setCurrentRoom(data.room);
                setGameState('room');
                toast.success(`Room ${data.room.id} created!`);
                // Refresh faction rooms list - use room's faction ID
                if (data.room.factionId) {
                    loadFactionRoomsViaSocket(s, data.room.factionId);
                }
            } else {
                toast.error(data.error || 'Failed to create room');
            }
        });

        s.on('cw-room-joined', (data) => {
            console.log('Ã¢Å“â€¦ Joined room via socket:', data);
            setLoading(false);
            if (data.success) {
                setCurrentRoom(data.room);
                setGameState('room');
                toast.success(`Joined as ${data.role}!`);
            } else {
                toast.error(data.error || 'Failed to join room');
            }
        });

        s.on('cw-player-joined', (data) => {
            console.log('Ã°Å¸â€˜â€¹ Player joined:', data);
            toast.success(`${data.username} joined the room!`);
            // Refresh room list to update player counts
            loadFactionRoomsViaSocket(s);
        });

        s.on('cw-player-left', (data) => {
            console.log('ðŸ‘‹ Player left:', data);
            toast.info(`${data.username} left the room`);
            // Refresh room list
            loadFactionRoomsViaSocket(s);
        });

        s.on('cw-room-update', (data) => {
            console.log('🔄 Room updated:', data);
            setCurrentRoom(data.room);
            if (data.room?.status === 'completed') {
                setGameState('results');
            }
        });

        s.on('cw-game-started', (data) => {
            console.log('🎮 Game started:', data);
            setCurrentRoom(data.room);
            setGameState('game');
            setPlayerFinished(false); // Reset finished state
            setGameResults(null); // Reset results
            toast.success('🎮 Game Started! Good luck!');
        });

        s.on('cw-left-room', (data) => {
            console.log('🚪 Left room event received:', data);
            
            // If we're processing a game-ended event or showing results, ignore this
            if (processingGameEndRef.current || gameState === 'results') {
                console.log('🚪 Ignoring cw-left-room because results are active');
                return;
            }
            
            toast.success('Left room');
            setCurrentRoom(null);
            setPlayerFinished(false);
            navigate('/battle-arena');
        });
        
        s.on('cw-contest-ended', (data) => {
            console.log('🏁 Contest ended for player:', data);
            if (data.success) {
                setPlayerFinished(true);
                if (data.room) setCurrentRoom(data.room);
                if (data.results) setGameResults(data.results);
                setGameState('results');
                toast.success('Contest ended! Showing final standings...', { id: 'cw-game-ended-toast' });
            }
        });
        
        s.on('player-finished', (data) => {
            console.log('👤 Player finished:', data);
            toast.info(`${data.username} finished their contest! (${data.finishedCount}/${data.totalPlayers})`, { id: `player-finished-${data.userId}` });
        });

        s.on('cw-error', (data) => {
            console.error('❌ Socket error:', data);
            setLoading(false);
            toast.error(data.error || 'An error occurred', { id: 'cw-error-toast' });
        });
        
        // Room list updates
        s.on('cw-room-list-updated', (data) => {
            console.log('📋 Room list updated for faction:', data.factionId);
            loadFactionRoomsViaSocket(s, data.factionId);
        });
        
        s.on('cw-faction-rooms', (data) => {
            if (!data.factionId || data.factionId === myFaction?.id) {
                setFactionRooms(data.rooms);
            }
        });

        // Forfeit / Game End handling
        s.on('cw-game-ended', (data) => {
            console.log('🏁 Game ended event received:', data);
            
            processingGameEndRef.current = true;
            
            setCurrentRoom(data.room);
            setGameResults(data.results);
            setGameState('results');
            
            setTimeout(() => {
                processingGameEndRef.current = false;
            }, 1000);
            
            if (data.room?.id) {
                s.emit('cw-leave-room', {
                    roomId: data.room.id,
                    userId: user.id,
                    username: user.username
                });
            }
            
            if (data.reason === 'forfeit') {
                toast.success(`🏆 ${data.results.forfeitedTeam} forfeited the match!`, {
                    id: 'cw-game-ended-toast',
                    duration: 5000
                });
            } else {
                toast.success('Game completed!', { id: 'cw-game-ended-toast' });
            }
        });

        s.on('cw-team-forfeited', (data) => {
            console.log('📢 Team forfeited:', data);
            toast.info(`Team ${data.teamName} has left the match. ${data.remainingTeams} teams remaining.`, {
                id: `forfeit-${data.teamName}`,
                duration: 4000
            });
        });

        // Legacy events for backward compatibility
        s.on('game-ended', (data) => {
            console.log('🏁 Game ended:', data);
            if (data.room) setCurrentRoom(data.room);
            if (data.results) setGameResults(data.results);
            setGameState('results');
            toast.success('Game completed!', { id: 'cw-game-ended-toast' });
        });

        s.on('solution-accepted', (data) => {
            console.log('Ã¢Å“â€¦ Solution accepted:', data);
            toast.success(`${data.username} solved a problem! (+${data.points} points)`);
        });
        
        console.log('Ã¢Å“â€¦ Socket event listeners registered');
        return s;
    };

    const loadFactionRoomsViaSocket = (socketInstance, factionId) => {
        const s = socketInstance || socket;
        const fId = factionId || myFaction?.id;
        
        if (!s) {
            console.log('Ã¢Å¡Â Ã¯Â¸Â Cannot load rooms: socket not ready');
            return;
        }
        
        if (!fId) {
            console.log('Ã¢Å¡Â Ã¯Â¸Â Cannot load rooms: faction ID not available');
            return;
        }
        
        console.log('Ã°Å¸â€œâ€¹ Requesting faction rooms via socket for faction:', fId);
        s.emit('cw-get-faction-rooms', { factionId: fId });
    };

    const initializeArena = async (socketInstance) => {
        try {
            console.log('ðŸŽ® Initializing Code Wars Arena...');
            console.log('ðŸ‘¤ User:', user?.username, 'ID:', user?.id);
            console.log('ðŸ”Œ Socket connected:', socketInstance?.connected);
            
            // Get user's faction
            console.log('ðŸ“¡ Fetching factions from server...');
            const factionsRes = await axios.get(`${API_URL}/factions`);
            console.log('âœ… Factions response:', factionsRes.data);
            
            let userFaction = factionsRes.data.find(f => 
                f.members?.some(m => m.username === user.username)
            );
            
            if (!userFaction) {
                console.log('â„¹ï¸ User not in a specific faction, assigning global arena faction');
                userFaction = factionsRes.data[0] || { id: 'global_arena', name: 'Global Arena', members: [] };
            }
            
            console.log('ðŸ›¡ï¸ User faction loaded:', userFaction.name, 'ID:', userFaction.id);
            setMyFaction(userFaction);
            
            // Check if user requested a specific room/arena via URL parameters or is in a room
            try {
                const searchParams = new URLSearchParams(window.location.search);
                let targetRoomId = searchParams.get('roomId') || searchParams.get('arena');

                if (targetRoomId) {
                    console.log('ðŸ“Œ Target room/arena requested via URL:', targetRoomId);
                    if (targetRoomId.startsWith('arena_')) {
                        try {
                            const startRes = await axios.post(`${API_URL}/arena/start`, { arenaId: targetRoomId }, {
                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            if (startRes.data?.roomId) {
                                targetRoomId = startRes.data.roomId;
                            }
                        } catch (startErr) {
                            console.warn('âš ï¸ Could not start arena from URL param:', startErr.message);
                        }
                    }
                }

                let loadedRoom = null;
                if (targetRoomId) {
                    try {
                        const roomValidation = await axios.get(`${API_URL}/code-wars/debug/room/${targetRoomId}`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (roomValidation.data?.roomExists && roomValidation.data?.room) {
                            loadedRoom = roomValidation.data.room;
                        }
                    } catch (valErr) {
                        console.warn('âš ï¸ Error fetching room by URL target:', valErr.message);
                    }
                }

                if (!loadedRoom) {
                    // Fallback: Check if user is already in a room on server
                    try {
                        const roomRes = await axios.get(`${API_URL}/code-wars/my-room`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (roomRes.data?.id) {
                            const roomValidation = await axios.get(`${API_URL}/code-wars/debug/room/${roomRes.data.id}`, {
                                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                            });
                            if (roomValidation.data?.roomExists && roomValidation.data?.room) {
                                loadedRoom = roomValidation.data.room;
                            }
                        }
                    } catch (err) {
                        console.log('â„¹ï¸ User not in any room (this is normal)');
                    }
                }

                if (loadedRoom) {
                    console.log('âœ… Room loaded successfully:', loadedRoom.id, 'Status:', loadedRoom.status);
                    setCurrentRoom(loadedRoom);
                    // Force state to 'game' so it lands directly on the Judge0 code editor
                    setGameState(loadedRoom.status === 'active' || loadedRoom.status === 'waiting' || loadedRoom.status === 'completed' ? 'game' : 'room');
                    
                    if (socketInstance) {
                        socketInstance.emit('join-code-wars-room', { 
                            roomId: loadedRoom.id, 
                            userId: user.id || user._id
                        });
                    }
                } else {
                    console.log('â„¹ï¸ No active match found, returning to Battle Arena');
                    navigate('/battle-arena');
                    return;
                }
            } catch (err) {
                console.log('â„¹ï¸ Room initialization notice:', err.message);
                navigate('/battle-arena');
                return;
            }
            
            // Get faction rooms via socket - PASS FACTION ID DIRECTLY
            if (socketInstance && socketInstance.connected) {
                console.log('Ã°Å¸â€œâ€¹ Loading faction rooms for:', userFaction.id);
                loadFactionRoomsViaSocket(socketInstance, userFaction.id);
            } else {
                console.warn('Ã¢Å¡Â Ã¯Â¸Â Socket not connected, cannot load faction rooms');
                toast.error('Socket not connected. Some features may not work.');
            }
            
            console.log('Ã¢Å“â€¦ Arena initialization complete');
            setLoading(false);
            

            
        } catch (error) {
            console.error('Ã¢ÂÅ’ Failed to initialize arena:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            setLoading(false);
            
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.');
                navigate('/auth');
            } else if (error.message.includes('Network Error')) {
                toast.error('Cannot connect to server. Please check if the server is running.');
            } else {
                toast.error(`Failed to load Code Wars Arena: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadFactionRooms = () => {
        loadFactionRoomsViaSocket(socket);
    };

    const createRoom = async () => {
        const userId = user?.id || user?._id;
        if (!user || !userId) {
            toast.error('User session invalid. Please log in again.');
            return;
        }

        try {
            setLoading(true);
            console.log('ðŸ—ï¸ Creating room via API...', {
                userId,
                username: user.username,
                factionId: myFaction?.id,
                roomConfig: createForm
            });

            await createRoomViaHTTP();
            
        } catch (error) {
            console.error('Create room error:', error);
            toast.error('Failed to create room: ' + (error.response?.data?.error || error.message));
            setLoading(false);
        }
    };
    
    const createRoomViaHTTP = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Session expired. Please log in again.');
                return;
            }

            const response = await axios.post(`${API_URL}/code-wars/create-room`, {
                name: createForm.name || 'Battle Arena',
                isPrivate: createForm.isPrivate,
                password: createForm.password,
                gameMode: createForm.competition || 'QUICK_BATTLE',
                teamSize: createForm.teamSize,
                maxTeams: createForm.maxTeams,
                questionCount: createForm.questionCount,
                timeLimit: createForm.timeLimit,
                difficulty: createForm.difficulty,
                allowSpectators: createForm.allowSpectators,
                factionId: myFaction?.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('âœ… Room created via API:', response.data);
            const createdRoom = response.data.room;
            setCurrentRoom(createdRoom);
            setGameState('room');
            setShowCreateModal(false);
            setLoading(false);
            toast.success(`Room ${createdRoom.id} created successfully!`);
            
            // Join socket room if socket is available
            if (socket && socket.connected) {
                socket.emit('join-code-wars-room', {
                    roomId: createdRoom.id,
                    userId: user?.id || user?._id
                });
            }
            
            // Refresh room list
            loadFactionRooms();
            
        } catch (error) {
            console.error('HTTP create room error:', error);
            setLoading(false);
            
            if (error.response?.status === 401 && !localStorage.getItem('token')) {
                toast.error('Authentication failed. Please log in again.');
            } else if (error.message.includes('Network Error')) {
                toast.error('Cannot connect to server. Please check if the server is running on port 5051.');
            } else {
                toast.error(error.response?.data?.error || error.message || 'Failed to create room');
            }
        }
    };

    const joinRoom = async (roomId, password = '') => {
        const userId = user?.id || user?._id;
        if (!user || !userId) {
            toast.error('User authentication error. Please log in again.');
            return;
        }
        
        if (!myFaction || !myFaction.id) {
            toast.error('Faction not loaded. Please refresh the page.');
            return;
        }

        try {
            setLoading(true);
            
            const actualRoomId = roomId || joinForm.roomId;
            const actualPassword = password || joinForm.password;
            
            if (!actualRoomId || actualRoomId.trim().length === 0) {
                toast.error('Please enter a room code');
                setLoading(false);
                return;
            }
            
            console.log('Ã°Å¸Å¡Âª Joining room...', {
                roomId: actualRoomId.toUpperCase().trim(),
                userId: user.id,
                username: user.username,
                factionId: myFaction.id,
                hasPassword: !!actualPassword,
                socketConnected: socket?.connected
            });
            
            // Try socket first if connected
            if (socket && socket.connected) {
                console.log('Ã°Å¸â€œÂ¡ Using socket to join room...');
                socket.emit('cw-join-room', {
                    roomId: actualRoomId.toUpperCase().trim(),
                    userId: user.id,
                    username: user.username,
                    factionId: myFaction.id,
                    password: actualPassword
                });
                
                // Set timeout in case socket doesn't respond
                setTimeout(() => {
                    if (loading) {
                        console.warn('Ã¢ÂÂ° Socket timeout, falling back to HTTP...');
                        joinRoomViaHTTP(actualRoomId, actualPassword);
                    }
                }, 5000);
            } else {
                // Fallback to HTTP if socket not connected
                console.log('Ã°Å¸â€œÂ¡ Socket not connected, using HTTP...');
                await joinRoomViaHTTP(actualRoomId, actualPassword);
            }
            
        } catch (error) {
            console.error('Join room error:', error);
            toast.error('Failed to join room');
            setLoading(false);
        }
    };
    
    const joinRoomViaHTTP = async (roomId, password) => {
        try {
            const response = await axios.post(`${API_URL}/code-wars/join-room`, {
                roomId: roomId.toUpperCase().trim(),
                password: password || ''
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            console.log('Ã¢Å“â€¦ Joined room via HTTP:', response.data);
            setCurrentRoom(response.data.room);
            setGameState('room');
            setLoading(false);
            toast.success('Joined room successfully!');
            
            // Join socket room if socket is available
            if (socket && socket.connected) {
                socket.emit('join-code-wars-room', {
                    roomId: response.data.room.id,
                    userId: user.id
                });
            }
            
        } catch (error) {
            console.error('HTTP join room error:', error);
            setLoading(false);
            
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.');
                navigate('/auth');
            } else if (error.response?.status === 404) {
                toast.error('Room not found. Please check the room code.');
            } else if (error.message.includes('Network Error')) {
                toast.error('Cannot connect to server. Please check if the server is running on port 5051.');
            } else {
                toast.error(error.response?.data?.error || 'Failed to join room');
            }
        }
    };

    const leaveRoom = async () => {
        if (!socket || !currentRoom) {
            setCurrentRoom(null);
            navigate('/battle-arena');
            return;
        }

        try {
            socket.emit('cw-leave-room', {
                roomId: currentRoom.id,
                userId: user.id,
                username: user.username
            });
            setCurrentRoom(null);
            navigate('/battle-arena');
        } catch (error) {
            console.error('Leave room error:', error);
            setCurrentRoom(null);
            navigate('/battle-arena');
        }
    };

    const disbandRoom = async () => {
        if (!socket || !currentRoom) {
            setCurrentRoom(null);
            navigate('/battle-arena');
            return;
        }

        try {
            socket.emit('cw-disband-room', {
                roomId: currentRoom.id,
                userId: user.id,
                username: user.username
            });
            setCurrentRoom(null);
            navigate('/battle-arena');
        } catch (error) {
            console.error('Disband room error:', error);
            setCurrentRoom(null);
            navigate('/battle-arena');
        }
    };

    const startGame = async () => {
        if (!socket || !currentRoom) {
            toast.error('Socket not connected or no room');
            return;
        }

        try {
            console.log('Ã°Å¸Å½Â® Starting game via socket...');
            
            socket.emit('cw-start-game', {
                roomId: currentRoom.id,
                userId: user.id
            });
            
            // Response will come via 'cw-game-started' event
            
        } catch (error) {
            console.error('Start game error:', error);
            toast.error('Failed to start game');
        }
    };

    const switchTeam = async (teamId) => {
        try {
            const response = await axios.post(`${API_URL}/code-wars/switch-team`, {
                teamId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setCurrentRoom(response.data.room);
            toast.success(`Switched to ${teamId}`);
            
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to switch team');
        }
    };
    
    const endContest = () => {
        if (!socket || !currentRoom || !user) {
            return;
        }
        
        console.log('Ã°Å¸ÂÂ Ending contest for player...');
        
        socket.emit('cw-end-contest', {
            roomId: currentRoom.id,
            userId: user.id,
            username: user.username
        });
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(currentRoom.id);
        toast.success('Room ID copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="code-wars-loading">
                <div className="loading-spinner">
                    <Loader className="spin" size={48} />
                </div>
                <p>Loading Code Wars Arena...</p>
            </div>
        );
    }

    return (
        <div className="code-wars-arena">
            {/* Custom Arena Header - Show for menu/create/join/room states, hide during game/waiting/results */}
            {(gameState === 'menu' || gameState === 'create' || gameState === 'join' || gameState === 'room') && (
                <header className="arena-header">
                    <div className="arena-header-left">
                        {gameState !== 'room' && (
                            <button className="back-btn" onClick={() => {
                                if (gameState === 'create' || gameState === 'join') {
                                    setGameState('menu');
                                } else {
                                    navigate(-1);
                                }
                            }}>
                                <ArrowLeft size={20} />
                            </button>
                        )}
                    </div>
                    <div className="arena-title">
                        <h1>Syntax Showdown</h1>
                    </div>
                    <div className="arena-header-right">
                        {myFaction && (
                            <div className="faction-badge">
                                <Shield size={18} />
                                <span>{myFaction.name}</span>
                            </div>
                        )}
                    </div>
                </header>
            )}

            <main className="arena-content">
                <AnimatePresence mode="wait">
                    {gameState === 'menu' && (
                        <MenuScreen 
                            factionRooms={factionRooms}
                            onCreateRoom={() => setShowCreateModal(true)}
                            onJoinRoom={() => setShowJoinModal(true)}
                            onJoinRoomDirect={joinRoom}
                            onRefresh={loadFactionRooms}
                        />
                    )}

                    {gameState === 'room' && currentRoom && (
                        <RoomLobby 
                            room={currentRoom}
                            user={user}
                            onLeave={leaveRoom}
                            onDisband={disbandRoom}
                            onStart={startGame}
                            onSwitchTeam={switchTeam}
                            onCopyId={copyRoomId}
                        />
                    )}

                    {gameState === 'game' && currentRoom && (
                        <BattleCodeEditor
                            room={currentRoom}
                            user={user}
                            socket={socket}
                            playerFinished={playerFinished}
                            onEndContest={endContest}
                        />
                    )}
                    
                    {gameState === 'waiting' && currentRoom && (
                        <WaitingForPlayers 
                            room={currentRoom}
                            user={user}
                        />
                    )}
                    
                    {gameState === 'results' && currentRoom && (
                        <ResultsScreen 
                            room={currentRoom}
                            results={gameResults}
                            user={user}
                            onBackToMenu={() => {
                                setCurrentRoom(null);
                                setGameResults(null);
                                setPlayerFinished(false);
                                navigate('/battle-arena');
                            }}
                        />
                    )}
                </AnimatePresence>
            </main>

            {/* Create Room Modal */}
            {showCreateModal && (
                <ModalOverlay onClose={() => setShowCreateModal(false)}>
                    <CreateRoomScreen 
                        form={createForm}
                        setForm={setCreateForm}
                        onSubmit={(e) => {
                            createRoom(e);
                            setShowCreateModal(false);
                        }}
                        onBack={() => setShowCreateModal(false)}
                        loading={loading}
                    />
                </ModalOverlay>
            )}

            {/* Join Room Modal */}
            {showJoinModal && (
                <ModalOverlay onClose={() => setShowJoinModal(false)}>
                    <JoinRoomScreen 
                        form={joinForm}
                        setForm={setJoinForm}
                        onSubmit={() => {
                            joinRoom();
                            setShowJoinModal(false);
                        }}
                        onBack={() => setShowJoinModal(false)}
                        loading={loading}
                    />
                </ModalOverlay>
            )}
        </div>
    );
};

// Modal Overlay Component
const ModalOverlay = ({ children, onClose }) => {
    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

// Menu Screen Component
const MenuScreen = ({ factionRooms, onCreateRoom, onJoinRoom, onJoinRoomDirect, onRefresh }) => {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };

    return (
        <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="arena-menu-rebuilt"
            onMouseMove={handleMouseMove}
        >
            {/* Video Background */}
            <div className="video-background">
                <video autoPlay loop muted playsInline className="background-video">
                    <source src="/4990246-hd_1920_1080_30fps.mp4" type="video/mp4" />
                </video>
                <div className="video-overlay"></div>
            </div>

            {/* Grid Background with Cursor Spotlight */}
            <div className="grid-background">
                <div 
                    className="cursor-spotlight"
                    style={{
                        left: `${mousePosition.x}px`,
                        top: `${mousePosition.y}px`,
                    }}
                />
            </div>

            {/* Hero Content Section */}
            <div className="hero-content-wrapper">
                {/* Content Section - Full Width with Blur */}
                <div className="hero-content-section">
                    <h1 className="hero-title">Join the Battle</h1>
                    <p className="hero-subtitle">Create custom rooms or join existing battles within your faction</p>
                </div>
                
                {/* Buttons Section - Transparent */}
                <div className="hero-buttons-section">
                    <motion.button
                        className="hero-btn create-btn"
                        onClick={onCreateRoom}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Plus size={20} />
                        Create Room
                    </motion.button>
                    
                    <motion.button
                        className="hero-btn join-btn"
                        onClick={onJoinRoom}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <UserPlus size={20} />
                        Join with Code
                    </motion.button>
                </div>
            </div>

            {/* Active Faction Rooms Section */}
            <div className="floating-table-container">
                <div className="table-header-row">
                    <h2 className="table-title">Active Faction Rooms</h2>
                    <div className="table-header-actions">
                        <span className="rooms-count">{factionRooms.length} public rooms</span>
                        <button className="refresh-table-btn" onClick={onRefresh}>
                            <RotateCcw size={16} />
                            Refresh
                        </button>
                    </div>
                </div>

                {factionRooms.length === 0 ? (
                    <div className="empty-table-state">
                        <Swords size={48} className="empty-icon" />
                        <h3>No active rooms</h3>
                        <p>Be the first to create a battle room for your faction!</p>
                    </div>
                ) : (
                    <div className="rooms-table">
                        <div className="table-header-columns">
                            <div className="col-room">ROOM</div>
                            <div className="col-mode">MODE</div>
                            <div className="col-players">PLAYERS</div>
                            <div className="col-map">MAP</div>
                            <div className="col-status">STATUS</div>
                        </div>
                        
                        <div className="table-body">
                            {factionRooms.map(room => (
                                <RoomCard 
                                    key={room.id} 
                                    room={room} 
                                    onJoin={() => onJoinRoomDirect(room.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Room Card Component
const RoomCard = ({ room, onJoin }) => {
    const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);
    const maxPlayers = room.teamSize * room.maxTeams;
    const isFull = totalPlayers >= maxPlayers;
    
    return (
        <div className="room-card-row" onClick={!isFull ? onJoin : undefined}>
            <div className="col-room">
                <div className="room-name-main">{room.name}</div>
                <div className="room-id-badge">#{room.id}</div>
            </div>
            <div className="col-mode">
                {room.teamSize}v{room.teamSize}
            </div>
            <div className="col-players">
                <Users size={14} />
                {totalPlayers}/{maxPlayers}
            </div>
            <div className="col-map">
                <Target size={14} />
                {room.questionCount}Q
            </div>
            <div className="col-status">
                {isFull ? (
                    <span className="status-full-badge">FULL</span>
                ) : room.isPrivate ? (
                    <span className="status-private-badge">
                        <Lock size={14} />
                        PRIVATE
                    </span>
                ) : (
                    <span className="status-open-badge">OPEN</span>
                )}
            </div>
        </div>
    );
};

const COMPETITION_MODES = [
    {
        id: 'code-wars',
        name: 'Syntax Showdown',
        subtitle: 'Timed battle duels (1v1, 2v2, 4v4)',
        icon: Swords,
        color: '#ef4444',
        defaultTeamSize: 1,
        teamSizeLocked: false,
        allowedTeamSizes: [1, 2, 4],
        defaultQuestions: 3,
        questionCountLocked: false,
        allowedQuestions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        defaultTimeLimit: 600,
        badgeText: 'Customizable 1v1 / 2v2 / 4v4 room rules'
    },
    {
        id: 'algorithm-duel',
        name: 'Algorithm Duel',
        subtitle: '1v1 Speed & Runtime optimization',
        icon: Zap,
        color: '#ec4899',
        defaultTeamSize: 1,
        teamSizeLocked: true,
        allowedTeamSizes: [1],
        defaultQuestions: 1,
        questionCountLocked: false,
        allowedQuestions: [1, 2, 3],
        defaultTimeLimit: 600,
        badgeText: 'Fixed 1v1 duel â€” Master speed & runtime complexity'
    },
    {
        id: 'hackathon-hub',
        name: 'Hackathon Hub',
        subtitle: 'Multi-question 2v2 & 4v4 marathons',
        icon: Trophy,
        color: '#06b6d4',
        defaultTeamSize: 2,
        teamSizeLocked: false,
        allowedTeamSizes: [2, 4],
        defaultQuestions: 5,
        questionCountLocked: false,
        allowedQuestions: [5, 8, 10],
        defaultTimeLimit: 1800,
        badgeText: 'Team marathon â€” Minimum 5 questions in 2v2 or 4v4'
    },
    {
        id: 'faction-wars',
        name: 'Faction Wars',
        subtitle: '4v4 Faction Territory battles',
        icon: Users,
        color: '#f59e0b',
        defaultTeamSize: 4,
        teamSizeLocked: true,
        allowedTeamSizes: [4],
        defaultQuestions: 5,
        questionCountLocked: false,
        allowedQuestions: [3, 5, 8],
        defaultTimeLimit: 1200,
        badgeText: 'Fixed 4v4 Faction Squad Battle for Territory Elo'
    }
];

// Create Room Screen Component
const CreateRoomScreen = ({ form, setForm, onSubmit, onBack, loading }) => {
    const currentMode = COMPETITION_MODES.find(m => m.id === (form.competition || 'code-wars')) || COMPETITION_MODES[0];

    return (
        <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="create-room-screen"
        >
            <div className="screen-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h2>Create Battle Room</h2>
            </div>
            
            <div className="create-form">
                <div className="form-group">
                    <label>Select Competition</label>
                    <div className="competition-selector-grid">
                        {COMPETITION_MODES.map(mode => {
                            const ModeIcon = mode.icon;
                            const isSelected = (form.competition || 'code-wars') === mode.id;
                            return (
                                <div
                                    key={mode.id}
                                    className={`competition-card ${isSelected ? 'selected' : ''}`}
                                    onClick={() => {
                                        setForm({
                                            ...form,
                                            competition: mode.id,
                                            teamSize: mode.defaultTeamSize,
                                            questionCount: mode.defaultQuestions,
                                            timeLimit: mode.defaultTimeLimit,
                                            name: form.name || `${mode.name} Room`
                                        });
                                    }}
                                >
                                    <div className="comp-card-icon" style={{ background: mode.color }}>
                                        <ModeIcon size={18} />
                                    </div>
                                    <div className="comp-card-info">
                                        <div className="comp-card-name">{mode.name}</div>
                                        <div className="comp-card-sub">{mode.subtitle}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Mode Rules Banner */}
                <div className="mode-rules-banner" style={{ borderColor: currentMode.color }}>
                    <span className="mode-badge-tag" style={{ background: currentMode.color }}>
                        {currentMode.name}
                    </span>
                    <span className="mode-rules-desc">{currentMode.badgeText}</span>
                </div>

                <div className="form-group">
                    <label>Room Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        placeholder="Epic Battle Arena"
                        maxLength={30}
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>
                            Team Size {currentMode.teamSizeLocked && <Lock size={12} className="lock-inline-icon" />}
                        </label>
                        <select
                            value={form.teamSize}
                            disabled={currentMode.teamSizeLocked}
                            onChange={(e) => setForm({...form, teamSize: parseInt(e.target.value)})}
                            className={currentMode.teamSizeLocked ? 'disabled-select' : ''}
                        >
                            {currentMode.allowedTeamSizes.map(size => (
                                <option key={size} value={size}>
                                    {size}v{size} {currentMode.teamSizeLocked ? '(Fixed)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Number of Teams</label>
                        <select
                            value={form.maxTeams}
                            onChange={(e) => setForm({...form, maxTeams: parseInt(e.target.value)})}
                        >
                            <option value={2}>2 Teams</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Questions</label>
                        <select
                            value={form.questionCount}
                            onChange={(e) => setForm({...form, questionCount: parseInt(e.target.value)})}
                        >
                            {currentMode.allowedQuestions.map(n => (
                                <option key={n} value={n}>{n} question{n > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Time Limit</label>
                        <select
                            value={form.timeLimit}
                            onChange={(e) => setForm({...form, timeLimit: parseInt(e.target.value)})}
                        >
                            <option value={300}>5 minutes</option>
                            <option value={600}>10 minutes</option>
                            <option value={900}>15 minutes</option>
                            <option value={1200}>20 minutes</option>
                            <option value={1800}>30 minutes</option>
                            <option value={3600}>1 hour</option>
                        </select>
                    </div>
                </div>
            
            <div className="form-group">
                <label>Difficulty</label>
                <select
                    value={form.difficulty}
                    onChange={(e) => setForm({...form, difficulty: e.target.value})}
                >
                    <option value="mixed">Mixed (Recommended)</option>
                    <option value="easy">Easy Only</option>
                    <option value="medium">Medium Only</option>
                    <option value="hard">Hard Only</option>
                </select>
            </div>
            
            {/* Privacy Row with Create Button */}
            <div className="privacy-row-with-button">
                <div className="privacy-controls-row">
                    <div className="privacy-controls-horizontal">
                        <div className="privacy-button-group">
                            <button
                                type="button"
                                className={`privacy-btn ${!form.isPrivate ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setForm({...form, isPrivate: false, password: ''});
                                }}
                            >
                                <Globe size={14} />
                                Public
                            </button>
                            <button
                                type="button"
                                className={`privacy-btn ${form.isPrivate ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setForm({...form, isPrivate: true});
                                }}
                            >
                                <Lock size={14} />
                                Private
                            </button>
                        </div>
                        
                        {form.isPrivate && (
                            <motion.div 
                                className="password-inline-horizontal"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                            >
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({...form, password: e.target.value})}
                                    placeholder="Enter password"
                                    maxLength={20}
                                />
                            </motion.div>
                        )}
                    </div>
                    
                    <button 
                        className="create-submit-btn-inline"
                        onClick={onSubmit}
                        disabled={loading || !form.name.trim() || (form.isPrivate && !form.password.trim())}
                    >
                        {loading ? (
                            <>
                                <Loader className="spin" size={16} />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Swords size={16} />
                                Create Battle Room
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
    );
};

// Join Room Screen Component
const JoinRoomScreen = ({ form, setForm, onSubmit, onBack, loading }) => {
    const [showPassword, setShowPassword] = React.useState(false);
    
    return (
        <motion.div
            key="join"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="join-room-screen"
        >
            <div className="screen-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                <h2>Join Battle Room</h2>
            </div>
            
            <div className="join-form">
                <div className="form-group">
                    <label>Room Code</label>
                    <input
                        type="text"
                        value={form.roomId}
                        onChange={(e) => setForm({...form, roomId: e.target.value.toUpperCase()})}
                        placeholder="Enter 6-character room code"
                        maxLength={6}
                        style={{ textTransform: 'uppercase' }}
                    />
                    <div className="form-hint">
                        Ask the room creator for the 6-character room code
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Password (if private room)</label>
                    <div className="password-field">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => setForm({...form, password: e.target.value})}
                            placeholder="Enter room password"
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <div className="form-hint">
                        Leave empty if joining a public room
                    </div>
                </div>
                
                <button 
                    className="join-submit-btn"
                    onClick={onSubmit}
                    disabled={loading || !form.roomId.trim()}
                >
                    {loading ? (
                        <>
                            <Loader className="spin" size={16} />
                            Joining...
                        </>
                    ) : (
                        <>
                            <UserPlus size={16} />
                            Join Battle
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

// Room Lobby Component
const RoomLobby = ({ room, user, onLeave, onDisband, onStart, onSwitchTeam, onCopyId }) => {
    if (!user || !user.id) {
        return (
            <div className="room-lobby-error">
                <AlertCircle size={24} />
                <h3>Authentication Error</h3>
                <p>Please refresh the page and try again.</p>
                <button onClick={() => window.location.reload()}>Refresh Page</button>
            </div>
        );
    }

    const isCreator = room.creatorId === user.id;
    const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);
    const minPlayers = 2;
    const canStart = isCreator && totalPlayers >= minPlayers;
    const myTeam = room.teams.find(team => team.players.some(p => p.id === user.id));
    
    return (
        <motion.div
            key="room"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="room-lobby"
        >
            <div className="lobby-card">
                {/* Top Section: Room Info */}
                <div className="lobby-top">
                    <div className="room-title-section">
                        <h2>{room.name}</h2>
                        <span className="room-code">
                            Room: {room.id}
                            <button onClick={onCopyId}><Copy size={14} /></button>
                        </span>
                    </div>
                    <div className="room-config">
                        <span>{room.teamSize}v{room.teamSize}</span>
                        <span>â€¢</span>
                        <span>{room.questionCount} questions</span>
                        <span>â€¢</span>
                        <span>{Math.floor(room.timeLimit / 60)}m</span>
                    </div>
                    <span className={`badge-privacy ${room.isPrivate ? 'private' : 'public'}`}>
                        {room.isPrivate ? <><Lock size={12} /> PRIVATE</> : <><Globe size={12} /> PUBLIC</>}
                    </span>
                </div>

                {/* Middle Section: Teams Side by Side */}
                <div className="lobby-teams">
                    {room.teams.map(team => (
                        <TeamPanel 
                            key={team.id}
                            team={team}
                            room={room}
                            user={user}
                            isMyTeam={myTeam?.id === team.id}
                            onSwitchTeam={() => onSwitchTeam(team.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Actions Outside Card */}
            <div className="lobby-actions-container">
                {!canStart && isCreator && (
                    <div className="warning-text">
                        <AlertCircle size={18} />
                        Need at least {minPlayers} players to start
                    </div>
                )}
                <div className="lobby-actions">
                    {isCreator && (
                        <button className="btn-start" onClick={onStart} disabled={!canStart}>
                            <Play size={16} />
                            Start Game
                        </button>
                    )}
                    {isCreator ? (
                        <button className="btn-disband" onClick={onDisband}>
                            <LogOut size={16} />
                            Disband Arena
                        </button>
                    ) : (
                        <button className="btn-leave" onClick={onLeave}>
                            <LogOut size={16} />
                            Leave
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Team Panel Component
const TeamPanel = ({ team, room, user, isMyTeam, onSwitchTeam }) => {
    const canJoinTeam = team.players.length < room.teamSize && !isMyTeam && room.status === 'waiting';
    
    return (
        <article className={`team-panel ${isMyTeam ? 'my-team' : ''}`}>
            <header className="team-header">
                <h3>{team.name}</h3>
                <span className="team-count">{team.players.length}/{room.teamSize}</span>
            </header>
            
            <ul className="team-players">
                {team.players.map(player => (
                    <li key={player.id} className={`player ${player.id === user.id ? 'me' : ''}`}>
                        <span className="player-avatar">
                            {player.username.charAt(0).toUpperCase()}
                        </span>
                        <span className="player-name">
                            {player.username}
                            {player.id === room.creatorId && <Crown size={12} className="creator-icon" />}
                        </span>
                    </li>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: room.teamSize - team.players.length }).map((_, i) => (
                    <li key={`empty-${i}`} className="player empty">
                        <span className="player-avatar empty">
                            <UserPlus size={16} />
                        </span>
                        <span className="player-name">Waiting...</span>
                    </li>
                ))}
            </ul>
            
            {canJoinTeam && (
                <button className="btn-join-team" onClick={onSwitchTeam}>
                    Join Team
                </button>
            )}
        </article>
    );
};
// Waiting For Players Component (After ending contest early)
const WaitingForPlayers = ({ room, user }) => {
    const finishedCount = room.finishedPlayers ? room.finishedPlayers.length : 0;
    const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);
    
    // Find player's info
    let myPlayer = null;
    let myTeam = null;
    for (const team of room.teams) {
        const player = team.players.find(p => p.id === user.id);
        if (player) {
            myPlayer = player;
            myTeam = team;
            break;
        }
    }
    
    return (
        <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="waiting-for-players"
        >
            <div className="waiting-content">
                <div className="waiting-animation">
                    <div className="pulse-ring"></div>
                    <div className="pulse-ring delay-1"></div>
                    <div className="pulse-ring delay-2"></div>
                    <Clock size={64} className="waiting-icon" />
                </div>
                
                <h2>Waiting for Other Players</h2>
                <p>You've finished your contest! Great job!</p>
                
                <div className="waiting-stats">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <CheckCircle size={32} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{finishedCount}/{totalPlayers}</div>
                            <div className="stat-label">Players Finished</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Trophy size={32} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{myPlayer?.score || 0}</div>
                            <div className="stat-label">Your Score</div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Target size={32} />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{myPlayer?.questionsCompleted || 0}/{room.questions.length}</div>
                            <div className="stat-label">Questions Solved</div>
                        </div>
                    </div>
                </div>
                
                <div className="players-status">
                    <h3>Player Status</h3>
                    <div className="players-grid">
                        {room.teams.map(team => (
                            team.players.map(player => {
                                const isFinished = Array.isArray(room.finishedPlayers) && room.finishedPlayers.includes(player.id);
                                return (
                                    <div key={player.id} className={`player-status-card ${isFinished ? 'finished' : 'playing'}`}>
                                        <div className="player-avatar">
                                            {player.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="player-details">
                                            <div className="player-name">{player.username}</div>
                                            <div className="player-team">{team.name}</div>
                                        </div>
                                        <div className="player-status-badge">
                                            {isFinished ? (
                                                <>
                                                    <CheckCircle size={16} />
                                                    <span>Finished</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Loader className="spin" size={16} />
                                                    <span>Playing</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>
                
                <div className="waiting-message">
                    <AlertCircle size={20} />
                    <p>The game will end automatically when all players finish or time runs out.</p>
                </div>
            </div>
        </motion.div>
    );
};

// Results Screen Component
// Results Screen Component — Premium Redesign
const ResultsScreen = ({ room, results, user, onBackToMenu }) => {
    const gameResults = results || calculateResults(room);
    
    function calculateResults(room) {
        const teamResults = (room.teams || []).map(team => ({
            teamId: team.id,
            teamName: team.name,
            totalScore: room.scores?.[team.id] || 0,
            questionsCompleted: team.questionsCompleted || 0,
            failedAttempts: team.failedAttempts || 0,
            players: (team.players || []).map(p => ({
                id: p.id,
                username: p.username,
                score: p.score || 0,
                questionsCompleted: p.questionsCompleted || 0
            }))
        }));
        
        teamResults.sort((a, b) => {
            if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
            return a.failedAttempts - b.failedAttempts;
        });
        
        return {
            winner: teamResults[0] || { teamId: '', teamName: 'No Winner', totalScore: 0 },
            rankings: teamResults,
            gameStats: {
                totalQuestions: room.questions?.length || 0,
                gameDuration: room.timeLimit || 600,
                totalPlayers: (room.teams || []).reduce((sum, team) => sum + (team.players?.length || 0), 0)
            }
        };
    }
    
    const myTeam = room?.teams?.find(team => 
        team.players?.some(p => p.id === user?.id)
    );
    
    const myPlayer = myTeam?.players?.find(p => p.id === user?.id);
    const isWinner = myTeam?.id === gameResults.winner?.teamId;
    const questionsTotal = gameResults.gameStats?.totalQuestions || 1;
    const questionsSolved = myPlayer?.questionsCompleted || 0;
    const solvePct = Math.round((questionsSolved / questionsTotal) * 100);

    return (
        <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="results-screen-rebuilt"
        >
            {/* Victory Hero Header Card */}
            <div className="results-hero-banner">
                <div className="results-hero-glow" />
                
                <div className="results-hero-icon-wrap">
                    {isWinner ? (
                        <div className="results-icon-ring winner">
                            <Crown size={44} className="hero-crown-icon" />
                        </div>
                    ) : (
                        <div className="results-icon-ring completed">
                            <Trophy size={40} className="hero-trophy-icon" />
                        </div>
                    )}
                </div>

                <div className="results-hero-text-wrap">
                    <h1 className="results-hero-title">
                        {gameResults.reason === 'forfeit'
                            ? (isWinner ? 'VICTORY BY FORFEIT' : 'MATCH TERMINATED')
                            : isWinner
                            ? 'VICTORY!'
                            : 'MATCH COMPLETED'}
                    </h1>
                    
                    <p className="results-hero-sub">
                        {isWinner
                            ? 'Outstanding performance! Your team dominated the battle arena.'
                            : 'Well fought! Review your performance and team rankings below.'}
                    </p>

                    <div className="results-room-meta-badge">
                        <Shield size={13} /> {room?.name || 'Battle Arena'} &bull; {room?.gameMode || 'Syntax Showdown'}
                    </div>
                </div>
            </div>

            {/* Main Stats & Leaderboard Grid */}
            <div className="results-grid-container">
                {/* Left Column: Personal Performance Card */}
                <div className="results-card personal-perf-card">
                    <div className="results-card-head">
                        <Zap size={16} className="card-head-icon" />
                        <h3>Your Performance</h3>
                    </div>

                    <div className="perf-big-stat">
                        <div className="perf-score-val">{myPlayer?.score || 0}</div>
                        <div className="perf-score-lbl">Total Score Points</div>
                    </div>

                    <div className="perf-meter-wrap">
                        <div className="perf-meter-labels">
                            <span>Questions Solved</span>
                            <span>{questionsSolved} / {questionsTotal} ({solvePct}%)</span>
                        </div>
                        <div className="perf-meter-bar">
                            <div className="perf-meter-fill" style={{ width: `${solvePct}%` }} />
                        </div>
                    </div>

                    <div className="perf-meta-list">
                        <div className="perf-meta-row">
                            <span className="perf-lbl">Your Team</span>
                            <span className="perf-val highlight">{myTeam?.name || 'Solo'}</span>
                        </div>
                        <div className="perf-meta-row">
                            <span className="perf-lbl">Match Rank</span>
                            <span className="perf-val">
                                {isWinner ? '🥇 1st Place (Winner)' : '🥈 Participant'}
                            </span>
                        </div>
                        <div className="perf-meta-row">
                            <span className="perf-lbl">XP Awarded</span>
                            <span className="perf-val" style={{ color: '#22c55e', fontWeight: 800 }}>
                                +{100 + (gameResults.rankings?.find(r => r.teamId === myTeam?.id)?.totalScore || 0)} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Team Rankings Leaderboard */}
                <div className="results-card team-rankings-card">
                    <div className="results-card-head">
                        <Trophy size={16} className="card-head-icon" />
                        <h3>Final Standings</h3>
                    </div>

                    <div className="rankings-podium-list">
                        {gameResults.rankings.map((team, index) => {
                            const isMyTeamCard = team.teamId === myTeam?.id;
                            const isWinnerTeam = index === 0;

                            return (
                                <div 
                                    key={team.teamId || `team_${index}`} 
                                    className={`podium-card ${isWinnerTeam ? 'gold-winner' : ''} ${isMyTeamCard ? 'my-team-highlight' : ''}`}
                                >
                                    <div className="podium-rank">
                                        {isWinnerTeam ? (
                                            <div className="crown-badge"><Crown size={18} /></div>
                                        ) : (
                                            <div className="rank-num">#{index + 1}</div>
                                        )}
                                    </div>

                                    <div className="podium-team-details">
                                        <div className="podium-team-head">
                                            <span className="podium-team-name">{team.teamName}</span>
                                            {isMyTeamCard && <span className="your-team-pill">YOUR TEAM</span>}
                                        </div>

                                        <div className="podium-stats-row">
                                            <span className="podium-stat-chip score">
                                                <Trophy size={12} /> {team.totalScore} pts
                                            </span>
                                            <span className="podium-stat-chip solved">
                                                <Target size={12} /> {team.questionsCompleted} solved
                                            </span>
                                            <span className="podium-stat-chip errors">
                                                <CheckCircle size={12} /> {team.failedAttempts || 0} fails
                                            </span>
                                        </div>

                                        {/* Player Avatars Row */}
                                        <div className="podium-players-row">
                                            {team.players.map((p, pidx) => (
                                                <div key={p.id || p.username || `p_${pidx}`} className="podium-player-tag" title={`${p.username}: ${p.score} pts`}>
                                                    <span className="player-initial">{(p.username || 'P').charAt(0).toUpperCase()}</span>
                                                    <span className="player-uname">{p.username}</span>
                                                    <span className="player-pts">{p.score}p</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Match Summary Bar */}
            <div className="results-summary-bar">
                <div className="sum-stat-item">
                    <Clock size={16} />
                    <span>Duration: <strong>{Math.floor(gameResults.gameStats.gameDuration / 60)}m</strong></span>
                </div>
                <div className="sum-stat-item">
                    <Target size={16} />
                    <span>Questions: <strong>{gameResults.gameStats.totalQuestions}</strong></span>
                </div>
                <div className="sum-stat-item">
                    <Users size={16} />
                    <span>Players: <strong>{gameResults.gameStats.totalPlayers}</strong></span>
                </div>
            </div>

            {/* Results Actions */}
            <div className="results-actions-bar">
                <button className="results-btn-primary" onClick={onBackToMenu}>
                    <ArrowLeft size={16} /> Return to Battle Arena
                </button>
            </div>
        </motion.div>
    );
};


export default CodeWarsArena;
