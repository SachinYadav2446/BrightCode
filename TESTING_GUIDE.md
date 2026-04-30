# Testing Guide - Sidebar Navigation & Chat

## Quick Test Checklist

### 1. Navigation Flow Test
- [ ] Open a workspace
- [ ] Verify Files view is shown by default
- [ ] Verify only right arrow (→) is visible
- [ ] Click right arrow
- [ ] Verify Collaborators view appears
- [ ] Verify both arrows (← and →) are visible
- [ ] Click right arrow again
- [ ] Verify Chat view appears
- [ ] Verify only left arrow (←) is visible
- [ ] Click left arrow
- [ ] Verify returns to Collaborators
- [ ] Click left arrow again
- [ ] Verify returns to Files

### 2. Chat Functionality Test
- [ ] Navigate to Chat view
- [ ] Verify empty state shows when no messages
- [ ] Type a message in the input field
- [ ] Press Enter key
- [ ] Verify message appears in chat
- [ ] Verify message shows your username
- [ ] Verify timestamp is displayed
- [ ] Verify your message has red accent styling
- [ ] Type another message
- [ ] Click Send button instead of Enter
- [ ] Verify message sends correctly

### 3. Multi-User Chat Test
- [ ] Open workspace in two different browsers/tabs
- [ ] Login as different users in each
- [ ] Navigate to Chat in both
- [ ] Send message from User 1
- [ ] Verify message appears in User 2's chat
- [ ] Send message from User 2
- [ ] Verify message appears in User 1's chat
- [ ] Verify messages show correct usernames
- [ ] Verify timestamps are accurate
- [ ] Verify own messages are highlighted differently

### 4. UI/UX Test
- [ ] Hover over navigation arrows
- [ ] Verify red accent color appears on hover
- [ ] Verify scale animation on hover
- [ ] Click arrow button
- [ ] Verify smooth transition between views
- [ ] Verify header title updates correctly
- [ ] Verify arrow buttons appear/disappear correctly
- [ ] Test on different screen sizes
- [ ] Verify responsive behavior

### 5. Edge Cases Test
- [ ] Try sending empty message
- [ ] Verify empty messages are not sent
- [ ] Try sending message with only spaces
- [ ] Verify whitespace-only messages are not sent
- [ ] Navigate away from Chat and back
- [ ] Verify message history is preserved
- [ ] Refresh the page
- [ ] Verify navigation resets to Files view
- [ ] Test with special characters in messages
- [ ] Verify special characters display correctly

### 6. Collaborators View Test
- [ ] Navigate to Collaborators view
- [ ] Verify all connected users are listed
- [ ] Verify online status indicator (green dot)
- [ ] Verify workspace owner has "OWNER" tag
- [ ] Have a user leave the workspace
- [ ] Verify user is removed from list
- [ ] Have a new user join
- [ ] Verify new user appears in list

### 7. Integration Test
- [ ] Create a new file in Files view
- [ ] Navigate to Chat
- [ ] Send message about the new file
- [ ] Navigate back to Files
- [ ] Verify file is still there
- [ ] Navigate to Collaborators
- [ ] Verify all users still listed
- [ ] Navigate to Chat
- [ ] Verify message history preserved

## Expected Behavior

### Navigation
- **Files → Collaborators**: Right arrow visible, smooth transition
- **Collaborators → Chat**: Both arrows visible, smooth transition
- **Chat → Collaborators**: Left arrow visible, smooth transition
- **Collaborators → Files**: Left arrow visible, smooth transition

### Chat Messages
- **Send**: Message appears immediately for sender
- **Receive**: Message appears in real-time for all users
- **Display**: Username, timestamp, and message content
- **Styling**: Own messages have red accent border

### Arrow Buttons
- **Hover**: Red accent color, slight scale increase
- **Click**: Scale down animation, view transition
- **Visibility**: Only show when navigation is possible

## Common Issues & Solutions

### Issue: Messages not appearing
**Solution**: Check Socket.io connection, verify server is running

### Issue: Arrow buttons not working
**Solution**: Check console for errors, verify state updates

### Issue: Chat not scrolling to latest message
**Solution**: Verify `chatEndRef` is properly attached

### Issue: Timestamps showing wrong time
**Solution**: Check timezone settings, verify Date object creation

### Issue: Own messages not highlighted
**Solution**: Verify username comparison logic

## Performance Checks

- [ ] Navigation transitions are smooth (no lag)
- [ ] Chat messages appear instantly
- [ ] No memory leaks when switching views
- [ ] Scroll performance is smooth
- [ ] No console errors or warnings

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Checks

- [ ] Arrow buttons have proper title attributes
- [ ] Chat input has placeholder text
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader compatibility
- [ ] Color contrast meets standards

## Success Criteria

✅ All navigation flows work smoothly
✅ Chat messages send and receive in real-time
✅ UI is responsive and intuitive
✅ No console errors
✅ Multi-user functionality works correctly
✅ Edge cases are handled gracefully
✅ Performance is optimal
✅ Accessibility standards are met

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and version
5. Console errors (if any)
6. Screenshots/video (if applicable)
