import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// Get user achievements
router.get('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      return res.status(400).json({ error: 'Failed to fetch achievements' });
    }
    
    // Transform from snake_case to camelCase
    const formattedAchievements = achievements.map(achievement => ({
      id: achievement.achievement_id,
      name: achievement.name,
      description: achievement.description,
      earnedAt: achievement.earned_at
    }));
    
    res.json(formattedAchievements);
    
  } catch (error) {
    console.error('Fetch achievements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save achievements
router.post('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { achievements } = req.body;
    
    if (!achievements || !Array.isArray(achievements)) {
      return res.status(400).json({ error: 'Missing or invalid achievements' });
    }
    
    // Define achievement details
    const achievementDetails = {
      'sharp-starter': {
        name: 'Sharp Starter',
        description: 'Reach a score of 5 points in a single game'
      },
      'memory-master': {
        name: 'Memory Master',
        description: 'Reach a score of 10 points in a single game'
      },
      'reflex-lord': {
        name: 'Reflex Lord',
        description: 'Reach a score of 15 points in a single game'
      },
      'simon-slayer': {
        name: 'Simon Slayer',
        description: 'Reach a score of 20 points in a single game'
      }
    };
    
    // Insert each achievement
    const achievementsToInsert = achievements.map(achievementId => ({
      user_id: userId,
      achievement_id: achievementId,
      name: achievementDetails[achievementId]?.name || 'Unknown Achievement',
      description: achievementDetails[achievementId]?.description || '',
      earned_at: new Date().toISOString()
    }));
    
    const { data: insertedAchievements, error } = await supabase
      .from('achievements')
      .insert(achievementsToInsert)
      .select();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to save achievements' });
    }
    
    // Transform from snake_case to camelCase
    const formattedAchievements = insertedAchievements.map(achievement => ({
      id: achievement.achievement_id,
      name: achievement.name,
      description: achievement.description,
      earnedAt: achievement.earned_at
    }));
    
    res.status(201).json(formattedAchievements);
    
  } catch (error) {
    console.error('Save achievements error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;