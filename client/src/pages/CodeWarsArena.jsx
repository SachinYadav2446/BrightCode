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
import CollaborativeCodeEditor from '../components/codewars/CollaborativeCodeEditor';
import ChatPanel from '../components/ChatPanel';
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
        
        console.log('🎮 CodeWarsArena mounting, user:', user.username);
        
        // Setup socket first
        const s = setupSocketConnection();
        setSocket(s);
        
        // Wait for socket to connect before initializing
        const initTimeout = setTimeout(() => {
            console.log('⏰ Socket connection timeout, initializing anyway...');
            initializeArena(s);
        }, 3000); // Wait 3 seconds for socket
        
        const handleConnect = () => {
            console.log('✅ Socket connected, initializing arena...');
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
        console.log('🔌 Setting up socket connection...');
        const s = initSocket();
        
        // Connection status logging
        s.on('connect', () => {
            console.log('✅ Socket connected successfully');
        });
        
        s.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            toast.error('Failed to connect to server. Please check if the server is running.');
        });
        
        s.on('disconnect', (reason) => {
            console.warn('⚠️ Socket disconnected:', reason);
            if (reason === 'io server disconnect') {
                // Server disconnected, try to reconnect
                s.connect();
            }
        });
        
        // Socket-based room events (like workspace system)
        s.on('cw-room-created', (data) => {
            console.log('✅ Room created via socket:', data);
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
            console.log('✅ Joined room via socket:', data);
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
            console.log('👋 Player joined:', data);
            toast.success(`${data.username} joined the room!`);
            // Refresh room list to update player counts
            loadFactionRoomsViaSocket(s);
        });

        s.on('cw-player-left', (data) => {
            console.log('👋 Player left:', data);
            toast.info(`${data.username} left the room`);
            // Refresh room list
            loadFactionRoomsViaSocket(s);
        });

        s.on('cw-room-update', (data) => {
            console.log('🔄 Room updated:', data);
            console.log('📊 Updated room data:', {
                scores: data.room?.scores,
                submissions: data.room?.submissions,
                teams: data.room?.teams
            });
            
            // Log player scores from teams
            if (data.room?.teams) {
                data.room.teams.forEach(team => {
                    console.log(`Team ${team.id}:`, team.players.map(p => ({
                        username: p.username,
                        score: p.score,
                        questionsCompleted: p.questionsCompleted
                    })));
                });
            }
            
            setCurrentRoom(data.room);
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
            console.log('🚪 Processing game end?', processingGameEndRef.current);
            
            // If we're processing a game-ended event, ignore this
            if (processingGameEndRef.current) {
                console.log('🚪 Ignoring cw-left-room because we are processing game-ended');
                return;
            }
            
            // Otherwise, go back to menu
            console.log('📊 Going to menu from left-room event');
            toast.success('Left room');
            setCurrentRoom(null);
            setPlayerFinished(false);
            setGameState('menu');
            
            loadFactionRoomsViaSocket(s);
        });
        
        s.on('cw-contest-ended', (data) => {
            console.log('🏁 Contest ended for player:', data);
            if (data.success) {
                setPlayerFinished(true);
                if (data.allFinished) {
                    // All players finished - go to results immediately
                    toast.success('All players finished! Showing results...');
                    setGameState('results');
                } else {
                    // This player finished, waiting for others
                    toast.success(`You finished! ${data.finishedCount}/${data.totalPlayers} players done. Waiting for others...`);
                    setGameState('waiting'); // New waiting state
                }
            }
        });
        
        s.on('player-finished', (data) => {
            console.log('👤 Player finished:', data);
            toast.info(`${data.username} finished their contest! (${data.finishedCount}/${data.totalPlayers})`);
        });

        s.on('cw-error', (data) => {
            console.error('❌ Socket error:', data);
            setLoading(false);
            toast.error(data.error || 'An error occurred');
        });
        
        // Room list updates
        s.on('cw-room-list-updated', (data) => {
            console.log('📋 Room list updated for faction:', data.factionId);
            // Refresh with the faction ID from the event
            loadFactionRoomsViaSocket(s, data.factionId);
        });
        
        s.on('cw-faction-rooms', (data) => {
            console.log('📋 Received faction rooms:', data.rooms);
            console.log('📋 Number of rooms:', data.rooms.length);
            
            // Only update if this is for our faction
            if (!data.factionId || data.factionId === myFaction?.id) {
                setFactionRooms(data.rooms);
            }
        });

        // Forfeit handling - this takes priority over everything
        s.on('cw-game-ended', (data) => {
            console.log('🏁 Game ended event received:', data);
            console.log('🏁 Reason:', data.reason);
            console.log('🏁 Results:', data.results);
            
            // Set flag to prevent cw-left-room from interfering
            processingGameEndRef.current = true;
            
            // Immediately set results and navigate to results page
            // This prevents any other navigation from happening
            setCurrentRoom(data.room);
            setGameResults(data.results);
            setGameState('results');
            
            console.log('🏁 Game state set to results, showing results page');
            
            if (data.reason === 'forfeit') {
                toast.info(`Match ended - ${data.results.forfeitedTeam} forfeited`);
            }
            
            // Reset the flag after a short delay to allow normal navigation later
            setTimeout(() => {
                processingGameEndRef.current = false;
                console.log('🏁 Reset processing game end flag');
            }, 1000);
            
            // Clear the current room from socket since game is over
            if (data.room?.id) {
                s.emit('cw-leave-room', {
                    roomId: data.room.id,
                    userId: user.id,
                    username: user.username
                });
            }
            
            if (data.reason === 'forfeit') {
                toast.success(`🏆 ${data.results.forfeitedTeam} forfeited the match!`, {
                    duration: 5000
                });
            } else {
                toast.success('Game completed!');
            }
        });

        s.on('cw-team-forfeited', (data) => {
            console.log('📢 Team forfeited:', data);
            toast.info(`Team ${data.teamName} has left the match. ${data.remainingTeams} teams remaining.`, {
                duration: 4000
            });
        });

        // Legacy events for backward compatibility
        s.on('game-ended', (data) => {
            console.log('🏁 Game ended:', data);
            setGameResults(data.results);
            setGameState('results');
            toast.success('Game completed!');
        });

        s.on('solution-accepted', (data) => {
            console.log('✅ Solution accepted:', data);
            toast.success(`${data.username} solved a problem! (+${data.points} points)`);
        });
        
        console.log('✅ Socket event listeners registered');
        return s;
    };

    const loadFactionRoomsViaSocket = (socketInstance, factionId) => {
        const s = socketInstance || socket;
        const fId = factionId || myFaction?.id;
        
        if (!s) {
            console.log('⚠️ Cannot load rooms: socket not ready');
            return;
        }
        
        if (!fId) {
            console.log('⚠️ Cannot load rooms: faction ID not available');
            return;
        }
        
        console.log('📋 Requesting faction rooms via socket for faction:', fId);
        s.emit('cw-get-faction-rooms', { factionId: fId });
    };

    const initializeArena = async (socketInstance) => {
        try {
            console.log('🎮 Initializing Code Wars Arena...');
            console.log('👤 User:', user?.username, 'ID:', user?.id);
            console.log('🔌 Socket connected:', socketInstance?.connected);
            
            // Get user's faction
            console.log('📡 Fetching factions from server...');
            const factionsRes = await axios.get('http://localhost:5051/factions');
            console.log('✅ Factions response:', factionsRes.data);
            
            const userFaction = factionsRes.data.find(f => 
                f.members?.some(m => m.username === user.username)
            );
            
            if (!userFaction) {
                console.error('❌ User not in any faction');
                toast.error('You must join a faction to participate in Code Wars!');
                setLoading(false);
                navigate('/factions');
                return;
            }
            
            console.log('🏛️ User faction loaded:', userFaction.name, 'ID:', userFaction.id);
            setMyFaction(userFaction);
            
            // Debug: Make faction available globally for debugging
            window.myFactionDebug = userFaction;
            window.socketDebug = socketInstance;
            
            // Check if already in a room
            try {
                console.log('🔍 Checking if user is already in a room...');
                const roomRes = await axios.get('http://localhost:5051/code-wars/my-room', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                
                console.log('✅ User is in room:', roomRes.data.id);
                
                // Validate that the room actually exists on the server
                try {
                    const roomValidation = await axios.get(`http://localhost:5051/code-wars/debug/room/${roomRes.data.id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    
                    if (roomValidation.data.roomExists) {
                        console.log('✅ Room validated on server');
                        setCurrentRoom(roomRes.data);
                        setGameState(roomRes.data.status === 'active' ? 'game' : 'room');
                        
                        // Join socket room for real-time updates
                        if (socketInstance) {
                            socketInstance.emit('join-code-wars-room', { 
                                roomId: roomRes.data.id, 
                                userId: user.id 
                            });
                        }
                    } else {
                        console.log('⚠️ Room exists in user data but not on server - clearing stale data');
                        // Room doesn't exist on server, clear stale data
                        await axios.post('http://localhost:5051/code-wars/leave-room', {}, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        }).catch(() => {}); // Ignore errors since room doesn't exist
                    }
                } catch (validationError) {
                    console.log('⚠️ Could not validate room, assuming it exists');
                    // If validation fails, assume room exists (fallback)
                    setCurrentRoom(roomRes.data);
                    setGameState(roomRes.data.status === 'active' ? 'game' : 'room');
                }
            } catch (err) {
                // Not in a room, that's fine
                console.log('ℹ️ User not in any room (this is normal)');
            }
            
            // Get faction rooms via socket - PASS FACTION ID DIRECTLY
            if (socketInstance && socketInstance.connected) {
                console.log('📋 Loading faction rooms for:', userFaction.id);
                loadFactionRoomsViaSocket(socketInstance, userFaction.id);
            } else {
                console.warn('⚠️ Socket not connected, cannot load faction rooms');
                toast.error('Socket not connected. Some features may not work.');
            }
            
            console.log('✅ Arena initialization complete');
            setLoading(false);
            
        } catch (error) {
            console.error('❌ Failed to initialize arena:', error);
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
        if (!user || !user.id) {
            toast.error('User authentication error. Please log in again.');
            navigate('/auth');
            return;
        }

        try {
            setLoading(true);
            console.log('🏗️ Creating room...', {
                userId: user.id,
                username: user.username,
                factionId: myFaction?.id,
                roomConfig: createForm,
                socketConnected: socket?.connected
            });
            
            // Try socket first if connected
            if (socket && socket.connected) {
                console.log('📡 Using socket to create room...');
                socket.emit('cw-create-room', {
                    roomConfig: createForm,
                    userId: user.id,
                    username: user.username,
                    factionId: myFaction.id
                });
                
                // Set timeout in case socket doesn't respond
                setTimeout(() => {
                    if (loading) {
                        console.warn('⏰ Socket timeout, falling back to HTTP...');
                        createRoomViaHTTP();
                    }
                }, 5000);
            } else {
                // Fallback to HTTP if socket not connected
                console.log('📡 Socket not connected, using HTTP...');
                await createRoomViaHTTP();
            }
            
        } catch (error) {
            console.error('Create room error:', error);
            toast.error('Failed to create room');
            setLoading(false);
        }
    };
    
    const createRoomViaHTTP = async () => {
        try {
            const response = await axios.post('http://localhost:5051/code-wars/create-room', {
                name: createForm.name,
                isPrivate: createForm.isPrivate,
                password: createForm.password,
                teamSize: createForm.teamSize,
                maxTeams: createForm.maxTeams,
                questionCount: createForm.questionCount,
                timeLimit: createForm.timeLimit,
                difficulty: createForm.difficulty,
                allowSpectators: createForm.allowSpectators,
                factionId: myFaction.id
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            console.log('✅ Room created via HTTP:', response.data);
            setCurrentRoom(response.data.room);
            setGameState('room');
            setLoading(false);
            toast.success(`Room ${response.data.room.id} created!`);
            
            // Join socket room if socket is available
            if (socket && socket.connected) {
                socket.emit('join-code-wars-room', {
                    roomId: response.data.room.id,
                    userId: user.id
                });
            }
            
            // Refresh room list
            loadFactionRooms();
            
        } catch (error) {
            console.error('HTTP create room error:', error);
            setLoading(false);
            
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.');
                navigate('/auth');
            } else if (error.message.includes('Network Error')) {
                toast.error('Cannot connect to server. Please check if the server is running on port 5051.');
            } else {
                toast.error(error.response?.data?.error || 'Failed to create room');
            }
        }
    };

    const joinRoom = async (roomId, password = '') => {
        if (!user || !user.id) {
            toast.error('User authentication error. Please log in again.');
            navigate('/auth');
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
            
            console.log('🚪 Joining room...', {
                roomId: actualRoomId.toUpperCase().trim(),
                userId: user.id,
                username: user.username,
                factionId: myFaction.id,
                hasPassword: !!actualPassword,
                socketConnected: socket?.connected
            });
            
            // Try socket first if connected
            if (socket && socket.connected) {
                console.log('📡 Using socket to join room...');
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
                        console.warn('⏰ Socket timeout, falling back to HTTP...');
                        joinRoomViaHTTP(actualRoomId, actualPassword);
                    }
                }, 5000);
            } else {
                // Fallback to HTTP if socket not connected
                console.log('📡 Socket not connected, using HTTP...');
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
            const response = await axios.post('http://localhost:5051/code-wars/join-room', {
                roomId: roomId.toUpperCase().trim(),
                password: password || ''
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            console.log('✅ Joined room via HTTP:', response.data);
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
            setGameState('menu');
            return;
        }

        try {
            console.log('🚪 Leaving room via socket...');
            console.log('🚪 Current room:', currentRoom.id);
            console.log('🚪 Current game state:', gameState);
            
            socket.emit('cw-leave-room', {
                roomId: currentRoom.id,
                userId: user.id,
                username: user.username
            });
            
            // Don't do anything here - let the socket events handle the response
            // Either 'cw-game-ended' (forfeit) or 'cw-left-room' (normal leave) will fire
            console.log('🚪 Leave room event emitted, waiting for server response...');
            
        } catch (error) {
            console.error('Leave room error:', error);
            setCurrentRoom(null);
            setGameState('menu');
        }
    };

    const startGame = async () => {
        if (!socket || !currentRoom) {
            toast.error('Socket not connected or no room');
            return;
        }

        try {
            console.log('🎮 Starting game via socket...');
            
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
            const response = await axios.post('http://localhost:5051/code-wars/switch-team', {
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
        
        console.log('🏁 Ending contest for player...');
        
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
                            onStart={startGame}
                            onSwitchTeam={switchTeam}
                            onCopyId={copyRoomId}
                        />
                    )}

                    {gameState === 'game' && currentRoom && (
                        <GameInterface 
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
                                setGameState('menu');
                                setPlayerFinished(false);
                                setGameResults(null);
                                loadFactionRooms();
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

// Create Room Screen Component
const CreateRoomScreen = ({ form, setForm, onSubmit, onBack, loading }) => (
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
                    <label>Team Size</label>
                    <select
                        value={form.teamSize}
                        onChange={(e) => setForm({...form, teamSize: parseInt(e.target.value)})}
                    >
                        <option value={1}>1v1</option>
                        <option value={2}>2v2</option>
                        <option value={4}>4v4</option>
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
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
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
const RoomLobby = ({ room, user, onLeave, onStart, onSwitchTeam, onCopyId }) => {
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
                        <span>•</span>
                        <span>{room.questionCount} questions</span>
                        <span>•</span>
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
                    <button className="btn-leave" onClick={onLeave}>
                        <LogOut size={16} />
                        Leave
                    </button>
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
const ResultsScreen = ({ room, results, user, onBackToMenu }) => {
    // Calculate results if not provided
    const gameResults = results || calculateResults(room);
    
    function calculateResults(room) {
        const teamResults = room.teams.map(team => ({
            teamId: team.id,
            teamName: team.name,
            totalScore: room.scores?.[team.id] || 0,
            questionsCompleted: team.questionsCompleted || 0,
            failedAttempts: team.failedAttempts || 0,
            players: team.players.map(p => ({
                id: p.id,
                username: p.username,
                score: p.score || 0,
                questionsCompleted: p.questionsCompleted || 0
            }))
        }));
        
        // Sort by score first, then by failed attempts (fewer is better) as tiebreaker
        teamResults.sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore; // Higher score wins
            }
            // Tiebreaker: fewer failed attempts wins
            return a.failedAttempts - b.failedAttempts;
        });
        
        return {
            winner: teamResults[0],
            rankings: teamResults,
            gameStats: {
                totalQuestions: room.questions.length,
                gameDuration: room.timeLimit,
                totalPlayers: room.teams.reduce((sum, team) => sum + team.players.length, 0)
            }
        };
    }
    
    const myTeam = room.teams.find(team => 
        team.players.some(p => p.id === user.id)
    );
    
    const myPlayer = myTeam?.players.find(p => p.id === user.id);
    const isWinner = myTeam?.id === gameResults.winner.teamId;
    
    return (
        <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="results-screen"
        >
            <div className="results-header">
                <div className="results-title">
                    {gameResults.reason === 'forfeit' ? (
                        <>
                            <Trophy size={48} className="trophy-icon gold" />
                            <h1>{isWinner ? 'Victory by Forfeit!' : 'Match Ended'}</h1>
                            <p>{gameResults.forfeitedTeam} left the match</p>
                        </>
                    ) : isWinner ? (
                        <>
                            <Trophy size={48} className="trophy-icon gold" />
                            <h1>Victory!</h1>
                            <p>Your team won the battle!</p>
                        </>
                    ) : (
                        <>
                            <Award size={48} className="trophy-icon silver" />
                            <h1>Battle Complete!</h1>
                            <p>Well fought, warrior!</p>
                        </>
                    )}
                </div>
            </div>
            
            <div className="results-content">
                {/* Personal Stats */}
                <div className="personal-stats">
                    <h2>Your Performance</h2>
                    <div className="stats-list">
                        <div className="stat-row">
                            <span className="stat-label-text">Points Earned</span>
                            <span className="stat-value-text">{myPlayer?.score || 0}</span>
                        </div>
                        
                        <div className="stat-row">
                            <span className="stat-label-text">Questions Solved</span>
                            <span className="stat-value-text">{myPlayer?.questionsCompleted || 0}/{gameResults.gameStats.totalQuestions}</span>
                        </div>
                        
                        <div className="stat-row">
                            <span className="stat-label-text">Your Team</span>
                            <span className="stat-value-text">{myTeam?.name}</span>
                        </div>
                    </div>
                </div>
                
                {/* Team Rankings */}
                <div className="team-rankings">
                    <h2>Final Rankings</h2>
                    <div className="rankings-list">
                        {gameResults.rankings.map((team, index) => (
                            <div 
                                key={team.teamId} 
                                className={`ranking-card ${team.teamId === myTeam?.id ? 'my-team' : ''} ${index === 0 ? 'winner' : ''}`}
                            >
                                <div className="rank-badge">
                                    {index === 0 ? <Crown size={24} /> : `#${index + 1}`}
                                </div>
                                
                                <div className="team-info">
                                    <h3>{team.teamName}</h3>
                                    <div className="team-score">
                                        <Trophy size={16} />
                                        <span>{team.totalScore} points</span>
                                    </div>
                                    <div className="team-progress">
                                        <Target size={14} />
                                        <span>{team.questionsCompleted} questions solved</span>
                                    </div>
                                    <div className="team-accuracy">
                                        <CheckCircle size={14} />
                                        <span>{team.failedAttempts || 0} failed attempts</span>
                                    </div>
                                </div>
                                
                                <div className="team-players">
                                    {team.players.map(player => (
                                        <div key={player.id} className="player-result">
                                            <div className="player-avatar-small">
                                                {player.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="player-result-info">
                                                <div className="player-result-name">{player.username}</div>
                                                <div className="player-result-score">
                                                    {player.score} pts • {player.questionsCompleted} solved
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Game Stats */}
                <div className="game-stats-summary">
                    <h3>Battle Statistics</h3>
                    <div className="stats-row">
                        <div className="stat-item">
                            <Clock size={20} />
                            <span>{Math.floor(gameResults.gameStats.gameDuration / 60)} minutes</span>
                        </div>
                        <div className="stat-item">
                            <Target size={20} />
                            <span>{gameResults.gameStats.totalQuestions} questions</span>
                        </div>
                        <div className="stat-item">
                            <Users size={20} />
                            <span>{gameResults.gameStats.totalPlayers} players</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="results-actions">
                <button className="back-to-menu-btn" onClick={onBackToMenu}>
                    <ArrowLeft size={20} />
                    Back to Arena
                </button>
            </div>
        </motion.div>
    );
};

// Game Interface Component
const GameInterface = ({ room, user, socket, playerFinished, onEndContest }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [code, setCode] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('java'); // Default to Java
    const [submitting, setSubmitting] = useState(false);
    const [testing, setTesting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const [testResultsCollapsed, setTestResultsCollapsed] = useState(false);
    const [leftPanelWidth, setLeftPanelWidth] = useState(40); // Percentage width for problem panel
    const [isResizing, setIsResizing] = useState(false);
    const [activeTab, setActiveTab] = useState('statement'); // 'statement' or 'chat'
    const [chatMessages, setChatMessages] = useState([]);
    
    // Language-specific default code templates
    const getDefaultCode = (language) => {
        const templates = {
            java: `public static int solution(int n) {
    // Write your solution here
    
}`,
            python: `def solution(n):
    # Write your solution here
    pass`,
            javascript: `function solution(n) {
    // Write your solution here
    
}`,
            cpp: `int solution(int n) {
    // Write your solution here
    
}`
        };
        return templates[language] || templates.java;
    };
    
    // Update code when language changes
    const handleLanguageChange = (newLanguage) => {
        setSelectedLanguage(newLanguage);
        setCode(getDefaultCode(newLanguage));
    };

    useEffect(() => {
        // Calculate time left
        const endTime = new Date(room.endTime).getTime();
        const updateTimer = () => {
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeLeft(remaining);
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [room.endTime]);
    
    // Load saved code when question changes
    useEffect(() => {
        const currentQuestion = room.questions[currentQuestionIndex];
        if (!currentQuestion) return;
        
        const savedCodeKey = `codewars_${room.id}_${user.id}_${currentQuestion.id}_${selectedLanguage}`;
        const savedCode = localStorage.getItem(savedCodeKey);
        
        if (savedCode) {
            console.log('Loading saved code for question:', currentQuestion.id, 'language:', selectedLanguage);
            setCode(savedCode);
        } else {
            console.log('No saved code, using default template for', selectedLanguage);
            setCode(getDefaultCode(selectedLanguage));
        }
        
        // Clear test results when changing questions
        setTestResults(null);
    }, [currentQuestionIndex, room.id, room.questions, user.id, selectedLanguage]);
    
    // Save code to localStorage whenever it changes (debounced)
    useEffect(() => {
        const currentQuestion = room.questions[currentQuestionIndex];
        if (!currentQuestion || !code) return;
        
        const saveTimer = setTimeout(() => {
            const savedCodeKey = `codewars_${room.id}_${user.id}_${currentQuestion.id}_${selectedLanguage}`;
            localStorage.setItem(savedCodeKey, code);
            console.log('Code saved for question:', currentQuestion.id, 'language:', selectedLanguage);
        }, 1000); // Save after 1 second of no changes
        
        return () => clearTimeout(saveTimer);
    }, [code, currentQuestionIndex, room.id, room.questions, user.id, selectedLanguage]);

    const currentQuestion = room.questions[currentQuestionIndex];
    
    // Find player info
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
    
    // Check if player is finished
    const isFinished = playerFinished || (Array.isArray(room.finishedPlayers) && room.finishedPlayers.includes(user.id));
    
    // Count finished players
    const finishedCount = Array.isArray(room.finishedPlayers) ? room.finishedPlayers.length : 0;
    const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);

    const submitSolution = async (submittedCode) => {
        if (isFinished) {
            toast.error('You have already ended your contest!');
            return;
        }
        
        // Use submitted code from collaborative editor, or local code state for solo mode
        const codeToSubmit = submittedCode || code;
        
        if (!codeToSubmit || !codeToSubmit.trim()) {
            toast.error('Please write some code before submitting');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post('http://localhost:5051/code-wars/submit-solution', {
                questionId: currentQuestion.id,
                code: codeToSubmit,
                language: selectedLanguage
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            console.log('📤 Submit response:', response.data);

            if (response.data.success || response.data.partialCredit) {
                const { points, maxPoints, scorePercentage, testsPassed, testsTotal, passedByCategory, totalByCategory } = response.data;
                
                console.log('✅ Submission successful:', {
                    points,
                    maxPoints,
                    scorePercentage,
                    testsPassed,
                    testsTotal
                });
                
                if (response.data.success) {
                    toast.success(`✅ Perfect! All tests passed! +${points} points`);
                } else {
                    toast.success(`✓ Partial Credit: ${testsPassed}/${testsTotal} tests passed (${scorePercentage}%) +${points}/${maxPoints} points`);
                }
                
                // Store detailed results for display
                setTestResults({
                    success: response.data.success,
                    partialCredit: response.data.partialCredit,
                    scorePercentage,
                    testsPassed,
                    testsTotal,
                    passedByCategory,
                    totalByCategory,
                    points,
                    maxPoints
                });
                
                // Move to next question if fully completed
                if (response.data.success && currentQuestionIndex < room.questions.length - 1) {
                    setTimeout(() => {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        setTestResults(null);
                    }, 2000);
                }
            } else {
                // Show detailed error message
                const result = response.data.result;
                if (result && result.message) {
                    // Multi-line error message
                    const lines = result.message.split('\n');
                    toast.error(
                        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>
                            {lines.map((line, i) => <div key={i}>{line}</div>)}
                        </div>,
                        { duration: 8000 }
                    );
                } else {
                    toast.error('❌ Solution failed tests. Try again!');
                }
                
                // Store test results for display
                if (result && result.results) {
                    setTestResults(result);
                    console.log('📊 Test Results:', result.results);
                    console.log(`✅ Passed: ${result.testsPassed || 0}/${result.totalTests || 0}`);
                    if (result.methodName) {
                        console.log(`🔧 Method detected: ${result.methodName}`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Submission error:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error status:', error.response?.status);
            console.error('❌ Error message:', error.message);
            
            const errorMsg = error.response?.data?.error || error.message || 'Submission failed';
            toast.error(`Submission failed: ${errorMsg}`);
        } finally {
            setSubmitting(false);
        }
    };
    
    const runTests = async (codeToTest) => {
        const testCode = codeToTest || code;
        
        if (!testCode || !testCode.trim()) {
            toast.error('Please write some code before testing');
            return;
        }
        
        setTesting(true);
        setTestResults(null);
        
        try {
            // Use the compile endpoint to test without submitting
            const response = await axios.post('http://localhost:5051/compile-java', {
                code: testCode,
                testCases: currentQuestion.testCases
            });
            
            setTestResults(response.data);
            
            if (response.data.success) {
                toast.success(`✅ All ${response.data.totalTests} test cases passed!`);
            } else {
                toast.error(`❌ ${response.data.testsPassed || 0}/${response.data.totalTests || 0} tests passed`);
            }
        } catch (error) {
            console.error('Test error:', error);
            toast.error('Failed to run tests');
        } finally {
            setTesting(false);
        }
    };
    
    const handleEndContest = () => {
        setShowEndConfirm(false);
        onEndContest();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Resize handler for split view
    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            
            const container = document.querySelector('.split-view');
            if (!container) return;
            
            const containerRect = container.getBoundingClientRect();
            const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            
            // Limit between 20% and 80%
            if (newWidth >= 20 && newWidth <= 80) {
                setLeftPanelWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Chat handlers
    useEffect(() => {
        if (!socket || !myTeam) return;

        const handleTeamChat = (data) => {
            setChatMessages(prev => [...prev, data]);
        };

        socket.on('cw-team-chat', handleTeamChat);

        return () => {
            socket.off('cw-team-chat', handleTeamChat);
        };
    }, [socket, myTeam]);

    // Helper function to check if a specific question is completed
    const isQuestionCompleted = (questionId) => {
        if (!room.submissions || !user?.id) return false;
        const mySubmissions = room.submissions[user.id] || [];
        return mySubmissions.some(sub => sub.questionId === questionId && sub.result?.scoreData?.allPassed);
    };

    const handleSendMessage = (message) => {
        if (!socket || !myTeam || !message.trim()) return;

        socket.emit('cw-team-chat', {
            roomId: room.id,
            teamId: myTeam.id,
            userId: user.id,
            username: user.username,
            message: message.trim(),
            timestamp: Date.now()
        });
    };

    if (!myPlayer) {
        // Spectator view
        return (
            <div className="spectator-view">
                <div className="spectator-header">
                    <Eye size={24} />
                    <h2>Spectating: {room.name}</h2>
                </div>
                <div className="teams-scoreboard">
                    {room.teams.map(team => (
                        <div key={team.id} className="team-score">
                            <h3>{team.name}</h3>
                            <div className="score">{room.scores?.[team.id] || 0} pts</div>
                            <div className="players">
                                {team.players.map(p => (
                                    <span key={p.id}>{p.username}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="game-interface">
            {/* Top Navigation Bar */}
            <div className="game-navbar">
                <div className="navbar-left">
                    <div className="room-info-compact">
                        <Swords size={18} />
                        <span>{room.name}</span>
                    </div>
                </div>
                
                <div className="navbar-center">
                    <div className="question-tabs">
                        {room.questions.map((q, index) => {
                            const completed = isQuestionCompleted(q.id);
                            return (
                                <button
                                    key={q.id}
                                    className={`question-tab ${index === currentQuestionIndex ? 'active' : ''} ${
                                        completed ? 'completed' : ''
                                    }`}
                                    onClick={() => !isFinished && setCurrentQuestionIndex(index)}
                                    disabled={isFinished}
                                >
                                    {index + 1}
                                    {completed && <CheckCircle size={12} className="check-icon" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                <div className="navbar-right">
                    <div className="timer-display">
                        <Timer size={18} />
                        <span className={timeLeft < 120 ? 'urgent' : ''}>{formatTime(timeLeft)}</span>
                    </div>
                    <div className="score-display">
                        <Trophy size={18} />
                        <span>{myPlayer.score} pts</span>
                    </div>
                </div>
            </div>

            {/* Player Finished Overlay */}
            {isFinished && (
                <div className="player-finished-overlay">
                    <div className="finished-message">
                        <CheckCircle size={48} />
                        <h2>Contest Ended!</h2>
                        <p>You have finished your contest.</p>
                        <p>Waiting for other players... ({finishedCount}/{totalPlayers} done)</p>
                        <div className="final-score">
                            <h3>Your Score: {myPlayer.score} points</h3>
                            <p>Questions Completed: {myPlayer.questionsCompleted}/{room.questions.length}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Split View - LeetCode Style */}
            {/* Unified Header for both panels */}
            <div className="unified-header">
                <div className="unified-header-left">
                    <button 
                        className={`problem-tab ${activeTab === 'statement' ? 'active' : ''}`}
                        onClick={() => setActiveTab('statement')}
                    >
                        Statement
                    </button>
                    {room.teamSize > 1 && (
                        <button 
                            className={`problem-tab ${activeTab === 'chat' ? 'active' : ''}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            <MessageSquare size={14} />
                            Team Chat
                        </button>
                    )}
                </div>
                <div className="unified-header-right">
                    <select 
                        className="language-dropdown"
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        disabled={isFinished}
                    >
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                    </select>
                    {room.teamSize > 1 && (
                        <div className="team-indicator">
                            <Users size={14} />
                            <span>{myTeam.name}</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="split-view">
                {/* Left Panel - Problem Description, Submissions, or Chat */}
                <div className="problem-panel" style={{ width: `${leftPanelWidth}%` }}>
                    {activeTab === 'statement' ? (
                        <>
                            <div className="problem-header">
                                <h2 className="problem-title">{currentQuestion.title}</h2>
                                <div className="problem-meta">
                                    <span className={`difficulty-badge ${currentQuestion.difficulty}`}>
                                        {currentQuestion.difficulty}
                                    </span>
                                    <span className="points-badge">
                                        <Star size={14} />
                                        {currentQuestion.points} pts
                                    </span>
                                    {currentQuestion.source && (
                                        <span className="source-badge">{currentQuestion.source}</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="problem-content">
                                <div className="problem-description">
                                    {currentQuestion.description}
                                </div>
                        
                        {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                            <div className="problem-examples">
                                <h3>Examples</h3>
                                {currentQuestion.examples.map((example, index) => (
                                    <div key={index} className="example-box">
                                        <div className="example-label">Example {index + 1}:</div>
                                        <div className="example-io">
                                            <div className="io-item">
                                                <strong>Input:</strong>
                                                <code>{example.input}</code>
                                            </div>
                                            <div className="io-item">
                                                <strong>Output:</strong>
                                                <code>{example.output}</code>
                                            </div>
                                        </div>
                                        {example.explanation && (
                                            <div className="example-explanation">
                                                <strong>Explanation:</strong> {example.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {currentQuestion.constraints && (
                            <div className="problem-constraints">
                                <h3>Constraints</h3>
                                <ul>
                                    {currentQuestion.constraints.map((constraint, index) => (
                                        <li key={index}>{constraint}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                            </div>
                        </>
                    ) : (
                        <div className="team-chat-container">
                            <ChatPanel
                                socket={socket}
                                roomId={`team_${room.id}_${myTeam.id}`}
                                user={user}
                                title={`${myTeam.name} Chat`}
                                messages={chatMessages}
                                onSend={handleSendMessage}
                            />
                        </div>
                    )}
                </div>

                {/* Resizer */}
                <div 
                    className={`panel-resizer ${isResizing ? 'resizing' : ''}`}
                    onMouseDown={handleMouseDown}
                />

                {/* Right Panel - Code Editor */}
                <div className="editor-panel" style={{ width: `${100 - leftPanelWidth}%` }}>
                    {/* Conditional rendering: Collaborative editor for team mode, standard editor for solo */}
                    {room.teamSize > 1 ? (
                        <CollaborativeCodeEditor
                            roomId={room.id}
                            teamId={myTeam.id}
                            questionId={currentQuestion.id}
                            userId={user.id}
                            username={user.username}
                            socket={socket}
                            initialCode={currentQuestion.starterCode || ''}
                            language={selectedLanguage}
                            onSubmit={submitSolution}
                            disabled={isFinished || submitting}
                        />
                    ) : (
                        <div className="solo-editor-container">
                            <textarea
                                className="code-editor-textarea"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder={currentQuestion.starterCode || "// Write your solution here"}
                                spellCheck={false}
                                disabled={isFinished}
                            />
                            
                            {/* Enhanced Test Results Display with Categories */}
                            {testResults && (
                                <div className={`leetcode-test-results ${testResultsCollapsed ? 'collapsed' : ''}`}>
                                    <div className="test-results-header">
                                        <div className="test-results-title">
                                            {testResults.success ? (
                                                <>
                                                    <CheckCircle size={20} className="success-icon" />
                                                    <span className="success-text">Accepted</span>
                                                </>
                                            ) : testResults.partialCredit ? (
                                                <>
                                                    <AlertCircle size={20} className="warning-icon" />
                                                    <span className="warning-text">Partial Credit</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={20} className="error-icon" />
                                                    <span className="error-text">Wrong Answer</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="test-results-summary">
                                            <span className="score-badge">{testResults.scorePercentage}%</span>
                                            <span className="tests-passed">{testResults.testsPassed}/{testResults.testsTotal} tests passed</span>
                                            <span className="points-earned">+{testResults.points}/{testResults.maxPoints} pts</span>
                                        </div>
                                        <button 
                                            className="collapse-btn"
                                            onClick={() => setTestResultsCollapsed(!testResultsCollapsed)}
                                        >
                                            {testResultsCollapsed ? (
                                                <>
                                                    <ChevronUp size={16} />
                                                    Expand
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown size={16} />
                                                    Collapse
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <div className="test-results-body">
                                        {/* Category Breakdown */}
                                        <div className="category-breakdown">
                                            <h4>Test Categories</h4>
                                            <div className="category-grid">
                                                {testResults.passedByCategory && Object.entries(testResults.passedByCategory).map(([category, passed]) => {
                                                    const total = testResults.totalByCategory[category];
                                                    const percentage = Math.round((passed / total) * 100);
                                                    const categoryNames = {
                                                        'sample': 'Sample Cases',
                                                        'hidden': 'Hidden Cases',
                                                        'edge': 'Edge Cases',
                                                        'stress': 'Stress Tests',
                                                        'random': 'Random Tests'
                                                    };
                                                    
                                                    return (
                                                        <div key={category} className="category-card">
                                                            <div className="category-header">
                                                                <span className="category-name">{categoryNames[category] || category}</span>
                                                                <span className={`category-status ${passed === total ? 'success' : 'partial'}`}>
                                                                    {passed}/{total}
                                                                </span>
                                                            </div>
                                                            <div className="category-progress">
                                                                <div 
                                                                    className="category-progress-bar" 
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        
                                        {/* Overall Progress Bar */}
                                        <div className="overall-progress">
                                            <div className="progress-label">
                                                <span>Overall Progress</span>
                                                <span className="progress-percentage">{testResults.scorePercentage}%</span>
                                            </div>
                                            <div className="progress-bar-container">
                                                <div 
                                                    className={`progress-bar-fill ${testResults.success ? 'success' : testResults.partialCredit ? 'partial' : 'failed'}`}
                                                    style={{ width: `${testResults.scorePercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="editor-footer">
                                <button 
                                    className="prev-question-btn"
                                    onClick={() => {
                                        if (currentQuestionIndex > 0) {
                                            setCurrentQuestionIndex(currentQuestionIndex - 1);
                                            setTestResults(null);
                                        }
                                    }}
                                    disabled={isFinished || currentQuestionIndex === 0}
                                >
                                    Previous
                                </button>
                                
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                        className="run-tests-btn"
                                        onClick={() => runTests()}
                                        disabled={testing || !code.trim() || isFinished}
                                    >
                                        {testing ? (
                                            <>
                                                <Loader className="spin" size={16} />
                                                Testing...
                                            </>
                                        ) : (
                                            <>
                                                <Play size={16} />
                                                Run
                                            </>
                                        )}
                                    </button>
                                    
                                    <button 
                                        className="submit-solution-btn"
                                        onClick={() => submitSolution()}
                                        disabled={submitting || !code.trim() || isFinished}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader className="spin" size={16} />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={16} />
                                                Submit
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                <button 
                                    className="next-question-btn"
                                    onClick={() => {
                                        if (currentQuestionIndex < room.questions.length - 1) {
                                            setCurrentQuestionIndex(currentQuestionIndex + 1);
                                            setTestResults(null);
                                        }
                                    }}
                                    disabled={isFinished || currentQuestionIndex >= room.questions.length - 1}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default CodeWarsArena;
