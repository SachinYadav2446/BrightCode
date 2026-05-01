import { io } from 'socket.io-client';

export const initSocket = () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling'], // Try both transports
        autoConnect: true,
    };
    
    const socket = io('http://localhost:5051', options);
    
    // Add connection logging
    socket.on('connect', () => {
        console.log('✅ Socket connected successfully, ID:', socket.id);
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        console.error('Make sure the server is running on http://localhost:5051');
    });
    
    socket.on('disconnect', (reason) => {
        console.warn('⚠️ Socket disconnected:', reason);
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });
    
    socket.on('reconnect', (attemptNumber) => {
        console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
    });
    
    socket.on('reconnect_failed', () => {
        console.error('❌ Socket reconnection failed after all attempts');
    });
    
    return socket;
};
