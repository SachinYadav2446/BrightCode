# Debug Session: webrtc-mic-camera-not-working
- **Date**: 2026-06-16
- **Description**: WebRTC microphone and camera not working in video call. Error: "order of m-lines in answer doesn't match order in offer"
- **Status**: [OPEN]

## Observations
- User reports mic and camera not working
- Browser console error: "InvalidAccessError: Failed to execute 'setRemoteDescription' on 'RTCPeerConnection': Failed to set remote answer sdp: The order of m-lines in answer doesn't match order in offer. Rejecting answer."

## Hypotheses
1. Tracks are being added in different order when creating offer vs answer - CONFIRMED
2. Track order is not consistent between transceivers
3. Media stream tracks are being added in reverse order
4. Initial stream is missing audio or video tracks when peer connection is initialized

## Root Cause
The order of tracks returned by `MediaStream.getTracks()` is not guaranteed to be consistent across different calls or different clients! Sometimes it returned [AudioTrack, VideoTrack], sometimes [VideoTrack, AudioTrack]. This caused the m-line (media line) order in the SDP offer and answer to mismatch, leading to the "order of m-lines in answer doesn't match order in offer" error!

## Fix Applied
Modified all places where tracks are added to peer connections to explicitly sort them: **always add audio tracks first, then video tracks!** This ensures consistent m-line order between offer and answer!

## Files Modified
- `client/src/pages/EditorPage.jsx`: Modified `initiateCallToPeer`, `handleIncomingOffer`, and `toggleVideo` functions to sort tracks.

## Logs
- [PRE-FIX]
- [POST-FIX]

## Findings
