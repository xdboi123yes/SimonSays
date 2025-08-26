import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

// Get all themes for a user
router.get('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    const { data: themes, error } = await supabase
      .from('themes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ error: 'Failed to fetch themes' });
    }
    
    // Transform from snake_case to camelCase
    const formattedThemes = themes.map(theme => ({
      id: theme.id,
      name: theme.name,
      userId: theme.user_id,
      colors: theme.colors,
      tileShape: theme.tile_shape,
      createdAt: theme.created_at
    }));
    
    res.json(formattedThemes);
    
  } catch (error) {
    console.error('Fetch themes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new theme
router.post('/', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { name, colors, tileShape } = req.body;
    
    if (!name || !colors || !tileShape) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!Array.isArray(colors) || colors.length !== 9) {
      return res.status(400).json({ error: 'Colors must be an array of 9 color values' });
    }
    
    const { data: theme, error } = await supabase
      .from('themes')
      .insert([
        { 
          user_id: userId,
          name,
          colors,
          tile_shape: tileShape
        }
      ])
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to create theme' });
    }
    
    // Transform from snake_case to camelCase
    const formattedTheme = {
      id: theme.id,
      name: theme.name,
      userId: theme.user_id,
      colors: theme.colors,
      tileShape: theme.tile_shape,
      createdAt: theme.created_at
    };
    
    res.status(201).json(formattedTheme);
    
  } catch (error) {
    console.error('Create theme error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a theme
router.put('/:id', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id: themeId } = req.params;
    const { name, colors, tileShape } = req.body;
    
    // Verify the theme belongs to the user
    const { data: existingTheme, error: fetchError } = await supabase
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();
    
    if (fetchError || !existingTheme) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    if (existingTheme.user_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this theme' });
    }
    
    // Update the theme
    const { data: updatedTheme, error: updateError } = await supabase
      .from('themes')
      .update({
        name: name || existingTheme.name,
        colors: colors || existingTheme.colors,
        tile_shape: tileShape || existingTheme.tile_shape
      })
      .eq('id', themeId)
      .select()
      .single();
    
    if (updateError) {
      return res.status(400).json({ error: 'Failed to update theme' });
    }
    
    // Transform from snake_case to camelCase
    const formattedTheme = {
      id: updatedTheme.id,
      name: updatedTheme.name,
      userId: updatedTheme.user_id,
      colors: updatedTheme.colors,
      tileShape: updatedTheme.tile_shape,
      createdAt: updatedTheme.created_at
    };
    
    res.json(formattedTheme);
    
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a theme
router.delete('/:id', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { id: themeId } = req.params;
    
    // Verify the theme belongs to the user
    const { data: existingTheme, error: fetchError } = await supabase
      .from('themes')
      .select('*')
      .eq('id', themeId)
      .single();
    
    if (fetchError || !existingTheme) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    if (existingTheme.user_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this theme' });
    }
    
    // Delete the theme
    const { error: deleteError } = await supabase
      .from('themes')
      .delete()
      .eq('id', themeId);
    
    if (deleteError) {
      return res.status(400).json({ error: 'Failed to delete theme' });
    }
    
    res.status(204).send();
    
  } catch (error) {
    console.error('Delete theme error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;