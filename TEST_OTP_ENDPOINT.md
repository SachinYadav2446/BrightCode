# Testing OTP Endpoint

## Issue
- "Send Verification Code" button not working
- "[TEST] Skip to OTP Input" button works (UI state is fine)
- OTP email not arriving

## Root Cause
The server needs to be restarted to load the new endpoints we added:
- `/send-password-change-otp`
- `/verify-password-change-otp`
- `/change-password` (updated)

## Solution

### Step 1: Restart the Server
```bash
# Stop the current server (Ctrl+C in the server terminal)
# Then restart:
cd server
node index.js
```

### Step 2: Verify Server Logs
When server starts, you should see:
```
[MAIL] Server is ready to take our messages
Server running on port 5051
```

### Step 3: Test the Button
1. Click "Send Verification Code"
2. Check browser console for:
   - `[DEBUG] Button clicked!`
   - `[DEBUG] Sending OTP request...`
   - `[DEBUG] OTP Response: {success: true, message: "..."}`

3. Check server console for:
   - `[PASSWORD-CHANGE-OTP] Code for email@example.com: 123456`

### Step 4: Check Email
- If SMTP is configured, check your email inbox
- If SMTP fails, the OTP will be printed in the server console

## Quick Test Without Server Restart

If you can't restart the server right now, you can test the UI flow:

1. Click "[TEST] Skip to OTP Input"
2. Enter any 6-digit code (e.g., 123456)
3. Click "Verify Code" (it will fail, but you'll see the UI)
4. The UI should show the password fields

## Console Commands to Check

### Check if server is running:
```bash
curl http://localhost:5051/send-password-change-otp
```

### Check server logs:
Look for these lines in the server terminal:
- `[PASSWORD-CHANGE-OTP] Code for ...`
- `[MAIL] Password change OTP sent to ...`

## Expected Flow

1. User clicks "Send Verification Code"
2. Server generates 6-digit OTP
3. Server prints OTP to console: `[PASSWORD-CHANGE-OTP] Code for user@email.com: 123456`
4. Server sends email (or fails gracefully)
5. UI changes to show OTP input field
6. User enters OTP from email (or from server console)
7. User clicks "Verify Code"
8. UI shows password change fields
9. User enters passwords and saves

## If Button Still Doesn't Work

Check browser console (F12) for errors like:
- `Failed to fetch` - Server not running
- `Network Error` - Wrong port or CORS issue
- `401 Unauthorized` - Token issue
- `404 Not Found` - Endpoint doesn't exist (server not restarted)

## Temporary Workaround

For testing the UI without email:
1. Use "[TEST] Skip to OTP Input" button
2. Check server console for the OTP code
3. Enter the code manually
4. Continue with password change

---

**Next Step**: Restart the server to load the new endpoints!
