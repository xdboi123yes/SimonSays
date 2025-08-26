import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const { difficulty } = req.query;
    
    let query = supabase
      .from('high_scores')
      .select('id, score, difficulty, created_at, users(username)')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data: highScores, error } = await query;
    
    if (error) {
      return res.status(400).json({ error: 'Failed to fetch leaderboard' });
    }
    
    // Transform the data
    const formattedLeaderboard = highScores.map(entry => ({
      id: entry.id,
      username: entry.users.username,
      score: entry.score,
      difficulty: entry.difficulty,
      createdAt: entry.created_at
    }));
    
    res.json(formattedLeaderboard);
    
  } catch (error) {
    console.error('Fetch leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;