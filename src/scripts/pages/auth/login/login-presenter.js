import AuthHandler from './login-model';
import Auth from '../../../utils/auth';

/**
 * Presenter class for handling login page logic
 * Coordinates between view and model
 */
export default class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    
    // Connect view to presenter
    this.#view.setPresenter(this);
  }

  /**
   * Initializes the presenter
   * Called after the view is rendered
   */
  async init() {
    // Any additional initialization can go here
  }

  /**
   * Handles user login attempt
   * @param {string} email - User email
   * @param {string} password - User password
   */
  async login(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        this.#view.showError('Email dan password harus diisi');
        return;
      }

      // Attempt authentication
      const result = await this.#model.authenticateUser(email, password);

      if (result.error) {
        this.#view.showError(result.message);
        return;
      }

      // Store user data
      this.#model.storeSessionData(result.loginResult);

      // Update navigation elements
      Auth.updateNavigation();

      // Redirect to home page
      window.location.href = '#/';
    } catch (error) {
      console.error('Error during login:', error);
      this.#view.showError('Terjadi kesalahan saat login');
    }
  }

  /**
   * Checks if user is already logged in
   * @returns {boolean} True if user is logged in
   */
  isLoggedIn() {
    return this.#model.hasActiveSession();
  }
} 