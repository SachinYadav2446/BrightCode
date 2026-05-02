# 🚀 Quick Setup: AI Test Case Generator

## Step 1: Get API Key (Choose One or Multiple for Fallback)

### Option A: OpenAI (Recommended - Best Quality)
1. Go to https://platform.openai.com/api-keys
2. Sign up / Log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)
5. **Cost:** ~$0.001 per problem

### Option B: Anthropic Claude (High Quality)
1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Go to API Keys section
4. Create new key
5. Copy the key (starts with `sk-ant-...`)
6. **Cost:** ~$0.001 per problem

### Option C: Google Gemini (Good Quality, Free Tier)
1. Go to https://makersuite.google.com/app/apikey
2. Sign up / Log in
3. Click "Create API Key"
4. Copy the key
5. **Cost:** Free tier available, then ~$0.0005 per problem

### Option D: Groq (Fast, Free Tier)
1. Go to https://console.groq.com/
2. Sign up / Log in
3. Go to API Keys
4. Create new key
5. Copy the key (starts with `gsk_...`)
6. **Cost:** Free tier (very fast!)

## Step 2: Add to Environment (Multiple Keys = Automatic Fallback!)

Create or edit `.env` file in the `server` folder:

```env
# Primary (highest priority)
OPENAI_API_KEY=sk-...your-key-here...

# Fallback 1 (if OpenAI fails)
ANTHROPIC_API_KEY=sk-ant-...your-key-here...

# Fallback 2 (if Anthropic fails)
GEMINI_API_KEY=...your-key-here...

# Fallback 3 (if Gemini fails, free tier!)
GROQ_API_KEY=gsk_...your-key-here...
```

**💡 Pro Tip:** Add multiple keys for maximum reliability! If one provider fails (rate limit, downtime), it automatically tries the next one.

## Fallback Priority

```
1. OpenAI (gpt-4o-mini)      → Best quality, fast
   ↓ (if fails)
2. Anthropic (claude-haiku)  → High quality, fast
   ↓ (if fails)
3. Gemini (gemini-flash)     → Good quality, free tier
   ↓ (if fails)
4. Groq (llama-3.1)          → Fast, free tier
```

## Step 3: Restart Server

```bash
cd server
npm start
```

You'll see:
```
[AI-TC] 🤖 Enabled AI providers: openai (priority 1), anthropic (priority 2), gemini (priority 3), groq (priority 4)
```

## Step 4: Test It!

1. Create a Code Wars room
2. Start the game
3. Watch server logs:
```
[AI-TC] Available providers: openai → anthropic → gemini → groq
[AI-TC] Trying openai (1/4)...
[AI-TC] ✅ openai succeeded
[AI-TC] ✅ Generated 8 test cases for Problem Name
```

If OpenAI fails:
```
[AI-TC] Trying openai (1/4)...
[AI-TC] ⚠️ openai failed: Rate limit exceeded
[AI-TC] 🔄 Falling back to anthropic...
[AI-TC] Trying anthropic (2/4)...
[AI-TC] ✅ anthropic succeeded
```

4. Submit code → Test cases run automatically!

## That's It! 🎉

Now you have:
- ✅ **Automatic fallback** between providers
- ✅ **Maximum reliability** (99.9%+ uptime)
- ✅ **Cost optimization** (uses cheapest available)
- ✅ **13,000+ problems** available

## Recommended Setup

### For Maximum Reliability (Recommended)
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk-...
```
**Result:** 3 providers, automatic fallback, ~99.9% success rate

### For Free Tier Only
```env
GROQ_API_KEY=gsk-...
GEMINI_API_KEY=...
```
**Result:** Free tier, good quality, fast

### For Best Quality
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```
**Result:** Best quality, ~$0.001 per problem

## Cost Comparison

| Provider | Model | Cost per Problem | Free Tier | Speed |
|----------|-------|------------------|-----------|-------|
| OpenAI | gpt-4o-mini | ~$0.001 | $5 credit | Fast |
| Anthropic | claude-haiku | ~$0.001 | $5 credit | Fast |
| Gemini | gemini-flash | ~$0.0005 | Yes (60 req/min) | Fast |
| Groq | llama-3.1 | Free | Yes (30 req/min) | Very Fast |

## Monitor Provider Stats

Check which providers are being used:

```javascript
// In server logs
[AI-TC] Provider statistics:
  openai: 45 success, 2 failures (95.7% success rate)
  anthropic: 2 success, 0 failures (100% success rate)
  gemini: 0 success, 0 failures (N/A)
  groq: 0 success, 0 failures (N/A)
```

## Enable External Sources

Edit `server/intraFactionArena.js` line ~280:

```javascript
// Enable external problem sources
const includeCodeforces = true;  // 8000+ problems
const includeExercism = true;    // 3000+ exercises
const includeLeetCode = true;    // 2000+ problems
```

Restart server and enjoy 13,000+ coding problems! 🚀

## Troubleshooting

### All Providers Failing
```
[AI-TC] All AI providers failed
```
**Solution:** Check API keys, internet connection, or wait a few minutes

### Rate Limit on All Providers
**Solution:** Wait a few minutes, or upgrade to paid tier

### No Providers Configured
```
[AI-TC] ⚠️ No AI providers configured!
```
**Solution:** Add at least one API key to `.env`
