import express from 'express';
import { supabase } from '../index.js';

const router = express.Router();

const DEFAULT_SOUND_SETTINGS = {
  sfxEnabled: true,
  musicEnabled: true
};

const DEFAULT_CONTROL_SETTINGS = {
  keyboardEnabled: true,
  touchVibration: true,
  autoZoom: true
};

// Get sound settings
router.get('/sound', async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // First try to fetch existing settings
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('settings')
      .eq('user_id', userId)
      .eq('category', 'sound')
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      return res.status(400).json({ error: 'Failed to fetch sound settings' });
    }
    
    if (!existingSettings) {
      // If no settings exist, create default settings
      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert({
          user_id: userId,
          category: 'sound',
          settings: DEFAULT_SOUND_SETTINGS
        })
        .select('settings')
        .single();
      
      if (insertError) {
        return res.status(400).json({ error: 'Failed to create default sound settings' });
      }
      
      return res.json(DEFAULT_SOUND_SETTINGS);
    }
    
    res.json(existingSettings.settings);
    
  } catch (error) {
    console.error('Fetch sound settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save sound settings
router.post('/sound', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const settings = req.body;
    
    if (!settings) {
      return res.status(400).json({ error: 'Missing settings' });
    }
    
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        category: 'sound',
        settings
      }, {
        onConflict: 'user_id,category'
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to save sound settings' });
    }
    
    res.json(data.settings);
    
  } catch (error) {
    console.error('Save sound settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get control settings
router.get('/controls', async (req, res) => {
  try {
    const { id: userId } = req.user;
    
    // First try to fetch existing settings
    const { data: existingSettings, error: fetchError } = await supabase
      .from('settings')
      .select('settings')
      .eq('user_id', userId)
      .eq('category', 'controls')
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      return res.status(400).json({ error: 'Failed to fetch control settings' });
    }
    
    if (!existingSettings) {
      // If no settings exist, create default settings
      const { data: newSettings, error: insertError } = await supabase
        .from('settings')
        .insert({
          user_id: userId,
          category: 'controls',
          settings: DEFAULT_CONTROL_SETTINGS
        })
        .select('settings')
        .single();
      
      if (insertError) {
        return res.status(400).json({ error: 'Failed to create default control settings' });
      }
      
      return res.json(DEFAULT_CONTROL_SETTINGS);
    }
    
    res.json(existingSettings.settings);
    
  } catch (error) {
    console.error('Fetch control settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save control settings
router.post('/controls', async (req, res) => {
  try {
    const { id: userId } = req.user;
    const settings = req.body;
    
    if (!settings) {
      return res.status(400).json({ error: 'Missing settings' });
    }
    
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        category: 'controls',
        settings
      }, {
        onConflict: 'user_id,category'
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: 'Failed to save control settings' });
    }
    
    res.json(data.settings);
    
  } catch (error) {
    console.error('Save control settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;