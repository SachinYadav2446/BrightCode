// Intra-Faction Code Wars Arena - Custom Rooms System
const { v4: uuidv4 } = require('uuid');
const { compileAndRunJava } = require('./javaCompiler');
const { getRandomQuestions, getQuestionById, GAME_MODES, DIFFICULTY_LEVELS, getRandomQuestionsWithGitHub } = require('./codeWarQuestions');
const { getAITestCaseGenerator } = require('./aiTestCaseGenerator');

class IntraFactionArena {
    constructor(io, factions) {
        this.io = io;
        this.factions = factions;
        this.activeRooms = new Map(); // roomId -> roomData
        this.playerRooms = new Map(); // userId -> roomId
        this.questionHistory = new Map(); // factionId -> Set of recent question IDs
        this.maxHistorySize = 50; // Remember last 50 questions per faction
        
        // AI Test Case Generator
        this.aiTestCaseGenerator = getAITestCaseGenerator();
        
        // ═══ COLLABORATIVE EDITOR STATE ═══
        // Editor state: roomId -> teamId -> questionId -> EditorState
        // EditorState = { code: string, cursors: Map<userId, position>, lastEdit: userId, timestamp: number }
        this.teamEditorStates = new Map();
        
        // Active sessions: roomId -> teamId -> questionId -> Set<userId>
        // Tracks which users are currently editing which questions
        this.activeEditorSessions = new Map();
        
        // Cursor positions: roomId -> teamId -> questionId -> userId -> position
        // position = { line: number, ch: number }
        this.cursorPositions = new Map();
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
        const usedQuestionIds = new Set(); // Track IDs used in THIS contest
        
        // Get faction's question history
        if (!this.questionHistory.has(room.factionId)) {
            this.questionHistory.set(room.factionId, new Set());
        }
        const factionHistory = this.questionHistory.get(room.factionId);
        
        // Enable multiple sources
        const includeLeetCode = false; // Disabled due to test case parsing issues
        const includeGitHub = false;
        const includeCodeforces = false; // Disabled - test cases not available via API
        const includeExercism = false; // Disabled - test cases need scraping
        
        console.log(`[ARENA] Generating ${room.questionCount} questions (difficulty: ${room.difficulty})`);
        console.log(`[ARENA] Sources: Codeforces=${includeCodeforces}, Exercism=${includeExercism}, LeetCode=${includeLeetCode}`);
        console.log(`[ARENA] Faction history size: ${factionHistory.size} questions`);
        
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
                // Fetch more questions than needed to have options
                const fetchCount = Math.max(10, room.questionCount * 3);
                const randomQuestions = await getRandomQuestionsWithGitHub(
                    fetchCount, 
                    difficulty, 
                    includeGitHub,
                    includeLeetCode,
                    includeCodeforces,
                    includeExercism
                );
                
                // Filter out duplicates (within contest and from history)
                const availableQuestions = randomQuestions.filter(q => 
                    !usedQuestionIds.has(q.id) && !factionHistory.has(q.id)
                );
                
                if (availableQuestions.length > 0) {
                    // Pick a random question from available ones
                    const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
                    questions.push(selectedQuestion);
                    usedQuestionIds.add(selectedQuestion.id);
                    factionHistory.add(selectedQuestion.id);
                    console.log(`[ARENA] Added ${difficulty} question: ${selectedQuestion.title} (ID: ${selectedQuestion.id})`);
                } else {
                    console.warn(`[ARENA] No unique ${difficulty} questions available, trying again...`);
                    // If no unique questions, fetch more
                    const moreQuestions = await getRandomQuestionsWithGitHub(
                        fetchCount * 2, 
                        difficulty, 
                        includeGitHub,
                        includeLeetCode,
                        includeCodeforces,
                        includeExercism
                    );
                    const freshQuestions = moreQuestions.filter(q => !usedQuestionIds.has(q.id));
                    if (freshQuestions.length > 0) {
                        const selectedQuestion = freshQuestions[Math.floor(Math.random() * freshQuestions.length)];
                        questions.push(selectedQuestion);
                        usedQuestionIds.add(selectedQuestion.id);
                        factionHistory.add(selectedQuestion.id);
                        console.log(`[ARENA] Added ${difficulty} question (retry): ${selectedQuestion.title}`);
                    }
                }
            }
        } else {
            // Single difficulty
            const fetchCount = Math.max(20, room.questionCount * 5);
            const randomQuestions = await getRandomQuestionsWithGitHub(
                fetchCount, 
                room.difficulty,
                includeGitHub,
                includeLeetCode,
                includeCodeforces,
                includeExercism
            );
            
            // Filter out duplicates
            const availableQuestions = randomQuestions.filter(q => 
                !usedQuestionIds.has(q.id) && !factionHistory.has(q.id)
            );
            
            // Select required number of unique questions
            const selectedQuestions = availableQuestions.slice(0, room.questionCount);
            selectedQuestions.forEach(q => {
                questions.push(q);
                usedQuestionIds.add(q.id);
                factionHistory.add(q.id);
            });
            
            console.log(`[ARENA] Added ${selectedQuestions.length} unique ${room.difficulty} questions`);
        }
        
        // Trim history if it gets too large
        if (factionHistory.size > this.maxHistorySize) {
            const historyArray = Array.from(factionHistory);
            const toRemove = historyArray.slice(0, historyArray.length - this.maxHistorySize);
            toRemove.forEach(id => factionHistory.delete(id));
            console.log(`[ARENA] Trimmed faction history: removed ${toRemove.length} old questions`);
        }
        
        if (questions.length === 0) {
            console.warn('[ARENA] No questions found! Falling back to local questions.');
            // Fallback to local questions if LeetCode fails
            const fallbackQuestions = getRandomQuestions(room.questionCount, room.difficulty);
            questions.push(...fallbackQuestions);
        }
        
        console.log(`[ARENA] Final question set: ${questions.length} unique questions`);
        console.log(`[ARENA] Used question IDs: ${Array.from(usedQuestionIds).join(', ')}`);
        questions.forEach((q, i) => {
            console.log(`  ${i + 1}. ${q.title} (${q.difficulty}) - ${q.source || 'local'} [ID: ${q.id}]`);
            console.log(`     Test cases: ${q.testCases ? q.testCases.length : 0}`);
            if (q.testCases && q.testCases.length > 0) {
                console.log(`     First test case:`, JSON.stringify(q.testCases[0]));
            } else {
                console.warn(`     ⚠️ WARNING: Question has NO test cases!`);
            }
        });
        
        room.questions = questions;
        
        // ═══ AI TEST CASE GENERATION (Background) ═══
        // Start generating test cases in the background
        console.log(`[ARENA] 🤖 Starting AI test case generation for ${questions.length} questions...`);
        this.pregenerateTestCasesForRoom(room.id, questions);
    }
    
    /**
     * Pregenerate test cases for room questions (non-blocking)
     */
    async pregenerateTestCasesForRoom(roomId, questions) {
        try {
            const room = this.activeRooms.get(roomId);
            if (!room) return;
            
            console.log(`[ARENA] 🚀 Pregenerating test cases for room ${roomId}...`);
            
            // Generate test cases for all questions in parallel
            const promises = questions.map(async (question, index) => {
                try {
                    // Skip if question already has valid test cases
                    const hasValidTestCases = question.testCases && 
                        question.testCases.length > 0 && 
                        !question.testCases[0].expected.includes('visit problem page');
                    
                    if (hasValidTestCases) {
                        console.log(`[ARENA] ✅ Question ${index + 1} already has valid test cases`);
                        return question;
                    }
                    
                    console.log(`[ARENA] 🤖 Generating test cases for question ${index + 1}: ${question.title}`);
                    const testCases = await this.aiTestCaseGenerator.generateTestCases(question);
                    
                    // Update question with generated test cases
                    question.testCases = testCases;
                    
                    // Update room
                    const currentRoom = this.activeRooms.get(roomId);
                    if (currentRoom) {
                        currentRoom.questions[index] = question;
                        this.activeRooms.set(roomId, currentRoom);
                        console.log(`[ARENA] ✅ Updated question ${index + 1} with ${testCases.length} test cases`);
                    }
                    
                    return question;
                } catch (error) {
                    console.error(`[ARENA] ❌ Failed to generate test cases for question ${index + 1}:`, error.message);
                    return question; // Return original question with fallback test cases
                }
            });
            
            await Promise.all(promises);
            console.log(`[ARENA] ✅ Test case generation complete for room ${roomId}`);
            
        } catch (error) {
            console.error(`[ARENA] ❌ Error in pregenerateTestCasesForRoom:`, error.message);
        }
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
            // Get test cases (AI-generated or original)
            const testCases = await this.aiTestCaseGenerator.getTestCases(question);
            
            console.log(`[ARENA] Running solution with ${testCases.length} test cases`);
            
            // Compile and test the solution
            const result = await compileAndRunJava(code, testCases);
            
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
    
    // Clear question history for a faction (useful for testing or reset)
    clearQuestionHistory(factionId) {
        if (this.questionHistory.has(factionId)) {
            const size = this.questionHistory.get(factionId).size;
            this.questionHistory.delete(factionId);
            console.log(`[ARENA] Cleared question history for faction ${factionId}: ${size} questions removed`);
            return { success: true, cleared: size };
        }
        return { success: false, message: 'No history found' };
    }
    
    // Get question history stats for a faction
    getQuestionHistoryStats(factionId) {
        if (this.questionHistory.has(factionId)) {
            const history = this.questionHistory.get(factionId);
            return {
                factionId,
                historySize: history.size,
                maxSize: this.maxHistorySize,
                questionIds: Array.from(history)
            };
        }
        return {
            factionId,
            historySize: 0,
            maxSize: this.maxHistorySize,
            questionIds: []
        };
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

    // ═══ COLLABORATIVE EDITOR METHODS ═══

    /**
     * Join a team's editor session for a specific question
     * @param {string} roomId - The room ID
     * @param {string} teamId - The team ID
     * @param {string} questionId - The question ID
     * @param {string} userId - The user ID
     * @param {string} username - The username
     * @returns {Object} Current editor state { code, cursors, lastEdit, timestamp }
     * @throws {Error} If validation fails
     */
    joinTeamEditor(roomId, teamId, questionId, userId, username) {
        // Validate room exists
        const room = this.activeRooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        // Validate team exists
        const team = room.teams.find(t => t.id === teamId);
        if (!team) {
            throw new Error('Team not found');
        }

        // Validate user belongs to team (Requirement 3.1)
        const player = team.players.find(p => p.id === userId);
        if (!player) {
            throw new Error('User does not belong to this team');
        }

        // Validate question exists in room
        const question = room.questions.find(q => q.id === questionId);
        if (!question) {
            throw new Error('Question not found in room');
        }

        // Initialize nested maps if they don't exist
        if (!this.teamEditorStates.has(roomId)) {
            this.teamEditorStates.set(roomId, new Map());
        }
        const roomEditorStates = this.teamEditorStates.get(roomId);

        if (!roomEditorStates.has(teamId)) {
            roomEditorStates.set(teamId, new Map());
        }
        const teamEditorStates = roomEditorStates.get(teamId);

        // Initialize editor state if not exists (Requirement 5.4)
        if (!teamEditorStates.has(questionId)) {
            teamEditorStates.set(questionId, {
                code: question.starterCode || '',
                cursors: new Map(),
                lastEdit: null,
                timestamp: 0
            });
        }

        // Initialize active sessions tracking
        if (!this.activeEditorSessions.has(roomId)) {
            this.activeEditorSessions.set(roomId, new Map());
        }
        const roomSessions = this.activeEditorSessions.get(roomId);

        if (!roomSessions.has(teamId)) {
            roomSessions.set(teamId, new Map());
        }
        const teamSessions = roomSessions.get(teamId);

        if (!teamSessions.has(questionId)) {
            teamSessions.set(questionId, new Set());
        }
        const questionSessions = teamSessions.get(questionId);

        // Add user to active sessions
        questionSessions.add(userId);

        // Get current editor state
        const editorState = teamEditorStates.get(questionId);

        // Return current editor state (Requirement 5.4)
        return {
            code: editorState.code,
            cursors: Object.fromEntries(editorState.cursors),
            lastEdit: editorState.lastEdit,
            timestamp: editorState.timestamp
        };
    }

    /**
     * Leave a team's editor session for a specific question
     * @param {string} roomId - The room ID
     * @param {string} teamId - The team ID
     * @param {string} questionId - The question ID
     * @param {string} userId - The user ID
     * @returns {Object} Success status { success: boolean }
     * @throws {Error} If validation fails
     */
    leaveTeamEditor(roomId, teamId, questionId, userId) {
        // Validate room exists
        const room = this.activeRooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        // Validate team exists
        const team = room.teams.find(t => t.id === teamId);
        if (!team) {
            throw new Error('Team not found');
        }

        // Remove user from active sessions (Requirement 3.2)
        if (this.activeEditorSessions.has(roomId)) {
            const roomSessions = this.activeEditorSessions.get(roomId);
            if (roomSessions.has(teamId)) {
                const teamSessions = roomSessions.get(teamId);
                if (teamSessions.has(questionId)) {
                    const questionSessions = teamSessions.get(questionId);
                    questionSessions.delete(userId);

                    // Clean up empty maps
                    if (questionSessions.size === 0) {
                        teamSessions.delete(questionId);
                    }
                    if (teamSessions.size === 0) {
                        roomSessions.delete(teamId);
                    }
                    if (roomSessions.size === 0) {
                        this.activeEditorSessions.delete(roomId);
                    }
                }
            }
        }

        // Remove user's cursor position (Requirement 5.7)
        if (this.teamEditorStates.has(roomId)) {
            const roomEditorStates = this.teamEditorStates.get(roomId);
            if (roomEditorStates.has(teamId)) {
                const teamEditorStates = roomEditorStates.get(teamId);
                if (teamEditorStates.has(questionId)) {
                    const editorState = teamEditorStates.get(questionId);
                    if (editorState.cursors.has(userId)) {
                        editorState.cursors.delete(userId);
                    }
                }
            }
        }

        // Return success status
        return { success: true };
    }

    /**
     * Get the current editor state for a team's question
     * @param {string} roomId - The room ID
     * @param {string} teamId - The team ID
     * @param {string} questionId - The question ID
     * @returns {Object} Editor state { code, cursors, lastEdit, timestamp }
     * Returns empty state if not exists (Requirement 5.4)
     */
    getTeamEditorState(roomId, teamId, questionId) {
        // Check if editor state exists
        if (!this.teamEditorStates.has(roomId)) {
            return {
                code: '',
                cursors: {},
                lastEdit: null,
                timestamp: 0
            };
        }

        const roomEditorStates = this.teamEditorStates.get(roomId);
        if (!roomEditorStates.has(teamId)) {
            return {
                code: '',
                cursors: {},
                lastEdit: null,
                timestamp: 0
            };
        }

        const teamEditorStates = roomEditorStates.get(teamId);
        if (!teamEditorStates.has(questionId)) {
            return {
                code: '',
                cursors: {},
                lastEdit: null,
                timestamp: 0
            };
        }

        // Get the editor state
        const editorState = teamEditorStates.get(questionId);

        // Return editor state with cursors converted to plain object (Requirement 5.4)
        return {
            code: editorState.code,
            cursors: Object.fromEntries(editorState.cursors),
            lastEdit: editorState.lastEdit,
            timestamp: editorState.timestamp
        };
    }

    /**
     * Update team's code for a specific question with conflict resolution
     * @param {string} roomId - The room ID
     * @param {string} teamId - The team ID
     * @param {string} questionId - The question ID
     * @param {string} code - The new code content
     * @param {string} userId - The user ID making the update
     * @param {Object} cursorPosition - The cursor position { line: number, ch: number }
     * @param {number} timestamp - The timestamp of the update (for conflict resolution)
     * @returns {Object} Update result { success: boolean, conflict: boolean, timestamp: number }
     * @throws {Error} If validation fails
     */
    updateTeamCode(roomId, teamId, questionId, code, userId, cursorPosition, timestamp) {
        // Validate room exists
        const room = this.activeRooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        // Validate team exists
        const team = room.teams.find(t => t.id === teamId);
        if (!team) {
            throw new Error('Team not found');
        }

        // Validate user belongs to team (Requirement 4.3)
        const player = team.players.find(p => p.id === userId);
        if (!player) {
            throw new Error('User does not belong to this team');
        }

        // Validate question exists in room
        const question = room.questions.find(q => q.id === questionId);
        if (!question) {
            throw new Error('Question not found in room');
        }

        // Get or initialize editor state
        if (!this.teamEditorStates.has(roomId)) {
            this.teamEditorStates.set(roomId, new Map());
        }
        const roomEditorStates = this.teamEditorStates.get(roomId);

        if (!roomEditorStates.has(teamId)) {
            roomEditorStates.set(teamId, new Map());
        }
        const teamEditorStates = roomEditorStates.get(teamId);

        if (!teamEditorStates.has(questionId)) {
            // Initialize with timestamp 0 so first update always succeeds
            teamEditorStates.set(questionId, {
                code: question.starterCode || '',
                cursors: new Map(),
                lastEdit: null,
                timestamp: 0
            });
        }

        const editorState = teamEditorStates.get(questionId);

        // Conflict resolution: Last-Write-Wins based on timestamp (Requirement 6.1, 6.2)
        if (timestamp < editorState.timestamp) {
            // Incoming update is older than current state - reject it (Requirement 6.3)
            return {
                success: false,
                conflict: true,
                timestamp: editorState.timestamp,
                message: 'Update rejected: older timestamp'
            };
        }

        // Update is newer or equal - apply it (Requirement 6.4)
        editorState.code = code;
        editorState.lastEdit = userId;
        editorState.timestamp = timestamp;

        // Store cursor position (Requirement 1.2)
        if (cursorPosition) {
            editorState.cursors.set(userId, {
                line: cursorPosition.line,
                ch: cursorPosition.ch,
                username: player.username
            });
        }

        // Return success status
        return {
            success: true,
            conflict: false,
            timestamp: editorState.timestamp
        };
    }

    /**
     * Update cursor position for a user in a team's editor session
     * @param {string} roomId - The room ID
     * @param {string} teamId - The team ID
     * @param {string} questionId - The question ID
     * @param {string} userId - The user ID
     * @param {Object} position - The cursor position { line: number, ch: number }
     * @returns {Object} Update result { success: boolean }
     * @throws {Error} If validation fails
     */
    updateCursorPosition(roomId, teamId, questionId, userId, position) {
        // Validate room exists
        const room = this.activeRooms.get(roomId);
        if (!room) {
            throw new Error('Room not found');
        }

        // Validate team exists
        const team = room.teams.find(t => t.id === teamId);
        if (!team) {
            throw new Error('Team not found');
        }

        // Validate user belongs to team (Requirement 2.1)
        const player = team.players.find(p => p.id === userId);
        if (!player) {
            throw new Error('User does not belong to this team');
        }

        // Validate question exists in room
        const question = room.questions.find(q => q.id === questionId);
        if (!question) {
            throw new Error('Question not found in room');
        }

        // Validate position has required fields
        if (!position || typeof position.line !== 'number' || typeof position.ch !== 'number') {
            throw new Error('Invalid cursor position: must have line and ch properties');
        }

        // Get or initialize editor state
        if (!this.teamEditorStates.has(roomId)) {
            this.teamEditorStates.set(roomId, new Map());
        }
        const roomEditorStates = this.teamEditorStates.get(roomId);

        if (!roomEditorStates.has(teamId)) {
            roomEditorStates.set(teamId, new Map());
        }
        const teamEditorStates = roomEditorStates.get(teamId);

        if (!teamEditorStates.has(questionId)) {
            // Initialize editor state if not exists
            teamEditorStates.set(questionId, {
                code: question.starterCode || '',
                cursors: new Map(),
                lastEdit: null,
                timestamp: 0
            });
        }

        const editorState = teamEditorStates.get(questionId);

        // Store cursor position in editor state (Requirement 2.1)
        // No persistence needed - ephemeral data stored in memory
        editorState.cursors.set(userId, {
            line: position.line,
            ch: position.ch,
            username: player.username
        });

        // Return success status
        return { success: true };
    }

    /**
     * Broadcast an event to all team members in a specific question's editor session
     * @param {string} roomId - The room ID
     * @param {string} teamId - The team ID
     * @param {string} questionId - The question ID
     * @param {string} event - The event name to emit
     * @param {Object} data - The data to send with the event
     * @param {string} excludeUserId - Optional user ID to exclude from broadcast
     * @returns {void}
     * 
     * Requirement 4.2: Team Isolation
     * - Constructs team-specific room name to ensure broadcasts only reach team members
     * - Uses Socket.io room namespaces for isolation
     * - Optionally excludes the sender to prevent echo
     */
    broadcastToTeam(roomId, teamId, questionId, event, data, excludeUserId = null) {
        // Construct team-specific room name (Requirement 4.2)
        const teamRoomName = `cw-${roomId}-team-${teamId}-q-${questionId}`;

        // Emit event to team room, excluding specified user if provided
        if (excludeUserId) {
            // Broadcast to all in room except the excluded user
            this.io.to(teamRoomName).except(excludeUserId).emit(event, data);
        } else {
            // Broadcast to all in room
            this.io.to(teamRoomName).emit(event, data);
        }
    }
}

module.exports = IntraFactionArena;