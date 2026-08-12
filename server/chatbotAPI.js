const express = require('express');
const router = express.Router();
const logger = require('./logger');
const knowledge = require('./pal-knowledge.json');

// --- Semantic Search with Xenova Transformers ---
const { pipeline } = require('@xenova/transformers');
let embedder = null;
let knowledgeEmbeddings = [];

// --- Helper Functions ---
function fixTypos(query) {
  let corrected = query.toLowerCase().replace(/[^a-z0-9+#]+/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [typo, fix] of Object.entries(knowledge.typoFixes)) {
    const regex = new RegExp(`\\b${typo}\\b`, 'gi');
    corrected = corrected.replace(regex, fix);
  }
  return corrected;
}

function phraseMatches(query, phrase) {
  const escapedPhrase = phrase.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\s)${escapedPhrase}(?=$|\\s)`, 'i').test(query);
}

function extractEntity(query, entityType) {
  const entities = knowledge.entities[entityType];
  if (!entities) return null;
  
  for (const [entity, patterns] of Object.entries(entities)) {
    for (const pattern of patterns) {
      if (phraseMatches(query, pattern)) {
        return entity;
      }
    }
  }
  return null;
}

function recognizeIntent(query) {
  const cleanedQuery = fixTypos(query);
  let bestMatch = { name: 'fallback', entity: null, score: 0 };

  for (const [intentName, intentData] of Object.entries(knowledge.intents)) {
    for (const pattern of intentData.patterns || []) {
      if (phraseMatches(cleanedQuery, pattern)) {
        const entity = intentData.entityType
          ? extractEntity(cleanedQuery, intentData.entityType)
          : null;
        // Generic FAQ openers (for example, "can I") are not an intent until
        // they identify a supported FAQ topic.
        if (intentName === 'faq' && !entity) continue;
        const score = pattern.split(' ').length * 10 + (entity ? 5 : 0);
        if (score > bestMatch.score) {
          bestMatch = { name: intentName, entity, score };
        }
      }
    }
  }

  // A named BrightCode feature beats generic wording such as "what is", but not a
  // more specific action request such as "how do I post an SOS ticket?".
  const feature = extractEntity(cleanedQuery, 'feature');
  if (feature && (bestMatch.name === 'ask_about_feature' || bestMatch.name === 'fallback')) {
    const featureIntent = `ask_about_${feature}`;
    if (knowledge.intents[featureIntent]) return { name: featureIntent, entity: feature };
  }

  const faqEntity = extractEntity(cleanedQuery, 'faq');
  if (faqEntity && knowledge.faqs[faqEntity]) return { name: 'faq', entity: faqEntity };

  return bestMatch;
}

function getRandomResponse(intentName) {
  const intent = knowledge.intents[intentName];
  if (intent && intent.responses) {
    return intent.responses[Math.floor(Math.random() * intent.responses.length)];
  }
  return knowledge.intents.fallback.responses[0];
}

function resolveFeatureIntent(intentName, entity) {
  if (intentName !== 'ask_about_feature' || !entity) return intentName;

  const featureIntent = `ask_about_${entity}`;
  return knowledge.intents[featureIntent] ? featureIntent : intentName;
}

// --- Initialize Embedder ---
async function initEmbedder() {
  try {
    logger.info('[Pal] Loading semantic embedder...');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    logger.info('[Pal] Embedder loaded successfully!');
    await precomputeKnowledgeEmbeddings();
  } catch (err) {
    logger.error('[Pal] Failed to load embedder:', err.message);
  }
}

async function precomputeKnowledgeEmbeddings() {
  knowledgeEmbeddings = [];
  
  // Embed all intent responses and patterns
  for (const [intentName, intentData] of Object.entries(knowledge.intents)) {
    if (intentData.responses) {
      for (let i = 0; i < intentData.responses.length; i++) {
        const response = intentData.responses[i];
        const embedding = await getEmbedding(response);
        knowledgeEmbeddings.push({
          intent: intentName,
          responseIndex: i,
          text: response,
          embedding: embedding
        });
      }
    }
    if (intentData.patterns) {
      for (const pattern of intentData.patterns) {
        const embedding = await getEmbedding(pattern);
        knowledgeEmbeddings.push({
          intent: intentName,
          text: pattern,
          pattern: true,
          embedding: embedding
        });
      }
    }
  }
  
  logger.info('[Pal] Precomputed knowledge embeddings');
}

async function getEmbedding(text) {
  if (!embedder) return null;
  try {
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (err) {
    logger.error('[Pal] Embedding error:', err.message);
    return null;
  }
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function findMostSimilar(queryEmbedding) {
  let bestMatch = null;
  let highestSimilarity = 0;
  
  for (const entry of knowledgeEmbeddings) {
    const similarity = cosineSimilarity(queryEmbedding, entry.embedding);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = entry;
    }
  }
  
  return { bestMatch, similarity: highestSimilarity };
}

// --- Conversation State Management ---
const conversations = new Map(); // key: sessionId, value: { history: [], slots: {}, currentIntent: null }

function getOrCreateConversation(sessionId) {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, { 
      history: [], 
      slots: {}, 
      currentIntent: null,
      waitingForSlot: null
    });
  }
  return conversations.get(sessionId);
}

function addToConversation(sessionId, message) {
  const conversation = getOrCreateConversation(sessionId);
  conversation.history.push(message);
  if (conversation.history.length > 20) {
    conversation.history.shift();
  }
}

// --- Main Chat Endpoint ---
router.post('/', async (req, res) => {
  try {
    const { messages, sessionId = Date.now(), context = {} } = req.body; 
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get last user message
    const lastUserMessage = messages.filter(m => m.type === 'user').pop()?.text || '';
    
    logger.info(`[Pal] Session ${sessionId}: ${lastUserMessage}`);
    
    // Get or create conversation
    const conversation = getOrCreateConversation(sessionId);
    addToConversation(sessionId, { type: 'user', text: lastUserMessage });
    
    let response = '';
    
    // First, check if we were waiting for a slot fill
    if (conversation.waitingForSlot && conversation.currentIntent) {
      const intent = knowledge.intents[conversation.currentIntent];
      const slot = intent.slots.find(s => s.name === conversation.waitingForSlot);
      
      if (slot) {
        const entity = extractEntity(lastUserMessage, slot.entityType);
        if (entity) {
          conversation.slots[slot.name] = entity;
          conversation.waitingForSlot = null;
          
          // Check if we have all required slots
          const allSlotsFilled = intent.slots.every(s => conversation.slots[s.name]);
          if (allSlotsFilled && intent.responses) {
            response = getRandomResponse(conversation.currentIntent);
          }
        } else {
          // Ask again for the slot
          response = slot.prompt;
        }
      }
    }
    
    // If no response yet, process normally
    if (!response) {
      const recognizedIntent = recognizeIntent(lastUserMessage);
      const entity = recognizedIntent.entity;
      const intentName = resolveFeatureIntent(recognizedIntent.name, entity);
      conversation.currentIntent = intentName;
      conversation.slots = {};
      conversation.waitingForSlot = null;
      
      // Handle FAQ intent
      if (intentName === 'faq' && entity && knowledge.faqs[entity]) {
        response = knowledge.faqs[entity];
      } 
      // Named intents are authoritative. Semantic search is reserved for unknown wording.
      else if (intentName !== 'fallback') {
        response = getRandomResponse(intentName);
      }
      else if (embedder) {
        try {
          const queryEmbedding = await getEmbedding(lastUserMessage);
          const { bestMatch, similarity } = await findMostSimilar(queryEmbedding);
          
          if (similarity > 0.5 && bestMatch && !bestMatch.pattern) {
            response = bestMatch.text;
          } else {
            // Fallback to keyword-based response
            response = getRandomResponse(intentName);
          }
        } catch (err) {
          logger.error('[Pal] Semantic search error, using fallback:', err.message);
          response = getRandomResponse(intentName);
        }
      } else {
        // If embedder not loaded, use keyword-based
        response = getRandomResponse(intentName);
      }
      
      // Check for required slots
      const intent = knowledge.intents[intentName];
      if (intent && intent.slots && intent.slots.length > 0) {
        for (const slot of intent.slots) {
          if (!conversation.slots[slot.name]) {
            // Try to extract from current query
            const entity = extractEntity(lastUserMessage, slot.entityType);
            if (entity) {
              conversation.slots[slot.name] = entity;
            } else {
              conversation.waitingForSlot = slot.name;
              response = slot.prompt;
              break;
            }
          }
        }
      }
    }
    
    // Save assistant response to conversation
    addToConversation(sessionId, { type: 'assistant', text: response });
    
    res.json({ text: response, sessionId });
    
  } catch (error) {
    logger.error('[Pal] Error:', error.message);
    res.status(500).json({ 
      error: 'I encountered a technical hiccup. Please try again in a moment!',
      sessionId: Date.now()
    });
  }
});

// Initialize embedder
initEmbedder();

module.exports = router;
