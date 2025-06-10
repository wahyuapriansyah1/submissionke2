/**
 * Kelas Presenter Detail Cerita
 * Menangani komunikasi antara model dan view untuk halaman detail cerita
 */
export default class DetailStoryPresenter {
  #model;
  #view;
  #story;

  /**
   * Konstruktor untuk DetailStoryPresenter
   * @param {Object} param0 - Objek yang berisi model dan view
   * @param {Object} param0.model - Model detail cerita
   * @param {Object} param0.view - View detail cerita
   */
  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
    this.#story = null;
    
    // Hubungkan view ke presenter
    this.#view.setPresenter(this);
  }

  /**
   * Menginisialisasi presenter
   * Memeriksa autentikasi pengguna dan memuat detail cerita
   * @param {string} storyId - ID cerita yang akan dimuat
   */
  async init(storyId) {
    if (!this.#model.isAuthenticated()) {
      window.location.hash = '#/login';
      return;
    }

    await this.loadStoryDetail(storyId);
  }

  /**
   * Memuat detail cerita dari model dan memperbarui view
   * @param {string} storyId - ID cerita yang akan dimuat
   */
  async loadStoryDetail(storyId) {
    try {
      const result = await this.#model.loadStoryDetail(storyId);
      
      if (result.success) {
        this.#story = result.data;
        this.#view.displayStoryDetail();
        
        if (this.hasLocation()) {
          this.#view.initMap();
        }
      } else {
        this.#view.showError(result.message || 'Gagal memuat detail cerita');
      }
    } catch (error) {
      this.#view.showError('Terjadi kesalahan saat memuat detail cerita');
    }
  }

  /**
   * Mendapatkan cerita yang sedang dimuat
   * @returns {Object} Data cerita
   */
  getStory() {
    return this.#story;
  }

  /**
   * Memeriksa apakah cerita memiliki data lokasi
   * @returns {boolean} True jika cerita memiliki data lokasi
   */
  hasLocation() {
    return this.#story && 
           this.#story.lat && 
           this.#story.lon && 
           !isNaN(parseFloat(this.#story.lat)) && 
           !isNaN(parseFloat(this.#story.lon));
  }

  /**
   * Mendapatkan koordinat lokasi cerita
   * @returns {Object} Objek yang berisi lat dan lon
   */
  getCoordinates() {
    if (!this.hasLocation()) return null;
    
    return {
      lat: parseFloat(this.#story.lat),
      lon: parseFloat(this.#story.lon)
    };
  }
} 