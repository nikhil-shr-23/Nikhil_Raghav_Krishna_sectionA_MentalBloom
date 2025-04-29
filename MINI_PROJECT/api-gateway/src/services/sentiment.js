const axios = require('axios');

/**
 * Service to interact with the Sentiment Analysis microservice
 */
class SentimentService {
  constructor() {
    this.baseUrl = process.env.SENTIMENT_SERVICE_URL || 'http://sentiment-analysis:8000';
  }

  /**
   * Analyze the sentiment of a text
   * @param {string} text - The text to analyze
   * @returns {Promise<Object>} - The sentiment analysis result
   */
  async analyzeSentiment(text) {
    try {
      console.log(`Calling sentiment analysis service at ${this.baseUrl}/analyze-sentiment`);
      const response = await axios.post(
        `${this.baseUrl}/analyze-sentiment`,
        { text },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000 // 5 second timeout
        }
      );
      console.log('Sentiment analysis response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing sentiment:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }

      // Return a default sentiment instead of throwing an error
      console.log('Using default sentiment');
      return {
        text: text,
        sentiment: "neutral",
        scores: {
          positive: 0.33,
          negative: 0.33,
          neutral: 0.34
        },
        compound: 0.0
      };
    }
  }
}

module.exports = new SentimentService();
