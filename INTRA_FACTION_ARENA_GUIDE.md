# Intra-Faction Code Wars Arena 🎮⚔️

## Overview

The **Intra-Faction Code Wars Arena** allows faction members to create custom coding battle rooms and compete against each other within their faction. This system supports flexible team configurations, private rooms, and real-time competitive programming.

## 🎯 Key Features

### **Custom Room Creation**
- **Room Names**: Personalized battle room names
- **Password Protection**: Private rooms with password access
- **Flexible Team Sizes**: 1v1, 2v2, 3v3, 4v4, 5v5
- **Multiple Teams**: Support for 2-4 teams per room
- **Configurable Settings**: Question count, time limits, difficulty levels

### **Room Management**
- **6-Character Room Codes**: Easy-to-share room identifiers (e.g., "ABC123")
- **Real-time Updates**: Live room status and player changes
- **Spectator Mode**: Watch battles without participating
- **Team Switching**: Move between teams before game starts

### **Game Modes**
- **Question Count**: 1-10 coding problems per game
- **Time Limits**: 5 minutes to 1 hour
- **Difficulty Options**:
  - **Mixed** (Recommended): Balanced difficulty progression
  - **Easy Only**: Beginner-friendly battles
  - **Medium Only**: Intermediate challenges
  - **Hard Only**: Expert-level competition

## 🚀 How to Use

### **Creating a Room**

1. **Access Arena**: Click "Code Wars Arena" in faction headquarters
2. **Create Room**: Click "Create Room" button
3. **Configure Settings**:
   - Set room name and optional password
   - Choose team size (1v1, 2v2, etc.)
   - Select number of teams (2-4)
   - Set question count and time limit
   - Choose difficulty level
4. **Create**: Click "Create Battle Room"
5. **Share Code**: Give the 6-character room code to other faction members

### **Joining a Room**

#### **Method 1: Browse Active Rooms**
- View all public rooms in your faction
- Click "Join Battle" on any available room
- Enter password if required

#### **Method 2: Join with Code**
- Click "Join with Code"
- Enter the 6-character room code
- Enter password if the room is private
- Click "Join Battle"

### **Room Lobby**

Once in a room:
- **View Teams**: See all teams and their members
- **Switch Teams**: Join different teams (if space available)
- **Copy Room ID**: Share room code with others
- **Wait for Players**: Room creator can start when ready
- **Spectate**: Watch if teams are full

### **Game Flow**

1. **Room Creator Starts**: Click "Start Game" when enough players joined
2. **Solve Problems**: Race to solve coding challenges
3. **Team Scoring**: Points are shared among team members
4. **Real-time Updates**: See live progress and scores
5. **Victory**: Team with most points wins!

## 🏗️ Technical Architecture

### **Room System**
```javascript
// Room Structure
{
  id: "ABC123",           // 6-character code
  name: "Epic Battle",    // Custom name
  password: "secret",     // Optional password
  factionId: "faction_id", // Faction restriction
  creatorId: "user_id",   // Room creator
  
  // Game Configuration
  teamSize: 2,            // Players per team
  maxTeams: 2,            // Number of teams
  questionCount: 3,       // Problems to solve
  timeLimit: 600,         // Seconds
  difficulty: "mixed",    // Question difficulty
  
  // Teams and Players
  teams: [
    {
      id: "team_1",
      name: "Team 1",
      players: [...],
      score: 0
    }
  ],
  spectators: [...],
  
  // Game State
  status: "waiting",      // waiting, active, completed
  questions: [...],       // Generated problems
  submissions: Map(),     // Player solutions
  scores: Map()           // Team scores
}
```

### **API Endpoints**

#### **Room Management**
- `POST /code-wars/create-room` - Create new battle room
- `POST /code-wars/join-room` - Join existing room
- `POST /code-wars/leave-room` - Leave current room
- `GET /code-wars/my-room` - Get current room status
- `GET /code-wars/faction-rooms` - List faction's public rooms

#### **Game Control**
- `POST /code-wars/start-game` - Start battle (creator only)
- `POST /code-wars/submit-solution` - Submit code solution
- `POST /code-wars/switch-team` - Change teams in lobby

### **Real-time Features**
- **Socket.io Integration**: Live updates for room changes
- **Team Updates**: Real-time player joins/leaves
- **Game Events**: Live scoring and solution notifications
- **Spectator Updates**: Live game progress for watchers

## 🎮 Game Configurations

### **Team Sizes**
- **1v1**: Classic head-to-head coding duels
- **2v2**: Pair programming battles
- **3v3**: Small team coordination
- **4v4**: Medium team strategy
- **5v5**: Large team collaboration

### **Question Difficulties**

#### **Mixed Mode** (Recommended)
- **1-3 questions**: 60% Easy, 40% Medium
- **4-5 questions**: 40% Easy, 40% Medium, 20% Hard
- **6+ questions**: 30% Easy, 40% Medium, 30% Hard

#### **Single Difficulty**
- All questions at the same difficulty level
- Good for skill-specific practice

### **Time Limits**
- **5 minutes**: Quick coding sprints
- **10 minutes**: Standard battles
- **15-20 minutes**: Extended competitions
- **30+ minutes**: Marathon coding sessions

## 🔧 Customization Options

### **Room Settings**
```javascript
const roomConfig = {
  name: "Custom Battle Name",
  password: "optional_password",
  teamSize: 2,              // 1-5 players per team
  maxTeams: 3,              // 2-4 teams total
  questionCount: 5,         // 1-10 questions
  timeLimit: 900,           // 5min - 1hour (seconds)
  difficulty: "mixed",      // mixed, easy, medium, hard
  allowSpectators: true,    // Enable spectator mode
  showLeaderboard: true     // Display live scores
};
```

### **Question Pool**
- **Built-in Database**: 6+ curated problems
- **Difficulty Levels**: Easy (100pts), Medium (200pts), Hard (400pts)
- **Categories**: Arrays, Strings, Math, Algorithms, Data Structures
- **Expandable**: Easy to add new problems

## 🏆 Scoring System

### **Individual Scoring**
- **Correct Solution**: Full points for the problem
- **Failed Attempts**: No point deduction (encourages experimentation)
- **Time Bonus**: Faster solutions don't get extra points (fairness)

### **Team Scoring**
- **Shared Points**: All team members contribute to team total
- **Collaborative**: Team members can help each other
- **Victory Condition**: Team with highest total score wins

### **XP Rewards**
- **Participation**: Base XP for joining games
- **Completion**: Bonus XP for solving problems
- **Victory**: Additional XP for winning teams

## 🔐 Security & Permissions

### **Faction Restrictions**
- Only faction members can create/join rooms
- Rooms are isolated per faction
- No cross-faction battles in this mode

### **Room Access Control**
- **Public Rooms**: Visible to all faction members
- **Private Rooms**: Require password to join
- **Creator Privileges**: Only creator can start games

### **Code Execution**
- **Sandboxed Environment**: Safe Java code execution
- **Input Validation**: All code is validated before compilation
- **Resource Limits**: Timeout and memory restrictions

## 🚀 Future Enhancements

### **Planned Features**
- **Tournament Brackets**: Multi-round elimination tournaments
- **Replay System**: Review past games and solutions
- **Statistics Dashboard**: Personal and team performance metrics
- **Custom Problems**: User-created coding challenges
- **Voice Chat**: Built-in communication for teams

### **Advanced Modes**
- **Relay Coding**: Team members solve problems in sequence
- **Code Golf**: Shortest solution wins
- **Debugging Challenges**: Fix broken code instead of writing new
- **Algorithm Races**: Implement specific algorithms quickly

## 📊 Usage Examples

### **Quick 1v1 Duel**
```javascript
// Room Configuration
{
  name: "Quick Duel",
  teamSize: 1,
  maxTeams: 2,
  questionCount: 3,
  timeLimit: 600,        // 10 minutes
  difficulty: "mixed"
}
```

### **Team Strategy Battle**
```javascript
// Room Configuration
{
  name: "Strategy War",
  teamSize: 3,
  maxTeams: 2,
  questionCount: 5,
  timeLimit: 1200,       // 20 minutes
  difficulty: "mixed",
  allowSpectators: true
}
```

### **Practice Session**
```javascript
// Room Configuration
{
  name: "Practice Easy",
  teamSize: 2,
  maxTeams: 3,
  questionCount: 4,
  timeLimit: 900,        // 15 minutes
  difficulty: "easy"
}
```

## 🎯 Best Practices

### **For Room Creators**
- Choose appropriate time limits for question count
- Use mixed difficulty for balanced gameplay
- Set clear room names that indicate the type of battle
- Wait for enough players before starting

### **For Players**
- Communicate with teammates in team modes
- Read problems carefully before coding
- Test solutions with provided examples
- Help teammates when possible

### **For Spectators**
- Use spectator mode to learn from better players
- Watch different team strategies
- Don't spoil solutions for active players

---

## 🎉 Getting Started

1. **Join a Faction**: Must be a faction member to access
2. **Navigate to Arena**: Click "Code Wars Arena" in faction HQ
3. **Create or Join**: Either create a new room or join existing ones
4. **Battle**: Solve coding problems and compete with faction mates!

The Intra-Faction Code Wars Arena brings competitive programming directly to your faction, fostering collaboration, learning, and friendly competition among members! 🚀⚔️