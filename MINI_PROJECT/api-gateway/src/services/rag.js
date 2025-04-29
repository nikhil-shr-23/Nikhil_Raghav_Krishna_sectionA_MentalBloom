const axios = require('axios');

/**
 * Service to interact with the RAG microservice
 */
class RagService {
  constructor() {
    this.baseUrl = process.env.RAG_SERVICE_URL || 'http://rag-service:8002';
  }

  /**
   * Process a chat request with the RAG service
   * @param {Object} data - The chat request data
   * @param {string} data.user_input - The user's message
   * @param {Object} data.sentiment - The sentiment analysis result
   * @param {Object} data.intent - The intent recognition result
   * @param {Object} data.user_context - Optional user context information
   * @returns {Promise<Object>} - The RAG service response
   */
  async processChat(data) {
    try {
      // Convert the data to the format expected by the RAG service
      const chatRequest = {
        messages: [
          {
            role: 'user',
            content: data.user_input
          }
        ],
        user_id: data.user_context?.user_id,
        conversation_id: data.user_context?.conversation_id,
        include_sources: true
      };

      console.log(`Calling RAG service at ${this.baseUrl}/chat`);
      console.log('RAG service request:', JSON.stringify(chatRequest, null, 2));

      const response = await axios.post(
        `${this.baseUrl}/chat`,
        chatRequest,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('RAG service response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error processing chat with RAG service:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }

      // Return a default response instead of throwing an error
      console.log('Using default RAG response');
      return {
        message: "I'm here to listen and support you. How can I help you today?",
        response: "I'm here to listen and support you. How can I help you today?",
        sources: [],
        processing_time_ms: 0,
        timestamp: new Date().toISOString(),
        conversation_id: data.user_context?.conversation_id
      };
    }
  }

  /**
   * Retrieve relevant documents from the RAG service
   * @param {string} query - The search query
   * @param {number} k - The number of documents to retrieve
   * @returns {Promise<Array>} - The retrieved documents
   */
  async retrieveDocuments(query, k = 5) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/retrieve`,
        {
          params: { query, k },
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error retrieving documents from RAG service:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to retrieve documents from RAG service');
    }
  }
  /**
   * Create a new journal entry
   * @param {Object} journalEntry - The journal entry data
   * @returns {Promise<Object>} - The created journal entry
   */
  async createJournalEntry(journalEntry) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/journal`,
        journalEntry,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000 // 10 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating journal entry:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to create journal entry');
    }
  }

  /**
   * Get a journal entry by ID
   * @param {string} userId - The user ID
   * @param {string} entryId - The journal entry ID
   * @returns {Promise<Object>} - The journal entry
   */
  async getJournalEntry(userId, entryId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/journal/${userId}/${entryId}`,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000 // 5 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting journal entry:', error.message);
      if (error.response && error.response.status === 404) {
        return null;
      }
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to get journal entry');
    }
  }

  /**
   * Get journal entries for a user
   * @param {string} userId - The user ID
   * @param {number} page - The page number
   * @param {number} pageSize - The page size
   * @param {string} tag - Optional tag filter
   * @param {string} mood - Optional mood filter
   * @returns {Promise<Object>} - The journal entries
   */
  async getJournalEntries(userId, page = 1, pageSize = 10, tag = null, mood = null) {
    try {
      const params = { page, page_size: pageSize };
      if (tag) params.tag = tag;
      if (mood) params.mood = mood;

      const response = await axios.get(
        `${this.baseUrl}/journal/${userId}`,
        {
          params,
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000 // 5 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting journal entries:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to get journal entries');
    }
  }

  /**
   * Update a journal entry
   * @param {string} userId - The user ID
   * @param {string} entryId - The journal entry ID
   * @param {Object} updates - The updates to apply
   * @returns {Promise<Object>} - The updated journal entry
   */
  async updateJournalEntry(userId, entryId, updates) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/journal/${userId}/${entryId}`,
        updates,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000 // 5 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating journal entry:', error.message);
      if (error.response && error.response.status === 404) {
        return null;
      }
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to update journal entry');
    }
  }

  /**
   * Delete a journal entry
   * @param {string} userId - The user ID
   * @param {string} entryId - The journal entry ID
   * @returns {Promise<boolean>} - Whether the deletion was successful
   */
  async deleteJournalEntry(userId, entryId) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/journal/${userId}/${entryId}`,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000 // 5 second timeout
        }
      );
      return true;
    } catch (error) {
      console.error('Error deleting journal entry:', error.message);
      if (error.response && error.response.status === 404) {
        return false;
      }
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to delete journal entry');
    }
  }

  /**
   * Search journal entries
   * @param {string} userId - The user ID
   * @param {string} query - The search query
   * @param {number} limit - The maximum number of results
   * @returns {Promise<Array>} - The search results
   */
  async searchJournalEntries(userId, query, limit = 5) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/journal/${userId}/search`,
        {
          params: { query, limit },
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000 // 5 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error searching journal entries:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to search journal entries');
    }
  }
}

module.exports = { RAGService: RagService };
