const axios = require('axios');

/**
 * Service to interact with the Intent Recognition microservice
 */
class IntentService {
  constructor() {
    this.baseUrl = process.env.INTENT_SERVICE_URL || 'http://intent-recognition:8001';
  }

  /**
   * Recognize the intent of a text
   * @param {string} text - The text to analyze
   * @returns {Promise<Object>} - The intent recognition result
   */
  async recognizeIntent(text) {
    try {
      console.log(`Calling intent recognition service at ${this.baseUrl}/recognize-intent`);
      const response = await axios.post(
        `${this.baseUrl}/recognize-intent`,
        { text },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000 // 5 second timeout
        }
      );
      console.log('Intent recognition response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error recognizing intent:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }

      // Return a default intent instead of throwing an error
      console.log('Using default intent');
      return {
        text: text,
        primary_intent: "seeking_advice",
        confidence: 0.8,
        all_intents: {
          seeking_advice: 0.8,
          venting: 0.2,
          greeting: 0.0,
          farewell: 0.0,
          gratitude: 0.0,
          emergency: 0.0
        },
        is_emergency: false
      };
    }
  }
}

module.exports = new IntentService();
