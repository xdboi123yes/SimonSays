import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// Get user stats
router.get('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // Get all game records for the user
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('*, themes(name)')
      .eq('user_id', userId);
    
    if (gamesError) {
      return res.status(400).json({ error: 'Failed to fetch game stats' });
    }
    
    // Calculate statistics
    const gamesPlayed = games.length;
    const totalScore = games.reduce((sum, game) => sum + game.score, 0);
    const averageScore = gamesPlayed > 0 ? totalScore / gamesPlayed : 0;
    
    // Calculate max streak (consecutive games with increasing scores)
    let currentStreak = 0;
    let maxStreak = 0;
    
    if (games.length > 0) {
      // Sort games by date
      const sortedGames = [...games].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      for (let i = 1; i < sortedGames.length; i++) {
        if (sortedGames[i].score > sortedGames[i-1].score) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
    }
    
    // Find most used difficulty
    const difficultyCounts = games.reduce((counts, game) => {
      counts[game.difficulty] = (counts[game.difficulty] || 0) + 1;
      return counts;
    }, {});
    
    const mostUsedDifficulty = Object.keys(difficultyCounts).reduce((a, b) => 
      difficultyCounts[a] > difficultyCounts[b] ? a : b, 'easy'
    );
    
    // Find most used theme
    const themeCounts = games.reduce((counts, game) => {
      // Use the theme name if available, otherwise use 'Unknown'
      const themeName = game.themes?.name || 'Default';
      counts[themeName] = (counts[themeName] || 0) + 1;
      return counts;
    }, {});
    
    const mostUsedTheme = Object.keys(themeCounts).length > 0 
      ? Object.keys(themeCounts).reduce((a, b) => themeCounts[a] > themeCounts[b] ? a : b)
      : 'Default';
    
    // Calculate stats per difficulty
    const easyGames = games.filter(game => game.difficulty === 'easy');
    const mediumGames = games.filter(game => game.difficulty === 'medium');
    const hardGames = games.filter(game => game.difficulty === 'hard');
    
    const calculateDifficultySummary = (difficultyGames) => ({
      gamesPlayed: difficultyGames.length,
      highScore: difficultyGames.length > 0 
        ? Math.max(...difficultyGames.map(game => game.score))
        : 0,
      averageScore: difficultyGames.length > 0
        ? difficultyGames.reduce((sum, game) => sum + game.score, 0) / difficultyGames.length
        : 0
    });
    
    const stats = {
      gamesPlayed,
      totalScore,
      averageScore,
      maxStreak,
      mostUsedDifficulty: mostUsedDifficulty.charAt(0).toUpperCase() + mostUsedDifficulty.slice(1),
      mostUsedTheme,
      easySummary: calculateDifficultySummary(easyGames),
      mediumSummary: calculateDifficultySummary(mediumGames),
      hardSummary: calculateDifficultySummary(hardGames)
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save a game result
router.post('/game', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { score, difficulty, themeId } = req.body;
    
    if (score === undefined || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { data: game, error } = await supabase
      .from('games')
      .insert([
        { 
          user_id: userId,
          score,
          difficulty,
          theme_id: themeId
        }
      ])
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to save game' });
    }
    
    res.status(201).json(game);
    
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get high score for a difficulty
router.get('/highscore', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { difficulty } = req.query;
    
    if (!difficulty) {
      return res.status(400).json({ error: 'Difficulty parameter is required' });
    }
    
    const { data: games, error } = await supabase
      .from('games')
      .select('score')
      .eq('user_id', userId)
      .eq('difficulty', difficulty)
      .order('score', { ascending: false })
      .limit(1);
    
    if (error) {
      return res.status(400).json({ error: 'Failed to fetch high score' });
    }
    
    const highScore = games.length > 0 ? games[0].score : 0;
    
    res.json({ highScore });
    
  } catch (error) {
    console.error('Get high score error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save a high score
router.post('/highscore', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { score, difficulty } = req.body;
    
    if (score === undefined || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get current high score
    const { data: currentHighScores, error: fetchError } = await supabase
      .from('high_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('difficulty', difficulty);
    
    if (fetchError) {
      return res.status(400).json({ error: 'Failed to fetch current high score' });
    }
    
    if (currentHighScores.length === 0) {
      // No high score exists, create one
      const { data: newHighScore, error: insertError } = await supabase
        .from('high_scores')
        .insert([
          { 
            user_id: userId,
            score,
            difficulty,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (insertError) {
        return res.status(400).json({ error: 'Failed to save high score' });
      }
      
      res.status(201).json(newHighScore);
    } else {
      // Update existing high score if the new score is higher
      const currentHighScore = currentHighScores[0];
      
      if (score > currentHighScore.score) {
        const { data: updatedHighScore, error: updateError } = await supabase
          .from('high_scores')
          .update({ 
            score,
            created_at: new Date().toISOString()
          })
          .eq('id', currentHighScore.id)
          .select()
          .single();
        
        if (updateError) {
          return res.status(400).json({ error: 'Failed to update high score' });
        }
        
        res.json(updatedHighScore);
      } else {
        res.json(currentHighScore);
      }
    }
    
  } catch (error) {
    console.error('Save high score error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset user stats
router.delete('/reset', async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // Delete all game records
    const { error: gamesError } = await supabase
      .from('games')
      .delete()
      .eq('user_id', userId);
    
    if (gamesError) {
      return res.status(400).json({ error: 'Failed to reset game stats' });
    }
    
    // Delete all high scores
    const { error: highScoresError } = await supabase
      .from('high_scores')
      .delete()
      .eq('user_id', userId);
    
    if (highScoresError) {
      return res.status(400).json({ error: 'Failed to reset high scores' });
    }
    
    res.status(204).send();
    
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;