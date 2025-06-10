import '../../../styles/pages/home.css';
import { initMap } from '../../utils/map.js';

/**
 * Class HomeView
 * Handles rendering and UI interactions for the home page
 */
export default class HomeView {
  #map;
  #presenter;

  constructor() {
    this.#map = null;
    this.#presenter = null;
  }

  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Render konten halaman utama versi sederhana bertema kuliner nusantara
   */
  async render() {
    return `
      <section class="hero-simple">
        <div class="hero-text-simple">
          <h1>Selamat Datang di Kuliner Nusantara</h1>
          <p>Temukan, ulas, dan bagikan makanan khas Indonesia favoritmu!</p>
          <button class="cta-button" id="ctaButton">Jelajahi Kuliner</button>
        </div>
      </section>
      <section class="info-section-simple">
        <h2>Apa yang bisa kamu lakukan?</h2>
        <ul class="fitur-list-simple">
          <li>📍 Cari kuliner terdekat & lihat di peta</li>
          <li>⭐ Tulis review makanan khas daerahmu</li>
          <li>📷 Upload foto makanan favorit</li>
          <li>🔔 Dapatkan notifikasi kuliner baru</li>
        </ul>
      </section>
    `;
  }

  /**
   * Menangani interaksi setelah halaman dirender
   * Mengatur event listener dan inisialisasi peta
   */
  async afterRender() {
    this.setupEventListeners();
    if (this.#presenter) {
      await this.#presenter.init();
    }
  }

  setupEventListeners() {
    const button = document.getElementById('ctaButton');
    if (button) {
      button.addEventListener('click', () => {
        window.location.href = '#/stories';
      });
    }
  }
}
