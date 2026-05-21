import { io } from 'socket.io-client';
import API_URL from './config';

let socketInstance = null;

export const initSocket = () => {
    if (socketInstance) {
        return socketInstance;
    }

    const backendUrl = API_URL;

    socketInstance = io(backendUrl, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        autoConnect: true,
        forceNew: true,
        withCredentials: true,
    });

    socketInstance.on('connect', () => {
        console.log('✅ Socket connected, ID:', socketInstance.id);
        console.log('✅ Socket transport:', socketInstance.io.engine.transport.name);
    });

    socketInstance.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        console.error('❌ Socket error details:', error);
        // Check if it's an HTTPS/WSS issue
        if (location.protocol === 'https:' && backendUrl.startsWith('http:')) {
            console.error('❌ HTTPS page connecting to HTTP WebSocket - this will fail!');
        }
    });

    socketInstance.on('disconnect', (reason) => {
        console.warn('⚠️ Socket disconnected:', reason);
        // If the server disconnects us, reset so next call reconnects
        if (reason === 'io server disconnect') {
            socketInstance = null;
        }
    });

    return socketInstance;
};

export const getSocket = () => socketInstance;
