# 📝 .env File Format Guide

## Exact Format for API Keys

### ✅ CORRECT Format

```env
# Remove the # and add your actual key
OPENAI_API_KEY=sk-proj-abc123xyz789...
ANTHROPIC_API_KEY=sk-ant-abc123xyz789...
GEMINI_API_KEY=AIzaSyAbc123xyz789...
GROQ_API_KEY=gsk_abc123xyz789...
```

**Rules:**
- ✅ No spaces around `=`
- ✅ No quotes around the key
- ✅ One key per line
- ✅ Remove the `#` at the start

### ❌ WRONG Formats

```env
# ❌ Don't use quotes
OPENAI_API_KEY="sk-proj-abc123..."

# ❌ Don't add spaces
OPENAI_API_KEY = sk-proj-abc123...

# ❌ Don't leave the # (this is a comment, not active)
# OPENAI_API_KEY=sk-proj-abc123...

# ❌ Don't add extra text
OPENAI_API_KEY=sk-proj-abc123... # my key
```

## Step-by-Step Example

### Step 1: Get Your API Key

Go to https://platform.openai.com/api-keys and copy your key:
```
sk-proj-1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 2: Open server/.env File

Find this line:
```env
# OPENAI_API_KEY=sk-proj-...your-key-here...
```

### Step 3: Remove # and Replace

Change it to:
```env
OPENAI_API_KEY=sk-proj-1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 4: Save and Restart

```bash
cd server
npm start
```

### Step 5: Verify

You should see:
```
[AI-TC] 🤖 Enabled AI providers: openai (priority 1)
```

## Complete Example

Here's what your `server/.env` file should look like:

```env
SMTP_USER=codebrightlim@gmail.com
SMTP_PASS=gftumrgnwtdbzuct

# AI Providers (add your keys below)
OPENAI_API_KEY=sk-proj-1234567890abcdefghijklmnopqrstuvwxyz
ANTHROPIC_API_KEY=sk-ant-9876543210zyxwvutsrqponmlkjihgfedcba
GEMINI_API_KEY=AIzaSyAbc123xyz789def456ghi789jkl012mno345
GROQ_API_KEY=gsk_abc123xyz789def456ghi789jkl012mno345pqr678
```

## Multiple Providers (Recommended)

Add multiple keys for automatic fallback:

```env
# Primary (tries first)
OPENAI_API_KEY=sk-proj-...

# Fallback 1 (if OpenAI fails)
ANTHROPIC_API_KEY=sk-ant-...

# Fallback 2 (if Anthropic fails)
GEMINI_API_KEY=AIzaSy...

# Fallback 3 (if Gemini fails, FREE!)
GROQ_API_KEY=gsk_...
```

**Result:** If one provider is down or rate-limited, it automatically tries the next one!

## Free Tier Only

Want to use only free providers?

```env
# Free Tier Providers
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIzaSy...
```

**Cost:** $0 (completely free!)

## Testing Your Setup

After adding keys and restarting:

### ✅ Success
```
[AI-TC] 🤖 Enabled AI providers: openai (priority 1), anthropic (priority 2)
Server running on port 5051
```

### ❌ No Keys
```
[AI-TC] ⚠️ No AI providers configured! Set API keys in .env
```
**Fix:** Add at least one API key

### ❌ Invalid Key
```
[AI-TC] Trying openai (1/1)...
[AI-TC] ⚠️ openai failed: Invalid API key
```
**Fix:** Check your API key is correct

## Quick Links

| Provider | Get API Key | Free Tier |
|----------|-------------|-----------|
| **OpenAI** | https://platform.openai.com/api-keys | $5 credit |
| **Anthropic** | https://console.anthropic.com/ | $5 credit |
| **Gemini** | https://makersuite.google.com/app/apikey | 60 req/min |
| **Groq** | https://console.groq.com/ | 30 req/min |

## Common Issues

### Issue: Key not working
**Solution:** 
- Check for extra spaces
- Check for quotes
- Make sure you removed the `#`
- Copy the entire key (they're long!)

### Issue: Server not seeing the key
**Solution:**
- Make sure file is named `.env` (with the dot)
- Make sure file is in `server/` folder
- Restart the server after changes

### Issue: Rate limit
**Solution:**
- Add multiple providers for automatic fallback
- Wait a few minutes
- Upgrade to paid tier

## Summary

**Format:**
```env
PROVIDER_API_KEY=your-actual-key-here
```

**No:**
- ❌ Quotes
- ❌ Spaces around =
- ❌ # at the start
- ❌ Extra text

**Yes:**
- ✅ Plain key
- ✅ No spaces
- ✅ One per line
- ✅ Multiple providers for fallback

That's it! 🎉
