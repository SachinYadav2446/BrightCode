// Code Wars Arena - Main Game System
const { v4: uuidv4 } = require('uuid');
const { compileAndRunJava } = require('./javaCompiler');
const { getRandomQuestions, getQuestionById, GAME_MODES, DIFFICULTY_LEVELS } = require('./codeWarQuestions');
const { CachedLeetCodeAPI } = require('./leetcodeAPI');

class CodeWarsArena {
    constructor(io, factions) {
        this.io = io;
        this.factions = factions;
        this.activeGames = new Map(); // gameId -> gameSession
        this.privateRooms = new Map(); // roomId -> room info
        this.playerQueues = new Map(); // factionId -> queue info (for inter-faction battles)
        this.leetcodeAPI = new CachedLeetCodeAPI();
    }

    // ═══ PRIVATE ROOM MANAGEMENT ═══
    
    createPrivateRoom(creatorId, creatorUsername, factionId, settings) {
        const roomId = this.generateRoomId();
        
        const room = {
            id: roomId,
            creatorId,
            creatorUsername,
            factionId,
            password: settings.password || null,
            settings: {
                gameMode: settings.gameMode || 'QUICK_BATTLE',
                teamSize: settings.teamSize || 1, // 1v1, 2v2, 3v3, etc.
                maxPlayers: settings.maxPlayers || 2,
                questionSource: settings.questionSource || 'builtin',
                isPrivate: settings.isPrivate !== false, // default to private
                allowSpectators: settings.allowSpectators || false
            },
            status: 'waiting', // waiting, active, completed
            players: [{
                userId: creatorId,
                username: creatorUsername,
                team: 1,
                isReady: false,
                joinedAt: Date.now()
            }],
            teams: {
                1: { name: 'Team Alpha', players: [creatorId], score: 0 },
                2: { name: 'Team Beta', players: [], score: 0 }
            },
            spectators: [],
            gameSession: null,
            createdAt: Date.now()
        };

        this.privateRooms.set(roomId, room);
        return room;
    }

    generateRoomId() {
        // Generate a 6-character room ID
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Ensure uniqueness
        if (this.privateRooms.has(result)) {
            return this.generateRoomId();
        }
        
        return result;
    }

    joinPrivateRoom(roomId, userId, username, password = null, asSpectator = false) {
        const room = this.privateRooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        // Check password
        if (room.password && room.password !== password) {
            throw new Error('Incorrect password');
        }

        // Check if already in room
        const existingPlayer = room.players.find(p => p.userId === userId);
        if (existingPlayer) {
            throw new Error('Already in this room');
        }

        // Check faction membership
        const faction = this.factions.get(room.factionId);
        if (!faction || !faction.members.find(m => m.id === userId)) {
            throw new Error('You must be a member of this faction to join');
        }

        if (asSpectator) {
            if (!room.settings.allowSpectators) {
                throw new Error('Spectators not allowed in this room');
            }
            room.spectators.push({
                userId,
                username,
                joinedAt: Date.now()
            });
        } else {
            // Check room capacity
            if (room.players.length >= room.settings.maxPlayers) {
                throw new Error('Room is full');
            }

            // Auto-assign to team with fewer players
            const team1Count = room.teams[1].players.length;
            const team2Count = room.teams[2].players.length;
            const assignedTeam = team1Count <= team2Count ? 1 : 2;

            const player = {
                userId,
                username,
                team: assignedTeam,
                isReady: false,
                joinedAt: Date.now()
            };

            room.players.push(player);
            room.teams[assignedTeam].players.push(userId);
        }

        this.privateRooms.set(roomId, room);
        
        // Notify room members
        this.io.to(`room_${roomId}`).emit('room-updated', {
            room: this.sanitizeRoomForClient(room),
            event: 'player-joined',
            player: { userId, username }
        });

        return room;
    }

    leavePrivateRoom(roomId, userId) {
        const room = this.privateRooms.get(roomId);
        if (!room) return false;

        // Remove from players
        const playerIndex = room.players.findIndex(p => p.userId === userId);
        if (playerIndex !== -1) {
            const player = room.players[playerIndex];
            room.players.splice(playerIndex, 1);
            
            // Remove from team
            room.teams[player.team].players = room.teams[player.team].players.filter(id => id !== userId);
        }

        // Remove from spectators
        room.spectators = room.spectators.filter(s => s.userId !== userId);

        // If creator left and room is not in game, delete room
        if (room.creatorId === userId && room.status === 'waiting') {
            this.privateRooms.delete(roomId);
            this.io.to(`room_${roomId}`).emit('room-closed', { reason: 'Creator left' });
            return true;
        }

        // If no players left, delete room
        if (room.players.length === 0) {
            this.privateRooms.delete(roomId);
            return true;
        }

        this.privateRooms.set(roomId, room);
        
        // Notify remaining members
        this.io.to(`room_${roomId}`).emit('room-updated', {
            room: this.sanitizeRoomForClient(room),
            event: 'player-left',
            player: { userId }
        });

        return true;
    }

    togglePlayerReady(roomId, userId) {
        const room = this.privateRooms.get(roomId);
        if (!room) throw new Error('Room not found');

        const player = room.players.find(p => p.userId === userId);
        if (!player) throw new Error('Player not in room');

        player.isReady = !player.isReady;
        this.privateRooms.set(roomId, room);

        // Notify room
        this.io.to(`room_${roomId}`).emit('room-updated', {
            room: this.sanitizeRoomForClient(room),
            event: 'ready-changed',
            player: { userId, isReady: player.isReady }
        });

        // Check if all players are ready
        const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);
        if (allReady && room.status === 'waiting') {
            this.startPrivateRoomGame(roomId);
        }

        return room;
    }

    async startPrivateRoomGame(roomId) {
        const room = this.privateRooms.get(roomId);
        if (!room) throw new Error('Room not found');

        if (room.players.length < 2) {
            throw new Error('Need at least 2 players to start');
        }

        // Create game session
        const gameSession = this.createGameSessionFromRoom(room);
        await this.generateQuestionsForGame(gameSession);

        room.gameSession = gameSession.id;
        room.status = 'active';
        this.privateRooms.set(roomId, room);

        // Start the game
        this.startGame(gameSession.id);

        return gameSession;
    }

    createGameSessionFromRoom(room) {
        const gameId = uuidv4();
        const mode = GAME_MODES[room.settings.gameMode];
        
        const gameSession = {
            id: gameId,
            type: 'private_room',
            roomId: room.id,
            factionId: room.factionId,
            participants: room.players.map(p => ({
                userId: p.userId,
                username: p.username,
                team: p.team,
                joinedAt: p.joinedAt,
                currentQuestion: 0,
                completedQuestions: [],
                totalScore: 0
            })),
            teams: {
                1: { ...room.teams[1], totalPoints: 0, questionsCompleted: 0 },
                2: { ...room.teams[2], totalPoints: 0, questionsCompleted: 0 }
            },
            status: 'waiting',
            gameMode: room.settings.gameMode,
            questionSource: room.settings.questionSource,
            startTime: null,
            endTime: null,
            duration: mode.duration,
            questions: [],
            currentQuestionIndex: 0,
            submissions: new Map(),
            settings: {
                maxParticipants: room.settings.maxPlayers,
                questionCount: mode.questionCount,
                difficulties: mode.difficulties,
                teamBased: room.settings.teamSize > 1
            },
            createdAt: new Date().toISOString()
        };

        this.activeGames.set(gameId, gameSession);
        return gameSession;
    }

    getPrivateRoom(roomId) {
        return this.privateRooms.get(roomId);
    }

    getFactionRooms(factionId) {
        return Array.from(this.privateRooms.values())
            .filter(room => room.factionId === factionId)
            .map(room => this.sanitizeRoomForClient(room));
    }

    sanitizeRoomForClient(room) {
        // Remove sensitive information like passwords
        const sanitized = { ...room };
        delete sanitized.password;
        return sanitized;
    }
    
    createGameSession(factionIds, gameMode = 'QUICK_BATTLE', questionSource = 'builtin') {
        const gameId = uuidv4();
        const mode = GAME_MODES[gameMode];
        
        const gameSession = {
            id: gameId,
            type: 'code_wars',
            factions: factionIds,
            participants: [],
            status: 'waiting', // waiting, active, completed
            gameMode: gameMode,
            questionSource: questionSource,
            startTime: null,
            endTime: null,
            duration: mode.duration,
            questions: [],
            currentQuestionIndex: 0,
            scores: {},
            submissions: new Map(), // playerId -> submissions
            settings: {
                maxParticipants: 10, // 5 per faction
                minParticipants: 2,  // 1 per faction
                questionCount: mode.questionCount,
                difficulties: mode.difficulties
            },
            createdAt: new Date().toISOString()
        };

        // Initialize faction scores
        factionIds.forEach(factionId => {
            gameSession.scores[factionId] = {
                totalPoints: 0,
                questionsCompleted: 0,
                averageTime: 0,
                participants: []
            };
        });

        this.activeGames.set(gameId, gameSession);
        return gameSession;
    }

    // ═══ MATCHMAKING ═══
    
    async joinQueue(factionId, userId, username, gameMode = 'QUICK_BATTLE') {
        // Check if faction exists and user is member
        const faction = this.factions.get(factionId);
        if (!faction || !faction.members.find(m => m.id === userId)) {
            throw new Error('You are not a member of this faction');
        }

        // Check if already in queue or active game
        if (this.isPlayerInGame(userId)) {
            throw new Error('You are already in a game or queue');
        }

        // Add to queue
        if (!this.playerQueues.has(factionId)) {
            this.playerQueues.set(factionId, {
                factionId,
                gameMode,
                players: [],
                createdAt: Date.now()
            });
        }

        const queue = this.playerQueues.get(factionId);
        queue.players.push({
            userId,
            username,
            joinedAt: Date.now()
        });

        // Notify faction members
        this.io.to(`faction_${factionId}`).emit('queue-update', {
            factionId,
            playersInQueue: queue.players.length,
            gameMode
        });

        // Try to find match
        await this.tryMatchmaking(gameMode);

        return {
            success: true,
            message: 'Joined queue successfully',
            queuePosition: queue.players.length
        };
    }

    async tryMatchmaking(gameMode) {
        const queues = Array.from(this.playerQueues.values())
            .filter(q => q.gameMode === gameMode && q.players.length > 0);

        if (queues.length < 2) return; // Need at least 2 factions

        // Find best match (similar faction levels, queue times)
        const matchedQueues = this.findBestMatch(queues);
        if (matchedQueues.length >= 2) {
            await this.createMatchFromQueues(matchedQueues, gameMode);
        }
    }

    findBestMatch(queues) {
        // Simple matching: take first 2 queues with players
        // TODO: Implement more sophisticated matching based on faction levels
        return queues.slice(0, 2);
    }

    async createMatchFromQueues(queues, gameMode) {
        const factionIds = queues.map(q => q.factionId);
        const gameSession = this.createGameSession(factionIds, gameMode);

        // Move players from queues to game
        for (const queue of queues) {
            for (const player of queue.players) {
                this.addPlayerToGame(gameSession.id, player.userId, player.username, queue.factionId);
            }
            // Clear the queue
            this.playerQueues.delete(queue.factionId);
        }

        // Generate questions for the game
        await this.generateQuestionsForGame(gameSession);

        // Notify all participants
        this.notifyGameStart(gameSession);

        return gameSession;
    }

    // ═══ QUESTION GENERATION ═══
    
    async generateQuestionsForGame(gameSession) {
        const { questionCount, difficulties } = gameSession.settings;
        const questions = [];

        if (gameSession.questionSource === 'leetcode') {
            // Use LeetCode API (with fallback to builtin)
            try {
                for (let i = 0; i < questionCount; i++) {
                    const difficulty = difficulties[i] || DIFFICULTY_LEVELS.EASY;
                    const leetcodeProblems = await this.leetcodeAPI.getCachedProblems(difficulty, 10);
                    
                    if (leetcodeProblems.length > 0) {
                        const randomProblem = leetcodeProblems[Math.floor(Math.random() * leetcodeProblems.length)];
                        const questionDetails = await this.leetcodeAPI.getCachedProblemDetails(randomProblem.titleSlug);
                        
                        if (questionDetails) {
                            questions.push(questionDetails);
                            continue;
                        }
                    }
                    
                    // Fallback to builtin questions
                    const builtinQuestions = getRandomQuestions(1, difficulty);
                    if (builtinQuestions.length > 0) {
                        questions.push(builtinQuestions[0]);
                    }
                }
            } catch (error) {
                console.error('Error generating LeetCode questions:', error);
                // Fallback to builtin questions
                gameSession.questionSource = 'builtin';
            }
        }

        if (gameSession.questionSource === 'builtin' || questions.length === 0) {
            // Use builtin questions
            for (let i = 0; i < questionCount; i++) {
                const difficulty = difficulties[i] || DIFFICULTY_LEVELS.EASY;
                const builtinQuestions = getRandomQuestions(1, difficulty);
                if (builtinQuestions.length > 0) {
                    questions.push(builtinQuestions[0]);
                }
            }
        }

        gameSession.questions = questions;
        this.activeGames.set(gameSession.id, gameSession);
    }

    // ═══ GAME FLOW ═══
    
    addPlayerToGame(gameId, userId, username, factionId) {
        const game = this.activeGames.get(gameId);
        if (!game) throw new Error('Game not found');

        const participant = {
            userId,
            username,
            factionId,
            joinedAt: Date.now(),
            currentQuestion: 0,
            completedQuestions: [],
            totalScore: 0
        };

        game.participants.push(participant);
        game.scores[factionId].participants.push(participant);
        
        // Initialize submissions for this player
        game.submissions.set(userId, []);

        this.activeGames.set(gameId, game);
    }

    startGame(gameId) {
        const game = this.activeGames.get(gameId);
        if (!game) throw new Error('Game not found');

        game.status = 'active';
        game.startTime = new Date().toISOString();
        game.endTime = new Date(Date.now() + game.duration * 1000).toISOString();

        this.activeGames.set(gameId, game);
        this.notifyGameStart(game);

        // Set game end timer
        setTimeout(() => {
            this.endGame(gameId);
        }, game.duration * 1000);
    }

    async submitSolution(gameId, userId, questionId, code) {
        const game = this.activeGames.get(gameId);
        if (!game || game.status !== 'active') {
            throw new Error('Game not active');
        }

        const participant = game.participants.find(p => p.userId === userId);
        if (!participant) {
            throw new Error('Player not in game');
        }

        const question = game.questions.find(q => q.id === questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        // Check if already completed this question
        if (participant.completedQuestions.includes(questionId)) {
            throw new Error('Question already completed');
        }

        try {
            // Compile and test the solution
            const result = await compileAndRunJava(code, question.testCases);
            
            const submission = {
                questionId,
                code,
                result,
                submittedAt: new Date().toISOString(),
                timeTaken: this.calculateTimeTaken(game.startTime)
            };

            // Store submission
            const playerSubmissions = game.submissions.get(userId) || [];
            playerSubmissions.push(submission);
            game.submissions.set(userId, playerSubmissions);

            if (result.success) {
                // Mark question as completed
                participant.completedQuestions.push(questionId);
                participant.totalScore += question.points;

                // Update faction score
                const factionScore = game.scores[participant.factionId];
                factionScore.totalPoints += question.points;
                factionScore.questionsCompleted++;

                // Broadcast success to all players
                this.io.to(`game_${gameId}`).emit('solution-accepted', {
                    userId,
                    username: participant.username,
                    factionId: participant.factionId,
                    questionId,
                    points: question.points,
                    timeTaken: submission.timeTaken
                });

                // Check if game should end (all questions completed by someone)
                if (participant.completedQuestions.length === game.questions.length) {
                    this.endGame(gameId);
                }
            }

            this.activeGames.set(gameId, game);

            return {
                success: result.success,
                result: result,
                points: result.success ? question.points : 0,
                totalScore: participant.totalScore
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                points: 0,
                totalScore: participant.totalScore
            };
        }
    }

    endGame(gameId) {
        const game = this.activeGames.get(gameId);
        if (!game) return;

        game.status = 'completed';
        game.endTime = new Date().toISOString();

        // Calculate final scores and winner
        const results = this.calculateGameResults(game);
        
        // Notify all participants
        this.io.to(`game_${gameId}`).emit('game-ended', {
            gameId,
            results,
            duration: game.duration
        });

        // Award XP to participants
        this.awardGameXP(game, results);

        // Clean up after 5 minutes
        setTimeout(() => {
            this.activeGames.delete(gameId);
        }, 5 * 60 * 1000);
    }

    // ═══ UTILITY METHODS ═══
    
    calculateGameResults(game) {
        const factionResults = [];

        for (const [factionId, score] of Object.entries(game.scores)) {
            const faction = this.factions.get(factionId);
            factionResults.push({
                factionId,
                factionName: faction?.name || 'Unknown',
                factionEmblem: faction?.emblem || '⚔️',
                totalPoints: score.totalPoints,
                questionsCompleted: score.questionsCompleted,
                participantCount: score.participants.length,
                averageScore: score.participants.length > 0 ? 
                    score.totalPoints / score.participants.length : 0
            });
        }

        // Sort by total points (descending)
        factionResults.sort((a, b) => b.totalPoints - a.totalPoints);

        return {
            winner: factionResults[0],
            rankings: factionResults,
            gameStats: {
                totalQuestions: game.questions.length,
                totalParticipants: game.participants.length,
                gameDuration: game.duration
            }
        };
    }

    awardGameXP(game, results) {
        // Award XP based on performance
        const baseXP = 50;
        const winnerBonus = 100;
        const completionBonus = 25;

        game.participants.forEach(participant => {
            let xp = baseXP;
            
            // Completion bonus
            xp += participant.completedQuestions.length * completionBonus;
            
            // Winner bonus
            if (participant.factionId === results.winner.factionId) {
                xp += winnerBonus;
            }

            // TODO: Add XP to user account
            console.log(`Award ${xp} XP to ${participant.username}`);
        });
    }

    calculateTimeTaken(startTime) {
        return Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    }

    isPlayerInGame(userId) {
        // Check active games
        for (const game of this.activeGames.values()) {
            if (game.participants.find(p => p.userId === userId)) {
                return true;
            }
        }

        // Check queues
        for (const queue of this.playerQueues.values()) {
            if (queue.players.find(p => p.userId === userId)) {
                return true;
            }
        }

        return false;
    }

    notifyGameStart(game) {
        const gameRoom = `game_${game.id}`;
        
        // Create room and add all participants
        game.participants.forEach(participant => {
            // TODO: Get socket by userId and join room
            // socket.join(gameRoom);
        });

        // Send game start notification
        this.io.to(gameRoom).emit('game-started', {
            gameId: game.id,
            gameMode: game.gameMode,
            duration: game.duration,
            questions: game.questions.map(q => ({
                id: q.id,
                title: q.title,
                difficulty: q.difficulty,
                points: q.points,
                timeLimit: q.timeLimit
            })),
            participants: game.participants,
            factions: game.factions.map(factionId => {
                const faction = this.factions.get(factionId);
                return {
                    id: factionId,
                    name: faction?.name || 'Unknown',
                    emblem: faction?.emblem || '⚔️'
                };
            })
        });
    }

    // ═══ PUBLIC API METHODS ═══
    
    getActiveGames() {
        return Array.from(this.activeGames.values())
            .filter(game => game.status === 'active');
    }

    getGameById(gameId) {
        return this.activeGames.get(gameId);
    }

    getPlayerGame(userId) {
        for (const game of this.activeGames.values()) {
            if (game.participants.find(p => p.userId === userId)) {
                return game;
            }
        }
        return null;
    }

    leaveQueue(factionId, userId) {
        const queue = this.playerQueues.get(factionId);
        if (queue) {
            queue.players = queue.players.filter(p => p.userId !== userId);
            if (queue.players.length === 0) {
                this.playerQueues.delete(factionId);
            }
        }
    }
}

module.exports = CodeWarsArena;