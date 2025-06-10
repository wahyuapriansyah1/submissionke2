import Api from '../../../api';
import Auth from '../../../utils/auth';

/**
 * Model class for the register page
 * Handles data operations and business logic for user registration
 */
export default class RegisterModel {
  #authService;
  #storageKey = 'user';

  constructor() {
    this.#authService = Api;
  }

  /**
   * Checks if user is already authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    return Auth.isAuthenticated();
  }

  /**
   * Performs user registration
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Registration response data
   */
  async register(name, email, password) {
    try {
      const response = await this.#authService.auth.register({ 
        name, 
        email, 
        password 
      });
      return response;
    } catch (error) {
      console.error('Error in register model:', error);
      throw new Error('Registration failed. Please try again later.');
    }
  }

  /**
   * Stores user session data in local storage
   * @param {Object} sessionInfo - User session information
   */
  storeSessionData(sessionInfo) {
    if (!sessionInfo) {
      throw new Error('Session information is required');
    }

    const sessionData = {
      userId: sessionInfo.userId,
      userName: sessionInfo.name,
      accessToken: sessionInfo.token
    };

    localStorage.setItem(this.#storageKey, JSON.stringify(sessionData));
  }
} 