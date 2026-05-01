# Code Wars Arena - Implementation Guide

## 🎮 What is Code Wars Arena?

Code Wars Arena is an inter-faction competitive coding system where members of different factions battle in real-time coding challenges. Players solve programming problems to earn points for their faction, with the winning faction receiving XP bonuses and bragging rights.

## 🏗️ Architecture Overview

### Backend Components

1. **Question Database** (`server/codeWarQuestions.js`)
   - Built-in curated coding challenges
   - Organized by difficulty (Easy, Medium, Hard)
   - Categories: Arrays, Strings, Math, Algorithms, Data Structures
   - Each question includes test cases, examples, and starter code

2. **LeetCode Integration** (`server/leetcodeAPI.js`)
   - Optional integration with LeetCode's GraphQL API
   - Fetches problems dynamically for variety
   - Caches results to avoid API rate limits
   - Falls back to built-in questions if API fails

3. **Game Engine** (`server/codeWarsArena.js`)
   - Manages game sessions and matchmaking
   - Handles real-time submissions and scoring
   - Integrates with existing Java compiler system
   - Socket.io for real-time updates

4. **API Endpoints** (added to `server/index.js`)
   - `/code-wars/join-queue` - Join matchmaking queue
   - `/code-wars/submit` - Submit code solutions
   - `/code-wars/my-game` - Get current game state
   - And more...

### Frontend Components

1. **Main Arena Page** (`client/src/pages/CodeWarsArena.jsx`)
   - Game mode selection (Quick Battle, Standard War, Epic Siege)
   - Queue system with real-time updates
   - Live game interface with code editor
   - Results and scoring display

2. **Styling** (`client/src/pages/CodeWarsArena.css`)
   - Battle-themed dark design
   - Responsive layout for different screen sizes
   - Animated elements and visual feedback

## 🎯 Game Modes

### Quick Battle (10 minutes)
- 3 questions: Easy, Easy, Medium
- Perfect for quick faction skirmishes
- 100-200 points per question

### Standard War (20 minutes)
- 5 questions: Easy, Easy, Medium, Medium, Hard
- Balanced competitive experience
- 100-400 points per question

### Epic Siege (30 minutes)
- 8 questions: 3 Easy, 3 Medium, 2 Hard
- Ultimate faction warfare
- Maximum points and glory

## 🔧 Question Sources

### Built-in Questions (Recommended)
- **Pros**: No external dependencies, fast, reliable
- **Cons**: Limited variety (can be expanded)
- **Usage**: Default source, always available

### LeetCode Integration (Advanced)
- **Pros**: Thousands of problems, constantly updated
- **Cons**: API rate limits, requires internet, complex parsing
- **Usage**: Set `questionSource: 'leetcode'` when creating games

## 🚀 How to Use

### For Players

1. **Join a Faction**: Must be a faction member to participate
2. **Access Arena**: Click "Code Wars Arena" button in faction headquarters
3. **Select Mode**: Choose your preferred game mode
4. **Join Queue**: Wait for matchmaking to find opponents
5. **Battle**: Solve coding problems faster than rival factions
6. **Win**: Earn XP and faction glory!

### For Developers

#### Adding New Questions
```javascript
// Add to server/codeWarQuestions.js
{
    id: 'cw_007',
    title: 'Your Problem Title',
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    category: CATEGORIES.ARRAYS,
    timeLimit: 420, // 7 minutes
    points: 200,
    description: `Problem description here...`,
    examples: [
        {
            input: "example input",
            output: "expected output",
            explanation: "why this works"
        }
    ],
    methodSignature: "public static ReturnType methodName(params)",
    testCases: [
        { input: [param1, param2], expected: "result" }
    ],
    starterCode: `public static ReturnType methodName(params) {
    // Your code here
    return null;
}`
}
```

#### Creating Custom Game Modes
```javascript
// Add to GAME_MODES in codeWarQuestions.js
CUSTOM_MODE: {
    name: 'Custom Mode',
    duration: 900, // 15 minutes
    questionCount: 4,
    difficulties: [
        DIFFICULTY_LEVELS.EASY,
        DIFFICULTY_LEVELS.MEDIUM,
        DIFFICULTY_LEVELS.MEDIUM,
        DIFFICULTY_LEVELS.HARD
    ]
}
```

## 🔌 Integration Points

### Existing Systems Used
- **Faction System**: Player membership and team assignment
- **Java Compiler**: Code execution and testing
- **Socket.io**: Real-time communication
- **Authentication**: User verification and permissions
- **XP System**: Reward distribution

### Database Schema (Future Enhancement)
```sql
-- Recommended tables for persistent game history
CREATE TABLE faction_games (
    id UUID PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    participating_factions TEXT[],
    status VARCHAR(20) DEFAULT 'waiting',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    winner_faction_id UUID,
    game_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_participants (
    id UUID PRIMARY KEY,
    game_id UUID REFERENCES faction_games(id),
    user_id UUID,
    faction_id UUID,
    score INTEGER DEFAULT 0,
    questions_completed INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 Customization Options

### Visual Themes
- Modify CSS variables in `CodeWarsArena.css`
- Add faction-specific color schemes
- Custom animations and effects

### Game Rules
- Adjust scoring in `codeWarsArena.js`
- Modify time limits per difficulty
- Add power-ups or special abilities

### Question Difficulty
- Rebalance point values
- Add new categories
- Implement dynamic difficulty adjustment

## 🐛 Troubleshooting

### Common Issues

1. **"Not a faction member" error**
   - User must join a faction first
   - Check faction membership in database

2. **Queue not finding matches**
   - Need at least 2 factions with players
   - Check matchmaking logic in `tryMatchmaking()`

3. **Code compilation errors**
   - Verify Java JDK installation
   - Check `javaCompiler.js` configuration

4. **Socket connection issues**
   - Verify Socket.io server is running
   - Check CORS settings

### Debug Mode
```javascript
// Enable debug logging in codeWarsArena.js
console.log('[CODE WARS]', 'Debug message here');
```

## 🚀 Future Enhancements

### Planned Features
- **Spectator Mode**: Watch ongoing battles
- **Tournament System**: Multi-round competitions
- **Replay System**: Review past games
- **Statistics Dashboard**: Detailed performance metrics
- **Custom Challenges**: User-created problems
- **Multiple Languages**: Support for Python, C++, JavaScript

### Advanced Features
- **AI Opponents**: Practice against bots
- **Team Formations**: Strategic role assignments
- **Power-ups**: Temporary advantages
- **Seasonal Events**: Special themed competitions

## 📊 Performance Considerations

### Scalability
- Game sessions are stored in memory (consider Redis for production)
- LeetCode API has rate limits (implement proper caching)
- Socket.io rooms scale with concurrent users

### Optimization
- Pre-compile frequently used test cases
- Cache question data to reduce database queries
- Implement connection pooling for high traffic

## 🔐 Security Notes

- All code execution is sandboxed through existing Java compiler
- User input is validated before compilation
- Game state is server-authoritative
- Socket events are authenticated

---

## 🎉 Getting Started

1. **Start the server**: `npm start` in the server directory
2. **Join a faction**: Create or join a faction first
3. **Access the arena**: Navigate to `/code-wars` or click the button in faction HQ
4. **Start battling**: Select a game mode and join the queue!

The Code Wars Arena is now ready for epic inter-faction coding battles! 🚀⚔️