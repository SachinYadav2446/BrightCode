/**
 * Unit Tests: IntraFactionArena Collaborative Editor State Management
 * 
 * Tests the three new Map properties added for collaborative editing:
 * - teamEditorStates: roomId -> teamId -> questionId -> EditorState
 * - activeEditorSessions: roomId -> teamId -> questionId -> Set<userId>
 * - cursorPositions: roomId -> teamId -> questionId -> userId -> position
 * 
 * Requirements: 5.1, 5.2, 5.3
 */

const IntraFactionArena = require('../intraFactionArena');

// Mock Socket.io
const mockIo = {
    to: () => ({
        emit: () => {}
    })
};

const mockFactions = new Map([
    ['faction1', { id: 'faction1', name: 'Test Faction' }]
]);

// ── Test Suite ──────────────────────────────────────────────────────────────

console.log('\n=== IntraFactionArena Collaborative Editor Tests ===\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ ${message}`);
        testsPassed++;
    } else {
        console.error(`  ✗ ${message}`);
        testsFailed++;
        process.exitCode = 1;
    }
}

// ── Test 1: Constructor initializes collaborative editor properties ─────────
console.log('[Test 1] Constructor initializes collaborative editor properties');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    assert(arena.teamEditorStates instanceof Map, 
        'teamEditorStates is initialized as a Map');
    assert(arena.teamEditorStates.size === 0, 
        'teamEditorStates starts empty');
    
    assert(arena.activeEditorSessions instanceof Map, 
        'activeEditorSessions is initialized as a Map');
    assert(arena.activeEditorSessions.size === 0, 
        'activeEditorSessions starts empty');
    
    assert(arena.cursorPositions instanceof Map, 
        'cursorPositions is initialized as a Map');
    assert(arena.cursorPositions.size === 0, 
        'cursorPositions starts empty');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 2: Properties maintain correct nested Map structure ────────────────
console.log('[Test 2] Properties maintain correct nested Map structure');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Simulate adding editor state
    const roomId = 'ROOM123';
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Initialize nested structure for teamEditorStates
    if (!arena.teamEditorStates.has(roomId)) {
        arena.teamEditorStates.set(roomId, new Map());
    }
    const roomStates = arena.teamEditorStates.get(roomId);
    
    if (!roomStates.has(teamId)) {
        roomStates.set(teamId, new Map());
    }
    const teamStates = roomStates.get(teamId);
    
    teamStates.set(questionId, {
        code: 'function test() {}',
        cursors: new Map(),
        lastEdit: 'user1',
        timestamp: Date.now()
    });
    
    // Verify structure
    assert(arena.teamEditorStates.has(roomId), 
        'teamEditorStates contains roomId');
    assert(arena.teamEditorStates.get(roomId).has(teamId), 
        'Room contains teamId');
    assert(arena.teamEditorStates.get(roomId).get(teamId).has(questionId), 
        'Team contains questionId');
    
    const editorState = arena.teamEditorStates.get(roomId).get(teamId).get(questionId);
    assert(editorState.code === 'function test() {}', 
        'Editor state stores code correctly');
    assert(editorState.lastEdit === 'user1', 
        'Editor state stores lastEdit correctly');
    assert(typeof editorState.timestamp === 'number', 
        'Editor state stores timestamp as number');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 3: activeEditorSessions tracks users correctly ─────────────────────
console.log('[Test 3] activeEditorSessions tracks users correctly');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    const roomId = 'ROOM456';
    const teamId = 'team_1';
    const questionId = 'question-1';
    const userId1 = 'user1';
    const userId2 = 'user2';
    
    // Initialize nested structure for activeEditorSessions
    if (!arena.activeEditorSessions.has(roomId)) {
        arena.activeEditorSessions.set(roomId, new Map());
    }
    const roomSessions = arena.activeEditorSessions.get(roomId);
    
    if (!roomSessions.has(teamId)) {
        roomSessions.set(teamId, new Map());
    }
    const teamSessions = roomSessions.get(teamId);
    
    if (!teamSessions.has(questionId)) {
        teamSessions.set(questionId, new Set());
    }
    const questionSessions = teamSessions.get(questionId);
    
    // Add users
    questionSessions.add(userId1);
    questionSessions.add(userId2);
    
    // Verify
    assert(questionSessions.has(userId1), 
        'Session contains user1');
    assert(questionSessions.has(userId2), 
        'Session contains user2');
    assert(questionSessions.size === 2, 
        'Session has correct number of users');
    
    // Remove user
    questionSessions.delete(userId1);
    assert(!questionSessions.has(userId1), 
        'User1 removed from session');
    assert(questionSessions.size === 1, 
        'Session size updated after removal');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 4: cursorPositions stores positions correctly ──────────────────────
console.log('[Test 4] cursorPositions stores positions correctly');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    const roomId = 'ROOM789';
    const teamId = 'team_1';
    const questionId = 'question-1';
    const userId = 'user1';
    const position = { line: 5, ch: 10 };
    
    // Initialize nested structure for cursorPositions
    if (!arena.cursorPositions.has(roomId)) {
        arena.cursorPositions.set(roomId, new Map());
    }
    const roomCursors = arena.cursorPositions.get(roomId);
    
    if (!roomCursors.has(teamId)) {
        roomCursors.set(teamId, new Map());
    }
    const teamCursors = roomCursors.get(teamId);
    
    if (!teamCursors.has(questionId)) {
        teamCursors.set(questionId, new Map());
    }
    const questionCursors = teamCursors.get(questionId);
    
    // Store cursor position
    questionCursors.set(userId, position);
    
    // Verify
    assert(questionCursors.has(userId), 
        'Cursor position stored for user');
    
    const storedPosition = questionCursors.get(userId);
    assert(storedPosition.line === 5, 
        'Cursor line position correct');
    assert(storedPosition.ch === 10, 
        'Cursor character position correct');
    
    // Update position
    const newPosition = { line: 8, ch: 15 };
    questionCursors.set(userId, newPosition);
    
    const updatedPosition = questionCursors.get(userId);
    assert(updatedPosition.line === 8, 
        'Cursor position updated correctly (line)');
    assert(updatedPosition.ch === 15, 
        'Cursor position updated correctly (ch)');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 5: Team isolation - separate teams have separate states ────────────
console.log('[Test 5] Team isolation - separate teams have separate states');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    const roomId = 'ROOM999';
    const team1Id = 'team_1';
    const team2Id = 'team_2';
    const questionId = 'question-1';
    
    // Initialize for team 1
    if (!arena.teamEditorStates.has(roomId)) {
        arena.teamEditorStates.set(roomId, new Map());
    }
    const roomStates = arena.teamEditorStates.get(roomId);
    
    roomStates.set(team1Id, new Map());
    roomStates.set(team2Id, new Map());
    
    const team1States = roomStates.get(team1Id);
    const team2States = roomStates.get(team2Id);
    
    // Add different code for each team
    team1States.set(questionId, {
        code: 'team 1 code',
        cursors: new Map(),
        lastEdit: 'user1',
        timestamp: Date.now()
    });
    
    team2States.set(questionId, {
        code: 'team 2 code',
        cursors: new Map(),
        lastEdit: 'user2',
        timestamp: Date.now()
    });
    
    // Verify isolation
    const team1Code = team1States.get(questionId).code;
    const team2Code = team2States.get(questionId).code;
    
    assert(team1Code === 'team 1 code', 
        'Team 1 has correct code');
    assert(team2Code === 'team 2 code', 
        'Team 2 has correct code');
    assert(team1Code !== team2Code, 
        'Teams have different code (isolated)');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 6: Multiple questions per team maintain separate states ────────────
console.log('[Test 6] Multiple questions per team maintain separate states');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    const roomId = 'ROOM111';
    const teamId = 'team_1';
    const question1Id = 'question-1';
    const question2Id = 'question-2';
    
    // Initialize
    if (!arena.teamEditorStates.has(roomId)) {
        arena.teamEditorStates.set(roomId, new Map());
    }
    const roomStates = arena.teamEditorStates.get(roomId);
    roomStates.set(teamId, new Map());
    const teamStates = roomStates.get(teamId);
    
    // Add states for different questions
    teamStates.set(question1Id, {
        code: 'solution for question 1',
        cursors: new Map(),
        lastEdit: 'user1',
        timestamp: Date.now()
    });
    
    teamStates.set(question2Id, {
        code: 'solution for question 2',
        cursors: new Map(),
        lastEdit: 'user1',
        timestamp: Date.now() + 1000
    });
    
    // Verify
    assert(teamStates.has(question1Id), 
        'Team has state for question 1');
    assert(teamStates.has(question2Id), 
        'Team has state for question 2');
    
    const q1Code = teamStates.get(question1Id).code;
    const q2Code = teamStates.get(question2Id).code;
    
    assert(q1Code === 'solution for question 1', 
        'Question 1 has correct code');
    assert(q2Code === 'solution for question 2', 
        'Question 2 has correct code');
    assert(q1Code !== q2Code, 
        'Different questions have different code');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 7: Properties are independent of existing room management ──────────
console.log('[Test 7] Properties are independent of existing room management');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room using existing method
    const room = arena.createRoom('user1', 'TestUser', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Verify room was created
    assert(arena.activeRooms.has(room.id), 
        'Room created successfully');
    
    // Verify collaborative editor properties are still empty
    assert(arena.teamEditorStates.size === 0, 
        'teamEditorStates remains empty after room creation');
    assert(arena.activeEditorSessions.size === 0, 
        'activeEditorSessions remains empty after room creation');
    assert(arena.cursorPositions.size === 0, 
        'cursorPositions remains empty after room creation');
    
    // Add editor state for this room
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    arena.teamEditorStates.set(roomId, new Map());
    arena.teamEditorStates.get(roomId).set(teamId, new Map());
    arena.teamEditorStates.get(roomId).get(teamId).set(questionId, {
        code: 'test code',
        cursors: new Map(),
        lastEdit: 'user1',
        timestamp: Date.now()
    });
    
    // Verify editor state added without affecting room
    assert(arena.teamEditorStates.has(roomId), 
        'Editor state added for room');
    assert(arena.activeRooms.has(roomId), 
        'Room still exists in activeRooms');
    
    const roomData = arena.activeRooms.get(roomId);
    assert(roomData.status === 'waiting', 
        'Room status unchanged');
    assert(roomData.teams.length === 2, 
        'Room teams unchanged');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 8: joinTeamEditor validates user belongs to team ───────────────────
console.log('[Test 8] joinTeamEditor validates user belongs to team');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room with questions
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Add a question to the room
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {\n  // Your code here\n}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Test: User belongs to team (should succeed)
    try {
        const editorState = arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
        assert(editorState !== null, 
            'joinTeamEditor returns editor state for valid user');
        assert(typeof editorState.code === 'string', 
            'Editor state contains code');
        assert(typeof editorState.cursors === 'object', 
            'Editor state contains cursors');
        assert(typeof editorState.timestamp === 'number', 
            'Editor state contains timestamp');
    } catch (error) {
        assert(false, `joinTeamEditor should succeed for valid user: ${error.message}`);
    }
    
    // Test: User does not belong to team (should fail)
    try {
        arena.joinTeamEditor(roomId, teamId, questionId, 'user999', 'Stranger');
        assert(false, 
            'joinTeamEditor should throw error for user not in team');
    } catch (error) {
        assert(error.message === 'User does not belong to this team', 
            'Correct error message for unauthorized user');
    }
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 9: joinTeamEditor initializes editor state if not exists ───────────
console.log('[Test 9] joinTeamEditor initializes editor state if not exists');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Add a question with starter code
    const starterCode = 'function solution() {\n  // Your code here\n}';
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: starterCode
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Verify editor state doesn't exist yet
    assert(!arena.teamEditorStates.has(roomId), 
        'Editor state not initialized before joinTeamEditor');
    
    // Join editor
    const editorState = arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
    
    // Verify editor state was initialized
    assert(arena.teamEditorStates.has(roomId), 
        'Editor state initialized for room');
    assert(arena.teamEditorStates.get(roomId).has(teamId), 
        'Editor state initialized for team');
    assert(arena.teamEditorStates.get(roomId).get(teamId).has(questionId), 
        'Editor state initialized for question');
    
    // Verify initial state
    assert(editorState.code === starterCode, 
        'Editor initialized with starter code');
    assert(Object.keys(editorState.cursors).length === 0, 
        'Editor initialized with empty cursors');
    assert(editorState.lastEdit === null, 
        'Editor initialized with null lastEdit');
    assert(typeof editorState.timestamp === 'number', 
        'Editor initialized with timestamp');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 10: joinTeamEditor adds user to activeEditorSessions ───────────────
console.log('[Test 10] joinTeamEditor adds user to activeEditorSessions');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 3,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Add a question
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    // Add more users to team
    const team = room.teams.find(t => t.id === 'team_1');
    team.players.push({
        id: 'user2',
        username: 'Bob',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    team.players.push({
        id: 'user3',
        username: 'Charlie',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Join editor with multiple users
    arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
    arena.joinTeamEditor(roomId, teamId, questionId, 'user2', 'Bob');
    arena.joinTeamEditor(roomId, teamId, questionId, 'user3', 'Charlie');
    
    // Verify all users added to active sessions
    const sessions = arena.activeEditorSessions
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(sessions.has('user1'), 
        'User1 added to active sessions');
    assert(sessions.has('user2'), 
        'User2 added to active sessions');
    assert(sessions.has('user3'), 
        'User3 added to active sessions');
    assert(sessions.size === 3, 
        'All 3 users in active sessions');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 11: joinTeamEditor returns current editor state ────────────────────
console.log('[Test 11] joinTeamEditor returns current editor state');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Add a question
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    // Add second user to team
    const team = room.teams.find(t => t.id === 'team_1');
    team.players.push({
        id: 'user2',
        username: 'Bob',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // First user joins and gets initial state
    const state1 = arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
    assert(state1.code === 'function solution() {}', 
        'First user gets starter code');
    
    // Manually update the editor state (simulating code change)
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    editorState.code = 'function solution() {\n  return 42;\n}';
    editorState.lastEdit = 'user1';
    editorState.timestamp = Date.now();
    editorState.cursors.set('user1', { line: 2, ch: 10 });
    
    // Second user joins and should get updated state
    const state2 = arena.joinTeamEditor(roomId, teamId, questionId, 'user2', 'Bob');
    assert(state2.code === 'function solution() {\n  return 42;\n}', 
        'Second user gets current code');
    assert(state2.lastEdit === 'user1', 
        'Second user gets lastEdit info');
    assert(state2.cursors['user1'] !== undefined, 
        'Second user gets cursor positions');
    assert(state2.cursors['user1'].line === 2, 
        'Cursor position correct (line)');
    assert(state2.cursors['user1'].ch === 10, 
        'Cursor position correct (ch)');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 12: joinTeamEditor validates room, team, and question exist ────────
console.log('[Test 12] joinTeamEditor validates room, team, and question exist');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Test: Invalid room ID
    try {
        arena.joinTeamEditor('INVALID_ROOM', teamId, questionId, 'user1', 'Alice');
        assert(false, 
            'Should throw error for invalid room');
    } catch (error) {
        assert(error.message === 'Room not found', 
            'Correct error for invalid room');
    }
    
    // Test: Invalid team ID
    try {
        arena.joinTeamEditor(roomId, 'team_999', questionId, 'user1', 'Alice');
        assert(false, 
            'Should throw error for invalid team');
    } catch (error) {
        assert(error.message === 'Team not found', 
            'Correct error for invalid team');
    }
    
    // Test: Invalid question ID
    try {
        arena.joinTeamEditor(roomId, teamId, 'question-999', 'user1', 'Alice');
        assert(false, 
            'Should throw error for invalid question');
    } catch (error) {
        assert(error.message === 'Question not found in room', 
            'Correct error for invalid question');
    }
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 13: leaveTeamEditor removes user from activeEditorSessions ─────────
console.log('[Test 13] leaveTeamEditor removes user from activeEditorSessions');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Add a question
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    // Add second user to team
    const team = room.teams.find(t => t.id === 'team_1');
    team.players.push({
        id: 'user2',
        username: 'Bob',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Join editor with both users
    arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
    arena.joinTeamEditor(roomId, teamId, questionId, 'user2', 'Bob');
    
    // Verify both users are in active sessions
    let sessions = arena.activeEditorSessions
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(sessions.has('user1'), 
        'User1 in active sessions before leave');
    assert(sessions.has('user2'), 
        'User2 in active sessions before leave');
    assert(sessions.size === 2, 
        'Both users in active sessions');
    
    // User1 leaves
    const result = arena.leaveTeamEditor(roomId, teamId, questionId, 'user1');
    
    assert(result.success === true, 
        'leaveTeamEditor returns success');
    
    // Verify user1 removed from active sessions
    sessions = arena.activeEditorSessions
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(!sessions.has('user1'), 
        'User1 removed from active sessions');
    assert(sessions.has('user2'), 
        'User2 still in active sessions');
    assert(sessions.size === 1, 
        'Session size updated after leave');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 14: leaveTeamEditor removes user's cursor position ─────────────────
console.log('[Test 14] leaveTeamEditor removes user\'s cursor position');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Add a question
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    // Add second user to team
    const team = room.teams.find(t => t.id === 'team_1');
    team.players.push({
        id: 'user2',
        username: 'Bob',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Join editor with both users
    arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
    arena.joinTeamEditor(roomId, teamId, questionId, 'user2', 'Bob');
    
    // Add cursor positions
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    editorState.cursors.set('user1', { line: 5, ch: 10 });
    editorState.cursors.set('user2', { line: 8, ch: 15 });
    
    // Verify both cursors exist
    assert(editorState.cursors.has('user1'), 
        'User1 cursor exists before leave');
    assert(editorState.cursors.has('user2'), 
        'User2 cursor exists before leave');
    assert(editorState.cursors.size === 2, 
        'Both cursors present');
    
    // User1 leaves
    arena.leaveTeamEditor(roomId, teamId, questionId, 'user1');
    
    // Verify user1's cursor removed
    assert(!editorState.cursors.has('user1'), 
        'User1 cursor removed after leave');
    assert(editorState.cursors.has('user2'), 
        'User2 cursor still present');
    assert(editorState.cursors.size === 1, 
        'Cursor count updated after leave');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 15: leaveTeamEditor cleans up empty maps ───────────────────────────
console.log('[Test 15] leaveTeamEditor cleans up empty maps');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 1,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Add a question
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Join editor with single user
    arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
    
    // Verify maps exist
    assert(arena.activeEditorSessions.has(roomId), 
        'Room sessions exist before leave');
    assert(arena.activeEditorSessions.get(roomId).has(teamId), 
        'Team sessions exist before leave');
    assert(arena.activeEditorSessions.get(roomId).get(teamId).has(questionId), 
        'Question sessions exist before leave');
    
    // User leaves (last user in session)
    arena.leaveTeamEditor(roomId, teamId, questionId, 'user1');
    
    // Verify empty maps are cleaned up
    assert(!arena.activeEditorSessions.has(roomId), 
        'Empty room sessions map cleaned up');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 16: leaveTeamEditor validates room and team exist ──────────────────
console.log('[Test 16] leaveTeamEditor validates room and team exist');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Test: Invalid room ID
    try {
        arena.leaveTeamEditor('INVALID_ROOM', teamId, questionId, 'user1');
        assert(false, 
            'Should throw error for invalid room');
    } catch (error) {
        assert(error.message === 'Room not found', 
            'Correct error for invalid room');
    }
    
    // Test: Invalid team ID
    try {
        arena.leaveTeamEditor(roomId, 'team_999', questionId, 'user1');
        assert(false, 
            'Should throw error for invalid team');
    } catch (error) {
        assert(error.message === 'Team not found', 
            'Correct error for invalid team');
    }
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 17: leaveTeamEditor handles non-existent user gracefully ───────────
console.log('[Test 17] leaveTeamEditor handles non-existent user gracefully');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Add a question
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Join editor with user1
    arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
    
    // Try to remove user that never joined
    const result = arena.leaveTeamEditor(roomId, teamId, questionId, 'user999');
    
    assert(result.success === true, 
        'leaveTeamEditor returns success even for non-existent user');
    
    // Verify user1 still in session
    const sessions = arena.activeEditorSessions
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(sessions.has('user1'), 
        'User1 still in active sessions');
    assert(sessions.size === 1, 
        'Session size unchanged');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 18: updateTeamCode validates room, team, and question exist ────────
console.log('[Test 18] updateTeamCode validates room, team, and question exist');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    const code = 'function solution() { return 42; }';
    const cursorPosition = { line: 1, ch: 10 };
    const timestamp = Date.now();
    
    // Test: Invalid room ID
    try {
        arena.updateTeamCode('INVALID_ROOM', teamId, questionId, code, 'user1', cursorPosition, timestamp);
        assert(false, 
            'Should throw error for invalid room');
    } catch (error) {
        assert(error.message === 'Room not found', 
            'Correct error for invalid room');
    }
    
    // Test: Invalid team ID
    try {
        arena.updateTeamCode(roomId, 'team_999', questionId, code, 'user1', cursorPosition, timestamp);
        assert(false, 
            'Should throw error for invalid team');
    } catch (error) {
        assert(error.message === 'Team not found', 
            'Correct error for invalid team');
    }
    
    // Test: Invalid question ID
    try {
        arena.updateTeamCode(roomId, teamId, 'question-999', code, 'user1', cursorPosition, timestamp);
        assert(false, 
            'Should throw error for invalid question');
    } catch (error) {
        assert(error.message === 'Question not found in room', 
            'Correct error for invalid question');
    }
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 19: updateTeamCode validates user belongs to team ──────────────────
console.log('[Test 19] updateTeamCode validates user belongs to team');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    const code = 'function solution() { return 42; }';
    const cursorPosition = { line: 1, ch: 10 };
    const timestamp = Date.now();
    
    // Test: User belongs to team (should succeed)
    try {
        const result = arena.updateTeamCode(roomId, teamId, questionId, code, 'user1', cursorPosition, timestamp);
        assert(result.success === true, 
            'updateTeamCode succeeds for valid user');
        assert(result.conflict === false, 
            'No conflict for first update');
    } catch (error) {
        assert(false, `updateTeamCode should succeed for valid user: ${error.message}`);
    }
    
    // Test: User does not belong to team (should fail)
    try {
        arena.updateTeamCode(roomId, teamId, questionId, code, 'user999', cursorPosition, timestamp);
        assert(false, 
            'updateTeamCode should throw error for user not in team');
    } catch (error) {
        assert(error.message === 'User does not belong to this team', 
            'Correct error message for unauthorized user');
    }
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 20: updateTeamCode applies Last-Write-Wins with newer timestamp ────
console.log('[Test 20] updateTeamCode applies Last-Write-Wins with newer timestamp');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    // Add second user to team
    const team = room.teams.find(t => t.id === 'team_1');
    team.players.push({
        id: 'user2',
        username: 'Bob',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // First update at timestamp 1000
    const code1 = 'function solution() { return 1; }';
    const timestamp1 = 1000;
    const result1 = arena.updateTeamCode(roomId, teamId, questionId, code1, 'user1', { line: 1, ch: 5 }, timestamp1);
    
    assert(result1.success === true, 
        'First update succeeds');
    assert(result1.conflict === false, 
        'First update has no conflict');
    assert(result1.timestamp === timestamp1, 
        'First update timestamp stored');
    
    // Verify code was updated
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.code === code1, 
        'Code updated to first version');
    assert(editorState.lastEdit === 'user1', 
        'lastEdit set to user1');
    assert(editorState.timestamp === timestamp1, 
        'Timestamp updated to 1000');
    
    // Second update with newer timestamp 2000
    const code2 = 'function solution() { return 2; }';
    const timestamp2 = 2000;
    const result2 = arena.updateTeamCode(roomId, teamId, questionId, code2, 'user2', { line: 1, ch: 10 }, timestamp2);
    
    assert(result2.success === true, 
        'Second update with newer timestamp succeeds');
    assert(result2.conflict === false, 
        'Second update has no conflict');
    assert(result2.timestamp === timestamp2, 
        'Second update timestamp stored');
    
    // Verify code was updated to newer version
    assert(editorState.code === code2, 
        'Code updated to second version (newer timestamp wins)');
    assert(editorState.lastEdit === 'user2', 
        'lastEdit updated to user2');
    assert(editorState.timestamp === timestamp2, 
        'Timestamp updated to 2000');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 21: updateTeamCode rejects updates with older timestamp ────────────
console.log('[Test 21] updateTeamCode rejects updates with older timestamp');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    // Add second user to team
    const team = room.teams.find(t => t.id === 'team_1');
    team.players.push({
        id: 'user2',
        username: 'Bob',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // First update at timestamp 2000 (newer)
    const code1 = 'function solution() { return 2; }';
    const timestamp1 = 2000;
    const result1 = arena.updateTeamCode(roomId, teamId, questionId, code1, 'user1', { line: 1, ch: 5 }, timestamp1);
    
    assert(result1.success === true, 
        'First update succeeds');
    
    // Get editor state
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.code === code1, 
        'Code set to first version');
    assert(editorState.timestamp === timestamp1, 
        'Timestamp set to 2000');
    
    // Second update with older timestamp 1000 (should be rejected)
    const code2 = 'function solution() { return 1; }';
    const timestamp2 = 1000;
    const result2 = arena.updateTeamCode(roomId, teamId, questionId, code2, 'user2', { line: 1, ch: 10 }, timestamp2);
    
    assert(result2.success === false, 
        'Update with older timestamp rejected');
    assert(result2.conflict === true, 
        'Conflict flag set to true');
    assert(result2.timestamp === timestamp1, 
        'Returns current (newer) timestamp');
    assert(result2.message === 'Update rejected: older timestamp', 
        'Correct rejection message');
    
    // Verify code was NOT updated (still has newer version)
    assert(editorState.code === code1, 
        'Code unchanged (older update rejected)');
    assert(editorState.lastEdit === 'user1', 
        'lastEdit unchanged');
    assert(editorState.timestamp === timestamp1, 
        'Timestamp unchanged (still 2000)');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 22: updateTeamCode stores cursor position ──────────────────────────
console.log('[Test 22] updateTeamCode stores cursor position');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Update with cursor position
    const code = 'function solution() { return 42; }';
    const cursorPosition = { line: 5, ch: 15 };
    const timestamp = Date.now();
    
    const result = arena.updateTeamCode(roomId, teamId, questionId, code, 'user1', cursorPosition, timestamp);
    
    assert(result.success === true, 
        'Update succeeds');
    
    // Verify cursor position stored
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.cursors.has('user1'), 
        'Cursor position stored for user');
    
    const storedCursor = editorState.cursors.get('user1');
    assert(storedCursor.line === 5, 
        'Cursor line position correct');
    assert(storedCursor.ch === 15, 
        'Cursor character position correct');
    assert(storedCursor.username === 'Alice', 
        'Cursor includes username');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 23: updateTeamCode initializes editor state if not exists ──────────
console.log('[Test 23] updateTeamCode initializes editor state if not exists');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Verify editor state doesn't exist yet
    assert(!arena.teamEditorStates.has(roomId), 
        'Editor state not initialized before updateTeamCode');
    
    // Update code (should initialize state)
    const code = 'function solution() { return 42; }';
    const timestamp = Date.now();
    const result = arena.updateTeamCode(roomId, teamId, questionId, code, 'user1', { line: 1, ch: 5 }, timestamp);
    
    assert(result.success === true, 
        'Update succeeds');
    
    // Verify editor state was initialized
    assert(arena.teamEditorStates.has(roomId), 
        'Editor state initialized for room');
    assert(arena.teamEditorStates.get(roomId).has(teamId), 
        'Editor state initialized for team');
    assert(arena.teamEditorStates.get(roomId).get(teamId).has(questionId), 
        'Editor state initialized for question');
    
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.code === code, 
        'Code set correctly');
    assert(editorState.lastEdit === 'user1', 
        'lastEdit set correctly');
    assert(editorState.timestamp === timestamp, 
        'Timestamp set correctly');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 24: updateTeamCode handles equal timestamps (accepts update) ───────
console.log('[Test 24] updateTeamCode handles equal timestamps (accepts update)');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    // Add second user to team
    const team = room.teams.find(t => t.id === 'team_1');
    team.players.push({
        id: 'user2',
        username: 'Bob',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // First update at timestamp 1000
    const code1 = 'function solution() { return 1; }';
    const timestamp = 1000;
    const result1 = arena.updateTeamCode(roomId, teamId, questionId, code1, 'user1', { line: 1, ch: 5 }, timestamp);
    
    assert(result1.success === true, 
        'First update succeeds');
    
    // Second update with same timestamp (should be accepted per design: timestamp >= current)
    const code2 = 'function solution() { return 2; }';
    const result2 = arena.updateTeamCode(roomId, teamId, questionId, code2, 'user2', { line: 1, ch: 10 }, timestamp);
    
    assert(result2.success === true, 
        'Update with equal timestamp accepted');
    assert(result2.conflict === false, 
        'No conflict for equal timestamp');
    
    // Verify code was updated
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.code === code2, 
        'Code updated to second version (equal timestamp accepted)');
    assert(editorState.lastEdit === 'user2', 
        'lastEdit updated to user2');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 25: updateTeamCode updates cursor position for existing user ───────
console.log('[Test 25] updateTeamCode updates cursor position for existing user');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // First update with cursor at line 1, ch 5
    const code1 = 'function solution() { return 1; }';
    const cursor1 = { line: 1, ch: 5 };
    const timestamp1 = 1000;
    arena.updateTeamCode(roomId, teamId, questionId, code1, 'user1', cursor1, timestamp1);
    
    // Get editor state
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    // Verify first cursor position
    let storedCursor = editorState.cursors.get('user1');
    assert(storedCursor.line === 1, 
        'Initial cursor line correct');
    assert(storedCursor.ch === 5, 
        'Initial cursor ch correct');
    
    // Second update with new cursor position
    const code2 = 'function solution() { return 2; }';
    const cursor2 = { line: 3, ch: 15 };
    const timestamp2 = 2000;
    arena.updateTeamCode(roomId, teamId, questionId, code2, 'user1', cursor2, timestamp2);
    
    // Verify cursor position updated
    storedCursor = editorState.cursors.get('user1');
    assert(storedCursor.line === 3, 
        'Updated cursor line correct');
    assert(storedCursor.ch === 15, 
        'Updated cursor ch correct');
    assert(editorState.cursors.size === 1, 
        'Only one cursor for user1');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 26: getTeamEditorState returns empty state if not exists ───────────
console.log('[Test 26] getTeamEditorState returns empty state if not exists');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Try to get state for non-existent room/team/question
    const state = arena.getTeamEditorState('NONEXISTENT', 'team_1', 'question-1');
    
    assert(state !== null && state !== undefined, 
        'Returns a state object (not null/undefined)');
    assert(state.code === '', 
        'Returns empty code string');
    assert(typeof state.cursors === 'object', 
        'Returns cursors object');
    assert(Object.keys(state.cursors).length === 0, 
        'Cursors object is empty');
    assert(state.lastEdit === null, 
        'lastEdit is null');
    assert(state.timestamp === 0, 
        'timestamp is 0');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 27: getTeamEditorState returns current editor state ────────────────
console.log('[Test 27] getTeamEditorState returns current editor state');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Join editor to initialize state
    arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
    
    // Update code
    const code = 'function solution() { return 42; }';
    const cursorPosition = { line: 1, ch: 10 };
    const timestamp = Date.now();
    arena.updateTeamCode(roomId, teamId, questionId, code, 'user1', cursorPosition, timestamp);
    
    // Get editor state
    const state = arena.getTeamEditorState(roomId, teamId, questionId);
    
    assert(state.code === code, 
        'Returns correct code');
    assert(typeof state.cursors === 'object', 
        'Returns cursors object');
    assert(state.cursors['user1'] !== undefined, 
        'Cursors contains user1');
    assert(state.cursors['user1'].line === 1, 
        'Cursor line is correct');
    assert(state.cursors['user1'].ch === 10, 
        'Cursor ch is correct');
    assert(state.lastEdit === 'user1', 
        'lastEdit is correct');
    assert(state.timestamp === timestamp, 
        'timestamp is correct');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 28: getTeamEditorState converts cursors Map to plain object ────────
console.log('[Test 28] getTeamEditorState converts cursors Map to plain object');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 3,
        maxTeams: 2,
        questionCount: 3
    });
    
    // Add more users to team
    room.teams[0].players.push({ id: 'user2', username: 'Bob' });
    room.teams[0].players.push({ id: 'user3', username: 'Charlie' });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Join editor with multiple users
    arena.joinTeamEditor(roomId, teamId, questionId, 'user1', 'Alice');
    arena.joinTeamEditor(roomId, teamId, questionId, 'user2', 'Bob');
    arena.joinTeamEditor(roomId, teamId, questionId, 'user3', 'Charlie');
    
    // Update code with different cursor positions
    arena.updateTeamCode(roomId, teamId, questionId, 'code1', 'user1', { line: 1, ch: 5 }, 1000);
    arena.updateTeamCode(roomId, teamId, questionId, 'code2', 'user2', { line: 2, ch: 10 }, 2000);
    arena.updateTeamCode(roomId, teamId, questionId, 'code3', 'user3', { line: 3, ch: 15 }, 3000);
    
    // Get editor state
    const state = arena.getTeamEditorState(roomId, teamId, questionId);
    
    assert(!(state.cursors instanceof Map), 
        'Cursors is not a Map (converted to plain object)');
    assert(typeof state.cursors === 'object', 
        'Cursors is a plain object');
    assert(Object.keys(state.cursors).length === 3, 
        'Cursors contains all 3 users');
    assert(state.cursors['user1'] !== undefined, 
        'Contains user1 cursor');
    assert(state.cursors['user2'] !== undefined, 
        'Contains user2 cursor');
    assert(state.cursors['user3'] !== undefined, 
        'Contains user3 cursor');
    assert(state.cursors['user1'].line === 1, 
        'User1 cursor line correct');
    assert(state.cursors['user2'].line === 2, 
        'User2 cursor line correct');
    assert(state.cursors['user3'].line === 3, 
        'User3 cursor line correct');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 29: getTeamEditorState handles partial state existence ─────────────
console.log('[Test 29] getTeamEditorState handles partial state existence');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    
    // Initialize room state but not team state
    arena.teamEditorStates.set(roomId, new Map());
    
    // Try to get state for team that doesn't exist
    const state1 = arena.getTeamEditorState(roomId, 'team_1', 'question-1');
    assert(state1.code === '', 
        'Returns empty state when team not found');
    
    // Initialize team state but not question state
    arena.teamEditorStates.get(roomId).set('team_1', new Map());
    
    // Try to get state for question that doesn't exist
    const state2 = arena.getTeamEditorState(roomId, 'team_1', 'question-1');
    assert(state2.code === '', 
        'Returns empty state when question not found');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 30: updateCursorPosition stores cursor position correctly ──────────
console.log('[Test 30] updateCursorPosition stores cursor position correctly');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    const position = { line: 5, ch: 10 };
    
    // Update cursor position
    const result = arena.updateCursorPosition(roomId, teamId, questionId, 'user1', position);
    
    assert(result.success === true, 
        'updateCursorPosition returns success');
    
    // Verify cursor position stored in editor state
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.cursors.has('user1'), 
        'Cursor position stored for user');
    
    const storedCursor = editorState.cursors.get('user1');
    assert(storedCursor.line === 5, 
        'Cursor line position correct');
    assert(storedCursor.ch === 10, 
        'Cursor character position correct');
    assert(storedCursor.username === 'Alice', 
        'Cursor includes username');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 31: updateCursorPosition updates existing cursor position ──────────
console.log('[Test 31] updateCursorPosition updates existing cursor position');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Set initial cursor position
    arena.updateCursorPosition(roomId, teamId, questionId, 'user1', { line: 5, ch: 10 });
    
    // Verify initial position
    let editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.cursors.get('user1').line === 5, 
        'Initial cursor line correct');
    assert(editorState.cursors.get('user1').ch === 10, 
        'Initial cursor ch correct');
    
    // Update cursor position
    arena.updateCursorPosition(roomId, teamId, questionId, 'user1', { line: 8, ch: 15 });
    
    // Verify updated position
    editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.cursors.get('user1').line === 8, 
        'Updated cursor line correct');
    assert(editorState.cursors.get('user1').ch === 15, 
        'Updated cursor ch correct');
    assert(editorState.cursors.size === 1, 
        'Only one cursor entry for user');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 32: updateCursorPosition validates user belongs to team ────────────
console.log('[Test 32] updateCursorPosition validates user belongs to team');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Try to update cursor for user not in team
    try {
        arena.updateCursorPosition(roomId, teamId, questionId, 'user999', { line: 5, ch: 10 });
        assert(false, 
            'Should throw error for user not in team');
    } catch (error) {
        assert(error.message === 'User does not belong to this team', 
            'Correct error message for unauthorized user');
    }
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 33: updateCursorPosition validates position format ─────────────────
console.log('[Test 33] updateCursorPosition validates position format');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Test: null position
    try {
        arena.updateCursorPosition(roomId, teamId, questionId, 'user1', null);
        assert(false, 
            'Should throw error for null position');
    } catch (error) {
        assert(error.message.includes('Invalid cursor position'), 
            'Correct error for null position');
    }
    
    // Test: missing line property
    try {
        arena.updateCursorPosition(roomId, teamId, questionId, 'user1', { ch: 10 });
        assert(false, 
            'Should throw error for missing line');
    } catch (error) {
        assert(error.message.includes('Invalid cursor position'), 
            'Correct error for missing line');
    }
    
    // Test: missing ch property
    try {
        arena.updateCursorPosition(roomId, teamId, questionId, 'user1', { line: 5 });
        assert(false, 
            'Should throw error for missing ch');
    } catch (error) {
        assert(error.message.includes('Invalid cursor position'), 
            'Correct error for missing ch');
    }
    
    // Test: valid position should succeed
    try {
        const result = arena.updateCursorPosition(roomId, teamId, questionId, 'user1', { line: 5, ch: 10 });
        assert(result.success === true, 
            'Valid position succeeds');
    } catch (error) {
        assert(false, 
            `Valid position should not throw error: ${error.message}`);
    }
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 34: updateCursorPosition initializes editor state if not exists ────
console.log('[Test 34] updateCursorPosition initializes editor state if not exists');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Verify editor state doesn't exist yet
    assert(!arena.teamEditorStates.has(roomId), 
        'Editor state not initialized before updateCursorPosition');
    
    // Update cursor position
    arena.updateCursorPosition(roomId, teamId, questionId, 'user1', { line: 5, ch: 10 });
    
    // Verify editor state was initialized
    assert(arena.teamEditorStates.has(roomId), 
        'Editor state initialized for room');
    assert(arena.teamEditorStates.get(roomId).has(teamId), 
        'Editor state initialized for team');
    assert(arena.teamEditorStates.get(roomId).get(teamId).has(questionId), 
        'Editor state initialized for question');
    
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.cursors.has('user1'), 
        'Cursor position stored');
    assert(editorState.code !== undefined, 
        'Editor state has code property');
    assert(editorState.timestamp !== undefined, 
        'Editor state has timestamp property');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 35: updateCursorPosition handles multiple users ────────────────────
console.log('[Test 35] updateCursorPosition handles multiple users');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 3,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    // Add more users to team
    const team = room.teams.find(t => t.id === 'team_1');
    team.players.push({
        id: 'user2',
        username: 'Bob',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    team.players.push({
        id: 'user3',
        username: 'Charlie',
        score: 0,
        questionsCompleted: 0,
        joinedAt: new Date().toISOString()
    });
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    
    // Update cursor positions for multiple users
    arena.updateCursorPosition(roomId, teamId, questionId, 'user1', { line: 1, ch: 5 });
    arena.updateCursorPosition(roomId, teamId, questionId, 'user2', { line: 2, ch: 10 });
    arena.updateCursorPosition(roomId, teamId, questionId, 'user3', { line: 3, ch: 15 });
    
    // Verify all cursor positions stored
    const editorState = arena.teamEditorStates
        .get(roomId)
        .get(teamId)
        .get(questionId);
    
    assert(editorState.cursors.size === 3, 
        'All 3 cursor positions stored');
    assert(editorState.cursors.has('user1'), 
        'User1 cursor stored');
    assert(editorState.cursors.has('user2'), 
        'User2 cursor stored');
    assert(editorState.cursors.has('user3'), 
        'User3 cursor stored');
    
    assert(editorState.cursors.get('user1').line === 1, 
        'User1 cursor line correct');
    assert(editorState.cursors.get('user2').line === 2, 
        'User2 cursor line correct');
    assert(editorState.cursors.get('user3').line === 3, 
        'User3 cursor line correct');
    
    assert(editorState.cursors.get('user1').username === 'Alice', 
        'User1 username stored');
    assert(editorState.cursors.get('user2').username === 'Bob', 
        'User2 username stored');
    assert(editorState.cursors.get('user3').username === 'Charlie', 
        'User3 username stored');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 36: updateCursorPosition validates room, team, and question ────────
console.log('[Test 36] updateCursorPosition validates room, team, and question');
try {
    const arena = new IntraFactionArena(mockIo, mockFactions);
    
    // Create a room
    const room = arena.createRoom('user1', 'Alice', 'faction1', {
        name: 'Test Room',
        teamSize: 2,
        maxTeams: 2,
        questionCount: 3
    });
    
    room.questions = [{
        id: 'question-1',
        title: 'Test Question',
        starterCode: 'function solution() {}'
    }];
    arena.activeRooms.set(room.id, room);
    
    const roomId = room.id;
    const teamId = 'team_1';
    const questionId = 'question-1';
    const position = { line: 5, ch: 10 };
    
    // Test: Invalid room ID
    try {
        arena.updateCursorPosition('INVALID_ROOM', teamId, questionId, 'user1', position);
        assert(false, 
            'Should throw error for invalid room');
    } catch (error) {
        assert(error.message === 'Room not found', 
            'Correct error for invalid room');
    }
    
    // Test: Invalid team ID
    try {
        arena.updateCursorPosition(roomId, 'team_999', questionId, 'user1', position);
        assert(false, 
            'Should throw error for invalid team');
    } catch (error) {
        assert(error.message === 'Team not found', 
            'Correct error for invalid team');
    }
    
    // Test: Invalid question ID
    try {
        arena.updateCursorPosition(roomId, teamId, 'question-999', 'user1', position);
        assert(false, 
            'Should throw error for invalid question');
    } catch (error) {
        assert(error.message === 'Question not found in room', 
            'Correct error for invalid question');
    }
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 37: broadcastToTeam constructs correct team room name ──────────────
console.log('[Test 37] broadcastToTeam constructs correct team room name');
try {
    let capturedRoomName = null;
    let capturedEvent = null;
    let capturedData = null;
    
    // Mock Socket.io with room name capture
    const mockIoWithCapture = {
        to: (roomName) => {
            capturedRoomName = roomName;
            return {
                emit: (event, data) => {
                    capturedEvent = event;
                    capturedData = data;
                }
            };
        }
    };
    
    const arena = new IntraFactionArena(mockIoWithCapture, mockFactions);
    
    const roomId = 'ROOM123';
    const teamId = 'team_1';
    const questionId = 'question-1';
    const event = 'test-event';
    const data = { message: 'test data' };
    
    // Call broadcastToTeam
    arena.broadcastToTeam(roomId, teamId, questionId, event, data);
    
    // Verify correct room name constructed (Requirement 4.2)
    const expectedRoomName = `cw-${roomId}-team-${teamId}-q-${questionId}`;
    assert(capturedRoomName === expectedRoomName, 
        `Room name constructed correctly: ${expectedRoomName}`);
    
    // Verify event and data passed through
    assert(capturedEvent === event, 
        'Event name passed correctly');
    assert(capturedData === data, 
        'Data passed correctly');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 38: broadcastToTeam emits to all team members ──────────────────────
console.log('[Test 38] broadcastToTeam emits to all team members');
try {
    let emitCalled = false;
    let emittedEvent = null;
    let emittedData = null;
    
    // Mock Socket.io to verify emit is called
    const mockIoWithEmit = {
        to: () => ({
            emit: (event, data) => {
                emitCalled = true;
                emittedEvent = event;
                emittedData = data;
            }
        })
    };
    
    const arena = new IntraFactionArena(mockIoWithEmit, mockFactions);
    
    const roomId = 'ROOM456';
    const teamId = 'team_2';
    const questionId = 'question-2';
    const event = 'cw-teammate-code-update';
    const data = {
        userId: 'user1',
        username: 'Alice',
        code: 'function solution() { return 42; }',
        timestamp: Date.now()
    };
    
    // Call broadcastToTeam without excludeUserId
    arena.broadcastToTeam(roomId, teamId, questionId, event, data);
    
    // Verify emit was called
    assert(emitCalled === true, 
        'Emit was called');
    assert(emittedEvent === event, 
        'Event emitted correctly');
    assert(emittedData.userId === data.userId, 
        'Data emitted correctly');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 39: broadcastToTeam excludes specified user ────────────────────────
console.log('[Test 39] broadcastToTeam excludes specified user');
try {
    let exceptCalled = false;
    let excludedUserId = null;
    
    // Mock Socket.io with except() method
    const mockIoWithExcept = {
        to: () => ({
            except: (userId) => {
                exceptCalled = true;
                excludedUserId = userId;
                return {
                    emit: () => {}
                };
            },
            emit: () => {
                // This should not be called when excludeUserId is provided
            }
        })
    };
    
    const arena = new IntraFactionArena(mockIoWithExcept, mockFactions);
    
    const roomId = 'ROOM789';
    const teamId = 'team_1';
    const questionId = 'question-3';
    const event = 'cw-teammate-cursor-update';
    const data = { position: { line: 5, ch: 10 } };
    const excludeUserId = 'user1';
    
    // Call broadcastToTeam with excludeUserId
    arena.broadcastToTeam(roomId, teamId, questionId, event, data, excludeUserId);
    
    // Verify except() was called with correct userId
    assert(exceptCalled === true, 
        'except() method was called');
    assert(excludedUserId === excludeUserId, 
        'Correct user ID excluded');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 40: broadcastToTeam handles different room/team/question combos ────
console.log('[Test 40] broadcastToTeam handles different room/team/question combinations');
try {
    const capturedRoomNames = [];
    
    // Mock Socket.io to capture multiple room names
    const mockIoMultiple = {
        to: (roomName) => {
            capturedRoomNames.push(roomName);
            return {
                emit: () => {}
            };
        }
    };
    
    const arena = new IntraFactionArena(mockIoMultiple, mockFactions);
    
    // Test different combinations
    const combinations = [
        { roomId: 'ROOM1', teamId: 'team_1', questionId: 'q1' },
        { roomId: 'ROOM1', teamId: 'team_2', questionId: 'q1' },
        { roomId: 'ROOM1', teamId: 'team_1', questionId: 'q2' },
        { roomId: 'ROOM2', teamId: 'team_1', questionId: 'q1' }
    ];
    
    combinations.forEach(combo => {
        arena.broadcastToTeam(combo.roomId, combo.teamId, combo.questionId, 'test-event', {});
    });
    
    // Verify each combination produces unique room name
    assert(capturedRoomNames.length === 4, 
        'All broadcasts executed');
    
    const uniqueRoomNames = new Set(capturedRoomNames);
    assert(uniqueRoomNames.size === 4, 
        'Each combination produces unique room name');
    
    // Verify format of room names
    assert(capturedRoomNames[0] === 'cw-ROOM1-team-team_1-q-q1', 
        'Room name format correct for combo 1');
    assert(capturedRoomNames[1] === 'cw-ROOM1-team-team_2-q-q1', 
        'Room name format correct for combo 2 (different team)');
    assert(capturedRoomNames[2] === 'cw-ROOM1-team-team_1-q-q2', 
        'Room name format correct for combo 3 (different question)');
    assert(capturedRoomNames[3] === 'cw-ROOM2-team-team_1-q-q1', 
        'Room name format correct for combo 4 (different room)');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test 41: broadcastToTeam ensures team isolation ─────────────────────────
console.log('[Test 41] broadcastToTeam ensures team isolation (Requirement 4.2)');
try {
    const emittedToRooms = [];
    
    // Mock Socket.io to track which rooms receive broadcasts
    const mockIoIsolation = {
        to: (roomName) => {
            emittedToRooms.push(roomName);
            return {
                emit: () => {}
            };
        }
    };
    
    const arena = new IntraFactionArena(mockIoIsolation, mockFactions);
    
    const roomId = 'ROOM999';
    const questionId = 'question-1';
    
    // Broadcast to team_1
    arena.broadcastToTeam(roomId, 'team_1', questionId, 'test-event', { data: 'team 1' });
    
    // Broadcast to team_2
    arena.broadcastToTeam(roomId, 'team_2', questionId, 'test-event', { data: 'team 2' });
    
    // Verify broadcasts went to different rooms (team isolation)
    assert(emittedToRooms.length === 2, 
        'Two broadcasts executed');
    
    const team1Room = emittedToRooms[0];
    const team2Room = emittedToRooms[1];
    
    assert(team1Room !== team2Room, 
        'Different teams use different socket rooms');
    assert(team1Room.includes('team_1'), 
        'Team 1 room name includes team_1');
    assert(team2Room.includes('team_2'), 
        'Team 2 room name includes team_2');
    assert(team1Room === 'cw-ROOM999-team-team_1-q-question-1', 
        'Team 1 room name correct');
    assert(team2Room === 'cw-ROOM999-team-team_2-q-question-1', 
        'Team 2 room name correct');
    
    console.log('');
} catch (error) {
    console.error(`  ✗ Test failed with error: ${error.message}\n`);
    testsFailed++;
    process.exitCode = 1;
}

// ── Test Summary ────────────────────────────────────────────────────────────

console.log('=== Test Summary ===');
console.log(`Total tests: ${testsPassed + testsFailed}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);

if (testsFailed === 0) {
    console.log('\n✓ All tests passed!\n');
    process.exitCode = 0;
} else {
    console.log('\n✗ Some tests failed\n');
    process.exitCode = 1;
}
