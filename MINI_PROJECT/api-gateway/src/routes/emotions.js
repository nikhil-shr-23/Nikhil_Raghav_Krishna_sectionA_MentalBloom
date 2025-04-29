const express = require('express');
const router = express.Router();
const axios = require('axios');

// RAG service URL
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://172.18.0.7:8002';

// Create a new emotion entry
router.post('/', function(req, res) {
  const { emotion, intensity, notes, user_id } = req.body;

  // Validate input
  if (!emotion || !intensity || !user_id) {
    return res.status(400).json({ error: 'Emotion, intensity, and user_id are required' });
  }

  // Forward request to RAG service
  axios.post(
    `${RAG_SERVICE_URL}/emotions`,
    { emotion, intensity, notes },
    {
      params: { user_id },
      headers: { 'Content-Type': 'application/json' }
    }
  )
  .then(response => {
    return res.status(201).json(response.data);
  })
  .catch(error => {
    console.error('Error creating emotion entry:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: 'Failed to create emotion entry' });
  });
});

// Get emotion entries for a user
router.get('/', function(req, res) {
  const { user_id, limit } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  // Forward request to RAG service
  axios.get(
    `${RAG_SERVICE_URL}/emotions`,
    {
      params: {
        user_id,
        limit: limit || 100
      }
    }
  )
  .then(response => {
    return res.json(response.data);
  })
  .catch(error => {
    console.error('Error getting emotion entries:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: 'Failed to get emotion entries' });
  });
});

// Get emotion statistics
router.get('/stats', function(req, res) {
  const { user_id, days } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id is required' });
  }

  // Forward request to RAG service
  axios.get(
    `${RAG_SERVICE_URL}/emotions/stats`,
    {
      params: {
        user_id,
        days: days || 30
      }
    }
  )
  .then(response => {
    return res.json(response.data);
  })
  .catch(error => {
    console.error('Error getting emotion statistics:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: 'Failed to get emotion statistics' });
  });
});

// Get emotions by type
router.get('/by-type', function(req, res) {
  const { user_id, emotion_type } = req.query;

  if (!user_id || !emotion_type) {
    return res.status(400).json({ error: 'user_id and emotion_type are required' });
  }

  // Forward request to RAG service
  axios.get(
    `${RAG_SERVICE_URL}/emotions/by-type`,
    {
      params: {
        user_id,
        emotion_type
      }
    }
  )
  .then(response => {
    return res.json(response.data);
  })
  .catch(error => {
    console.error('Error getting emotions by type:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ error: 'Failed to get emotions by type' });
  });
});

module.exports = router;
