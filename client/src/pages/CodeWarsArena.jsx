import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Swords, Trophy, Clock, Users, Zap, Play, 
    Code, Target, Shield, Crown, Timer, CheckCircle, XCircle,
    Loader, AlertCircle, Star, Award, Plus, Lock, Globe,
    Settings, Copy, Eye, EyeOff, UserPlus, LogOut, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { initSocket } from '../socket';
import CollaborativeCodeEditor from '../components/codewars/CollaborativeCodeEditor';
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
        color: '#ef4444'
    }
};

const CodeWarsArena = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myFaction, setMyFaction] = useState(null);
    const [gameState, setGameState] = useState('menu'); // menu, create, join, room, game, results
    const [currentRoom, setCurrentRoom] = useState(null);
    const [factionRooms, setFactionRooms] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [playerFinished, setPlayerFinished] = useState(false); // Track if current player finished
    const [gameResults, setGameResults] = useState(null); // Store final game results
    
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
            console.log('🚪 Left room:', data);
            setCurrentRoom(null);
            setGameState('menu');
            setPlayerFinished(false);
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
            setFactionRooms(data.rooms);
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
            
        } catch (error) {
            console.error('❌ Failed to initialize arena:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
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
            
            socket.emit('cw-leave-room', {
                roomId: currentRoom.id,
                userId: user.id,
                username: user.username
            });
            
            // Response will come via 'cw-left-room' event
            toast.success('Left room');
            await loadFactionRooms();
            
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
            <div className="arena-background">
                <div className="arena-grid"></div>
                <div className="arena-glow"></div>
            </div>

            {/* Header */}
            <header className="arena-header">
                <button className="back-btn" onClick={() => {
                    if (gameState === 'create' || gameState === 'join') {
                        setGameState('menu');
                    } else {
                        navigate(-1);
                    }
                }}>
                    <ArrowLeft size={20} />
                    Back
                </button>
                
                <div className="arena-title">
                    <Swords size={32} />
                    <h1>Code Wars Arena</h1>
                    {(gameState === 'create' || gameState === 'join') && (
                        <div className="arena-subtitle">
                            {gameState === 'create' ? 'Create Battle Room' : 'Join Battle Room'}
                        </div>
                    )}
                </div>

                {myFaction && (
                    <div className="faction-badge">
                        <span className="faction-emblem">{myFaction.emblem}</span>
                        <span className="faction-name">{myFaction.name}</span>
                    </div>
                )}
            </header>

            <main className="arena-content">
                <AnimatePresence mode="wait">
                    {gameState === 'menu' && (
                        <MenuScreen 
                            factionRooms={factionRooms}
                            onCreateRoom={() => setGameState('create')}
                            onJoinRoom={() => setGameState('join')}
                            onJoinRoomDirect={joinRoom}
                            onRefresh={loadFactionRooms}
                        />
                    )}

                    {gameState === 'create' && (
                        <CreateRoomScreen 
                            form={createForm}
                            setForm={setCreateForm}
                            onSubmit={createRoom}
                            onBack={() => setGameState('menu')}
                            loading={loading}
                        />
                    )}

                    {gameState === 'join' && (
                        <JoinRoomScreen 
                            form={joinForm}
                            setForm={setJoinForm}
                            onSubmit={() => joinRoom()}
                            onBack={() => setGameState('menu')}
                            loading={loading}
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
        </div>
    );
};

// Menu Screen Component
const MenuScreen = ({ factionRooms, onCreateRoom, onJoinRoom, onJoinRoomDirect, onRefresh }) => (
    <motion.div
        key="menu"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="arena-menu"
    >
        <div className="menu-section">
            <h2>Faction Battle Arena</h2>
            <p>Create custom rooms or join existing battles within your faction!</p>
            
            <div className="menu-actions">
                <motion.button
                    className="create-room-btn"
                    onClick={onCreateRoom}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus size={20} />
                    Create Room
                </motion.button>
                
                <motion.button
                    className="join-room-btn"
                    onClick={onJoinRoom}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <UserPlus size={20} />
                    Join with Code
                </motion.button>
            </div>
        </div>

        {/* Active Faction Rooms */}
        <div className="faction-rooms-section">
            <div className="section-header">
                <h3>Active Faction Rooms</h3>
                <div className="section-actions">
                    <div className="rooms-info">
                        <span className="rooms-count">
                            {factionRooms.length} public room{factionRooms.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <button className="refresh-btn" onClick={onRefresh}>
                        <RotateCcw size={16} />
                        Refresh
                    </button>
                </div>
            </div>
            
            {factionRooms.length === 0 ? (
                <div className="no-rooms">
                    <Swords size={48} className="no-rooms-icon" />
                    <h4>No active rooms</h4>
                    <p>Be the first to create a battle room for your faction!</p>
                </div>
            ) : (
                <div className="rooms-grid">
                    {factionRooms.map(room => (
                        <RoomCard 
                            key={room.id} 
                            room={room} 
                            onJoin={() => onJoinRoomDirect(room.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    </motion.div>
);

// Room Card Component
const RoomCard = ({ room, onJoin }) => {
    const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);
    const maxPlayers = room.teamSize * room.maxTeams;
    const isFull = totalPlayers >= maxPlayers;
    
    return (
        <motion.div
            className="room-card"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="room-header">
                <h4>{room.name}</h4>
                <div className="room-id">#{room.id}</div>
            </div>
            
            <div className="room-info">
                <div className="room-config">
                    <span className="config-item">
                        <Users size={14} />
                        {room.teamSize}v{room.teamSize} ({room.maxTeams} teams)
                    </span>
                    <span className="config-item">
                        <Target size={14} />
                        {room.questionCount} questions
                    </span>
                    <span className="config-item">
                        <Clock size={14} />
                        {Math.floor(room.timeLimit / 60)}m
                    </span>
                </div>
                
                <div className="room-status">
                    <div className="players-count">
                        {totalPlayers}/{maxPlayers} players
                    </div>
                    <div className="room-privacy-status">
                        {room.isPrivate ? (
                            <div className="private-indicator">
                                <Lock size={12} />
                                Private
                            </div>
                        ) : (
                            <div className="public-indicator">
                                <Globe size={12} />
                                Public
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <button 
                className={`join-room-card-btn ${isFull ? 'full' : ''}`}
                onClick={onJoin}
                disabled={isFull}
            >
                {isFull ? 'Full' : room.isPrivate ? 'Join Private' : 'Join Battle'}
            </button>
        </motion.div>
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
        <div className="screen-header" style={{ display: 'none' }}>
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
                        <option value={3}>3v3</option>
                        <option value={4}>4v4</option>
                        <option value={5}>5v5</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Number of Teams</label>
                    <select
                        value={form.maxTeams}
                        onChange={(e) => setForm({...form, maxTeams: parseInt(e.target.value)})}
                    >
                        <option value={2}>2 Teams</option>
                        <option value={3}>3 Teams</option>
                        <option value={4}>4 Teams</option>
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
            
            {/* Privacy Row with inline password */}
            <div className="privacy-row">
                <div className="privacy-buttons-inline">
                    <label>Room Privacy</label>
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
                </div>
                
                {form.isPrivate && (
                    <motion.div 
                        className="password-inline"
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
                className="create-submit-btn"
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
    // Ensure user object is valid
    if (!user || !user.id) {
        console.error('❌ User object is invalid:', user);
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
    
    // Debug logging
    console.log('🏟️ Room Lobby Debug:', {
        roomCreatorId: room.creatorId,
        currentUserId: user.id,
        currentUsername: user.username,
        isCreator,
        totalPlayers,
        minPlayers,
        canStart,
        roomStatus: room.status,
        userObject: user
    });
    
    const myTeam = room.teams.find(team => 
        team.players.some(p => p.id === user.id)
    );
    
    return (
        <motion.div
            key="room"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="room-lobby"
        >
            <div className="lobby-header">
                <div className="room-info">
                    <h2>{room.name}</h2>
                    <div className="room-details">
                        <span className="room-id-display">
                            Room: {room.id}
                            <button className="copy-id-btn" onClick={onCopyId}>
                                <Copy size={14} />
                            </button>
                        </span>
                        <span className="room-config">
                            {room.teamSize}v{room.teamSize} • {room.questionCount} questions • {Math.floor(room.timeLimit / 60)}m
                        </span>
                        <span className="room-privacy">
                            {room.isPrivate ? (
                                <div className="privacy-badge private">
                                    <Lock size={12} />
                                    Private Room
                                </div>
                            ) : (
                                <div className="privacy-badge public">
                                    <Globe size={12} />
                                    Public Room
                                </div>
                            )}
                        </span>
                    </div>
                    
                    {/* Debug info for development */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="debug-info" style={{ 
                            fontSize: '12px', 
                            color: '#666', 
                            marginTop: '8px',
                            fontFamily: 'monospace'
                        }}>
                            Creator: {room.creatorId} | You: {user.id} | IsCreator: {isCreator ? 'YES' : 'NO'} | Players: {totalPlayers}
                            <br />
                            <button 
                                style={{ 
                                    fontSize: '10px', 
                                    padding: '2px 6px', 
                                    marginTop: '4px',
                                    background: '#333',
                                    color: '#fff',
                                    border: '1px solid #555',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }}
                                onClick={async () => {
                                    try {
                                        const response = await axios.get(`http://localhost:5051/code-wars/debug/room/${room.id}`, {
                                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                        });
                                        console.log('🔍 Room Debug Info:', response.data);
                                        toast.success('Check console for room debug info');
                                    } catch (error) {
                                        console.error('Debug error:', error);
                                        toast.error('Debug request failed');
                                    }
                                }}
                            >
                                🔍 Debug Room
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="lobby-actions">
                    {canStart && (
                        <button className="start-game-btn" onClick={onStart}>
                            <Play size={16} />
                            Start Game
                        </button>
                    )}
                    {!canStart && isCreator && (
                        <div className="start-requirements">
                            <AlertCircle size={16} />
                            Need at least {minPlayers} players to start
                        </div>
                    )}
                    
                    {/* Room Recovery Button */}
                    {process.env.NODE_ENV === 'development' && (
                        <button 
                            className="refresh-room-btn"
                            onClick={async () => {
                                try {
                                    const response = await axios.get(`http://localhost:5051/code-wars/debug/room/${room.id}`, {
                                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                                    });
                                    
                                    if (!response.data.roomExists) {
                                        toast.error('🔄 Room expired. Returning to menu to create a new room.');
                                        setCurrentRoom(null);
                                        setGameState('menu');
                                        await loadFactionRooms();
                                    } else {
                                        toast.success('✅ Room is valid');
                                    }
                                } catch (error) {
                                    toast.error('Failed to check room status');
                                }
                            }}
                            style={{
                                background: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                marginLeft: '8px'
                            }}
                        >
                            🔄 Check Room
                        </button>
                    )}
                    
                    <button className="leave-room-btn" onClick={onLeave}>
                        <LogOut size={16} />
                        Leave
                    </button>
                    
                    {/* Emergency New Room Button */}
                    <button 
                        className="new-room-btn"
                        onClick={() => {
                            // Force return to menu and go to create room
                            setCurrentRoom(null);
                            setGameState('create');
                            toast.info('🆕 Creating new room...');
                        }}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            marginLeft: '8px'
                        }}
                    >
                        🆕 New Room
                    </button>
                </div>
            </div>
            
            <div className="teams-container">
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
            
            {room.spectators.length > 0 && (
                <div className="spectators-section">
                    <h4>👁️ Spectators ({room.spectators.length})</h4>
                    <div className="spectators-list">
                        {room.spectators.map(spectator => (
                            <div key={spectator.id} className="spectator-item">
                                {spectator.username}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {!canStart && isCreator && (
                <div className="start-requirements">
                    <AlertCircle size={16} />
                    Need at least {minPlayers} players to start the game
                </div>
            )}
        </motion.div>
    );
};

// Team Panel Component
const TeamPanel = ({ team, room, user, isMyTeam, onSwitchTeam }) => {
    const canJoinTeam = team.players.length < room.teamSize && !isMyTeam && room.status === 'waiting';
    
    return (
        <div className={`team-panel ${isMyTeam ? 'my-team' : ''}`}>
            <div className="team-header">
                <h3>{team.name}</h3>
                <div className="team-count">
                    {team.players.length}/{room.teamSize}
                </div>
            </div>
            
            <div className="team-players">
                {team.players.map(player => (
                    <div key={player.id} className={`player-item ${player.id === user.id ? 'me' : ''}`}>
                        <div className="player-avatar">
                            {player.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="player-info">
                            <span className="player-name">{player.username}</span>
                            {player.id === room.creatorId && (
                                <Crown size={12} className="creator-icon" />
                            )}
                        </div>
                    </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: room.teamSize - team.players.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="player-item empty">
                        <div className="player-avatar empty">
                            <UserPlus size={16} />
                        </div>
                        <span className="player-name">Waiting...</span>
                    </div>
                ))}
            </div>
            
            {canJoinTeam && (
                <button className="switch-team-btn" onClick={onSwitchTeam}>
                    Join Team
                </button>
            )}
        </div>
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
                                const isFinished = room.finishedPlayers && room.finishedPlayers.includes(player.id);
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
            players: team.players.map(p => ({
                id: p.id,
                username: p.username,
                score: p.score || 0,
                questionsCompleted: p.questionsCompleted || 0
            }))
        }));
        
        // Sort by score
        teamResults.sort((a, b) => b.totalScore - a.totalScore);
        
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
                    {isWinner ? (
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
                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-icon">
                                <Star size={24} />
                            </div>
                            <div className="stat-value">{myPlayer?.score || 0}</div>
                            <div className="stat-label">Points Earned</div>
                        </div>
                        
                        <div className="stat-box">
                            <div className="stat-icon">
                                <CheckCircle size={24} />
                            </div>
                            <div className="stat-value">{myPlayer?.questionsCompleted || 0}/{gameResults.gameStats.totalQuestions}</div>
                            <div className="stat-label">Questions Solved</div>
                        </div>
                        
                        <div className="stat-box">
                            <div className="stat-icon">
                                <Users size={24} />
                            </div>
                            <div className="stat-value">{myTeam?.name}</div>
                            <div className="stat-label">Your Team</div>
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
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showEndConfirm, setShowEndConfirm] = useState(false);

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
    const isFinished = playerFinished || (room.finishedPlayers && room.finishedPlayers.includes(user.id));
    
    // Count finished players
    const finishedCount = room.finishedPlayers ? room.finishedPlayers.length : 0;
    const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);

    const submitSolution = async () => {
        if (isFinished) {
            toast.error('You have already ended your contest!');
            return;
        }
        
        if (!code.trim()) {
            toast.error('Please write some code before submitting');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post('http://localhost:5051/code-wars/submit-solution', {
                questionId: currentQuestion.id,
                code
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                toast.success(`✅ Correct! +${response.data.points} points`);
                // Move to next question if available
                if (currentQuestionIndex < room.questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                    setCode('');
                }
            } else {
                toast.error('❌ Solution failed tests. Try again!');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Submission failed');
        } finally {
            setSubmitting(false);
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
            {/* Game Header */}
            <div className="game-header">
                <div className="game-timer">
                    <Timer size={20} />
                    <span className={timeLeft < 300 ? 'urgent' : ''}>{formatTime(timeLeft)}</span>
                </div>
                
                <div className="question-nav">
                    {room.questions.map((q, index) => (
                        <button
                            key={q.id}
                            className={`question-tab ${index === currentQuestionIndex ? 'active' : ''} ${
                                myPlayer.questionsCompleted > index ? 'completed' : ''
                            }`}
                            onClick={() => !isFinished && setCurrentQuestionIndex(index)}
                            disabled={isFinished}
                        >
                            {myPlayer.questionsCompleted > index ? (
                                <CheckCircle size={16} />
                            ) : (
                                <span>{index + 1}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="team-scores">
                    {room.teams.map(team => (
                        <div key={team.id} className={`team-score ${team.id === myTeam.id ? 'my-team' : ''}`}>
                            <span className="team-name">{team.name}</span>
                            <span className="score">{room.scores?.[team.id] || 0}</span>
                        </div>
                    ))}
                </div>
                
                {/* Finished Players Indicator */}
                {finishedCount > 0 && (
                    <div className="finished-indicator">
                        <CheckCircle size={16} />
                        <span>{finishedCount}/{totalPlayers} finished</span>
                    </div>
                )}
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

            {/* Question Panel */}
            <div className="question-panel">
                <div className="question-header">
                    <h3>{currentQuestion.title}</h3>
                    <div className="question-meta">
                        <span className={`difficulty ${currentQuestion.difficulty}`}>
                            {currentQuestion.difficulty}
                        </span>
                        <span className="points">{currentQuestion.points} pts</span>
                        {currentQuestion.source && (
                            <span className="source">from {currentQuestion.source}</span>
                        )}
                    </div>
                </div>
                
                <div className="question-content">
                    <div className="description">
                        {currentQuestion.description}
                    </div>
                    
                    {currentQuestion.examples && (
                        <div className="examples">
                            <h4>Examples:</h4>
                            {currentQuestion.examples.map((example, index) => (
                                <div key={index} className="example">
                                    <div className="example-input">
                                        <strong>Input:</strong> {example.input}
                                    </div>
                                    <div className="example-output">
                                        <strong>Output:</strong> {example.output}
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
                </div>
            </div>

            {/* Code Editor */}
            <div className="code-editor-panel">
                <div className="editor-header">
                    <Code size={20} />
                    <span>Java Solution</span>
                </div>
                
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
                        language="java"
                        onSubmit={submitSolution}
                        disabled={isFinished || submitting}
                    />
                ) : (
                    <>
                        <textarea
                            className="code-editor"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={currentQuestion.starterCode || "// Write your solution here"}
                            spellCheck={false}
                            disabled={isFinished}
                        />
                        
                        <div className="editor-actions">
                            <button 
                                className="submit-btn"
                                onClick={submitSolution}
                                disabled={submitting || !code.trim() || isFinished}
                            >
                                {submitting ? (
                                    <>
                                        <Loader className="spin" size={16} />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} />
                                        Submit Solution
                                    </>
                                )}
                            </button>
                            
                            {!isFinished && (
                                <button 
                                    className="end-contest-btn"
                                    onClick={() => setShowEndConfirm(true)}
                                >
                                    <LogOut size={16} />
                                    End Contest
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            
            {/* End Contest Confirmation Modal */}
            {showEndConfirm && (
                <div className="modal-overlay" onClick={() => setShowEndConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>End Contest?</h3>
                        <p>Are you sure you want to end your contest?</p>
                        <p className="warning">You won't be able to submit more solutions, but others can continue playing.</p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowEndConfirm(false)}>
                                Cancel
                            </button>
                            <button className="confirm-btn" onClick={handleEndContest}>
                                Yes, End Contest
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeWarsArena;