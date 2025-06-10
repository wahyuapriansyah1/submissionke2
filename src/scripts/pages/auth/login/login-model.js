import Api from '../../../api';

/**
 * Authentication handler for user login operations
 * Manages user authentication state and credentials
 */
export default class AuthHandler {
  #authService;
  #storageKey = 'user';

  constructor() {
    this.#authService = Api;
  }

  /**
   * Verifies if user has an active session
   * @returns {boolean} Session status
   */
  hasActiveSession() {
    const sessionData = localStorage.getItem(this.#storageKey);
    return !!sessionData;
  }

  /**
   * Authenticates user with provided credentials
   * @param {string} userEmail - User's email address
   * @param {string} userPassword - User's password
   * @returns {Promise<Object>} Authentication result
   */
  async authenticateUser(userEmail, userPassword) {
    try {
      const authResult = await this.#authService.auth.login({ 
        email: userEmail, 
        password: userPassword 
      });
      return authResult;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
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

  /**
   * Terminates current user session
   */
  terminateSession() {
    localStorage.removeItem(this.#storageKey);
  }
}
