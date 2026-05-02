const express = require('express');
const axios = require('axios');
const router = express.Router();

const SYSTEM_PROMPT = `
You are the AI Sentinel for "BrightCode" (also known as Code Sight). 
BrightCode is an advanced, high-performance collaborative coding platform and learning ecosystem designed for elite engineers.
Key Features:
- Real-time Collaborative Forge (low-latency pair programming)
- Architecture Lab (isolated execution sandboxes using node-pty)
- Syndicate Wars (faction-based team battles and sprints)
- Skill Forge Challenges (Arcade, Code Wars, Battle Arena)
- Global Engineering Leaderboards
- CodeVault (Rich editor for notes, markdown, diagrams, and media embeds)
- AI-powered assistance (You!)
Tech Stack: React, Vite, Framer Motion, Node.js, Express, Socket.io, PostgreSQL, Monaco Editor.
Mission: Bridge the gap between theoretical knowledge and industrial-scale system architecture.
Tone: Professional, helpful, slightly sci-fi/cyberpunk (like an AI Sentinel), but highly clear and concise.

CRITICAL INSTRUCTIONS:
1. Answer the user's questions about the project accurately based on this context. 
2. Keep responses EXTREMELY concise and short (1-3 sentences maximum).
3. Do NOT use Markdown formatting like **bolding** or *italics*. Output plain text only, as the frontend chat interface does not render Markdown.
4. If they ask a general coding question or need help with a bug, you can answer that too, but maintain your concise AI Sentinel persona.
`;

router.post('/', async (req, res) => {
    try {
        const { messages } = req.body; 
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'AI API key not configured on server.' });
        }

        // Format messages for Gemini API
        // Gemini expects: { role: "user" | "model", parts: [{ text: "..." }] }
        const formattedMessages = [
            {
                role: 'user',
                parts: [{ text: SYSTEM_PROMPT }]
            },
            {
                role: 'model',
                parts: [{ text: "Understood. I am the BrightCode AI Sentinel. How can I assist you today?" }]
            },
            ...messages.map(msg => ({
                role: msg.type === 'bot' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            }))
        ];

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: formattedMessages,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 800,
            }
        };

        const response = await axios.post(endpoint, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            const aiResponse = response.data.candidates[0].content.parts[0].text;
            res.json({ text: aiResponse });
        } else {
            console.error('[AI Chatbot] Invalid response format:', JSON.stringify(response.data, null, 2));
            throw new Error('Invalid response format from AI provider');
        }
        
    } catch (error) {
        console.error('[AI Chatbot] Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to process AI request. Please try again later.', details: error.response?.data || error.message });
    }
});

module.exports = router;
