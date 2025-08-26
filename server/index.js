import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import statsRoutes from './routes/stats.js';
import themesRoutes from './routes/themes.js';
import settingsRoutes from './routes/settings.js';
import leaderboardRoutes from './routes/leaderboard.js';
import achievementsRoutes from './routes/achievements.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Create Supabase client
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/themes', themesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/achievements', achievementsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred' 
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});