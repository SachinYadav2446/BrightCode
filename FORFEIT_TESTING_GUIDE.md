# CodeWars Forfeit System - Testing Guide

## Quick Test Steps

### Test 1: Forfeit During Active Game (Main Fix)
This is the scenario that was broken and is now fixed.

1. **Setup**:
   - Open two browser windows/tabs
   - Log in with two different accounts
   - Both accounts should be in the same faction

2. **Create Contest**:
   - In Window 1: Create a new contest
   - Settings: 2 teams, 1 player per team
   - Start the contest

3. **Join Contest**:
   - In Window 2: Join the same contest
   - Both players should now be in the game

4. **Start Game**:
   - Click "Start Game" (if you're the host)
   - Both players should see the game screen with questions

5. **Test Forfeit**:
   - In Window 1: Click "Leave Contest" button
   - **Expected Result for Window 1**: Should see Results page with forfeit message
   - **Expected Result for Window 2**: Should see Results page showing they won by forfeit
   - Both windows should show the final rankings with forfeit indicator

6. **Verify**:
   - ✅ Window 1 shows "Match Ended" with forfeit message
   - ✅ Window 2 shows "Victory by Forfeit!"
   - ✅ Results show which team forfeited
   - ✅ Both players can click "Back to Menu" to return

### Test 2: Normal Leave (Before Game Starts)
This should work as before.

1. **Setup**:
   - Create a new contest
   - Don't start the game yet

2. **Test Leave**:
   - Click "Leave Room" button
   - **Expected Result**: Should go to menu page
   - **Expected Result**: Toast message "Left room" appears

3. **Verify**:
   - ✅ Navigates to menu page
   - ✅ Toast message appears
   - ✅ Room list updates

### Test 3: Multi-Team Contest
This scenario should continue to work (team leaves but game continues).

1. **Setup**:
   - Create a contest with 3+ teams
   - Have players join all teams
   - Start the game

2. **Test Leave**:
   - Have one team leave during the game
   - **Expected Result**: Leaving team goes to menu
   - **Expected Result**: Other teams continue playing
   - **Expected Result**: Toast notification about team leaving

3. **Verify**:
   - ✅ Leaving team goes to menu (not results)
   - ✅ Remaining teams can continue playing
   - ✅ Game ends normally when time runs out or all finish

## Console Logs to Check

### When Forfeit Happens (Window 1 - Leaving Player)
```
🚪 Leaving room via socket...
🚪 Current room: <roomId>
🚪 Current game state: game
🚪 Leave room event emitted, waiting for server response...
🏁 Game ended event received: <data>
🏁 Reason: forfeit
🏁 Game state set to results, showing results page
```

### Server Logs (Check terminal running server)
```
🚪 [CW Socket] User <username> leaving room <roomId>
📊 [CW Socket] Before leave - Total teams: 2, Teams with players: 2, Game in progress: true
🏆 [CW Socket] Team <name> forfeiting. Team <name> wins!
📤 [CW Socket] Sending game-ended event to all players in room <roomId>
📤 [CW Socket] NOT sending cw-left-room - client will handle navigation from results page
✅ [CW Socket] Forfeit handled, player removed from room, returning early
```

### When Forfeit Happens (Window 2 - Winning Player)
```
🏁 Game ended event received: <data>
🏁 Reason: forfeit
🏁 Game state set to results, showing results page
```

## Common Issues to Watch For

### Issue: Player goes to menu instead of results
- **Check**: Server logs - is `cw-game-ended` being sent?
- **Check**: Client logs - is `cw-game-ended` being received?
- **Check**: Is `processingGameEndRef.current` being set to true?

### Issue: Both events fire and cause conflict
- **Check**: Server should NOT send `cw-left-room` during forfeit
- **Check**: Client should ignore `cw-left-room` if `processingGameEndRef.current` is true

### Issue: Results page doesn't show forfeit message
- **Check**: `data.reason` should be 'forfeit'
- **Check**: `data.results.forfeitedTeam` should contain team name

## Quick Debug Commands

### Check if server is running
```bash
curl http://localhost:5051/api/health
```

### Check browser console
Press F12 and look for the emoji logs (🚪, 🏁, 📊, etc.)

### Check network tab
Look for socket events: `cw-leave-room`, `cw-game-ended`, `cw-left-room`

## Success Criteria

✅ Leaving player sees results page with forfeit message  
✅ Winning player sees results page with victory message  
✅ No navigation to menu page during forfeit  
✅ Both players can return to menu from results page  
✅ Normal leave (before game) still works  
✅ Multi-team contests handle leaves correctly  

## If Tests Fail

1. Check server is running on port 5051
2. Check client is running on port 5173
3. Clear browser cache and reload
4. Check console logs for errors
5. Verify both accounts are in the same faction
6. Make sure game is actually started (status: 'in-progress')
