const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { RAGService } = require('../services/rag');
const logger = require('../utils/logger');

// Create a new journal entry
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { title, content, mood, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Create journal entry request
    const journalEntry = {
      user_id: userId,
      title,
      content,
      mood,
      tags: tags || []
    };

    // Send to RAG service
    const ragService = new RAGService();
    const response = await ragService.createJournalEntry(journalEntry);

    res.status(201).json(response);
  } catch (error) {
    logger.error(`Error creating journal entry: ${error.message}`);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// List journal entries
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const tag = req.query.tag;
    const mood = req.query.mood;

    // Send to RAG service
    const ragService = new RAGService();
    const response = await ragService.getJournalEntries(userId, page, pageSize, tag, mood);

    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error listing journal entries: ${error.message}`);
    res.status(500).json({ error: 'Failed to list journal entries' });
  }
});

// Search journal entries
router.get('/search', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const query = req.query.q;
    const limit = parseInt(req.query.limit) || 5;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Send to RAG service
    const ragService = new RAGService();
    const results = await ragService.searchJournalEntries(userId, query, limit);

    res.status(200).json(results);
  } catch (error) {
    logger.error(`Error searching journal entries: ${error.message}`);
    res.status(500).json({ error: 'Failed to search journal entries' });
  }
});

// Get a specific journal entry
router.get('/:entryId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const entryId = req.params.entryId;

    // Send to RAG service
    const ragService = new RAGService();
    const response = await ragService.getJournalEntry(userId, entryId);

    if (!response) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error getting journal entry: ${error.message}`);
    res.status(500).json({ error: 'Failed to get journal entry' });
  }
});

// Update a journal entry
router.put('/:entryId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const entryId = req.params.entryId;
    const updates = req.body;

    // Send to RAG service
    const ragService = new RAGService();
    const response = await ragService.updateJournalEntry(userId, entryId, updates);

    if (!response) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error updating journal entry: ${error.message}`);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// Delete a journal entry
router.delete('/:entryId', verifyToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const entryId = req.params.entryId;

    // Send to RAG service
    const ragService = new RAGService();
    const success = await ragService.deleteJournalEntry(userId, entryId);

    if (!success) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.status(200).json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting journal entry: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});



module.exports = router;
