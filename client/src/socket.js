import { io } from 'socket.io-client';

let socketInstance = null;

export const initSocket = () => {
    if (socketInstance) {
        return socketInstance;
    }

    const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5051'
        : `http://${window.location.hostname}:5051`;

    socketInstance = io(backendUrl, {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        autoConnect: true,
    });

    socketInstance.on('connect', () => {
        console.log('✅ Socket connected, ID:', socketInstance.id);
    });

    socketInstance.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
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
