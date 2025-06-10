/**
 * Kelas Presenter untuk halaman cerita
 * Menangani komunikasi antara model dan view
 */
export default class StoriesPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    
    // Hubungkan view ke presenter
    this.#view.setPresenter(this);
  }

  /**
   * Menginisialisasi presenter
   */
  async init() {
    // Periksa autentikasi
    if (!this.#model.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }
    // Muat cerita awal tanpa inisialisasi peta
    await this.loadStories();
  }

  /**
   * Memuat cerita dari model dan memperbarui view
   */
  async loadStories() {
    try {
      const result = await this.#model.loadStories();
      
      if (result.success) {
        await this.#view.displayStories();
      } else {
        this.#view.showError(result.message);
      }
    } catch (error) {
      console.error('Kesalahan dalam loadStories:', error);
      this.#view.showError('Terjadi kesalahan saat memuat cerita');
    }
  }

  /**
   * Memuat halaman cerita berikutnya
   */
  async loadMoreStories() {
    try {
      this.#model.nextPage();
      await this.loadStories();
    } catch (error) {
      console.error('Kesalahan dalam loadMoreStories:', error);
      this.#view.showError('Terjadi kesalahan saat memuat cerita tambahan');
    }
  }

  /**
   * Mendapatkan semua cerita dari model
   * @returns {Array} Array dari objek cerita
   */
  getStories() {
    return this.#model.getStories();
  }

  /**
   * Mendapatkan cerita yang berlokasi di Indonesia
   * @returns {Array} Array dari objek cerita di Indonesia
   */
  getStoriesInIndonesia() {
    return this.#model.getStoriesInIndonesia();
  }

  /**
   * Menavigasi ke lokasi tertentu di peta
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  navigateToLocation(lat, lon) {
    this.#view.navigateToLocation(lat, lon);
  }

  /**
   * Mereset tampilan peta untuk menampilkan semua marker
   */
  async resetMapView() {
    try {
      this.#view.resetMapView();
      await this.#view.updateMap();
    } catch (error) {
      console.error('Kesalahan dalam resetMapView:', error);
      this.#view.showError('Terjadi kesalahan saat mereset tampilan peta');
    }
  }

  /**
   * Memperbesar peta ke lokasi pengguna saat ini
   */
  async zoomToCurrentLocation() {
    try {
      await this.#view.zoomToCurrentLocation();
      await this.#view.updateMap();
    } catch (error) {
      console.error('Kesalahan dalam zoomToCurrentLocation:', error);
      this.#view.showError('Terjadi kesalahan saat memperbesar ke lokasi saat ini');
    }
  }
}