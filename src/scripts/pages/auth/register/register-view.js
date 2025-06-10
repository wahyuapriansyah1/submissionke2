import '../../../../styles/pages/auth.css';
import RegisterModel from './register-model.js';
import RegisterPresenter from './register-presenter.js';

/**
 * View class for the register page
 * Handles rendering and UI interactions for the registration page
 */
export default class RegisterView {
  #presenter;
  #model;

  constructor() {
    // Initialize model and presenter
    this.#model = new RegisterModel();
    this.#presenter = new RegisterPresenter({
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
   * Menangani event saat form registrasi disubmit
   * @param {Event} event - Event object
   */
  async #onRegisterSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await this.#presenter.register({ name, email, password });
    } catch (error) {
      console.error('Registration error:', error);
    }
  }

  /**
   * Merender konten halaman registrasi
   * @returns {string} HTML string untuk halaman registrasi
   */
  async render() {
    return `
      <!-- Container Utama -->
      <section class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" role="main" aria-label="Halaman Pendaftaran">
        <div class="max-w-md w-full space-y-8">
          <!-- Card Registrasi -->
          <div class="bg-white p-8 rounded-lg shadow-sm">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900 mb-6">Daftar</h1>
            </div>
            <!-- Form Registrasi -->
            <form id="registerForm" class="space-y-6" aria-label="Form pendaftaran" onsubmit="return false;">
              <!-- Input Nama -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Nama</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  required 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  aria-required="true"
                  autocomplete="name"
                />
              </div>
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
                  minlength="8" 
                  required 
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  aria-required="true"
                  autocomplete="new-password"
                />
                <p class="mt-1 text-sm text-gray-500" id="passwordHelp">Kata sandi harus minimal 8 karakter.</p>
              </div>
              <!-- Tombol Submit -->
              <button 
                type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-label="Buat akun baru"
              >
                Daftar
              </button>
            </form>
            <!-- Link Login -->
            <div class="mt-4 text-center">
              <p class="text-sm text-gray-600">
                Sudah punya akun? 
                <a href="#/login" class="font-medium text-green-600 hover:text-green-500" aria-label="Pergi ke halaman masuk">
                  Masuk di sini
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
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.#onRegisterSubmit(e));
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
   * Redirects the user to the login page
   */
  redirectToLogin() {
    window.location.hash = '#/login';
    window.location.reload();
  }
} 