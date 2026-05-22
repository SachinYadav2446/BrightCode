const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('./logger');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5051/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      logger.info('[GOOGLE AUTH] User authenticated:', { 
        googleId: profile.id, 
        email: profile.emails[0]?.value,
        name: profile.displayName 
      });
      
      // Return the profile for further processing in the callback route
      return done(null, profile);
    } catch (error) {
      logger.error('[GOOGLE AUTH] Strategy error:', error);
      return done(error, null);
    }
  }
));

// Serialize user (not used for JWT, but required by Passport)
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user (not used for JWT, but required by Passport)
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

module.exports = passport;
