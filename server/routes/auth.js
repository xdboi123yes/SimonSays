import express from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../index.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { supabaseToken, username, email } = req.body;
    
    if (!supabaseToken || !username || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Verify the Supabase token
    const { data: authData, error: authError } = await supabase.auth.getUser(supabaseToken);
    
    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    if (!authData?.user) {
      return res.status(401).json({ error: 'No user data found in token' });
    }
    
    // Create a user record in our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id,
          username,
          email
        }
      ])
      .select()
      .single();
    
    if (userError) {
      console.error('Database error during user creation:', userError);
      if (userError.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Username is already taken' });
      }
      return res.status(400).json({ error: 'Failed to create user account' });
    }
    
    // Generate a JWT token
    try {
      const token = jwt.sign(
        { 
          id: userData.id,
          username: userData.username,
          email: userData.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        token,
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email
        }
      });
    } catch (jwtError) {
      console.error('JWT signing error:', jwtError);
      return res.status(500).json({ error: 'Failed to generate authentication token' });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during registration' });
  }
});

// Login an existing user
router.post('/login', async (req, res) => {
  try {
    const { supabaseToken } = req.body;
    
    if (!supabaseToken) {
      return res.status(400).json({ error: 'Missing authentication token' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Verify the Supabase token
    const { data: authData, error: authError } = await supabase.auth.getUser(supabaseToken);
    
    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    if (!authData?.user) {
      return res.status(401).json({ error: 'No user data found in token' });
    }
    
    // Get the user record from our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      console.error('Database error during login:', userError);
      return res.status(500).json({ error: 'Failed to retrieve user data' });
    }

    if (!userData) {
      return res.status(404).json({ error: 'User account not found' });
    }
    
    // Generate a JWT token
    try {
      const token = jwt.sign(
        { 
          id: userData.id,
          username: userData.username,
          email: userData.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        token,
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email
        }
      });
    } catch (jwtError) {
      console.error('JWT signing error:', jwtError);
      return res.status(500).json({ error: 'Failed to generate authentication token' });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during login' });
  }
});

// Get current user
router.get('/user', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Authentication token has expired' });
        }
        return res.status(403).json({ error: 'Invalid authentication token' });
      }
      
      // Get the most up-to-date user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', decodedToken.id)
        .single();
      
      if (userError) {
        console.error('Database error:', userError);
        return res.status(500).json({ error: 'Failed to retrieve user data' });
      }

      if (!userData) {
        return res.status(404).json({ error: 'User account not found' });
      }
      
      res.json({
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email
        }
      });
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'An unexpected error occurred while retrieving user data' });
  }
});

// Update user
router.put('/user', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Authentication token has expired' });
        }
        return res.status(403).json({ error: 'Invalid authentication token' });
      }
      
      const { username, email } = req.body;
      
      // Prepare update data
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      
      // Update the user record
      const { data: userData, error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', decodedToken.id)
        .select()
        .single();
      
      if (userError) {
        console.error('Database error during update:', userError);
        if (userError.code === '23505') { // Unique violation
          return res.status(400).json({ error: 'Username is already taken' });
        }
        return res.status(400).json({ error: 'Failed to update user data' });
      }
      
      // Generate a new JWT token with updated info
      try {
        const newToken = jwt.sign(
          { 
            id: userData.id,
            username: userData.username,
            email: userData.email
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        res.json({
          token: newToken,
          user: {
            id: userData.id,
            username: userData.username,
            email: userData.email
          }
        });
      } catch (jwtError) {
        console.error('JWT signing error:', jwtError);
        return res.status(500).json({ error: 'Failed to generate authentication token' });
      }
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'An unexpected error occurred while updating user data' });
  }
});

export default router;