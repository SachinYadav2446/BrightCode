const axios = require('axios');

async function test() {
  try {
    const user = { username: `test_${Date.now()}`, email: `test_${Date.now()}@test.com`, password: 'password123' };
    
    console.log("1. Registering...");
    let res = await axios.post('http://localhost:5000/register', user);
    console.log("Register:", res.data);

    console.log("2. Logging in...");
    res = await axios.post('http://localhost:5000/login', { email: user.email, password: user.password });
    console.log("Login XP:", res.data.xp);
    const token = res.data.token;

    console.log("3. Adding XP...");
    res = await axios.post('http://localhost:5000/add-xp', { amount: 1500, module: 'logic-lab', level: 2 }, { headers: { Authorization: `Bearer ${token}` } });
    console.log("Add XP Result:", res.data);

    console.log("4. Getting Me...");
    res = await axios.get('http://localhost:5000/me', { headers: { Authorization: `Bearer ${token}` } });
    console.log("Me XP:", res.data.xp);

    console.log("5. Simulating logout by dropping token, logging in again...");
    res = await axios.post('http://localhost:5000/login', { email: user.email, password: user.password });
    console.log("Login (After) XP:", res.data.xp);

    console.log("6. Getting Leaderboard...");
    res = await axios.get('http://localhost:5000/leaderboard');
    const myUser = res.data.find(u => u.username === user.username);
    console.log("Leaderboard XP for user:", myUser ? myUser.xp : "Not found!");
    
  } catch(e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}

test();
