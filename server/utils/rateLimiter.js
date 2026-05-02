/**
 * Rate Limiter Utility
 * 
 * Implements rate limiting for socket events to prevent abuse and ensure system stability.
 * Uses in-memory Map to track events per user with timestamps.
 * 
 * Task 27.1: Create rate limiter utility
 */

class RateLimiter {
  constructor() {
    // Map structure: userId -> eventType -> [timestamps]
    this.eventTracking = new Map();
    
    // Cleanup interval (every 5 seconds)
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5000);
  }
  
  /**
   * Check if user has exceeded rate limit for a specific event type
   * 
   * @param {string} userId - User identifier
   * @param {string} eventType - Event type (e.g., 'code-change', 'cursor-move')
   * @param {number} maxPerSecond - Maximum events allowed per second
   * @returns {boolean} - true if within limit, false if exceeded
   */
  checkRateLimit(userId, eventType, maxPerSecond) {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Get or create user's event tracking
    if (!this.eventTracking.has(userId)) {
      this.eventTracking.set(userId, new Map());
    }
    
    const userEvents = this.eventTracking.get(userId);
    
    // Get or create event type tracking
    if (!userEvents.has(eventType)) {
      userEvents.set(eventType, []);
    }
    
    const timestamps = userEvents.get(eventType);
    
    // Remove events older than 1 second
    const recentEvents = timestamps.filter(ts => ts > oneSecondAgo);
    userEvents.set(eventType, recentEvents);
    
    // Check if limit exceeded
    if (recentEvents.length >= maxPerSecond) {
      console.log(`[RateLimiter] Rate limit exceeded for user ${userId}, event ${eventType}: ${recentEvents.length}/${maxPerSecond}`);
      return false;
    }
    
    // Add current event timestamp
    recentEvents.push(now);
    
    return true;
  }
  
  /**
   * Clean up old event tracking data
   * Removes users with no recent events (older than 5 minutes)
   */
  cleanup() {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    for (const [userId, userEvents] of this.eventTracking.entries()) {
      let hasRecentEvents = false;
      
      for (const [eventType, timestamps] of userEvents.entries()) {
        // Remove old timestamps
        const recentTimestamps = timestamps.filter(ts => ts > fiveMinutesAgo);
        
        if (recentTimestamps.length > 0) {
          hasRecentEvents = true;
          userEvents.set(eventType, recentTimestamps);
        } else {
          userEvents.delete(eventType);
        }
      }
      
      // Remove user if no recent events
      if (!hasRecentEvents || userEvents.size === 0) {
        this.eventTracking.delete(userId);
      }
    }
    
    console.log(`[RateLimiter] Cleanup complete. Tracking ${this.eventTracking.size} users`);
  }
  
  /**
   * Get current rate limit stats for a user
   * 
   * @param {string} userId - User identifier
   * @returns {Object} - Stats object with event counts
   */
  getStats(userId) {
    if (!this.eventTracking.has(userId)) {
      return {};
    }
    
    const userEvents = this.eventTracking.get(userId);
    const stats = {};
    
    for (const [eventType, timestamps] of userEvents.entries()) {
      stats[eventType] = timestamps.length;
    }
    
    return stats;
  }
  
  /**
   * Reset rate limit for a specific user and event type
   * 
   * @param {string} userId - User identifier
   * @param {string} eventType - Event type (optional, resets all if not provided)
   */
  reset(userId, eventType = null) {
    if (!this.eventTracking.has(userId)) {
      return;
    }
    
    if (eventType) {
      const userEvents = this.eventTracking.get(userId);
      userEvents.delete(eventType);
    } else {
      this.eventTracking.delete(userId);
    }
  }
  
  /**
   * Destroy rate limiter and cleanup interval
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.eventTracking.clear();
  }
}

// Export singleton instance
const rateLimiter = new RateLimiter();

module.exports = rateLimiter;
