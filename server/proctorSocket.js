/**
 * Proctor Socket Handlers
 * Real-time monitoring and communication for proctored sessions
 */

const logger = require('./logger');

class ProctorSocket {
    constructor(io) {
        this.io = io;
        this.activeSessions = new Map(); // sessionId -> session data
        this.userSessions = new Map(); // userId -> sessionId
        this.violationCounts = new Map(); // sessionId -> violation count
        
        this.setupSocketHandlers();
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            logger.info(`[PROCTOR SOCKET] User connected: ${socket.id}`);

            // ═══════════════════════════════════════════════════════════════════
            // SESSION MANAGEMENT
            // ═══════════════════════════════════════════════════════════════════

            /**
             * Join a proctored session
             */
            socket.on('join-proctor-session', async (data) => {
                try {
                    const { sessionId, userId, username, role } = data;
                    
                    if (!sessionId || !userId) {
                        socket.emit('error', { message: 'Missing sessionId or userId' });
                        return;
                    }

                    // Join socket room
                    socket.join(`proctor_${sessionId}`);
                    socket.proctorSessionId = sessionId;
                    socket.proctorUserId = userId;
                    socket.proctorUsername = username || 'Unknown';
                    socket.proctorRole = role || 'candidate';

                    // Update user session mapping
                    this.userSessions.set(userId, sessionId);

                    // Get or create session data
                    if (!this.activeSessions.has(sessionId)) {
                        this.activeSessions.set(sessionId, {
                            id: sessionId,
                            participants: new Map(),
                            violations: [],
                            submissions: [],
                            activeQuestion: null,
                            monitoring: {
                                screenRecordings: new Map(),
                                faceDetections: new Map(),
                                tabSwitches: new Map()
                            },
                            createdAt: Date.now()
                        });
                    }

                    const session = this.activeSessions.get(sessionId);
                    
                    // Add participant
                    session.participants.set(userId, {
                        userId,
                        username: username || 'Unknown',
                        role: role || 'candidate',
                        socketId: socket.id,
                        joinedAt: Date.now(),
                        isActive: true,
                        violations: 0,
                        lastActivity: Date.now()
                    });

                    logger.info(`[PROCTOR SOCKET] User ${userId} (${username}) joined session ${sessionId} as ${role}`);
                    
                    // Notify other participants
                    socket.to(`proctor_${sessionId}`).emit('participant-joined', {
                        participant: { id: userId, userId, username: username || 'Unknown', role: role || 'candidate' },
                        sessionId
                    });

                    // Send current session state to the new participant
                    socket.emit('session-state', {
                        sessionId,
                        participantCount: session.participants.size,
                        violations: session.violations.length,
                        // Send active question if one is already pushed
                        activeQuestion: session.activeQuestion || null,
                    });

                } catch (error) {
                    logger.error('[PROCTOR SOCKET] Join session error:', error);
                    socket.emit('error', { message: 'Failed to join session' });
                }
            });

            /**
             * Leave proctored session
             */
            socket.on('leave-proctor-session', () => {
                this.handleLeaveSession(socket);
            });

            /**
             * Session started by interviewer
             */
            socket.on('session-started', (data) => {
                const { sessionId } = data;
                
                if (socket.proctorSessionId !== sessionId) {
                    socket.emit('error', { message: 'Not authorized for this session' });
                    return;
                }

                logger.info(`[PROCTOR SOCKET] Session ${sessionId} started`);
                
                // Notify all participants
                this.io.to(`proctor_${sessionId}`).emit('session-started', {
                    sessionId,
                    startTime: Date.now()
                });

                // Initialize monitoring for this session
                this.initializeSessionMonitoring(sessionId);
            });

            /**
             * Session ended
             */
            socket.on('session-ended', (data) => {
                const { sessionId, reason, code, violations } = data;
                
                if (socket.proctorSessionId !== sessionId) {
                    socket.emit('error', { message: 'Not authorized for this session' });
                    return;
                }

                logger.info(`[PROCTOR SOCKET] Session ${sessionId} ended: ${reason}`);
                
                // Save final submission if provided
                if (code) {
                    this.handleCodeSubmission(socket, {
                        sessionId,
                        code,
                        timestamp: Date.now(),
                        final: true
                    });
                }

                // Notify all participants
                this.io.to(`proctor_${sessionId}`).emit('session-ended', {
                    sessionId,
                    reason,
                    endTime: Date.now()
                });

                // Clean up session
                this.cleanupSession(sessionId);
            });

            // ═══════════════════════════════════════════════════════════════════
            // VIOLATION MONITORING
            // ═══════════════════════════════════════════════════════════════════

            /**
             * Report violation
             */
            socket.on('violation-reported', (data) => {
                this.handleViolationReport(socket, data);
            });

            /**
             * Real-time monitoring updates
             */
            socket.on('monitoring-update', (data) => {
                this.handleMonitoringUpdate(socket, data);
            });

            /**
             * Face detection update
             */
            socket.on('face-detection', (data) => {
                this.handleFaceDetection(socket, data);
            });

            /**
             * Tab focus change
             */
            socket.on('tab-focus-change', (data) => {
                this.handleTabFocusChange(socket, data);
            });

            // ═══════════════════════════════════════════════════════════════════
            // CODE COLLABORATION
            // ═══════════════════════════════════════════════════════════════════

            /**
             * Code changes (real-time collaboration)
             */
            socket.on('code-change', (data) => {
                this.handleCodeChange(socket, data);
            });

            /**
             * Code submission
             */
            socket.on('code-submitted', (data) => {
                this.handleCodeSubmission(socket, data);
            });

            /**
             * Cursor position update
             */
            socket.on('cursor-position', (data) => {
                this.handleCursorUpdate(socket, data);
            });

            // ═══════════════════════════════════════════════════════════════════
            // SCREEN RECORDING
            // ═══════════════════════════════════════════════════════════════════

            /**
             * Screen recording chunk
             */
            socket.on('screen-recording-chunk', (data) => {
                this.handleScreenRecording(socket, data);
            });

            // ═══════════════════════════════════════════════════════════════════
            // VIDEO/AUDIO COMMUNICATION
            // ═══════════════════════════════════════════════════════════════════

            /**
             * WebRTC signaling for video calls
             */
            socket.on('webrtc-offer', (data) => {
                this.handleWebRTCSignaling(socket, 'offer', data);
            });

            socket.on('webrtc-answer', (data) => {
                this.handleWebRTCSignaling(socket, 'answer', data);
            });

            socket.on('webrtc-ice-candidate', (data) => {
                this.handleWebRTCSignaling(socket, 'ice-candidate', data);
            });

            // ═══════════════════════════════════════════════════════════════════
            // QUESTION PUSH  (admin → all candidates)
            // ═══════════════════════════════════════════════════════════════════

            /**
             * Admin pushes a question to all candidates in the session
             * data: { sessionId, question: { id, name, statement, examples, constraints, difficulty, topic } }
             */
            socket.on('proctor-push-question', (data) => {
                const { sessionId, question } = data;
                if (socket.proctorSessionId !== sessionId) return;
                logger.info(`[PROCTOR SOCKET] Admin pushed question "${question?.name}" to session ${sessionId}`);

                // Store active question so late-joiners get it on join-state
                const session = this.activeSessions.get(sessionId);
                if (session) session.activeQuestion = question;

                // Broadcast to every socket in the room (including admin, so they see confirmation)
                this.io.to(`proctor_${sessionId}`).emit('proctor-question-pushed', {
                    sessionId,
                    question,
                    pushedAt: Date.now(),
                });
            });

            /**
             * Admin clears the active question
             */
            socket.on('proctor-clear-question', (data) => {
                const { sessionId } = data;
                if (socket.proctorSessionId !== sessionId) return;
                const session = this.activeSessions.get(sessionId);
                if (session) session.activeQuestion = null;
                this.io.to(`proctor_${sessionId}`).emit('proctor-question-cleared', { sessionId });
            });

            // ═══════════════════════════════════════════════════════════════════
            // WEBRTC — per-stream type signaling
            // Each peer identifies a "streamType": "camera" | "screen"
            // Signals carry { sessionId, targetUserId, streamType, offer/answer/candidate }
            // ═══════════════════════════════════════════════════════════════════

            socket.on('proctor-webrtc-offer', (data) => {
                this.forwardToUser(socket, data.targetUserId, 'proctor-webrtc-offer', data);
            });
            socket.on('proctor-webrtc-answer', (data) => {
                this.forwardToUser(socket, data.targetUserId, 'proctor-webrtc-answer', data);
            });
            socket.on('proctor-webrtc-ice', (data) => {
                this.forwardToUser(socket, data.targetUserId, 'proctor-webrtc-ice', data);
            });

            /**
             * A user announces they have a new stream ready (camera or screen).
             * Everyone else in the room who needs it will initiate an offer.
             */
            socket.on('proctor-stream-ready', (data) => {
                const { sessionId, streamType, username } = data;
                if (socket.proctorSessionId !== sessionId) return;
                logger.info(`[PROCTOR SOCKET] User ${socket.proctorUserId} stream-ready: ${streamType}`);
                socket.to(`proctor_${sessionId}`).emit('proctor-stream-ready', {
                    sessionId,
                    userId: socket.proctorUserId,
                    username,
                    streamType,
                    socketId: socket.id,
                });
            });

            /**
             * A user's stream ended (e.g. stopped screen share)
             */
            socket.on('proctor-stream-ended', (data) => {
                const { sessionId, streamType } = data;
                if (socket.proctorSessionId !== sessionId) return;
                socket.to(`proctor_${sessionId}`).emit('proctor-stream-ended', {
                    sessionId,
                    userId: socket.proctorUserId,
                    streamType,
                });
            });

            // ═══════════════════════════════════════════════════════════════════
            // CHAT MESSAGING
            // ═══════════════════════════════════════════════════════════════════

            /**
             * Chat message in session
             */
            socket.on('session-chat-message', (data) => {
                this.handleChatMessage(socket, data);
            });

            // ═══════════════════════════════════════════════════════════════════
            // DISCONNECT HANDLING
            // ═══════════════════════════════════════════════════════════════════

            socket.on('disconnect', () => {
                logger.info(`[PROCTOR SOCKET] User disconnected: ${socket.id}`);
                this.handleDisconnect(socket);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // HANDLER METHODS
    // ═══════════════════════════════════════════════════════════════════════════════

    handleLeaveSession(socket) {
        if (!socket.proctorSessionId || !socket.proctorUserId) {
            return;
        }

        const sessionId = socket.proctorSessionId;
        const userId = socket.proctorUserId;
        const session = this.activeSessions.get(sessionId);

        if (session && session.participants.has(userId)) {
            session.participants.delete(userId);
            this.userSessions.delete(userId);

            logger.info(`[PROCTOR SOCKET] User ${userId} left session ${sessionId}`);
            
            // Notify other participants
            socket.to(`proctor_${sessionId}`).emit('participant-left', {
                participantId: userId,
                sessionId
            });
        }

        socket.leave(`proctor_${sessionId}`);
        socket.proctorSessionId = null;
        socket.proctorUserId = null;
    }

    handleViolationReport(socket, data) {
        const { sessionId, violation } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            socket.emit('error', { message: 'Not authorized for this session' });
            return;
        }

        const session = this.activeSessions.get(sessionId);
        if (!session) {
            socket.emit('error', { message: 'Session not found' });
            return;
        }

        // Add violation to session
        const violationRecord = {
            id: Date.now().toString(),
            userId: socket.proctorUserId,
            type: violation.type,
            description: violation.description,
            severity: violation.severity || 'MEDIUM',
            timestamp: Date.now(),
            socketId: socket.id
        };

        session.violations.push(violationRecord);

        // Update participant violation count
        const participant = session.participants.get(socket.proctorUserId);
        if (participant) {
            participant.violations++;
        }

        logger.warn(`[PROCTOR SOCKET] Violation reported: ${violation.type} by user ${socket.proctorUserId} in session ${sessionId}`);

        // Notify interviewer/monitor
        socket.to(`proctor_${sessionId}`).emit('violation-detected', {
            sessionId,
            violation: violationRecord,
            participantId: socket.proctorUserId
        });

        // Check if participant should be terminated
        if (participant && participant.violations >= 3) {
            this.io.to(`proctor_${sessionId}`).emit('participant-terminated', {
                sessionId,
                participantId: socket.proctorUserId,
                reason: 'EXCESSIVE_VIOLATIONS',
                violationCount: participant.violations
            });
        }
    }

    handleMonitoringUpdate(socket, data) {
        const { sessionId, type, payload } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            return;
        }

        // Forward monitoring data to interviewer
        socket.to(`proctor_${sessionId}`).emit('monitoring-data', {
            sessionId,
            userId: socket.proctorUserId,
            type,
            payload,
            timestamp: Date.now()
        });
    }

    handleFaceDetection(socket, data) {
        const { sessionId, faces, screenshot } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            return;
        }

        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }

        // Check for violations
        let violationType = null;
        let description = null;

        if (faces.length === 0) {
            violationType = 'FACE_NOT_DETECTED';
            description = 'No face detected in camera feed';
        } else if (faces.length > 1) {
            violationType = 'MULTIPLE_FACES';
            description = `Multiple faces detected: ${faces.length}`;
        }

        if (violationType) {
            this.handleViolationReport(socket, {
                sessionId,
                violation: {
                    type: violationType,
                    description,
                    severity: 'HIGH'
                }
            });
        }

        // Store face detection data
        if (!session.monitoring.faceDetections.has(socket.proctorUserId)) {
            session.monitoring.faceDetections.set(socket.proctorUserId, []);
        }

        session.monitoring.faceDetections.get(socket.proctorUserId).push({
            faces,
            timestamp: Date.now(),
            screenshot: screenshot ? 'available' : 'none' // Don't store actual screenshot in memory
        });
    }

    handleTabFocusChange(socket, data) {
        const { sessionId, isFocused } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            return;
        }

        if (!isFocused) {
            this.handleViolationReport(socket, {
                sessionId,
                violation: {
                    type: 'TAB_SWITCH',
                    description: 'User switched tabs or lost focus',
                    severity: 'MEDIUM'
                }
            });
        }

        // Update participant activity
        const session = this.activeSessions.get(sessionId);
        if (session) {
            const participant = session.participants.get(socket.proctorUserId);
            if (participant) {
                participant.lastActivity = Date.now();
                participant.isActive = isFocused;
            }
        }
    }

    handleCodeChange(socket, data) {
        const { sessionId, code, cursorPosition } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            return;
        }

        // Broadcast code changes to interviewer and other participants
        socket.to(`proctor_${sessionId}`).emit('code-updated', {
            sessionId,
            userId: socket.proctorUserId,
            code,
            cursorPosition,
            timestamp: Date.now()
        });
    }

    handleCodeSubmission(socket, data) {
        const { sessionId, code, questionId, timestamp, final } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            return;
        }

        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }

        const submission = {
            id: Date.now().toString(),
            userId: socket.proctorUserId,
            questionId: questionId || 'unknown',
            code,
            timestamp: timestamp || Date.now(),
            final: final || false
        };

        session.submissions.push(submission);

        logger.info(`[PROCTOR SOCKET] Code submitted by user ${socket.proctorUserId} in session ${sessionId}`);

        // Notify interviewer
        socket.to(`proctor_${sessionId}`).emit('code-submitted', {
            sessionId,
            submission,
            participantId: socket.proctorUserId
        });
    }

    handleCursorUpdate(socket, data) {
        const { sessionId, position } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            return;
        }

        // Broadcast cursor position to other participants
        socket.to(`proctor_${sessionId}`).emit('cursor-updated', {
            sessionId,
            userId: socket.proctorUserId,
            position,
            timestamp: Date.now()
        });
    }

    handleScreenRecording(socket, data) {
        const { sessionId, chunk } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            return;
        }

        // In a production environment, you'd save these chunks to cloud storage
        // For now, we'll just log and forward to monitoring dashboard
        
        logger.info(`[PROCTOR SOCKET] Screen recording chunk received from user ${socket.proctorUserId} in session ${sessionId}`);

        // Forward to interviewer for real-time monitoring
        socket.to(`proctor_${sessionId}`).emit('screen-recording-data', {
            sessionId,
            userId: socket.proctorUserId,
            chunk: chunk, // In production, this would be a URL to stored chunk
            timestamp: Date.now()
        });
    }

    handleWebRTCSignaling(socket, type, data) {
        const { sessionId, targetUserId, ...signalData } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            return;
        }

        // Find target user's socket
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }

        let targetSocketId = null;
        for (const [userId, participant] of session.participants) {
            if (userId === targetUserId) {
                targetSocketId = participant.socketId;
                break;
            }
        }

        if (targetSocketId) {
            this.io.to(targetSocketId).emit(`webrtc-${type}`, {
                sessionId,
                fromUserId: socket.proctorUserId,
                ...signalData
            });
        }
    }

    handleChatMessage(socket, data) {
        const { sessionId, message } = data;
        
        if (socket.proctorSessionId !== sessionId) {
            return;
        }

        const chatMessage = {
            id: Date.now().toString(),
            userId: socket.proctorUserId,
            message,
            timestamp: Date.now()
        };

        // Broadcast to all participants in session
        this.io.to(`proctor_${sessionId}`).emit('chat-message', {
            sessionId,
            message: chatMessage
        });

        logger.info(`[PROCTOR SOCKET] Chat message in session ${sessionId} from user ${socket.proctorUserId}`);
    }

    handleDisconnect(socket) {
        if (socket.proctorSessionId && socket.proctorUserId) {
            // Mark participant as inactive but don't remove immediately
            // in case they reconnect
            const session = this.activeSessions.get(socket.proctorSessionId);
            if (session) {
                const participant = session.participants.get(socket.proctorUserId);
                if (participant) {
                    participant.isActive = false;
                    participant.disconnectedAt = Date.now();
                }

                // Notify other participants
                socket.to(`proctor_${socket.proctorSessionId}`).emit('participant-disconnected', {
                    sessionId: socket.proctorSessionId,
                    participantId: socket.proctorUserId,
                    timestamp: Date.now()
                });
            }

            this.userSessions.delete(socket.proctorUserId);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * Forward a WebRTC signal to a specific user by their userId.
     * Attaches fromUserId so the receiver knows who sent it.
     */
    forwardToUser(socket, targetUserId, event, data) {
        const sessionId = socket.proctorSessionId;
        if (!sessionId) return;
        const session = this.activeSessions.get(sessionId);
        if (!session) return;
        const target = session.participants.get(targetUserId);
        if (target?.socketId) {
            this.io.to(target.socketId).emit(event, {
                ...data,
                fromUserId: socket.proctorUserId,
            });
        }
    }

    initializeSessionMonitoring(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }

        // Initialize monitoring intervals
        session.monitoringInterval = setInterval(() => {
            this.performPeriodicChecks(sessionId);
        }, 30000); // Check every 30 seconds

        logger.info(`[PROCTOR SOCKET] Monitoring initialized for session ${sessionId}`);
    }

    performPeriodicChecks(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }

        const now = Date.now();
        
        // Check for inactive participants
        for (const [userId, participant] of session.participants) {
            if (participant.isActive && (now - participant.lastActivity) > 60000) { // 1 minute inactive
                // Mark as potentially away
                this.io.to(`proctor_${sessionId}`).emit('participant-inactive', {
                    sessionId,
                    participantId: userId,
                    lastActivity: participant.lastActivity
                });
            }
        }
    }

    cleanupSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            return;
        }

        // Clear monitoring intervals
        if (session.monitoringInterval) {
            clearInterval(session.monitoringInterval);
        }

        // Remove all participants from user mapping
        for (const userId of session.participants.keys()) {
            this.userSessions.delete(userId);
        }

        // Remove session
        this.activeSessions.delete(sessionId);
        
        logger.info(`[PROCTOR SOCKET] Session ${sessionId} cleaned up`);
    }

    // Public methods for external use
    getActiveSessionCount() {
        return this.activeSessions.size;
    }

    getSessionParticipants(sessionId) {
        const session = this.activeSessions.get(sessionId);
        return session ? Array.from(session.participants.keys()) : [];
    }

    getSessionViolations(sessionId) {
        const session = this.activeSessions.get(sessionId);
        return session ? session.violations : [];
    }

    forceEndSession(sessionId, reason) {
        this.io.to(`proctor_${sessionId}`).emit('session-force-ended', {
            sessionId,
            reason,
            timestamp: Date.now()
        });

        this.cleanupSession(sessionId);
    }
}

module.exports = ProctorSocket;