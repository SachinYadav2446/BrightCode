import { io } from 'socket.io-client';
import API_URL from './config';

let socketInstance = null;

export const initSocket = () => {
    // Reuse existing connected socket
    if (socketInstance?.connected) {
        return socketInstance;
    }

    // If instance exists but disconnected, reconnect it instead of creating a new one
    if (socketInstance) {
        if (!socketInstance.connected) {
            socketInstance.connect();
        }
        return socketInstance;
    }

    const backendUrl = API_URL;

    socketInstance = io(backendUrl, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        withCredentials: true,
    });

    socketInstance.on('connect', () => {
        console.log('✅ Socket connected, ID:', socketInstance.id);
        console.log('✅ Socket transport:', socketInstance.io.engine.transport.name);
    });

    socketInstance.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        if (location.protocol === 'https:' && backendUrl.startsWith('http:')) {
            console.error('❌ HTTPS page connecting to HTTP WebSocket - this will fail!');
        }
    });

    socketInstance.on('disconnect', (reason) => {
        console.warn('⚠️ Socket disconnected:', reason);
        // Only null out if server explicitly disconnected us
        if (reason === 'io server disconnect') {
            socketInstance = null;
        }
    });

    return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};
