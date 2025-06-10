import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StoriesModel from './stories-model.js';
import StoriesPresenter from './stories-presenter.js';
import Api from '../../../api.js';

/**
 * View class for the stories page
 * Handles rendering and UI interactions for the stories page
 */
export default class StoriesView {
  #presenter;
  #model;
  #map;
  #markers;

  constructor() {
    // Initialize model and presenter
    this.#model = new StoriesModel();
    this.#presenter = new StoriesPresenter({
      model: this.#model,
      view: this,
    });
    this.#map = null;
    this.#markers = [];
  }

  /**
   * Sets the presenter for this view
   * @param {Object} presenter - The presenter instance
   */
  setPresenter(presenter) {
    this.#presenter = presenter;
  }

  /**
   * Merender konten halaman cerita
   * @returns {string} HTML string untuk halaman cerita
   */
  async render() {
    // Memeriksa autentikasi
    if (!this.#model.isAuthenticated()) {
      return '';
    }

    return `
      <section class="kuliner-list-section" aria-label="Daftar Kuliner Nusantara">
        <div class="kuliner-list-header">
          <h1 class="kuliner-list-title">Daftar Kuliner Nusantara</h1>
          <a href="#/add-story" class="add-kuliner-btn" aria-label="Tambah review kuliner baru">
            <i class="bi bi-plus-lg" aria-hidden="true"></i>
            <span>Tambah Kuliner</span>
          </a>
        </div>
        <div class="kuliner-list-content" id="storiesList" role="list" tabindex="-1">
          <div class="text-center py-8" role="status" aria-live="polite">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-700"></div>
            <p class="mt-3 text-sm text-yellow-800">Memuat daftar kuliner...</p>
          </div>
        </div>
        <div class="kuliner-list-footer">
          <button id="loadMoreBtn" class="load-more-kuliner-btn" aria-label="Muat lebih banyak kuliner">
            <i class="bi bi-arrow-down-circle mr-2" aria-hidden="true"></i> Muat Lebih Banyak
          </button>
        </div>
      </section>
    `;
  }

  /**
   * Menangani interaksi setelah halaman dirender
   */
  async afterRender() {
    // Setup skip-to-content handler
    this.setupSkipToContent();
    // Initialize presenter
    if (this.#presenter) {
      await this.#presenter.init();
    }
    // Pastikan data kuliner langsung ditampilkan setelah render
    await this.displayStories();
    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Mengatur handler untuk skip-to-content
   */
  setupSkipToContent() {
    const skipLink = document.querySelector('.skip-to-content');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const storyCards = document.getElementsByClassName('story-card');
        if (storyCards && storyCards.length > 0) {
          const firstCard = storyCards[0];
          firstCard.setAttribute('tabindex', '-1');
          firstCard.focus();
          firstCard.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  /**
   * Inisialisasi peta Leaflet
   * Mengatur layer peta dan kontrol
   */
  initMap() {
    // Set default icon path
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
      iconUrl: '/images/leaflet/marker-icon.png',
      shadowUrl: '/images/leaflet/marker-shadow.png',
    });

    // Inisialisasi peta dengan view Indonesia
    this.#map = L.map('storiesMap').setView([-2.5489, 118.0149], 4);

    // Menambahkan layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.#map);

    // Menambahkan kontrol skala
    L.control.scale().addTo(this.#map);
  }

  /**
   * Mereset tampilan peta ke view Indonesia
   * Menyesuaikan zoom untuk menampilkan semua marker
   */
  resetMapView() {
    // Get stories in Indonesia from presenter
    const storiesInIndonesia = this.#presenter.getStoriesInIndonesia();
    
    if (storiesInIndonesia.length > 0) {
      try {
        // Membuat bounds untuk semua marker
        const bounds = L.latLngBounds();
        
        // Menambahkan semua lokasi ke bounds
        storiesInIndonesia.forEach(story => {
          const lat = parseFloat(story.lat);
          const lon = parseFloat(story.lon);
          bounds.extend([lat, lon]);
        });
        
        // Menyesuaikan tampilan peta
        if (storiesInIndonesia.length > 1) {
          this.#map.fitBounds(bounds, { 
            padding: [30, 30],
            maxZoom: 18,
            minZoom: 4
          });
        } else if (storiesInIndonesia.length === 1) {
          // Jika hanya ada satu marker, fokus ke marker tersebut
          const story = storiesInIndonesia[0];
          this.#map.setView([parseFloat(story.lat), parseFloat(story.lon)], 12);
        }
      } catch (error) {
        console.error('Error resetting map view:', error);
        // Fallback ke view Indonesia jika terjadi error
        this.#map.setView([-2.5489, 118.0149], 4);
      }
    } else {
      // Jika tidak ada cerita di Indonesia, tampilkan view Indonesia
      this.#map.setView([-2.5489, 118.0149], 4);
    }
  }

  /**
   * Merender kartu cerita
   * @param {Object} story - Data cerita
   * @returns {string} HTML string untuk kartu cerita
   */
  async renderStoryCard(story) {
    const imageUrl = await Api.getImageUrl(story.photoUrl);
    return `
      <div class="story-card" data-id="${story.id}">
        <img src="${imageUrl}" alt="${story.name}" class="story-image" loading="lazy">
        <div class="story-content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <div class="story-meta">
            <span class="story-date">${new Date(story.createdAt).toLocaleDateString()}</span>
            <span class="story-location">Lat: ${story.lat || '-'}, Lon: ${story.lon || '-'}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Merender daftar cerita
   * @param {Array} stories - Array data cerita
   * @returns {string} HTML string untuk daftar cerita
   */
  async renderStories(stories) {
    if (!stories || stories.length === 0) {
      return '<p class="no-stories">No stories found</p>';
    }

    const storyCards = await Promise.all(
      stories.map(story => this.renderStoryCard(story))
    );

    return `
      <div class="stories-container">
        ${storyCards.join('')}
      </div>
    `;
  }

  /**
   * Menampilkan daftar cerita di sidebar
   */
  async displayStories() {
    const storiesList = document.getElementById('storiesList');
    const stories = this.#presenter.getStories();
    
    if (stories.length === 0) {
      storiesList.innerHTML = `
        <div class="text-center py-12" role="status" aria-live="polite">
          <div class="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <i class="bi bi-inbox text-3xl text-gray-400" aria-hidden="true"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Stories Yet</h3>
          <p class="text-sm text-gray-600 mb-4">Be the first to share your story!</p>
          <a href="#/add-story" class="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
            <i class="bi bi-plus-lg mr-2" aria-hidden="true"></i>
            Add Your Story
          </a>
        </div>
      `;
      return;
    }

    // Show loading state
    storiesList.innerHTML = `
      <div class="text-center py-12" role="status" aria-live="polite">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p class="text-sm text-gray-600">Loading amazing stories...</p>
      </div>
    `;
    
    try {
      // Process each story
      const storyCards = stories.map((story) => {
        const truncatedDescription = story.description.length > 100 
          ? story.description.substring(0, 100) + '...' 
          : story.description;
        
        return `
          <div 
            class="story-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-gray-200 overflow-hidden" 
            role="article"
            tabindex="0"
            aria-label="Story by ${story.name}"
          >
            <div class="aspect-w-16 aspect-h-9 relative">
              <img 
                src="${story.photoUrl}" 
                alt="Photo from ${story.name}"
                class="w-full h-48 object-cover"
                loading="lazy"
                onerror="this.src='/images/placeholder.jpg'; this.onerror=null;"
              />
              ${story.lat && story.lon ? `
                <span class="absolute top-3 right-3 inline-flex items-center px-2 py-1 bg-green-600 bg-opacity-90 text-white text-xs font-medium rounded-full shadow-sm">
                  <i class="bi bi-geo-alt-fill mr-1" aria-hidden="true"></i> Location
                </span>
              ` : ''}
            </div>
            <div class="p-4">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-bold text-lg text-gray-900 leading-tight">${story.name}</h3>
                <span class="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded-full">
                  <i class="bi bi-calendar3 mr-1" aria-hidden="true"></i> 
                  ${new Date(story.createdAt).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <p class="text-sm text-gray-700 mb-4 leading-relaxed">${truncatedDescription}</p>
              <div class="flex items-center justify-between gap-3">
                <a href="#/stories/${story.id}" class="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm" aria-label="View story details">
                  <i class="bi bi-eye mr-2" aria-hidden="true"></i>
                  View Details
                </a>
                ${story.lat && story.lon ? `
                  <button 
                    class="navigate-btn inline-flex items-center px-3 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors"
                    data-lat="${story.lat}"
                    data-lon="${story.lon}"
                    aria-label="View this story on map"
                  >
                    <i class="bi bi-map mr-2" aria-hidden="true"></i>
                    View on Map
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      });

      // Update the stories list with the processed cards
      storiesList.innerHTML = storyCards.join('');

      // Menambahkan event listener untuk tombol navigasi
      document.querySelectorAll('.navigate-btn').forEach(button => {
        button.addEventListener('click', () => {
          const lat = parseFloat(button.dataset.lat);
          const lon = parseFloat(button.dataset.lon);
          this.navigateToLocation(lat, lon);
        });
      });

      // Add keyboard navigation for story cards
      document.querySelectorAll('.story-card').forEach(card => {
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const detailsLink = card.querySelector('a[href^="#/stories/"]');
            if (detailsLink) {
              detailsLink.click();
            }
          }
        });
      });
    } catch (error) {
      console.error('Error displaying stories:', error);
      storiesList.innerHTML = `
        <div class="text-center py-4" role="status" aria-live="polite">
          <i class="bi bi-exclamation-circle text-2xl text-red-500" aria-hidden="true"></i>
          <p class="mt-1 text-sm text-gray-500">Error loading stories</p>
        </div>
      `;
    }
  }

  /**
   * Navigate to specific location on the map
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  navigateToLocation(lat, lon) {
    if (this.#map) {
      this.#map.setView([lat, lon], 15);
    }
  }

  /**
   * Memperbarui marker di peta
   */
  async updateMap() {
    // Hapus marker lama
    if (this.#markers.length > 0) {
      this.#markers.forEach(marker => marker.remove());
      this.#markers = [];
    }

    // Get stories from presenter
    const stories = this.#presenter.getStories();

    // Process each story to get cached images
    for (const story of stories) {
      if (story.lat && story.lon) {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);
        
        if (!isNaN(lat) && !isNaN(lon)) {
          try {
            const imageUrl = await Api.images.getImageUrl(story.photoUrl);
            const marker = L.marker([lat, lon])
              .bindPopup(`
                <div class="marker-popup">
                  <img 
                    src="${imageUrl}" 
                    class="w-full h-32 object-cover mb-2 rounded" 
                    alt="Story image by ${story.name}" 
                    loading="lazy"
                    onerror="this.src='/images/placeholder.jpg'; this.onerror=null;"
                  >
                  <h3 class="font-medium text-gray-900">${story.name}</h3>
                  <p class="text-sm text-gray-600 mt-1 mb-2">${story.description.substring(0, 100)}${story.description.length > 100 ? '...' : ''}</p>
                  <a href="#/stories/${story.id}" class="inline-flex items-center text-sm text-green-600 hover:text-green-800">
                    <i class="bi bi-arrow-right mr-1"></i>
                    View Details
                  </a>
                </div>
              `);
            
            marker.addTo(this.#map);
            this.#markers.push(marker);
          } catch (error) {
            console.error('Error creating marker for story:', error);
          }
        }
      }
    }
  }

  /**
   * Zoom to user's current location
   */
  async zoomToCurrentLocation() {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        this.#map.setView([latitude, longitude], 15);
      } catch (error) {
        console.error('Error getting location:', error);
        this.showError('Unable to get your current location');
      }
    } else {
      this.showError('Geolocation is not supported by your browser');
    }
  }

  /**
   * Shows an error message to the user
   * @param {string} message - Error message to display
   */
  showError(message) {
    alert(message);
  }

  /**
   * Mengatur event listeners
   */
  setupEventListeners() {
    // Setup load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', async () => {
        if (this.#presenter) {
          await this.#presenter.loadMoreStories();
        }
      });
    }
  }
}