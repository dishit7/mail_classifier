import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import { Env } from '../env';

passport.use(
  new GoogleStrategy(
    {
      clientID:  Env.GOOGLE_CLIENT_ID,
      clientSecret: Env.GOOGLE_CLIENT_SECRET,
      callbackURL:  Env.GOOGLE_REDIRECT_URI
    },
    (accessToken, refreshToken, profile, done) => {
      // Handle user authentication here (e.g., save user info to database)
      // You can use async/await or other methods to find or create the user
      // For example:
      // const user = await User.findOrCreate({ googleId: profile.id });
      // return done(null, user);
      User.findOrCreate({ googleId: profile.id }, (err, user) => {
        return done(err, user);
      });
    }
  )
);
