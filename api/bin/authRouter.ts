// authRouter.ts
import { Hono } from 'hono';
import passport from './auth'; // Import the Passport configuration

const authRouter = new Hono();

// Define route for initiating Google OAuth authentication
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Define route for handling Google OAuth callback
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (c) => {
  // Successful authentication, redirect to the home page or wherever you want
  return c.redirect('/');
});

export default authRouter;
