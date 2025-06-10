/**
 * Utility class for authentication-related operations
 */
export default class Auth {
  /**
   * Checks if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  static isAuthenticated() {
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    
    try {
      const user = JSON.parse(userData);
      return !!(user && user.accessToken);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return false;
    }
  }

  /**
   * Gets the current user data
   * @returns {Object|null} User data or null if not authenticated
   */
  static getUserData() {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Updates navigation elements based on authentication status
   */
  static updateNavigation() {
    const elements = {
      auth: document.querySelectorAll('.auth-only'),
      guest: document.querySelectorAll('.guest-only'),
      links: document.querySelectorAll('.auth-required')
    };
    
    const isLoggedIn = this.isAuthenticated();
    console.log('Auth status:', isLoggedIn); // Debug log
    
    elements.auth.forEach(el => el.classList.toggle('hidden', !isLoggedIn));
    elements.guest.forEach(el => el.classList.toggle('hidden', isLoggedIn));
    elements.links.forEach(link => {
      link.classList.toggle('disabled', !isLoggedIn);
      link.style.pointerEvents = isLoggedIn ? 'auto' : 'none';
    });
  }

  /**
   * Clears user data from localStorage
   */
  static clearUserData() {
    localStorage.removeItem('user');
    this.updateNavigation();
  }

  static logout() {
    localStorage.removeItem('user');
    window.location.hash = '#/';
  }

  static checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.hash = '#/login';
      return false;
    }
    return true;
  }
}