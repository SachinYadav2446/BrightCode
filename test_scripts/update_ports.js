const fs = require('fs');
const files = [
  'client/src/socket.js',
  'client/src/pages/Workspace.jsx',
  'client/src/pages/Leaderboard.jsx',
  'client/src/pages/Home.jsx',
  'client/src/pages/Factions.jsx',
  'client/src/pages/EditorPage.jsx',
  'client/src/pages/Arcade.jsx',
  'client/src/context/AuthContext.jsx'
];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const newContent = content.replace(/http:\/\/localhost:5050/g, 'http://localhost:5051');
  fs.writeFileSync(file, newContent, 'utf8');
  console.log(`Updated ${file}`);
});
