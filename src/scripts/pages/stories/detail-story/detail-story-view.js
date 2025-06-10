import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DetailStoryModel from './detail-story-model.js';
import DetailStoryPresenter from './detail-story-presenter.js';

/**
 * View class for the detail story page
 * Handles rendering and UI interactions for the detail story page
 */
export default class DetailStoryView {
  #presenter;
  #model;
  #map;

  constructor() {
    // Initialize model and presenter
    this.#model = new DetailStoryModel();
    this.#presenter = new DetailStoryPresenter({
      model: this.#model,
      view: this,
    });
    this.#map = null;
  }

  /**
   * Sets the presenter for this view
   * @param {Object} presenter - The presenter instance
   */
  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Merender konten halaman detail cerita
   * @returns {string} HTML string untuk halaman detail cerita
   */
  async render() {
    // Memeriksa autentikasi
    if (!this.#model.isAuthenticated()) {
      return '';
    }
    return `
      <!-- Container Utama -->
      <section class="max-w-5xl mx-auto px-4 py-8">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="p-8">
            <!-- Konten Detail Cerita -->
            <div id="storyDetail">
              <!-- Detail cerita akan dimuat di sini -->
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Menangani interaksi setelah halaman dirender
   * Gets story ID from URL and initializes the presenter
   */
  async afterRender() {
    const storyId = this.getStoryIdFromUrl();
    if (this.#presenter) {
      await this.#presenter.init(storyId);
    }
  }

  /**
   * Gets the story ID from the URL
   * @returns {string} Story ID from the URL
   */
  getStoryIdFromUrl() {
    return window.location.hash.split('/')[2];
  }

  /**
   * Displays the story details on the page
   */
  displayStoryDetail() {
    const story = this.#presenter.getStory();
    if (!story) return;
    
    const storyDetail = document.getElementById('storyDetail');
    storyDetail.innerHTML = `
      <div class="space-y-8">
        <!-- Gambar dan Header Cerita -->
        <div class="relative rounded-2xl overflow-hidden">
          <div class="aspect-w-16 aspect-h-9">
            <img 
              src="${story.photoUrl}" 
              class="w-full h-[500px] object-cover" 
              alt="Cerita dari ${story.name}"
            >
          </div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8">
            <div class="max-w-3xl mx-auto">
              <h2 class="text-4xl font-bold text-white mb-4 drop-shadow-lg">${story.name}</h2>
              <div class="flex items-center space-x-4 text-gray-200">
                <span class="flex items-center">
                  <i class="bi bi-calendar3 mr-2" aria-hidden="true"></i>
                  ${new Date(story.createdAt).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
                <span class="flex items-center">
                  <i class="bi bi-person-circle mr-2" aria-hidden="true"></i>
                  ${story.name || 'Anonim'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Konten Cerita -->
        <div class="max-w-3xl mx-auto">
          <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div class="prose prose-lg max-w-none">
              <p class="text-gray-700 leading-relaxed">${story.description}</p>
            </div>
          </div>
        </div>

        ${this.#presenter.hasLocation() ? `
          <!-- Bagian Lokasi -->
          <div class="max-w-3xl mx-auto">
            <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h5 class="text-xl font-semibold mb-4 flex items-center text-gray-800">
                <i class="bi bi-geo-alt-fill text-green-600 mr-2" aria-hidden="true"></i>
                Lokasi Cerita
              </h5>
              <div id="storyMap" style="height: 400px; border-radius: 12px; overflow: hidden;" class="shadow-md" role="application" aria-label="Peta lokasi cerita"></div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Initializes the map to display story location
   */
  initMap() {
    const mapContainer = document.getElementById('storyMap');
    if (!mapContainer) return;

    const coordinates = this.#presenter.getCoordinates();
    if (!coordinates) return;
    
    const { lat, lon } = coordinates;
    const story = this.#presenter.getStory();

    // Initialize map
    this.#map = L.map('storyMap').setView([lat, lon], 15);

    // Add map tiles with a more modern style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(this.#map);

    // Create custom marker icon with animation
    const storyIcon = L.divIcon({
      className: 'story-marker',
      html: `
        <div class="relative">
          <div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative bg-green-600 w-4 h-4 rounded-full border-2 border-white shadow-lg"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    // Add marker with enhanced popup
    L.marker([lat, lon], { icon: storyIcon })
      .addTo(this.#map)
      .bindPopup(`
        <div class="p-2 text-center">
          <img src="${story.photoUrl}" class="rounded-lg mb-2 w-full h-32 object-cover" alt="${story.name}">
          <h6 class="font-semibold text-gray-800">${story.name}</h6>
          <p class="text-sm text-gray-600 mt-1">${story.description.substring(0, 60)}${story.description.length > 60 ? '...' : ''}</p>
        </div>
      `, {
        maxWidth: 300,
        className: 'custom-popup'
      })
      .openPopup();
  }

  /**
   * Shows an error message to the user
   * @param {string} message - Error message to display
   */
  showError(message) {
    alert(message);
  }
} 