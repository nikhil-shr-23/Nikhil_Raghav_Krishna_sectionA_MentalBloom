const axios = require('axios');

/**
 * Service to interact with the Auth microservice
 */
class AuthService {
  constructor() {
    this.baseUrl = process.env.AUTH_SERVICE_URL;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - The registration result
   */
  async register(userData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/register`,
        userData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to register user');
    }
  }

  /**
   * Login a user
   * @param {Object} credentials - User login credentials
   * @returns {Promise<Object>} - The login result with JWT token
   */
  async login(credentials) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/login`,
        credentials,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error logging in user:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);

        // Pass through the original error status and message
        if (error.response.status === 401) {
          const errorMessage = error.response.data.error || 'Invalid credentials';
          const authError = new Error(errorMessage);
          authError.status = 401;
          throw authError;
        }
      }
      throw new Error('Failed to login user');
    }
  }

  /**
   * Verify a JWT token
   * @param {string} token - The JWT token to verify
   * @returns {Promise<Object>} - The verification result
   */
  async verifyToken(token) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/verify`,
        { token },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying token:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw new Error('Failed to verify token');
    }
  }
}

module.exports = new AuthService();
