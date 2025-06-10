import '../../../../styles/pages/auth.css';
import LoginModel from './login-model.js';
import LoginPresenter from './login-presenter.js';

/**
 * View class for the login page
 * Handles rendering and UI interactions for the login page
 */
export default class LoginView {
  #presenter;
  #model;

  constructor() {
    // Initialize model and presenter
    this.#model = new LoginModel();
    this.#presenter = new LoginPresenter({
      model: this.#model,
      view: this,
    });
  }

  /**
   * Sets the presenter for this view
   * @param {Object} presenter - The presenter instance
   */
  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Handles login form submission
   * @param {Event} event - Form submit event
   */
  #onLoginSubmit(event) {
    event.preventDefault();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (this.#presenter) {
      this.#presenter.login(email, password);
    }
  }

  /**
   * Merender konten halaman login
   * @returns {string} HTML string untuk halaman login
   */
  async render() {
    return `
      <!-- Container Utama -->
      <section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" role="main" aria-label="Halaman Login">
        <div class="max-w-md w-full space-y-8">
          <!-- Card Login -->
          <div class="bg-white p-8 rounded-lg shadow-sm">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900 mb-6">Masuk</h1>
            </div>
            <!-- Form Login -->
            <div id="loginForm" class="space-y-6">
              <!-- Input Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  aria-required="true"
                  autocomplete="email"
                />
              </div>
              <!-- Input Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Kata Sandi</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  required 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  aria-required="true"
                  autocomplete="current-password"
                />
              </div>
              <!-- Tombol Submit -->
              <button 
                type="button" 
                id="loginButton"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-label="Masuk ke akun Anda"
              >
                Masuk
              </button>
            </div>
            <!-- Link Registrasi -->
            <div class="mt-4 text-center">
              <p class="text-sm text-gray-600">
                Belum punya akun? 
                <a href="#/register" class="font-medium text-green-600 hover:text-green-500" aria-label="Pergi ke halaman pendaftaran">
                  Daftar di sini
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Menambahkan event listener setelah komponen dirender
   */
  async afterRender() {
    const loginButton = document.getElementById('loginButton');
    if (loginButton) {
      loginButton.addEventListener('click', (e) => this.#onLoginSubmit(e));
    }
  }

  /**
   * Shows a success message to the user
   * @param {string} message - Success message to display
   */
  showSuccess(message) {
    alert(message);
  }

  /**
   * Shows an error message to the user
   * @param {string} message - Error message to display
   */
  showError(message) {
    alert(message);
  }

  /**
   * Redirects the user to the stories page
   */
  redirectToStories() {
    window.location.hash = '#/stories';
    window.location.reload();
  }
}
