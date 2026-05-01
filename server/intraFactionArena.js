// Intra-Faction Code Wars Arena - Custom Rooms System
const { v4: uuidv4 } = require('uuid');
const { compileAndRunJava } = require('./javaCompiler');
const { getRandomQuestions, getQuestionById, GAME_MODES, DIFFICULTY_LEVELS, getRandomQuestionsWithGitHub } = require('./codeWarQuestions');

class IntraFactionArena {
    constructor(io, factions) {
        this.io = io;
        this.factions = factions;
        this.activeRooms = new Map(); // roomId -> roomData
        this.playerRooms = new Map(); // userId -> roomId
    }

    // ═══ ROOM MANAGEMENT ═══
    
    createRoom(creatorId, creatorUsername, factionId, roomConfig) {
        const roomId = this.generateRoomId();
        
        const room = {
            id: roomId,
            name: roomConfig.name || `${creatorUsername}'s Battle`,
            password: roomConfig.password || null,
            factionId: factionId,
            creatorId: creatorId,
            creatorUsername: creatorUsername,
            
            // Game Configuration
            gameMode: roomConfig.gameMode || 'QUICK_BATTLE',
            teamSize: roomConfig.teamSize || 1, // 1v1, 2v2, 3v3, etc.
            maxTeams: roomConfig.maxTeams || 2, // Usually 2 teams
            questionCount: roomConfig.questionCount || 3,
            timeLimit: roomConfig.timeLimit || 600, // 10 minutes default
            difficulty: roomConfig.difficulty || 'mixed', // easy, medium, hard, mixed
            
            // Room State
            status: 'waiting', // waiting, starting, active, completed
            isPrivate: !!roomConfig.password, // Private if password is set
            
            // Teams and Players
            teams: [], // Array of team objects
            spectators: [],
            
            // Game Data
            questions: [],
            currentQuestionIndex: 0,
            startTime: null,
            endTime: null,
            submissions: new Map(), // playerId -> submissions array
            scores: new Map(), // teamId -> score
            finishedPlayers: new Set(), // Players who ended their contest early
            
            // Settings
            settings: {
                allowSpectators: roomConfig.allowSpectators !== false,
                autoStart: roomConfig.autoStart || false,
                showLeaderboard: roomConfig.showLeaderboard !== false
            },
            
            createdAt: new Date().toISOString()
        };

        // Initialize teams
        for (let i = 0; i < room.maxTeams; i++) {
            room.teams.push({
                id: `team_${i + 1}`,
                name: `Team ${i + 1}`,
                players: [],
                score: 0,
                questionsCompleted: 0
            });
        }

        // Add creator to first team
        this.addPlayerToTeam(room, creatorId, creatorUsername, 'team_1');
        
        this.activeRooms.set(roomId, room);
        this.playerRooms.set(creatorId, roomId);
        
        return room;
    }

    generateRoomId() {
        // Generate a 6-character room code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Ensure uniqueness
        if (this.activeRooms.has(result)) {
            return this.generateRoomId();
        }
        
        return result;
    }

    joinRoom(userId, username, factionId, roomId, password = null) {
        const room = this.activeRooms.get(roomId);
        
        if (!room) {
            throw new Error('Room not found');
        }
        
        if (room.factionId !== factionId) {
            throw new Error('This room is for a different faction');
        }
        
        if (room.status !== 'waiting') {
            throw new Error('Game is already in progress');
        }
        
        // Enhanced password validation for private rooms
        if (room.isPrivate) {
            if (!room.password) {
                throw new Error('Room configuration error: private room without password');
            }
            if (!password) {
                throw new Error('This is a private room. Password required to join.');
            }
            if (room.password !== password) {
                throw new Error('Incorrect password');
            }
        }
        
        // Check if player is already in the room
        const existingPlayer = this.findPlayerInRoom(room, userId);
        if (existingPlayer) {
            throw new Error('You are already in this room');
        }
        
        // Check if room is full
        const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);
        const maxPlayers = room.teamSize * room.maxTeams;
        
        if (totalPlayers >= maxPlayers) {
            // Try to join as spectator if allowed
            if (room.settings.allowSpectators) {
                room.spectators.push({
                    id: userId,
                    username: username,
                    joinedAt: new Date().toISOString()
                });
                this.playerRooms.set(userId, roomId);
                return { role: 'spectator', room };
            } else {
                throw new Error('Room is full');
            }
        }
        
        // Find a team with space
        const availableTeam = room.teams.find(team => team.players.length < room.teamSize);
        if (!availableTeam) {
            throw new Error('No available team slots');
        }
        
        this.addPlayerToTeam(room, userId, username, availableTeam.id);
        this.playerRooms.set(userId, roomId);
        
        return { role: 'player', room, teamId: availableTeam.id };
    }

    addPlayerToTeam(room, userId, username, teamId) {
        const team = room.teams.find(t => t.id === teamId);
        if (!team) {
            throw new Error('Team not found');
        }
        
        if (team.players.length >= room.teamSize) {
            throw new Error('Team is full');
        }
        
        team.players.push({
            id: userId,
            username: username,
            score: 0,
            questionsCompleted: 0,
            joinedAt: new Date().toISOString()
        });
        
        this.activeRooms.set(room.id, room);
    }

    leaveRoom(userId) {
        const roomId = this.playerRooms.get(userId);
        if (!roomId) return false;
        
        const room = this.activeRooms.get(roomId);
        if (!room) return false;
        
        // Remove from teams
        for (const team of room.teams) {
            const playerIndex = team.players.findIndex(p => p.id === userId);
            if (playerIndex !== -1) {
                team.players.splice(playerIndex, 1);
                break;
            }
        }
        
        // Remove from spectators
        const spectatorIndex = room.spectators.findIndex(s => s.id === userId);
        if (spectatorIndex !== -1) {
            room.spectators.splice(spectatorIndex, 1);
        }
        
        this.playerRooms.delete(userId);
        
        // If creator left and room is waiting, delete room
        if (room.creatorId === userId && room.status === 'waiting') {
            this.deleteRoom(roomId);
            return true;
        }
        
        // If no players left, delete room
        const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);
        if (totalPlayers === 0) {
            this.deleteRoom(roomId);
        }
        
        return true;
    }

    deleteRoom(roomId) {
        const room = this.activeRooms.get(roomId);
        if (!room) return;
        
        // Remove all players from playerRooms map
        for (const team of room.teams) {
            for (const player of team.players) {
                this.playerRooms.delete(player.id);
            }
        }
        
        for (const spectator of room.spectators) {
            this.playerRooms.delete(spectator.id);
        }
        
        this.activeRooms.delete(roomId);
    }

    // ═══ GAME FLOW ═══
    
    async startGame(roomId, starterId) {
        const room = this.activeRooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }
        
        if (room.creatorId !== starterId) {
            throw new Error('Only room creator can start the game');
        }
        
        if (room.status !== 'waiting') {
            throw new Error('Game is not in waiting state');
        }
        
        // Check if we have enough players
        const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);
        if (totalPlayers < 2) {
            throw new Error('Need at least 2 players to start');
        }
        
        // Generate questions
        await this.generateQuestionsForRoom(room);
        
        room.status = 'active';
        room.startTime = new Date().toISOString();
        room.endTime = new Date(Date.now() + room.timeLimit * 1000).toISOString();
        
        // Initialize scores
        for (const team of room.teams) {
            room.scores.set(team.id, 0);
        }
        
        this.activeRooms.set(roomId, room);
        
        // Notify all players
        this.notifyRoomUpdate(room, 'game-started');
        
        // Set end timer
        setTimeout(() => {
            this.endGame(roomId);
        }, room.timeLimit * 1000);
        
        return room;
    }

    async generateQuestionsForRoom(room) {
        const questions = [];
        
        // Enable LeetCode by default (3000+ problems!)
        const includeLeetCode = true;
        const includeGitHub = false; // Can enable if you have GitHub sources
        
        console.log(`[ARENA] Generating ${room.questionCount} questions (difficulty: ${room.difficulty})`);
        
        if (room.difficulty === 'mixed') {
            // Calculate difficulty distribution
            const difficulties = [];
            const count = room.questionCount;
            
            if (count <= 3) {
                difficulties.push(...Array(Math.ceil(count * 0.6)).fill(DIFFICULTY_LEVELS.EASY));
                difficulties.push(...Array(Math.floor(count * 0.4)).fill(DIFFICULTY_LEVELS.MEDIUM));
            } else if (count <= 5) {
                difficulties.push(...Array(Math.ceil(count * 0.4)).fill(DIFFICULTY_LEVELS.EASY));
                difficulties.push(...Array(Math.ceil(count * 0.4)).fill(DIFFICULTY_LEVELS.MEDIUM));
                difficulties.push(...Array(Math.floor(count * 0.2)).fill(DIFFICULTY_LEVELS.HARD));
            } else {
                difficulties.push(...Array(Math.ceil(count * 0.3)).fill(DIFFICULTY_LEVELS.EASY));
                difficulties.push(...Array(Math.ceil(count * 0.4)).fill(DIFFICULTY_LEVELS.MEDIUM));
                difficulties.push(...Array(Math.floor(count * 0.3)).fill(DIFFICULTY_LEVELS.HARD));
            }
            
            // Shuffle difficulties
            for (let i = difficulties.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [difficulties[i], difficulties[j]] = [difficulties[j], difficulties[i]];
            }
            
            // Fetch questions for each difficulty
            for (const difficulty of difficulties) {
                const randomQuestions = await getRandomQuestionsWithGitHub(
                    1, 
                    difficulty, 
                    includeGitHub,
                    includeLeetCode
                );
                if (randomQuestions.length > 0) {
                    questions.push(randomQuestions[0]);
                    console.log(`[ARENA] Added ${difficulty} question: ${randomQuestions[0].title}`);
                }
            }
        } else {
            // Single difficulty
            const randomQuestions = await getRandomQuestionsWithGitHub(
                room.questionCount, 
                room.difficulty,
                includeGitHub,
                includeLeetCode
            );
            questions.push(...randomQuestions);
            console.log(`[ARENA] Added ${randomQuestions.length} ${room.difficulty} questions`);
        }
        
        if (questions.length === 0) {
            console.warn('[ARENA] No questions found! Falling back to local questions.');
            // Fallback to local questions if LeetCode fails
            const fallbackQuestions = getRandomQuestions(room.questionCount, room.difficulty);
            questions.push(...fallbackQuestions);
        }
        
        console.log(`[ARENA] Final question set: ${questions.length} questions`);
        questions.forEach((q, i) => {
            console.log(`  ${i + 1}. ${q.title} (${q.difficulty}) - ${q.source || 'local'}`);
        });
        
        room.questions = questions;
    }

    async submitSolution(roomId, userId, questionId, code) {
        const room = this.activeRooms.get(roomId);
        if (!room || room.status !== 'active') {
            throw new Error('Game not active');
        }
        
        const player = this.findPlayerInRoom(room, userId);
        if (!player || player.role !== 'player') {
            throw new Error('Player not found in game');
        }
        
        const question = room.questions.find(q => q.id === questionId);
        if (!question) {
            throw new Error('Question not found');
        }
        
        // Check if player already completed this question
        const playerSubmissions = room.submissions.get(userId) || [];
        const alreadyCompleted = playerSubmissions.some(s => s.questionId === questionId && s.result.success);
        
        if (alreadyCompleted) {
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
                timeTaken: this.calculateTimeTaken(room.startTime)
            };
            
            // Store submission
            if (!room.submissions.has(userId)) {
                room.submissions.set(userId, []);
            }
            room.submissions.get(userId).push(submission);
            
            if (result.success) {
                // Update player score
                player.player.score += question.points;
                player.player.questionsCompleted++;
                
                // Update team score
                const currentTeamScore = room.scores.get(player.teamId) || 0;
                room.scores.set(player.teamId, currentTeamScore + question.points);
                
                // Update team questions completed
                const team = room.teams.find(t => t.id === player.teamId);
                if (team) {
                    team.questionsCompleted++;
                }
                
                // Notify room of successful submission
                this.notifyRoomUpdate(room, 'solution-accepted', {
                    userId,
                    username: player.player.username,
                    teamId: player.teamId,
                    questionId,
                    points: question.points,
                    timeTaken: submission.timeTaken
                });
                
                // Check if game should end (all questions completed by someone)
                if (player.player.questionsCompleted === room.questions.length) {
                    setTimeout(() => this.endGame(roomId), 1000);
                }
            }
            
            this.activeRooms.set(roomId, room);
            
            return {
                success: result.success,
                result: result,
                points: result.success ? question.points : 0,
                totalScore: player.player.score
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                points: 0,
                totalScore: player.player.score
            };
        }
    }

    endGame(roomId) {
        const room = this.activeRooms.get(roomId);
        if (!room || room.status !== 'active') return;
        
        room.status = 'completed';
        room.endTime = new Date().toISOString();
        
        // Calculate results
        const results = this.calculateRoomResults(room);
        
        // Notify all participants
        this.notifyRoomUpdate(room, 'game-ended', { results });
        
        // Clean up after 5 minutes
        setTimeout(() => {
            this.deleteRoom(roomId);
        }, 5 * 60 * 1000);
    }
    
    // ═══ PLAYER END CONTEST ═══
    
    endPlayerContest(roomId, userId) {
        const room = this.activeRooms.get(roomId);
        if (!room || room.status !== 'active') {
            throw new Error('Game is not active');
        }
        
        const player = this.findPlayerInRoom(room, userId);
        if (!player || player.role !== 'player') {
            throw new Error('Player not found in game');
        }
        
        // Mark player as finished
        if (!room.finishedPlayers) {
            room.finishedPlayers = new Set();
        }
        room.finishedPlayers.add(userId);
        
        console.log(`[ARENA] Player ${player.player.username} ended their contest early`);
        console.log(`[ARENA] Finished players: ${room.finishedPlayers.size}/${room.teams.reduce((sum, t) => sum + t.players.length, 0)}`);
        
        // Check if all players have finished
        const totalPlayers = room.teams.reduce((sum, team) => sum + team.players.length, 0);
        const allFinished = room.finishedPlayers.size >= totalPlayers;
        
        if (allFinished) {
            console.log(`[ARENA] All players finished - ending game`);
            this.endGame(roomId);
        } else {
            // Just notify that this player finished
            this.notifyRoomUpdate(room, 'player-finished', {
                userId,
                username: player.player.username,
                teamId: player.teamId,
                finishedCount: room.finishedPlayers.size,
                totalPlayers: totalPlayers
            });
        }
        
        this.activeRooms.set(roomId, room);
        
        return {
            finished: true,
            allFinished: allFinished,
            finishedCount: room.finishedPlayers.size,
            totalPlayers: totalPlayers
        };
    }
    
    isPlayerFinished(roomId, userId) {
        const room = this.activeRooms.get(roomId);
        if (!room || !room.finishedPlayers) return false;
        return room.finishedPlayers.has(userId);
    }

    // ═══ UTILITY METHODS ═══
    
    findPlayerInRoom(room, userId) {
        for (const team of room.teams) {
            const player = team.players.find(p => p.id === userId);
            if (player) {
                return { player, teamId: team.id, role: 'player' };
            }
        }
        
        const spectator = room.spectators.find(s => s.id === userId);
        if (spectator) {
            return { player: spectator, teamId: null, role: 'spectator' };
        }
        
        return null;
    }

    calculateRoomResults(room) {
        const teamResults = room.teams.map(team => ({
            teamId: team.id,
            teamName: team.name,
            totalScore: room.scores.get(team.id) || 0,
            questionsCompleted: team.questionsCompleted,
            players: team.players.map(p => ({
                username: p.username,
                score: p.score,
                questionsCompleted: p.questionsCompleted
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

    calculateTimeTaken(startTime) {
        return Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    }

    notifyRoomUpdate(room, event, data = {}) {
        const roomSocketId = `room_${room.id}`;
        this.io.to(roomSocketId).emit(event, {
            roomId: room.id,
            room: this.sanitizeRoomForClient(room),
            ...data
        });
    }

    sanitizeRoomForClient(room) {
        // Remove sensitive data and convert Maps to objects before sending to client
        const sanitized = { ...room };
        delete sanitized.password; // Don't send password to clients
        
        // Convert Map objects to plain objects for JSON serialization
        if (sanitized.scores instanceof Map) {
            sanitized.scores = Object.fromEntries(sanitized.scores);
        }
        if (sanitized.submissions instanceof Map) {
            sanitized.submissions = Object.fromEntries(sanitized.submissions);
        }
        
        // Convert Set to Array for finishedPlayers
        if (sanitized.finishedPlayers instanceof Set) {
            sanitized.finishedPlayers = Array.from(sanitized.finishedPlayers);
        }
        
        return sanitized;
    }

    // ═══ PUBLIC API METHODS ═══
    
    getRoomById(roomId) {
        return this.activeRooms.get(roomId);
    }

    getPlayerRoom(userId) {
        const roomId = this.playerRooms.get(userId);
        return roomId ? this.activeRooms.get(roomId) : null;
    }

    getRoomsByFaction(factionId) {
        return Array.from(this.activeRooms.values())
            .filter(room => room.factionId === factionId && room.status === 'waiting' && !room.isPrivate)
            .map(room => this.sanitizeRoomForClient(room));
    }

    getAllActiveRooms() {
        return Array.from(this.activeRooms.values())
            .filter(room => room.status === 'waiting' && !room.isPrivate)
            .map(room => this.sanitizeRoomForClient(room));
    }

    // Debug method to get all rooms including private ones (for admin/debugging)
    getAllRoomsForFaction(factionId, includePrivate = false) {
        const rooms = Array.from(this.activeRooms.values())
            .filter(room => room.factionId === factionId && room.status === 'waiting');
        
        if (!includePrivate) {
            return rooms.filter(room => !room.isPrivate).map(room => this.sanitizeRoomForClient(room));
        }
        
        return rooms.map(room => this.sanitizeRoomForClient(room));
    }

    switchTeam(userId, roomId, newTeamId) {
        const room = this.activeRooms.get(roomId);
        if (!room || room.status !== 'waiting') {
            throw new Error('Cannot switch teams during game');
        }
        
        const playerInfo = this.findPlayerInRoom(room, userId);
        if (!playerInfo || playerInfo.role !== 'player') {
            throw new Error('Player not found');
        }
        
        const newTeam = room.teams.find(t => t.id === newTeamId);
        if (!newTeam) {
            throw new Error('Team not found');
        }
        
        if (newTeam.players.length >= room.teamSize) {
            throw new Error('Team is full');
        }
        
        // Remove from current team
        const currentTeam = room.teams.find(t => t.id === playerInfo.teamId);
        const playerIndex = currentTeam.players.findIndex(p => p.id === userId);
        const player = currentTeam.players.splice(playerIndex, 1)[0];
        
        // Add to new team
        newTeam.players.push(player);
        
        this.activeRooms.set(roomId, room);
        return room;
    }
}

module.exports = IntraFactionArena;