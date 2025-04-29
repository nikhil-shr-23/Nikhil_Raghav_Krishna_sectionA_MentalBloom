const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const sentimentService = require('../services/sentiment');
const intentService = require('../services/intent');
const { RAGService } = require('../services/rag');
const ragService = new RAGService();

/**
 * @route POST /api/chat/message
 * @description Process a chat message through the entire pipeline
 * @access Private
 */
router.post('/message', verifyToken, async (req, res) => {
  try {
    const { message, conversation_id } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`Processing chat message: "${message}"`);
    console.log(`User ID: ${req.user.id}, Conversation ID: ${conversation_id || 'new'}`);

    // Step 1: Call sentiment analysis service
    const sentimentResult = await sentimentService.analyzeSentiment(message);

    // Step 2: Call intent recognition service
    const intentResult = await intentService.recognizeIntent(message);

    // Step 3: Call RAG service with all the data
    const ragResponse = await ragService.processChat({
      user_input: message,
      sentiment: sentimentResult,
      intent: intentResult,
      user_context: {
        user_id: req.user.id,
        conversation_id: conversation_id || null
      }
    });

    // Step 4: Return the final response
    return res.status(200).json({
      response: ragResponse.response || ragResponse.message,
      message: ragResponse.message || ragResponse.response,
      sources: ragResponse.sources || [],
      sentiment: sentimentResult,
      intent: intentResult,
      conversation_id: ragResponse.conversation_id || conversation_id,
      processing_time_ms: ragResponse.processing_time_ms,
      timestamp: ragResponse.timestamp
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
      details: error.message
    });
  }
});

/**
 * @route GET /api/chat/history
 * @description Get chat history for a user
 * @access Private
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    // This would typically call a database or service to get chat history
    // For now, we'll return a placeholder
    return res.status(200).json({
      history: [],
      message: 'Chat history endpoint - to be implemented'
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return res.status(500).json({
      error: 'Failed to get chat history',
      details: error.message
    });
  }
});

/**
 * @route GET /api/chat/resources
 * @description Get relevant resources based on a query
 * @access Private
 */
router.get('/resources', verifyToken, async (req, res) => {
  try {
    const { query, limit } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const k = limit ? parseInt(limit) : 5;

    // Call RAG service to retrieve relevant documents
    const documents = await ragService.retrieveDocuments(query, k);

    return res.status(200).json({
      resources: documents
    });
  } catch (error) {
    console.error('Error retrieving resources:', error);
    return res.status(500).json({
      error: 'Failed to retrieve resources',
      details: error.message
    });
  }
});

module.exports = router;
